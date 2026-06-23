const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aeunhhrvpqkbimpmxddw.supabase.co';
const supabaseKey = 'sb_publishable_ASKN0HThv-CsS93iOrljWA___wQ7u8j';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCols() {
  const email = `test_cols_${Date.now()}@test.com`;
  const { data } = await supabase.auth.signUp({ email, password: 'password123' });
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
  console.log(Object.keys(profile || {}));
}

checkCols();
