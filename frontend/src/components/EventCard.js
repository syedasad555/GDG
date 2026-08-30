import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, ArrowRight, Users } from 'lucide-react';
import './EventCard.css';

const getDefaultEventImage = (category) => {
  switch(category) {
    case 'Workshop':
      return '/assets/workshop_default.jpeg';
    case 'Hackathon':
      return '/assets/hackathon_default.jpeg';
    case 'Talk':
      return '/assets/talk_default.jpeg';
    case 'Meetup':
      return '/assets/meetup_default.jpeg';
    default:
      return '/assets/workshop_default.jpeg';
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const EventCard = ({ event, isAdmin = false, isPast = false }) => {
  const eventImage = event.coverImage || getDefaultEventImage(event.category);

  // Check if registration is closed
  const isRegistrationClosed = () => {
    if (!event.registrationEndTime) return false;
    
    const now = new Date();
    const registrationEnd = new Date(event.registrationEndTime);
    const eventDate = new Date(event.date);
    
    if (eventDate > now && registrationEnd > now) return false;
    
    return now > registrationEnd;
  };

  const getRegistrationText = () => {
    const count = event.registrations ? event.registrations.length : (event.registeredCount || 0);
    if (event.category === 'Hackathon') {
      return `${count} ${count === 1 ? 'Team' : 'Teams'} Reg.`;
    }
    return `${count} ${count === 1 ? 'Member' : 'Members'} Reg.`;
  };

  return (
    <Link 
      to={`/events/${event._id}`}
      className="event-card-link"
    >
      <div className={`event-card-minimal ${isAdmin ? 'admin-card' : ''} ${isPast ? 'past-card' : ''}`}>
        <div className="event-card-image-wrapper">
          <img 
            src={eventImage} 
            alt={event.title}
            className="event-card-minimal-image"
          />
          <div className="event-card-reg-badge">
            <Users size={13} style={{ color: '#ffffff' }} />
            <span>{getRegistrationText()}</span>
          </div>
          {event.category && (
            <div className="event-card-category-badge">
              {event.category}
            </div>
          )}
        </div>
        
        <div className="event-card-minimal-content">
          <h3 className="event-card-minimal-title">{event.title}</h3>
          
          <div className="event-card-minimal-info">
            <div className="event-card-minimal-info-item">
              <Calendar size={16} />
              <span>{formatDate(event.date)}</span>
            </div>
            {event.time && (
              <div className="event-card-minimal-info-item">
                <Clock size={16} />
                <span>{event.time}</span>
              </div>
            )}
            {event.venue && (
              <div className="event-card-minimal-info-item">
                <MapPin size={16} />
                <span>{event.venue}</span>
              </div>
            )}
          </div>

          {!isAdmin && !isPast && (
            <div className="event-card-minimal-footer">
              {isRegistrationClosed() ? (
                <span className="event-card-status closed">Registrations Closed</span>
              ) : (
                <span className="event-card-action">
                  View Details <ArrowRight size={16} />
                </span>
              )}
            </div>
          )}

          {isPast && (
            <div className="event-card-minimal-footer">
              <span className="event-card-action">
                View Details <ArrowRight size={16} />
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
