import { useLocation, Link } from "wouter";
import { useUser } from "@/context/UserContext";

const Sidebar = () => {
  const [location] = useLocation();
  const { user } = useUser();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-neutral-800 shadow-md z-10">
      <div className="p-4 flex items-center gap-3 border-b border-neutral-200 dark:border-neutral-700">
        <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white">
          <span className="material-icons text-xl">school</span>
        </div>
        <h1 className="text-xl font-bold text-primary dark:text-primary-light">StudyAI</h1>
      </div>
      
      <nav className="p-2 flex-1 overflow-y-auto">
        <div className="mb-4">
          <p className="px-3 py-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Main</p>
          <ul>
            <li>
              <Link href="/">
                <a className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                  location === '/' 
                    ? 'bg-primary-light/10 text-primary dark:text-primary-light' 
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                }`}>
                  <span className="material-icons">dashboard</span>
                  <span>Dashboard</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/study-planner">
                <a className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                  location === '/study-planner' 
                    ? 'bg-primary-light/10 text-primary dark:text-primary-light' 
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                }`}>
                  <span className="material-icons">event_note</span>
                  <span>Study Planner</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/classroom">
                <a className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                  location === '/classroom' 
                    ? 'bg-primary-light/10 text-primary dark:text-primary-light' 
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                }`}>
                  <span className="material-icons">school</span>
                  <span>Classroom</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/flashcards">
                <a className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                  location === '/flashcards' 
                    ? 'bg-primary-light/10 text-primary dark:text-primary-light' 
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                }`}>
                  <span className="material-icons">style</span>
                  <span>Flashcards</span>
                </a>
              </Link>
            </li>
            <li>
              <Link href="/learning-path">
                <a className={`flex items-center gap-3 px-3 py-2 rounded-md ${
                  location === '/learning-path' 
                    ? 'bg-primary-light/10 text-primary dark:text-primary-light' 
                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                }`}>
                  <span className="material-icons">route</span>
                  <span>Learning Path</span>
                </a>
              </Link>
            </li>
          </ul>
        </div>
        
        <div className="mb-4">
          <p className="px-3 py-2 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Tools</p>
          <ul>
            <li>
              <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700">
                <span className="material-icons">edit_note</span>
                <span>Writing Assistant</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700">
                <span className="material-icons">work</span>
                <span>Career Booster</span>
              </a>
            </li>
          </ul>
        </div>
      </nav>
      
      <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white">
            <span className="material-icons text-sm">person</span>
          </div>
          <div>
            <p className="text-sm font-medium">{user?.name || "Loading..."}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{user?.major || "Loading..."}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
