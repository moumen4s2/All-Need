import React from "react";

export const Select = ({ children }) => <>{children}</>;
export const SelectContent = ({ children }) => <>{children}</>;
export const SelectValue = ({ placeholder }) => <span>{placeholder}</span>;
export const SelectItem = ({ children }) => <option>{children}</option>;

export function SelectTrigger({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}