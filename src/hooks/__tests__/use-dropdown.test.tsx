import { renderHook, act } from '@testing-library/preact';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import useDropdown from '../use-dropdown';

describe('useDropdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with closed dropdown', () => {
    const { result } = renderHook(() => useDropdown());
    expect(result.current.dropdownOpen).toBe(false);
  });

  it('should open dropdown with onOpen', () => {
    const { result } = renderHook(() => useDropdown());

    act(() => {
      result.current.onOpen();
    });

    expect(result.current.dropdownOpen).toBe(true);
  });

  it('should close dropdown with onClose', () => {
    const { result } = renderHook(() => useDropdown());

    act(() => {
      result.current.onOpen();
    });
    expect(result.current.dropdownOpen).toBe(true);

    act(() => {
      result.current.onClose();
      vi.advanceTimersByTime(0); // onClose uses setTimeout even with 0 delay
    });

    expect(result.current.dropdownOpen).toBe(false);
  });

  it('should close dropdown with delay', () => {
    const { result } = renderHook(() => useDropdown());

    act(() => {
      result.current.onOpen();
    });

    act(() => {
      result.current.onClose(1); // 1 second delay
    });

    // Still open before delay
    expect(result.current.dropdownOpen).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.dropdownOpen).toBe(false);
  });

  it('should toggle dropdown with onOpenClose', () => {
    const { result } = renderHook(() => useDropdown());

    act(() => {
      result.current.onOpenClose();
    });
    expect(result.current.dropdownOpen).toBe(true);

    act(() => {
      result.current.onOpenClose();
    });
    expect(result.current.dropdownOpen).toBe(false);
  });

  it('should return trigger and dropdown refs', () => {
    const { result } = renderHook(() => useDropdown());
    
    expect(result.current.trigger).toBeDefined();
    expect(result.current.dropdown).toBeDefined();
  });

  it('should close on Escape key', () => {
    const { result } = renderHook(() => useDropdown());

    act(() => {
      result.current.onOpen();
    });
    expect(result.current.dropdownOpen).toBe(true);

    act(() => {
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);
    });

    expect(result.current.dropdownOpen).toBe(false);
  });
});
