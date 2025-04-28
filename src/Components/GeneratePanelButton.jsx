import React from 'react';
import { Button, Spin } from 'antd';

const GeneratePanelButton = ({ spinningGenerate, percentGenerate, onClick, disabled }) => (
  <Button
    type="primary"
    onClick={onClick}
    disabled={disabled || spinningGenerate}
    style={{ marginLeft: 8 }}
  >
    {spinningGenerate ? (
      <span>
        <Spin size="small" />
        <span style={{ marginLeft: 8 }}>生成中... {percentGenerate}%</span>
      </span>
    ) : (
      'Generate Panel'
    )}
  </Button>
);

export default GeneratePanelButton;