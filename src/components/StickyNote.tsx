import React from "react";

export interface StickyNoteProps {
  content: string;
  imageUrl?: string | null;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  draggable?: boolean;
  selected?: boolean;
}

export function StickyNote({
  content,
  imageUrl,
  onClick,
  onDragStart,
  onDragEnd,
  draggable = false,
  selected = false,
}: StickyNoteProps) {
  // Move draggable to the wrapping div, not the svg
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      style={{ display: "inline-block", cursor: draggable ? "grab" : "pointer" }}
      onClick={onClick}
    >
      <svg
        width="180"
        height="180"
        viewBox="0 0 180 180"
        style={{
          filter: selected ? "drop-shadow(0 0 8px #6366f1)" : "drop-shadow(0 2px 6px #aaa)",
          background: "none",
        }}
      >
        <rect
          x="8"
          y="8"
          width="164"
          height="164"
          rx="18"
          fill="#fffbe7"
          stroke="#facc15"
          strokeWidth="4"
        />
        <rect
          x="8"
          y="8"
          width="164"
          height="164"
          rx="18"
          fill="url(#paperGradient)"
          opacity="0.5"
        />
        <defs>
          <linearGradient id="paperGradient" x1="0" y1="0" x2="180" y2="180" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fffde4" />
            <stop offset="1" stopColor="#ffe9a7" />
          </linearGradient>
        </defs>
        {imageUrl && (
          <image
            href={imageUrl}
            x="20"
            y="20"
            width="140"
            height="80"
            style={{ borderRadius: 8, objectFit: "cover" }}
          />
        )}
        <foreignObject x="20" y={imageUrl ? 110 : 30} width="140" height={imageUrl ? 50 : 120}>
          <div
            style={{
              fontSize: 16,
              color: "#444",
              fontFamily: "Comic Sans MS, Comic Sans, cursive",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "pre-line",
              height: "100%",
              width: "100%",
              padding: 0,
              margin: 0,
              background: "none",
            }}
          >
            {content}
          </div>
        </foreignObject>
      </svg>
    </div>
  );
}
