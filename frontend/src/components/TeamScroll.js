import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./TeamScroll.css";
import { resolveUploadUrl } from "../utils/resolveUploadUrl";

const TeamScroll = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [duplicatedMembers, setDuplicatedMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [failedImages, setFailedImages] = useState({});

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await axios.get("/api/team");
        const list = res.data.members || [];
        setTeamMembers(
          [...list].sort((a, b) => {
            const so = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
            if (so !== 0) return so;
            return (a.name || "").localeCompare(b.name || "");
          })
        );
      } catch (e) {
        console.error(e);
        setTeamMembers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  useEffect(() => {
    if (teamMembers.length === 0) return;

    const calculateDuplicates = () => {
      // Card width (330px) + gap (24px) = 354px
      const cardWidthWithGap = 354;
      const screenWidth = window.innerWidth || 1920;
      const targetWidth = screenWidth * 2;
      const singleSetWidth = teamMembers.length * cardWidthWithGap;
      
      let setsNeeded = Math.ceil(targetWidth / singleSetWidth);
      if (setsNeeded % 2 !== 0) {
        setsNeeded += 1;
      }
      setsNeeded = Math.max(2, setsNeeded);

      let list = [];
      for (let i = 0; i < setsNeeded; i++) {
        list = [...list, ...teamMembers];
      }
      setDuplicatedMembers(list);
    };

    calculateDuplicates();
    window.addEventListener("resize", calculateDuplicates);
    return () => window.removeEventListener("resize", calculateDuplicates);
  }, [teamMembers]);

  const handleImageError = (key) => {
    setFailedImages((prev) => ({ ...prev, [key]: true }));
  };

  return (
    <div className="team-section">
      <div className="team-header">
        <span className="team-label">OUR TEAM</span>
        <h2 className="team-title">Meet Our Team</h2>
      </div>

      {loading ? (
        <p className="team-scroll-loading">Loading…</p>
      ) : teamMembers.length === 0 ? (
        <p className="team-scroll-empty">
          Team profiles are managed from the admin dashboard. Visit the{" "}
          <Link to="/team">Team</Link> page to see everyone once they&apos;re added.
        </p>
      ) : (
        <>
          <div className="scroll-wrapper">
            <div className="scroll-track">
              {duplicatedMembers.map((member, index) => {
                const uniqueKey = `${member._id}-${index}`;
                const hasFailed = failedImages[uniqueKey];
                return (
                  <div key={`scroll-${uniqueKey}`} className="card scroll-card">
                    <div className="card-image-container">
                      {member.photo && !hasFailed ? (
                        <img
                          src={resolveUploadUrl(member.photo)}
                          alt={member.name}
                          className="card-image"
                          onError={() => handleImageError(uniqueKey)}
                        />
                      ) : (
                        <div className="card-image card-image-placeholder">
                          <svg
                            width="64"
                            height="64"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{ opacity: 0.6 }}
                          >
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="card-content">
                      <h3 className="card-name">{member.name}</h3>
                      <p className="card-title">{member.role}</p>
                      {member.linkedInUrl ? (
                        <a
                          className="card-linkedin"
                          href={member.linkedInUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          LinkedIn
                        </a>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      <div className="view-more-container">
        <Link to="/team" className="view-more-button">
          View More
        </Link>
      </div>
    </div>
  );
};

export default TeamScroll;
