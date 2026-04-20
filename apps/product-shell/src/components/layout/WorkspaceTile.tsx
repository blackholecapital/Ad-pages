import type { CSSProperties, ReactNode } from "react";

type WorkspaceTileProps = {
  title?: ReactNode;
  headerExtras?: ReactNode;
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
  style?: CSSProperties;
};

export function WorkspaceTile({
  title,
  headerExtras,
  children,
  className,
  contentClassName,
  style,
}: WorkspaceTileProps) {
  return (
    <div className={"workspaceTile" + (className ? " " + className : "")} style={style}>
      {(title || headerExtras) && (
        <div className="workspaceTileHeader">
          {title ? <h1 className="workspaceTileTitle">{title}</h1> : <span />}
          {headerExtras ? <div className="workspaceTileHeaderExtras">{headerExtras}</div> : null}
        </div>
      )}
      <div className={"workspaceTileBody paymeShell" + (contentClassName ? " " + contentClassName : "")}>
        {children}
      </div>
    </div>
  );
}
