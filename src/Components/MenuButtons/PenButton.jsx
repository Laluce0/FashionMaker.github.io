import React, { useState } from 'react';
import { Button, Dropdown, Space } from 'antd';
import PenIcon from '../../assets/06_pen.svg'; // Adjust path as needed
import './MenuButtonStyles.css';

const items = [
  {
    key: 'View_Tool',
    label: 'View Tools',
    type: 'group',
    children: [
      {key: 'Move', label: 'Move'},
    ]
  },
  {type: 'divider'},
  {
    key: 'Vector_Tool',
    label: 'Vector Tools',
    type: 'group',
    children: [
      { key: 'Bezel_Pen', label: 'Bezel Pen', disabled: 'true'},
      { key: 'Pencil', label: 'Pencil' , disabled: 'true'},
    ],
  },
  { type: 'divider' }, // Divider
  {
    key: 'Brush_Tool',
    label: 'Brush Tools',
    type: 'group',
    children: [
      { key: 'Region_Brush', label: 'Region Brush'},
      { key: 'Region_Eraser', label: 'Region Eraser'},
    ]
  }
];

const PenButton = ({ onToolSelect }) => {
  const [currentTool, setCurrentTool] = useState('Move');
  // 处理工具选择
  const handleMenuClick = ({ key }) => {
    setCurrentTool(key);
    
    // 调用父组件传递的回调函数
    if (onToolSelect) {
      onToolSelect(key);
    }
  };

  return (
    <Dropdown 
      menu={{ 
        items, 
        selectable: true, 
        defaultSelectedKeys: ['Move'],
        onClick: handleMenuClick
      }} 
      placement='bottomLeft' 
      arrow 
      trigger={['click']}
    >
      <Button 
        type="text" 
        icon={<img src={PenIcon} alt="Pen" />} 
        className="menu-button"
      />
    </Dropdown>
  );
};

export default PenButton;