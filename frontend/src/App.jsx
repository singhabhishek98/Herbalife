import { useEffect, useMemo, useState } from 'react';
import { Avatar, Button, DatePicker, Empty, Input, message, Popconfirm, Spin, Table, Tag } from 'antd';
import {
  BellOutlined, CalendarOutlined, DownloadOutlined, FilterOutlined, MenuOutlined, PlusOutlined,
  SearchOutlined, TeamOutlined, UsergroupAddOutlined, WalletOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { plans as fallbackPlans, teams as fallbackTeams } from './data/catalogData';
import { api } from './lib/api';
import { currency, formatDate, getPlan, getTeam, initials, memberStatus, today } from './utils/helpers';
import Logo from './components/Logo';
import Sidebar from './components/Sidebar';
import StatCard from './components/StatCard';
import BottomNav from './components/BottomNav';
import MemberCard from './components/MemberCard';
import MemberFormModal from './components/MemberFormModal';
import RenewModal from './components/RenewModal';
import ForgotPasswordPage from './pages/Auth/ForgotPassword';

const defaultAuthForm = { name: '', email: '', password: '' };

function loadStoredSession() {
  try {
    return JSON.parse(localStorage.getItem('herbalife_session') || 'null');
  } catch {
    return null;
  }
}

function saveStoredSession(session) {
  localStorage.setItem('herbalife_session', JSON.stringify(session));
}

function clearStoredSession() {
  localStorage.removeItem('herbalife_session');
}

export default function App() {
  const storedSession = loadStoredSession();
  const [active, setActive] = useState('dashboard');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [teams, setTeams] = useState(fallbackTeams);
  const [planCatalog, setPlanCatalog] = useState(fallbackPlans);
  const [search, setSearch] = useState('');
  const [memberModal, setMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [renewMember, setRenewMember] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(storedSession?.token && storedSession?.user));
  const [currentUser, setCurrentUser] = useState(storedSession?.user || null);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState(defaultAuthForm);
  const [visitLog, setVisitLog] = useState([]);
  const [bootLoading, setBootLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    let ignore = false;

    async function bootstrap() {
      try {
        const [teamData, planData] = await Promise.all([
          api.getTeams().catch(() => fallbackTeams),
          api.getPlans().catch(() => fallbackPlans)
        ]);

        if (ignore) return;
        setTeams(teamData);
        setPlanCatalog(planData);

        if (storedSession?.token && storedSession?.user) {
          const [memberData, visitData] = await Promise.all([
            api.getMembers(),
            api.getVisits()
          ]);

          if (ignore) return;
          setMembers(memberData);
          setVisitLog(visitData);
        }
      } catch (error) {
        if (!ignore) {
          message.error(error.message || 'Failed to load app data');
        }
      } finally {
        if (!ignore) {
          setBootLoading(false);
        }
      }
    }

    bootstrap();
    return () => {
      ignore = true;
    };
  }, []);

  const visibleTeams = useMemo(
    () => (isAdmin ? teams : teams.filter((team) => team.id === currentUser?.teamId)),
    [currentUser?.teamId, isAdmin, teams]
  );

  const visibleMembers = useMemo(
    () => (isAdmin ? members : members.filter((member) => member.teamId === currentUser?.teamId)),
    [currentUser?.teamId, isAdmin, members]
  );

  const filteredMembers = useMemo(() => {
    return visibleMembers.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(search.toLowerCase()) ||
        member.mobile.includes(search);
      const matchesTeam = selectedTeam ? member.teamId === selectedTeam.id : true;
      return matchesSearch && matchesTeam;
    });
  }, [search, selectedTeam, visibleMembers]);

  const summary = useMemo(() => {
    const visibleMemberIds = new Set(visibleMembers.map((member) => member.id));
    const todayVisits = visitLog.filter((visit) => visit.date === today() && visibleMemberIds.has(visit.memberId)).length;
    const expiring = visibleMembers.filter((member) => member.remainingDays > 0 && member.remainingDays <= 5).length;
    const expired = visibleMembers.filter((member) => member.remainingDays <= 0).length;
    const collection = visibleMembers.reduce((sum, member) => sum + (member.paymentStatus === 'Paid' ? getPlan(member.planId).total : 0), 0);
    return { todayVisits, expiring, expired, collection };
  }, [visibleMembers, visitLog]);

  const endingSoon = useMemo(
    () => [...visibleMembers].filter((member) => member.remainingDays <= 5).sort((a, b) => a.remainingDays - b.remainingDays),
    [visibleMembers]
  );

  async function withPageLoading(work) {
    setPageLoading(true);
    try {
      return await work();
    } catch (error) {
      message.error(error.message || 'Something went wrong');
      throw error;
    } finally {
      setPageLoading(false);
    }
  }

  const openAdd = () => {
    setEditingMember(null);
    setMemberModal(true);
  };

  const openEdit = (member) => {
    setEditingMember(member);
    setMemberModal(true);
  };

  const handleSubmitMember = async (values) => {
    await withPageLoading(async () => {
      const scopedValues = {
        ...values,
        teamId: isAdmin ? values.teamId : currentUser.teamId
      };

      if (editingMember) {
        const updatedMember = await api.updateMember(editingMember.id, scopedValues);
        setMembers((prev) => prev.map((member) => (member.id === editingMember.id ? updatedMember : member)));
        message.success('Member updated successfully');
      } else {
        const createdMember = await api.createMember(scopedValues);
        setMembers((prev) => [createdMember, ...prev]);
        message.success('New member added');
      }

      setMemberModal(false);
    });
  };

  const handleDelete = async (id) => {
    await withPageLoading(async () => {
      await api.deleteMember(id);
      setMembers((prev) => prev.filter((member) => member.id !== id));
      setVisitLog((prev) => prev.filter((visit) => visit.memberId !== id));
      message.success('Member deleted');
    });
  };

  const handleMarkPresent = async (id) => {
    await withPageLoading(async () => {
      const response = await api.markVisit(id);
      setMembers((prev) => prev.map((member) => (
        member.id === response.member.id
          ? { ...member, remainingDays: response.member.remainingDays, lastVisit: response.member.lastVisit }
          : member
      )));
      setVisitLog((prev) => [response.visit, ...prev]);
      message.success('Present marked. Remaining day updated.');
    });
  };

  const handleRenew = async (values) => {
    await withPageLoading(async () => {
      const renewedMember = await api.renewMember(renewMember.id, values);
      setMembers((prev) => prev.map((member) => (member.id === renewMember.id ? renewedMember : member)));
      setRenewMember(null);
      message.success('Plan renewed successfully');
    });
  };

  const goTeam = (team) => {
    setSelectedTeam(team);
    setActive('members');
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();

    if (!authForm.email || !authForm.password || (authMode === 'signup' && !authForm.name)) {
      return message.warning('Please fill in all fields');
    }

    if (authMode === 'signup' && authForm.password.length < 6) {
      return message.warning('Password must be at least 6 characters long');
    }

    try {
      await withPageLoading(async () => {
        const response = authMode === 'login'
          ? await api.login({ email: authForm.email, password: authForm.password })
          : await api.signup({ name: authForm.name, email: authForm.email, password: authForm.password });

        saveStoredSession(response);
        setCurrentUser(response.user);
        setIsAuthenticated(true);
        setAuthForm(defaultAuthForm);

        const [memberData, visitData] = await Promise.all([api.getMembers(), api.getVisits()]);
        setMembers(memberData);
        setVisitLog(visitData);
        message.success(authMode === 'login' ? 'Logged in successfully' : 'Account created successfully');
      });
    } catch {
      return;
    }
  };

  const handleForgotPassword = async (email) => {
    try {
      await withPageLoading(async () => {
        const response = await api.forgotPassword({ email });
        message.success(response.message);
      });
    } catch {
      return;
    }
  };

  const handleLogout = () => {
    clearStoredSession();
    setCurrentUser(null);
    setMembers([]);
    setVisitLog([]);
    setIsAuthenticated(false);
    setActive('dashboard');
    setSelectedTeam(null);
    setAuthMode('login');
  };

  if (bootLoading) {
    return (
      <div className="authPage">
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AuthPage
        authMode={authMode}
        setAuthMode={setAuthMode}
        authForm={authForm}
        setAuthForm={setAuthForm}
        onSubmit={handleAuthSubmit}
        onForgotPassword={handleForgotPassword}
        loading={pageLoading}
      />
    );
  }

  return (
    <div className="appShell">
      <Sidebar active={active} isAdmin={isAdmin} onChange={(key) => { setActive(key); if (key !== 'members') setSelectedTeam(null); }} />

      <main className="mainArea">
        <MobileTop active={active} selectedTeam={selectedTeam} onBack={() => { setSelectedTeam(null); setActive('teams'); }} />

        {pageLoading && (
          <div style={{ padding: '0 24px 12px' }}>
            <Spin />
          </div>
        )}

        {active === 'dashboard' && (
          <Dashboard summary={summary} members={visibleMembers} visibleTeams={visibleTeams} endingSoon={endingSoon} onAdd={openAdd} onMark={handleMarkPresent} onRenew={setRenewMember} onTeam={goTeam} currentUser={currentUser} />
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

        {active === 'reports' && <ReportsView members={visibleMembers} visitLog={visitLog.filter((visit) => visibleMembers.some((member) => member.id === visit.memberId))} />}
        {active === 'profile' && <ProfileView currentUser={currentUser} onLogout={handleLogout} planCatalog={planCatalog} />}
        {active === 'settings' && <ProfileView currentUser={currentUser} onLogout={handleLogout} planCatalog={planCatalog} />}
      </main>

      <BottomNav active={active} onChange={(key) => { setActive(key); if (key !== 'members') setSelectedTeam(null); }} onAdd={openAdd} />

      <MemberFormModal open={memberModal} editing={editingMember} isAdmin={isAdmin} visibleTeams={visibleTeams} currentUser={currentUser} onCancel={() => setMemberModal(false)} onSubmit={handleSubmitMember} />
      <RenewModal open={!!renewMember} member={renewMember} onCancel={() => setRenewMember(null)} onSubmit={handleRenew} />
    </div>
  );
}

function AuthPage({ authMode, setAuthMode, authForm, setAuthForm, onSubmit, onForgotPassword, loading }) {
  if (authMode === 'forgot') {
    return <ForgotPasswordPage onBackToLogin={() => setAuthMode('login')} onSubmitEmail={onForgotPassword} loading={loading} />;
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
          {authMode === 'login' && (
            <div className="authForgotLink">
              <button type="button" className="authForgotButton" onClick={() => setAuthMode('forgot')}>
                Forgot Password?
              </button>
            </div>
          )}
          <Button type="primary" htmlType="submit" block loading={loading}>
            {authMode === 'login' ? 'Login' : 'Create Account'}
          </Button>
        </form>

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

function Dashboard({ summary, members, visibleTeams, endingSoon, onRenew, currentUser }) {
  return (
    <div className="page dashboardPage">
      <div className="desktopHeader">
        <h1>Dashboard</h1>
        <div><DatePicker defaultValue={dayjs(today())} /> <Button type="primary" icon={<DownloadOutlined />}>Export</Button></div>
      </div>

      <section className="heroMobile">
        <h1>Good Morning, {currentUser?.name || 'User'} 👋</h1>
        <p>Track members and subscriptions</p>
      </section>

      <div className="statsGrid">
        <StatCard title="Total Members" value={members.length} note="+12 this month" icon={<UsergroupAddOutlined />} />
        <StatCard title="Active Member" value={summary.todayVisits} note="+5 vs yesterday" icon={<TeamOutlined />} />
      </div>

      <div className="dashboardContent">
        <div className="panel endingPanel">
          <div className="panelHead"><h3>Ending Soon</h3><Button type="link">View All</Button></div>
          {endingSoon.slice(0, 4).map((member) => {
            const status = memberStatus(member.remainingDays);
            return <div className="miniMember" key={member.id}>
              <Avatar src={member.avatar}>{initials(member.name)}</Avatar>
              <b>{member.name}</b>
              <Tag color={status.tone === 'green' ? 'green' : status.tone === 'orange' ? 'orange' : 'red'}>{status.label}</Tag>
              <Button size="small" type="primary" onClick={() => onRenew(member)}>Renew</Button>
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
        const teamMembers = members.filter((member) => member.teamId === team.id);
        const expiring = teamMembers.filter((member) => member.remainingDays <= 5).length;
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
      <Tag>Active ({members.filter((member) => member.remainingDays > 0).length})</Tag>
      <Tag>Expired ({members.filter((member) => member.remainingDays <= 0).length})</Tag>
      {selectedTeam && <Tag color="blue">{selectedTeam.name}</Tag>}
    </div>
    {members.length ? <div className="memberGrid">
      {members.map((member) => <Popconfirm key={member.id} title="Delete this member?" onConfirm={() => onDelete(member.id)} okText="Delete" cancelText="Cancel">
        <div onClick={(e) => e.stopPropagation()}>
          <MemberCard member={member} onMark={onMark} onRenew={onRenew} onEdit={onEdit} onDelete={() => {}} />
        </div>
      </Popconfirm>)}
    </div> : <Empty description="No member found" />}
  </div>;
}

function ReportsView({ members, visitLog }) {
  const paid = members.filter((member) => member.paymentStatus === 'Paid').length;
  return <div className="page">
    <div className="desktopHeader"><h1>Reports</h1><Button type="primary" icon={<DownloadOutlined />}>Export</Button></div>
    <div className="statsGrid reportStats">
      <StatCard title="Paid Members" value={paid} note="Payment completed" icon={<WalletOutlined />} />
      <StatCard title="Pending Payment" value={members.length - paid} note="Need follow up" icon={<BellOutlined />} />
      <StatCard title="Total Visits" value={visitLog.length} note="All time visits" icon={<CalendarOutlined />} />
      <StatCard title="Revenue" value={currency(members.reduce((sum, member) => sum + (member.paymentStatus === 'Paid' ? getPlan(member.planId).total : 0), 0))} note="Current cycle" icon={<WalletOutlined />} green />
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
      { title: 'Team', render: (_, record) => getTeam(record.teamId)?.name },
      { title: 'Last Visit', render: (_, record) => formatDate(record.lastVisit) },
      { title: 'Plan', render: (_, record) => getPlan(record.planId).name },
      { title: 'Remaining', render: (_, record) => <Tag color={record.remainingDays <= 0 ? 'red' : record.remainingDays <= 5 ? 'orange' : 'green'}>{record.remainingDays <= 0 ? 'Expired' : `${record.remainingDays} Days`}</Tag> },
      ...(!compact ? [{ title: 'Payment', dataIndex: 'paymentStatus' }] : [])
    ]}
  />;
}

function ProfileView({ currentUser, onLogout, planCatalog }) {
  return <div className="page profilePage">
    <div className="profileCard">
      <Avatar size={90} src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop&crop=face" />
      <h2>{currentUser?.name || 'User'}</h2>
      <p>{currentUser?.role === 'admin' ? 'Admin' : 'Team Head'} • Herbalife</p>
      <Button type="primary" onClick={onLogout}>Logout</Button>
    </div>
    <div className="panel"><h3>Subscription Plans</h3>{planCatalog.map((plan) => <div className="planRow" key={plan.id}><b>{plan.name}</b><span>₹{plan.pricePerDay} × {plan.days}</span><Tag color="green">₹{plan.total}</Tag></div>)}</div>
  </div>;
}
