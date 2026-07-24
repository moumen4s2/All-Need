import React, { createContext, useContext, useState } from "react";

const Ctx = createContext();

export function DropdownMenu({ children }) {
  const [open, setOpen] = useState(false);
  return (
    <Ctx.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </Ctx.Provider>
  );
}

export function DropdownMenuTrigger({ asChild, children }) {
  const { open, setOpen } = useContext(Ctx);

  if (asChild) {
    return React.cloneElement(children, {
      onClick: () => setOpen(!open),
    });
  }

  return <button onClick={() => setOpen(!open)}>{children}</button>;
}

export function DropdownMenuContent({
  children,
  className = "",
  align = "end",
}) {
  const { open, setOpen } = useContext(Ctx);

  if (!open) return null;

  return (
    <div
      className={`absolute mt-2 ${
        align === "end" ? "right-0" : "left-0"
      } bg-white border rounded-xl shadow-lg py-2 z-50 ${className}`}
    >
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { closeMenu: () => setOpen(false) })
      )}
    </div>
  );
}

export function DropdownMenuItem({ children, onClick, closeMenu }) {
  return (
    <button
      className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-100"
      onClick={() => {
        onClick?.();
        closeMenu?.();
      }}
    >
      {children}
    </button>
  );
}