const TeamMember = require('../models/TeamMember');

const sortMembers = (query) =>
  query.sort({ section: 1, sortOrder: 1, name: 1 }).lean();

exports.getPublicTeam = async (req, res) => {
  try {
    const members = await sortMembers(TeamMember.find());
    res.status(200).json({
      status: 'success',
      count: members.length,
      members,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.getAllTeamMembersAdmin = async (req, res) => {
  try {
    const members = await sortMembers(TeamMember.find());
    res.status(200).json({
      status: 'success',
      count: members.length,
      members,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.addTeamMember = async (req, res) => {
  try {
    const { name, role, section, linkedInUrl, description, sortOrder } = req.body;

    if (!name || !section) {
      return res.status(400).json({
        status: 'fail',
        message: 'Name and section are required',
      });
    }

    let photo = '';
    if (req.file) {
      photo = `/uploads/${req.file.filename}`;
    }

    const member = await TeamMember.create({
      name: name.trim(),
      role: (role && String(role).trim()) || 'Member',
      section,
      linkedInUrl: linkedInUrl ? String(linkedInUrl).trim() : '',
      description: description ? String(description).trim() : '',
      sortOrder: sortOrder !== undefined && sortOrder !== '' ? Number(sortOrder) : 0,
      photo,
    });

    res.status(201).json({
      status: 'success',
      member,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.updateTeamMember = async (req, res) => {
  try {
    const { name, role, section, linkedInUrl, description, sortOrder } = req.body;

    const existing = await TeamMember.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({
        status: 'fail',
        message: 'Team member not found',
      });
    }

    const update = {
      name: name !== undefined ? String(name).trim() : existing.name,
      role:
        role !== undefined && String(role).trim() !== ''
          ? String(role).trim()
          : existing.role,
      section: section !== undefined ? section : existing.section,
      linkedInUrl:
        linkedInUrl !== undefined ? String(linkedInUrl).trim() : existing.linkedInUrl,
      description:
        description !== undefined ? String(description).trim() : existing.description,
      sortOrder:
        sortOrder !== undefined && sortOrder !== ''
          ? Number(sortOrder)
          : existing.sortOrder,
    };

    if (req.file) {
      update.photo = `/uploads/${req.file.filename}`;
    }

    const member = await TeamMember.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      member,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.deleteTeamMember = async (req, res) => {
  try {
    const member = await TeamMember.findByIdAndDelete(req.params.id);

    if (!member) {
      return res.status(404).json({
        status: 'fail',
        message: 'Team member not found',
      });
    }

    res.sendStatus(204);
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};
