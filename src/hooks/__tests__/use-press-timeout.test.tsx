import { renderHook, act } from '@testing-library/preact';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import usePressTimeOut from '../use-press-timeout';

describe('usePressTimeOut', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should call callback after timeout', () => {
    const { result } = renderHook(() => usePressTimeOut(1.5));
    const callback = vi.fn();

    act(() => {
      result.current.handleTouchStart(callback);
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should use default time of 1.5 seconds', () => {
    const { result } = renderHook(() => usePressTimeOut());
    const callback = vi.fn();

    act(() => {
      result.current.handleTouchStart(callback);
    });

    act(() => {
      vi.advanceTimersByTime(1499);
    });
    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(callback).toHaveBeenCalled();
  });

  it('should cancel callback when handleTouchEnd is called', () => {
    const { result } = renderHook(() => usePressTimeOut(2));
    const callback = vi.fn();

    act(() => {
      result.current.handleTouchStart(callback);
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    act(() => {
      result.current.handleTouchEnd();
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('should accept custom time in seconds', () => {
    const { result } = renderHook(() => usePressTimeOut(0.5));
    const callback = vi.fn();

    act(() => {
      result.current.handleTouchStart(callback);
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalled();
  });
});
