import dotenv from 'dotenv';

dotenv.config();

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

function list(name: string): string[] {
  return (process.env[name] ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 3001),
  appBaseUrl: required('APP_BASE_URL'),
  publicUrl: required('PUBLIC_URL'),
  supabaseUrl: required('VITE_SUPABASE_URL'),
  supabaseAnonKey: required('VITE_SUPABASE_ANON_KEY'),
  discordClientId: required('DISCORD_CLIENT_ID'),
  discordBotToken: required('DISCORD_BOT_TOKEN'),
  discordGuildId: required('DISCORD_GUILD_ID'),
  autoRoleId: required('AUTO_ROLE_ID'),
  allowedRoleIds: list('ALLOWED_ROLE_IDS'),
  allowedUserIds: list('ALLOWED_USER_IDS'),
  musicDefaultVolume: Number(process.env.MUSIC_DEFAULT_VOLUME ?? 0.07),
  lavalinkHost: process.env.LAVALINK_HOST?.trim() ?? 'localhost',
  lavalinkPort: Number(process.env.LAVALINK_PORT ?? 2333),
  lavalinkPassword: process.env.LAVALINK_PASSWORD?.trim() ?? 'youshallnotpass',
};
