import { GuildMember, EmbedBuilder, type GuildTextBasedChannel, ActionRowBuilder, ButtonBuilder, ButtonStyle, Message } from 'discord.js';
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState,
  StreamType,
  type AudioPlayer,
  type VoiceConnection,
} from '@discordjs/voice';
import { spawn } from 'node:child_process';
import { Readable } from 'node:stream';
import youtubeDl from 'youtube-dl-exec';
import ffmpegPath from 'ffmpeg-static';

// -----------------------------------------------------------
// Per-guild state (mirrors Python's `queues` dict)
// -----------------------------------------------------------
interface GuildYtQueue {
  player: AudioPlayer;
  connection: VoiceConnection;
  textChannel: GuildTextBasedChannel;
  tracks: YtTrack[];
  previousTracks: YtTrack[];
  current: YtTrack | null;
  volume: number;
  nowPlayingMessage: Message | null;
}

interface YtTrack {
  url: string;       // direct audio URL from yt-dlp
  pageUrl: string;    // YouTube page URL
  title: string;
  duration: string;
  thumbnail: string | null;
  requestedBy: string;
}

const queues = new Map<string, GuildYtQueue>();

// -----------------------------------------------------------
// search_yt — equivalent to Python's search_yt()
// Uses yt-dlp to extract info (no download)
// -----------------------------------------------------------
async function searchYt(query: string): Promise<YtTrack | null> {
  try {
    // If not a URL, prepend ytsearch:
    const searchQuery = query.match(/^https?:\/\//) ? query : `ytsearch:${query}`;

    const result = await (youtubeDl as any)(searchQuery, {
      dumpSingleJson: true,
      quiet: true,
      defaultSearch: 'ytsearch',
      sourceAddress: '0.0.0.0',
      noDownload: true,
      noCheckCertificates: true,
      preferFreeFormats: true,
      format: 'bestaudio/best',
      noWarnings: true,
      addHeader: ['referer:youtube.com', 'user-agent:googlebot'],
    }) as any;

    // If it's a playlist/search result, take the first entry
    const info = result.entries ? result.entries[0] : result;

    if (!info || !info.url) {
      return null;
    }

    return {
      url: info.url,
      pageUrl: info.webpage_url || info.original_url || `https://www.youtube.com/watch?v=${info.id}`,
      title: info.title || 'Unknown',
      duration: formatDuration(info.duration || 0),
      thumbnail: info.thumbnail || null,
      requestedBy: '',
    };
  } catch (err) {
    console.error('[YT Music] yt-dlp search error:', err);
    return null;
  }
}

// -----------------------------------------------------------
// Create audio stream from URL using FFmpeg
// Mirrors Python's discord.FFmpegPCMAudio(url, **FFMPEG_OPTS)
// -----------------------------------------------------------
function createFFmpegStream(audioUrl: string): Readable {
  const ffmpeg = spawn((ffmpegPath as unknown as string) || 'ffmpeg', [
    '-reconnect', '1',
    '-reconnect_streamed', '1',
    '-reconnect_delay_max', '5',
    '-i', audioUrl,
    '-vn',
    '-acodec', 'libopus',
    '-f', 'opus',
    '-ar', '48000',
    '-ac', '2',
    'pipe:1',
  ], {
    stdio: ['ignore', 'pipe', 'ignore'] as const,
  }) as any;

  ffmpeg.on('error', (err: Error) => {
    console.error('[YT Music] FFmpeg error:', err);
  });

  if (!ffmpeg.stdout) {
    throw new Error('Failed to open FFmpeg stdout');
  }

  return ffmpeg.stdout as unknown as Readable;
}

// -----------------------------------------------------------
// play_next — equivalent to Python's play_next()
// -----------------------------------------------------------
async function playNext(guildId: string): Promise<void> {
  const queue = queues.get(guildId);
  if (!queue) return;

  // Move current track to previous if it finished naturally before fetching next
  if (queue.current) {
    queue.previousTracks.push(queue.current);
  }

  const track = queue.tracks.shift() ?? null;
  queue.current = track;

  // Cleanup old message to avoid spam
  if (queue.nowPlayingMessage) {
    await queue.nowPlayingMessage.delete().catch(() => {}).finally(() => queue.nowPlayingMessage = null);
  }

  if (!track) {
    console.log(`[YT Music] Queue empty for ${guildId}`);
    return;
  }

  try {
    console.log(`[YT Music] Playing: "${track.title}"`);

    const ffmpegStream = createFFmpegStream(track.url);
    const resource = createAudioResource(ffmpegStream, {
      inputType: StreamType.OggOpus,
      inlineVolume: true,
    });
    
    // Convert 0.0 - 1.0 to logarithmic scale for better precision
    resource.volume?.setVolumeLogarithmic(queue.volume);

    queue.player.play(resource);

    // Send "Now Playing" embed
    const embed = new EmbedBuilder()
      .setColor('#FFB3BA') // Pastel Pink
      .setAuthor({ name: '✨ กำลังเล่น ✨' })
      .setTitle(track.title)
      .setURL(track.pageUrl)
      .addFields(
        { name: '⏱️ ความยาว', value: track.duration, inline: true },
        { name: '👤 ขอโดย', value: track.requestedBy, inline: true },
      )
      .setFooter({ text: '🌸 YouTube Music Player' })
      .setTimestamp();

    if (track.thumbnail) {
      embed.setImage(track.thumbnail); // Make it a large image instead of small thumbnail
    }

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('music_prev').setEmoji('⏮️').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('music_pause').setEmoji('⏯️').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId('music_next').setEmoji('⏭️').setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId('music_voldown').setEmoji('🔉').setStyle(ButtonStyle.Danger),
      new ButtonBuilder().setCustomId('music_volup').setEmoji('🔊').setStyle(ButtonStyle.Success),
    );

    const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('music_queue').setLabel('ดูคิวเพลง (Queue)').setEmoji('📋').setStyle(ButtonStyle.Secondary)
    );

    const msg = await queue.textChannel.send({ embeds: [embed], components: [row, row2] }).catch(console.error);
    if (msg) queue.nowPlayingMessage = msg as Message;
  } catch (err) {
    console.error(`[YT Music] Error streaming: ${track.title}`, err);
    await queue.textChannel
      .send(`เกิดข้อผิดพลาด: ${(err as Error).message?.slice(0, 1900)}`)
      .catch(console.error);
    // Try next
    await playNext(guildId);
  }
}

// -----------------------------------------------------------
// Public: playYouTube — equivalent to Python's play()
// -----------------------------------------------------------
export async function playYouTube(
  member: GuildMember,
  query: string,
  textChannel: GuildTextBasedChannel,
): Promise<{ track: YtTrack; position: number; isPlayingNow: boolean }> {
  const voiceChannel = member.voice.channel;
  if (!voiceChannel) throw new Error('คุณต้องอยู่ในห้องเสียงก่อน');

  // search_yt(query)
  const track = await searchYt(query);
  if (!track) throw new Error('ไม่พบเพลงจากคำค้นหานี้');
  track.requestedBy = member.user.tag;

  let queue = queues.get(voiceChannel.guild.id);

  if (!queue) {
    // Join voice channel
    const connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator as any,
    });

    const player = createAudioPlayer();
    connection.subscribe(player);

    queue = {
      player,
      connection,
      textChannel,
      tracks: [],
      previousTracks: [],
      current: null,
      volume: 0.2, // Default 20%
      nowPlayingMessage: null
    };
    queues.set(voiceChannel.guild.id, queue);

    // after=lambda: play_next — auto-advance when track ends
    player.on(AudioPlayerStatus.Idle, async () => {
      try {
        await playNext(voiceChannel.guild.id);
      } catch (err) {
        console.error('[YT Music] Auto-advance error:', err);
      }
    });

    player.on('error', (error) => {
      console.error('[YT Music] Player error:', error);
    });

    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        await entersState(connection, VoiceConnectionStatus.Connecting, 5_000);
      } catch {
        queues.delete(voiceChannel.guild.id);
        connection.destroy();
      }
    });
  }

  queue.textChannel = textChannel;
  queue.tracks.push(track);
  const position = queue.tracks.length;

  // If nothing playing, start now (like Python's play_next)
  const isPlayingNow = !queue.current;
  if (isPlayingNow) {
    await playNext(voiceChannel.guild.id);
  }

  return { track, position, isPlayingNow };
}

// skip — equivalent to Python's skip()
export function skipYouTube(guildId: string): boolean {
  const queue = queues.get(guildId);
  if (!queue) return false;
  queue.player.stop(true); // triggers Idle → playNext
  return true;
}

// stop — equivalent to Python's stop()
export function stopYouTube(guildId: string): boolean {
  const queue = queues.get(guildId);
  if (!queue) return false;
  queue.tracks = [];
  queue.previousTracks = [];
  queue.current = null;
  if (queue.nowPlayingMessage) queue.nowPlayingMessage.delete().catch(()=>{});
  queue.player.stop(true);
  return true;
}

// leave — disconnect from voice channel
export function leaveYouTube(guildId: string): boolean {
  const queue = queues.get(guildId);
  if (!queue) return false;
  queue.tracks = [];
  queue.previousTracks = [];
  queue.current = null;
  if (queue.nowPlayingMessage) queue.nowPlayingMessage.delete().catch(()=>{});
  queue.player.stop(true);
  queue.connection.destroy();
  queues.delete(guildId);
  return true;
}

// pause / unpause
export function togglePauseYouTube(guildId: string): boolean | null {
  const queue = queues.get(guildId);
  if (!queue || !queue.current) return null;
  if (queue.player.state.status === AudioPlayerStatus.Paused) {
    queue.player.unpause();
    return false; // isPaused = false
  } else {
    queue.player.pause();
    return true; // isPaused = true
  }
}

// prev track
export function previousYouTube(guildId: string): boolean {
  const queue = queues.get(guildId);
  if (!queue || queue.previousTracks.length === 0) return false;
  
  const prev = queue.previousTracks.pop()!;
  
  // Re-enqueue current and prev to the front so they play next
  if (queue.current) {
    queue.tracks.unshift(queue.current);
  }
  queue.tracks.unshift(prev);
  queue.current = null; // prevents pushing to history twice
  
  queue.player.stop(true); // triggers idle -> playNext(), which picks up `prev`
  return true;
}

// volume control
export function changeVolumeYouTube(guildId: string, diff: number): number {
  const queue = queues.get(guildId);
  if (!queue) return -1;
  queue.volume = Math.max(0.01, Math.min(2.0, queue.volume + diff)); // bound 1% - 200%
  if (queue.player.state.status !== AudioPlayerStatus.Idle) {
    // Re-apply if actively playing
    const resource = (queue.player.state as any).resource;
    if (resource && resource.volume) {
      resource.volume.setVolumeLogarithmic(queue.volume);
    }
  }
  return queue.volume;
}

export function getYouTubeQueue(guildId: string) {
  return queues.get(guildId) || null;
}

// -----------------------------------------------------------
// Helper
// -----------------------------------------------------------
function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
