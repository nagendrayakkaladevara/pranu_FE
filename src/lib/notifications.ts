export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  timestamp: Date;
}

const MAX_HISTORY = 50;
let idCounter = 0;
const history: Notification[] = [];
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

export const notificationStore = {
  add(type: Notification["type"], message: string) {
    history.unshift({
      id: String(++idCounter),
      type,
      message,
      timestamp: new Date(),
    });
    if (history.length > MAX_HISTORY) history.pop();
    emit();
  },

  getAll(): readonly Notification[] {
    return history;
  },

  clear() {
    history.length = 0;
    emit();
  },

  subscribe(fn: () => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
