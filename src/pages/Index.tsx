import { useState, useRef, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";

const NO_TEXTS = [
  "No",
  "Are you sure?",
  "Really sure?",
  "Come on now!! 😅",
  "Pretty please 🥺",
  "Don't do this...",
  "My heart... 💔",
  "I'm begging you 🙏",
  "PLEASE!! 😭",
  "Okay fine... wait NO!!",
];

const EMOJIS = ["💖", "🎉", "✨", "💕", "🥳", "💫", "🌟", "❤️", "🎊", "😍"];

interface FloatingEmoji {
  id: number;
  emoji: string;
  x: number;
  y: number;
}

export default function Index() {
  const [noCount, setNoCount] = useState(0);
  const [accepted, setAccepted] = useState(false);
  const [noPos, setNoPos] = useState<{ x: number; y: number } | null>(null);
  const [wiggle, setWiggle] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const [popIn, setPopIn] = useState(false);
  const emojiCounterRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const noBtnRef = useRef<HTMLButtonElement>(null);

  const yesScale = 1 + noCount * 0.15;
  const noLabel =
    noCount === 0
      ? NO_TEXTS[0]
      : NO_TEXTS[((noCount - 1) % (NO_TEXTS.length - 1)) + 1];

  const getRandomNoPosition = useCallback(() => {
    const container = containerRef.current;
    const noBtn = noBtnRef.current;
    if (!container || !noBtn) return;

    const cRect = container.getBoundingClientRect();
    const btnW = noBtn.offsetWidth;
    const btnH = noBtn.offsetHeight;

    const padding = 16;
    const maxX = cRect.width - btnW - padding;
    const maxY = cRect.height - btnH - padding;

    let x: number, y: number;
    // Try to avoid center
    do {
      x = padding + Math.random() * maxX;
      y = padding + Math.random() * maxY;
    } while (
      Math.abs(x - cRect.width / 2) < 80 &&
      Math.abs(y - cRect.height / 2) < 80
    );

    setNoPos({ x, y });
  }, []);

  const handleNoClick = () => {
    setNoCount((c) => c + 1);
    setWiggle(true);
    setTimeout(() => setWiggle(false), 400);
    getRandomNoPosition();
  };

  const handleNoHover = () => {
    if (noCount > 0) {
      getRandomNoPosition();
    }
  };

  const fireConfetti = () => {
    const colors = ["#ff4d8d", "#ff85b3", "#ffd166", "#a855f7", "#06b6d4"];
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
      colors,
      scalar: 1.2,
    });
    setTimeout(() => {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.4, x: 0.3 },
        colors,
        angle: 60,
      });
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.4, x: 0.7 },
        colors,
        angle: 120,
      });
    }, 300);
  };

  const spawnEmoji = (e: React.MouseEvent | React.TouchEvent) => {
    let x = 0, y = 0;
    if ("touches" in e) {
      x = e.touches[0].clientX;
      y = e.touches[0].clientY;
    } else {
      x = (e as React.MouseEvent).clientX;
      y = (e as React.MouseEvent).clientY;
    }
    const id = ++emojiCounterRef.current;
    const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    setFloatingEmojis((prev) => [...prev, { id, emoji, x, y }]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((em) => em.id !== id));
    }, 1000);
  };

  const handleYesClick = (e: React.MouseEvent) => {
    spawnEmoji(e);
    setAccepted(true);
    setPopIn(true);
    fireConfetti();
  };

  // Initialize NO button position after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (containerRef.current && noBtnRef.current) {
        // start with null (centered in flow), only move after first "no"
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden"
      style={{
        background: "var(--gradient-bg)",
      }}
    >
      {/* Decorative background blobs */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        <div
          className="absolute -top-20 -left-20 h-72 w-72 rounded-full opacity-30 blur-3xl"
          style={{ background: "hsl(335 90% 75%)" }}
        />
        <div
          className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full opacity-25 blur-3xl"
          style={{ background: "hsl(45 100% 70%)" }}
        />
        <div
          className="absolute top-1/2 left-1/4 h-48 w-48 -translate-y-1/2 rounded-full opacity-20 blur-2xl"
          style={{ background: "hsl(280 80% 75%)" }}
        />
      </div>

      {/* Floating emojis */}
      {floatingEmojis.map(({ id, emoji, x, y }) => (
        <span
          key={id}
          className="pointer-events-none fixed z-50 select-none text-4xl animate-float-emoji"
          style={{ left: x - 20, top: y - 20 }}
        >
          {emoji}
        </span>
      ))}

      {/* Main card */}
      <div className="question-card relative z-10 mx-4 flex flex-col items-center gap-8 px-8 py-12 text-center max-w-sm w-full">
        {!accepted ? (
          <>
            {/* Question */}
            <div className="flex flex-col items-center gap-3">
              <span className="text-6xl animate-bounce-loop">🐾</span>
              <h1
                className="text-3xl font-black leading-tight"
                style={{ color: "hsl(var(--foreground))" }}
              >
                Dear Naomi, will you be my friend?
              </h1>
              {noCount > 0 && (
                <p
                  className="text-base font-semibold"
                  style={{ color: "hsl(var(--muted-foreground))" }}
                >
                  {noCount === 1
                    ? "I'm just asking nicely! 🙏"
                    : noCount < 4
                      ? "Why are you running from me? 😢"
                      : noCount < 7
                        ? "Okay this is getting out of hand 😤"
                        : "You CANNOT escape 😈"}
                </p>
              )}
            </div>

            {/* YES and NO buttons side-by-side initially */}
            <div className="flex flex-row items-center justify-center gap-4 w-full">
              <button
                className="btn-yes flex-1 px-8 py-4 text-xl font-black tracking-wide"
                style={{
                  transform: `scale(${yesScale})`,
                  transformOrigin: "center",
                  fontSize: `${Math.min(1.25 + noCount * 0.08, 2)}rem`,
                }}
                onClick={handleYesClick}
              >
                YES
              </button>

              {noPos === null && (
                <button
                  ref={noBtnRef}
                  className={`btn-no px-7 py-3 text-base font-bold select-none ${wiggle ? "animate-wiggle" : ""}`}
                  onClick={handleNoClick}
                  onMouseEnter={handleNoHover}
                  onTouchStart={handleNoHover}
                >
                  {noLabel}
                </button>
              )}
            </div>
          </>
        ) : (
          /* Success state */
          <div
            className={`flex flex-col items-center gap-6 ${popIn ? "animate-pop-in" : ""}`}
          >
            <span className="text-7xl animate-bounce-loop">🥳</span>
            <h1 className="text-3xl font-black leading-tight success-text">
              I KNEW YOU WERE GOING TO AGREE!
            </h1>
            <p
              className="text-lg font-bold"
              style={{ color: "hsl(var(--muted-foreground))" }}
            >
              We're officially friends now! 💖
            </p>
          </div>
        )}
      </div>

      {/* NO button — floats freely after first click */}
      {!accepted && noPos !== null && (
        <button
          ref={noBtnRef}
          className={`btn-no z-20 px-7 py-3 text-base font-bold select-none ${wiggle ? "animate-wiggle" : ""}`}
          style={{
            position: "fixed",
            left: noPos.x,
            top: noPos.y,
            transition: "left 0.25s cubic-bezier(0.34,1.56,0.64,1), top 0.25s cubic-bezier(0.34,1.56,0.64,1)",
            touchAction: "none",
          }}
          onClick={handleNoClick}
          onMouseEnter={handleNoHover}
          onTouchStart={handleNoHover}
        >
          {noLabel}
        </button>
      )}
    </div>
  );
}
