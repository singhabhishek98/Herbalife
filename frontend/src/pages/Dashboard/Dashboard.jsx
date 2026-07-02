import { Avatar, Button, DatePicker, Tag } from 'antd';
import { DownloadOutlined, TeamOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import StatCard from '../../components/StatCard';
import { avatarStyle, initials, memberStatus } from '../../utils/helpers';

export default function DashboardPage({ summary, members, endingSoon, onAdd, onRenew, onTeam }) {
  return (
    <div className="page dashboardPage">
      <div className="desktopHeader">
        <h1>Dashboard</h1>
        <div><DatePicker defaultValue={dayjs('2026-07-02')} /> <Button type="primary" icon={<DownloadOutlined />}>Export</Button></div>
      </div>

      <section className="heroMobile">
        <h1>Good Morning, Manish 👋</h1>
        <p>Track members and subscriptions</p>
      </section>

      <div className="statsGrid">
        <StatCard title="Total Members" value={members.length} note="+12 this month" icon={<UsergroupAddOutlined />} />
        <StatCard title="Active Member" value={summary.todayVisits} note="+5 vs yesterday" icon={<TeamOutlined />} />
      </div>

      <div className="dashboardContent">
        <div className="panel endingPanel">
          <div className="panelHead"><h3>Ending Soon</h3><Button type="link">View All</Button></div>
          {endingSoon.slice(0, 4).map((m) => {
            const status = memberStatus(m.remainingDays);
            return <div className="miniMember" key={m.id}>
              <Avatar style={avatarStyle(m.name)}>{initials(m.name).charAt(0)}</Avatar>
              <b>{m.name}</b>
              <Tag color={status.tone === 'green' ? 'green' : status.tone === 'orange' ? 'orange' : 'red'}>{status.label}</Tag>
              <Button size="small" type="primary" onClick={() => onRenew(m)}>Renew</Button>
            </div>;
          })}
        </div>

        <div className="panel recentPanel">
          <h3>Recent Visits</h3>
          <p>Member activity will appear here.</p>
        </div>
      </div>
    </div>
  );
}
