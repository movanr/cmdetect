import { useReducer, useCallback, useRef, useLayoutEffect } from 'react';
import type { DrawingElement, HistoryState, HistoryAction } from '../types';

const initialState: HistoryState = {
  past: [],
  present: [],
  future: [],
};

function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case 'ADD': {
      return {
        past: [...state.past, state.present],
        present: [...state.present, action.element],
        future: [], // Clear future on new action
      };
    }
    case 'UNDO': {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, -1);
      return {
        past: newPast,
        present: previous,
        future: [state.present, ...state.future],
      };
    }
    case 'REDO': {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      const newFuture = state.future.slice(1);
      return {
        past: [...state.past, state.present],
        present: next,
        future: newFuture,
      };
    }
    case 'CLEAR': {
      if (state.present.length === 0) return state;
      return {
        past: [...state.past, state.present],
        present: [],
        future: [], // Clear future on new action
      };
    }
    case 'SET': {
      return {
        past: [],
        present: action.elements,
        future: [],
      };
    }
    case 'RESTORE': {
      return action.state;
    }
    default:
      return state;
  }
}

export interface UseDrawingHistoryReturn {
  elements: DrawingElement[];
  canUndo: boolean;
  canRedo: boolean;
  addElement: (element: DrawingElement) => void;
  undo: () => void;
  redo: () => void;
  clear: () => void;
  setElements: (elements: DrawingElement[]) => void;
  getHistoryState: () => HistoryState;
  restoreState: (state: HistoryState) => void;
}

export function useDrawingHistory(
  initialElements: DrawingElement[] = []
): UseDrawingHistoryReturn {
  const [state, dispatch] = useReducer(historyReducer, {
    ...initialState,
    present: initialElements,
  });

  const addElement = useCallback((element: DrawingElement) => {
    dispatch({ type: 'ADD', element });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, []);

  const clear = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  const setElements = useCallback((elements: DrawingElement[]) => {
    dispatch({ type: 'SET', elements });
  }, []);

  // Keep a ref to always have the latest state available (avoids stale closures)
  const stateRef = useRef(state);
  useLayoutEffect(() => {
    stateRef.current = state;
  });

  const getHistoryState = useCallback((): HistoryState => {
    return stateRef.current;
  }, []);

  const restoreState = useCallback((historyState: HistoryState) => {
    dispatch({ type: 'RESTORE', state: historyState });
  }, []);

  return {
    elements: state.present,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
    addElement,
    undo,
    redo,
    clear,
    setElements,
    getHistoryState,
    restoreState,
  };
}
