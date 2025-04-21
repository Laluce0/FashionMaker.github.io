import React from 'react';
import { Layout, Menu } from 'antd';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
// Placeholder components for pages - will be created later or kept simple
import DesignerPage from './Pages/DesignerPage'; // Assuming DesignerPage will be in src/Pages/

const { Header, Content } = Layout;

// Placeholder Pages
const HomePage = () => <div>Home Page Content</div>;
const BuilderPage = () => <div>Builder Page Content</div>;

const App = () => {
  const location = useLocation();

  // Determine the selected key based on the current path
  const getSelectedKeys = () => {
    const path = location.pathname;
    if (path.startsWith('/designer')) return ['designer'];
    if (path.startsWith('/builder')) return ['builder'];
    return ['home']; // Default to home
  };

  return (
    <Layout style={{ minHeight: '100vh' }}> {/* Ensure layout takes full height */}
      <Header style={{ display: 'flex', alignItems: 'center', padding: '0 20px', backgroundColor: '#fff', borderBottom: '1px solid #f0f0f0' }}>
        {/* Simple Logo/Title Placeholder */}
        <div style={{ fontSize: '20px', fontWeight: 'bold', marginRight: '50px' }}>FashionMaker</div>
        <Menu
          theme="light" // Use light theme for the top bar
          mode="horizontal"
          selectedKeys={getSelectedKeys()}
          style={{ flex: 1, minWidth: 0, borderBottom: 'none' }} // Remove default border
        >
          <Menu.Item key="home"><Link to="/">Home</Link></Menu.Item>
          <Menu.Item key="designer"><Link to="/designer">Designer</Link></Menu.Item>
          <Menu.Item key="builder"><Link to="/builder">Builder</Link></Menu.Item>
        </Menu>
        {/* Placeholder for Search Bar if needed */}
        {/* <Input.Search placeholder="Search" style={{ width: 200, marginLeft: 'auto' }} /> */}
      </Header>
      <Content style={{ /* Removed padding to allow page content full control */ }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/designer/*" element={<DesignerPage />} /> {/* Nested routes possible */}
          <Route path="/builder" element={<BuilderPage />} />
        </Routes>
      </Content>
      {/* Footer removed as per the plan */}
    </Layout>
  );
};
export default App;