import React, { useState } from 'react';
import { useGameData } from '../contexts/GameContext';
import { Plus, Trash2, Edit } from 'lucide-react';

const TeamsPage = () => {
  const { teams, addTeam, updateTeam, removeTeam } = useGameData();
  const [newTeamName, setNewTeamName] = useState('');
  const [newRoom, setNewRoom] = useState(1);

  const handleAdd = (e) => {
    e.preventDefault();
    if (newTeamName.trim() === '') return;
    addTeam(newTeamName, parseInt(newRoom));
    setNewTeamName('');
  };

  const statusColors = {
    'Playing': 'bg-blue-900 text-neonBlue border-neonBlue',
    'Shortlisted': 'bg-purple-900 text-neonPurple border-neonPurple',
    'Final': 'bg-pink-900 text-pink-400 border-pink-500',
    'Eliminated': 'bg-gray-800 text-gray-400 border-gray-600',
    'Finished': 'bg-green-900 text-neonGreen border-neonGreen',
  };

  return (
    <div className="text-white">
      <h1 className="text-3xl font-cinematic text-neonBlue mb-8 drop-shadow-[0_0_10px_rgba(0,243,255,0.8)]">TEAMS MANAGEMENT</h1>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Add Team Form */}
        <div className="glass-panel p-6 xl:col-span-1 h-fit">
          <h2 className="text-xl font-bold font-body border-b border-gray-700 pb-2 mb-4">Add New Team</h2>
          <form onSubmit={handleAdd} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Team Name</label>
              <input
                type="text"
                value={newTeamName}
                onChange={e => setNewTeamName(e.target.value)}
                className="w-full bg-black border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-neonBlue focus:shadow-glow-blue"
                placeholder="E.g. The Hellfire Club"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Assign Room</label>
              <select
                value={newRoom}
                onChange={e => setNewRoom(e.target.value)}
                className="w-full bg-black border border-gray-700 rounded p-2 text-white focus:outline-none focus:border-neonBlue"
              >
                <option value={1}>Room 1</option>
                <option value={2}>Room 2</option>
                <option value={3}>Room 3</option>
              </select>
            </div>
            <button type="submit" className="mt-2 bg-neonBlue text-black font-bold py-2 px-4 rounded hover:bg-cyan-400 shadow-glow-blue flex justify-center items-center gap-2">
              <Plus size={18} /> Add Team
            </button>
          </form>
        </div>

        {/* Existing Teams List */}
        <div className="glass-panel p-6 xl:col-span-2">
          <h2 className="text-xl font-bold font-body border-b border-gray-700 pb-2 mb-4">Active Teams ({teams.length})</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-sm uppercase tracking-wider">
                  <th className="pb-3 pl-2">Team Name</th>
                  <th className="pb-3">Room</th>
                  <th className="pb-3">Level</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teams.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-500 italic">No teams registered yet.</td>
                  </tr>
                ) : (
                  teams.map(team => (
                    <tr key={team.team_id} className="border-b border-gray-800 hover:bg-gray-900 transition-colors">
                      <td className="py-3 pl-2 font-bold">{team.team_name}</td>
                      <td className="py-3">Room {team.room_number}</td>
                      <td className="py-3 font-digital text-xl text-neonOrange">LVL {team.current_level}</td>
                      <td className="py-3">
                        <select 
                          value={team.team_status}
                          onChange={(e) => updateTeam(team.team_id, { team_status: e.target.value })}
                          className={`text-xs font-bold px-2 py-1 rounded border appearance-none outline-none ${statusColors[team.team_status]}`}
                        >
                          <option value="Playing">Playing</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Final">Final</option>
                          <option value="Finished">Finished</option>
                          <option value="Eliminated">Eliminated</option>
                        </select>
                      </td>
                      <td className="py-3 text-right pr-2">
                        <button 
                          onClick={() => {
                            if(window.confirm('Delete this team entirely?')) removeTeam(team.team_id);
                          }}
                          className="text-gray-500 hover:text-red-500 transition-colors p-1"
                          title="Remove Team"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TeamsPage;
