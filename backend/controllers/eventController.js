const Event = require('../models/Event');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

const formatEvent = (evt) => {
  const obj = evt.toObject ? evt.toObject() : evt;
  const regCount = evt.registrations ? evt.registrations.length : (evt.registeredCount || 0);
  obj.registeredCount = regCount;
  return obj;
};

exports.getAllEvents = async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let query = { isPublished: true };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    let events = Event.find(query).populate('createdBy', 'name email');

    if (sort === 'date') {
      events = events.sort({ date: 1 });
    } else if (sort === 'name') {
      events = events.sort({ title: 1 });
    } else {
      events = events.sort({ createdAt: -1 });
    }

    const result = await events;
    const formattedEvents = result.map(formatEvent);

    res.status(200).json({
      status: 'success',
      count: formattedEvents.length,
      events: formattedEvents
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('createdBy', 'name email');

    if (!event) {
      return res.status(404).json({
        status: 'fail',
        message: 'Event not found'
      });
    }

    // Increment views
    event.views = (event.views || 0) + 1;
    await event.save();

    const eventObj = formatEvent(event);
    delete eventObj.registrations;

    res.status(200).json({
      status: 'success',
      event: eventObj
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { title, description, context, date, time, venue, category, tags, speaker, registrationEndTime, teamSize, teamMembers } = req.body;

    const eventData = {
      title,
      description,
      context: context || '',
      date,
      time,
      venue,
      category,
      tags: tags ? tags.split(',') : [],
      speaker: speaker ? JSON.parse(speaker) : null,
      registrationEndTime: registrationEndTime || null,
      teamSize: category === 'Hackathon' ? teamSize ?? null : null,
      teamMembers: category === 'Hackathon' ? teamMembers ?? null : null,
      createdBy: req.user.id,
      isPublished: true
    };

    if (req.file) {
      eventData.coverImage = `/uploads/${req.file.filename}`;
    } else {
      // Set default images based on category if no image is uploaded
      switch(category) {
        case 'Workshop':
          eventData.coverImage = '/assets/workshop_default.jpeg';
          break;
        case 'Hackathon':
          eventData.coverImage = '/assets/hackathon_default.jpeg';
          break;
        case 'Talk':
          eventData.coverImage = '/assets/talk_default.jpeg';
          break;
        case 'Meetup':
          eventData.coverImage = '/assets/meetup_default.jpeg';
          break;
      }
    }

    const event = await Event.create(eventData);

    res.status(201).json({
      status: 'success',
      event
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { title, description, context, date, time, venue, category, tags, speaker, isPublished, registrationEndTime, teamSize, teamMembers } = req.body;

    const updateData = {
      title,
      description,
      context: context || '',
      date,
      time,
      venue,
      category,
      tags: tags ? tags.split(',') : [],
      speaker: speaker ? JSON.parse(speaker) : null,
      registrationEndTime: registrationEndTime || null,
      teamSize: category === 'Hackathon' ? teamSize ?? null : null,
      teamMembers: category === 'Hackathon' ? teamMembers ?? null : null,
      isPublished
    };

    if (req.file) {
      // Delete old cover image
      const event = await Event.findById(req.params.id);
      if (event && event.coverImage) {
        const oldPath = path.join(__dirname, '../uploads', path.basename(event.coverImage));
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      updateData.coverImage = `/uploads/${req.file.filename}`;
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({
        status: 'fail',
        message: 'Event not found'
      });
    }

    res.status(200).json({
      status: 'success',
      event
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({
        status: 'fail',
        message: 'Event not found'
      });
    }

    // Delete cover image
    if (event.coverImage) {
      const imagePath = path.join(__dirname, '../uploads', path.basename(event.coverImage));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.status(204).json({
      status: 'success'
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.registerEvent = async (req, res) => {
  try {
    const { name, email, phone, rollNumber, branch, year, teamName, members } = req.body;
    const emailNorm = email ? String(email).trim().toLowerCase() : '';

    if (!name || !emailNorm || !rollNumber) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide your name, email, and roll number'
      });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        status: 'fail',
        message: 'Event not found'
      });
    }

    // Hackathon-specific validation
    if (event.category === 'Hackathon') {
      if (!teamName || !String(teamName).trim()) {
        return res.status(400).json({
          status: 'fail',
          message: 'Please provide a team name for hackathon registration'
        });
      }

      if (!members || !Array.isArray(members) || members.length === 0) {
        return res.status(400).json({
          status: 'fail',
          message: 'Please add at least one team member'
        });
      }

      if (event.teamSize && members.length > event.teamSize - 1) {
        return res.status(400).json({
          status: 'fail',
          message: `Team can have at most ${event.teamSize} members (including team lead)`
        });
      }

      for (let i = 0; i < members.length; i++) {
        const m = members[i];
        if (!m.name || !m.rollNumber || !m.email) {
          return res.status(400).json({
            status: 'fail',
            message: `Please provide name, roll number, and email for team member ${i + 1}`
          });
        }
      }
    }

    const alreadyRegistered = event.registrations.some(
      (reg) => reg.email && String(reg.email).trim().toLowerCase() === emailNorm
    );
    if (alreadyRegistered) {
      return res.status(400).json({
        status: 'fail',
        message: 'This email is already registered for this event'
      });
    }

    if (event.registrationEndTime && new Date() > new Date(event.registrationEndTime)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Registration for this event has closed'
      });
    }

    if (event.capacity && event.registeredCount >= event.capacity) {
      return res.status(400).json({
        status: 'fail',
        message: 'Event is full'
      });
    }

    const registrationEntry = {
      name: String(name).trim(),
      email: String(email).trim(),
      phone: phone ? String(phone).trim() : '',
      rollNumber: String(rollNumber).trim(),
      branch: branch ? String(branch).trim() : '',
      year: year !== undefined && year !== null ? String(year) : ''
    };

    if (event.category === 'Hackathon') {
      registrationEntry.teamName = String(teamName).trim();
      registrationEntry.members = members.map((m) => ({
        name: String(m.name).trim(),
        rollNumber: String(m.rollNumber).trim(),
        phone: m.phone ? String(m.phone).trim() : '',
        email: String(m.email).trim()
      }));
    }

    event.registrations.push(registrationEntry);
    event.registeredCount = event.registrations.length;
    await event.save();

    res.status(200).json({
      status: 'success',
      message: 'Successfully registered for the event'
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getUpcomingEvents = async (req, res) => {
  try {
    const events = await Event.find({
      isPublished: true,
      date: { $gte: new Date() }
    })
      .sort({ date: 1 })
      .limit(10)
      .populate('createdBy', 'name email');

    const formattedEvents = events.map(formatEvent);

    res.status(200).json({
      status: 'success',
      count: formattedEvents.length,
      events: formattedEvents
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getPastEvents = async (req, res) => {
  try {
    const events = await Event.find({
      isPublished: true,
      date: { $lt: new Date() }
    })
      .sort({ date: -1 })
      .populate('createdBy', 'name email');

    const formattedEvents = events.map(formatEvent);

    res.status(200).json({
      status: 'success',
      count: formattedEvents.length,
      events: formattedEvents
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.saveEvent = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { savedEvents: req.params.id } },
      { new: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Event saved'
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.unsaveEvent = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { savedEvents: req.params.id } },
      { new: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Event removed from saved'
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getEventRegistrations = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        status: 'fail',
        message: 'Event not found'
      });
    }

    res.status(200).json({
      status: 'success',
      registrations: event.registrations || []
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};
