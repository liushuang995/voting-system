import { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api';

function VoterLogin() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const shareUrl = searchParams.get('shareUrl');

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await api.post('/wechat/voter/login', values);
      if (res?.code === 0) {
        localStorage.setItem('voter_token', res.data.token);
        localStorage.setItem('voter_nickname', res.data.nickname);
        message.success('登录成功');
        if (shareUrl) {
          navigate(`/vote/${shareUrl}`, { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } else {
        message.error(res?.message || '登录失败');
      }
    } catch (err) {
      message.error('登录失败');
    } finally {
      setLoading(false);
    }
  };

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
        title="用户登录"
        style={{ width: '100%', maxWidth: 400 }}
        styles={{ body: { padding: '20px' } }}
      >
        {shareUrl && (
          <p style={{ marginBottom: 16, color: '#666' }}>即将跳转至投票页面</p>
        )}
        <Form onFinish={onFinish} layout="vertical">
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
              loading={loading}
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

export default VoterLogin;