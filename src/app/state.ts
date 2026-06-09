import type { AppState } from "../types/app.js";

type StateListener = (state: Readonly<AppState>) => void;

let state: AppState = {
  user: null,
  loading: false
};

const listeners = new Set<StateListener>();

export function getState(): Readonly<AppState> {
  return state;
}

export function setState(update: Partial<AppState>): void {
  state = { ...state, ...update };
  listeners.forEach((listener) => listener(state));
}

export function subscribe(listener: StateListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
