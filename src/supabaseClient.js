import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vcjyiihovljzkcpsxpwz.supabase.co';
const supabaseKey = 'sb_publishable_NemRADDZEtihhs7fCJ5acA_8h0jVARB';

export const supabase = createClient(supabaseUrl, supabaseKey);
