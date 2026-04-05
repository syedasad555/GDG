import { Calendar, Code, Users, Award } from "lucide-react";
import FeatureCard from "./FeatureCard";
import "./WhyJoinGDG.css";

const features = [
  {
    icon: Calendar,
    title: "Events & Workshops",
    description: "Participate in exciting events, workshops, and hackathons organized by GDG.",
    colorClass: "cyan",
    baseColor: "#22d3ee",
    darkBg: "linear-gradient(135deg, #1d5f75, #254a9a, #3e3e99)"
  },
  {
    icon: Code,
    title: "Coding Challenges",
    description: "Test your skills with weekly coding challenges and real-world problem statements.",
    colorClass: "pink",
    baseColor: "#f472b6",
    darkBg: "linear-gradient(135deg, #9a1f53, #9f1a47, #962d2d)"
  },
  {
    icon: Users,
    title: "Community",
    description: "Connect with like-minded developers and grow your network in a supportive community.",
    colorClass: "green",
    baseColor: "#34d399",
    darkBg: "linear-gradient(135deg, #0d6f56, #1a6f69, #1d5f75)"
  },
  {
    icon: Award,
    title: "Achievements",
    description: "Earn badges and recognition for your skills, participation, and contributions to the community.",
    colorClass: "yellow",
    baseColor: "#facc15",
    darkBg: "linear-gradient(135deg, #824f22, #8d3d22, #89451f)"
  }
];

export default function WhyJoinGDG() {
  return (
    <div id="why-join-gdg" className="why-join-gdg">
      <h1>Why Join GDG College Club?</h1>
      <p className="subtitle">Unlock endless opportunities for growth, learning, and connection</p>

      <div className="grid">
        {features.map((f, i) => (
          <FeatureCard key={i} {...f} index={i} />
        ))}
      </div>
    </div>
  );
}
