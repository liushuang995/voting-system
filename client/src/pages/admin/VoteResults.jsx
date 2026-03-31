import { useState, useEffect, useMemo } from 'react';
import { Card, Row, Col, Progress, Table, Button, Space, Spin, message } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import api from '../../api';

function VoteResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vote, setVote] = useState(null);
  const [records, setRecords] = useState([]);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const voteRes = await api.get(`/votes/${id}`);
      if (voteRes.code === 0) {
        setVote(voteRes.data);
        const options = JSON.parse(voteRes.data.options || '[]');
        const initialResults = {};
        options.forEach((opt, idx) => {
          initialResults[idx] = { label: opt, count: 0, percentage: 0 };
        });

        const recordsRes = await api.get(`/votes/${id}/records`);
        if (recordsRes.code === 0) {
          setRecords(recordsRes.data.list || []);
          const newResults = { ...initialResults };
          (recordsRes.data.list || []).forEach(record => {
            try {
              const selectedOptions = JSON.parse(record.options || '[]');
              selectedOptions.forEach(optIdx => {
                if (newResults[optIdx]) {
                  newResults[optIdx].count++;
                }
              });
            } catch (e) {
              // ignore invalid options
            }
          });
          const total = recordsRes.data.list?.length || 0;
          Object.keys(newResults).forEach(idx => {
            newResults[idx].percentage = total > 0 ? Math.round((newResults[idx].count / total) * 100) : 0;
          });
          setResults(newResults);
        } else {
          setResults(initialResults);
          message.error(recordsRes.message || '获取投票记录失败');
        }
      } else {
        message.error(voteRes.message || '获取投票详情失败');
      }
    } catch (err) {
      console.error(err);
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo(() => [
    {
      title: '微信昵称',
      dataIndex: 'nickname',
      render: (nickname) => nickname || '未知'
    },
    {
      title: '投票时间',
      dataIndex: 'created_at',
      render: (t) => t ? new Date(t).toLocaleString() : '未知'
    },
    {
      title: '选择选项',
      dataIndex: 'options',
      render: (opts) => {
        try {
          const parsed = JSON.parse(opts);
          return parsed.map(idx => results[idx]?.label || `选项${idx + 1}`).join(', ');
        } catch {
          return '未知';
        }
      }
    }
  ], [results]);

  if (!vote) return <Spin spinning={loading}><div style={{ minHeight: 200 }} /></Spin>;

  const total = records.length;

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/votes')}>返回</Button>
        <h2 style={{ margin: 0 }}>{vote.title}</h2>
      </Space>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card title="投票人数">{total}</Card>
        </Col>
        <Col span={8}>
          <Card title="投票类型">{vote.type === 'single' ? '单选' : '多选'}</Card>
        </Col>
        <Col span={8}>
          <Card title="状态">{vote.status === 'active' ? '进行中' : '已截止'}</Card>
        </Col>
      </Row>

      <Card title="投票结果" style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]}>
          {Object.entries(results).map(([idx, { label, count, percentage }]) => (
            <Col span={12} key={idx}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ width: 100 }}>{label}</span>
                <Progress percent={percentage} format={() => `${count}票`} style={{ flex: 1 }} />
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      <Card title="投票明细">
        <Table columns={columns} dataSource={records} rowKey="id" pagination={{ pageSize: 20 }} />
      </Card>
    </div>
  );
}

export default VoteResults;