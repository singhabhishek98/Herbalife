const Member = require('../models/Member');
const { getPlanById } = require('../constants/plans');

function serializeMember(member) {
  return {
    id: member._id.toString(),
    name: member.name,
    mobile: member.mobile,
    teamId: member.teamId,
    planId: member.planId,
    startDate: member.startDate,
    remainingDays: member.remainingDays,
    lastVisit: member.lastVisit,
    paymentStatus: member.paymentStatus,
    notes: member.notes,
    avatar: member.avatar
  };
}

async function listMembers(req, res, next) {
  try {
    const members = await Member.find().sort({ createdAt: -1 });
    return res.json(members.map(serializeMember));
  } catch (error) {
    return next(error);
  }
}

async function createMember(req, res, next) {
  try {
    const plan = getPlanById(req.body.planId);
    if (!plan) {
      return res.status(400).json({ message: 'Invalid plan selected' });
    }

    const member = await Member.create({
      ...req.body,
      teamId: Number(req.body.teamId),
      planId: Number(req.body.planId),
      remainingDays: plan.days,
      lastVisit: '',
      avatar: req.body.avatar || ''
    });

    return res.status(201).json(serializeMember(member));
  } catch (error) {
    return next(error);
  }
}

async function updateMember(req, res, next) {
  try {
    const update = { ...req.body };
    if (update.teamId !== undefined) update.teamId = Number(update.teamId);
    if (update.planId !== undefined) update.planId = Number(update.planId);

    const member = await Member.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true
    });

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    return res.json(serializeMember(member));
  } catch (error) {
    return next(error);
  }
}

async function deleteMember(req, res, next) {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
}

async function renewMember(req, res, next) {
  try {
    const { planId, paymentStatus } = req.body;
    const plan = getPlanById(planId);

    if (!plan) {
      return res.status(400).json({ message: 'Invalid plan selected' });
    }

    const member = await Member.findByIdAndUpdate(
      req.params.id,
      {
        planId: Number(planId),
        paymentStatus,
        startDate: new Date().toISOString().slice(0, 10),
        remainingDays: plan.days
      },
      { new: true, runValidators: true }
    );

    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    return res.json(serializeMember(member));
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  listMembers,
  createMember,
  updateMember,
  deleteMember,
  renewMember
};
