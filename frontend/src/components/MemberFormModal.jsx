import { Modal, Form, Input, Select, DatePicker, Radio } from 'antd';
import dayjs from 'dayjs';
import { plans } from '../data/catalogData';

export default function MemberFormModal({ open, onCancel, onSubmit, editing, isAdmin, visibleTeams, currentUser }) {
  const [form] = Form.useForm();
  const defaultTeamId = editing?.teamId ?? (isAdmin ? visibleTeams[0]?.id : currentUser.teamId);
  const initialValues = editing ? {
    ...editing,
    startDate: dayjs(editing.startDate),
    planId: editing.planId,
    teamId: editing.teamId
  } : { teamId: defaultTeamId };

  return (
    <Modal
      title={editing ? 'Edit Member' : 'Add New Member'}
      open={open}
      onCancel={onCancel}
      okText={editing ? 'Update Member' : 'Add Member'}
      onOk={() => form.submit()}
      destroyOnClose
      centered
      width={560}
      className="memberModal"
    >
      <Form
        form={form}
        layout="vertical"
        preserve={false}
        className="memberForm"
        initialValues={initialValues}
        onFinish={(values) => onSubmit({
          ...values,
          startDate: values.startDate.format('YYYY-MM-DD')
        })}
      >
        <div className="memberFormGrid">
          <Form.Item name="name" label="Customer Name" rules={[{ required: true, message: 'Enter customer name' }]}>
            <Input placeholder="Enter customer name" />
          </Form.Item>
          <Form.Item name="mobile" label="Mobile Number" rules={[{ required: true, message: 'Enter mobile number' }]}>
            <Input placeholder="9876543210" maxLength={10} />
          </Form.Item>
          <Form.Item name="planId" label="Subscription Plan" rules={[{ required: true }]}>
            <Select placeholder="Select subscription plan" options={plans.map((plan) => ({ value: plan.id, label: plan.name }))} />
          </Form.Item>
          <Form.Item name="startDate" label="Start Date" rules={[{ required: true }]}>
            <DatePicker className="full" placeholder="Select start date" />
          </Form.Item>
        </div>
        <Form.Item name="paymentStatus" label="Payment Status" className="memberFormPayment">
          <Radio.Group className="memberPaymentGroup">
            <Radio value="Paid">Paid</Radio>
            <Radio value="Pending">Pending</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
}
