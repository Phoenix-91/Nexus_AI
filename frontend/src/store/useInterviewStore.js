import { create } from 'zustand';

export const useInterviewStore = create((set) => ({
    sessionId: null,
    resumeId: null,
    jobRole: '',
    experienceLevel: '',
    messages: [],
    isActive: false,
    questionCount: 0,

    setSessionId: (id) => set({ sessionId: id }),
    setResumeId: (id) => set({ resumeId: id }),
    setJobRole: (role) => set({ jobRole: role }),
    setExperienceLevel: (level) => set({ experienceLevel: level }),

    addMessage: (message) => set((state) => ({
        messages: [...state.messages, message],
        questionCount: message.type === 'ai' ? state.questionCount + 1 : state.questionCount,
    })),

    setIsActive: (active) => set({ isActive: active }),

    reset: () => set({
        sessionId: null,
        messages: [],
        isActive: false,
        questionCount: 0,
    }),
}));
