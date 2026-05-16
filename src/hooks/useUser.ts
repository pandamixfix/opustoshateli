import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient, toProxyUrl } from '../lib/supabase';

export interface UserProfile {
  id: string;
  email?: string;
  display_name: string;
  avatar_url: string;
  role: string;
  status?: string;
  created_at?: string;
  social_tg?: string;
  social_twitch?: string;
  social_yt?: string;
  bg_color?: string;
  bg_image_url?: string;
  name_color?: string;
  name_font?: string;
  name_glow?: boolean;
  bg_position_y?: number;
  name_effect?: string;
  card_color?: string;
  avatar_effect?: string;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setUser(session.user);
        const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
        
        if (data) {
          setProfile({
            ...data,
            email: session.user.email,
            avatar_url: toProxyUrl(data.avatar_url) || data.avatar_url
          });
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    }

    loadData();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      loadData();
    });

    window.addEventListener('profileUpdated', loadData);

    return () => {
      authListener.subscription.unsubscribe();
      window.removeEventListener('profileUpdated', loadData);
    };
  }, []);

  return { user, profile, loading, setProfile };
}