import React from 'react';
import { Button } from 'antd';
import FileSelectorIcon from '../../assets/02_fileSelector.svg'; // Adjust path as needed
import './MenuButtonStyles.css';

const FileSelectorButton = () => {
  return (
    <Button 
      type="text" 
      icon={<img src={FileSelectorIcon} alt="File Selector" />} 
      className="menu-button"
    />
  );
};

export default FileSelectorButton;