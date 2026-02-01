import { describe, it, expect } from 'vitest';
import { handlerError } from '@infrastructure/utils/client/handler-error';

describe('Simple Unit Test', () => {
  it('should import and run', () => {
    expect(handlerError).toBeDefined();
  });
});
