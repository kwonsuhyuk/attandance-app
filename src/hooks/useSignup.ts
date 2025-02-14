import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSignupStore } from "@/store/signup.store";
import { useUserStore } from "@/store/user.store";
import { signupFormSchema, UserData } from "@/model";
import type { TSignupFormData, TPosition } from "@/model";

export const useSignup = () => {
  const navigate = useNavigate();
  const { setUser } = useUserStore();
  const {
    isLoading,
    error,
    position,
    isManagerCheck,
    isCodeValid,
    tempCompInfo,
    setError,
    setPosition,
    setManagerCheck,
    checkCompanyCode,
    submitSignup,
  } = useSignupStore();

  const form = useForm<TSignupFormData>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPW: "",
      companyCode: "",
    },
  });

  const password = form.watch("password");
  const companyCode = form.watch("companyCode");

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 3000);
    return () => clearTimeout(timer);
  }, [error, setError]);

  const handlePositionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPosition(e.target.value as TPosition);
  };

  const onSubmit = async (data: TSignupFormData) => {
    try {
      const signupData = await submitSignup(data, form);

      // UserData 형식에 맞게 변환
      const userData: UserData = {
        uid: signupData.id,
        name: signupData.name,
        email: data.email,
        companyCode: signupData.companyCode,
        phoneNumber: signupData.phoneNumber,
        jobName: "",
        salaryAmount: 0,
        salaryType: "",
        userType: position,
        date: {},
        workDates: {},
      };

      setUser(userData);
      navigate(position === "manager" ? "/managerfirst" : "/employeefirst", {
        state: userData,
      });
    } catch (error) {
      console.error("Signup error:", error);
    }
  };

  useEffect(() => {
    if (window.innerWidth <= 600 && isManagerCheck) {
      alert(
        "관리자는 PC 전용 서비스 입니다. PC버전으로 회원가입을 진행하셔야 추후에 문제가 발생하지 않습니다. PC로 회원가입 진행 부탁드립니다.",
      );
    }
  }, [isManagerCheck]);

  return {
    loading: isLoading,
    error,
    position,
    isManagerCheck,
    isCodeValid,
    tempCompInfo,
    form,
    password,
    companyCode,
    setManagerCheck,
    handlePositionChange,
    checkCompanyCode: (code: string) => checkCompanyCode(code, form),
    onSubmit: form.handleSubmit(onSubmit),
  };
};
