import { UseFormReturn } from "react-hook-form";
import { TSignupFormData } from "@/model";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface IEmployeeCompanyFormProps {
  form: UseFormReturn<TSignupFormData>;
  isCodeValid: boolean;
  tempCompInfo: string;
  companyCode: string | undefined;
  checkCompanyCode: (code: string) => Promise<void>;
}

export const EmployeeCompanyForm = ({
  form,
  isCodeValid,
  tempCompInfo,
  companyCode,
  checkCompanyCode,
}: IEmployeeCompanyFormProps) => {
  return (
    <div className="space-y-4">
      <h4 className="text-black font-medium">가입 회사 정보</h4>

      <div className="space-y-2">
        {!isCodeValid ? (
          <FormField
            control={form.control}
            name="companyCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">회사코드</FormLabel>
                <FormControl>
                  <Input {...field} required autoComplete="off" disabled={isCodeValid} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <FormItem>
            <FormLabel>회사정보</FormLabel>
            <FormControl>
              <Input disabled value={tempCompInfo} className="bg-gray-100" />
            </FormControl>
          </FormItem>
        )}

        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => checkCompanyCode(companyCode || "")}
        >
          회사찾기
        </Button>
      </div>

      <p className="text-gray-500 text-sm">(회사 관리자에게 받은 회사코드를 입력해주세요.)</p>
    </div>
  );
};

export default EmployeeCompanyForm;
