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
          <button style={{ marginLeft: '5px' }}>SVGSTEGO</button>
        </Link>
        <Link href="/doom">
          <button style={{ marginLeft: '5px', backgroundColor: 'red', color: 'white' }}>
            DOOM
          </button>
        </Link>
        <Link href="/vinrex/index.html">
          <button style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img 
              src="/vinrex/assets/default_100_percent/100-error-offline.png" 
              alt="Vinrex Icon" 
              style={{ width: '24px', height: '24px' }}
            />
            VINREX GAME
          </button>
        </Link>
        <Link href="/gabut">
          <button>gabut</button>
        </Link>
         <Link href="/snekabsurd">
          <button style={{ marginLeft: '5px' }}>Absurd Snek Gem</button>
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
