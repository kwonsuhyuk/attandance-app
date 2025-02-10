import { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import {
  Alert,
  Avatar,
  Checkbox,
  Container,
  Divider,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  FormControl,
} from "@mui/material";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import LoadingButton from "@mui/lab/LoadingButton";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../store/userSlice";
import { Button } from "antd";
import { useForm, Controller } from "react-hook-form";

import { TSignupForm, TSignupUserData, TSignupFormData, TSignupResponse } from "../model";
import { validateCompanyCode } from "../api/index";
import { signup } from "../api/auth";

import AuthHeader from "@/Components/auth/AuthHeader";
import AuthFooter from "@/Components/auth/AuthFooter";

const SignupPage = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [position, setPosition] = useState<string>("");
  const [isManagerCheck, setManagerCheck] = useState<boolean>(false);
  const [isCodeValid, setIsCodeValid] = useState<boolean>(false);
  const [tempCompInfo, setTempCompInfo] = useState<string>("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<TSignupFormData>({
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPW: "",
      companyCode: "",
    },
  });

  const password = watch("password");
  const companyCode = watch("companyCode");

  // cleanup 함수 추가 -> 이전 타이머를 정리하고 새로운 타이머로 시작 -> 메모리 누수 방지
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(""), 3000);
    return () => clearTimeout(timer);
  }, [error]);

  const handlePositionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPosition(e.target.value);
  };

  const checkCompanyCode = async (code: string) => {
    const result = await validateCompanyCode(code);
    if (result.isValid && result.companyName) {
      setTempCompInfo(result.companyName);
      setIsCodeValid(true);
    } else {
      setError(result.error || "회사 코드 확인 중 오류가 발생했습니다.");
      setIsCodeValid(false);
    }
  };

  const sendUserInfo = useCallback(
    async (formData: TSignupFormData) => {
      setLoading(true);
      try {
        const result = await signup({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          companyCode: formData.companyCode,
          phoneNumber: formData.phoneNumber,
        });

        if (!result.success || !result.data) {
          throw new Error(result.error || "회원가입 중 오류가 발생했습니다.");
        }

        const userData: TSignupUserData = {
          id: result.data.userId,
          name: formData.name,
          companyCode: formData.companyCode,
          phoneNumber: formData.phoneNumber,
        };

        dispatch(setUser(userData));

        if (position === "manager") {
          navigate("/managerfirst", {
            state: userData,
          });
        } else if (position === "employee") {
          navigate("/employeefirst", {
            state: userData,
          });
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    },
    [dispatch, position, navigate],
  );

  const onSubmit = (data: TSignupFormData) => {
    sendUserInfo(data);
  };

  useEffect(() => {
    if (window.innerWidth <= 600 && isManagerCheck) {
      alert(
        "관리자는 PC 전용 서비스 입니다. PC버전으로 회원가입을 진행하셔야 추후에 문제가 발생하지 않습니다. PC로 회원가입 진행 부탁드립니다.",
      );
    }
  }, [isManagerCheck]);

  // varient="p" 임시 제거
  return (
    <div className="mt-20">
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <AuthHeader icon={LockOpenIcon} title="회원가입" />

          <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
            <div className="p-3 rounded border-solid border-2 border-blue-400">
              <FormLabel id="demo-controlled-radio-buttons-group">가입 포지션</FormLabel>
              <RadioGroup value={position} onChange={handlePositionChange}>
                <FormControlLabel value="manager" control={<Radio />} label="관리자" />
                <FormControlLabel value="employee" control={<Radio />} label="직원" />
              </RadioGroup>
            </div>

            {position === "manager" && (
              <FormControl error={position === "manager" && !isManagerCheck}>
                <FormControlLabel
                  className="text-red-500"
                  label="관리자로 가입하는 것이 맞습니까?"
                  control={
                    <Checkbox
                      checked={isManagerCheck}
                      onChange={e => setManagerCheck(e.target.checked)}
                    />
                  }
                />
                {position === "manager" && !isManagerCheck && (
                  <FormHelperText>체크 항목을 체크해주세요</FormHelperText>
                )}
              </FormControl>
            )}

            {position === "employee" && (
              <>
                <Typography component="p" color="black" sx={{ mt: 2 }}>
                  가입 회사 정보
                </Typography>
                <div className="flex flex-col items-stretch mb-2">
                  {!isCodeValid ? (
                    <Controller
                      name="companyCode"
                      control={control}
                      rules={{
                        required: position === "employee" && "회사코드를 입력해주세요",
                        validate: value =>
                          position === "employee" && !isCodeValid
                            ? "회사코드 인증버튼을 눌러주세요"
                            : true,
                      }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          className="w-full flex-grow"
                          margin="normal"
                          required
                          label="회사코드"
                          autoComplete="off"
                          error={!!errors.companyCode}
                          helperText={errors.companyCode?.message}
                          disabled={isCodeValid}
                        />
                      )}
                    />
                  ) : (
                    <TextField
                      className="w-full flex-grow"
                      margin="normal"
                      autoComplete="off"
                      disabled={isCodeValid}
                      value={tempCompInfo}
                    />
                  )}
                  <Button
                    className="w-full flex-grow"
                    onClick={() => checkCompanyCode(companyCode || "")}
                  >
                    회사찾기
                  </Button>
                </div>
                <Typography component="p" color="gray" sx={{ fontSize: "12px", mb: 2 }}>
                  (회사 관리자에게 받은 회사코드를 입력해주세요.)
                </Typography>
              </>
            )}

            <Divider />
            <Typography component="p" color="black" sx={{ mt: 2 }}>
              개인 정보
            </Typography>

            <Controller
              name="name"
              control={control}
              rules={{ required: "이름을 입력해주세요" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  label="이름"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  autoComplete="off"
                />
              )}
            />

            <Controller
              name="email"
              control={control}
              rules={{
                required: "이메일을 입력해주세요",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "유효한 이메일 주소를 입력해주세요",
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  label="이메일"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  autoComplete="off"
                />
              )}
            />

            <Typography component="p" color="gray" sx={{ fontSize: "12px" }}>
              (유효한 이메일을 작성해주셔야 합니다!) <br />
              (이메일형식예시 : hongildong@naver.com)
            </Typography>

            <Controller
              name="phoneNumber"
              control={control}
              rules={{ required: "전화번호를 입력해주세요" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  label="전화번호"
                  error={!!errors.phoneNumber}
                  helperText={errors.phoneNumber?.message}
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              rules={{
                required: "비밀번호를 입력해주세요",
                minLength: {
                  value: 6,
                  message: "비밀번호는 6자리 이상이어야 합니다",
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  label="비밀번호"
                  type="password"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                />
              )}
            />

            <Typography component="p" color="gray" sx={{ fontSize: "12px" }}>
              (비밀번호는 6자리 이상으로 작성해주세요.)
            </Typography>

            <Controller
              name="confirmPW"
              control={control}
              rules={{
                required: "비밀번호 확인을 입력해주세요",
                validate: value => value === password || "비밀번호가 일치하지 않습니다",
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  required
                  fullWidth
                  label="비밀번호확인"
                  type="password"
                  error={!!errors.confirmPW}
                  helperText={errors.confirmPW?.message}
                />
              )}
            />

            {error ? (
              <Alert sx={{ mt: 3 }} severity="error">
                {error}
              </Alert>
            ) : null}

            <Divider />

            {/* 버튼과 페이지이동 */}
            <AuthFooter
              buttonText="회원가입"
              linkText="계정이 있나요? 로그인으로 이동"
              linkTo="/signin"
              loading={loading}
            />
          </Box>
        </Box>
      </Container>
    </div>
  );
};

export default SignupPage;
