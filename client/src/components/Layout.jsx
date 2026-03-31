import { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown } from 'antd';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  BarChartOutlined,
  TeamOutlined,
  SettingOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import api from '../api';

const { Header, Sider, Content } = Layout;

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUsername(payload.username);
      } catch (e) {}
    }
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/admin/logout');
    } finally {
      localStorage.removeItem('token');
      navigate('/admin/login'); // 使用 navigate 而不是 window.location.href
    }
  };

  const menuItems = [
    { key: '/admin', icon: <DashboardOutlined />, label: '仪表盘' },
    { key: '/admin/votes', icon: <BarChartOutlined />, label: '投票列表' },
    { key: '/admin/whitelist', icon: <TeamOutlined />, label: '白名单管理' },
    { key: '/admin/super-admins', icon: <SettingOutlined />, label: '超管管理' }
  ];

  const userMenu = {
    items: [
      { key: 'logout', icon: <LogoutOutlined />, label: '退出登录', danger: true }
    ],
    onClick: ({ key }) => {
      if (key === 'logout') handleLogout();
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light" breakpoint="lg" collapsedWidth="0">
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 'bold' }}>
          投票智投
        </div>
        <Menu mode="inline" selectedKeys={[location.pathname]} items={menuItems} onClick={({ key }) => navigate(key)} />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Dropdown menu={userMenu} placement="bottomRight">
            <Avatar style={{ cursor: 'pointer' }}>{username?.[0]?.toUpperCase() || 'A'}</Avatar>
          </Dropdown>
        </Header>
        <Content style={{ padding: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export default AdminLayout;