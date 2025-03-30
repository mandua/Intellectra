import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';

type UserContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
};

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: false,
  error: null,
});

export const useUser = () => useContext(UserContext);

type UserProviderProps = {
  children: ReactNode;
};

export const UserProvider = ({ children }: UserProviderProps) => {
  // Fetch current user data using React Query
  const { data, isLoading, error } = useQuery<User>({
    queryKey: ['/api/user'],
  });

  return (
    <UserContext.Provider value={{ 
      user: data || null, 
      isLoading, 
      error: error as Error | null 
    }}>
      {children}
    </UserContext.Provider>
  );
};
