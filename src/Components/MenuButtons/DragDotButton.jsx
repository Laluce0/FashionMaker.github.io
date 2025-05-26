import React from 'react';
import { Button } from 'antd';
import DragDotIcon from '../../assets/MenuIcons/01_dragDot.svg'; // Adjust path as needed
import './MenuButtonStyles.css';

const DragDotButton = () => {
  return (
    <Button 
      type="text" 
      icon={<img src={DragDotIcon} alt="Drag Dot" />} 
      className="menu-button"
    />
  );
};

export default DragDotButton;