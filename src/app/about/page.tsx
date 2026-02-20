import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "About - Steve Goode",
  description: "Learn about my 20+ year journey as a Head of Engineering, specializing in technical mentoring, team building, and engineering excellence.",
  openGraph: {
    type: "website",
    title: "About - Steve Goode",
    description: "Learn about my 20+ year journey as a Head of Engineering, specializing in technical mentoring, team building, and engineering excellence.",
  },
};

export default function AboutPage() {
  return (
    <main id="main-content" className={styles["main"]}>
      {/* Hero Section */}
      <section className={styles["hero"]}>
        <div className={styles["container"]}>
          <div className={styles["heroContent"]}>
            <h1 className={styles["heroTitle"]}>
              Empowering engineering teams to achieve excellence
            </h1>
            <p className={styles["heroDescription"]}>
              I&apos;m Steve Goode, Head of Engineering at Nearform with over 20 years of experience
              in software engineering and technical leadership. I specialize in technical mentoring,
              engineering promotion processes, and building high-performing teams that deliver
              exceptional results.
            </p>
          </div>
        </div>
      </section>

      {/* Journey Section */}
      <section className={styles["journey"]}>
        <div className={styles["container"]}>
          <h2 className={styles["sectionTitle"]}>My Journey</h2>
          <div className={styles["timeline"]}>
            <div className={styles["timelineItem"]}>
              <div className={styles["timelineMarker"]} />
              <Card className={styles["timelineCard"]}>
                <h3>Head of Engineering - Nearform</h3>
                <p className={styles["timelinePeriod"]}>Present</p>
                <p>
                  Leading engineering excellence at a global technology consultancy.
                  Running engineering promotion processes, technical lead mentoring and coaching,
                  technical recruitment processes, and performance review analysis.
                  Building high-performing teams that deliver world-class software solutions.
                </p>
              </Card>
            </div>

            <div className={styles["timelineItem"]}>
              <div className={styles["timelineMarker"]} />
              <Card className={styles["timelineCard"]}>
                <h3>Senior Engineering Roles - Sky Betting & Gaming</h3>
                <p className={styles["timelinePeriod"]}>Previous Role</p>
                <p>
                  Developed expertise in large-scale systems and team leadership within
                  one of the UK&apos;s leading technology companies. Gained experience in
                  high-availability systems serving millions of users.
                </p>
              </Card>
            </div>

            <div className={styles["timelineItem"]}>
              <div className={styles["timelineMarker"]} />
              <Card className={styles["timelineCard"]}>
                <h3>Software Engineering - MICRON RESEARCH LIMITED</h3>
                <p className={styles["timelinePeriod"]}>Earlier Career</p>
                <p>
                  Built foundational engineering skills and experience in software development.
                  Developed understanding of professional software practices and contributed
                  to innovative technology solutions.
                </p>
              </Card>
            </div>

            <div className={styles["timelineItem"]}>
              <div className={styles["timelineMarker"]} />
              <Card className={styles["timelineCard"]}>
                <h3>20+ Years of Growth</h3>
                <p className={styles["timelinePeriod"]}>Ongoing Journey</p>
                <p>
                  Continuous evolution from individual contributor to technical leader,
                  building expertise in software engineering, team building, and
                  organizational excellence throughout two decades in the industry.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className={styles["philosophy"]}>
        <div className={styles["container"]}>
          <h2 className={styles["sectionTitle"]}>Leadership Philosophy</h2>
          <div className={styles["philosophyGrid"]}>
            <Card className={styles["philosophyCard"]}>
              <h3>People First</h3>
              <p>
                Great software is built by great teams. I prioritize creating environments
                where engineers can do their best work, grow their skills, and find meaning
                in what they build.
              </p>
            </Card>

            <Card className={styles["philosophyCard"]}>
              <h3>Technical Excellence</h3>
              <p>
                Quality isn&apos;t negotiable. I believe in building systems that are maintainable,
                scalable, and reliable. This means investing in good practices, tooling,
                and architecture from the start.
              </p>
            </Card>

            <Card className={styles["philosophyCard"]}>
              <h3>Continuous Learning</h3>
              <p>
                Technology evolves rapidly, and so must we. I foster cultures of learning,
                experimentation, and knowledge sharing where teams can adapt and grow
                together.
              </p>
            </Card>

            <Card className={styles["philosophyCard"]}>
              <h3>Impact-Driven</h3>
              <p>
                Every line of code should serve a purpose. I focus teams on delivering
                meaningful value to users while maintaining a sustainable pace and
                high engineering standards.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section className={styles["skills"]}>
        <div className={styles["container"]}>
          <h2 className={styles["sectionTitle"]}>Technical Expertise</h2>
          <div className={styles["skillsGrid"]}>
            <Card className={styles["skillCard"]}>
              <h4>Technical Leadership</h4>
              <p>Engineering Mentoring, Technical Coaching, Promotion Frameworks, Performance Management</p>
            </Card>

            <Card className={styles["skillCard"]}>
              <h4>Recruitment & Development</h4>
              <p>Technical Recruitment, Team Building, Career Development, Skills Assessment</p>
            </Card>

            <Card className={styles["skillCard"]}>
              <h4>Modern Web Technologies</h4>
              <p>JavaScript, TypeScript, Node.js, React, Modern Web Architectures, API Design</p>
            </Card>

            <Card className={styles["skillCard"]}>
              <h4>Engineering Excellence</h4>
              <p>Process Design, Quality Assurance, Technical Strategy, Organizational Scaling</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className={styles["contact"]}>
        <div className={styles["container"]}>
          <Card className={styles["contactCard"]}>
            <h2>Let&apos;s Connect</h2>
            <p>
              I&apos;m always interested in connecting with fellow engineering leaders,
              discussing technical mentoring approaches, or sharing insights on
              building exceptional engineering teams.
            </p>
            <a
              href="mailto:steve@example.com"
              className={styles["contactButton"]}
            >
              Get In Touch
            </a>
          </Card>
        </div>
      </section>
    </main>
  );
}