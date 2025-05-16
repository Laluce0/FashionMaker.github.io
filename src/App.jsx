import React, { useState, useRef } from 'react';
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
  const designerPageRef = useRef(null); // Ref for DesignerPage
  const location = useLocation();
  // State and handlers like filename, panels, geometry, activeHighlightColor, 
  // handlePanelsChange, handleModelLoad are now moved to DesignerPage.jsx

  // Handler to trigger SVG export in PatternPanel via DesignerPage
  // This remains if App.jsx still needs to initiate the export, 
  // otherwise, it can be removed if export is only triggered from within DesignerPage or its children.
  const handleExportPatternSVG = () => {
    designerPageRef.current?.triggerExportPatternSVG();
  };

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
        <div style={{ fontSize: '20px', fontWeight: 'bold', marginRight: '30px' }}>FashionMaker</div>
        <Menu
          theme="light" // Use light theme for the top bar
          mode="horizontal"
          selectedKeys={getSelectedKeys()}
          style={{ flex: 1, minWidth: 0, borderBottom: 'none'}} // Remove default border
          items={[
            {
              key: 'home',
              label: <Link to="/">Home</Link>
            },
            {
              key: 'designer',
              label: <Link to="/designer">Designer</Link>
            },
            {
              key: 'builder',
              label: <Link to="/builder">Builder</Link>
            }
          ]}
        />
        {/* Placeholder for Search Bar if needed */}
        {/* <Input.Search placeholder="Search" style={{ width: 200, marginLeft: 'auto' }} /> */}
      </Header>
      <Content style={{ padding: '0', margin: 0, flex: 1, display: 'flex', flexDirection: 'column' }}> {/* Adjust Content style */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* Pass state and handlers to DesignerPage */}
          <Route 
            path="/designer" 
            element={( 
              <DesignerPage
                ref={designerPageRef} // Pass the ref if App needs to call methods on DesignerPage
                // onExportPatternSVG={handleExportPatternSVG} // Only pass if App still triggers export
                // Other props (panels, onPanelsChange, geometry, onModelLoad, filename, activeHighlightColor, setActiveHighlightColor)
                // are now managed within DesignerPage itself.
              />
            )} 
          />
          <Route path="/builder" element={<BuilderPage />} />
        </Routes>
      </Content>
    </Layout>
  );
};

export default App;