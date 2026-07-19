import { create } from 'zustand'

interface UIState {
  sidebarOpen: boolean
  searchOpen: boolean

  // Actions
  toggleSidebar: () => void
  setSidebarOpen: (v: boolean) => void
  toggleSearch: () => void
  setSearchOpen: (v: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  searchOpen: false,

  toggleSidebar:  () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
  toggleSearch:   () => set((s) => ({ searchOpen: !s.searchOpen })),
  setSearchOpen:  (v) => set({ searchOpen: v }),
}))
