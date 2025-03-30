import { useTheme } from "@/context/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="fixed top-4 right-4 z-50">
      <button 
        onClick={toggleTheme}
        className="p-2 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
      >
        <span className="material-icons block dark:hidden">dark_mode</span>
        <span className="material-icons hidden dark:block">light_mode</span>
      </button>
    </div>
  );
};

export default ThemeToggle;
