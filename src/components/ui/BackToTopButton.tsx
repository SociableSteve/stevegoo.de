"use client";

import React from "react";

interface BackToTopButtonProps {
  className?: string;
}

export function BackToTopButton({ className }: BackToTopButtonProps) {
  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={handleClick}
      className={className}
      type="button"
      aria-label="Back to top"
    >
      ↑ Back to Top
    </button>
  );
}