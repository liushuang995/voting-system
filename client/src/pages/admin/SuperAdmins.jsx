import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, message, Popconfirm } from 'antd';
import api from '../../api';

function SuperAdmins() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/super-admins');
      if (res?.code === 0) {
        setList(res.data);
      } else {
        message.error(res?.message || '获取失败');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      await form.validateFields();
      const res = await api.post('/admin/super-admins', form.getFieldsValue());
      if (res?.code === 0) {
        message.success('创建成功');
        setModalVisible(false);
        form.resetFields();
        loadData();
      } else {
        message.error(res?.message || '创建失败');
      }
    } catch (err) {
      // 用户取消验证
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/admin/super-admins/${id}`);
      if (res?.code === 0) {
        message.success('删除成功');
        loadData();
      } else {
        message.error(res?.message || '删除失败');
      }
    } catch (err) {
      message.error('删除失败');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '用户名', dataIndex: 'username' },
    { title: '状态', dataIndex: 'status', render: (s) => s === 'active' ? '正常' : '禁用' },
    { title: '创建时间', dataIndex: 'created_at', render: (t) => t ? new Date(t).toLocaleString() : '未知' },
    {
      title: '操作',
      render: (_, record) => (
        <Popconfirm
          title="确认删除？"
          onConfirm={() => handleDelete(record.id)}
          okText="确认"
          cancelText="取消"
        >
          <Button size="small" danger>删除</Button>
        </Popconfirm>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>超管管理</h2>
        <Button type="primary" onClick={() => setModalVisible(true)}>添加超管</Button>
      </div>
      <Table columns={columns} dataSource={list} rowKey="id" loading={loading} />

      <Modal
        title="添加超管"
        open={modalVisible}
        onOk={handleAdd}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        okText="添加"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }, { min: 6, message: '密码至少6位' }]}
          >
            <Input.Password placeholder="密码（至少6位）" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default SuperAdmins;