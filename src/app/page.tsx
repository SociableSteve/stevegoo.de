import type { Metadata } from "next";
import Link from "next/link";
import { MarkdownPostRepository } from "@/content/markdown.repository";
import { PostCard } from "@/components/blog/PostCard";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { MentorIcon, GrowthIcon, TargetIcon } from "@/components/icons";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Steve Goode - Head of Engineering",
  description: "Head of Engineering at Nearform with 20+ years experience building high-performing teams. Strategic thinker, collaborative leader empowering teams to deliver while creating accepting cultures.",
  openGraph: {
    type: "website",
    title: "Steve Goode - Head of Engineering",
    description: "Head of Engineering at Nearform with 20+ years experience building high-performing teams.",
  },
};

export default async function HomePage() {
  // Fetch recent posts for the writing section
  const postRepository = new MarkdownPostRepository();
  const recentPosts = await postRepository.findPublished({ page: 1, perPage: 4 });

  return (
    <main id="main-content" className={styles["main"]}>
      {/* Hero Section */}
      <section className={styles["hero"]} aria-labelledby="hero-heading">
        <div className={styles["container"]}>
          <div className={styles["heroContent"]}>
            <div className={styles["heroText"]}>
              <Badge variant="neutral" className={styles["roleTag"] ?? ""}>
                Head of Engineering
              </Badge>
              <h1 id="hero-heading" className={styles["heroTitle"]}>
                Building high-performing teams and technical excellence
              </h1>
              <p className={styles["heroDescription"]}>
                With 20+ years in software engineering, I lead teams at Nearform to deliver
                exceptional results. Specializing in technical mentoring, engineering
                promotion processes, and creating cultures where engineers excel.
              </p>
              <div className={styles["heroActions"]}>
                <Link href="/blog" className={styles["buttonPrimary"]}>Read My Writing</Link>
                <Link href="/about" className={styles["buttonSecondary"]}>About Me</Link>
              </div>
            </div>
            <div className={styles["heroVisual"]}>
              <div className={styles["heroGrid"]} aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>

      {/* Professional Credibility Section */}
      <section className={styles["credibility"]} aria-labelledby="experience-heading">
        <div className={styles["container"]}>
          <h2 id="experience-heading" className={styles["sectionTitle"]}>
            Trusted by Engineering Teams
          </h2>
          <div className={styles["experienceGrid"]}>
            <Card className={styles["experienceCard"]}>
              <h3>20+ Years</h3>
              <p>Software engineering and technical leadership experience</p>
            </Card>
            <Card className={styles["experienceCard"]}>
              <h3>Head of Engineering</h3>
              <p>Leading teams at Nearform, a global technology consultancy</p>
            </Card>
            <Card className={styles["experienceCard"]}>
              <h3>Technical Excellence</h3>
              <p>Mentoring, promotion processes, and recruitment expertise</p>
            </Card>
          </div>
          <div className={styles["companies"]}>
            <p className={styles["companiesLabel"]}>Previously at:</p>
            <div className={styles["companyList"]}>
              <span>Nearform</span>
              <span>Sky Betting & Gaming</span>
              <span>MICRON RESEARCH LIMITED</span>
            </div>
          </div>
        </div>
      </section>

      {/* What I Focus On Section */}
      <section className={styles["focus"]} aria-labelledby="focus-heading">
        <div className={styles["container"]}>
          <h2 id="focus-heading" className={styles["sectionTitle"]}>
            What I Focus On
          </h2>
          <div className={styles["focusGrid"]}>
            <Card className={styles["focusCard"]}>
              <div className={styles["focusIcon"]} aria-hidden="true">
                <MentorIcon />
              </div>
              <h3>Technical Mentoring</h3>
              <p>
                Coaching engineering leads and senior developers to reach their full
                potential. Structured mentoring programs that build technical
                excellence and leadership capabilities across teams.
              </p>
            </Card>
            <Card className={styles["focusCard"]}>
              <div className={styles["focusIcon"]} aria-hidden="true">
                <GrowthIcon />
              </div>
              <h3>Promotion Processes</h3>
              <p>
                Designing and running transparent engineering promotion frameworks.
                Creating clear career paths that recognize technical contributions
                and leadership growth at every level.
              </p>
            </Card>
            <Card className={styles["focusCard"]}>
              <div className={styles["focusIcon"]} aria-hidden="true">
                <TargetIcon />
              </div>
              <h3>Technical Recruitment</h3>
              <p>
                Building world-class engineering teams through strategic hiring.
                Developing assessment processes that identify both technical
                excellence and cultural fit for high-performing teams.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Recent Writing Section */}
      <section className={styles["writing"]} aria-labelledby="writing-heading">
        <div className={styles["container"]}>
          <div className={styles["writingHeader"]}>
            <h2 id="writing-heading" className={styles["sectionTitle"]}>
              Recent Writing
            </h2>
            <Link href="/blog" className={styles["buttonSecondary"]}>View All Posts</Link>
          </div>

          {recentPosts.items.length > 0 ? (
            <div className={styles["postsGrid"]}>
              {recentPosts.items.slice(0, 3).map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          ) : (
            <Card className={styles["emptyState"]}>
              <h3>Coming Soon</h3>
              <p>I&apos;m working on some great content about engineering leadership and system design. Check back soon!</p>
            </Card>
          )}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className={styles["cta"]} aria-labelledby="cta-heading">
        <div className={styles["container"]}>
          <Card className={styles["ctaCard"]}>
            <div className={styles["ctaContent"]}>
              <h2 id="cta-heading" className={styles["ctaTitle"]}>
                Let&apos;s Connect
              </h2>
              <p className={styles["ctaDescription"]}>
                Interested in technical mentoring, engineering leadership, or
                building high-performing teams? Let&apos;s connect and discuss
                engineering excellence.
              </p>
              <div className={styles["ctaActions"]}>
                <Link href="mailto:steve@example.com" className={styles["buttonPrimary"]}>Get In Touch</Link>
                <Link href="/blog" className={styles["buttonSecondary"]}>Read More</Link>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
