export type LocalAuthUser = Express.User & {
  twoFactorAuth?: { isEnabled: boolean };
  _skip2FA?: boolean;
};

export type PassportLocalCallback = (
  err: Error | null,
  user: LocalAuthUser | false,
  info?: { message?: string },
) => void;

export type PassportGoogleCallback = (
  err: Error | null,
  user: Express.User | false,
) => void;
