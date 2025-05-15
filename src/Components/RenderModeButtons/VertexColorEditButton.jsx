import React from 'react';
import { Button } from 'antd';
import VertexColorEditIcon from '../../assets/VertexColorEdit.svg'; // Adjust path if needed

const VertexColorEditButton = ({ onClick, isActive, disabled }) => {
  return (
    <Button
      type="text"
      icon={<img src={VertexColorEditIcon} alt="VertexColorEdit" />}
      className={`vertex-color-edit-button ${isActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={onClick}
      disabled={disabled} // Pass the disabled prop
      title="VertexColorEditButton"
    />
  );
};

export default VertexColorEditButton;