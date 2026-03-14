export type AuthUser = {
  id: string;
  username: string;
  avatar: string | null;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
