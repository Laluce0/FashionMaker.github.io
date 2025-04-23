import React from 'react';
import { Button } from 'antd';
import ClothSelectorIcon from '../../assets/04_clothSelector.svg'; // Adjust path as needed
import './MenuButtonStyles.css';

const ClothSelectorButton = ({ onClick }) => {
  return (
    <Button 
      type="text" 
      icon={<img src={ClothSelectorIcon} alt="Cloth Selector" />} 
      className="menu-button"
      onClick={onClick}
    />
  );
};

export default ClothSelectorButton;