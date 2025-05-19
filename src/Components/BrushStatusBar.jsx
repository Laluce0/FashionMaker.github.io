import React, { useState } from 'react';
import { Space, InputNumber, Button, Tooltip } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import BrushThicknessIcon from '../assets/brushThickness.svg';
import ColorPickerIcon from '../assets/colorPicker.svg';

const BrushStatusBar = ({ 
  brushSize, 
  setBrushSize, 
  brushColor, 
  setBrushColor,
  onColorPickerClick,
  onAddNewColor,
  isVertexColorModeEnabled
}) => {
  // 处理笔刷大小变化
  const handleBrushSizeChange = (value) => {
    setBrushSize(value);
  };

  // 处理颜色选择器点击
  const handleColorPickerClick = () => {
    if (onColorPickerClick && isVertexColorModeEnabled) {
      onColorPickerClick();
    }
  };

  // 处理添加新颜色
  const handleAddNewColor = () => {
    if (onAddNewColor) {
      onAddNewColor();
    }
  };

  return (
    <Space size="small" style={{ height: 20 ,marginLeft: 80, marginRight: 16, backgroundColor: '#303030' }}>
      {/* 笔刷粗细图标 */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img src={BrushThicknessIcon} alt="Brush Thickness" style={{ width: 20, height: 20 }} />
      </div>
      
      {/* 笔刷大小输入框 */}
      <div style={{ display: 'flex', alignItems: 'center'}}>
        <InputNumber
          size="small"
          min={1}
          max={50}
          value={brushSize}
          onChange={handleBrushSizeChange}
          style={{ width: 60 }}
        />
      </div>
      
      {/* 颜色选择器 */}
      <div 
        onClick={handleColorPickerClick}
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          cursor: isVertexColorModeEnabled ? 'pointer' : 'not-allowed',
          position: 'relative',
          width: 26,   // 固定宽度以匹配内容大小
          height: 26,  // 固定高度以方便定位内部元素
          opacity: isVertexColorModeEnabled ? 1 : 0.5, // 未激活时降低透明度
        }}
      >
        <img 
          src={ColorPickerIcon} 
          alt="Color Picker" 
          style={{
            width: 14, 
            height: 14, 
            position: 'absolute',
            marginTop: 6,
            //alignItems: 'center', 
            zIndex: 2, // 确保图标在圆形之上
          }}
        />
        <div
          alt="Brush Color"
          style={{ 
            width: 26, 
            height: 26, 
            borderRadius: '50%', 
            backgroundColor: brushColor || '#000000',
            border: '1px solid #666',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1, // 圆形在图标之下
          }} 
        />
      </div>
      
      {/* 添加新颜色按钮 */}
      <Button 
        type="text" 
        icon={<PlusOutlined style={{ color: '#FFFFFF' }} />} 
        onClick={handleAddNewColor}
        style={{ color: '#FFFFFF' }}
      />
    </Space>
  );
};

export default BrushStatusBar;