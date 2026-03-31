import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Popconfirm } from 'antd';
import api from '../../api';

function Whitelist() {
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
      const res = await api.get('/admin/whitelist');
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
      const res = await api.post('/admin/whitelist', form.getFieldsValue());
      if (res?.code === 0) {
        message.success('添加成功');
        setModalVisible(false);
        form.resetFields();
        loadData();
      } else {
        message.error(res?.message || '添加失败');
      }
    } catch (err) {
      // 用户取消验证
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/admin/whitelist/${id}`);
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
    { title: 'UnionID', dataIndex: 'unionid' },
    { title: '昵称', dataIndex: 'nickname' },
    { title: '添加时间', dataIndex: 'created_at', render: (t) => t ? new Date(t).toLocaleString() : '未知' },
    {
      title: '操作',
      render: (_, record) => (
        <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.id)}>
          <Button size="small" danger>删除</Button>
        </Popconfirm>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>管理员白名单</h2>
        <Button type="primary" onClick={() => setModalVisible(true)}>添加管理员</Button>
      </div>
      <Table columns={columns} dataSource={list} rowKey="id" loading={loading} />

      <Modal
        title="添加管理员"
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
            name="unionid"
            label="UnionID"
            rules={[{ required: true, message: '请输入微信 UnionID' }]}
          >
            <Input placeholder="请输入微信 UnionID" />
          </Form.Item>
          <Form.Item name="nickname" label="昵称">
            <Input placeholder="管理员昵称（选填）" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Whitelist;