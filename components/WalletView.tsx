
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { ETHIOPIAN_BANKS } from '../constants';
import { APP_CONFIG } from '../config';

interface WalletViewProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
}

type PaymentMethod = 'telebirr' | 'cbe' | 'ebirr' | 'kacha';

interface MethodButtonProps {
  id: PaymentMethod;
  selected: boolean;
  onClick: (id: PaymentMethod) => void;
  logoUrl: string;
}

// Hosted logos for Ethiopian Payment Providers (using high-availability public URLs)
const LOGOS = {
  telebirr: "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/4a/6c/2e/4a6c2e37-122e-130f-2169-2810c9d94944/AppIcon-0-0-1x_U007emarketing-0-5-0-85-220.png/512x512bb.jpg",
  cbe: "https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/f2/86/81/f286810c-300c-7703-e820-221614972e25/AppIcon-0-0-1x_U007emarketing-0-0-0-7-0-0-sRGB-0-0-0-GLES2_U002c0-512MB-85-220-0-0.png/512x512bb.jpg",
  ebirr: "https://is1-ssl.mzstatic.com/image/thumb/Purple126/v4/7e/1c/64/7e1c641f-1339-930c-529d-473133874313/AppIcon-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg",
  kacha: "https://pbs.twimg.com/profile_images/1542866598379438081/Hj3x-k-9_400x400.jpg"
};

const DepositGuide: React.FC<{ method: PaymentMethod; numbers: string[] }> = ({ method, numbers }) => {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full bg-hb-gold/20 flex items-center justify-center text-hb-gold font-black text-xs border border-hb-gold/30">1</div>
        <p className="text-[12px] font-bold text-white uppercase tracking-wider">Choose {method.toUpperCase()} WALLET</p>
      </div>
      
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full bg-hb-gold/20 flex items-center justify-center text-hb-gold font-black text-xs border border-hb-gold/30">2</div>
        <p className="text-[12px] font-bold text-white uppercase tracking-wider">Copy Number & Name</p>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full bg-hb-gold/20 flex items-center justify-center text-hb-gold font-black text-xs border border-hb-gold/30">3</div>
        <p className="text-[12px] font-bold text-white uppercase tracking-wider">Pay in your {method} App</p>
      </div>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-full bg-hb-gold/20 flex items-center justify-center text-hb-gold font-black text-xs border border-hb-gold/30">4</div>
        <p className="text-[12px] font-bold text-white uppercase tracking-wider">Submit Ref ID & Amount</p>
      </div>
    </div>
  );
};

const MethodButton: React.FC<MethodButtonProps> = ({ 
  id, 
  selected, 
  onClick, 
  logoUrl 
}) => {
  const isSelectedStyle = selected 
    ? 'border-hb-gold ring-2 ring-hb-gold/50 bg-[#121212]' 
    : 'border-hb-border bg-[#121212] hover:border-hb-muted opacity-60 hover:opacity-100';

  return (
    <button 
      onClick={() => onClick(id)}
      className={`relative aspect-square rounded-2xl border-2 transition-all group shadow-sm active:scale-95 flex items-center justify-center p-2 overflow-hidden ${isSelectedStyle}`}
    >
      <img src={logoUrl} alt={id} className="w-full h-full object-contain rounded-xl" />
      {selected && (
        <div className="absolute top-1 right-1 w-4 h-4 bg-hb-gold rounded-full flex items-center justify-center shadow-md">
           <i className="fas fa-check text-[8px] text-hb-blueblack"></i>
        </div>
      )}
    </button>
  );
};

const WalletView: React.FC<WalletViewProps> = ({ user, setUser }) => {
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw' | 'transfer' | 'bonus'>('deposit');
  const [amount, setAmount] = useState('');
  const [bank, setBank] = useState('');
  const [refId, setRefId] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('telebirr');
  const [recipientUsername, setRecipientUsername] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [depositHistory, setDepositHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('hb_deposits');
    return saved ? JSON.parse(saved) : [];
  });
  const [withdrawHistory, setWithdrawHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('hb_withdrawals');
    return saved ? JSON.parse(saved) : [];
  });
  const [transferHistory, setTransferHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('hb_transfers');
    return saved ? JSON.parse(saved) : [];
  });
  const [bonusHistory, setBonusHistory] = useState<any[]>(() => {
    const saved = localStorage.getItem('hb_bonus_history');
    if (saved) return JSON.parse(saved);
    // Initial Registration Bonus
    return [{
      id: 'init_bonus',
      type: 'bonus',
      amount: 15,
      status: 'completed',
      created_at: new Date().toISOString(),
      metadata: { reason: 'Registration Bonus' }
    }];
  });

  useEffect(() => {
    localStorage.setItem('hb_deposits', JSON.stringify(depositHistory));
  }, [depositHistory]);
  useEffect(() => {
    localStorage.setItem('hb_withdrawals', JSON.stringify(withdrawHistory));
  }, [withdrawHistory]);
  useEffect(() => {
    localStorage.setItem('hb_transfers', JSON.stringify(transferHistory));
  }, [transferHistory]);
  useEffect(() => {
    localStorage.setItem('hb_bonus_history', JSON.stringify(bonusHistory));
  }, [bonusHistory]);

  useEffect(() => {
    setAmount('');
    setRefId('');
    setBank('');
    setRecipientUsername('');
    setAccountNumber('');
    setAccountHolder('');
  }, [activeTab]);

  const getDepositNumbers = () => {
    if (selectedMethod === 'ebirr' || selectedMethod === 'kacha') {
      return APP_CONFIG.WALLET.DEPOSIT_PHONES.MERCHANT;
    }
    return APP_CONFIG.WALLET.DEPOSIT_PHONES.STANDARD;
  };

  const handleCopy = (num: string) => {
    navigator.clipboard.writeText(num);
    alert(`Phone number ${num} copied to clipboard!`);
  };

  const isWithdrawActive = () => {
    const now = new Date();
    const hour = now.getHours();
    return hour >= APP_CONFIG.WALLET.WITHDRAWAL_START_HOUR && hour < APP_CONFIG.WALLET.WITHDRAWAL_END_HOUR;
  };

  const handleTransaction = (type: 'deposit' | 'withdraw' | 'transfer') => {
    const val = parseFloat(amount);
    if (!val || isNaN(val)) return alert("Please enter a valid amount");

    if (type === 'deposit') {
      if (val < 30) return alert("Minimum deposit is 30 ETB");
      if (!refId) return alert("Transaction Reference ID is required");
    }
    
    if (type === 'withdraw') {
      if (val < 100) return alert("Minimum withdrawal is 100 ETB");
      if (!bank || !accountNumber || !accountHolder) return alert("Please complete all bank details");
      if (user.balance < val) return alert("Insufficient balance");
    }

    if (type === 'transfer') {
      if (val < 100) return alert("Minimum transfer is 100 ETB");
      if (!recipientUsername) return alert("Recipient username required");
      if (user.balance < (val * 1.05)) return alert("Insufficient balance");
    }

    setLoading(true);

    setTimeout(() => {
      const newTx = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        amount: val,
        status: type === 'deposit' ? 'pending' : 'completed',
        created_at: new Date().toISOString(),
        recipient_username: type === 'transfer' ? recipientUsername : null,
        metadata: type === 'withdraw' ? { bank, accountNumber, accountHolder } : { method: selectedMethod, refId }
      };

      if (type === 'deposit') {
        setDepositHistory(prev => [newTx, ...prev]);
        alert("Deposit submitted for verification. It will be credited once confirmed.");
      } else if (type === 'withdraw') {
        setWithdrawHistory(prev => [newTx, ...prev]);
        setUser(prev => ({ ...prev, balance: prev.balance - val }));
        alert("Withdrawal request submitted successfully.");
      } else if (type === 'transfer') {
        const fee = val * 0.05;
        setTransferHistory(prev => [newTx, ...prev]);
        setUser(prev => ({ ...prev, balance: prev.balance - (val + fee) }));
        alert(`Transferred ${val} ETB to @${recipientUsername}`);
      }

      setAmount('');
      setRefId('');
      setRecipientUsername('');
      setAccountNumber('');
      setAccountHolder('');
      setLoading(false);
    }, 1000);
  };

  const transferValue = parseFloat(amount) || 0;
  const transferFee = transferValue * APP_CONFIG.WALLET.TRANSFER_FEE_PERCENT;
  const totalTransferDeduction = transferValue + transferFee;

  const renderHistory = (history: any[], type: string) => {
    if (history.length === 0) {
      return (
        <div className="mt-8 flex flex-col items-center justify-center py-10 opacity-30 border-2 border-dashed border-hb-border rounded-3xl">
          <i className="fas fa-history text-3xl mb-3"></i>
          <p className="text-[11px] font-bold uppercase tracking-widest">No {type} History</p>
        </div>
      );
    }

    return (
      <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-hb-gold animate-pulse"></div>
            <h3 className="text-[11px] font-black text-hb-muted uppercase tracking-[0.2em]">Recent {type}s</h3>
          </div>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-hb-border/50 to-transparent ml-4"></div>
        </div>
        <div className="space-y-3">
          {history.map((tx, idx) => {
            const isPositive = tx.type === 'deposit' || tx.type === 'bonus';
            const isNeutral = tx.type === 'transfer';
            const statusColors: any = {
              pending: 'bg-orange-500/10 text-orange-500 border-orange-500/10',
              completed: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10',
              failed: 'bg-red-500/10 text-red-500 border-red-500/10',
            };
            const statusIcons: any = {
              pending: 'fa-hourglass-half',
              completed: 'fa-check-double',
              failed: 'fa-exclamation-triangle',
            };

            return (
              <div 
                key={tx.id} 
                className="group relative overflow-hidden"
              >
                <div className="bg-[#1A1A1A] border border-hb-border/80 p-4 rounded-2xl flex items-center justify-between transition-all duration-300 hover:border-hb-gold/40 hover:bg-[#202020] active:scale-[0.99] shadow-sm">
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-[18px] shadow-sm transition-transform duration-300 group-hover:scale-110 ${
                      isPositive ? 'bg-emerald-500/10 text-emerald-500' : 
                      isNeutral ? 'bg-hb-blue/10 text-hb-blue' : 
                      'bg-red-500/10 text-red-500'
                    }`}>
                      <i className={`fas ${
                        tx.type === 'deposit' ? 'fa-arrow-trend-up' : 
                        tx.type === 'withdraw' ? 'fa-arrow-trend-down' : 
                        tx.type === 'bonus' ? 'fa-gift' :
                        'fa-right-left'
                      }`}></i>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[14px] font-bold text-white tracking-tight">
                          {tx.type === 'bonus' ? tx.metadata?.reason || 'Bonus Reward' : tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                        </span>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded-md border font-black uppercase flex items-center gap-1 leading-none ${statusColors[tx.status] || statusColors.pending}`}>
                          <i className={`fas ${statusIcons[tx.status] || statusIcons.pending} text-[7px]`}></i>
                          {tx.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-hb-muted font-medium flex items-center gap-1.5">
                        <span className="opacity-80">
                          {new Date(tx.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-hb-border"></span>
                        <span className="opacity-80">
                          {new Date(tx.created_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {tx.recipient_username && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-hb-border"></span>
                            <span className="text-hb-gold/60">@{tx.recipient_username}</span>
                          </>
                        )}
                        {tx.metadata?.method && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-hb-border"></span>
                            <span className="opacity-80">{tx.metadata.method}</span>
                          </>
                        )}
                        {tx.type === 'withdraw' && tx.metadata?.bank && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-hb-border"></span>
                            <span className="opacity-80 truncate max-w-[100px]">{tx.metadata.bank}</span>
                          </>
                        )}
                      </div>
                      {tx.type === 'withdraw' && tx.metadata?.accountNumber && (
                        <div className="text-[9px] text-hb-muted/60 mt-0.5 font-mono">
                          AC: {tx.metadata.accountNumber}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right relative z-10">
                    <div className={`text-[17px] font-black tracking-tight ${isPositive ? 'text-emerald-500' : 'text-white'}`}>
                      {isPositive ? '+' : '-'}{tx.amount.toLocaleString()}
                    </div>
                    <div className="text-[9px] font-bold text-hb-muted uppercase tracking-wider opacity-60">ETB</div>
                  </div>
                  
                  {/* Glass highlight effect on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-5">
      {/* Refer & Earn Section */}
      <div className="bg-hb-gold rounded-[24px] p-6 mb-6 shadow-lg shadow-hb-gold/10 relative overflow-hidden group">
        <div className="relative z-10">
           <h3 className="text-hb-blueblack font-black text-lg italic tracking-tighter mb-1 uppercase">Refer & Earn Bonus</h3>
           <p className="text-hb-blueblack/60 text-[10px] font-bold uppercase tracking-widest mb-4">Invite friends & get 5 ETB each!</p>
           
           <div className="flex gap-2">
              <div className="flex-1 bg-hb-blueblack/5 border border-hb-blueblack/10 rounded-xl px-4 flex items-center overflow-hidden h-12">
                 <span className="text-hb-blueblack/50 text-[9px] font-mono font-bold truncate">
                   {window.location.host}/?ref={user.username}
                 </span>
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`https://${window.location.host}/?ref=${user.username}`);
                  alert("Referral link copied!");
                }}
                className="bg-hb-blueblack text-white px-4 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform"
              >
                Copy
              </button>
           </div>
        </div>
        <i className="fas fa-gift absolute -right-4 -bottom-4 text-hb-blueblack/10 text-[6rem] rotate-12 group-hover:rotate-0 transition-transform duration-500"></i>
      </div>

      <div className="bg-gradient-to-br from-[#1A1A1A] to-black border border-hb-border p-8 rounded-[24px] text-white mb-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-[11px] font-bold uppercase opacity-60 mb-1.5 tracking-widest text-hb-muted">Available Balance</p>
          <h2 className="text-[32px] font-black mb-4 text-hb-gold drop-shadow-sm leading-none">
            {user.balance.toLocaleString()} <span className="text-[16px] opacity-70 font-bold text-white">ETB</span>
          </h2>
          <div className="flex gap-2">
            <div className="px-3 py-1 bg-hb-gold/10 rounded-lg text-[10px] font-bold uppercase border border-hb-gold/20 text-hb-gold">Secured Vault</div>
            <div className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-bold uppercase border border-white/5 text-hb-muted">Verified Player</div>
          </div>
        </div>
        <i className="fas fa-wallet absolute -right-6 -bottom-6 text-hb-gold/10 text-[9rem] -rotate-12"></i>
      </div>

      <div className="flex bg-hb-surface border border-hb-border p-1.5 rounded-2xl mb-8 overflow-x-auto gap-1 no-scrollbar">
        {['deposit', 'withdraw', 'transfer', 'bonus'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 min-w-[80px] py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === tab ? 'bg-hb-gold text-hb-blueblack shadow-md' : 'text-hb-muted hover:text-white'}`}
          >
            {tab === 'deposit' ? 'Add' : tab === 'withdraw' ? 'Out' : tab === 'transfer' ? 'Send' : 'Bonus'}
          </button>
        ))}
      </div>

      {activeTab === 'deposit' && (
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-black uppercase text-hb-muted ml-1 tracking-widest">Select Provider</span>
            <div className="grid grid-cols-4 gap-3">
              <MethodButton id="telebirr" selected={selectedMethod === 'telebirr'} logoUrl={LOGOS.telebirr} onClick={setSelectedMethod} />
              <MethodButton id="cbe" selected={selectedMethod === 'cbe'} logoUrl={LOGOS.cbe} onClick={setSelectedMethod} />
              <MethodButton id="ebirr" selected={selectedMethod === 'ebirr'} logoUrl={LOGOS.ebirr} onClick={setSelectedMethod} />
              <MethodButton id="kacha" selected={selectedMethod === 'kacha'} logoUrl={LOGOS.kacha} onClick={setSelectedMethod} />
            </div>
          </div>

          <div className="bg-hb-surface p-7 rounded-[24px] border border-hb-border shadow-sm space-y-6">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2 mb-4">
                <img src={LOGOS[selectedMethod]} className="w-10 h-10 rounded-lg shadow-md object-contain p-1 bg-white" alt="Selected" />
                <h3 className="font-black text-white text-[18px] uppercase tracking-tight italic">
                  Deposit via {selectedMethod === 'cbe' ? 'CBE' : selectedMethod.charAt(0).toUpperCase() + selectedMethod.slice(1)}
                </h3>
              </div>
              
              <DepositGuide method={selectedMethod} numbers={getDepositNumbers()} />

              <p className="text-[11px] text-hb-muted font-bold uppercase tracking-widest bg-white/5 py-2 rounded-lg">Copy details below:</p>
              
              <div className="space-y-3">
                {getDepositNumbers().map((num) => (
                  <div key={num} className="bg-[#121212] border border-hb-border py-4 px-6 rounded-2xl flex items-center justify-between group hover:border-hb-gold/30 transition-colors">
                    <div className="text-left">
                      <span className="text-[18px] font-black text-hb-gold tracking-wider font-mono block leading-none mb-1">{num}</span>
                      <span className="text-[10px] font-bold text-hb-muted uppercase tracking-widest opacity-60">umar guye</span>
                    </div>
                    <button 
                      onClick={() => handleCopy(num)}
                      className="w-10 h-10 bg-hb-gold/10 text-hb-gold rounded-xl flex items-center justify-center hover:bg-hb-gold hover:text-hb-blueblack transition-all active:scale-90 shadow-sm"
                    >
                      <i className="fas fa-copy"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-hb-border/50">
              <h3 className="font-bold text-white text-[16px] uppercase tracking-tight text-center">
                Verify Payment
              </h3>
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-hb-muted ml-1 uppercase tracking-tighter italic">Amount Sent (Min 30 ETB)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full input-human shadow-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-hb-muted ml-1 uppercase tracking-tighter italic">Transaction ID</label>
                <input 
                  type="text" 
                  placeholder="Ref/Txn code"
                  value={refId}
                  onChange={(e) => setRefId(e.target.value)}
                  className="w-full input-human shadow-sm"
                />
              </div>

              <button 
                onClick={() => handleTransaction('deposit')}
                disabled={loading}
                className="w-full h-[54px] bg-hb-gold text-hb-blueblack font-bold rounded-xl text-[14px] uppercase shadow-lg active:scale-[0.98] mt-4 flex items-center justify-center gap-2 transition-all hover:brightness-110 disabled:opacity-50"
              >
                {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check-circle"></i>}
                {loading ? 'Verifying...' : 'Submit Deposit'}
              </button>
            </div>
          </div>

          {/* Deposit History Section */}
          {renderHistory(depositHistory, 'Deposit')}
        </div>
      )}

      {activeTab === 'withdraw' && (
        <div className="bg-hb-surface p-7 rounded-[24px] border border-hb-border shadow-sm space-y-6">
           <div className="text-center">
              <h3 className="font-bold text-white text-[18px] mb-1 italic">Get Cash Out</h3>
              <p className="text-[12px] text-hb-muted font-medium">Window: {APP_CONFIG.WALLET.WITHDRAWAL_START_HOUR} AM to {APP_CONFIG.WALLET.WITHDRAWAL_END_HOUR - 12} PM.</p>
           </div>

           <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-hb-muted ml-1">Amount to Withdraw (Min {APP_CONFIG.WALLET.MIN_WITHDRAWAL_ETB})</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00 ETB"
                  className="w-full input-human"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-hb-muted ml-1">Payment Method</label>
                <select 
                  className="w-full input-human appearance-none bg-no-repeat bg-[right_16px_center]"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23A0A0A0\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundSize: '20px' }}
                  value={bank} onChange={e => setBank(e.target.value)}
                >
                  <option value="">Select Bank/Wallet...</option>
                  {ETHIOPIAN_BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-hb-muted ml-1">Account Number</label>
                <input 
                  type="text" 
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. 1000..."
                  className="w-full input-human"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-hb-muted ml-1">Full Name</label>
                <input 
                  type="text" 
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  placeholder="Full Name"
                  className="w-full input-human"
                />
              </div>

              <button 
                onClick={() => handleTransaction('withdraw')}
                disabled={!isWithdrawActive() || loading}
                className="w-full h-[54px] bg-hb-gold text-hb-blueblack font-bold rounded-xl text-[14px] uppercase shadow-lg active:scale-[0.98] disabled:opacity-40 transition-all mt-4 flex items-center justify-center gap-2"
              >
                {loading && <i className="fas fa-spinner fa-spin"></i>}
                Request Cash Out
              </button>
              
              <div className="mt-4 p-3 bg-[#121212] rounded-xl border border-hb-border/50 text-center space-y-2">
                 <p className="text-[9px] text-hb-muted font-bold uppercase tracking-widest">Withdrawal Requirements:</p>
                 <div className="flex flex-col gap-1">
                    <p className="text-[10px] text-hb-gold font-bold italic">1. Bonus users must have 2+ game wins.</p>
                    <p className="text-[10px] text-hb-gold font-bold italic">2. Must win at least 1 game after your last deposit.</p>
                 </div>
              </div>

              {!isWithdrawActive() && (
                <p className="text-[10px] text-red-500 font-bold text-center italic mt-4">Withdrawals paused. Resume at {APP_CONFIG.WALLET.WITHDRAWAL_START_HOUR} AM.</p>
              )}
           </div>

           {/* Withdrawal History Section */}
           {renderHistory(withdrawHistory, 'Withdrawal')}
        </div>
      )}

      {activeTab === 'transfer' && (
        <div className="bg-hb-surface p-7 rounded-[24px] border border-hb-border shadow-sm space-y-6">
           <div className="text-center">
              <h3 className="font-bold text-white text-[18px] mb-1 italic">Send Money</h3>
              <p className="text-[12px] text-hb-muted font-medium">Move funds to another player's account (Min 100 ETB).</p>
           </div>

           <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-hb-muted ml-1">Recipient Username</label>
                <input 
                  type="text"
                  value={recipientUsername}
                  onChange={(e) => setRecipientUsername(e.target.value)}
                  placeholder="e.g. BingoKing"
                  className="w-full input-human"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-hb-muted ml-1">Amount to Send</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00 ETB"
                  className="w-full input-human"
                />
              </div>

              {transferValue > 0 && (
                <div className="bg-[#121212] p-4 rounded-xl border border-hb-border text-[12px] animate-in fade-in slide-in-from-top-1">
                  <div className="flex justify-between mb-2">
                    <span className="text-hb-muted font-bold">Transfer Amount</span>
                    <span className="font-bold text-white">{transferValue.toFixed(2)} ETB</span>
                  </div>
                  <div className="flex justify-between mb-2 text-hb-gold">
                    <span className="font-bold">Fee (5%)</span>
                    <span className="font-bold">+{transferFee.toFixed(2)} ETB</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-hb-border/50 font-black text-white text-[14px]">
                    <span>Total Deductible</span>
                    <span>{totalTransferDeduction.toFixed(2)} ETB</span>
                  </div>
                </div>
              )}

              <button 
                onClick={() => handleTransaction('transfer')}
                disabled={user.balance < totalTransferDeduction || loading}
                className="w-full h-[54px] bg-hb-gold text-hb-blueblack font-bold rounded-xl text-[14px] uppercase shadow-lg active:scale-[0.98] transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <i className="fas fa-spinner fa-spin"></i>}
                {user.balance < totalTransferDeduction ? 'Insufficient Funds' : 'Send Money'}
              </button>
           </div>
           
           {/* Transfer History Section */}
           {renderHistory(transferHistory, 'Transfer')}
        </div>
      )}

      {activeTab === 'bonus' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="bg-hb-surface p-7 rounded-[24px] border border-hb-border shadow-sm mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-white font-black text-sm italic uppercase tracking-widest">Bonus History</h3>
                <p className="text-hb-muted text-[10px] font-bold">Earned from referrals & promos</p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1.5 justify-end">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                   <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Total Earned</span>
                </div>
                <span className="text-xl font-black text-hb-gold italic">
                  {bonusHistory.reduce((acc, curr) => acc + (curr.amount || 0), 0).toLocaleString()} ETB
                </span>
              </div>
           </div>
           {renderHistory(bonusHistory, 'Bonus')}
        </div>
      )}
    </div>
  );
};

export default WalletView;
