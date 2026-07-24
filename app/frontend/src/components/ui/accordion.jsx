import React, { useState } from "react";

export function Accordion({ children }) {
  return <div>{children}</div>;
}

export function AccordionItem({ children, className = "" }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={className}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, { open, setOpen })
      )}
    </div>
  );
}

export function AccordionTrigger({
  children,
  open,
  setOpen,
  className = "",
}) {
  return (
    <button
      onClick={() => setOpen(!open)}
      className={`w-full text-left ${className}`}
    >
      {children}
    </button>
  );
}

export function AccordionContent({
  children,
  open,
  className = "",
}) {
  if (!open) return null;

  return <div className={className}>{children}</div>;
}