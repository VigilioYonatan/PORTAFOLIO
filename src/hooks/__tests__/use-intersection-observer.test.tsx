import { renderHook } from '@testing-library/preact';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import useIntersectionObserver from '../use-intersection-observer';

describe('useIntersectionObserver', () => {
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

  it('should return ref and initial inView as false', () => {
    const { result } = renderHook(() => useIntersectionObserver());
    
    expect(result.current.ref).toBeDefined();
    expect(result.current.inView).toBe(false);
  });

  it('should return a ref object', () => {
    const { result } = renderHook(() => useIntersectionObserver());
    
    expect(result.current.ref).toHaveProperty('current');
  });

  it('should accept custom options', () => {
    const options = {
      threshold: 0.5,
      rootMargin: '10px',
    };
    const { result } = renderHook(() => useIntersectionObserver(options));

    expect(result.current.ref).toBeDefined();
    expect(result.current.inView).toBe(false);
  });

  it('should accept triggerOnce option', () => {
    const { result } = renderHook(() => useIntersectionObserver({ triggerOnce: true }));

    expect(result.current.ref).toBeDefined();
  });
});
