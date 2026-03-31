import { useState, useEffect } from 'react';
import { Card, Button, Radio, Checkbox, Space, message, Result, Spin, Form, Input } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';

// 检测是否在微信环境
const isWeChat = () => {
  return /MicroMessenger/i.test(navigator.userAgent);
};

function VotePage() {
  const { shareUrl } = useParams();
  const navigate = useNavigate();
  const [vote, setVote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState([]);
  const [voted, setVoted] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    // 非微信环境先加载投票
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

  const handleVoterLogin = async (values) => {
    setLoginLoading(true);
    try {
      const res = await api.post('/wechat/voter/login', values);
      if (res?.code === 0) {
        localStorage.setItem('voter_token', res.data.token);
        localStorage.setItem('voter_nickname', res.data.nickname);
        message.success('登录成功');
        loadVote();
      } else {
        message.error(res?.message || '登录失败');
      }
    } catch (err) {
      message.error('登录失败');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (selected.length === 0) {
      return message.error('请至少选择一个选项');
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('voter_token');
      const res = await api.post('/wechat/vote', {
        share_url: shareUrl,
        options: selected
      }, token ? {
        headers: { Authorization: `Bearer ${token}` }
      } : {});
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

  // 非微信环境显示登录表单
  if (!isWeChat()) {
    return (
      <div style={{ maxWidth: 400, margin: '50px auto', padding: '0 16px' }}>
        <Card title="请先登录">
          <p style={{ marginBottom: 16, color: '#666' }}>使用白名单账号登录后可参与投票</p>
          <Form onFinish={handleVoterLogin} layout="vertical">
            <Form.Item
              name="unionid"
              label="账号"
              rules={[{ required: true, message: '请输入账号' }]}
            >
              <Input placeholder="请输入账号" />
            </Form.Item>
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loginLoading} block>
                登录
              </Button>
            </Form.Item>
          </Form>
        </Card>
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

  let options = [];
  try {
    options = JSON.parse(vote.options || '[]');
  } catch (e) {
    options = [];
  }

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
          {options.length === 0 ? (
            <p style={{ color: '#999' }}>暂无可投票项</p>
          ) : vote.type === 'single' ? (
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