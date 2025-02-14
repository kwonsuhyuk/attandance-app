import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/auth.store";

export const useLogin = () => {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const { error, isLoading, login, guestLogin, setError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = {
      email: emailRef.current?.value || "",
      password: passwordRef.current?.value || "",
    };

    await login(formData);
  };

  const handleGuestLogin = async (email: string, password: string) => {
    await guestLogin(email, password);
  };

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 3000);
    return () => clearTimeout(timer);
  }, [error]);

  return {
    error,
    isLoading,
    emailRef,
    passwordRef,
    handleSubmit,
    handleGuestLogin,
  };
};
