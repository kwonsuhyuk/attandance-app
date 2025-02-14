import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface GuestLoginButtonsProps {
  handleGuestLogin: (email: string, password: string) => Promise<void>;
  loading: boolean;
}

const AuthTestLoginBtn = ({ handleGuestLogin, loading }: GuestLoginButtonsProps) => {
  return (
    <div className="space-y-6">
      <Separator />
      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => handleGuestLogin("test@naver.com", "qweqwe")}
          disabled={loading}
        >
          관리자 Guest 로그인
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => handleGuestLogin("testep@naver.com", "qweqwe")}
          disabled={loading}
        >
          직원 Guest 로그인
        </Button>
      </div>
    </div>
  );
};

export default AuthTestLoginBtn;
