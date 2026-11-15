"use client";

import { Button } from "@heroui/react";
import { Icon, SunIcon, MoonIcon } from "@/lib/icons";
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const label = theme === "dark" ? "Zum hellen Design wechseln" : "Zum dunklen Design wechseln";

  return (
    <Button variant="ghost" size="sm" isIconOnly onPress={toggleTheme} aria-label={label}>
      <Icon icon={theme === "dark" ? SunIcon : MoonIcon} />
    </Button>
  );
}
