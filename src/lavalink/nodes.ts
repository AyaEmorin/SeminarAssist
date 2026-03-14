import type { NodeOption } from 'shoukaku';
import { lavalinkConfig } from '../config/lavalink.config.js';

export const lavalinkNodes: NodeOption[] = [
  {
    name: 'main',
    url: `${lavalinkConfig.host}:${lavalinkConfig.port}`,
    auth: lavalinkConfig.password,
  },
];
