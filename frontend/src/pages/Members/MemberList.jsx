import { Empty, Input, Popconfirm, Tag } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import MemberCard from '../../components/MemberCard';
import { Button } from 'antd';

export default function MemberListPage({ selectedTeam, search, setSearch, members, onAdd, onMark, onRenew, onEdit, onDelete }) {
  return <div className="page membersPage">
    <div className="membersToolbar">
      <Input prefix={<SearchOutlined />} placeholder="Search member..." value={search} onChange={(e) => setSearch(e.target.value)} />
      <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>Add Member</Button>
    </div>
    <div className="filterPills">
      <Tag color="green">All ({members.length})</Tag>
      <Tag>Active ({members.filter((m) => m.remainingDays > 0).length})</Tag>
      <Tag>Expired ({members.filter((m) => m.remainingDays <= 0).length})</Tag>
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
