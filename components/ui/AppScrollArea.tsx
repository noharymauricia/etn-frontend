"use client";

import type { ReactNode } from "react";
import { ScrollArea } from "@base-ui/react/scroll-area";

import styles from "@/components/ui/AppScrollArea.module.css";

type AppScrollAreaProps = {
  children: ReactNode;
  className?: string;
  viewportClassName?: string;
  contentClassName?: string;
  orientation?: "vertical" | "horizontal" | "both";
};

export default function AppScrollArea({
  children,
  className,
  viewportClassName,
  contentClassName,
  orientation = "vertical",
}: AppScrollAreaProps) {
  const showVertical = orientation === "vertical" || orientation === "both";
  const showHorizontal = orientation === "horizontal" || orientation === "both";

  return (
    <ScrollArea.Root className={join(styles.root, className)}>
      <ScrollArea.Viewport className={join(styles.viewport, viewportClassName)}>
        <ScrollArea.Content className={join(styles.content, contentClassName)}>
          {children}
        </ScrollArea.Content>
      </ScrollArea.Viewport>

      {showVertical ? (
        <ScrollArea.Scrollbar className={styles.scrollbar} orientation="vertical">
          <ScrollArea.Thumb className={styles.thumb} />
        </ScrollArea.Scrollbar>
      ) : null}

      {showHorizontal ? (
        <ScrollArea.Scrollbar className={styles.scrollbar} orientation="horizontal">
          <ScrollArea.Thumb className={styles.thumb} />
        </ScrollArea.Scrollbar>
      ) : null}
    </ScrollArea.Root>
  );
}

function join(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(" ");
}
