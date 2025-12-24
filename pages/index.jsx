import Link from "next/link";

export default function Index() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* HEADER */}
      <header className="flex items-center justify-between px-8 py-4 bg-white shadow-[0_1px_0_rgba(0,0,0,0.06)]">
        <h1 className="font-bold text-xl tracking-tight text-slate-800">The Website</h1>
        <nav>
          <Link href="/" className="ml-4 no-underline text-[#0366d6] hover:underline font-medium">
            Home
          </Link>
          <Link href="/about" className="ml-4 no-underline text-[#0366d6] hover:underline font-medium">
            About
          </Link>
        </nav>
      </header>

      {/* MAIN CONTAINER*/}
      <main className="p-8">
        <div className="max-w-[420px] mx-auto my-8 bg-white p-6 rounded-lg shadow-[0_6px_18px_rgba(0,0,0,0.06)] text-center">
          <h2 className="text-2xl font-bold mb-4">Selamat datang!</h2>
          <p className="text-slate-600 mb-6">
            Klik tombol di bawah untuk masuk ke tantangan tombol licin.
          </p>
          
          <p>
            <Link href="/home">
              {/* Btn Hover */}
              <button className="bg-[#0366d6] hover:bg-[#024e9a] text-white border-0 py-[0.6rem] px-[0.9rem] rounded-[6px] cursor-pointer transition-colors duration-200 font-semibold w-full sm:w-auto">
                MULAI
              </button>
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
