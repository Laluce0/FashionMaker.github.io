import React from 'react';
import { Button } from 'antd';
import PenIcon from '../../assets/06_pen.svg'; // Adjust path as needed
import './MenuButtonStyles.css';

const PenButton = () => {
  return (
    <Button 
      type="text" 
      icon={<img src={PenIcon} alt="Pen" />} 
      className="menu-button"
    />
  );
};

export default PenButton;