import Link from "next/link";
import AnimatedMessage from "../components/AnimatedMessage";

export default function Index() {
  return (
    <div>
      <h2>Selamat datang!</h2>
      <p>
        <Link href="/home">
          <button>MULAI</button>
        </Link>
      </p>
      <AnimatedMessage />
    </div>
  );
}
