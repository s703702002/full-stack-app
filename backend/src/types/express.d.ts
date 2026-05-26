import 'multer';
import 'express-session';
import type { AuthUser } from './auth.js';

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends AuthUser {}

    namespace Multer {
      interface File {
        key?: string;
        location?: string;
        bucket?: string;
      }
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    tempUserId?: string;
    captcha?: {
      text: string;
      image: string;
      createdAt: number;
    };
  }
}
