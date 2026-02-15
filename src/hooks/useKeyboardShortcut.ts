import { useEffect } from "react";

type KeyHandler = (e: KeyboardEvent) => void;

interface ShortcutOptions {
  /** The key to listen for (e.g., "k", "Escape", "ArrowLeft") */
  key: string;
  /** Whether Ctrl/Cmd must be pressed */
  ctrlOrMeta?: boolean;
  /** Callback */
  handler: KeyHandler;
  /** Whether to prevent default browser behavior */
  preventDefault?: boolean;
}

export function useKeyboardShortcut(options: ShortcutOptions) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Don't trigger when typing in inputs/textareas
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // Allow Escape even in inputs
        if (e.key !== "Escape") return;
      }

      const ctrlMeta = e.ctrlKey || e.metaKey;
      if (options.ctrlOrMeta && !ctrlMeta) return;
      if (!options.ctrlOrMeta && ctrlMeta && options.key !== "Escape") return;

      if (e.key.toLowerCase() === options.key.toLowerCase()) {
        if (options.preventDefault) e.preventDefault();
        options.handler(e);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [options]);
}
