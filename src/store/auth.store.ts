// store/auth.store.ts
import { create } from "zustand";
import { login } from "@/api/auth";
import { z } from "zod";
import { loginFormSchema, TLoginForm } from "@/model";

interface IAuthState {
  isLoading: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  login: (formData: TLoginForm) => Promise<void>;
  guestLogin: (email: string, password: string) => Promise<void>;
}

export const useAuthStore = create<IAuthState>(set => ({
  isLoading: false,
  error: null,
  setError: error => set({ error }),

  login: async formData => {
    try {
      loginFormSchema.parse(formData);
      set({ isLoading: true, error: null });

      const response = await login(formData);
      if (!response.success) {
        set({ error: "이메일 또는 비밀번호가 올바르지 않습니다" });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldName = error.errors[0].path[0];
        if (fieldName === "email") {
          set({ error: "이메일 형식이 올바르지 않습니다" });
        } else if (fieldName === "password") {
          set({ error: "비밀번호는 6자 이상이어야 합니다" });
        }
      } else {
        set({ error: "로그인 중 오류가 발생했습니다" });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  guestLogin: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const response = await login({ email, password });
      if (!response.success) {
        set({ error: "게스트 로그인 실패" });
      }
    } catch (error) {
      set({ error: "게스트 로그인 중 오류가 발생했습니다" });
    } finally {
      set({ isLoading: false });
    }
  },
}));
