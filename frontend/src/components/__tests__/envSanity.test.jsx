// frontend/src/components/__tests__/envSanity.test.js
import { describe, it, expect } from 'vitest';

describe('Environment Sanity', () => {
  it('has document', () => {
    expect(document).toBeDefined();
    expect(window).toBeDefined();
  });
});
