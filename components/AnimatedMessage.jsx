import { useEffect, useState } from 'react';

export default function AnimatedMessage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClick = () => {
    window.location.href = 'https://github.com/RenzMc';
  };

  return (
    <div className="message-container" onClick={handleClick}>
      <div className="hearts">
        {[...Array(12)].map((_, i) => (
          <span key={i} className="heart" style={{ '--delay': `${i * 0.1}s` }}>
            ♥
          </span>
        ))}
      </div>
      {isVisible && (
        <div className="typed-text">
          <span className="typing">Renz was here</span>
        </div>
      )}
    </div>
  );
}
