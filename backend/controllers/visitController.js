const Member = require('../models/Member');
const Visit = require('../models/Visit');

function today() {
  return new Date().toISOString().slice(0, 10);
}

function serializeVisit(visit) {
  return {
    id: visit._id.toString(),
    memberId: visit.memberId.toString(),
    date: visit.date
  };
}

function isAdmin(user) {
  return user?.role === 'admin';
}

async function listVisits(req, res, next) {
  try {
    if (isAdmin(req.user)) {
      const visits = await Visit.find().sort({ createdAt: -1 });
      return res.json(visits.map(serializeVisit));
    }

    const scopedMembers = await Member.find({ teamId: Number(req.user.teamId) }).select('_id');
    const memberIds = scopedMembers.map((member) => member._id);
    const visits = await Visit.find({ memberId: { $in: memberIds } }).sort({ createdAt: -1 });
    return res.json(visits.map(serializeVisit));
  } catch (error) {
    return next(error);
  }
}

async function markVisit(req, res, next) {
  try {
    const { memberId } = req.body;
    if (!memberId) {
      return res.status(400).json({ message: 'memberId is required' });
    }

    const existing = await Visit.findOne({ memberId, date: today() });
    if (existing) {
      return res.status(409).json({ message: 'This member is already marked present today' });
    }

    const memberQuery = isAdmin(req.user)
      ? { _id: memberId }
      : { _id: memberId, teamId: Number(req.user.teamId) };
    const member = await Member.findOne(memberQuery);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    member.remainingDays = Math.max(0, member.remainingDays - 1);
    member.lastVisit = today();
    await member.save();

    const visit = await Visit.create({ memberId, date: today() });
    return res.status(201).json({
      visit: serializeVisit(visit),
      member: {
        id: member._id.toString(),
        remainingDays: member.remainingDays,
        lastVisit: member.lastVisit
      }
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listVisits, markVisit };
