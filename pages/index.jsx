import Link from "next/link";

export default function Index() {
  return (
    <div>
      <h2>Selamat datang!</h2>
      <p>
        <Link href="/home">
          <button>MULAI</button>
        </Link>
      </p>
    </div>
  );
}
