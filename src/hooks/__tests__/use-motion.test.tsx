import { renderHook } from '@testing-library/preact';
import { describe, it, expect, vi } from 'vitest';
import { useEntranceAnimation, useHoverScale, useGlitchHover } from '../use-motion';

// Mock the motion library
vi.mock('motion', () => ({
  animate: vi.fn(),
}));

describe('useEntranceAnimation', () => {
  it('should return a ref', () => {
    const { result } = renderHook(() => useEntranceAnimation());
    expect(result.current).toBeDefined();
    expect(result.current.current).toBeNull();
  });

  it('should accept custom delay and duration', () => {
    const { result } = renderHook(() => useEntranceAnimation(0.5, 1));
    expect(result.current).toBeDefined();
  });
});

describe('useHoverScale', () => {
  it('should return ref and event handlers', () => {
    const { result } = renderHook(() => useHoverScale());
    
    expect(result.current.ref).toBeDefined();
    expect(typeof result.current.onMouseEnter).toBe('function');
    expect(typeof result.current.onMouseLeave).toBe('function');
  });

  it('should accept custom scale', () => {
    const { result } = renderHook(() => useHoverScale(1.2));
    expect(result.current.ref).toBeDefined();
  });

  it('should handle mouseEnter when ref is set', async () => {
    const { animate } = await import('motion');
    const { result } = renderHook(() => useHoverScale(1.1));
    
    const element = document.createElement('div');
    (result.current.ref as any).current = element;
    
    result.current.onMouseEnter();
    
    expect(animate).toHaveBeenCalledWith(element, { scale: 1.1 }, { duration: 0.2 });
  });

  it('should handle mouseLeave when ref is set', async () => {
    const { animate } = await import('motion');
    const { result } = renderHook(() => useHoverScale());
    
    const element = document.createElement('div');
    (result.current.ref as any).current = element;
    
    result.current.onMouseLeave();
    
    expect(animate).toHaveBeenCalledWith(element, { scale: 1 }, { duration: 0.2 });
  });
});

describe('useGlitchHover', () => {
  it('should return ref and event handlers', () => {
    const { result } = renderHook(() => useGlitchHover());
    
    expect(result.current.ref).toBeDefined();
    expect(typeof result.current.onMouseEnter).toBe('function');
    expect(typeof result.current.onMouseLeave).toBe('function');
  });

  it('should handle mouseEnter with glitch animation', async () => {
    const { animate } = await import('motion');
    const { result } = renderHook(() => useGlitchHover<HTMLDivElement>());
    
    const element = document.createElement('div');
    (result.current.ref as any).current = element;
    
    result.current.onMouseEnter();
    
    expect(animate).toHaveBeenCalled();
  });

  it('onMouseLeave should be a no-op', () => {
    const { result } = renderHook(() => useGlitchHover());
    
    expect(() => result.current.onMouseLeave()).not.toThrow();
  });
});
