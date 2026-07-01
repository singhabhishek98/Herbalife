import { HomeOutlined, TeamOutlined, PlusOutlined, BarChartOutlined, UserOutlined } from '@ant-design/icons';

const items = [
  { key: 'dashboard', label: 'Home', icon: <HomeOutlined /> },
  { key: 'teams', label: 'Teams', icon: <TeamOutlined /> },
  { key: 'add', label: 'Add', icon: <PlusOutlined />, special: true },
  { key: 'reports', label: 'Reports', icon: <BarChartOutlined /> },
  { key: 'profile', label: 'Profile', icon: <UserOutlined /> }
];

export default function BottomNav({ active, onChange, onAdd }) {
  return (
    <div className="bottomNav">
      {items.map((item) => (
        <button
          key={item.key}
          className={`${item.special ? 'navAdd' : ''} ${active === item.key ? 'active' : ''}`}
          onClick={() => (item.special ? onAdd() : onChange(item.key))}
        >
          <span>{item.icon}</span>
          {!item.special && <small>{item.label}</small>}
        </button>
      ))}
    </div>
  );
}
