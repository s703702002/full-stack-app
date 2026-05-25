import type { User } from '../generated/client.ts';

export type AuthUser = User & {
  permissions: string[];
};
