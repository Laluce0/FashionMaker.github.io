import React from 'react';
import { Button } from 'antd';
import VertexColorEditIcon from '../../assets/RenderModeIcons/VertexColorEdit.svg'; // Adjust path if needed

const VertexColorEditButton = ({ onClick, isActive, disabled }) => {
  return (
    <Button
      type="text"
      icon={<img src={VertexColorEditIcon} alt="VertexColorEdit" />}
      className={`vertex-color-edit-button ${isActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={onClick}
      disabled={disabled} // Pass the disabled prop
      title="Vertex Color Edit Mode"
    />
  );
};

export default VertexColorEditButton;