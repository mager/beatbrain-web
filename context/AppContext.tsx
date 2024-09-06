import React, { createContext, useEffect, useState, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { User } from "@prisma/client";

interface AppContextType {
  state: {
    user: User;
  };
  setState: React.Dispatch<React.SetStateAction<any>>;
}

interface AppProviderProps {
  children: ReactNode;
  initialData: any;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children, initialData }: AppProviderProps) => {
  const [state, setState] = useState(initialData);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.id) {
      fetch("/api/user")
        .then((res) => res.json())
        .then((data) => {
          setState((prevState) => ({ ...prevState, user: data }));
        })
        .catch((error) => console.error("Error fetching user:", error));
    }
  }, [session, status]);

  return (
    <AppContext.Provider value={{ state, setState }}>
      {children}
    </AppContext.Provider>
  );
};
