import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import './App.css';
// Placeholder components for pages - will be created later or kept simple
import DesignerPage from './Pages/DesignerPage'; // Assuming DesignerPage will be in src/Pages/
import * as THREE from 'three'; // Import THREE
import { GLTFLoader } from 'three-stdlib'; // Import loaders
import { OBJLoader } from 'three-stdlib';
import { message } from 'antd'; // Import message for feedback

// Initial panel data structure helper
function createNewPanel(id) {
  // Default square
  return {
    id,
    vertices: [
      { x: 80, y: 80 },
      { x: 180, y: 80 },
      { x: 180, y: 180 },
      { x: 80, y: 180 }
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0]
    ]
  };
}

const { Header, Content } = Layout;

// Placeholder Pages
const HomePage = () => <div>Home Page Content</div>;
const BuilderPage = () => <div>Builder Page Content</div>;

const App = () => {
  const location = useLocation();
  const [panels, setPanels] = useState([createNewPanel(1)]); // Lifted state for panels
  const [geometry, setGeometry] = useState(null); // Lifted state for 3D model geometry
  const [panelIdCounter, setPanelIdCounter] = useState(2); // Counter for new panels

  // Handler to update panels state
  const handlePanelsChange = (newPanels) => {
    setPanels(newPanels);
  };

  // Handler to load and set geometry from file
  const handleModelLoad = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const filename = file.name.toLowerCase();
      if (filename.endsWith('.gltf') || filename.endsWith('.glb')) {
        const loader = new GLTFLoader();
        loader.parse(ev.target.result, '', (gltf) => {
          let mesh = null;
          gltf.scene.traverse((child) => {
            if (child.isMesh && !mesh) mesh = child;
          });
          if (mesh) {
            setGeometry(mesh.geometry);
            message.success('GLTF模型加载成功');
          } else {
            message.error('未找到可用Mesh');
          }
        }, (err) => {
          message.error('GLTF解析失败: ' + err.message);
        });
      } else if (filename.endsWith('.obj')) {
        const loader = new OBJLoader();
        const text = new TextDecoder().decode(ev.target.result);
        const obj = loader.parse(text);
        let mesh = null;
        obj.traverse((child) => {
          if (child.isMesh && !mesh) mesh = child;
        });
        if (mesh) {
          setGeometry(mesh.geometry);
          message.success('OBJ模型加载成功');
        } else {
          message.error('未找到可用Mesh');
        }
      } else {
        message.error('仅支持OBJ/GLTF/GLB格式');
      }
    };
    reader.readAsArrayBuffer(file);
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
                panels={panels} 
                onPanelsChange={handlePanelsChange} 
                geometry={geometry} 
                onModelLoad={handleModelLoad} 
                panelIdCounter={panelIdCounter}
                setPanelIdCounter={setPanelIdCounter}
                createNewPanel={createNewPanel} // Pass helper function if needed in PatternPanel
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