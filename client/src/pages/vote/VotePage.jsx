import { useState, useEffect } from 'react';
import { Card, Button, Radio, Checkbox, Space, message, Result, Spin } from 'antd';
import { useParams } from 'react-router-dom';
import api from '../../api';

function VotePage() {
  const { shareUrl } = useParams();
  const [vote, setVote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState([]);
  const [voted, setVoted] = useState(false);

  useEffect(() => {
    loadVote();
  }, [shareUrl]);

  const loadVote = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/wechat/votes/public/${shareUrl}`);
      if (res?.code === 0) {
        setVote(res.data);
      } else {
        message.error(res?.message || '加载失败');
      }
    } catch (err) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (selected.length === 0) {
      return message.error('请至少选择一个选项');
    }

    setSubmitting(true);
    try {
      const res = await api.post('/wechat/vote', {
        share_url: shareUrl,
        options: selected
      });
      if (res?.code === 0) {
        setVoted(true);
      } else {
        message.error(res?.message || '投票失败');
      }
    } catch (err) {
      message.error('投票失败');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!vote) {
    return (
      <Result
        status="error"
        title="投票不存在"
        extra={<Button type="primary" href="/">返回首页</Button>}
      />
    );
  }

  // 检查投票是否已截止
  if (vote.status !== 'active' || (vote.end_time && new Date(vote.end_time) < new Date())) {
    return (
      <Result
        status="warning"
        title="投票已截止"
        subTitle="感谢您的参与"
        extra={<Button type="primary" href="/">返回首页</Button>}
      />
    );
  }

  if (voted) {
    return (
      <Result
        status="success"
        title="投票成功！"
        subTitle="感谢您的参与"
        extra={<Button type="primary" href="/">返回首页</Button>}
      />
    );
  }

  const options = JSON.parse(vote.options || '[]');

  return (
    <div style={{ maxWidth: 600, margin: '50px auto', padding: '0 16px' }}>
      <Card title={<h2 style={{ margin: 0 }}>{vote.title}</h2>}>
        {vote.description && (
          <p style={{ color: '#666', marginBottom: 16 }}>{vote.description}</p>
        )}

        <div style={{ marginBottom: 16 }}>
          <p>投票类型：{vote.type === 'single' ? '单选' : '多选'}</p>
        </div>

        <div style={{ marginBottom: 24 }}>
          {vote.type === 'single' ? (
            <Radio.Group value={selected[0]} onChange={(e) => setSelected([e.target.value])}>
              <Space direction="vertical">
                {options.map((opt, idx) => (
                  <Radio key={idx} value={idx} style={{ fontSize: 16 }}>{opt}</Radio>
                ))}
              </Space>
            </Radio.Group>
          ) : (
            <Checkbox.Group value={selected} onChange={(values) => setSelected(values)}>
              <Space direction="vertical">
                {options.map((opt, idx) => (
                  <Checkbox key={idx} value={idx} style={{ fontSize: 16 }}>{opt}</Checkbox>
                ))}
              </Space>
            </Checkbox.Group>
          )}
        </div>

        <Button
          type="primary"
          size="large"
          block
          loading={submitting}
          onClick={handleSubmit}
        >
          提交投票
        </Button>
      </Card>
    </div>
  );
}

export default VotePage;