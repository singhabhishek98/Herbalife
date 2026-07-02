import { Avatar, Button, Dropdown, Tag } from 'antd';
import { CalendarOutlined, MoreOutlined } from '@ant-design/icons';
import { avatarStyle, formatDate, getPlan, initials, memberStatus } from '../utils/helpers';

export default function MemberCard({ member, onMark, onRenew, onEdit, onDelete }) {
  const plan = getPlan(member.planId);
  const status = memberStatus(member.remainingDays);
  return (
    <div className="memberCard">
      <div className="memberMain">
        <Avatar size={56} style={avatarStyle(member.name)} className="memberInitialAvatar">
          {initials(member.name).charAt(0)}
        </Avatar>
        <div className="memberInfo">
          <div className="memberName">{member.name}</div>
          <Tag color="green">Plan: {plan.name}</Tag>
          <small>Start: {formatDate(member.startDate)}</small>
        </div>
        <div className={`daysPill ${status.tone}`}>
          <b>{member.remainingDays}</b>
          <span>{member.remainingDays <= 0 ? 'Expired' : member.remainingDays === 1 ? 'Day Left' : 'Days Left'}</span>
        </div>
      </div>
      <div className="memberFooter">
        <span><CalendarOutlined /> Last Visit: {formatDate(member.lastVisit)}</span>
        <div className="memberActions">
          <Button size="small" type="primary" disabled={member.remainingDays <= 0} onClick={() => onMark(member.id)}>Mark Present</Button>
          <Button size="small" onClick={() => onRenew(member)}>Renew</Button>
          <Dropdown
            menu={{ items: [
              { key: 'edit', label: 'Edit', onClick: () => onEdit(member) },
              { key: 'delete', label: 'Delete', danger: true, onClick: () => onDelete(member.id) }
            ] }}
          >
            <Button size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </div>
      </div>
    </div>
  );
}
