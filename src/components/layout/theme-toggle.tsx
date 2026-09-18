"use client";

import { Button } from "@/components/ui/button";
import { Icon, SunIcon, MoonIcon } from "@/lib/icons";
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const label = theme === "dark" ? "Zum hellen Design wechseln" : "Zum dunklen Design wechseln";

  return (
    <Button
      variant="neutral"
      mode="ghost"
      size="sm"
      asIcon
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      <Icon icon={theme === "dark" ? SunIcon : MoonIcon} />
    </Button>
  );
}
