import { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../api';

function VoterLogin() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const shareUrl = location.state?.shareUrl;

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await api.post('/wechat/voter/login', values);
      if (res?.code === 0) {
        localStorage.setItem('voter_token', res.data.token);
        localStorage.setItem('voter_nickname', res.data.nickname);
        message.success('登录成功');
        if (shareUrl) {
          navigate(`/vote/${shareUrl}`);
        } else {
          navigate('/');
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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
      <Card title="用户登录" style={{ width: 360 }}>
        <Form onFinish={onFinish} layout="vertical">
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
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default VoterLogin;
