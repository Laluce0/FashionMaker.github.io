import React from 'react';
import { Button } from 'antd';
import WireframeIcon from '../../assets/RenderModeIcons/Wireframe.svg'; // Adjust path if needed

const WireframeButton = ({ onClick, isActive }) => {
  return (
    <Button
      type="text"
      icon={<img src={WireframeIcon} alt="Wireframe Mode" />}
      className={`wireframe-button ${isActive ? 'active' : ''}`}
      onClick={onClick}
      title="Wireframe Mode"
    />
  );
};

export default WireframeButton;