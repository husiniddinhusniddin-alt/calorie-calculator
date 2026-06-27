const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://aeunhhrvpqkbimpmxddw.supabase.co';
const supabaseKey = 'sb_publishable_ASKN0HThv-CsS93iOrljWA___wQ7u8j';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testMetadata() {
  const email = `test_meta_${Date.now()}@test.com`;
  const { data, error } = await supabase.auth.signUp({ email, password: 'password123' });
  
  if (data.session) {
    const { data: updateData, error: updateError } = await supabase.auth.updateUser({
      data: {
        streaks: { calorie: 5, water: 12 },
        notifications: { dailyReminder: true },
      }
    });
    console.log('Update meta error:', updateError);
    console.log('User meta:', updateData.user?.user_metadata);
  }
}

testMetadata();
