import React, { useRef, useState } from "react";

interface NoteModalProps {
  open: boolean;
  content: string;
  imageUrl?: string | null;
  onContentChange: (content: string) => void;
  onImageChange: (file: File | null) => void;
  onClose: () => void;
  onDelete: () => void;
}

export function NoteModal({
  open,
  content,
  imageUrl,
  onContentChange,
  onImageChange,
  onClose,
  onDelete,
}: NoteModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localContent, setLocalContent] = useState(content);

  React.useEffect(() => {
    setLocalContent(content);
  }, [content, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <svg width="420" height="340" style={{ position: "absolute" }}>
        <rect x="10" y="10" width="400" height="320" rx="24" fill="#fffbe7" stroke="#facc15" strokeWidth="5" />
        <rect x="10" y="10" width="400" height="320" rx="24" fill="url(#modalGradient)" opacity="0.5" />
        <defs>
          <linearGradient id="modalGradient" x1="0" y1="0" x2="420" y2="340" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fffde4" />
            <stop offset="1" stopColor="#ffe9a7" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute w-[400px] h-[320px] flex flex-col justify-between p-6">
        <textarea
          className="w-full h-32 rounded-lg border border-yellow-300 p-2 text-lg font-mono bg-transparent resize-none"
          value={localContent}
          onChange={(e) => {
            setLocalContent(e.target.value);
            onContentChange(e.target.value);
          }}
          placeholder="Write your note here..."
          style={{ background: "none" }}
        />
        <div className="flex items-center gap-2 mt-2">
          <input
            type="file"
            accept="image/jpeg,image/png"
            ref={fileInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && file.size > 5 * 1024 * 1024) {
                alert("Image must be less than 5MB");
                fileInputRef.current!.value = "";
                return;
              }
              onImageChange(file || null);
            }}
          />
          {imageUrl && (
            <img src={imageUrl} alt="Note" className="h-16 w-16 object-cover rounded" />
          )}
        </div>
        <div className="flex justify-between mt-4">
          <button
            className="px-4 py-2 bg-red-400 text-white rounded hover:bg-red-500"
            onClick={onDelete}
          >
            Delete
          </button>
          <button
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
