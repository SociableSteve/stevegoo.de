"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to the console (in production, send to error reporting service)
    console.error("Application error:", error);
  }, [error]);

  return (
    <main id="main-content" className="container">
      <section className="section">
        <h1>Something went wrong!</h1>
        <p>
          An unexpected error occurred. Our team has been notified and is working
          to fix the issue.
        </p>
        <Button onClick={reset}>
          Try again
        </Button>
      </section>
    </main>
  );
}