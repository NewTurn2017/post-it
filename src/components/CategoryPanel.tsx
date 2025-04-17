import React from "react";
import { StickyNote } from "./StickyNote";
import { Id } from "../../convex/_generated/dataModel";

export interface Note {
  _id: Id<"notes">;
  content: string;
  imageUrl?: string | null;
  order: number;
}

interface CategoryPanelProps {
  name: string;
  notes: Note[];
  onNoteClick: (noteId: Id<"notes">) => void;
  onNoteDragStart: (noteId: Id<"notes">, e: React.DragEvent) => void;
  onNoteDragEnd: (noteId: Id<"notes">, e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  selectedNoteId?: Id<"notes"> | null;
}

export function CategoryPanel({
  name,
  notes,
  onNoteClick,
  onNoteDragStart,
  onNoteDragEnd,
  onDrop,
  selectedNoteId,
}: CategoryPanelProps) {
  return (
    <div
      className="flex flex-col items-center p-2"
      style={{ minWidth: 220, minHeight: 400 }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <svg width="200" height="50">
        <rect x="0" y="0" width="200" height="50" rx="16" fill="#f1f5f9" stroke="#a3a3a3" strokeWidth="2" />
        <text x="100" y="32" textAnchor="middle" fontSize="22" fill="#334155" fontWeight="bold">
          {name}
        </text>
      </svg>
      <div className="flex flex-col gap-4 mt-4">
        {notes
          .sort((a, b) => a.order - b.order)
          .map((note) => (
            <div
              key={note._id}
              style={{ marginBottom: 8 }}
              onClick={() => onNoteClick(note._id)}
              draggable
              onDragStart={(e) => onNoteDragStart(note._id, e)}
              onDragEnd={(e) => onNoteDragEnd(note._id, e)}
            >
              <StickyNote
                content={note.content}
                imageUrl={note.imageUrl}
                draggable
                selected={selectedNoteId === note._id}
              />
            </div>
          ))}
      </div>
    </div>
  );
}
