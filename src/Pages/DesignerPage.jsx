import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { Layout } from 'antd';
import Splitter from 'antd/es/splitter';
import DesignerMenuBar from '../Components/DesignerMenuBar';
import ThreeDViewPanel from '../Components/ThreeDViewPanel';
import PatternPanel from '../Components/PatternPanel';

const { Header } = Layout;

// Receive props from App.jsx
// Use forwardRef to receive ref from App.jsx
const DesignerPage = forwardRef(({ 
  filename,
  panels, 
  onPanelsChange, 
  geometry, 
  onModelLoad, 
  createNewPanel,
  onExportPatternSVG,
  // 新增：接收selectedPanelId和setSelectedPanelId
  selectedPanelId,
  setSelectedPanelId
}, ref) => {
  // Add ref for ThreeDViewPanel
  const threeDViewRef = useRef(null);
  const patternPanelRef = useRef(null); // Add ref for PatternPanel

  // Define handler to trigger upload in ThreeDViewPanel
  const handleClothSelect = () => {
    if (threeDViewRef.current && threeDViewRef.current.triggerUpload) {
      threeDViewRef.current.triggerUpload();
    }
  };

  // Expose method to App.jsx via ref
  useImperativeHandle(ref, () => ({
    triggerExportPatternSVG: () => {
      patternPanelRef.current?.exportSVG(); // Call exportSVG on PatternPanel
    }
  }));

  // Remove file input handling logic, now handled in App
  // const handleImportModel = () => {
  //   fileInputRef.current?.click();
  // };
  // const handleFileChange = (event) => {
  //   const file = event.target.files[0];
  //   if (file) {
  //     onModelLoad(file); // Call the handler passed from App
  //   }
  // };

  return (
    <Layout style={{ height: 'calc(100vh - 64px)' }}>
      {/* Pass handleClothSelect to DesignerMenuBar */}
      {/* Pass onExportPatternSVG down to DesignerMenuBar */}
      <DesignerMenuBar onClothSelect={handleClothSelect} onExportPatternSVG={onExportPatternSVG} />
      <Layout style={{ height: 'calc(100% - 48px)' }}>
        <Splitter style={{ height: '100%' }} direction="horizontal" min={200} max={800} defaultValue={300}>
          <Splitter.Panel defaultSize="60%" min="20%" max="70%" style={{background: '#fff' }}>
            {/* Pass geometry, onModelLoad, and ref to ThreeDViewPanel */}
            <ThreeDViewPanel ref={threeDViewRef} geometry={geometry} onModelLoad={onModelLoad} />
          </Splitter.Panel>
          <Splitter.Panel style={{ height: '100%' }}>
            {/* Pass panels state, handlers, and threeDViewRef to PatternPanel */}
            <PatternPanel 
              filename={filename}
              panels={panels} 
              onPanelsChange={onPanelsChange} 
              createNewPanel={createNewPanel}
              threeDViewRef={threeDViewRef} // Pass the ref here
              ref={patternPanelRef} // Pass ref to PatternPanel
              // 新增：传递selectedPanelId和setSelectedPanelId
              selectedPanelId={selectedPanelId}
              setSelectedPanelId={setSelectedPanelId}
            />
          </Splitter.Panel>
        </Splitter>
      </Layout>
    </Layout>
  );
});

export default DesignerPage;