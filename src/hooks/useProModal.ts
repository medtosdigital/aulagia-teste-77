
import { create } from 'zustand';

interface ProModalStore {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export const useProModal = create<ProModalStore>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}));
