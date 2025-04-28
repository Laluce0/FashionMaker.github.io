import React from 'react';
import { Button } from 'antd';
import WhiteModelIcon from '../../assets/Solid.svg'; // Adjust path if needed

const WhiteModelButton = ({ onClick, isActive }) => {
  return (
    <Button
      type="text"
      icon={<img src={WhiteModelIcon} alt="White Model Mode" />}
      className={`white-model-button ${isActive ? 'active' : ''}`}
      onClick={onClick}
      title="White Model Mode"
    />
  );
};

export default WhiteModelButton;