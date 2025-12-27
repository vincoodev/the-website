import { useState, useEffect, useCallback } from 'react';

export default function SnakeGame() {
  const gridSize = 20;
  const initialSnake = [{ x: 10, y: 10 }];
  const [snake, setSnake] = useState(initialSnake);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState({ x: 1, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [eatMessage, setEatMessage] = useState('');

  const absurdMessages = [
    "APEL KUANTUM TERTELAN COYY!",
    "BUAH DIMENSI LAIN KESEDOT!",
    "MAKANAN REALITA DILAHAP BOSQUE!",
    "BERRY KOSMIK MASUK PERUT!",
    "KUBUS ANTARDIMENSI KEMAKAN!",
    "MAKANAN METAFISIK TERKONSUMSI!",
    "CAMILAN EKSISTENSIAL TERSERAP!",
    "JAJANAN TEMPORAL TERLAHAP!",
    "BUAH FILOSOFIS TERMAKAN BANG!",
    "PIXEL TRANSENDEN TERTELAN!",
    "KOTAK HIPERBOLIK MASUK MULUT!",
    "SANTAPAN ETEREAL DIDAPETIN!"
  ];

  const generateFood = useCallback(() => {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * gridSize),
        y: Math.floor(Math.random() * gridSize)
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, [snake]);

  const resetGame = () => {
    setSnake(initialSnake);
    setFood(generateFood());
    setDirection({ x: 1, y: 0 });
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
    setGameStarted(true);
  };

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused || !gameStarted) return;

    setSnake(prevSnake => {
      const newHead = {
        x: prevSnake[0].x + direction.x,
        y: prevSnake[0].y + direction.y
      };

      if (newHead.x < 0 || newHead.x >= gridSize || newHead.y < 0 || newHead.y >= gridSize) {
        setGameOver(true);
        if (score > highScore) setHighScore(score);
        return prevSnake;
      }

      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        if (score > highScore) setHighScore(score);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(prev => prev + 10);
        setFood(generateFood());
        const randomMessage = absurdMessages[Math.floor(Math.random() * absurdMessages.length)];
        setEatMessage(randomMessage);
        setTimeout(() => setEatMessage(''), 1500);
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver, isPaused, gameStarted, score, highScore, generateFood, absurdMessages]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!gameStarted && e.key === ' ') {
        e.preventDefault();
        resetGame();
        return;
      }

      if (e.key === ' ' && gameStarted && !gameOver) {
        e.preventDefault();
        setIsPaused(prev => !prev);
        return;
      }

      if (gameOver) return;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameOver, gameStarted]);

  useEffect(() => {
    const interval = setInterval(moveSnake, 200);
    return () => clearInterval(interval);
  }, [moveSnake]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4" style={{ fontFamily: 'monospace' }}>
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div style={{ 
          backgroundColor: '#1a1a1a', 
          border: '4px solid #00ff00', 
          padding: '24px', 
          marginBottom: '16px' 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: '#00ff00' }}>
              <div style={{ fontSize: '30px', fontWeight: 'bold' }}>ULAR ABSURD</div>
              
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#ffff00', fontSize: '24px', fontWeight: 'bold' }}>POIN GILA: {score}</div>
              <div style={{ color: '#00ff00', fontSize: '14px' }}>REKOR SULTAN: {highScore}</div>
            </div>
          </div>
        </div>

        {/* Game Board */}
        <div style={{ backgroundColor: '#1a1a1a', border: '4px solid #00ff00', padding: '16px' }}>
          <div 
            style={{ 
              width: `${gridSize * 20}px`, 
              height: `${gridSize * 20}px`,
              backgroundColor: 'black',
              border: '2px solid #00ff00',
              margin: '0 auto',
              position: 'relative'
            }}
          >
            {/* Grid */}
            {Array.from({ length: gridSize }).map((_, y) =>
              Array.from({ length: gridSize }).map((_, x) => (
                <div
                  key={`${x}-${y}`}
                  style={{
                    position: 'absolute',
                    left: `${x * 20}px`,
                    top: `${y * 20}px`,
                    width: '20px',
                    height: '20px',
                    border: '1px solid #003300'
                  }}
                />
              ))
            )}

     {snake.map((segment, index) => {
  let rotation = 0;

  if (index === 0) {
    if (direction.x === 1) rotation = 0;
    if (direction.x === -1) rotation = 180;
    if (direction.y === 1) rotation = 90;
    if (direction.y === -1) rotation = -90;
  }

  return (
    <img
      key={index}
      src={
        index === 0
          ? "/Snek/assets/200-error-offline.png"
          : "/Snek/assets/200-error-offline.png"
          }
         alt={index === 0 ? "Snake Head" : "Snake Body"}
            style={{
                    position: "absolute",
                    left: `${segment.x * 20}px`,
                    top: `${segment.y * 20}px`,
                    width: "20px",
                    height: "20px",
                    transform: index === 0 ? `rotate(${rotation}deg)` : "none",
                    imageRendering: "pixelated",
                    pointerEvents: "none",
                    zIndex: index === 0 ? 10 : 5
                }}
            />
            );
            })}

            {/* Makanan */}
            <div
              style={{
                position: 'absolute',
                left: `${food.x * 20}px`,
                top: `${food.y * 20}px`,
                width: '20px',
                height: '20px',
                backgroundColor: '#ff0000',
                border: '1px solid #ff0000'
              }}
            />

            {/* Start Screen */}
            {!gameStarted && (
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.95)',
                border: '2px solid #00ff00',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{ color: '#00ff00', textAlign: 'center' }}>
                  <img
                    src="/Snek/assets/200-error-offline.png"
                    alt="Logo Ular"
                    style={{
                        width: '64px',
                        height: '64px',
                        marginBottom: '20px',
                        imageRendering: 'pixelated',
                        filter: 'drop-shadow(0 0 8px #00ff00)'
                    }}
                    />
                  <h2 style={{ fontSize: '32px', marginBottom: '20px' }}>ULAR ABSURD</h2>
                  <p style={{ fontSize: '18px', marginBottom: '24px' }}>[ PENCET SPASI BRO MULAI ]</p>
                  <div style={{ fontSize: '14px', color: '#00aa00' }}>
                    <p>PAKE PANAH BUAT GERAKIN ULARNYA</p>
                    <p>PENCET SPASI BUAT PAUSE COYY</p>
                  </div>
                </div>
              </div>
            )}

            {/* Pause */}
            {isPaused && gameStarted && !gameOver && (
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.95)',
                border: '2px solid #ffff00',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{ textAlign: 'center', color: '#ffff00' }}>
                  <h2 style={{ fontSize: '48px', marginBottom: '20px' }}>DIPAUSE BANG</h2>
                  <p style={{ fontSize: '18px' }}>[ PENCET SPASI LANJUT COY ]</p>
                </div>
              </div>
            )}

            {/* Game Over */}
            {gameOver && (
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.95)',
                border: '2px solid #ff0000',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{ textAlign: 'center', color: '#ff0000' }}>
                  <div style={{ fontSize: '72px', marginBottom: '20px' }}>💀</div>
                  <h2 style={{ fontSize: '36px', marginBottom: '10px' }}>WAFAT BANG!</h2>
                  <p style={{ color: '#ffff00', fontSize: '28px', marginBottom: '24px' }}>SKOR LU: {score}</p>
                  {score > highScore - 10 && score === highScore && score > 0 && (
                    <p style={{ color: '#00ff00', fontSize: '18px', marginBottom: '20px' }}>*** REKOR BARU BOSQUE! ***</p>
                  )}
                  <button
                    onClick={resetGame}
                    style={{
                      border: '2px solid #00ff00',
                      backgroundColor: 'black',
                      color: '#00ff00',
                      fontWeight: 'bold',
                      padding: '12px 32px',
                      marginTop: '16px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontFamily: 'monospace'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#00ff00';
                      e.target.style.color = 'black';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'black';
                      e.target.style.color = '#00ff00';
                    }}
                  >
                    [ MAIN LAGI COY ]
                  </button>
                </div>
              </div>
            )}

            {/* Pesam makan */}
            {eatMessage && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: '#ff00ff',
                fontSize: '18px',
                fontWeight: 'bold',
                textShadow: '0 0 10px #ff00ff',
                pointerEvents: 'none',
                animation: 'pulse 0.5s ease-in-out',
                textAlign: 'center',
                zIndex: 10
              }}>
                {eatMessage}
              </div>
            )}
          </div>

          {/* Mobile komtrol */}
          <div style={{ 
            marginTop: '24px', 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '8px', 
            maxWidth: '300px', 
            margin: '24px auto 0' 
          }}>
            <div></div>
            <button
              onClick={() => direction.y === 0 && setDirection({ x: 0, y: -1 })}
              style={{
                border: '2px solid #00ff00',
                backgroundColor: 'black',
                color: '#00ff00',
                fontWeight: 'bold',
                padding: '16px',
                fontSize: '20px'
              }}
            >
              ▲
            </button>
            <div></div>
            <button
              onClick={() => direction.x === 0 && setDirection({ x: -1, y: 0 })}
              style={{
                border: '2px solid #00ff00',
                backgroundColor: 'black',
                color: '#00ff00',
                fontWeight: 'bold',
                padding: '16px',
                fontSize: '20px'
              }}
            >
              ◄
            </button>
            <button
              onClick={() => setIsPaused(!isPaused)}
              style={{
                border: '2px solid #ffff00',
                backgroundColor: 'black',
                color: '#ffff00',
                fontWeight: 'bold',
                padding: '16px',
                fontSize: '16px'
              }}
            >
              {isPaused ? '▶' : '❚❚'}
            </button>
            <button
              onClick={() => direction.x === 0 && setDirection({ x: 1, y: 0 })}
              style={{
                border: '2px solid #00ff00',
                backgroundColor: 'black',
                color: '#00ff00',
                fontWeight: 'bold',
                padding: '16px',
                fontSize: '20px'
              }}
            >
              ►
            </button>
            <div></div>
            <button
              onClick={() => direction.y === 0 && setDirection({ x: 0, y: 1 })}
              style={{
                border: '2px solid #00ff00',
                backgroundColor: 'black',
                color: '#00ff00',
                fontWeight: 'bold',
                padding: '16px',
                fontSize: '20px'
              }}
            >
              ▼
            </button>
          </div>
        </div>

 {/* Info */}
<div style={{ 
  marginTop: '16px', 
  backgroundColor: '#1a1a1a', 
  border: '4px solid #00ff00', 
  padding: '16px', 
  textAlign: 'center' 
}}>
  <p style={{ 
    color: '#00ff00', 
    fontSize: '14px', 
    fontFamily: 'monospace',
    marginBottom: '8px'
  }}>
    [ MAKAN KOTAK MERAH BIAR PANJANG DAN DAPET POIN COYYY ]
  </p>
  <div>
    <a
    href="https://github.com/DhitaArsaid"
    target="_blank"
    rel="noopener noreferrer"
    style={{
      color: '#00aa00',
      fontSize: '12px',
      fontFamily: 'monospace',
      textDecoration: 'none'
    }}
    >
    Guthib
    </a>
    </div>
        </div>
        </div>
    </div>
    );
}