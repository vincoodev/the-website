import Link from "next/link";

export default function Layout({ children }) {
  return (
    <div className="app">
      <header className="header">
        <h1>
          <Link href="/">The Website</Link>
        </h1>

        <nav>
          <Link href="/community">Community</Link>
        </nav>
      </header>

      <main className="main">{children}</main>
    </div>
  );
}
