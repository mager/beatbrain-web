import React, { createContext, useEffect, useState, ReactNode, useContext } from "react";
import { useSession } from "next-auth/react";
import { User } from "@prisma/client"; // Assuming User type is correct

interface AppState {
  user: User | null; // Allow user to be null initially
  currentTrackUri: string | null; // Add state for the track URI
  isPlaying: boolean; // Add state for playback status
}

interface AppContextType {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>; // Update type for full state
  playTrack: (uri: string) => void; // Function to start playing a track
  setPlayerIsPlaying: (playing: boolean) => void; // Function to update play status from player
}

interface AppProviderProps {
  children: ReactNode;
  // Remove initialData if it's only for posts, handle user fetching internally
  // initialData: any;
}

// Use undefined initially for context value check
export const AppContext = createContext<AppContextType | undefined>(undefined);

// Custom hook for easier context usage
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }: AppProviderProps) => {
  const [state, setState] = useState<AppState>({
    user: null, // Start with null user
    currentTrackUri: null, // Start with no track
    isPlaying: false, // Start paused
  });
  const { data: session, status } = useSession();

  // Effect for fetching user data
  useEffect(() => {
    if (status === "authenticated" && session?.user && !state.user) { // Fetch only if user not already set
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
        setState((prevState) => ({ ...prevState, user: null })); // Clear user on sign out
    }
  }, [session, status, state.user]);

  // Effect to load initial track URI from localStorage (runs once on client)
  useEffect(() => {
    if (typeof window !== "undefined") {
        const storedUri = localStorage.getItem("currentTrackUri");
        if (storedUri) {
            // Set the URI but don't automatically start playing on initial load
            setState(prevState => ({ ...prevState, currentTrackUri: storedUri }));
        }
    }
  }, []); // Empty array ensures it runs only once on mount


  // Function for components to call to start playing a track
  const playTrack = (uri: string) => {
    setState(prevState => ({
        ...prevState,
        currentTrackUri: uri,
        isPlaying: true // Set playing intent to true
    }));
    // Optionally persist to localStorage here if desired for refresh scenarios
    if (typeof window !== "undefined") {
        localStorage.setItem("currentTrackUri", uri);
    }
  };

  // Function for the Spotify Player component to update the global playing state
  const setPlayerIsPlaying = (playing: boolean) => {
    setState(prevState => ({ ...prevState, isPlaying: playing }));
  };


  return (
    <AppContext.Provider value={{ state, setState, playTrack, setPlayerIsPlaying }}>
      {children}
    </AppContext.Provider>
  );
};