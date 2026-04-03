import { classNames } from "../../utils/classNames";

export function GlassCard({ 
  children, 
  className = "", 
  hover = true,
  ...props 
}) {
  return (
    <div
      className={classNames(
        "rounded-2xl border border-white/20 bg-white/80 p-6 shadow-soft backdrop-blur-xl transition-all duration-300",
        hover && "hover:shadow-xl hover:bg-white/90",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
