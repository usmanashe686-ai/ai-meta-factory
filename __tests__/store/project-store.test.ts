import { describe, it, expect, beforeEach } from 'vitest';
import { useProjectStore } from '@/store/project-store';
import { act, renderHook } from '@testing-library/react';

describe('Project Store', () => {
  beforeEach(() => {
    // Clear store before each test
    const { result } = renderHook(() => useProjectStore());
    act(() => {
      result.current.resetProject();
    });
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useProjectStore());
    
    expect(result.current.components).toEqual([]);
    expect(result.current.layout).toEqual({});
    expect(result.current.metadata.name).toBe('Untitled Project');
    expect(result.current.metadata.version).toBe(0);
  });

  it('should add a component', () => {
    const { result } = renderHook(() => useProjectStore());
    
    const newComponent = {
      id: 'test-component',
      type: 'button',
      name: 'Test Button',
      properties: { text: 'Click me' },
    };
    
    act(() => {
      result.current.addComponent(newComponent);
    });
    
    expect(result.current.components).toHaveLength(1);
    expect(result.current.components[0]).toEqual(newComponent);
    expect(result.current.metadata.version).toBe(1);
  });

  it('should update a component', () => {
    const { result } = renderHook(() => useProjectStore());
    
    // First add a component
    const component = {
      id: 'test-component',
      type: 'button',
      name: 'Test Button',
      properties: { text: 'Click me' },
    };
    
    act(() => {
      result.current.addComponent(component);
    });
    
    // Then update it
    act(() => {
      result.current.updateComponent('test-component', {
        properties: { text: 'Updated Text' },
      });
    });
    
    expect(result.current.components[0].properties.text).toBe('Updated Text');
    expect(result.current.metadata.version).toBe(2);
  });

  it('should remove a component', () => {
    const { result } = renderHook(() => useProjectStore());
    
    // Add multiple components
    act(() => {
      result.current.addComponent({ id: 'comp1', type: 'button', name: 'Button 1' });
      result.current.addComponent({ id: 'comp2', type: 'input', name: 'Input 1' });
    });
    
    expect(result.current.components).toHaveLength(2);
    
    // Remove one
    act(() => {
      result.current.removeComponent('comp1');
    });
    
    expect(result.current.components).toHaveLength(1);
    expect(result.current.components[0].id).toBe('comp2');
    expect(result.current.metadata.version).toBe(3);
  });

  it('should update layout', () => {
    const { result } = renderHook(() => useProjectStore());
    
    const newLayout = {
      grid: { columns: 12 },
      spacing: 16,
    };
    
    act(() => {
      result.current.updateLayout(newLayout);
    });
    
    expect(result.current.layout).toEqual(newLayout);
    expect(result.current.metadata.version).toBe(1);
  });

  it('should persist state', () => {
    const { result, unmount } = renderHook(() => useProjectStore());
    
    // Make some changes
    act(() => {
      result.current.addComponent({
        id: 'persisted-component',
        type: 'button',
        name: 'Persisted Button',
      });
    });
    
    unmount();
    
    // Re-mount and check persistence
    const { result: newResult } = renderHook(() => useProjectStore());
    
    expect(newResult.current.components).toHaveLength(1);
    expect(newResult.current.components[0].name).toBe('Persisted Button');
  });
});
