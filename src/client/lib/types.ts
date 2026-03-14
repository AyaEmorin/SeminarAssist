export type DashboardUser = {
  id: string;
  username: string;
  avatarUrl: string | null;
  authorized: boolean;
  matchedRoles: string[];
};

export type CurrentUserResponse = DashboardUser;

export type ChannelSummary = {
  id: string;
  name: string;
  type: string;
};

export type EmbedPayload = {
  channelId: string;
  title: string;
  description: string;
  color?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  footer?: string;
};
