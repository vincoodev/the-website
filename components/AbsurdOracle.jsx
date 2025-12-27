import { useEffect, useState } from "react";

const lines = [
  "Website ini tidak meminta dibuka.",
  "Kamu buka ini karena takdir, bukan klik.",
  "Server bingung kenapa kamu masih di sini.",
  "Tidak ada bug. Ini fitur eksistensial.",
  "Kami juga tidak tahu halaman ini untuk apa.",
  "Deploy dilakukan dengan perasaan ragu.",
  "Jika ini error, berarti kamu terlalu serius."
];

export default function AbsurdOracle() {
  const [text, setText] = useState("");

  useEffect(() => {
    const pick = lines[Math.floor(Math.random() * lines.length)];
    setText(pick);
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        bottom: "14px",
        left: "14px",
        fontSize: "12px",
        fontFamily: "monospace",
        opacity: 0.5,
        maxWidth: "240px",
        zIndex: 9999
      }}
    >
      {text}
    </div>
  );
}
