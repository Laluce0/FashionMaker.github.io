import React from 'react';
import { Button } from 'antd';
import LabelIcon from '../../assets/MenuIcons/07_label.svg'; // Adjust path as needed
import './MenuButtonStyles.css';

const LabelButton = () => {
  return (
    <Button 
      type="text" 
      icon={<img src={LabelIcon} alt="Label" />} 
      className="menu-button"
    />
  );
};

export default LabelButton;