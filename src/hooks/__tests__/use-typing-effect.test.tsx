import { renderHook, act } from '@testing-library/preact';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useTypingEffect } from '../use-typing-effect';

describe('useTypingEffect', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with empty text', () => {
    const { result } = renderHook(() => useTypingEffect('Hello'));
    expect(result.current.displayedText.value).toBe('');
    expect(result.current.isTyping.value).toBe(true);
    expect(result.current.isDone.value).toBe(false);
  });

  it('should return signals for displayedText, isTyping, isDone', () => {
    const { result } = renderHook(() => useTypingEffect('Test'));
    
    expect(result.current.displayedText).toBeDefined();
    expect(result.current.isTyping).toBeDefined();
    expect(result.current.isDone).toBeDefined();
  });

  it('should type text character by character', () => {
    const { result } = renderHook(() => useTypingEffect('Hi', 50, 0));

    act(() => {
      vi.advanceTimersByTime(100);
    });
    
    // At least one character should be typed
    expect(result.current.displayedText.value.length).toBeGreaterThan(0);
  });

  it('should eventually complete typing', () => {
    const { result } = renderHook(() => useTypingEffect('AB', 20, 0));

    act(() => {
      vi.advanceTimersByTime(500); // More than enough time
    });

    expect(result.current.isDone.value).toBe(true);
    expect(result.current.isTyping.value).toBe(false);
    expect(result.current.displayedText.value).toBe('AB');
  });

  it('should respect startDelay', () => {
    const { result } = renderHook(() => useTypingEffect('X', 50, 500));

    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current.displayedText.value).toBe('');

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current.displayedText.value).toBe('X');
  });
});
