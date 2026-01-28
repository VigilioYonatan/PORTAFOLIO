import { renderHook, act } from '@testing-library/preact';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDebouncedOnBlur } from '../use-debounce-on-blur';

describe('useDebouncedOnBlur', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should debounce the callback', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedOnBlur(callback, 500));

    act(() => {
      result.current('test value');
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledWith('test value');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should use default delay of 800ms', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedOnBlur(callback));

    act(() => {
      result.current('test');
    });

    act(() => {
      vi.advanceTimersByTime(799);
    });
    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(callback).toHaveBeenCalledWith('test');
  });

  it('should cancel previous timeout on rapid calls', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedOnBlur(callback, 500));

    act(() => {
      result.current('first');
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    act(() => {
      result.current('second');
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith('second');
  });
});
