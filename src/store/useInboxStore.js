import { create } from "zustand";

export const useInboxStore = create((set) => ({
  conversations: [],
  selectedConversationId: null,
  messages: [],
  loadingConversations: false,
  loadingMessages: false,

  setSelectedConversationId: (updater) =>
    set((state) => ({
      selectedConversationId:
        typeof updater === "function" ? updater(state.selectedConversationId) : updater,
    })),

  setConversations: (updater) =>
    set((state) => ({
      conversations:
        typeof updater === "function" ? updater(state.conversations) : updater,
    })),

 setMessages: (updater) =>
  set((state) => ({
    messages: typeof updater === "function" ? updater(state.messages) : updater,
  })),
  setLoadingConversations: (v) => set({ loadingConversations: v }),
  setLoadingMessages: (v) => set({ loadingMessages: v }),
}));
