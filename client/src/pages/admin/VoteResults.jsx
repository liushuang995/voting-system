import { useState, useEffect, useMemo } from 'react';
import { Card, Row, Col, Progress, Table, Button, Space, Spin, message } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, DownloadOutlined } from '@ant-design/icons';
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
        let options = [];
        if (Array.isArray(voteRes.data.options)) {
          options = voteRes.data.options;
        } else if (typeof voteRes.data.options === 'string') {
          try {
            options = JSON.parse(voteRes.data.options || '[]');
          } catch (e) {
            options = [];
          }
        }
        const initialResults = {};
        options.forEach((opt, idx) => {
          initialResults[idx] = { label: opt, count: 0, percentage: 0 };
        });

        const recordsRes = await api.get(`/votes/${id}/records`);
        if (recordsRes.code === 0) {
          setRecords(recordsRes.data.list || []);
          const newResults = { ...initialResults };
          (recordsRes.data.list || []).forEach(record => {
            let selectedOptions = [];
            if (Array.isArray(record.options)) {
              selectedOptions = record.options;
            } else if (typeof record.options === 'string') {
              try {
                selectedOptions = JSON.parse(record.options || '[]');
              } catch (e) {}
            }
            selectedOptions.forEach(optIdx => {
              const key = parseInt(optIdx);
              if (newResults[key] !== undefined) {
                newResults[key].count++;
              }
            });
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
      title: '用户名称',
      dataIndex: 'nickname',
      width: 120,
      render: (nickname) => nickname || '未知'
    },
    {
      title: '投票时间',
      dataIndex: 'created_at',
      width: 160,
      render: (t) => t ? new Date(t).toLocaleString() : '未知'
    },
    {
      title: '选择选项',
      dataIndex: 'options',
      render: (opts) => {
        let parsed = [];
        if (Array.isArray(opts)) {
          parsed = opts;
        } else if (typeof opts === 'string') {
          try {
            parsed = JSON.parse(opts);
          } catch {
            return '未知';
          }
        }
        return parsed.map(idx => results[parseInt(idx)]?.label || `选项${parseInt(idx) + 1}`).join(', ');
      }
    }
  ], [results]);

  if (!vote) return <Spin spinning={loading}><div style={{ minHeight: 200 }} /></Spin>;

  const total = records.length;

  return (
    <div>
      <Space wrap style={{ marginBottom: 16, gap: 8 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/votes')}>返回</Button>
        <Button icon={<DownloadOutlined />} onClick={() => window.open(`/api/votes/${id}/export`)}>导出</Button>
      </Space>

      <h2 style={{ margin: '16px 0', fontSize: 20 }}>{vote.title}</h2>

      <Row gutter={[12, 12]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card title="投票人数" size="small">
            <span style={{ fontSize: 24, fontWeight: 'bold', color: '#2563EB' }}>{total}</span>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card title="投票类型" size="small">
            <span style={{ fontSize: 16 }}>{vote.type === 'single' ? '单选' : '多选'}</span>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card title="状态" size="small">
            <span style={{
              fontSize: 16,
              color: vote.status === 'active' ? '#52c41a' : '#ff4d4f'
            }}>
              {vote.status === 'active' ? '进行中' : '已截止'}
            </span>
          </Card>
        </Col>
      </Row>

      <Card title="投票结果" style={{ marginBottom: 16 }}>
        <Row gutter={[12, 12]}>
          {Object.entries(results).map(([idx, { label, count, percentage }]) => (
            <Col xs={24} sm={12} key={idx}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 0'
              }}>
                <span style={{
                  minWidth: 80,
                  maxWidth: 120,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>{label}</span>
                <Progress
                  percent={percentage}
                  format={() => `${count}票`}
                  style={{ flex: 1 }}
                  strokeColor="#2563EB"
                />
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      <Card title="投票明细">
        <Table
          columns={columns}
          dataSource={records}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
          scroll={{ x: 500 }}
          size="small"
        />
      </Card>
    </div>
  );
}

export default VoteResults;