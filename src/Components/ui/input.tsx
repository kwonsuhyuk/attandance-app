import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <div className="w-full max-w-[500px] mx-auto">
        {" "}
        <input
          type={type}
          className={cn(
            "flex h-12 w-full rounded-lg bg-background px-0 py-2 text-base p-2",
            "border-[0px] border-slate-200",
            "shadow-[0_0_0_1px_rgba(0,0,0,0.2)]",
            "focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
