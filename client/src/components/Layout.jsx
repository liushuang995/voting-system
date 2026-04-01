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
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUsername(payload.username || 'Admin');
      } catch (e) {}
    }
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/admin/logout');
    } finally {
      localStorage.removeItem('token');
      navigate('/admin/login');
    }
  };

  const menuItems = [
    { key: '/admin', icon: <DashboardOutlined />, label: '仪表盘' },
    { key: '/admin/votes', icon: <BarChartOutlined />, label: '投票列表' },
    { key: '/admin/whitelist', icon: <TeamOutlined />, label: '白名单' },
    { key: '/admin/super-admins', icon: <SettingOutlined />, label: '设置' }
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
      {/* Desktop Sidebar */}
      <Sider
        theme="light"
        breakpoint="lg"
        collapsedWidth="0"
        onCollapse={(collapsed) => setCollapsed(collapsed)}
        className="admin-sider"
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          height: '100vh',
          overflow: 'auto'
        }}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          fontWeight: 'bold',
          color: '#2563EB'
        }}>
          {collapsed ? '投' : '投票智投'}
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      {/* Desktop Layout */}
      <Layout style={{ marginLeft: collapsed ? 0 : 200, transition: 'margin-left 0.2s' }} className="desktop-layout">
        <Header style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 99,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <Dropdown menu={userMenu} placement="bottomRight">
            <Avatar style={{ cursor: 'pointer', background: '#2563EB' }}>
              {username?.[0]?.toUpperCase() || 'A'}
            </Avatar>
          </Dropdown>
        </Header>
        <Content style={{ padding: 24, background: '#f5f7fa' }}>
          <Outlet />
        </Content>
      </Layout>

      {/* Mobile Bottom Navigation */}
      <div className="mobile-bottom-nav">
        {menuItems.map(item => (
          <div
            key={item.key}
            className={`mobile-nav-item ${location.pathname === item.key || (item.key !== '/admin' && location.pathname.startsWith(item.key)) ? 'active' : ''}`}
            onClick={() => navigate(item.key)}
          >
            <span className="mobile-nav-icon">{item.icon}</span>
            <span className="mobile-nav-label">{item.label}</span>
          </div>
        ))}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .admin-sider {
            display: none !important;
          }
          .desktop-layout {
            margin-left: 0 !important;
            padding-bottom: 70px;
          }
          .mobile-bottom-nav {
            display: flex !important;
          }
        }
        @media (min-width: 769px) {
          .mobile-bottom-nav {
            display: none !important;
          }
        }
        .mobile-bottom-nav {
          display: none;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 64px;
          background: #fff;
          box-shadow: 0 -2px 8px rgba(0,0,0,0.08);
          z-index: 100;
          justify-content: space-around;
          align-items: center;
          padding: 0 8px;
        }
        .mobile-nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          height: 100%;
          cursor: pointer;
          color: #999;
          transition: color 0.2s;
          -webkit-tap-highlight-color: transparent;
        }
        .mobile-nav-item:active {
          opacity: 0.7;
        }
        .mobile-nav-item.active {
          color: #2563EB;
        }
        .mobile-nav-icon {
          font-size: 22px;
          margin-bottom: 2px;
        }
        .mobile-nav-label {
          font-size: 11px;
        }
      `}</style>
    </Layout>
  );
}

export default AdminLayout;