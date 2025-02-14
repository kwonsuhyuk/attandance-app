import { LogInIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

import AuthHeader from "@/components/auth/AuthHeader";
import AuthFooter from "@/components/auth/AuthFooter";
import LoginForm from "@/components/auth/LoginForm";
import AuthTestLoginBtn from "@/components/auth/AuthTestLoginBtn";

import { useLogin } from "../hooks/useLogin";

const LoginPage = () => {
  const { error, isLoading, emailRef, passwordRef, handleSubmit, handleGuestLogin } = useLogin();

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 space-y-6">
          <AuthHeader icon={LogInIcon} title="로그인" />

          <form onSubmit={handleSubmit} className="space-y-6">
            <LoginForm emailRef={emailRef} passwordRef={passwordRef} />

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <AuthTestLoginBtn handleGuestLogin={handleGuestLogin} loading={isLoading} />

            <AuthFooter
              buttonText="로그인"
              linkText="계정이 없나요? 회원가입으로 이동"
              linkTo="/signup"
              loading={isLoading}
            />
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
