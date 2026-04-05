import { useState } from "react";

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  colorClass,
  baseColor,
  darkBg,
  index
}) {
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    setRotateX(((y - centerY) / centerY) * -15);
    setRotateY(((x - centerX) / centerX) * 15);
  };

  return (
    <div
      className="feature-group"
      style={{
        animationDelay: `${index * 0.15}s`,
        opacity: 0
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setRotateX(0);
        setRotateY(0);
      }}
    >
      <div
        className={`feature-card ${colorClass}`}
        style={{
          transform: `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(${hovered ? "30px" : "0px"})`,
          borderColor: hovered ? baseColor : "rgba(255,255,255,0.2)",
          background: darkBg
        }}
      >
        <div className="icon-box">
          <Icon size={52} color="white" />
        </div>

        <h3>{title}</h3>
        <p>{description}</p>

        <div className="hover-bar" />
      </div>
    </div>
  );
}
