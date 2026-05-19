"use client";

// This is file of your component
// You can use any dependencies from npm; we import them automatically in package.json

import { cn } from "@/lib/utils";
import { useState } from "react";

export const Component = () => {
  const [count, setCount] = useState(0);

  return (
    <div
      className={cn("min-h-screen w-full bg-white relative overflow-hidden")}
      onClick={() => setCount((prev) => prev + 1)}
      aria-label={`Demo glow interaction count: ${count}`}
    >
      {/* Light Sky Blue Glow */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at center, #93c5fd, transparent),
            url("https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1800&q=80")
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {/* Your Content Here */}
    </div>
  );
};

export default Component;
