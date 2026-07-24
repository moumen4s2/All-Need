import React from "react";

export function Sheet({ open, onOpenChange, children }) {
  return React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;

    if (child.type === SheetTrigger) {
      return React.cloneElement(child, { onOpenChange });
    }

    if (child.type === SheetContent) {
      return React.cloneElement(child, { open, onOpenChange });
    }

    return child;
  });
}

export function SheetTrigger({ children, onOpenChange }) {
  return React.cloneElement(children, {
    onClick: () => onOpenChange?.(true),
  });
}

export function SheetContent({
  open,
  onOpenChange,
  children,
  className = "",
}) {
  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={() => onOpenChange?.(false)}
      />

      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-full bg-white shadow-xl z-50 p-6 overflow-y-auto ${className}`}
      >
        <button
          onClick={() => onOpenChange?.(false)}
          className="absolute top-4 right-4 text-xl"
        >
          ×
        </button>

        {children}
      </div>
    </>
  );
}

export function SheetHeader({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}

export function SheetTitle({ children, className = "" }) {
  return <h2 className={className}>{children}</h2>;
}