import React, { useRef } from 'react';
import { Layout } from 'antd';
import Splitter from 'antd/es/splitter';
import DesignerMenuBar from '../Components/DesignerMenuBar';
import ThreeDViewPanel from '../Components/ThreeDViewPanel';
import PatternPanel from '../Components/PatternPanel';

const { Header } = Layout;

const DesignerPage = () => {
  const threeDViewRef = useRef(null);

  const handleClothSelect = () => {
    if (threeDViewRef.current && threeDViewRef.current.triggerModelImport) {
      threeDViewRef.current.triggerModelImport();
    }
  };

  const handleImportModel = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Add model loading logic here
    }
  };
  return (
    <Layout style={{ height: 'calc(100vh - 64px)' }}>
      <DesignerMenuBar onClothSelect={handleClothSelect} />
      <Layout style={{ height: 'calc(100% - 48px)' }}>
        <Splitter style={{ height: '100%' }} direction="horizontal" min={200} max={800} defaultValue={300}>
          <Splitter.Panel defaultSize="40%" min="20%" max="70%" style={{background: '#fff' }}>
            <ThreeDViewPanel ref={threeDViewRef} />
          </Splitter.Panel>
          <Splitter.Panel style={{ height: '100%' }}>
            <PatternPanel />
          </Splitter.Panel>
        </Splitter>
      </Layout>
    </Layout>
  );
};

export default DesignerPage;