import { renderHook, act } from '@testing-library/preact';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import useMediaQuery, { useMedia, useMediaQueryNoReactive } from '../use-media-query';

describe('useMediaQuery', () => {
  let matchMediaMock: ReturnType<typeof vi.fn>;
  let addEventListenerMock: ReturnType<typeof vi.fn>;
  let removeEventListenerMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    addEventListenerMock = vi.fn();
    removeEventListenerMock = vi.fn();
    matchMediaMock = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(min-width: 1150px)',
      media: query,
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
    }));
    vi.stubGlobal('matchMedia', matchMediaMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should return true when media query matches', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 1150px)'));
    expect(result.current).toBe(true);
  });

  it('should return false when media query does not match', () => {
    const { result } = renderHook(() => useMediaQuery('(min-width: 400px)'));
    expect(result.current).toBe(false);
  });

  it('should add and remove event listener', () => {
    const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    
    expect(addEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
    
    unmount();
    
    expect(removeEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should update when media query changes', () => {
    let changeHandler: (() => void) | null = null;
    let currentMatches = false;

    matchMediaMock.mockImplementation((query: string) => ({
      matches: currentMatches,
      media: query,
      addEventListener: (_: string, handler: () => void) => {
        changeHandler = handler;
      },
      removeEventListener: vi.fn(),
    }));

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);

    // Simulate media query change
    currentMatches = true;
    act(() => {
      if (changeHandler) changeHandler();
    });

    expect(result.current).toBe(true);
  });
});

describe('useMedia', () => {
  beforeEach(() => {
    const matchMediaMock = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('1150'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    vi.stubGlobal('matchMedia', matchMediaMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should return laptop value when laptop matches', () => {
    const { result } = renderHook(() => useMedia({
      mobile: 'mobile',
      minitablet: 'minitablet',
      tablet: 'tablet',
      laptop: 'laptop',
      custom: 'custom',
    }));
    expect(result.current).toBe('laptop');
  });
});

describe('useMediaQueryNoReactive', () => {
  beforeEach(() => {
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('768'),
    })));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should return match result directly', () => {
    const result = useMediaQueryNoReactive('(min-width: 768px)');
    expect(result).toBe(true);
  });

  it('should return false for non-matching query', () => {
    const result = useMediaQueryNoReactive('(min-width: 400px)');
    expect(result).toBe(false);
  });
});
