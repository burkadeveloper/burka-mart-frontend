import { useState } from "react";
import { Smile } from "lucide-react";

const stickers = [
  "😀",
  "😂",
  "😍",
  "😢",
  "😡",
  "👍",
  "👎",
  "🙏",
  "🔥",
  "💯",
  "🎉",
  "❤️",
  "💔",
  "⭐",
  "✅",
];

export default function StickerPicker({ onSelect }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1 text-gray-500 hover:text-gray-700"
      >
        <Smile size={20} />
      </button>
      {open && (
        <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 w-48 grid grid-cols-6 gap-1 z-10">
          {stickers.map((s) => (
            <button
              key={s}
              className="text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded p-1"
              onClick={() => {
                onSelect(s);
                setOpen(false);
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
