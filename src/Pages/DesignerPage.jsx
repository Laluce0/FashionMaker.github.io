import React, { useRef } from 'react';
import { Layout } from 'antd';
import Splitter from 'antd/es/splitter';
import DesignerMenuBar from '../Components/DesignerMenuBar';
import ThreeDViewPanel from '../Components/ThreeDViewPanel';
import PatternPanel from '../Components/PatternPanel';

const { Header } = Layout;

const DesignerPage = () => {
  const fileInputRef = useRef(null);

  const handleImportModel = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('Selected file:', file.name);
      // Add model loading logic here
    }
  };
  return (
    <Layout style={{ height: 'calc(100vh - 64px)' }}>
      <DesignerMenuBar onImportModel={handleImportModel} />
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept=".gltf,.glb,.obj"
      />
      <Layout style={{ height: 'calc(100% - 48px)' }}>
        <Splitter style={{ height: '100%' }} direction="horizontal" min={200} max={800} defaultValue={300}>
          <div style={{ height: '100%', background: '#fff' }}>
            <ThreeDViewPanel />
          </div>
          <div style={{ height: '100%' }}>
            <PatternPanel />
          </div>
        </Splitter>
      </Layout>
    </Layout>
  );
};

export default DesignerPage;