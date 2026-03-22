import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGameData } from '../contexts/GameContext';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

const ModPage = () => {
  const { roomNumber } = useParams();
  const { teams, checkAnswer, passLevel } = useGameData();
  const [answers, setAnswers] = useState({});
  const [messages, setMessages] = useState({});

  const roomTeams = teams.filter(t => t.room_number === parseInt(roomNumber) && t.team_status === 'Playing');

  const handleAnswerSubmit = (teamId, level) => {
    const answer = answers[teamId] || '';
    if (!answer) return;

    const isCorrect = checkAnswer(teamId, level, answer);
    setMessages(prev => ({
      ...prev,
      [teamId]: isCorrect ? 'Correct! Moving to next level.' : 'Wrong answer!'
    }));
    setAnswers(prev => ({ ...prev, [teamId]: '' }));

    setTimeout(() => {
      setMessages(prev => ({ ...prev, [teamId]: null }));
    }, 3000);
  };

  const handlePass = (teamId, level) => {
    if (window.confirm('Are you sure you want to pass this level manually?')) {
      passLevel(teamId, level);
      setMessages(prev => ({ ...prev, [teamId]: 'Level passed manually.' }));
      setTimeout(() => setMessages(prev => ({ ...prev, [teamId]: null })), 3000);
    }
  };

  return (
    <div className="text-white">
      <h1 className="text-3xl font-cinematic text-neonBlue mb-8 drop-shadow-[0_0_10px_rgba(0,243,255,0.8)]">
        MODERATOR INTERFACE - ROOM {roomNumber}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {roomTeams.length === 0 ? (
          <div className="col-span-full p-8 text-center glass-panel text-gray-400">
            No active teams in this room.
          </div>
        ) : (
          roomTeams.map(team => (
            <div key={team.team_id} className="glass-panel p-6 flex flex-col gap-4 relative overflow-hidden">
              <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                <h3 className="text-xl font-bold text-white">{team.team_name}</h3>
                <span className="bg-gray-800 text-neonOrange px-3 py-1 font-digital text-xl rounded">
                  Level {team.current_level}
                </span>
              </div>

              {team.current_level <= 3 ? (
                <>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Submit Answer</label>
                    <input
                      type="text"
                      value={answers[team.team_id] || ''}
                      onChange={e => setAnswers({ ...answers, [team.team_id]: e.target.value })}
                      className="w-full bg-black border border-gray-700 rounded p-3 text-white focus:outline-none focus:border-neonBlue"
                      placeholder="Enter answer..."
                    />
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleAnswerSubmit(team.team_id, team.current_level)}
                      className="flex-1 bg-neonBlue text-black font-bold py-2 rounded hover:bg-cyan-400 flex items-center justify-center gap-2 transition-transform active:scale-95"
                    >
                      <CheckCircle2 size={18} /> Submit
                    </button>
                    <button 
                      onClick={() => handlePass(team.team_id, team.current_level)}
                      className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white font-bold py-2 rounded flex items-center justify-center gap-2 transition-transform active:scale-95"
                    >
                      <ArrowRight size={18} /> Pass
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-4 text-center text-neonGreen font-bold flex flex-col items-center gap-2">
                  <span className="text-2xl font-cinematic uppercase tracking-widest">Completed Level 3</span>
                  <span className="text-sm text-gray-400">Waiting for Admin Shortlist</span>
                </div>
              )}

              {/* Status Message */}
              {messages[team.team_id] && (
                <div className={`mt-2 text-center p-2 rounded text-sm font-bold ${
                  messages[team.team_id].includes('Correct') || messages[team.team_id].includes('passed')
                    ? 'bg-green-900/50 text-neonGreen border border-green-800'
                    : 'bg-red-900/50 text-neonRed border border-red-800'
                }`}>
                  {messages[team.team_id]}
                </div>
              )}

            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ModPage;
