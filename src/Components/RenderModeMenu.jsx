import React from 'react';
import { Tooltip } from 'antd'; // Removed unused Space
import WireframeButton from './RenderModeButtons/WireframeButton';
import WhiteModelButton from './RenderModeButtons/WhiteModelButton';
import VertexColorButton from './RenderModeButtons/VertexColorButton';

const RenderModeMenu = ({ currentMode, onModeChange, isVertexColorEnabled }) => {

  // Style for the container to make buttons appear connected
  const containerStyle = {
    display: 'flex', // Use flexbox to align items horizontally
    overflow: 'hidden', // Hide overflow for rounded corners
    borderRadius: '6px', // Apply overall rounding to the container
  };

  // Style for the wrapper div around each button to handle spacing/borders
  const buttonWrapperStyle = {
    // Remove default margins/paddings if any from Tooltip or Button
    margin: 0,
    padding: 0,
    lineHeight: 'normal', // Ensure buttons align vertically
    // Add a border between items, except for the last one
    borderRight: '0px solid rgba(255, 255, 255, 0)', // Adjust color as needed
  };

  const lastButtonWrapperStyle = {
    ...buttonWrapperStyle,
    borderRight: 'none', // No border for the last item
  };

  return (
    <div style={containerStyle}>
      <div style={buttonWrapperStyle}>
        <Tooltip title="线框模式" placement="bottom" mouseEnterDelay={0.5}>
          {/* Pass onClick directly */} 
          <WireframeButton 
            isActive={currentMode === 'wireframe'} 
            onClick={() => onModeChange('wireframe')} 
          />
        </Tooltip>
      </div>
      <div style={buttonWrapperStyle}>
        <Tooltip title="白模模式" placement="bottom" mouseEnterDelay={0.5}>
          <WhiteModelButton 
            isActive={currentMode === 'solid'} 
            onClick={() => onModeChange('solid')} 
          />
        </Tooltip>
      </div>
      <div style={lastButtonWrapperStyle}> {/* Apply style without right border */} 
        <Tooltip title="顶点色模式" placement="bottom" mouseEnterDelay={0.5}>
          <VertexColorButton 
            isActive={currentMode === 'vertexColor'} 
            disabled={!isVertexColorEnabled} 
            onClick={() => !isVertexColorEnabled ? null : onModeChange('vertexColor')} 
          />
        </Tooltip>
      </div>
    </div>
  );
};

export default RenderModeMenu;