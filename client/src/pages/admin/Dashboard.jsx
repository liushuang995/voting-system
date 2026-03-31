import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Spin, message } from 'antd';
import { BarChartOutlined, TeamOutlined, CheckCircleOutlined } from '@ant-design/icons';
import api from '../../api';

function Dashboard() {
  const [stats, setStats] = useState({ totalVotes: 0, totalParticipants: 0, activeVotes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/votes/stats');
      if (res.code === 0) {
        setStats(res.data);
      } else {
        message.error(res.message || '获取统计数据失败');
      }
    } catch (err) {
      console.error('获取统计数据失败:', err);
      message.error('获取统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>仪表盘</h2>
      <Spin spinning={loading}>
        <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic title="投票总数" value={stats.totalVotes} prefix={<BarChartOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="参与人数" value={stats.totalParticipants} prefix={<TeamOutlined />} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="进行中投票" value={stats.activeVotes} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
      </Row>
      </Spin>
    </div>
  );
}

export default Dashboard;