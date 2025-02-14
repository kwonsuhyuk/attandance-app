import { LockIcon } from "lucide-react";
import { Form } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

import AuthHeader from "@/components/auth/AuthHeader";
import AuthFooter from "@/components/auth/AuthFooter";
import { PositionSelector } from "@/components/auth/PositionSelector";
import { ManagerConfirmation } from "@/components/auth/ManagerConfirmation";
import { EmployeeCompanyForm } from "@/components/auth/EmployeeCompanyForm";
import { PersonalInfoForm } from "@/components/auth/PersonalInfoForm";
import { useSignup } from "../hooks/useSignup";

const SignupPage = () => {
  const {
    loading,
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
    checkCompanyCode,
    onSubmit,
  } = useSignup();

  return (
    <div className="mt-10">
      <div className="max-w-md mx-auto px-4">
        <div className="flex flex-col justify-center items-center">
          <AuthHeader icon={LockIcon} title="회원가입" />

          <Form {...form}>
            <form onSubmit={onSubmit} className="w-full mt-4 space-y-6">
              <PositionSelector position={position} onPositionChange={handlePositionChange} />

              {position === "manager" && (
                <ManagerConfirmation
                  isManagerCheck={isManagerCheck}
                  setManagerCheck={setManagerCheck}
                />
              )}

              {position === "employee" && (
                <EmployeeCompanyForm
                  form={form}
                  isCodeValid={isCodeValid}
                  tempCompInfo={tempCompInfo}
                  companyCode={companyCode}
                  checkCompanyCode={checkCompanyCode}
                />
              )}

              <Separator />

              <PersonalInfoForm form={form} password={password} />

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Separator />

              <AuthFooter
                buttonText="회원가입"
                linkText="계정이 있나요? 로그인으로 이동"
                linkTo="/signin"
                loading={loading}
              />
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
