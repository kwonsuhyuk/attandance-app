import { create } from "zustand";
import { signup } from "@/api/auth";
import { validateCompanyCode } from "@/api";
import { signupFormSchema } from "@/model";
import { z } from "zod";
import type { TPosition, TSignupFormData, TSignupUserData } from "@/model";

interface ISignupState {
  isLoading: boolean;
  error: string | null;
  position: TPosition;
  isManagerCheck: boolean;
  isCodeValid: boolean;
  tempCompInfo: string;

  setError: (error: string | null) => void;
  setPosition: (position: TPosition) => void;
  setManagerCheck: (isChecked: boolean) => void;
  checkCompanyCode: (code: string, form: any) => Promise<void>;
  submitSignup: (formData: TSignupFormData, form: any) => Promise<TSignupUserData>;
}

export const useSignupStore = create<ISignupState>(set => ({
  isLoading: false,
  error: null,
  position: "",
  isManagerCheck: false,
  isCodeValid: false,
  tempCompInfo: "",

  setError: error => set({ error }),

  setPosition: position => set({ position }),

  setManagerCheck: isChecked => set({ isManagerCheck: isChecked }),

  checkCompanyCode: async (code, form) => {
    try {
      const result = await validateCompanyCode(code);
      if (result.isValid && result.companyName) {
        set({
          tempCompInfo: result.companyName,
          isCodeValid: true,
        });
      } else {
        form.setError("companyCode", {
          type: "manual",
          message: result.error || "유효하지 않은 회사 코드입니다",
        });
        set({ isCodeValid: false });
      }
    } catch (error) {
      form.setError("companyCode", {
        type: "manual",
        message: "회사 코드 확인 중 오류가 발생했습니다",
      });
      set({ isCodeValid: false });
    }
  },

  submitSignup: async (formData, form) => {
    set({ isLoading: true, error: null });
    try {
      signupFormSchema.parse(formData);

      const result = await signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        companyCode: formData.companyCode,
        phoneNumber: formData.phoneNumber,
        confirmPW: formData.confirmPW,
      });

      if (!result.success || !result.data) {
        throw new Error(result.error);
      }

      const userData: TSignupUserData = {
        id: result.data.userId,
        name: formData.name,
        companyCode: formData.companyCode,
        phoneNumber: formData.phoneNumber,
      };

      return userData;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldName = error.errors[0].path[0];
        form.setError(fieldName as any, {
          type: "manual",
          message: error.errors[0].message,
        });
      }
      set({ error: error instanceof Error ? error.message : "An error occurred" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
