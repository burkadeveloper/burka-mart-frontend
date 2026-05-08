import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../features/themeSlice";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const dispatch = useDispatch();
  const { mode } = useSelector((state) => state.theme);

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle theme"
    >
      {mode === "light" ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
}
