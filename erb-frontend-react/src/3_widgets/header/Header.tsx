import { Menu, Search, Bell, Settings, UserCircle } from 'lucide-react';

export const Header = () => {
  return (
    <header className="bg-[#f7f9fc] dark:bg-slate-950 flex justify-between items-center px-8 h-16 w-full shadow-sm dark:shadow-none z-40 sticky top-0">

      <div className="flex items-center gap-4">
        <button className="md:hidden text-[#00408b] p-1 rounded-md hover:bg-slate-200 transition-colors">
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="font-extrabold tracking-tight text-sm text-[#00408b] dark:text-blue-400">
          Freight Management Terminal
        </h1>
      </div>

      <div className="flex items-center space-x-6">
        {/* Поиск */}
        <div className="hidden lg:flex items-center bg-[#eceef1] dark:bg-slate-900 rounded-full px-4 py-1.5 focus-within:ring-2 ring-[#0057b8] transition-all">
          <Search className="text-slate-500 w-4 h-4 mr-2" />
          <input 
            className="bg-transparent border-none outline-none focus:ring-0 text-sm w-48 p-0 text-slate-800 dark:text-slate-200 placeholder-slate-400" 
            placeholder="Search requests..." 
            type="text" 
          />
        </div>

        <div className="flex items-center gap-2">
          <button 
            className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors active:scale-95" 
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
          </button>
          <button 
            className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors active:scale-95" 
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button 
            className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors active:scale-95" 
            title="Account"
          >
            <UserCircle className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
};