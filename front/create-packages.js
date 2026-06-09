const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const sql = `
    CREATE TABLE IF NOT EXISTS public.packages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        subtitle TEXT,
        price TEXT NOT NULL,
        original_price TEXT,
        is_highlighted BOOLEAN DEFAULT false,
        benefits JSONB NOT NULL DEFAULT '[]'::jsonb,
        cta_text TEXT NOT NULL,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
    );

    -- Insert Basic
    INSERT INTO public.packages (name, subtitle, price, original_price, is_highlighted, benefits, cta_text, order_index)
    SELECT 'Basic', null, 'Rp 199.000', null, false, 
    '[
      {"text": "Materi : Mental Foundation", "isIncluded": true},
      {"text": "Materi : Speaking Clarity", "isIncluded": true},
      {"text": "(Bonus 1) Live Zoom 2x Sebulan", "isIncluded": true},
      {"text": "(Bonus 2) Komunitas Eksklusif", "isIncluded": true},
      {"text": "(Bonus 3) eBook Eksklusif", "isIncluded": true},
      {"text": "Advanced Structure", "isIncluded": false},
      {"text": "Delivery", "isIncluded": false},
      {"text": "Vocal & Body Delivery", "isIncluded": false},
      {"text": "Storytelling Mastery", "isIncluded": false},
      {"text": "Persuasion & Psychology", "isIncluded": false}
    ]'::jsonb, 'JOIN BASIC', 1
    WHERE NOT EXISTS (SELECT 1 FROM public.packages WHERE name = 'Basic');

    -- Insert Advanced
    INSERT INTO public.packages (name, subtitle, price, original_price, is_highlighted, benefits, cta_text, order_index)
    SELECT 'ADVANCED', 'Bayar sekali, untuk selamanya\\n(Langsung dapat Full Materi + Semua Bonus!)', 'Rp 349.000', 'Rp 599.000', true, 
    '[
      {"text": "Materi : Mental Foundation", "isIncluded": true},
      {"text": "Materi : Speaking Clarity", "isIncluded": true},
      {"text": "Materi : Advanced Structure", "isIncluded": true},
      {"text": "Materi : Delivery", "isIncluded": true},
      {"text": "Materi : Vocal & Body Delivery", "isIncluded": true},
      {"text": "(Bonus 1) Live Zoom 2x Sebulan", "isIncluded": true},
      {"text": "(Bonus 2) Komunitas Eksklusif", "isIncluded": true},
      {"text": "(Bonus 3) eBook Eksklusif", "isIncluded": true},
      {"text": "Storytelling Mastery", "isIncluded": true},
      {"text": "Persuasion & Psychology", "isIncluded": true}
    ]'::jsonb, 'JOIN ADVANCED', 2
    WHERE NOT EXISTS (SELECT 1 FROM public.packages WHERE name = 'ADVANCED');

    -- Insert Intermediated
    INSERT INTO public.packages (name, subtitle, price, original_price, is_highlighted, benefits, cta_text, order_index)
    SELECT 'Intermediated', null, 'Rp 399.000', null, false, 
    '[
      {"text": "Materi : Mental Foundation", "isIncluded": true},
      {"text": "Materi : Speaking Clarity", "isIncluded": true},
      {"text": "Materi : Advanced Structure", "isIncluded": true},
      {"text": "Materi : Delivery", "isIncluded": true},
      {"text": "Materi : Vocal & Body Delivery", "isIncluded": true},
      {"text": "(Bonus 1) Live Zoom 2x Sebulan", "isIncluded": true},
      {"text": "(Bonus 2) Komunitas Eksklusif", "isIncluded": true},
      {"text": "(Bonus 3) eBook Eksklusif", "isIncluded": true},
      {"text": "Storytelling Mastery", "isIncluded": false},
      {"text": "Persuasion & Psychology", "isIncluded": false}
    ]'::jsonb, 'JOIN INTERMEDIATED', 3
    WHERE NOT EXISTS (SELECT 1 FROM public.packages WHERE name = 'Intermediated');
  `;

  // We can use an RPC call or something, but the easiest way to run raw SQL without creating an RPC
  // is actually just by using supabase MCP, but since we didn't figure it out, let me just try creating an RPC or maybe use `@supabase/supabase-js` `rpc`?
  // Wait, `supabase-js` doesn't have a direct `query` or `executeSql` function without an RPC or the Postgres REST API doesn't support raw SQL.
  // Hmm, since we don't have direct SQL access through JS client without RPC, I should use the `mcp` tool.
}

main();
