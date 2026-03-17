import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

const options = [
  { value: "light" as const, icon: Sun, label: "Light" },
  { value: "dark" as const, icon: Moon, label: "Dark" },
  { value: "system" as const, icon: Monitor, label: "System" },
];

interface ThemeToggleProps {
  /** When true, spans full width with even distribution (for dropdowns) */
  fullWidth?: boolean;
}

export function ThemeToggle({ fullWidth }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={`flex items-center rounded-lg border border-border bg-muted/50 p-0.5 ${fullWidth ? "w-full justify-between" : ""}`}
      role="radiogroup"
      aria-label="Theme"
    >
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          role="radio"
          aria-checked={theme === value}
          aria-label={label}
          onClick={() => setTheme(value)}
          className={`relative p-1.5 rounded-md transition-all duration-200 ${
            theme === value
              ? "bg-primary/20 text-primary shadow-sm ring-1 ring-primary/30"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Icon className="size-3.5" />
        </button>
      ))}
    </div>
  );
}
