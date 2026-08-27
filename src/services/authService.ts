import { supabase, isSupabaseConfigured } from '../supabaseClient';

export const loginWithGoogle = async () => {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Kredensial Supabase belum dikonfigurasi di file .env!'
    );
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });

  if (error) throw error;
  return data;
};

export const ensureGoogleUserProfile = async (user: any) => {
  if (!user) return null;

  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || '';
  const email = user.email || '';
  const heroName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Pahlawan_Google';

  if (!isSupabaseConfigured()) {
    return {
      id: user.id || 'demo-google-user',
      username: heroName,
      email,
      avatar_url: avatarUrl,
      level: 1,
      exp: 0,
      gold: 300,
      hp: 100,
    };
  }

  try {
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.warn('Warning fetching QuestLog profile:', fetchError.message);
    }

    if (existingProfile) {
      if (avatarUrl && !existingProfile.avatar_url) {
        await supabase
          .from('profiles')
          .update({ avatar_url: avatarUrl })
          .eq('id', user.id);
        existingProfile.avatar_url = avatarUrl;
      }
      return existingProfile;
    }

    const newProfile = {
      id: user.id,
      username: heroName,
      email,
      avatar_url: avatarUrl,
      level: 1,
      exp: 0,
      gold: 300,
      hp: 100,
    };

    const { error: insertError } = await supabase
      .from('profiles')
      .insert([newProfile]);

    if (insertError) {
      console.warn('Warning inserting QuestLog profile:', insertError.message);
    }

    return newProfile;
  } catch (err) {
    console.error('Error in ensureGoogleUserProfile:', err);
    return {
      id: user.id,
      username: heroName,
      email,
      avatar_url: avatarUrl,
      level: 1,
      exp: 0,
      gold: 300,
      hp: 100,
    };
  }
};

export const getCurrentUser = async () => {
  if (!isSupabaseConfigured()) return null;
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) return null;
  return user;
};

export const onAuthStateChange = (callback: (user: any) => void) => {
  if (!isSupabaseConfigured()) {
    callback(null);
    return { data: { subscription: { unsubscribe: () => {} } } };
  }

  return supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      callback(session.user);
    } else {
      callback(null);
    }
  });
};

export const logoutUser = async () => {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};
