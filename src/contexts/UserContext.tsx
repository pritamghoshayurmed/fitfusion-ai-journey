
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { UserProfile, TrackingData, DiaryEntry } from '@/types';

interface UserContextType {
  userProfile: UserProfile | null;
  trackingData: TrackingData[];
  diaryEntries: DiaryEntry[];
  isProfileComplete: boolean;
  setUserProfile: (profile: UserProfile) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  addTrackingData: (data: TrackingData) => void;
  addDiaryEntry: (entry: DiaryEntry) => void;
}

const defaultUserContext: UserContextType = {
  userProfile: null,
  trackingData: [],
  diaryEntries: [],
  isProfileComplete: false,
  setUserProfile: () => {},
  updateUserProfile: () => {},
  addTrackingData: () => {},
  addDiaryEntry: () => {},
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

  const isProfileComplete = !!userProfile;

  const setUserProfile = (profile: UserProfile) => {
    setUserProfileState(profile);
    // Here you would typically save to local storage or a backend
    localStorage.setItem('userProfile', JSON.stringify(profile));
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    if (userProfile) {
      const updatedProfile = { ...userProfile, ...updates };
      setUserProfileState(updatedProfile);
      localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
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

  // Load data from localStorage on initial render
  React.useEffect(() => {
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

  return (
    <UserContext.Provider
      value={{
        userProfile,
        trackingData,
        diaryEntries,
        isProfileComplete,
        setUserProfile,
        updateUserProfile,
        addTrackingData,
        addDiaryEntry,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
