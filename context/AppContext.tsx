import React, { createContext, useEffect, useState, ReactNode, useContext } from "react";
import { useSession } from "next-auth/react";
import { User } from "@prisma/client";
import type { Track } from "@types";

interface AppState {
  user: User | null;
  currentTrackUri: string | null;
  isPlaying: boolean;
  tracks: Track[];
  tracksLoading: boolean;
  tracksUpdated: string | null;
}

interface AppContextType {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  playTrack: (uri: string) => void;
  setPlayerIsPlaying: (playing: boolean) => void;
  setTracks: (tracks: Track[], updated?: string | null) => void;
  setTracksLoading: (loading: boolean) => void;
}

interface AppProviderProps {
  children: ReactNode;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }: AppProviderProps) => {
  const [state, setState] = useState<AppState>({
    user: null,
    currentTrackUri: null,
    isPlaying: false,
    tracks: [],
    tracksLoading: false,
    tracksUpdated: null,
  });
  const { data: session, status } = useSession();

  // Fetch user data when authenticated
  useEffect(() => {
    if (status === "authenticated" && session?.user && !state.user) {
      fetch("/api/user")
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch user');
          return res.json();
        })
        .then((data) => {
          setState((prevState) => ({ ...prevState, user: data }));
        })
        .catch((error) => console.error("Error fetching user:", error));
    } else if (status === "unauthenticated") {
        setState((prevState) => ({ ...prevState, user: null }));
    }
  }, [session, status, state.user]);

  // Load initial track URI from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
        const storedUri = localStorage.getItem("currentTrackUri");
        if (storedUri) {
            setState(prevState => ({ ...prevState, currentTrackUri: storedUri }));
        }
    }
  }, []);

  const playTrack = (uri: string) => {
    setState(prevState => ({
        ...prevState,
        currentTrackUri: uri,
        isPlaying: true
    }));
    if (typeof window !== "undefined") {
        localStorage.setItem("currentTrackUri", uri);
    }
  };

  const setPlayerIsPlaying = (playing: boolean) => {
    setState(prevState => ({ ...prevState, isPlaying: playing }));
  };

  const setTracks = (tracks: Track[], updated?: string | null) => {
    setState(prevState => ({ ...prevState, tracks, tracksUpdated: updated ?? prevState.tracksUpdated }));
  };

  const setTracksLoading = (loading: boolean) => {
    setState(prevState => ({ ...prevState, tracksLoading: loading }));
  };

  return (
    <AppContext.Provider value={{ state, setState, playTrack, setPlayerIsPlaying, setTracks, setTracksLoading }}>
      {children}
    </AppContext.Provider>
  );
};