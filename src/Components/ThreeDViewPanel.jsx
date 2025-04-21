import React from 'react';
import { Space } from 'antd';
import { GlobalOutlined, BgColorsOutlined, EyeOutlined } from '@ant-design/icons';

const ThreeDViewPanel = () => {
  return (
    <div style={{ flex: 3, backgroundColor: '#e0e0e0', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', height: '100%', width: '100%' }}>
      <span>3D View Panel Placeholder</span>
      {/* Placeholder for render mode icons - moved from DesignerMenuBar */}
      <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(0,0,0,0.5)', padding: '5px 8px', borderRadius: '4px' }}>
        <Space size="middle">
          <GlobalOutlined style={{ color: 'white', fontSize: '16px', cursor: 'pointer' }} />
          <BgColorsOutlined style={{ color: 'white', fontSize: '16px', cursor: 'pointer' }} />
          <EyeOutlined style={{ color: 'white', fontSize: '16px', cursor: 'pointer' }} />
        </Space>
      </div>
    </div>
  );
};

export default ThreeDViewPanel;