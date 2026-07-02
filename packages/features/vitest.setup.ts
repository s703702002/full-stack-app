import '@testing-library/jest-dom/vitest';
import 'vitest-axe/extend-expect';
import * as axeMatchers from 'vitest-axe/matchers.js';
import { cleanup } from '@testing-library/react';
import { afterEach, expect } from 'vitest';

expect.extend(axeMatchers);

afterEach(() => {
  cleanup();
});
