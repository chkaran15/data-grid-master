import { Laptop, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme, type ThemeMode } from "@/lib/theme";

const OPTIONS: Array<{ mode: ThemeMode; label: string; icon: React.ReactNode }> = [
  { mode: "light", label: "Light", icon: <Sun className="size-4" /> },
  { mode: "dark", label: "Dark", icon: <Moon className="size-4" /> },
  { mode: "system", label: "System", icon: <Laptop className="size-4" /> },
];

export function ThemeToggle() {
  const { mode, resolved, setMode } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="size-9" aria-label="Change appearance">
          {resolved === "dark" ? <Moon className="size-4" /> : <Sun className="size-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        {OPTIONS.map((o) => (
          <DropdownMenuItem key={o.mode} onClick={() => setMode(o.mode)} className="gap-2">
            {o.icon}
            {o.label}
            {mode === o.mode && <span className="ml-auto text-xs text-primary">Active</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
