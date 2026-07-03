import { vi } from 'vitest';

vi.mock('./src/utils/validateEnv.js', () => ({
  env: {
    LOG_LEVEL: 'info',
    NODE_ENV: 'test',
    DATABASE_URL: 'postgresql://test',
    IMAGE_BASE_URL: 'http://localhost:3000',
    GOOGLE_CLIENT_ID: 'test-google-client-id',
    GOOGLE_CLIENT_SECRET: 'test-google-client-secret',
  },
}));

vi.mock('redis', () => ({
  createClient: vi.fn().mockReturnValue({
    duplicate: vi.fn().mockReturnValue({
      connect: vi.fn().mockResolvedValue(undefined),
      subscribe: vi.fn().mockResolvedValue(undefined),
      publish: vi.fn().mockResolvedValue(undefined),
    }),
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  }),
}));
