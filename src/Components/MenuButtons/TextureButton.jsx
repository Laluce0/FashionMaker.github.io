import React from 'react';
import { Button } from 'antd';
import TextureIcon from '../../assets/MenuIcons/05_texture.svg'; // Adjust path as needed
import './MenuButtonStyles.css';

const TextureButton = () => {
  return (
    <Button 
      type="text" 
      icon={<img src={TextureIcon} alt="Texture" />}
      className="menu-button"
    />
  );
};

export default TextureButton;