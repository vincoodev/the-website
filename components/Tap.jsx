'use client';

import { useState, useEffect } from 'react';

export default function Tap() {
  const [position, setPosition] = useState({ top: '50%', left: '50%' }); 
  const [isHovered, setIsHovered] = useState(false); 
  const [attempts, setAttempts] = useState(0); 
  const [btnText, setBtnText] = useState("JANGAN KLIK GW!"); 
  const [isWinner, setIsWinner] = useState(false); 

  // Kata-kata ejekan
  const taunts = [
    "Eits! Meleset!", "Kurang Cepat!", "Wleee 😜", "Skill Issue?", 
    "Lambat Banget!", "Hampir...", "Coba Lagi!", "Tangan Berat?", "Nyerah Aja!"
  ];

  const moveButton = () => {
    if (isWinner) return;
    const x = Math.random() * (window.innerWidth - 150);
    const y = Math.random() * (window.innerHeight - 100);

    setPosition({ top: `${y}px`, left: `${x}px` });
    setAttempts((prev) => prev + 1);
    const randomText = taunts[Math.floor(Math.random() * taunts.length)];
    setBtnText(randomText);
    if (!isHovered) setIsHovered(true);
  };

  const resetGame = () => {
    setIsWinner(false);
    setAttempts(0);
    setBtnText("JANGAN KLIK GW!");
    setIsHovered(false);
    setPosition({ top: '50%', left: '50%' });
  };

  return (
    <main className="h-screen w-full bg-slate-900 text-white overflow-hidden relative font-mono select-none">
      
      {
       }
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black opacity-50 z-0"></div>

      {/* DASHBOARD UTAMA */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full pointer-events-none">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 animate-pulse">
          LEVEL: MUSTAHIL
        </h1>
        <p className="text-slate-400 text-lg mb-8">
          Tantangan Next.js: Coba klik tombol merah.
        </p>
        
        {/* Score Counter */}
        <div className="bg-slate-800/80 backdrop-blur-sm p-4 rounded-xl border border-slate-700 shadow-2xl text-center">
            <p className="text-xs text-slate-500 uppercase tracking-widest">Gagal Nangkep</p>
            <span className="text-4xl font-bold text-red-500 font-mono transition-all duration-75">
              {attempts}
            </span>
        </div>
      </div>

      {/* --- TOMBOL TARGET --- */}
      <button
        onMouseEnter={moveButton} 
        onClick={() => setIsWinner(true)} 
        style={{ 
            top: position.top, 
            left: position.left,
            transform: isHovered ? 'none' : 'translate(-50%, -50%)' 
        }}
        className={`
            absolute z-20 font-bold py-3 px-8 rounded-full border-2 shadow-[0_0_20px_rgba(239,68,68,0.6)]
            transition-all duration-200 ease-out 
            ${isWinner ? 'hidden' : 'block'} 
            ${isHovered ? 'bg-orange-600 border-orange-400' : 'bg-red-600 border-red-400'}
            text-white hover:scale-110 active:scale-95 cursor-pointer pointer-events-auto
        `}
      >
        {btnText}
      </button>

      {/* --- MODAL MENANG (Kalau User Curang/Hoki) --- */}
      {isWinner && (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="text-center max-w-md">
            <h2 className="text-6xl mb-4">👑</h2>
            <h2 className="text-4xl font-bold text-green-400 mb-2">KAMU MENANG!</h2>
            <p className="text-slate-300 mb-8">
              Wah gila sih, pasti nge-lag ya PC nya? Atau pake tombol Tab? <br/>
              Tapi GG, kamu berhasil nangkep!
            </p>
            <button 
              onClick={resetGame}
              className="px-6 py-3 bg-white text-black font-bold rounded hover:bg-slate-200 transition shadow-[0_0_15px_white]"
            >
              Main Lagi
            </button>
          </div>
        </div>
      )}

    </main>
  );
}