import React, { createContext, useState, ReactNode } from "react";

interface AppContextType {
  state: any;
  setState: React.Dispatch<React.SetStateAction<any>>;
}

interface AppProviderProps {
  children: ReactNode;
  initialData: any;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children, initialData }: AppProviderProps) => {
  const [state, setState] = useState(initialData);

  return (
    <AppContext.Provider value={{ state, setState }}>
      {children}
    </AppContext.Provider>
  );
};
