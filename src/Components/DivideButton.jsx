import React from 'react';
import { Button, Spin } from 'antd';

const DivideButton = ({ isDividing, percentDivide, onClick, disabled }) => (
  <Button
    type="primary"
    onClick={onClick}
    disabled={disabled || isDividing}
    style={{ marginRight: 16 }}
  >
    {isDividing ? (
      <span>
        <Spin size="small" />
        <span style={{ marginLeft: 8 }}>分割中... {percentDivide}%</span>
      </span>
    ) : (
      'Divide'
    )}
  </Button>
);

export default DivideButton;