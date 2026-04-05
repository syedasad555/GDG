import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import '../styles/gdg.css';

const BracketLeft = () => (
  <svg
    viewBox="0 0 80 180"
    className="bracket"
    style={{
      width: 120,
      height: 160,
      filter:
        "drop-shadow(0 0 8px rgba(255, 255, 255, 0.3)) drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5))",
    }}
  >
    <rect
      x="0"
      y="0"
      width="70"
      height="20"
      rx="10"
      ry="10"
      fill="#EA4335"
      transform="rotate(-48 15 90)"
      style={{ filter: "drop-shadow(0 0 6px rgba(234, 67, 53, 0.8))" }}
    />
    <rect
      x="0"
      y="160"
      width="70"
      height="20"
      rx="10"
      ry="10"
      fill="#4285F4"
      transform="rotate(48 15 90)"
      style={{ filter: "drop-shadow(0 0 6px rgba(66, 133, 244, 0.8))" }}
    />
  </svg>
);

const BracketRight = () => (
  <svg
    viewBox="0 0 80 180"
    className="bracket"
    style={{
      width: 120,
      height: 160,
      filter:
        "drop-shadow(0 0 8px rgba(255, 255, 255, 0.3)) drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5))",
    }}
  >
    <rect
      x="10"
      y="0"
      width="70"
      height="20"
      rx="10"
      ry="10"
      fill="#34A853"
      transform="rotate(48 65 90)"
      style={{ filter: "drop-shadow(0 0 6px rgba(52, 168, 83, 0.8))" }}
    />
    <rect
      x="10"
      y="160"
      width="70"
      height="20"
      rx="10"
      ry="10"
      fill="#FBBC05"
      transform="rotate(-48 65 90)"
      style={{ filter: "drop-shadow(0 0 6px rgba(251, 188, 5, 0.8))" }}
    />
  </svg>
);

const GDGTextBlock = () => (
  <div className="gdg-text-container">
    <div className="gdg-text-main">GDG</div>
    <div className="gdg-text-sub">
      <span className="red">S</span>
      <span className="blue">A</span>
      <span className="green">H</span>
      <span className="yellow">E</span>
    </div>
  </div>
);

/** Static GDG mark for admin login (no motion). */
const GDGLogoStatic = () => (
  <div className="gdg-logo-wrapper gdg-logo-wrapper--static">
    <div className="gdg-logo">
      <BracketLeft />
      <GDGTextBlock />
      <BracketRight />
    </div>
  </div>
);

const GDGAnimatedLogo = ({ staticLogo = false }) => {
  const [phase, setPhase] = useState("idle");

  useEffect(() => {
    if (staticLogo) return undefined;

    const timeline = [
      { phase: "horizontal-split", delay: 500 },
      { phase: "horizontal-text", delay: 600 },
      { phase: "horizontal-merge", delay: 400 },
      { phase: "idle", delay: 250 },
      { phase: "vertical-split", delay: 500 },
      { phase: "vertical-text", delay: 600 },
      { phase: "vertical-merge", delay: 400 },
      { phase: "idle", delay: 250 },
    ];

    let index = 0;
    let timer;

    const run = () => {
      setPhase(timeline[index].phase);
      timer = setTimeout(() => {
        index = (index + 1) % timeline.length;
        run();
      }, timeline[index].delay);
    };

    run();
    return () => clearTimeout(timer);
  }, [staticLogo]);

  if (staticLogo) {
    return <GDGLogoStatic />;
  }

  const isSplit = phase.includes("split") || phase.includes("text");
  const showText = phase !== "idle";

  const leftPos = () => {
    if (phase.includes("horizontal")) return { x: -100, y: 0 };
    if (phase.includes("vertical")) return { x: 0, y: -80 };
    return { x: 0, y: 0 };
  };

  const rightPos = () => {
    if (phase.includes("horizontal")) return { x: 100, y: 0 };
    if (phase.includes("vertical")) return { x: 0, y: 80 };
    return { x: 0, y: 0 };
  };

  const spring = { type: "spring", stiffness: 150, damping: 15 };

  return (
    <div className="gdg-logo-wrapper">
      <motion.div
        className="ambient-glow"
        animate={{
          opacity: isSplit ? 0.8 : 0.4,
          scale: isSplit ? 1.3 : 1,
        }}
      />

      <div className="gdg-logo">
        <motion.svg
          viewBox="0 0 80 180"
          className="bracket"
          animate={leftPos()}
          transition={spring}
          style={{
            width: 120,
            height: 160,
            filter:
              "drop-shadow(0 0 8px rgba(255, 255, 255, 0.3)) drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5))",
          }}
        >
          <rect
            x="0"
            y="0"
            width="70"
            height="20"
            rx="10"
            ry="10"
            fill="#EA4335"
            transform="rotate(-48 15 90)"
            style={{ filter: "drop-shadow(0 0 6px rgba(234, 67, 53, 0.8))" }}
          />
          <rect
            x="0"
            y="160"
            width="70"
            height="20"
            rx="10"
            ry="10"
            fill="#4285F4"
            transform="rotate(48 15 90)"
            style={{ filter: "drop-shadow(0 0 6px rgba(66, 133, 244, 0.8))" }}
          />
        </motion.svg>

        <AnimatePresence>
          {showText && (
            <motion.div
              className="gdg-text-container"
              initial={{ opacity: 0, scale: 1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1 }}
            >
              <div className="gdg-text-main">GDG</div>
              <div className="gdg-text-sub">
                <span className="red">S</span>
                <span className="blue">A</span>
                <span className="green">H</span>
                <span className="yellow">E</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.svg
          viewBox="0 0 80 180"
          className="bracket"
          animate={rightPos()}
          transition={spring}
          style={{
            width: 120,
            height: 160,
            filter:
              "drop-shadow(0 0 8px rgba(255, 255, 255, 0.3)) drop-shadow(0 4px 12px rgba(0, 0, 0, 0.5))",
          }}
        >
          <rect
            x="10"
            y="0"
            width="70"
            height="20"
            rx="10"
            ry="10"
            fill="#34A853"
            transform="rotate(48 65 90)"
            style={{ filter: "drop-shadow(0 0 6px rgba(52, 168, 83, 0.8))" }}
          />
          <rect
            x="10"
            y="160"
            width="70"
            height="20"
            rx="10"
            ry="10"
            fill="#FBBC05"
            transform="rotate(-48 65 90)"
            style={{ filter: "drop-shadow(0 0 6px rgba(251, 188, 5, 0.8))" }}
          />
        </motion.svg>
      </div>
    </div>
  );
};

export default GDGAnimatedLogo;
