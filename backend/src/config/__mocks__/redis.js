import { vi } from 'vitest';

export default {
  duplicate: vi.fn().mockReturnValue({
    connect: vi.fn().mockResolvedValue(undefined),
    subscribe: vi.fn().mockResolvedValue(undefined),
    publish: vi.fn().mockResolvedValue(undefined),
  }),
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
};
