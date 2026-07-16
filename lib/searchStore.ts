import { create } from 'zustand';

interface SearchStore {
  isOpen: boolean;
  query: string;
  setIsOpen: (isOpen: boolean) => void;
  setQuery: (query: string) => void;
  reset: () => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  isOpen: false,
  query: '',
  setIsOpen: (isOpen) => set((state) => {
    // If closing, clear the query
    if (!isOpen) {
      return { isOpen, query: '' };
    }
    return { isOpen };
  }),
  setQuery: (query) => set({ query }),
  reset: () => set({ isOpen: false, query: '' }),
}));
