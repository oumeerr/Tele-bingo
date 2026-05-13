
import React, { useState } from 'react';

declare global {
  interface Window {
    Telegram?: any;
  }
}

interface LoginViewProps {
  onLogin: (data?: { phoneNumber?: string; username?: string }) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  
  const handleTelegramRegistration = () => {
    setLoading(true);
    
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.expand();

      // Check if we already have user info from initData
      const tgUser = tg.initDataUnsafe?.user;

      // Method requestContact is supported in version 6.9+
      if (tg.isVersionAtLeast && tg.isVersionAtLeast('6.9') && typeof tg.requestContact === 'function') {
        try {
          tg.requestContact((success: boolean) => {
            if (success) {
              onLogin({
                username: tgUser?.username || tgUser?.first_name || 'TG_Player',
              });
            } else {
              setLoading(false);
              alert("Phone number sharing is required for registration.");
            }
          });
        } catch (e) {
          console.error("Telegram requestContact error:", e);
          // Fallback if the method fails despite version check
          onLogin({
            username: tgUser?.username || tgUser?.first_name || 'TG_Player',
          });
        }
      } else {
        // Fallback for older Telegram clients (e.g. version 6.0)
        console.warn("requestContact not supported in this version. Using fallback.");
        setTimeout(() => {
          onLogin({
            username: tgUser?.username || tgUser?.first_name || 'TG_Player',
          });
        }, 500);
      }
    } else {
      // Mock for non-telegram environments
      setTimeout(() => {
        setLoading(false);
        onLogin({
          username: 'WebPlayer_' + Math.floor(Math.random() * 1000),
          phoneNumber: '+251911223344'
        });
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-hb-bg relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[60%] bg-gradient-to-b from-hb-emerald/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>
      
      <div className="z-10 flex flex-col items-center text-center w-full max-w-sm">
        
        <div className="w-28 h-28 bg-hb-surface rounded-[2.5rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] flex items-center justify-center mb-6 relative overflow-hidden border border-hb-border">
           <img src="logo.png" className="w-20 h-20 object-contain relative z-10" onError={(e) => {
             const target = e.target as HTMLImageElement;
             target.style.display = 'none';
             target.parentElement!.innerHTML = `
               <div class="flex flex-col items-center">
                 <span class="text-7xl font-black text-white italic drop-shadow-md">H</span>
                 <div class="absolute top-4 right-4 w-4 h-4 bg-yellow-300 rounded-full shadow-lg"></div>
                 <div class="absolute bottom-6 left-6 w-3 h-3 bg-white/50 rounded-full"></div>
               </div>
             `;
           }}/>
           <div className="absolute inset-0 bg-gradient-to-tr from-hb-gold/5 to-transparent"></div>
        </div>

        <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-2">
          Hulumbingo
        </h1>
        <p className="text-hb-muted text-[12px] font-bold uppercase tracking-[0.3em] mb-8 opacity-60">
          Ethiopia's #1 Bingo Arena
        </p>

        {/* Registration Section */}
        <div className="w-full bg-hb-surface border border-hb-border p-8 rounded-[32px] shadow-2xl mb-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#22C55E]/5 blur-3xl -mr-16 -mt-16 rounded-full"></div>
          
          <div className="relative z-10 space-y-6">
            <div className="text-left space-y-2 mb-4">
              <h3 className="text-white font-black text-lg italic">JOIN THE ARENA</h3>
              <p className="text-hb-muted text-xs leading-relaxed">Share your Telegram contact to verify your identity and secure your rewards.</p>
            </div>

            <button 
              onClick={handleTelegramRegistration}
              disabled={loading}
              className="w-full h-16 bg-[#24A1DE] text-white font-black text-sm uppercase tracking-[0.1em] rounded-2xl shadow-[0_8px_25px_rgba(36,161,222,0.3)] active:scale-[0.97] transition-all flex items-center justify-center gap-4 hover:brightness-110 disabled:opacity-70 disabled:cursor-wait"
            >
               <i className="fab fa-telegram-plane text-2xl"></i>
               {loading ? 'Verifying...' : 'Share Contact to Enter'}
            </button>
          </div>
        </div>

        <p className="max-w-[240px] text-[10px] text-hb-muted/40 font-bold uppercase tracking-[0.2em] leading-loose">
          By registering, you confirm you are 18+ and agree to our <span className="text-hb-muted/60 underline">Terms of Service</span>.
        </p>
      </div>
    </div>
  );
};

export default LoginView;
