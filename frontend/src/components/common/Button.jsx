import { LoaderCircle } from "lucide-react";
import { classNames } from "../../utils/classNames";

const variantClasses = {
  primary:
    "bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-elevation-2 hover:from-primary-700 hover:to-primary-600 active:from-primary-800 active:to-primary-700 focus:ring-2 focus:ring-primary-300",
  secondary:
    "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 active:bg-slate-100 focus:ring-2 focus:ring-slate-200 shadow-elevation-1",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200 focus:ring-2 focus:ring-slate-200",
  success:
    "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-elevation-2 hover:from-emerald-600 hover:to-emerald-700 active:from-emerald-700 active:to-emerald-800 focus:ring-2 focus:ring-emerald-300",
  danger:
    "bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-elevation-2 hover:from-rose-600 hover:to-rose-700 active:from-rose-700 active:to-rose-800 focus:ring-2 focus:ring-rose-300",
  warning:
    "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-elevation-2 hover:from-amber-600 hover:to-amber-700 active:from-amber-700 active:to-amber-800 focus:ring-2 focus:ring-amber-300",
  outline:
    "bg-transparent border-2 border-primary-500 text-primary-600 hover:bg-primary-50 active:bg-primary-100 focus:ring-2 focus:ring-primary-300",
};

const sizeClasses = {
  xs: "h-7 px-2 text-xs font-semibold rounded-md",
  sm: "h-8 px-2.5 text-xs font-semibold rounded-lg",
  md: "h-10 px-3.5 text-sm font-semibold rounded-lg sm:rounded-xl",
  lg: "h-11 px-4 text-sm font-semibold rounded-lg sm:rounded-xl",
  xl: "h-12 px-5 text-base font-semibold rounded-xl sm:rounded-2xl",
  full: "w-full h-11 px-4 text-sm font-semibold rounded-lg sm:rounded-xl",
  "full-lg": "w-full h-12 px-5 text-base font-semibold rounded-lg sm:rounded-xl",
};

const loadingStateClasses = "disabled:opacity-70 disabled:cursor-not-allowed";

export function Button({
  children,
  className,
  isLoading = false,
  size = "md",
  type = "button",
  variant = "primary",
  fullWidth = false,
  disabled = false,
  ...props
}) {
  const finalSize = fullWidth ? (size === "lg" ? "full-lg" : "full") : size;
  
  return (
    <button
      type={type}
      className={classNames(
        "inline-flex items-center justify-center gap-1.5 whitespace-nowrap transition-all duration-200",
        sizeClasses[finalSize],
        variantClasses[variant],
        loadingStateClasses,
        className
      )}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <LoaderCircle className="h-4 w-4 animate-spin" />
          <span className="hidden sm:inline">Loading...</span>
        </>
      ) : null}
      {!isLoading && children}
    </button>
  );
}