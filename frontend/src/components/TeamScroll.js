import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./TeamScroll.css";
import { resolveUploadUrl } from "../utils/resolveUploadUrl";

const TeamScroll = () => {
  const trackRef = useRef(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const gridTeamMembers = teamMembers.slice(0, 4);
  const duplicatedMembers = teamMembers.length ? [...teamMembers, ...teamMembers] : [];

  useEffect(() => {
    const track = trackRef.current;
    const wrapper = track?.parentElement;

    if (!track || !wrapper) return;

    const pause = () => {
      if (track) {
        track.style.animationPlayState = "paused";
      }
    };

    const resume = () => {
      if (track) {
        track.style.animationPlayState = "running";
      }
    };

    wrapper.addEventListener("mouseenter", pause);
    wrapper.addEventListener("mouseleave", resume);
    wrapper.addEventListener("touchstart", pause);
    wrapper.addEventListener("touchend", resume);

    return () => {
      wrapper.removeEventListener("mouseenter", pause);
      wrapper.removeEventListener("mouseleave", resume);
      wrapper.removeEventListener("touchstart", pause);
      wrapper.removeEventListener("touchend", resume);
    };
  }, [teamMembers.length]);

  return (
    <div className="team-section">
      <h1 className="team-title">Meet Our Team</h1>

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
            <div ref={trackRef} className="scroll-track">
              {duplicatedMembers.map((member, index) => (
                <div key={`scroll-${member._id}-${index}`} className="card scroll-card">
                  <div className="card-image-container">
                    {member.photo ? (
                      <img
                        src={resolveUploadUrl(member.photo)}
                        alt={member.name}
                        className="card-image"
                      />
                    ) : (
                      <div className="card-image card-image-placeholder">{member.name?.charAt(0) || "?"}</div>
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
              ))}
            </div>
          </div>
        </>
      )}

      <div className="view-more-container">
        <Link to="/team" className="view-more-button">
          View More
        </Link>
      </div>

      <h2 className="grid-section-title">GDG Website Developers</h2>

      <div className="cards-grid">
        {!loading && gridTeamMembers.length === 0 ? (
          <p className="team-scroll-empty grid-empty">Add team members in admin to show them here.</p>
        ) : (
          gridTeamMembers.map((member) => (
            <div key={`grid-${member._id}`} className="card grid-card">
              <div className="card-image-container">
                {member.photo ? (
                  <img
                    src={resolveUploadUrl(member.photo)}
                    alt={member.name}
                    className="card-image"
                  />
                ) : (
                  <div className="card-image card-image-placeholder">{member.name?.charAt(0) || "?"}</div>
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
          ))
        )}
      </div>
    </div>
  );
};

export default TeamScroll;
