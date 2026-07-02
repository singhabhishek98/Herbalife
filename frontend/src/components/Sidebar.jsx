import { BarChartOutlined, DashboardOutlined, SettingOutlined, TeamOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import { Avatar } from 'antd';
import Logo from './Logo';
import { avatarStyle, initials } from '../utils/helpers';

const items = [
  { key: 'dashboard', label: 'Dashboard', icon: <DashboardOutlined /> },
  { key: 'teams', label: 'Team Members', icon: <TeamOutlined /> },
  { key: 'members', label: 'Members', icon: <UsergroupAddOutlined /> },
  { key: 'reports', label: 'Reports', icon: <BarChartOutlined /> },
  { key: 'settings', label: 'Settings', icon: <SettingOutlined /> }
];

export default function Sidebar({ active, isAdmin, currentUser, onChange }) {
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
        <Avatar style={avatarStyle(currentUser?.name)}>
          {initials(currentUser?.name || 'User')}
        </Avatar>
        <div>
          <b>{currentUser?.name || 'User'}</b>
          <small>{currentUser?.role === 'admin' ? 'Admin' : 'Team Head'}</small>
        </div>
      </div>
    </aside>
  );
}
