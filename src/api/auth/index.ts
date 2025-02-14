import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { auth } from "@/firebase/index"; // 초기화된 auth import
import { TLoginForm, TSignupFormData, TLoginResponse, TSignupResponse } from "../../model/index";

export async function login({ email, password }: TLoginForm): Promise<TLoginResponse> {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}

export async function signup({
  email,
  password,
  name,
  companyCode,
  phoneNumber,
}: TSignupFormData): Promise<TSignupResponse> {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, {
      displayName: name,
      photoURL: companyCode,
    });
    return {
      success: true,
      data: { userId: user.uid },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}
