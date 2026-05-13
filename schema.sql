-- Profiles table to store user balances and Telegram details
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  telegram_id BIGINT UNIQUE NOT NULL,
  username TEXT,
  profile_picture_url TEXT,
  balance DECIMAL(12, 2) DEFAULT 0.00,
  referrer_id BIGINT REFERENCES profiles(telegram_id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transaction history for deposits, withdrawals, and transfers
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id BIGINT REFERENCES profiles(telegram_id),
  amount DECIMAL(12, 2),
  type TEXT CHECK (type IN ('deposit', 'withdrawal', 'transfer', 'game_reward', 'referral_bonus')),
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Logs table
CREATE TABLE ai_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt TEXT,
  response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Realtime for the tables
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE ai_logs;
