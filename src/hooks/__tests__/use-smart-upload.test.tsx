import { renderHook, act } from '@testing-library/preact';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useSmartUpload } from '../use-smart-upload';

describe('useSmartUpload', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ provider: 'LOCAL' }),
    }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should initialize with empty file list and not uploading', () => {
    const { result } = renderHook(() => useSmartUpload('project', 'images'));
    
    expect(result.current.fileList.value).toEqual([]);
    expect(result.current.isUploading.value).toBe(false);
  });

  it('should have uploadFiles function', () => {
    const { result } = renderHook(() => useSmartUpload('project', 'images'));
    
    expect(typeof result.current.uploadFiles).toBe('function');
  });

  it('should have removeFileState function', () => {
    const { result } = renderHook(() => useSmartUpload('project', 'images'));
    
    expect(typeof result.current.removeFileState).toBe('function');
  });

  it('should have clearFiles function', () => {
    const { result } = renderHook(() => useSmartUpload('project', 'images'));
    
    expect(typeof result.current.clearFiles).toBe('function');
  });

  it('should fetch provider on mount', async () => {
    renderHook(() => useSmartUpload('project', 'images'));
    
    expect(fetch).toHaveBeenCalledWith('/api/v1/upload/provider');
  });

  it('should clear all files when clearFiles is called', async () => {
    const { result } = renderHook(() => useSmartUpload('project', 'images'));

    // Add some mock files to the list
    act(() => {
      result.current.fileList.value = [
        { id: '1', file: new File([''], 'test.jpg'), status: 'COMPLETED', progress: 100, key: 'key1' },
        { id: '2', file: new File([''], 'test2.jpg'), status: 'PENDING', progress: 0 },
      ];
    });

    act(() => {
      result.current.clearFiles();
    });

    expect(result.current.fileList.value).toEqual([]);
  });
});
