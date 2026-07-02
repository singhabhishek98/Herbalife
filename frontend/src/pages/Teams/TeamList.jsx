import { Avatar, Tag } from 'antd';

export default function TeamListPage({ members, visibleTeams, onTeam }) {
  return <div className="page narrowPage">
    <div className="teamList">
      {visibleTeams.map((team) => {
        const teamMembers = members.filter((m) => m.teamId === team.id);
        const expiring = teamMembers.filter((m) => m.remainingDays <= 5).length;
        return <button className="teamCard" key={team.id} onClick={() => onTeam(team)}>
          <Avatar size={72} src={team.avatar} />
          <div><b>{team.name}</b><Tag color="green">Head</Tag><p>{teamMembers.length} Members • {Math.max(1, Math.round(teamMembers.length / 2))} Today Visits</p><small>{expiring} Expiring Soon</small></div>
          <span>›</span>
        </button>;
      })}
    </div>
  </div>;
}
