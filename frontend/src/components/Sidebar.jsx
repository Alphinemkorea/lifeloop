import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, Sparkles, TreePine, BarChart3, User, Shield, BookOpen } from 'lucide-react';

export const Sidebar = () => {
  const navItems = [
    { label: 'Feed', path: '/', icon: Home },
    { label: 'Spaces', path: '/spaces', icon: Users },
    { label: 'Moments', path: '/moments', icon: Sparkles },
    { label: 'Weekly Tree', path: '/weekly-tree', icon: TreePine },
    { label: 'Scrapbook', path: '/scrapbook', icon: BookOpen },
    { label: 'Analytics', path: '/stats', icon: BarChart3 },
    { label: 'My Profile', path: '/profile', icon: User },
    { label: 'Admin', path: '/admin', icon: Shield }
  ];

  return (
    <>
      {/* Desktop Sidebar (md and up) */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-slate-200 bg-white sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto self-start p-4 space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3">
            Navigation
          </span>
          <nav className="space-y-1 pt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition ${
                      isActive
                        ? 'bg-blue-900 text-white shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-3 bg-blue-50/50 border border-blue-100 rounded-2xl text-slate-700 text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-blue-950 text-[11px]">
            <TreePine className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>LifeLoop Tree</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-normal">
            Shared memories nourish your weekly memory tree visualizer.
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Navbar (Phone / Small screen) - Icons Only */}
      <nav className="flex md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-1 py-2 justify-around items-center shadow-lg shadow-slate-900/10">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              title={item.label}
              className={({ isActive }) =>
                `p-2.5 rounded-xl transition-all flex items-center justify-center relative min-w-[40px] min-h-[40px] ${
                  isActive
                    ? 'bg-blue-900 text-white shadow-md scale-105'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
            </NavLink>
          );
        })}
      </nav>
    </>
  );
};

