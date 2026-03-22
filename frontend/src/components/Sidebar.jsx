import React from 'react';
import { NavLink } from 'react-router-dom';
import { Settings, Users, Clock, MonitorPlay, Flag, Trophy } from 'lucide-react';

const Sidebar = () => {
  const links = [
    { name: 'Admin Controls', path: '/admin', icon: <Settings size={20} /> },
    { name: 'Teams', path: '/teams', icon: <Users size={20} /> },
    { name: 'Global Timer', path: '/timer', icon: <Clock size={20} /> },
    { name: 'Room 1 Mod', path: '/mod/1', icon: <MonitorPlay size={20} /> },
    { name: 'Room 2 Mod', path: '/mod/2', icon: <MonitorPlay size={20} /> },
    { name: 'Room 3 Mod', path: '/mod/3', icon: <MonitorPlay size={20} /> },
    { name: 'Final Room', path: '/final', icon: <Flag size={20} /> },
    { name: 'Live Leaderboard', path: '/leaderboard', icon: <Trophy size={20} /> },
    { name: 'Declare Winners', path: '/winner', icon: <Trophy size={20} /> },
  ];

  return (
    <div className="w-64 h-screen bg-black border-r border-gray-800 flex flex-col pt-6 font-body shrink-0">
      <div className="px-6 mb-8 text-center">
        <h1 className="text-2xl font-cinematic text-glow-red tracking-wider text-neonRed">
          GAME MOD SYSTEM
        </h1>
      </div>
      <nav className="flex-1 flex flex-col gap-2 px-4">
        {links.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                isActive
                  ? 'bg-gray-900 border border-neonRed text-neonRed shadow-glow-red'
                  : 'text-gray-400 hover:bg-gray-900 hover:text-white border border-transparent'
              }`
            }
            target={link.name === 'Live Leaderboard' ? '_blank' : '_self'}
          >
            {link.icon}
            <span className="font-medium tracking-wide">{link.name}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 text-xs text-center text-gray-600 font-digital tracking-widest">
        SYSTEM VER 1.0.0
      </div>
    </div>
  );
};

export default Sidebar;
