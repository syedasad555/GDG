import React, { useState, useEffect } from "react";
import { Globe, Cloud, Smartphone, Brain, Palette, Megaphone, Linkedin } from "lucide-react";
import axios from "axios";
import "./Team.css";
import { resolveUploadUrl } from "../utils/resolveUploadUrl";

const DOMAIN_META = [
  {
    id: "web",
    title: "Web Development",
    icon: <Globe size={20} />,
    domainColor: "#3B82F6",
  },
  {
    id: "cloud",
    title: "Cloud Computing",
    icon: <Cloud size={20} />,
    domainColor: "#10B981",
  },
  {
    id: "android",
    title: "Android Development",
    icon: <Smartphone size={20} />,
    domainColor: "#F59E0B",
  },
  {
    id: "aiml",
    title: "AI & ML",
    icon: <Brain size={20} />,
    domainColor: "#EF4444",
  },
  {
    id: "design",
    title: "Design",
    icon: <Palette size={20} />,
    domainColor: "#EC4899",
  },
  {
    id: "marketing",
    title: "Marketing",
    icon: <Megaphone size={20} />,
    domainColor: "#8B5CF6",
  },
];

function Team() {
  const [activeSection, setActiveSection] = useState(null);
  const [apiMembers, setApiMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get("/api/team");
        setApiMembers(res.data.members || []);
      } catch (e) {
        console.error(e);
        setApiMembers([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const leadership = apiMembers.filter((m) => m.section === "leadership");

  const scrollToDomain = (domainId) => {
    const element = document.getElementById(domainId);
    if (element) {
      element.classList.add("show");
      element.style.opacity = "1";
      element.style.transform = "translateY(0)";

      setTimeout(() => {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
        setActiveSection(domainId);
        setTimeout(() => setActiveSection(null), 600);
      }, 50);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
          }
        });
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    document.querySelectorAll(".domain-section.animate-on-scroll, .domain-buttons.animate-on-scroll").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, [loading]);

  return (
    <div className="team-page-container">
      <h1 className="team-page-title">Meet Our Team</h1>
      <p className="team-page-subtitle">The passionate individuals driving GDG forward</p>

      {loading ? (
        <p className="team-page-subtitle" style={{ marginBottom: 48 }}>
          Loading team…
        </p>
      ) : null}

      <div className="domain-buttons animate-on-scroll">
        {DOMAIN_META.map((d) => (
          <button key={d.id} type="button" onClick={() => scrollToDomain(d.id)} className="domain-btn">
            {d.icon} {d.title}
          </button>
        ))}
      </div>

      <SectionTitle section="Leadership" />

      <div className="team-grid">
        {leadership.length === 0 && !loading ? (
          <p className="team-empty-hint">Leadership profiles will appear here once added in the admin dashboard.</p>
        ) : (
          leadership.map((m) => <TeamCard key={m._id} member={m} variant="leadership" />)
        )}
      </div>

      <SectionTitle section="Domain Teams" />

      {DOMAIN_META.map((domain) => {
        const members = apiMembers.filter((m) => m.section === domain.id);
        return (
          <div
            key={domain.id}
            id={domain.id}
            className={`domain-section animate-on-scroll ${activeSection === domain.id ? "pulse" : ""}`}
          >
            <h3 className="domain-title">
              {domain.icon} {domain.title}
            </h3>
            <div className="team-grid">
              {members.length === 0 && !loading ? (
                <p className="team-empty-hint">No members in this group yet.</p>
              ) : (
                members.map((m) => (
                  <TeamCard key={m._id} member={m} domainColor={domain.domainColor} variant="domain" />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TeamCard({ member, domainColor, variant }) {
  const [imgFailed, setImgFailed] = useState(false);
  const color = domainColor || "#6B46C1";
  const src = member.photo ? resolveUploadUrl(member.photo) : "";
  const showPlaceholder = !src || imgFailed;

  return (
    <div className="team-card">
      <div className="team-img-box">
        {!showPlaceholder ? (
          <img src={src} alt={member.name} onError={() => setImgFailed(true)} />
        ) : null}
        <div className={`team-photo-placeholder ${showPlaceholder ? "visible" : ""}`} aria-hidden>
          {member.name?.charAt(0) || "?"}
        </div>
      </div>
      <h3>{member.name}</h3>
      <p style={{ color }}>{member.role}</p>
      {variant === "leadership" && member.description ? (
        <p className="team-card-description">{member.description}</p>
      ) : null}
      {member.linkedInUrl ? (
        <a
          className="team-linkedin"
          href={member.linkedInUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${member.name} on LinkedIn`}
        >
          <Linkedin size={18} />
          <span>LinkedIn</span>
        </a>
      ) : null}
    </div>
  );
}

function SectionTitle({ section }) {
  return <h2 className="section-title">{section}</h2>;
}

export default Team;
