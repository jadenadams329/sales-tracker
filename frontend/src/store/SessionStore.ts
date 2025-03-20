import { create } from "zustand";
import { User, ApiError, UserLogin } from "../interfaces";
import { csrfFetch } from "../services/csrf";

// Define the store's state interface
interface SessionState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  login: (credentials: UserLogin) => Promise<void>;
  restoreUser: () => Promise<void>;
}

// Create the store with proper typing
export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  isLoading: false,
  setUser: (user: User | null) => set({ user }),
  clearUser: () => set({ user: null }),
  login: async (credentials: UserLogin) => {
    set({ isLoading: true });
    const { email, password } = credentials;
    try {
      const response = await csrfFetch("/api/session", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();
      const { user } = data as { user: User };
      set({ user, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      const response = err as Response;
      const errorData = await response.json();
      throw errorData as ApiError;
    }
  },
  restoreUser: async () => {
    set({ isLoading: true });
    try {
      const response = await csrfFetch("/api/session");
      const data = await response.json();

      const { user } = data as { user: User };
      set({ user, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      const response = err as Response;
      const errorData = await response.json();
      throw errorData as ApiError;
    }
  },
}));
