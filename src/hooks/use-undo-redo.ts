import { useState, useCallback, useRef } from 'react';

interface UndoRedoState<T> {
  current: T;
  undo: () => void;
  redo: () => void;
  set: (value: T) => void;
  replace: (value: T) => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function useUndoRedo<T>(initial: T, maxHistory = 50): UndoRedoState<T> {
  const [current, setCurrent] = useState<T>(initial);
  const pastRef = useRef<T[]>([]);
  const futureRef = useRef<T[]>([]);

  const set = useCallback((value: T) => {
    setCurrent(prev => {
      pastRef.current = [...pastRef.current.slice(-(maxHistory - 1)), prev];
      futureRef.current = [];
      return value;
    });
  }, [maxHistory]);

  const replace = useCallback((value: T) => {
    setCurrent(value);
  }, []);

  const undo = useCallback(() => {
    setCurrent(prev => {
      if (pastRef.current.length === 0) return prev;
      const previous = pastRef.current[pastRef.current.length - 1];
      pastRef.current = pastRef.current.slice(0, -1);
      futureRef.current = [prev, ...futureRef.current];
      return previous;
    });
  }, []);

  const redo = useCallback(() => {
    setCurrent(prev => {
      if (futureRef.current.length === 0) return prev;
      const next = futureRef.current[0];
      futureRef.current = futureRef.current.slice(1);
      pastRef.current = [...pastRef.current, prev];
      return next;
    });
  }, []);

  return {
    current,
    undo,
    redo,
    set,
    replace,
    canUndo: pastRef.current.length > 0,
    canRedo: futureRef.current.length > 0,
  };
}
