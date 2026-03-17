import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Tasks from './pages/Tasks';
import AIInsights from './pages/AIInsights';

const NAV = [
  { to: '/',           icon: 'dashboard',     label: 'Dashboard'   },
  { to: '/calendar',   icon: 'calendar_month', label: 'Calendar'    },
  { to: '/tasks',      icon: 'check_circle',  label: 'Tasks'       },
  { to: '/ai-insights',icon: 'insights',      label: 'AI Insights' },
];

function Sidebar() {
  return (
    <aside className="hidden lg:flex w-64 xl:w-72 flex-col border-r border-slate-200 dark:border-primary/10 p-5 gap-6 flex-shrink-0 bg-background-light dark:bg-background-dark overflow-y-auto">
      <nav className="flex flex-col gap-1.5">
        {NAV.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'hover:bg-primary/10 text-slate-600 dark:text-slate-400'
              }`
            }
          >
            <span className="material-symbols-outlined text-xl">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

function Header() {
  const location = useLocation();
  const page = NAV.find(n => n.to === location.pathname)?.label || 'CampusFlow';

  // --- State for Dropdowns & Modals ---
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // --- Dummy Data for Interactions ---
  const MOCK_NOTIFS = [
    { id: 1, title: 'AI Overlap Detected', time: '10m ago', unread: true },
    { id: 2, title: 'Telegram Task Added', time: '1h ago', unread: true },
    { id: 3, title: 'Weekly Summary Ready', time: 'Yesterday', unread: false },
  ];

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 dark:border-primary/20 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md px-6 py-3 lg:px-10">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/30">
            <span className="material-symbols-outlined text-xl">auto_awesome</span>
          </div>
          <span className="text-lg font-extrabold tracking-tight">CampusFlow</span>
        </div>
        <div className="hidden md:block h-5 w-px bg-slate-300 dark:bg-slate-700" />
        <span className="hidden md:block text-sm font-medium text-slate-400">{page}</span>
      </div>

      <div className="flex items-center gap-3 relative">
        
        {/* --- 1. Search Bar Functionality --- */}
        <div className="relative group hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
          <input
            className="w-56 lg:w-80 rounded-xl border-none bg-slate-100 dark:bg-primary/10 pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
            placeholder="Search anything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSearch(true)}
            onBlur={() => setTimeout(() => setShowSearch(false), 200)}
          />
          {/* Search Results Dropdown */}
          {showSearch && searchQuery && (
            <div className="absolute top-full left-0 mt-2 w-full rounded-2xl border border-slate-200 dark:border-primary/20 bg-white dark:bg-slate-900 p-2 shadow-2xl z-50">
              <p className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Results for "{searchQuery}"</p>
              <div className="flex flex-col gap-1">
                <button className="flex items-center gap-3 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-left transition-colors">
                  <span className="material-symbols-outlined text-primary text-sm">event</span>
                  <div>
                    <p className="text-sm font-bold">Algorithms Midterm</p>
                    <p className="text-xs text-slate-500">Calendar Event • Tomorrow</p>
                  </div>
                </button>
                <button className="flex items-center gap-3 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-left transition-colors">
                  <span className="material-symbols-outlined text-purple-500 text-sm">smart_toy</span>
                  <div>
                    <p className="text-sm font-bold">Review Notes</p>
                    <p className="text-xs text-slate-500">AI Task • In 2 hours</p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* --- 2. Notifications Dropdown --- */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifs(!showNotifs)}
            onBlur={() => setTimeout(() => setShowNotifs(false), 200)}
            className={`relative flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${showNotifs ? 'bg-primary/20 text-primary' : 'bg-slate-100 dark:bg-primary/10 hover:bg-primary/20'}`}
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
          </button>
          
          {showNotifs && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-slate-200 dark:border-primary/20 bg-white dark:bg-slate-900 shadow-2xl z-50 overflow-hidden origin-top-right animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold">Notifications</h3>
                <button className="text-xs text-primary font-bold hover:underline">Mark all read</button>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {MOCK_NOTIFS.map((n) => (
                  <div key={n.id} className={`flex items-start gap-3 p-4 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors ${n.unread ? 'bg-primary/[0.02]' : ''}`}>
                    <div className={`mt-0.5 h-2 w-2 rounded-full flex-shrink-0 ${n.unread ? 'bg-primary' : 'bg-transparent'}`} />
                    <div className="flex-1">
                      <p className={`text-sm ${n.unread ? 'font-bold' : 'font-medium text-slate-600 dark:text-slate-300'}`}>{n.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{n.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-800 text-center">
                <button className="text-xs font-bold text-slate-500 hover:text-primary transition-colors">View All Settings</button>
              </div>
            </div>
          )}
        </div>

        {/* --- 3. Settings Modal Trigger --- */}
        <button 
          onClick={() => setShowSettings(true)}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-primary/10 hover:bg-primary/20 transition-colors"
        >
          <span className="material-symbols-outlined text-xl">settings</span>
        </button>

        {/* --- 4. Profile Dropdown --- */}
        <div className="relative">
          <div 
            onClick={() => setShowProfile(!showProfile)}
            className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary to-purple-400 border-2 border-white dark:border-slate-800 shadow-md cursor-pointer hover:scale-105 transition-transform" 
            title="Alex (Profile)" 
          />
          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl border border-slate-200 dark:border-primary/20 bg-white dark:bg-slate-900 shadow-2xl z-50 p-2 origin-top-right animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 p-3 mb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-purple-400" />
                <div>
                  <p className="font-bold text-sm">Alex Student</p>
                  <p className="text-xs text-slate-500">Pro Plan</p>
                </div>
              </div>
              <button className="flex w-full items-center gap-3 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-sm font-medium transition-colors">
                <span className="material-symbols-outlined text-slate-400 text-lg">person</span> My Account
              </button>
              <button className="flex w-full items-center gap-3 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-sm font-medium transition-colors">
                <span className="material-symbols-outlined text-slate-400 text-lg">workspace_premium</span> Upgrade Plan
              </button>
              <div className="h-px w-full bg-slate-100 dark:bg-slate-800 my-2" />
              <button className="flex w-full items-center gap-3 px-3 py-2 hover:bg-red-500/10 text-red-500 rounded-xl text-sm font-bold transition-colors">
                <span className="material-symbols-outlined text-lg">logout</span> Sign Out
              </button>
            </div>
          )}
        </div>

      </div>

      {/* --- Global Settings Modal --- */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">settings</span> Settings
              </h2>
              <button onClick={() => setShowSettings(false)} className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <div className="p-6 flex flex-col gap-6">
              
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider">Appearance</h3>
                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex flex-col">
                    <span className="font-bold">Dark Mode</span>
                    <span className="text-xs text-slate-500">Toggle dark UI theme</span>
                  </div>
                  <div className="w-11 h-6 rounded-full bg-primary relative cursor-pointer">
                    <div className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider">Integrations</h3>
                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex flex-col">
                    <span className="font-bold flex items-center gap-2"><span className="material-symbols-outlined text-sky-500 text-sm">send</span> Telegram Bot</span>
                    <span className="text-xs text-slate-500">Sync messages via n8n</span>
                  </div>
                  <button className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition">Configure</button>
                </div>
              </div>

            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <button onClick={() => setShowSettings(false)} className="px-5 py-2 rounded-xl text-sm font-bold bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Cancel</button>
              <button onClick={() => setShowSettings(false)} className="px-5 py-2 rounded-xl text-sm font-bold bg-primary text-white shadow-lg shadow-primary/25 hover:scale-105 transition-all">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'demo_user' && password === 'demo_password') {
      onLogin();
    } else {
      setError('Invalid hackathon credentials');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark p-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-primary/20 bg-white dark:bg-slate-900 shadow-2xl p-8">
        <div className="flex justify-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/30">
            <span className="material-symbols-outlined text-3xl">auto_awesome</span>
          </div>
        </div>
        <h2 className="text-2xl font-extrabold text-center mb-2">Welcome to CampusFlow</h2>
        <p className="text-slate-500 text-center mb-8 text-sm">Sign in to view the Codestorm submission demo.</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Username</label>
            <input 
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
              placeholder="demo_user"
              value={username} onChange={e => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Password</label>
            <input 
              type="password"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
              placeholder="demo_password"
              value={password} onChange={e => setPassword(e.target.value)}
            />
          </div>
          
          {error && <p className="text-red-500 text-xs font-bold text-center mt-2">{error}</p>}
          
          <button type="submit" className="w-full mt-4 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all relative overflow-hidden">
            <span className="relative z-10">Access Demo</span>
          </button>
        </form>

        <div className="mt-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
          <p className="text-xs text-amber-700 dark:text-amber-500 font-medium">
            <strong>Judges Note:</strong> Use demo credentials:<br/>
            Username: <code className="font-bold border border-amber-500/30 px-1 rounded mx-1">demo_user</code><br/>
            Password: <code className="font-bold border border-amber-500/30 px-1 rounded mx-1 mt-1 inline-block">demo_password</code>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) return <Login onLogin={() => setIsAuthenticated(true)} />;

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
            <Routes>
              <Route path="/"            element={<Dashboard />} />
              <Route path="/calendar"    element={<Calendar />} />
              <Route path="/tasks"       element={<Tasks />} />
              <Route path="/ai-insights" element={<AIInsights />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
