import { createContext, useContext, useEffect, useMemo, useState } from "react";

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [isBottomNavHidden, setIsBottomNavHidden] = useState(false);

  useEffect(() => {
    const isInteractiveField = (element) => {
      if (!(element instanceof HTMLElement)) {
        return false;
      }

      return Boolean(
        element.closest(
          'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]), textarea, select, [contenteditable="true"], [contenteditable=""]'
        )
      );
    };

    const handleFocusIn = (event) => {
      if (window.innerWidth >= 768) {
        return;
      }

      if (isInteractiveField(event.target)) {
        setIsBottomNavHidden(true);
      }
    };

    const handleFocusOut = () => {
      if (window.innerWidth >= 768) {
        return;
      }

      window.setTimeout(() => {
        if (!isInteractiveField(document.activeElement)) {
          setIsBottomNavHidden(false);
        }
      }, 0);
    };

    window.addEventListener("focusin", handleFocusIn);
    window.addEventListener("focusout", handleFocusOut);

    return () => {
      window.removeEventListener("focusin", handleFocusIn);
      window.removeEventListener("focusout", handleFocusOut);
    };
  }, []);

  const value = useMemo(
    () => ({
      isBottomNavHidden,
      hideBottomNav: () => setIsBottomNavHidden(true),
      showBottomNav: () => setIsBottomNavHidden(false),
    }),
    [isBottomNavHidden]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export const useUI = () => {
  const context = useContext(UIContext);

  if (!context) {
    throw new Error("useUI must be used within a UIProvider.");
  }

  return context;
};
