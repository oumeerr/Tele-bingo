
import React, { useState } from 'react';
import { User } from '../types';

interface ProfileViewProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, setUser }) => {
  const [editing, setEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(user.username);
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    if (!newUsername.trim()) return;
    if (newUsername === user.username) {
      setEditing(false);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setUser(prev => ({ ...prev, username: newUsername }));
      setEditing(false);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="p-4">
      <div className="flex flex-col items-center text-center py-8">
        <div className="relative mb-4">
          <img 
            src={user.photo} 
            alt="Profile" 
            className="w-24 h-24 rounded-full border-4 border-white shadow-xl"
          />
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-hb-gold text-hb-blueblack rounded-full flex items-center justify-center shadow-lg">
            <i className="fas fa-camera text-xs"></i>
          </button>
        </div>
        
        {editing ? (
          <div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in duration-200">
            <input 
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="bg-white border-2 border-hb-gold px-4 py-2 rounded-xl text-center font-bold outline-none text-hb-blueblack"
              autoFocus
            />
            <div className="flex gap-2">
               <button onClick={handleSave} disabled={loading} className="text-xs font-bold text-green-600 px-3 py-1 bg-green-50 rounded-lg">
                 {loading ? 'SAVING...' : 'SAVE'}
               </button>
               <button onClick={() => setEditing(false)} disabled={loading} className="text-xs font-bold text-gray-400 px-3 py-1 bg-gray-50 rounded-lg">CANCEL</button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-hb-gold">{user.username}</h2>
            <button onClick={() => setEditing(true)} className="text-gray-300 hover:text-gray-500 transition-colors">
              <i className="fas fa-edit text-sm"></i>
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3 mb-6">
        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 w-full flex justify-between items-center">
          <span className="text-[10px] font-bold text-gray-400 uppercase">User ID</span>
          <span className="text-xs font-black text-gray-700 font-mono select-all">{user.id.split('-')[0]}...</span>
        </div>
        <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 w-full flex justify-between items-center">
          <span className="text-[10px] font-bold text-gray-400 uppercase">Phone</span>
          <span className="text-xs font-black text-gray-700 font-mono italic">{user.mobile || 'Not Linked'}</span>
        </div>
        <div className="bg-hb-surface p-3 rounded-xl border border-hb-border w-full flex justify-between items-center">
          <span className="text-[10px] font-bold text-hb-muted uppercase">Bonus Funds</span>
          <span className="text-xs font-black text-hb-gold">{user.bonus_balance || 0} ETB</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
          <span className="text-[10px] font-black text-gray-400 uppercase mb-1">Referrals</span>
          <span className="text-2xl font-black text-hb-gold/60">{user.referrals}</span>
        </div>
        <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
          <span className="text-[10px] font-black text-gray-400 uppercase mb-1">Total Wins</span>
          <span className="text-2xl font-black text-hb-gold">{user.wins}</span>
        </div>
      </div>

      <div className="bg-[#121212] p-6 rounded-3xl text-white shadow-xl relative overflow-hidden border border-hb-border">
        <h3 className="text-lg font-black mb-1 italic relative z-10 text-hb-gold">REFER & EARN</h3>
        <p className="text-[10px] opacity-60 mb-6 relative z-10 font-bold uppercase tracking-widest">Invite friends and get 10 ETB per head!</p>
        <div className="bg-hb-surface p-4 rounded-2xl flex items-center justify-between border border-hb-border relative z-10 mb-2">
           <span className="text-[9px] font-mono truncate mr-2 font-black text-hb-muted">{window.location.origin}/?ref={user.username}</span>
           <button 
             onClick={() => {
               navigator.clipboard.writeText(`${window.location.origin}/?ref=${user.username}`);
               alert("Referral link copied!");
             }}
             className="bg-hb-gold text-hb-blueblack px-3 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap"
           >
             COPY LINK
           </button>
        </div>
        <p className="text-[8px] text-center text-hb-muted italic">Referee gets 15 ETB bonus instantly</p>
        <i className="fas fa-link absolute -right-4 -bottom-4 text-hb-gold/5 text-7xl rotate-12"></i>
      </div>
    </div>
  );
};

export default ProfileView;
