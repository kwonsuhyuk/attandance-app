import { z } from "zod";

// 로그인 스키마 정의 (유효성 검사)
export const loginFormSchema = z.object({
  email: z.string().email({ message: "유효한 이메일을 입력하세요." }),
  password: z.string().min(6, { message: "비밀번호는 최소 6자 이상이어야 합니다." }),
});

export type TLoginForm = z.infer<typeof loginFormSchema>;

// 기본 회원가입 정보 스키마
const signupUserBaseSchema = z.object({
  name: z.string().min(2, { message: "이름은 2자 이상이어야 합니다." }),
  // .regex(/^[가-힣a-zA-Z\s]+$/, { message: "올바른 이름 형식이 아닙니다" }),
  companyCode: z.string().min(5, { message: "올바른 회사 코드를 입력해주세요" }),
  phoneNumber: z.string().regex(/^01(?:0|1|[6-9])-(?:\d{3}|\d{4})-\d{4}$/, {
    message: "올바른 전화번호 형식이 아닙니다 (예: 010-1234-5678)",
  }),
});

export const signupFormSchema = loginFormSchema
  .merge(signupUserBaseSchema)
  .extend({
    confirmPW: z.string().min(1, { message: "비밀번호 확인을 입력해주세요" }),
  })
  .refine(data => data.password === data.confirmPW, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPW"],
  });

// 회원가입 데이터 스키마 (id 포함)
export const signupUserDataSchema = signupUserBaseSchema.extend({
  id: z.string(),
});

export type TSignupFormData = z.infer<typeof signupFormSchema>;
export type TSignupUserData = z.infer<typeof signupUserDataSchema>;

// 로그인,회원가입 auth관련 에러
export type TLoginResponse = {
  success: boolean;
  error?: string;
};

export type TSignupResponse = {
  success: boolean;
  data?: {
    userId: string;
  };
  error?: string;
};

// 직원,관리자,default
export type TPosition = "manager" | "employee" | "";

export type TJob = {
  jobName: string;
};

export type TCompanyInfo = {
  adminName: string;
  companyLogo: string;
  companyName: string;
  holidayPay: number;
  holidayList?: string[];
  isNightPay: number;
  isdaynight: boolean;
  isholiday: boolean;
  jobName: Record<string, TJob>;
  nightEnd: number;
  nightStart: number;
  payCheckDay: number;
  qrValue: string;
};

// 날짜별 근무 시간 타입
export type WorkTime = {
  startTime?: string;
  endTime?: string;
};

// 날짜별 근무 데이터 타입
export type WorkData = {
  daySalary: number;
  holidayAndWeekendSalary: number;
  nightSalary: number;
  workHour: number;
};

// 날짜 맵 타입 (키는 날짜 문자열, 값은 WorkTime 또는 WorkData)
export type DateMap<T> = {
  [date: string]: T;
};

// 사용자 데이터 타입
export type UserData = {
  companyCode: string;
  date: DateMap<WorkTime>;
  email: string;
  jobName: string;
  name: string;
  phoneNumber: string;
  salaryAmount: number;
  salaryType: string;
  uid: string;
  userType: string;
  workDates: DateMap<WorkData>;
};
