"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function ProgressLoader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((old) => {
        if (old >= 100) {
          clearInterval(interval);
          return 100;
        }
        return old + 0.5;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex h-screen flex-col items-center justify-center bg-white px-4">
      <Image
        src="/logo.jpg"
        alt="Logo"
        width={192}
        height={192}
        className="mb-6 h-48 w-48"
      />

      <p className="mb-4 text-xl text-gray-700">
        Chargement... {Math.floor(progress)}%
      </p>

      <div className="absolute bottom-10 h-6 w-11/12 max-w-xl overflow-hidden rounded bg-gray-200">
        <div
          className="h-6 rounded bg-blue-600"
          style={{ width: `${progress}%`, transition: "width 0.1s linear" }}
        />
      </div>
    </div>
  );
}
