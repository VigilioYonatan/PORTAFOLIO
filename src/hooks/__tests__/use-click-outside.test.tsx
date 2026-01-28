import { renderHook } from '@testing-library/preact';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { useClickOutside } from '../use-click-outside';
import { useRef } from 'preact/hooks';

// Helper component to test the hook
function useClickOutsideTestHook(handler: (event: Event) => void) {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, handler);
  return ref;
}

describe('useClickOutside', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return a ref', () => {
    const handler = vi.fn();
    const { result } = renderHook(() => useClickOutsideTestHook(handler));
    
    expect(result.current).toBeDefined();
    expect(result.current).toHaveProperty('current');
  });

  it('should register event listeners on mount', () => {
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
    const handler = vi.fn();
    
    renderHook(() => useClickOutsideTestHook(handler));
    
    expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
  });

  it('should remove event listeners on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
    const handler = vi.fn();
    
    const { unmount } = renderHook(() => useClickOutsideTestHook(handler));
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
  });
});
