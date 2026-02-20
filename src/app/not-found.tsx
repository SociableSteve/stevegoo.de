import Link from "next/link";
import { Card } from "@/components/ui/Card";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <main id="main-content" className={styles["main"]}>
      <div className={styles["container"]}>
        <Card className={styles["errorCard"]}>
          <div className={styles["errorContent"]}>
            <h1 className={styles["errorTitle"]}>404</h1>
            <h2 className={styles["errorSubtitle"]}>Page Not Found</h2>
            <p className={styles["errorDescription"]}>
              Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
            <div className={styles["errorActions"]}>
              <Link href="/" className={styles["homeLink"]}>
                ← Back to Home
              </Link>
              <Link href="/blog" className={styles["blogLink"]}>
                Browse Blog Posts
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}