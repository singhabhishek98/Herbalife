import { BellOutlined, BarChartOutlined, CalendarOutlined, DashboardOutlined, SettingOutlined, TeamOutlined, UsergroupAddOutlined, WalletOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';
import Logo from './Logo';

const items = [
  { key: 'dashboard', label: 'Dashboard', icon: <DashboardOutlined /> },
  { key: 'teams', label: 'Team Members', icon: <TeamOutlined /> },
  { key: 'members', label: 'Members', icon: <UsergroupAddOutlined /> },
  { key: 'visits', label: 'Visits', icon: <CalendarOutlined /> },
  { key: 'payments', label: 'Payments', icon: <WalletOutlined /> },
  { key: 'reports', label: 'Reports', icon: <BarChartOutlined /> },
  { key: 'alerts', label: 'Alerts', icon: <BellOutlined /> },
  { key: 'settings', label: 'Settings', icon: <SettingOutlined /> }
];

export default function Sidebar({ active, isAdmin, onChange }) {
  const visibleItems = isAdmin ? items : items.filter((item) => item.key !== 'teams');

  return (
    <aside className="sidebar">
      <Logo />
      <div className="sideMenu">
        {visibleItems.map((item) => (
          <button key={item.key} className={active === item.key ? 'active' : ''} onClick={() => onChange(item.key)}>
            {item.icon}<span>{item.label}</span>
          </button>
        ))}
      </div>
      <div className="sideUser">
        <Avatar src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face" />
        <div><b>Manish</b><small>Team Head</small></div>
      </div>
    </aside>
  );
}
