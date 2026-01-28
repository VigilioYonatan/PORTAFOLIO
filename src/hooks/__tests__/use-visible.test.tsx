import { renderHook } from '@testing-library/preact';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import useVisible from '../use-visible';

describe('useVisible', () => {
  beforeEach(() => {
    class MockIntersectionObserver {
      constructor(public callback: IntersectionObserverCallback) {}
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      root = null;
      rootMargin = '';
      thresholds = [];
      takeRecords = () => [];
    }

    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should return ref and initial visibility as false', () => {
    const { result } = renderHook(() => useVisible());
    const [ref, isVisible] = result.current;

    expect(ref).toBeDefined();
    expect(isVisible).toBe(false);
  });

  it('should return a ref object', () => {
    const { result } = renderHook(() => useVisible());
    const [ref] = result.current;
    
    expect(ref).toHaveProperty('current');
  });

  it('should accept custom options', () => {
    const options = { threshold: 0.5 };
    const { result } = renderHook(() => useVisible(options));
    const [ref, isVisible] = result.current;

    expect(ref).toBeDefined();
    expect(isVisible).toBe(false);
  });
});
