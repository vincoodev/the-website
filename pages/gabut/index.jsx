import { useState, useEffect, useRef } from "react";
import { Info } from "lucide-react";

const ABACUS_URL = "https://abacus.jasoncameron.dev";
const NAMESPACE = "portfolio";
const KEY = "counter";

const ENDPOINT_GET = `${ABACUS_URL}/get/${NAMESPACE}/${KEY}`;
const ENDPOINT_HIT = `${ABACUS_URL}/hit/${NAMESPACE}/${KEY}`;
const ENDPOINT_STREAM = `${ABACUS_URL}/stream/${NAMESPACE}/${KEY}`;

const ANIMATION_THROTTLE = 75;

export default function WasteClickCounter() {
  const [globalCount, setGlobalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [sparkles, setSparkles] = useState([]);
  const [buttonPressed, setButtonPressed] = useState(false);
  const [counterGlow, setCounterGlow] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [personalCount, setPersonalCount] = useState(0);

  const eventSourceRef = useRef(null);
  const lastAnimationTimeRef = useRef(0);
  const globalCountRef = useRef(0);
  const skipNextAnimationRef = useRef(false);

  useEffect(() => {
    globalCountRef.current = globalCount;
  }, [globalCount]);

  const fetchCurrentCount = async () => {
    try {
      const response = await fetch(ENDPOINT_GET);
      if (response.ok) {
        const data = await response.json();
        setGlobalCount(data.value || 0);
      } else if (response.status === 404) {
        setGlobalCount(0);
      }
    } catch (error) {
      console.error("Failed to fetch count:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerStreamAnimation = () => {
    setCounterGlow(true);
    setTimeout(() => setCounterGlow(false), 600);

    if (sparkles.length < 20) {
      const id = Date.now();
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      setSparkles((prev) => [...prev, { id, x, y }]);

      setTimeout(() => {
        setSparkles((prev) => prev.filter((s) => s.id !== id));
      }, 2000);
    }
  };

  const setupStream = () => {
    const source = new EventSource(ENDPOINT_STREAM);

    source.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.value > globalCountRef.current) {
          setGlobalCount(data.value);

          if (skipNextAnimationRef.current) {
            skipNextAnimationRef.current = false;
            return;
          }

          const now = Date.now();
          if (now - lastAnimationTimeRef.current > ANIMATION_THROTTLE) {
            triggerStreamAnimation();
            lastAnimationTimeRef.current = now;
          }
        }
      } catch (error) {
        console.error("Stream parse error:", error);
      }
    };

    source.onerror = (error) => {
      console.error("Stream error:", error);
    };

    return source;
  };

  const handleClick = async () => {
    setButtonPressed(true);
    setTimeout(() => setButtonPressed(false), 150);

    const newPersonalCount = personalCount + 1;
    setPersonalCount(newPersonalCount);

    if (typeof window !== "undefined") {
      localStorage.setItem("waste-clicks", newPersonalCount.toString());
    }

    setGlobalCount((prev) => prev + 1);

    triggerStreamAnimation();

    skipNextAnimationRef.current = true;

    setTimeout(() => {
      skipNextAnimationRef.current = false;
    }, 2000);

    try {
      await fetch(ENDPOINT_HIT);
    } catch (error) {
      console.error("Failed to register click:", error);
      setGlobalCount((prev) => prev - 1);
      skipNextAnimationRef.current = false; // reset flag jika error
    }
  };

  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("waste-clicks");
      if (saved) {
        setPersonalCount(parseInt(saved, 10));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorageChange = (e) => {
      if (e.key === "waste-clicks" && e.newValue) {
        setPersonalCount(parseInt(e.newValue, 10));
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    fetchCurrentCount();
    eventSourceRef.current = setupStream();

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setShowInfo(false);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
      } else {
        fetchCurrentCount();
        if (
          !eventSourceRef.current ||
          eventSourceRef.current.readyState === EventSource.CLOSED
        ) {
          eventSourceRef.current = setupStream();
        }
      }
    };

    window.addEventListener("keydown", handleEscape);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <div className="container">
      <div className="card">
        <div className="info-button-wrapper">
          <button
            className="info-button"
            onClick={() => setShowInfo(!showInfo)}
            aria-label="What is this?"
          >
            <Info size={20} />
          </button>

          <div className={`info-popup ${showInfo ? "visible" : "hidden"}`}>
            <p>
              A real-time global counter tracking every click from everyone
              visiting this site. Completely pointless, yet oddly satisfying.
            </p>
          </div>
        </div>

        <div className="main-content">
          <div className="counter-wrapper">
            {isLoading ? (
              <span className="counter-loading">---</span>
            ) : (
              <div className="counter-number-wrapper">
                <span className={`counter-number ${counterGlow ? "glow" : ""}`}>
                  {formatNumber(globalCount)}
                </span>
                {sparkles.map((sparkle) => (
                  <div
                    key={sparkle.id}
                    className="sparkle"
                    style={{
                      left: `${sparkle.x - 50}%`,
                      top: `${sparkle.y - 50}%`,
                    }}
                  >
                    +1
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleClick}
            disabled={isLoading}
            className={`click-button ${buttonPressed ? "pressed" : ""}`}
          >
            CLICK ME
          </button>

          <p className="personal-count">
            you've clicked{" "}
            <span className="personal-count-number">{personalCount}</span> time
            {personalCount === 1 ? "" : "s"}
          </p>
        </div>
      </div>
    </div>
  );
}
