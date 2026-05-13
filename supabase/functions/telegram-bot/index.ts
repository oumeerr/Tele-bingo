import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  const { message } = await req.json();

  if (!message) return new Response("OK");

  const chatId = message.chat.id;
  const text = message.text;

  // 1. Handle Registration via Contact Sharing
  if (message.contact) {
    const phoneNumber = message.contact.phone_number;
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ 
        telegram_id: chatId, 
        username: message.from.username,
        phone: phoneNumber 
      })
      .select();

    return sendMessage(chatId, "✅ Account Synced! Your balance is ready.");
  }

  // 2. Handle Balance Check
  if (text === "/balance") {
    const { data } = await supabase
      .from('profiles')
      .select('balance')
      .eq('telegram_id', chatId)
      .single();
    
    return sendMessage(chatId, `💰 Current Balance: ${data?.balance || 0} ETB`);
  }

  // 3. Handle Transfers (Example Logic)
  if (text?.startsWith("/transfer")) {
    // Logic to parse /transfer [amount] [to_user_id]
    // Execute a Postgres RPC function to ensure atomic balance updates
  }

  return new Response("OK");
});

async function sendMessage(chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  return new Response("OK");
}
