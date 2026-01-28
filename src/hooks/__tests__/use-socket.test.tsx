import { renderHook, act } from '@testing-library/preact';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import useSocket from '../use-socket';

// Mock socket.io-client
vi.mock('socket.io-client', () => ({
  io: vi.fn(() => ({
    on: vi.fn(),
    disconnect: vi.fn(),
  })),
}));

describe('useSocket', () => {
  let mockStorage: Record<string, string>;

  beforeEach(() => {
    mockStorage = { tabs: '0' };
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => mockStorage[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        mockStorage[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete mockStorage[key];
      }),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should initialize with disconnected state', () => {
    const { result } = renderHook(() => useSocket('http://localhost:3000', {}));
    
    expect(result.current.isConnect.value).toBe(false);
    expect(result.current.socket.value).toBeNull();
  });

  it('should have connectSocket and disconnectSocket functions', () => {
    const { result } = renderHook(() => useSocket('http://localhost:3000', {}));
    
    expect(typeof result.current.connectSocket).toBe('function');
    expect(typeof result.current.disconnectSocket).toBe('function');
  });

  it('should connect socket when connectSocket is called', async () => {
    const { io } = await import('socket.io-client');
    const { result } = renderHook(() => useSocket('http://localhost:3000', {}));

    act(() => {
      result.current.connectSocket();
    });

    expect(io).toHaveBeenCalledWith('http://localhost:3000', {});
    expect(result.current.socket.value).not.toBeNull();
  });

  it('should increment tabs counter on mount', () => {
    mockStorage.tabs = '2';
    renderHook(() => useSocket('http://localhost:3000', {}));

    expect(localStorage.setItem).toHaveBeenCalledWith('tabs', '3');
  });

  it('should try to become leader if no leader exists', () => {
    renderHook(() => useSocket('http://localhost:3000', {}));

    expect(localStorage.setItem).toHaveBeenCalledWith('socket_leader', expect.any(String));
  });
});
