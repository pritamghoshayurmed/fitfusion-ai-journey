
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { UserProfile, TrackingData, DiaryEntry } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface UserContextType {
  userProfile: UserProfile | null;
  trackingData: TrackingData[];
  diaryEntries: DiaryEntry[];
  isProfileComplete: boolean;
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  setUserProfile: (profile: UserProfile) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  addTrackingData: (data: TrackingData) => void;
  addDiaryEntry: (entry: DiaryEntry) => void;
  signOut: () => Promise<void>;
}

const defaultUserContext: UserContextType = {
  userProfile: null,
  trackingData: [],
  diaryEntries: [],
  isProfileComplete: false,
  isAuthenticated: false,
  user: null,
  session: null,
  setUserProfile: () => {},
  updateUserProfile: () => {},
  addTrackingData: () => {},
  addDiaryEntry: () => {},
  signOut: async () => {},
};

const UserContext = createContext<UserContextType>(defaultUserContext);

export const useUser = () => useContext(UserContext);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
  const [trackingData, setTrackingData] = useState<TrackingData[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  const isAuthenticated = !!user;
  const isProfileComplete = !!userProfile;

  const setUserProfile = async (profile: UserProfile) => {
    setUserProfileState(profile);
    
    if (user) {
      // If authenticated, update or create profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...profile
        }, {
          onConflict: 'id'
        });
      
      if (error) {
        console.error("Error updating profile in Supabase:", error);
        toast.error("Failed to save profile");
      }
    } else {
      localStorage.setItem('userProfile', JSON.stringify(profile));
    }
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (userProfile) {
      const updatedProfile = { ...userProfile, ...updates };
      setUserProfileState(updatedProfile);
      
      if (user) {
        // If authenticated, update profile in Supabase
        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id);
        
        if (error) {
          console.error("Error updating profile in Supabase:", error);
          toast.error("Failed to update profile");
        }
      } else {
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      }
    }
  };

  const addTrackingData = (data: TrackingData) => {
    const updatedData = [...trackingData, data];
    setTrackingData(updatedData);
    localStorage.setItem('trackingData', JSON.stringify(updatedData));
  };

  const addDiaryEntry = (entry: DiaryEntry) => {
    const updatedEntries = [...diaryEntries, entry];
    setDiaryEntries(updatedEntries);
    localStorage.setItem('diaryEntries', JSON.stringify(updatedEntries));
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    } else {
      setUser(null);
      setSession(null);
      toast.success("Signed out successfully");
    }
  };

  // Load data from localStorage on initial render
  useEffect(() => {
    const storedProfile = localStorage.getItem('userProfile');
    const storedTrackingData = localStorage.getItem('trackingData');
    const storedDiaryEntries = localStorage.getItem('diaryEntries');
    
    if (storedProfile) {
      setUserProfileState(JSON.parse(storedProfile));
    }
    
    if (storedTrackingData) {
      setTrackingData(JSON.parse(storedTrackingData));
    }
    
    if (storedDiaryEntries) {
      setDiaryEntries(JSON.parse(storedDiaryEntries));
    }
  }, []);

  // Set up authentication listener
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // If user just signed in, fetch their profile
        if (event === 'SIGNED_IN' && currentSession?.user) {
          setTimeout(async () => {
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentSession.user.id)
              .single();
            
            if (data && !error) {
              setUserProfileState(data as UserProfile);
            } else if (error && error.code !== 'PGRST116') {
              console.error("Error fetching user profile:", error);
            }
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', currentSession.user.id)
          .single()
          .then(({ data, error }) => {
            if (data && !error) {
              setUserProfileState(data as UserProfile);
            }
          });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider
      value={{
        userProfile,
        trackingData,
        diaryEntries,
        isProfileComplete,
        isAuthenticated,
        user,
        session,
        setUserProfile,
        updateUserProfile,
        addTrackingData,
        addDiaryEntry,
        signOut,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
