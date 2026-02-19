import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
};

export default function HomePage() {
  return (
    <main>
      <nav aria-label="Main navigation">
        <ul>
          <li>
            <a href="/posts">Writing</a>
          </li>
          <li>
            <a href="/projects">Projects</a>
          </li>
          <li>
            <a href="/about">About</a>
          </li>
        </ul>
      </nav>
      <section aria-labelledby="hero-heading">
        <h1 id="hero-heading">Engineering Excellence</h1>
        <p>
          Head of Engineering. Writing about software architecture, leadership,
          and building great teams.
        </p>
      </section>
    </main>
  );
}
