import type { ReactNode } from "react";

interface VirtualListProps<T> {
  items: T[];
  height?: number;
  renderItem: (item: T, index: number) => ReactNode;
}

/**
 * Simple list component that renders all items.
 * For large lists (100+ items), wrap with react-window's List component
 * at the page level for virtualization.
 */
export function VirtualList<T>({ items, height, renderItem }: VirtualListProps<T>) {
  return (
    <div style={height ? { maxHeight: height, overflowY: "auto" } : undefined}>
      {items.map((item, i) => renderItem(item, i))}
    </div>
  );
}
