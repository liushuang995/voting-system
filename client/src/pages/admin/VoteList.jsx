import { useState, useEffect, useCallback } from 'react';
import { Table, Button, Space, Input, Select, Popconfirm, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined, EditOutlined, DeleteOutlined, BarChartOutlined, ShareAltOutlined } from '@ant-design/icons';
import api from '../../api';

const { Option } = Select;

function VoteList() {
  const navigate = useNavigate();
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [status, setStatus] = useState('all');
  const [search, setSearch] = useState('');

  const loadVotes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/votes', {
        params: {
          status,
          page: pagination.current,
          pageSize: pagination.pageSize,
          search
        }
      });
      if (res.code === 0) {
        setVotes(res.data.list);
        setPagination(prev => ({ ...prev, total: res.data.total }));
      }
    } catch (err) {
      message.error('获取投票列表失败');
    } finally {
      setLoading(false);
    }
  }, [status, pagination.current, pagination.pageSize, search]);

  useEffect(() => {
    loadVotes();
  }, [loadVotes]);

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/votes/${id}`);
      if (res.code === 0) {
        message.success('删除成功');
        loadVotes();
      }
    } catch (err) {
      message.error('删除失败');
    }
  };

  const handleTableChange = (newPagination) => {
    setPagination(prev => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize
    }));
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '标题', dataIndex: 'title', ellipsis: true },
    {
      title: '类型',
      dataIndex: 'type',
      render: (type) => type === 'single' ? '单选' : '多选'
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status) => status === 'active'
        ? <span style={{ color: '#52c41a' }}>进行中</span>
        : <span style={{ color: '#ff4d4f' }}>已截止</span>
    },
    { title: '创建时间', dataIndex: 'created_at', render: (t) => new Date(t).toLocaleString() },
    {
      title: '操作',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<ShareAltOutlined />} onClick={() => {
            const shareUrl = `${window.location.origin}/vote/${record.share_url}`;
            if (navigator.clipboard?.writeText) {
              navigator.clipboard.writeText(shareUrl);
              message.success('分享链接已复制');
            } else {
              const input = document.createElement('input');
              input.value = shareUrl;
              document.body.appendChild(input);
              input.select();
              document.execCommand('copy');
              document.body.removeChild(input);
              message.success('分享链接已复制');
            }
          }} />
          <Button size="small" icon={<BarChartOutlined />} onClick={() => navigate(`/admin/votes/${record.id}/results`)} />
          <Button size="small" icon={<EditOutlined />} onClick={() => navigate(`/admin/votes/${record.id}/edit`)} />
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>投票列表</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/admin/votes/create')}>
          创建投票
        </Button>
      </div>
      <Space style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="搜索投票标题"
          onSearch={(value) => {
            setSearch(value);
            setPagination(prev => ({ ...prev, current: 1 }));
          }}
          style={{ width: 200 }}
        />
        <Select value={status} onChange={(value) => {
          setStatus(value);
          setPagination(prev => ({ ...prev, current: 1 }));
        }} style={{ width: 120 }}>
          <Option value="all">全部</Option>
          <Option value="active">进行中</Option>
          <Option value="closed">已截止</Option>
        </Select>
        <Button onClick={loadVotes}>刷新</Button>
      </Space>
      <Table
        columns={columns}
        dataSource={votes}
        rowKey="id"
        loading={loading}
        pagination={{ ...pagination, current: pagination.current }}
        onChange={handleTableChange}
      />
    </div>
  );
}

export default VoteList;