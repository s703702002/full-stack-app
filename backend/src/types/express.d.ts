import 'multer';
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
