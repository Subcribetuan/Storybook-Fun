import { create } from 'zustand';

export const useStore = create((set) => ({
  // Current view
  view: 'home', // 'home' | 'reading'
  setView: (view) => set({ view }),

  // Active story
  activeStory: null,
  setActiveStory: (story) => set({ activeStory: story }),

  // Category filter
  filter: 'all',
  setFilter: (filter) => set({ filter }),

  // Reading progress (persisted per story)
  progress: {},
  setPageForStory: (storyId, page) =>
    set((state) => ({
      progress: { ...state.progress, [storyId]: page }
    })),

  // Favorites
  favorites: [],
  toggleFavorite: (storyId) =>
    set((state) => ({
      favorites: state.favorites.includes(storyId)
        ? state.favorites.filter((id) => id !== storyId)
        : [...state.favorites, storyId]
    })),

  // Open a story
  openStory: (story) => {
    set({ activeStory: story, view: 'reading' });
    window.scrollTo(0, 0);
  },

  // Close reader
  closeReader: () => {
    set({ view: 'home', activeStory: null });
    window.scrollTo(0, 0);
  }
}));
