import React from 'react';
import { Button } from 'antd';
import AvatarIcon from '../../assets/MenuIcons/03_avatar.svg'; // Adjust path as needed

const AvatarButton = () => {
  return (
    <Button 
      type="text" 
      icon={<img src={AvatarIcon} alt="Avatar" />} 
      className="menu-button"
    />

  );
};



export default AvatarButton;