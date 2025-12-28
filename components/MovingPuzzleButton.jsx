"use client";

import { useRef, useState, useEffect } from "react";

export default function MovingPuzzleButton() {
  const buttonRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !isInitialized) {
      const centerX = window.innerWidth / 2 - 100; // 100 is half button width approx
      const centerY = window.innerHeight / 2;
      setPosition({ x: centerX, y: centerY });
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const moveButton = () => {
    if (typeof window === "undefined") return;

    const buttonWidth = buttonRef.current?.offsetWidth || 200;
    const buttonHeight = buttonRef.current?.offsetHeight || 50;

    // Calculate safe boundaries (with some padding)
    const padding = 20;
    const maxX = window.innerWidth - buttonWidth - padding;
    const maxY = window.innerHeight - buttonHeight - padding;

    // Generate random position
    const newX = Math.random() * Math.max(maxX, 100) + padding;
    const newY = Math.random() * Math.max(maxY, 100) + padding;

    setPosition({ x: newX, y: newY });
  };

  const handleMouseEnter = () => {
    moveButton();
  };

  if (!isInitialized) {
    return null; 
  }

  return (
    <button
      ref={buttonRef}
      onMouseEnter={handleMouseEnter}
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        transition: "all 0.3s ease-out",
        zIndex: 1000,
        backgroundColor: "#FFD700",
        color: "#000",
        padding: "12px 24px",
        border: "3px solid #FFA500",
        borderRadius: "8px",
        fontSize: "16px",
        fontWeight: "bold",
        cursor: "pointer",
        boxShadow: "0 4px 15px rgba(255, 215, 0, 0.4)",
        transform: "scale(1)",
      }}
      onMouseDown={(e) => {
        e.preventDefault();
        alert("🎉 Selamat, anda masuk circle Puzzle Solver at Vincoo Server 🎉\n\n by ircham.dev");
      }}
    >
      Solve Vincoo Puzzle
    </button>
  );
}
