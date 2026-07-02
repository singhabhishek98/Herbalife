import { Modal, Form, Select, Radio } from 'antd';
import { plans } from '../data/catalogData';

export default function RenewModal({ open, onCancel, onSubmit, member }) {
  const [form] = Form.useForm();
  return (
    <Modal title={`Renew ${member?.name || ''}`} open={open} onCancel={onCancel} okText="Renew Plan" onOk={() => form.submit()} destroyOnClose>
      <Form form={form} layout="vertical" preserve={false} initialValues={{ planId: 3, paymentStatus: 'Paid' }} onFinish={onSubmit}>
        <Form.Item name="planId" label="Select New Plan" rules={[{ required: true }]}>
          <Select options={plans.map(p => ({ value: p.id, label: `${p.name} - ₹${p.total}` }))} />
        </Form.Item>
        <Form.Item name="paymentStatus" label="Payment Status">
          <Radio.Group>
            <Radio value="Paid">Paid</Radio>
            <Radio value="Pending">Pending</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
}
