import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic } from 'antd';
import { BarChartOutlined, TeamOutlined, CheckCircleOutlined } from '@ant-design/icons';
import api from '../../api';

function Dashboard() {
  const [stats, setStats] = useState({ totalVotes: 0, totalParticipants: 0, activeVotes: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await api.get('/votes/stats');
      if (res.code === 0) {
        setStats(res.data);
      }
    } catch (err) {
      // 暂时不处理
    }
  };

  return (
    <div>
      <h2>仪表盘</h2>
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
    </div>
  );
}

export default Dashboard;