import { renderHook, act } from '@testing-library/preact';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import useCopyToClipboard from '../use-copy-to-clipboard';

describe('useCopyToClipboard', () => {
  let writeTextMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    writeTextMock = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', {
      clipboard: {
        writeText: writeTextMock,
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should initialize with null copied text', () => {
    const { result } = renderHook(() => useCopyToClipboard());
    const [, copiedText] = result.current;
    
    expect(copiedText).toBeNull();
  });

  it('should copy text to clipboard and update state', async () => {
    const { result } = renderHook(() => useCopyToClipboard());
    const [copy] = result.current;
    const textToCopy = 'Hello World';

    let success: boolean | undefined;
    await act(async () => {
      success = await copy(textToCopy);
    });

    expect(writeTextMock).toHaveBeenCalledWith(textToCopy);
    expect(success).toBe(true);
    expect(result.current[1]).toBe(textToCopy);
  });

  it('should handle clipboard write failure', async () => {
    writeTextMock.mockRejectedValueOnce(new Error('Failed'));

    const { result } = renderHook(() => useCopyToClipboard());
    const [copy] = result.current;
    const textToCopy = 'Fail Text';

    let success: boolean | undefined;
    await act(async () => {
      success = await copy(textToCopy);
    });

    expect(writeTextMock).toHaveBeenCalledWith(textToCopy);
    expect(success).toBe(false);
    expect(result.current[1]).toBeNull();
  });
  
  it('should handle missing clipboard API', async () => {
    vi.stubGlobal('navigator', { clipboard: undefined });

    const { result } = renderHook(() => useCopyToClipboard());
    const [copy] = result.current;
    
    let success: boolean | undefined;
    await act(async () => {
      success = await copy('test');
    });

    expect(success).toBe(false);
  });
});

