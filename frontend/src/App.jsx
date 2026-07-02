import { useMemo, useState } from 'react';
import { Avatar, Button, DatePicker, Empty, Input, message, Popconfirm, Table, Tag } from 'antd';
import {
  BellOutlined, CalendarOutlined, DownloadOutlined, FilterOutlined, MenuOutlined, PlusOutlined,
  SearchOutlined, TeamOutlined, UsergroupAddOutlined, WalletOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { initialMembers, plans, teams } from './data/mockData';
import { currency, formatDate, getPlan, getTeam, initials, memberStatus, today } from './utils/helpers';
import Logo from './components/Logo';
import Sidebar from './components/Sidebar';
import StatCard from './components/StatCard';
import BottomNav from './components/BottomNav';
import MemberCard from './components/MemberCard';
import MemberFormModal from './components/MemberFormModal';
import RenewModal from './components/RenewModal';
import ForgotPasswordPage from './pages/Auth/ForgotPassword';

const currentUser = {
  name: 'Manish',
  role: 'head',
  teamId: 1
};

export default function App() {
  const [active, setActive] = useState('dashboard');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [members, setMembers] = useState(initialMembers);
  const [search, setSearch] = useState('');
  const [memberModal, setMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [renewMember, setRenewMember] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [visitLog, setVisitLog] = useState([
    { id: 1, memberId: 101, date: '2026-07-01' },
    { id: 2, memberId: 102, date: '2026-07-02' },
    { id: 3, memberId: 103, date: '2026-07-02' },
    { id: 4, memberId: 104, date: '2026-07-02' },
    { id: 5, memberId: 105, date: '2026-07-01' }
  ]);
  const isAdmin = currentUser.role === 'admin';
  const visibleTeams = useMemo(
    () => (isAdmin ? teams : teams.filter((team) => team.id === currentUser.teamId)),
    [isAdmin]
  );
  const visibleMembers = useMemo(
    () => (isAdmin ? members : members.filter((member) => member.teamId === currentUser.teamId)),
    [isAdmin, members]
  );

  const filteredMembers = useMemo(() => {
    return visibleMembers.filter((m) => {
      const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.mobile.includes(search);
      const matchesTeam = selectedTeam ? m.teamId === selectedTeam.id : true;
      return matchesSearch && matchesTeam;
    });
  }, [search, selectedTeam, visibleMembers]);

  const summary = useMemo(() => {
    const visibleMemberIds = new Set(visibleMembers.map((member) => member.id));
    const todayVisits = visitLog.filter((v) => v.date === today() && visibleMemberIds.has(v.memberId)).length || 18;
    const expiring = visibleMembers.filter((m) => m.remainingDays > 0 && m.remainingDays <= 5).length;
    const expired = visibleMembers.filter((m) => m.remainingDays <= 0).length;
    const collection = visibleMembers.reduce((sum, m) => sum + (m.paymentStatus === 'Paid' ? getPlan(m.planId).total : 0), 0);
    return { todayVisits, expiring, expired, collection };
  }, [visibleMembers, visitLog]);

  const openAdd = () => { setEditingMember(null); setMemberModal(true); };
  const openEdit = (member) => { setEditingMember(member); setMemberModal(true); };

  const handleSubmitMember = (values) => {
    const plan = getPlan(values.planId);
    const scopedValues = {
      ...values,
      teamId: isAdmin ? values.teamId : currentUser.teamId
    };
    if (editingMember) {
      setMembers((prev) => prev.map((m) => m.id === editingMember.id ? { ...m, ...scopedValues, remainingDays: m.remainingDays || plan.days } : m));
      message.success('Member updated successfully');
    } else {
      setMembers((prev) => [{
        id: Date.now(),
        ...scopedValues,
        remainingDays: plan.days,
        lastVisit: '',
        avatar: ''
      }, ...prev]);
      message.success('New member added');
    }
    setMemberModal(false);
  };

  const handleDelete = (id) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    message.success('Member deleted');
  };

  const handleMarkPresent = (id) => {
    const alreadyMarked = visitLog.some((v) => v.memberId === id && v.date === today());
    if (alreadyMarked) return message.warning('This member is already marked present today');
    setMembers((prev) => prev.map((m) => m.id === id ? { ...m, remainingDays: Math.max(0, m.remainingDays - 1), lastVisit: today() } : m));
    setVisitLog((prev) => [{ id: Date.now(), memberId: id, date: today() }, ...prev]);
    message.success('Present marked. Remaining day updated.');
  };

  const handleRenew = (values) => {
    const plan = getPlan(values.planId);
    setMembers((prev) => prev.map((m) => m.id === renewMember.id ? {
      ...m,
      planId: values.planId,
      paymentStatus: values.paymentStatus,
      startDate: today(),
      remainingDays: plan.days
    } : m));
    setRenewMember(null);
    message.success('Plan renewed successfully');
  };

  const endingSoon = [...visibleMembers].filter((m) => m.remainingDays <= 5).sort((a, b) => a.remainingDays - b.remainingDays);

  const goTeam = (team) => {
    setSelectedTeam(team);
    setActive('members');
  };

  const handleAuthSubmit = (event) => {
    event.preventDefault();
    if (authMode === 'forgot') return;
    if (!authForm.email || !authForm.password || (authMode === 'signup' && !authForm.name)) {
      return message.warning('Please fill in all fields');
    }
    setIsAuthenticated(true);
    message.success(authMode === 'login' ? 'Logged in successfully' : 'Account created successfully');
  };

  if (!isAuthenticated) {
    return (
      <AuthPage
        authMode={authMode}
        setAuthMode={setAuthMode}
        authForm={authForm}
        setAuthForm={setAuthForm}
        onSubmit={handleAuthSubmit}
      />
    );
  }

  return (
    <div className="appShell">
      <Sidebar active={active} isAdmin={isAdmin} onChange={(key) => { setActive(key); if (key !== 'members') setSelectedTeam(null); }} />

      <main className="mainArea">
        <MobileTop active={active} selectedTeam={selectedTeam} onBack={() => { setSelectedTeam(null); setActive('teams'); }} />

        {active === 'dashboard' && (
          <Dashboard summary={summary} members={visibleMembers} visibleTeams={visibleTeams} endingSoon={endingSoon} onAdd={openAdd} onMark={handleMarkPresent} onRenew={setRenewMember} onTeam={goTeam} />
        )}

        {active === 'teams' && <TeamsView members={visibleMembers} visibleTeams={visibleTeams} onTeam={goTeam} />}

        {active === 'members' && (
          <MembersView
            selectedTeam={selectedTeam}
            search={search}
            setSearch={setSearch}
            members={filteredMembers}
            onAdd={openAdd}
            onMark={handleMarkPresent}
            onRenew={setRenewMember}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        )}

        {active === 'reports' && <ReportsView members={visibleMembers} visitLog={visitLog.filter((v) => visibleMembers.some((m) => m.id === v.memberId))} />}
        {(active === 'profile' || active === 'settings') && <ProfileView />}
      </main>

      <BottomNav active={active} onChange={(key) => { setActive(key); if (key !== 'members') setSelectedTeam(null); }} onAdd={openAdd} />

      <MemberFormModal open={memberModal} editing={editingMember} isAdmin={isAdmin} visibleTeams={visibleTeams} currentUser={currentUser} onCancel={() => setMemberModal(false)} onSubmit={handleSubmitMember} />
      <RenewModal open={!!renewMember} member={renewMember} onCancel={() => setRenewMember(null)} onSubmit={handleRenew} />
    </div>
  );
}

function AuthPage({ authMode, setAuthMode, authForm, setAuthForm, onSubmit }) {
  if (authMode === 'forgot') {
    return <ForgotPasswordPage onBackToLogin={() => setAuthMode('login')} />;
  }

  return (
    <div className="authPage">
      <div className="authCard">
        <div className="authHeader">
          <div className="logoBox">
            <div className="logoIcon"><span style={{ fontSize: 22 }}>🌿</span></div>
            <div>
              <div className="logoTitle">Herbalife</div>
              <div className="logoSub">MEMBER DASH</div>
            </div>
          </div>
          <p className="authIntro">Welcome back. Sign in or create a new account to continue.</p>
        </div>

        <div className="authToggle">
          <button type="button" className={authMode === 'login' ? 'active' : ''} onClick={() => setAuthMode('login')}>Login</button>
          <button type="button" className={authMode === 'signup' ? 'active' : ''} onClick={() => setAuthMode('signup')}>Signup</button>
        </div>

        <form className="authForm" onSubmit={onSubmit}>
          {authMode === 'signup' && (
            <Input
              placeholder="Full name"
              value={authForm.name}
              onChange={(e) => setAuthForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          )}
          <Input
            placeholder="Email address"
            type="email"
            value={authForm.email}
            onChange={(e) => setAuthForm((prev) => ({ ...prev, email: e.target.value }))}
          />
          <Input.Password
            placeholder="Password"
            value={authForm.password}
            onChange={(e) => setAuthForm((prev) => ({ ...prev, password: e.target.value }))}
          />
          <Button type="primary" htmlType="submit" block>
            {authMode === 'login' ? 'Login' : 'Create Account'}
          </Button>
        </form>

        {authMode === 'login' && (
          <div className="authForgotLink">
            <button type="button" onClick={() => setAuthMode('forgot')}>Forgot Password?</button>
          </div>
        )}

        <p className="authHint">
          {authMode === 'login' ? 'New here?' : 'Already have an account?'}
          <button type="button" onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}>
            {authMode === 'login' ? 'Create account' : 'Login instead'}
          </button>
        </p>
      </div>
    </div>
  );
}

function MobileTop({ active, selectedTeam, onBack }) {
  const title = selectedTeam ? selectedTeam.name : active === 'dashboard' ? '' : active.charAt(0).toUpperCase() + active.slice(1);
  return (
    <div className="mobileTop">
      {selectedTeam ? <Button type="text" onClick={onBack}>‹</Button> : <Button type="text" icon={<MenuOutlined />} />}
      {active === 'dashboard' ? <Logo /> : <h3>{title}</h3>}
      <Button type="text" icon={selectedTeam ? <FilterOutlined /> : <BellOutlined />} />
    </div>
  );
}

function Dashboard({ summary, members, visibleTeams, endingSoon, onAdd, onMark, onRenew, onTeam }) {
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
              <Avatar src={m.avatar}>{initials(m.name)}</Avatar>
              <b>{m.name}</b>
              <Tag color={status.tone === 'green' ? 'green' : status.tone === 'orange' ? 'orange' : 'red'}>{status.label}</Tag>
              <Button size="small" type="primary" onClick={() => onRenew(m)}>Renew</Button>
            </div>;
          })}
        </div>

        <div className="panel recentPanel">
          <h3>Recent Visits</h3>
          <MemberTable members={members.slice(0, 5)} compact />
        </div>
      </div>
    </div>
  );
}

function TeamsView({ members, visibleTeams, onTeam }) {
  return <div className="page narrowPage">
    <Input prefix={<SearchOutlined />} placeholder="Search team member..." className="searchBox" />
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

function MembersView({ selectedTeam, search, setSearch, members, onAdd, onMark, onRenew, onEdit, onDelete }) {
  return <div className="page membersPage">
    <div className="membersToolbar">
      <Input prefix={<SearchOutlined />} placeholder="Search member..." value={search} onChange={(e) => setSearch(e.target.value)} />
      <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>Add Member</Button>
    </div>
    <div className="filterPills">
      <Tag color="green">All ({members.length})</Tag>
      <Tag>Active ({members.filter(m => m.remainingDays > 0).length})</Tag>
      <Tag>Expired ({members.filter(m => m.remainingDays <= 0).length})</Tag>
      {selectedTeam && <Tag color="blue">{selectedTeam.name}</Tag>}
    </div>
    {members.length ? <div className="memberGrid">
      {members.map((m) => <Popconfirm key={m.id} title="Delete this member?" onConfirm={() => onDelete(m.id)} okText="Delete" cancelText="Cancel">
        <div onClick={(e) => e.stopPropagation()}>
          <MemberCard member={m} onMark={onMark} onRenew={onRenew} onEdit={onEdit} onDelete={() => {}} />
        </div>
      </Popconfirm>)}
    </div> : <Empty description="No member found" />}
  </div>;
}

function ReportsView({ members, visitLog }) {
  const paid = members.filter(m => m.paymentStatus === 'Paid').length;
  return <div className="page">
    <div className="desktopHeader"><h1>Reports</h1><Button type="primary" icon={<DownloadOutlined />}>Export</Button></div>
    <div className="statsGrid reportStats">
      <StatCard title="Paid Members" value={paid} note="Payment completed" icon={<WalletOutlined />} />
      <StatCard title="Pending Payment" value={members.length - paid} note="Need follow up" icon={<BellOutlined />} />
      <StatCard title="Total Visits" value={visitLog.length} note="All time visits" icon={<CalendarOutlined />} />
      <StatCard title="Revenue" value={currency(members.reduce((s, m) => s + (m.paymentStatus === 'Paid' ? getPlan(m.planId).total : 0), 0))} note="Current cycle" icon={<WalletOutlined />} green />
    </div>
    <div className="panel"><h3>Member Report</h3><MemberTable members={members} /></div>
  </div>;
}

function MemberTable({ members, compact }) {
  return <Table
    size="small"
    pagination={false}
    dataSource={members}
    rowKey="id"
    scroll={{ x: 620 }}
    columns={[
      { title: 'Member Name', dataIndex: 'name' },
      { title: 'Team', render: (_, r) => getTeam(r.teamId)?.name },
      { title: 'Last Visit', render: (_, r) => formatDate(r.lastVisit) },
      { title: 'Plan', render: (_, r) => getPlan(r.planId).name },
      { title: 'Remaining', render: (_, r) => <Tag color={r.remainingDays <= 0 ? 'red' : r.remainingDays <= 5 ? 'orange' : 'green'}>{r.remainingDays <= 0 ? 'Expired' : `${r.remainingDays} Days`}</Tag> },
      ...(!compact ? [{ title: 'Payment', dataIndex: 'paymentStatus' }] : [])
    ]}
  />;
}

function ProfileView() {
  return <div className="page profilePage">
    <div className="profileCard">
      <Avatar size={90} src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop&crop=face" />
      <h2>Manish</h2>
      <p>Team Head • Herbalife</p>
      <Button type="primary">Edit Profile</Button>
    </div>
    <div className="panel"><h3>Subscription Plans</h3>{plans.map(p => <div className="planRow" key={p.id}><b>{p.name}</b><span>₹{p.pricePerDay} × {p.days}</span><Tag color="green">₹{p.total}</Tag></div>)}</div>
  </div>;
}
