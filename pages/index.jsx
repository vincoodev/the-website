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
        <Link href="/nbrthx">
          <button style={{ marginLeft: '5px' }}>SVGSTEGO</button>
        </Link>
        <Link href="/doom">
          <button style={{ marginLeft: '5px', backgroundColor: 'red', color: 'white' }}>
            DOOM
          </button>
        </Link>
      </p>
      <AnimatedMessage />
    </div>
  );
}
