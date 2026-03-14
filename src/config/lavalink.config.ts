import dotenv from 'dotenv';

dotenv.config();

function env(name: string, fallback: string): string {
  return process.env[name]?.trim() || fallback;
}

export const lavalinkConfig = {
  host: env('LAVALINK_HOST', 'localhost'),
  port: Number(env('LAVALINK_PORT', '2333')),
  password: env('LAVALINK_PASSWORD', 'youshallnotpass'),
  get url(): string {
    return `http://${this.host}:${this.port}`;
  },
};
