import React, { createContext, useContext, useState } from "react";

const TabsContext = createContext();

export function Tabs({ defaultValue, children }) {
  const [value, setValue] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      {children}
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className = "" }) {
  return <div className={className}>{children}</div>;
}

export function TabsTrigger({ value, children, className = "" }) {
  const ctx = useContext(TabsContext);

  return (
    <button
      className={className}
      onClick={() => ctx.setValue(value)}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className = "" }) {
  const ctx = useContext(TabsContext);

  if (ctx.value !== value) return null;

  return <div className={className}>{children}</div>;
}