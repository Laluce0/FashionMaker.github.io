import React from 'react';
import { Button } from 'antd';
import VertexColorIcon from '../../assets/VertexColorPreview.svg'; // Adjust path if needed

const VertexColorButton = ({ onClick, isActive, disabled }) => {
  return (
    <Button
      type="text"
      icon={<img src={VertexColorIcon} alt="Vertex Color Mode" />}
      className={`vertex-color-button ${isActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={onClick}
      disabled={disabled} // Pass the disabled prop
      title="Vertex Color Mode (Requires Divide)"
    />
  );
};

export default VertexColorButton;