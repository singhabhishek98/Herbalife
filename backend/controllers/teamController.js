const User = require('../models/User');
const { teams: seededTeams } = require('../constants/teams');

function getFallbackTeamData(teamId) {
  return seededTeams.find((team) => team.id === Number(teamId)) || {};
}

async function listTeams(req, res, next) {
  try {
    const headUsers = await User.find({ role: 'head' }).sort({ teamId: 1, createdAt: 1 }).select('name teamId');
    const dynamicTeams = headUsers.map((user) => {
      const fallback = getFallbackTeamData(user.teamId);
      return {
        id: user.teamId,
        name: fallback.name || `${user.name} Team`,
        head: user.name,
        phone: fallback.phone || '',
        avatar: fallback.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop&crop=face'
      };
    });

    return res.json(dynamicTeams);
  } catch (error) {
    return next(error);
  }
}

module.exports = { listTeams };
