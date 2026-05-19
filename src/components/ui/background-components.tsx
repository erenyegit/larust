"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

export const Component = () => {
  const [count, setCount] = useState(0);

  return (
    <div
      className={cn("min-h-screen w-full relative bg-white overflow-hidden")}
      onClick={() => setCount((prev) => prev + 1)}
      aria-label={`Background component interaction count: ${count}`}
    >
      {/* Soft Yellow Glow */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at center, #FFF991 0%, transparent 70%),
            url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=80")
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.6,
          mixBlendMode: "multiply",
        }}
      />
      {/* Your Content/Components */}
    </div>
  );
};

export default Component;
