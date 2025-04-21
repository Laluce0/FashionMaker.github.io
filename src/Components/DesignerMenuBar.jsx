import React from 'react';
import { Layout, Button, Breadcrumb, Avatar, Space } from 'antd';
import { UserOutlined, SaveOutlined } from '@ant-design/icons';

// Import the new icon button components
import IconButtonGroup from './IconButtonGroup';

const { Header } = Layout;

const DesignerMenuBar = ({ onImportModel }) => {
  // Handler for the import button/menu item (if needed for FileSelectorButton)
  const handleImportClick = () => {
    if (onImportModel) {
      onImportModel();
    }
  };

  return (
    <Header style={{ display: 'flex', alignItems: 'center', padding: '0 10px', height: '48px', backgroundColor: '#303030', color: 'rgba(255, 255, 255, 0.65)' }}>
      {/* Left Section: Icon Buttons */}
      <IconButtonGroup />

      {/* Middle Section: Breadcrumb */}
      <div style={{ flex: 1, textAlign: 'center', color: '#fff' }}>
        <Breadcrumb style={{ color: '#fff !important' }}>
            {/* Add Breadcrumb.Item dynamically based on file path */}
            <Breadcrumb.Item style={{ color: '#fff' }}>Folder</Breadcrumb.Item>
            <Breadcrumb.Item style={{ color: '#fff' }}>Filename</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      {/* Right Section: User Info & Save */}
      <Space>
        {/* Render mode icons moved to ThreeDViewPanel */}
        <Avatar style={{ backgroundColor: '#87d068' }} icon={<UserOutlined />} />
        <span style={{ color: '#fff' }}>User</span>
        <Button type="primary" icon={<SaveOutlined />}>
          Save
        </Button>
      </Space>
    </Header>
  );
};

export default DesignerMenuBar;