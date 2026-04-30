import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useUI } from "../../context/UIContext";
import { useEffect } from "react";

export function Modal({ 
  children, 
  description, 
  footer, 
  onClose, 
  open, 
  title,
  size = "md", // xs, sm, md, lg, xl, full
  fullHeight = false,
  preventClose = false,
}) {
  const { hideBottomNav, showBottomNav } = useUI();
  
  useEffect(() => {
    if (open) {
      hideBottomNav();
    } else {
      showBottomNav();
    }
    
    return () => {
      showBottomNav();
    };
  }, [open, hideBottomNav, showBottomNav]);

  const sizeClasses = {
    xs: "max-w-xs",
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
    full: "max-w-full",
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-stretch justify-center bg-slate-900/60 backdrop-blur-sm sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={!preventClose ? onClose : undefined}
        >
          <motion.div
            className={`relative flex w-full flex-col overflow-hidden bg-white sm:my-auto sm:rounded-2xl sm:rounded-[28px] sm:border sm:border-slate-200 sm:shadow-2xl ${
              fullHeight 
                ? "h-full sm:h-auto sm:max-h-[90vh]" 
                : "h-full sm:h-auto sm:max-h-[90vh]"
            } ${size === "full" ? "max-w-full" : sizeClasses[size]}`}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.25, type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar for mobile - hidden since we're fullscreen */}
            <div className="hidden sm:flex justify-center py-3">
              <div className="h-1 w-12 rounded-full bg-slate-300" />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-4 py-4 sm:border-0 sm:px-6 sm:py-5">
              <div className="flex-1 pr-2">
                <h3 className="font-display text-xl font-bold text-slate-900">
                  {title}
                </h3>
                {description && (
                  <p className="mt-1.5 text-sm text-slate-500">{description}</p>
                )}
              </div>

              {!preventClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="shrink-0 rounded-full bg-slate-100 p-2.5 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-4 pb-6 sm:px-6 sm:pb-5">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="border-t border-slate-100 bg-slate-50/80 px-4 py-4 sm:px-6 sm:py-4">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}