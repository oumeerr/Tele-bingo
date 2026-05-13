
import React, { useState, useEffect } from 'react';
import { View, Language, User } from './types';
import { TRANSLATIONS } from './constants';
import Sidebar from './components/Sidebar';
import WalletView from './components/WalletView';
import HomeView from './components/HomeView';
import LeaderboardView from './components/LeaderboardView';
import HistoryView from './components/HistoryView';
import ProfileView from './components/ProfileView';
import HowToPlayView from './components/HowToPlayView';
import BettingListView from './components/BettingListView';
import CardSelectionView from './components/CardSelectionView';
import GameView from './components/GameView';
import PromoGenerator from './components/PromoGenerator';
import SettingsView from './components/SettingsView';
import AllCardsView from './components/AllCardsView';
import PaymentProofView from './components/PaymentProofView';
import LoginView from './components/LoginView';

const LOCAL_STORAGE_KEYS = {
  USER: 'hb_user',
  AUTH: 'hb_authenticated',
};

const INITIAL_ARENA_STATE = { 
  status: 'waiting', 
  countdown_end: null, 
  players: 0 
};

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH) === 'true';
  });
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
    if (saved) return JSON.parse(saved);
    return {
      id: 'guest',
      username: 'Guest_Player',
      mobile: 'N/A',
      balance: 15,
      referrals: 0,
      wins: 0,
      photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest',
    };
  });

  // Referral Detection
  useEffect(() => {
    if (!isAuthenticated) {
      const urlParams = new URLSearchParams(window.location.search);
      const refCode = urlParams.get('ref');
      if (refCode) {
        localStorage.setItem('hb_referral_code', refCode);
      }
    }
  }, [isAuthenticated]);
  const [viewStack, setViewStack] = useState<View[]>(['home']);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [lang, setLang] = useState<Language>(Language.ENGLISH);
  const [currentBet, setCurrentBet] = useState<number>(50);
  const [selectedCardIds, setSelectedCardIds] = useState<number[]>([]);
  const [gameMode, setGameMode] = useState<'classic' | 'mini'>('classic');
  const [isGameActive, setIsGameActive] = useState(false);
  const [matchStartTime, setMatchStartTime] = useState<number | null>(null);
  const [arenaState, setArenaState] = useState<{ status: string; countdown_end: string | null; players: number }>(INITIAL_ARENA_STATE);
  const [hasJoinedLobby, setHasJoinedLobby] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));
    localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH, isAuthenticated.toString());
    
    // Notify Telegram that the app is ready
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
    }
  }, [user, isAuthenticated]);

  // Splash Delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Local Arena Mock Logic
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(() => {
      setArenaState(prev => {
        // Simple logic: if players >= 2, start countdown
        if (prev.status === 'waiting' && prev.players >= 2) {
          const end = new Date(Date.now() + 10000).toISOString();
          return { ...prev, status: 'countdown', countdown_end: end };
        }
        
        if (prev.status === 'countdown') {
          const end = new Date(prev.countdown_end!).getTime();
          if (Date.now() >= end) {
            return { ...prev, status: 'playing', countdown_end: null };
          }
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Handle Match Starting
  useEffect(() => {
    if (arenaState.status === 'playing' && hasJoinedLobby && !isGameActive) {
      setIsGameActive(true);
      setMatchStartTime(Date.now());
      navigateTo('game', true);
    }
    
    if (arenaState.status === 'playing' && !hasJoinedLobby && isGameActive === false) {
       const timer = setTimeout(() => {
         setArenaState(INITIAL_ARENA_STATE);
       }, 5000);
       return () => clearTimeout(timer);
    }
  }, [arenaState.status, hasJoinedLobby, isGameActive]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-hb-bg overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-900/10 via-transparent to-transparent opacity-50"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-32 h-32 bg-hb-surface rounded-[2.5rem] p-4 shadow-2xl border border-hb-border/50 animate-bounce-slow flex items-center justify-center relative group">
             <div className="absolute inset-0 bg-green-500/10 rounded-[2.5rem] blur-xl group-hover:blur-2xl transition-all"></div>
             <img src="logo.png" className="w-24 h-24 object-contain relative z-10" onError={(e) => {
               const target = e.target as HTMLImageElement;
               target.style.display = 'none';
               target.parentElement!.innerHTML = '<span class="text-7xl font-black text-hb-gold italic">H</span>';
             }} />
          </div>
          <div className="mt-8 flex flex-col items-center gap-3">
             <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase animate-pulse">Hulumbingo</h1>
             <div className="flex gap-1.5 item-center">
                <div className="w-1.5 h-1.5 rounded-full bg-hb-gold animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 rounded-full bg-hb-gold animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 rounded-full bg-hb-gold animate-bounce" style={{ animationDelay: '300ms' }}></div>
             </div>
          </div>
          <p className="mt-6 text-[10px] font-black text-hb-muted uppercase tracking-[0.4em] opacity-40">Quantum Gateway Linking...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView onLogin={(data) => {
      const refCode = localStorage.getItem('hb_referral_code');
      const bonus = refCode ? 5 : 0;
      
      setIsAuthenticated(true);
      setUser(prev => ({
        ...prev, 
        username: data?.username || 'BingoUser', 
        mobile: data?.phoneNumber || prev.mobile,
        balance: 15 + bonus // Base 15 + 5 for referral
      }));

      // Add to bonus history
      const currentHistory = JSON.parse(localStorage.getItem('hb_bonus_history') || '[]');
      const regBonus = {
        id: 'reg_' + Date.now(),
        type: 'bonus',
        amount: 15,
        status: 'completed',
        created_at: new Date().toISOString(),
        metadata: { reason: 'Registration Bonus' }
      };
      const finalHistory = [regBonus, ...currentHistory];
      
      if (bonus > 0) {
        finalHistory.unshift({
          id: 'ref_' + Date.now(),
          type: 'bonus',
          amount: 5,
          status: 'completed',
          created_at: new Date().toISOString(),
          metadata: { reason: `Referral Bonus (Ref: ${refCode})` }
        });
      }
      localStorage.setItem('hb_bonus_history', JSON.stringify(finalHistory));
      
      localStorage.removeItem('hb_referral_code');
    }} />;
  }

  const currentView = viewStack[viewStack.length - 1];
  const t = (key: string) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key;

  const navigateTo = (view: View, reset = false) => {
    if (view === 'betting-list' || view === 'card-selection') {
      if (arenaState.status === 'playing') {
        alert("A match is currently in progress. Please wait for the next round!");
        return;
      }
      if (arenaState.status === 'countdown' && view === 'betting-list') {
         // Allow joining during countdown
      }
    }
    
    if (reset) {
      if (view === 'home') {
        setViewStack(['home']);
      } else {
        setViewStack(['home', view]);
      }
    } else {
      setViewStack(prev => [...prev, view]);
    }
    setSidebarOpen(false);
  };

  const goBack = () => {
    if (viewStack.length > 1) {
      setViewStack(prev => prev.slice(0, -1));
    }
  };

  const handleStartGame = (cardIds: number[]) => {
    setHasJoinedLobby(true);
    setSelectedCardIds(cardIds);
    setArenaState(prev => ({ ...prev, players: prev.players + 1 }));
    if (arenaState.players + 1 < 2) {
       // Mock another player joining after 3 seconds
       setTimeout(() => {
          setArenaState(prev => ({ ...prev, players: prev.players + 1 }));
       }, 3000);
    }
    navigateTo('home', true);
  };

  const handleQuickPlayFromGallery = (cardId: number, mode: 'classic' | 'mini') => {
    setGameMode(mode);
    setCurrentBet(50);
    setSelectedCardIds([cardId]);
    navigateTo('betting-list');
  };

  return (
    <div className="flex flex-col h-screen w-full bg-hb-bg text-white shadow-2xl overflow-hidden relative font-sans">
      {/* Header Container */}
      <div className="z-30 shadow-md sticky top-0 w-full bg-hb-blueblack border-b border-hb-border/50">
        <div className="max-w-md mx-auto">
          <header className="px-5 py-4 flex items-center justify-between h-[70px]">
            <div className="w-12 flex justify-start">
              {viewStack.length > 1 ? (
                <button onClick={goBack} className="touch-target -ml-2 text-2xl text-hb-muted active:scale-90 transition-transform hover:text-hb-gold">
                  <i className="fas fa-arrow-left"></i>
                </button>
              ) : (
                <button onClick={() => setSidebarOpen(true)} className="touch-target -ml-2 text-2xl text-hb-muted active:scale-90 transition-transform hover:text-white">
                  <i className="fas fa-bars"></i>
                </button>
              )}
            </div>
            
            <div className="flex flex-col items-center gap-1.5 flex-1">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-hb-surface border border-hb-border flex items-center justify-center overflow-hidden">
                   <img src="logo.png" className="w-4 h-4 object-contain" onError={(e) => {
                     (e.target as HTMLImageElement).style.display = 'none';
                     (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-[10px] font-black text-hb-gold italic">H</span>';
                   }} />
                </div>
                <span className="font-black text-xl italic tracking-tighter text-white">HULUMBINGO</span>
              </div>
              <div className="bg-hb-gold text-hb-blueblack px-3 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter shadow-sm">
                10k Weekly Prize Pool
              </div>
            </div>

            <div className="flex flex-col items-end w-12 min-w-[85px]">
              <span className="text-[9px] text-hb-muted uppercase font-bold tracking-widest mb-1">Balance</span>
              <div className="flex items-center gap-1 bg-hb-surface px-3 py-1.5 rounded-xl border border-hb-border">
                <span className="font-bold text-hb-gold text-[14px] drop-shadow-sm">{user.balance.toLocaleString()}</span>
              </div>
            </div>
          </header>
        </div>

        {/* Persistent Active Match Banner */}
        {isGameActive && currentView !== 'game' && (
          <button 
            onClick={() => navigateTo('game', true)}
            className="w-full bg-hb-surface border-y border-hb-gold/30 text-hb-gold py-2.5 px-5 flex items-center justify-between animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-hb-gold animate-ping"></div>
              <span className="text-[11px] font-black uppercase tracking-widest">Live Game Active</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase opacity-80">Re-enter</span>
              <i className="fas fa-external-link-alt text-[10px]"></i>
            </div>
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-28 w-full bg-transparent">
        <div className="max-w-md mx-auto min-h-full">
          {currentView === 'home' && <HomeView onQuickPlay={() => navigateTo('betting-list')} arenaState={arenaState} />}
          {currentView === 'wallet' && <WalletView user={user} setUser={setUser} />}
          {currentView === 'leaderboard' && <LeaderboardView onPlay={() => navigateTo('betting-list')} />}
          {currentView === 'history' && <HistoryView />}
          {currentView === 'profile' && <ProfileView user={user} setUser={setUser} />}
          {currentView === 'how-to-play' && <HowToPlayView />}
          {currentView === 'all-cards' && <AllCardsView onQuickPlay={handleQuickPlayFromGallery} />}
          {currentView === 'payment-proof' && <PaymentProofView />}
          {currentView === 'betting-list' && (
            <BettingListView 
              mode={gameMode}
              onModeChange={setGameMode}
              onSelectBet={(amt) => {
                setCurrentBet(amt);
                navigateTo('card-selection');
              }} 
            />
          )}
          {currentView === 'card-selection' && (
            <CardSelectionView 
              betAmount={currentBet}
              mode={gameMode}
              user={user}
              setUser={setUser}
              onSelectCard={handleStartGame} 
            />
          )}
          {currentView === 'game' && selectedCardIds.length > 0 && matchStartTime !== null && (
            <GameView 
              cardIds={selectedCardIds} 
              betAmount={currentBet}
              mode={gameMode}
              user={user} 
              setUser={setUser}
              matchStartTime={matchStartTime}
              onClose={() => {
                setIsGameActive(false);
                setMatchStartTime(null);
                navigateTo('home', true);
              }} 
            />
          )}
          {currentView === 'promo' && user.isAdmin && <PromoGenerator />}
          {currentView === 'promo' && !user.isAdmin && <HomeView onQuickPlay={() => navigateTo('betting-list')} />}
          {currentView === 'settings' && <SettingsView />}
        </div>
      </main>

      {/* Footer Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 w-full bg-hb-blueblack/95 backdrop-blur-xl border-t border-hb-border z-40 pb-safe shadow-2xl">
        <div className="max-w-md mx-auto flex items-center justify-around px-2 py-4">
          <FooterItem icon="fa-wallet" label={t('wallet')} active={currentView === 'wallet'} onClick={() => navigateTo('wallet', true)} />
          <FooterItem icon="fa-trophy" label={t('leaderboard')} active={currentView === 'leaderboard'} onClick={() => navigateTo('leaderboard', true)} />
          
          <div className="relative -mt-14">
            <button 
              onClick={() => {
                if (isGameActive) {
                  navigateTo('game', true);
                } else {
                  navigateTo('betting-list', true);
                }
              }}
              className={`w-[56px] h-[56px] bg-hb-gold rounded-full border-[4px] border-hb-bg shadow-[0_0_20px_rgba(255,215,0,0.3)] flex items-center justify-center text-hb-blueblack text-2xl transition-all active:scale-90 hover:brightness-110 ${currentView === 'betting-list' || isGameActive ? 'ring-4 ring-hb-gold/20' : ''}`}
            >
              <i className={`fas ${isGameActive ? 'fa-external-link-alt' : 'fa-play'} ${!isGameActive && 'ml-1'}`}></i>
            </button>
          </div>

          <FooterItem icon="fa-history" label={t('history')} active={currentView === 'history'} onClick={() => navigateTo('history', true)} />
          <FooterItem icon="fa-question-circle" label={t('howToPlay')} active={currentView === 'how-to-play'} onClick={() => navigateTo('how-to-play', true)} />
        </div>
      </nav>

      {isSidebarOpen && (
        <Sidebar 
          currentLang={lang} 
          onLangChange={setLang} 
          onClose={() => setSidebarOpen(false)} 
          onNavigate={(v) => navigateTo(v, true)}
          user={user}
        />
      )}

      <style>{`
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom, 0);
        }
      `}</style>
    </div>
  );
};

const FooterItem: React.FC<{ icon: string; label: string; active: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center flex-1 transition-all ${active ? `text-hb-gold scale-105` : 'text-hb-muted hover:text-white'}`}>
    <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-0.5 transition-all ${active ? 'bg-hb-gold/10' : 'bg-transparent'}`}>
      <i className={`fas ${icon} text-[20px]`}></i>
    </div>
    <span className="text-[9px] font-bold uppercase tracking-tight">{label}</span>
  </button>
);

export default App;
