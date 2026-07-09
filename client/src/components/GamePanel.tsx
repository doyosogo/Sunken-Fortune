import type { PropsWithChildren, ReactNode } from "react";

interface GamePanelProps {
  title?: string;
  className?: string;
  action?: ReactNode;
}

export function GamePanel({ action, children, className = "", title }: PropsWithChildren<GamePanelProps>) {
  return (
    <section className={`game-panel ${className}`.trim()}>
      {(title || action) && (
        <header className="game-panel-header">
          {title && <h2>{title}</h2>}
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
