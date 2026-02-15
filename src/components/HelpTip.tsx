import { HelpCircle } from "lucide-react";

interface HelpTipProps {
  text: string;
}

export function HelpTip({ text }: HelpTipProps) {
  return (
    <span
      className="inline-flex items-center ml-1 text-muted-foreground/60 hover:text-muted-foreground cursor-help transition-colors"
      title={text}
      aria-label={text}
    >
      <HelpCircle className="size-3.5" />
    </span>
  );
}
