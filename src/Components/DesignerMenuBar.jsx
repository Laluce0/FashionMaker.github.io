import React from 'react';
import { Layout, Button, Breadcrumb, Avatar, Space, ConfigProvider } from 'antd';
import { UserOutlined, SaveOutlined } from '@ant-design/icons';

// Import the new icon button components
import IconButtonGroup from './IconButtonGroup';
import BrushStatusBar from './BrushStatusBar';

const { Header } = Layout;

const DesignerMenuBar = ({ 
  onImportModel, 
  onClothSelect, 
  onExportPatternSVG,
  brushSize,
  setBrushSize,
  brushColor,
  setBrushColor,
  onColorPickerClick,
  onAddNewColor,
  onToolSelect,
  isVertexColorModeEnabled
 }) => {
  // Handler for the import button/menu item (if needed for FileSelectorButton)
  const handleImportClick = () => {
    if (onImportModel) {
      onImportModel();
    }
  };

  return (
    <Header style={{ display: 'flex', alignItems: 'center', padding: '0 10px', height: '48px', backgroundColor: '#303030'}}>
      {/* Left Section: Icon Buttons */}
      <IconButtonGroup onClothSelect={onClothSelect} onExportPatternSVG={onExportPatternSVG} onToolSelect={onToolSelect} />

      {/* 笔刷状态栏 */}
      <BrushStatusBar 
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        brushColor={brushColor}
        setBrushColor={setBrushColor}
        onColorPickerClick={onColorPickerClick}
        onAddNewColor={onAddNewColor}
        isVertexColorModeEnabled={isVertexColorModeEnabled}
      />

      {/* Middle Section: Breadcrumb */}
      <ConfigProvider
        theme={{
          components: {
            Breadcrumb: {
              separatorColor: 'rgba(191, 191, 191, 0.50)',
              itemColor: 'rgba(191, 191, 191, 0.50)',
            },
          },
        }}
      >
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center'}}>
          <Breadcrumb items={[
            {
              title: 'Folder',
            },
            {
              title: <a href="">Filename</a>,
            }
          ]}/>
        </div>
      </ConfigProvider>

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