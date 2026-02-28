import { create } from 'zustand';

export type User = {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: number;
  accessToken?: string;
};

export type GlobalState = {
  user?: User;

  signIn: (user: User) => void;
  signOut: () => void;
};

const getUserFromStorage = (): User | undefined => {
  try {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      return JSON.parse(userJson);
    }
  } catch (e) {
    console.error('Failed to parse user from storage', e);
  }
  return undefined;
};

export const useGlobalStateStore = create<GlobalState>((set) => ({
  user: getUserFromStorage(),

  signIn: (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    set((prevState) => ({ ...prevState, user }));
  },
  signOut: () => {
    localStorage.removeItem('user');
    set((prevState) => ({ ...prevState, user: undefined }));
  },
}));
