import { expect } from 'vitest';
import { AxeMatchers } from 'vitest-axe';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare module 'vitest' {
  interface Assertion<T = unknown>
    extends
      TestingLibraryMatchers<typeof expect.stringContaining, T>,
      AxeMatchers {}

  interface AsymmetricMatchersContaining
    extends
      TestingLibraryMatchers<typeof expect.stringContaining, unknown>,
      AxeMatchers {}
}
