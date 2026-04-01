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
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('voter_token'));

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

  const handleVoterLogin = async (values) => {
    setLoginLoading(true);
    try {
      const res = await api.post('/wechat/voter/login', values);
      if (res?.code === 0) {
        localStorage.setItem('voter_token', res.data.token);
        localStorage.setItem('voter_nickname', res.data.nickname);
        message.success('登录成功');
        setIsLoggedIn(true);
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
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
        padding: '24px'
      }}>
        <Spin size="large" />
      </div>
    );
  }

  // 非微信环境且未登录，显示登录表单
  if (!isWeChat() && !isLoggedIn) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f7fa',
        padding: '16px'
      }}>
        <Card
          title="请先登录"
          style={{ width: '100%', maxWidth: 400 }}
          styles={{ body: { padding: '20px' } }}
        >
          <p style={{ marginBottom: 16, color: '#666' }}>使用白名单账号登录后可参与投票</p>
          <Form onFinish={handleVoterLogin} layout="vertical">
            <Form.Item
              name="unionid"
              label="账号"
              rules={[{ required: true, message: '请输入账号' }]}
            >
              <Input
                placeholder="请输入账号"
                size="large"
                style={{ height: 48 }}
              />
            </Form.Item>
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                placeholder="请输入密码"
                size="large"
                style={{ height: 48 }}
              />
            </Form.Item>
            <Form.Item style={{ marginTop: 24 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loginLoading}
                block
                size="large"
                style={{ height: 52 }}
              >
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
  if (Array.isArray(vote.options)) {
    options = vote.options;
  } else if (typeof vote.options === 'string') {
    try {
      options = JSON.parse(vote.options);
    } catch (e) {
      options = [];
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f7fa',
      padding: '16px'
    }}>
      <Card
        title={<h2 style={{ margin: 0, fontSize: 20 }}>{vote.title}</h2>}
        style={{ width: '100%', maxWidth: 600, margin: '0 auto' }}
        styles={{ body: { padding: '20px' } }}
      >
        {vote.description && (
          <p style={{ color: '#666', marginBottom: 16, lineHeight: 1.6 }}>{vote.description}</p>
        )}

        <div style={{
          background: '#f8fafc',
          padding: '12px 16px',
          borderRadius: 8,
          marginBottom: 20
        }}>
          <span style={{ color: '#64748b', fontSize: 14 }}>
            投票类型：
            <span style={{ color: '#2563EB', fontWeight: 600 }}>
              {vote.type === 'single' ? '单选' : '多选'}
            </span>
          </span>
        </div>

        <div style={{ marginBottom: 24 }}>
          {options.length === 0 ? (
            <p style={{ color: '#999', textAlign: 'center', padding: '24px 0' }}>暂无可投票项</p>
          ) : vote.type === 'single' ? (
            <Radio.Group
              value={selected[0]}
              onChange={(e) => setSelected([e.target.value])}
              style={{ width: '100%' }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size={12}>
                {options.map((opt, idx) => (
                  <Radio.Button
                    key={idx}
                    value={idx}
                    style={{
                      fontSize: 16,
                      height: 52,
                      lineHeight: '50px',
                      textAlign: 'center',
                      width: '100%',
                      borderRadius: 12,
                      border: '2px solid #e2e8f0',
                    }}
                  >
                    {opt}
                  </Radio.Button>
                ))}
              </Space>
            </Radio.Group>
          ) : (
            <Checkbox.Group
              value={selected}
              onChange={(values) => setSelected(values)}
              style={{ width: '100%' }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size={12}>
                {options.map((opt, idx) => (
                  <Checkbox
                    key={idx}
                    value={idx}
                    style={{
                      fontSize: 16,
                      height: 52,
                      lineHeight: '50px',
                      paddingLeft: 16,
                      background: '#fff',
                      border: '2px solid #e2e8f0',
                      borderRadius: 12,
                      width: '100%',
                      marginLeft: 0
                    }}
                  >
                    {opt}
                  </Checkbox>
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
          style={{
            height: 52,
            fontSize: 17,
            fontWeight: 600,
            borderRadius: 12
          }}
        >
          提交投票
        </Button>
      </Card>
    </div>
  );
}

export default VotePage;