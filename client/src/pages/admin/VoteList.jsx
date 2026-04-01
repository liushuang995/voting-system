import { useState, useEffect, useCallback } from 'react';
import { Table, Button, Space, Input, Select, Popconfirm, message, Card } from 'antd';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined, EditOutlined, DeleteOutlined, BarChartOutlined, ShareAltOutlined, ReloadOutlined } from '@ant-design/icons';
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

  const copyShareUrl = (shareUrl) => {
    const url = `${window.location.origin}/vote/${shareUrl}`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url);
      message.success('分享链接已复制');
    } else {
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      message.success('分享链接已复制');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '标题', dataIndex: 'title', ellipsis: true },
    {
      title: '类型',
      dataIndex: 'type',
      width: 80,
      render: (type) => type === 'single' ? '单选' : '多选'
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (status) => status === 'active'
        ? <span style={{ color: '#52c41a' }}>进行中</span>
        : <span style={{ color: '#ff4d4f' }}>已截止</span>
    },
    { title: '创建时间', dataIndex: 'created_at', width: 160, render: (t) => new Date(t).toLocaleString() },
    {
      title: '操作',
      width: 180,
      render: (_, record) => (
        <Space size={4} wrap>
          <Button
            size="small"
            icon={<ShareAltOutlined />}
            onClick={() => copyShareUrl(record.share_url)}
            style={{ minWidth: 36 }}
          />
          <Button
            size="small"
            icon={<BarChartOutlined />}
            onClick={() => navigate(`/admin/votes/${record.id}/results`)}
            style={{ minWidth: 36 }}
          />
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/votes/${record.id}/edit`)}
            style={{ minWidth: 36 }}
          />
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} style={{ minWidth: 36 }} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        marginBottom: 16
      }}>
        <h2 style={{ margin: 0 }}>投票列表</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/admin/votes/create')}
          style={{ alignSelf: 'flex-start' }}
        >
          创建投票
        </Button>
      </div>

      <Card styles={{ body: { padding: '12px 16px' } }} style={{ marginBottom: 16 }}>
        <Space wrap size={[8, 12]}>
          <Input.Search
            placeholder="搜索投票标题"
            onSearch={(value) => {
              setSearch(value);
              setPagination(prev => ({ ...prev, current: 1 }));
            }}
            style={{ width: 180, minWidth: 140 }}
          />
          <Select
            value={status}
            onChange={(value) => {
              setStatus(value);
              setPagination(prev => ({ ...prev, current: 1 }));
            }}
            style={{ width: 110 }}
          >
            <Option value="all">全部</Option>
            <Option value="active">进行中</Option>
            <Option value="closed">已截止</Option>
          </Select>
          <Button icon={<ReloadOutlined />} onClick={loadVotes}>
            刷新
          </Button>
        </Space>
      </Card>

      <Card styles={{ body: { padding: 0 } }}>
        <Table
          columns={columns}
          dataSource={votes}
          rowKey="id"
          loading={loading}
          pagination={{ ...pagination, current: pagination.current }}
          onChange={handleTableChange}
          scroll={{ x: 700 }}
          size="middle"
        />
      </Card>
    </div>
  );
}

export default VoteList;