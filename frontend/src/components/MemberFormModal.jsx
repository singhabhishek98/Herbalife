import { Modal, Form, Input, Select, DatePicker, Radio } from 'antd';
import dayjs from 'dayjs';
import { plans } from '../data/mockData';

export default function MemberFormModal({ open, onCancel, onSubmit, editing, isAdmin, visibleTeams, currentUser }) {
  const [form] = Form.useForm();
  const teamOptions = visibleTeams.map((team) => ({ value: team.id, label: team.name }));
  const defaultTeamId = editing?.teamId ?? (isAdmin ? visibleTeams[0]?.id : currentUser.teamId);

  return (
    <Modal
      title={editing ? 'Edit Member' : 'Add New Member'}
      open={open}
      onCancel={onCancel}
      okText={editing ? 'Update Member' : 'Add Member'}
      onOk={() => form.submit()}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        preserve={false}
        initialValues={editing ? {
          ...editing,
          startDate: dayjs(editing.startDate),
          planId: editing.planId,
          teamId: editing.teamId
        } : { teamId: defaultTeamId, planId: 3, paymentStatus: 'Paid', startDate: dayjs() }}
        onFinish={(values) => onSubmit({
          ...values,
          startDate: values.startDate.format('YYYY-MM-DD')
        })}
      >
        <Form.Item name="name" label="Customer Name" rules={[{ required: true, message: 'Enter customer name' }]}>
          <Input placeholder="Rahul Kumar" />
        </Form.Item>
        <Form.Item name="mobile" label="Mobile Number" rules={[{ required: true, message: 'Enter mobile number' }]}>
          <Input placeholder="9876543210" maxLength={10} />
        </Form.Item>
        <Form.Item name="teamId" label="Team Head" rules={[{ required: true }]}>
          <Select disabled={!isAdmin} options={teamOptions} />
        </Form.Item>
        <Form.Item name="planId" label="Subscription Plan" rules={[{ required: true }]}>
          <Select options={plans.map(p => ({ value: p.id, label: `${p.name} - ₹${p.pricePerDay} x ${p.days} = ₹${p.total}` }))} />
        </Form.Item>
        <Form.Item name="startDate" label="Start Date" rules={[{ required: true }]}>
          <DatePicker className="full" />
        </Form.Item>
        <Form.Item name="paymentStatus" label="Payment Status">
          <Radio.Group>
            <Radio value="Paid">Paid</Radio>
            <Radio value="Pending">Pending</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="notes" label="Notes">
          <Input.TextArea rows={3} placeholder="Optional notes" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
