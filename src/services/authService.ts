import { supabase, isSupabaseConfigured } from '../supabaseClient';

const INTERNAL_AUTH_DOMAIN = 'questlog.app';
const USERNAME_REGEX = /^[a-zA-Z0-9_][a-zA-Z0-9._-]{1,22}[a-zA-Z0-9_]$/;

export const validateUsername = (rawUsername: string): string | null => {
  const trimmed = rawUsername.trim();
  if (trimmed.includes('@')) {
    return trimmed.length >= 5 ? null : 'Format username atau email tidak valid.';
  }
  if (trimmed.length < 3 || trimmed.length > 24) {
    return 'Username harus antara 3 sampai 24 karakter.';
  }
  if (trimmed.includes('..') || !USERNAME_REGEX.test(trimmed)) {
    return 'Username hanya boleh berisi huruf, angka, titik (.), underscore (_), atau strip (-) tanpa spasi.';
  }
  return null;
};

export const usernameToAuthEmail = (rawUsername: string): string => {
  const normalized = rawUsername.trim().toLowerCase();
  if (normalized.includes('@')) {
    return normalized;
  }
  return `${normalized}@${INTERNAL_AUTH_DOMAIN}`;
};

export const signUpWithUsername = async (username: string, password: string) => {
  if (!isSupabaseConfigured()) {
    throw new Error('Kredensial Supabase belum dikonfigurasi di file .env!');
  }

  const displayUsername = username.trim();
  const authEmail = usernameToAuthEmail(displayUsername);

  const { data, error } = await supabase.auth.signUp({
    email: authEmail,
    password,
    options: {
      data: {
        username: displayUsername,
        full_name: displayUsername,
        name: displayUsername,
      },
    },
  });

  if (error) throw error;
  return data;
};

export const loginWithUsername = async (username: string, password: string) => {
  if (!isSupabaseConfigured()) {
    throw new Error('Kredensial Supabase belum dikonfigurasi di file .env!');
  }

  const authEmail = usernameToAuthEmail(username);

  const { data, error } = await supabase.auth.signInWithPassword({
    email: authEmail,
    password,
  });

  if (error) throw error;
  return data;
};

export const ensureGoogleUserProfile = async (user: any) => {
  if (!user) return null;

  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || 'shield';
  const email = user.email || '';
  const heroName =
    user.user_metadata?.username ||
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Pahlawan_QuestLog';

  if (!isSupabaseConfigured()) {
    return {
      id: user.id || 'demo-user',
      username: heroName,
      email,
      avatar_url: avatarUrl,
      title: 'Novice Adventurer',
      level: 1,
      exp: 0,
      gold: 100,
      hp: 100,
      max_hp: 100,
      streak_days: 1,
      theme: 'DARK_DUNGEON',
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
      if (avatarUrl && (!existingProfile.avatar_url || existingProfile.avatar_url === 'shield')) {
        await supabase
          .from('profiles')
          .update({ avatar_url: avatarUrl })
          .eq('id', user.id);
        existingProfile.avatar_url = avatarUrl;
      }
      return existingProfile;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const newProfile = {
      id: user.id,
      username: heroName,
      email,
      avatar_url: avatarUrl,
      title: 'Novice Adventurer',
      level: 1,
      exp: 0,
      gold: 100,
      hp: 100,
      max_hp: 100,
      streak_days: 1,
      last_completed_date: todayStr,
      is_streak_frozen: false,
      theme: 'DARK_DUNGEON',
      badge: 'Novice Adventurer',
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
      title: 'Novice Adventurer',
      level: 1,
      exp: 0,
      gold: 100,
      hp: 100,
      max_hp: 100,
      streak_days: 1,
      theme: 'DARK_DUNGEON',
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
