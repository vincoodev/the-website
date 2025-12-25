import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';

export default function Doom() {
  const canvasRef = useRef(null);
  const dosRef = useRef(null);
  const alreadyLoaded = useRef(false);
  const [status, setStatus] = useState('loading doom sabar dikit');

  useEffect(() => {
    if (alreadyLoaded.current) return;
    alreadyLoaded.current = true;

    const script = document.createElement('script');
    script.src = 'https://js-dos.com/6.22/current/js-dos.js';
    script.async = true;

    script.onload = () => {
      if (!window.Dos) {
        setStatus('dosjs gagal ngeload');
        return;
      }
      setStatus('download dos dulu ya');
      const dos = window.Dos(canvasRef.current, {
        wdosboxUrl: 'https://js-dos.com/6.22/current/wdosbox.js',
        cycles: 'max',
        autolock: false,
      });
      dosRef.current = dos;
      dos.ready((fs, main) => {
        setStatus('ekstrak doom dulu');
        fs.extract('/doom.jsdos')
          .then(() => {
            setStatus('');
            main(['-c', 'doom']);
          })
          .catch((err) => {
            console.error(err);
            setStatus('doom error');
          });
      });
    };
    document.body.appendChild(script);
    return () => {
      try {
        if (dosRef.current) dosRef.current.stop();
      } catch (e) {}
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);
  const exitGame = () => {
    window.location.href = '/';
  };
  return (
    <div style={{ width: '100vw', height: '100vh', background: 'black', overflow: 'hidden' }}>
      <Head>
        <title>Doom</title>
      </Head>
      <button
        onClick={exitGame}
        style={{
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 99999,
          background: 'red',
          color: 'white',
          border: '2px solid white',
          padding: '8px 16px',
          fontFamily: 'monospace',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        Keluar
      </button>
      {status && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'red',
            fontFamily: 'monospace',
            background: 'black',
            padding: 12,
            zIndex: 100,
            fontSize: '20px'
          }}
        >
          {status}
        </div>
      )}
      <canvas
        ref={canvasRef}
        style={{
          width: '100vw',
          height: '100vh',
          display: 'block',
          objectFit: 'fill'
        }}
      />
      <style jsx global>{`
        .header {
          display: none !important;
        }
        .main {
          padding: 0 !important;
          margin: 0 !important;
          max-width: 100% !important;
          width: 100vw !important;
          height: 100vh !important;
        }
        html,
        body,
        .app {
          margin: 0 !important;
          padding: 0 !important;
          background: black !important;
          overflow: hidden !important;
        }
        canvas {
          width: 100vw !important;
          height: 100vh !important;
          position: fixed;
          top: 0;
          left: 0;
          z-index: 1;
          object-fit: fill !important;
        }
        .dosbox-overlay {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
