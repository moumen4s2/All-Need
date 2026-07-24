import React from "react";

export function Slider({
  value,
  onValueChange,
  min = 0,
  max = 100,
}) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      value={value[0]}
      onChange={(e) =>
        onValueChange([Number(e.target.value), value[1]])
      }
      className="w-full"
    />
  );
}