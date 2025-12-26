import Link from "next/link";
import AnimatedMessage from "../components/AnimatedMessage";
import DelayCursor from "../components/DelayCursor";

export default function Index() {
  return (
    <div>
      <h2>Selamat datang!</h2>
      <p>
        <Link href="/home">
          <button>MULAI</button>
        </Link>
        <Link href="/nbrthx">
          <button>SVGSTEGO</button>
        </Link>
      </p>
      <AnimatedMessage />
      <DelayCursor delay={0.05} />
      <style jsx global>{`
        * {
          cursor: none !important;
        }
      `}</style>
    </div>
  );
}
