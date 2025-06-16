import React from 'react';
import { Space } from 'antd';
import DragDotButton from './MenuButtons/DragDotButton';
import FileSelectorButton from './MenuButtons/FileSelectorButton';
import AvatarButton from './MenuButtons/AvatarButton';
import ClothSelectorButton from './MenuButtons/ClothSelectorButton';
import TextureButton from './MenuButtons/TextureButton';
import PenButton from './MenuButtons/PenButton';
import LabelButton from './MenuButtons/LabelButton';
import CommentButton from './MenuButtons/CommentButton';

const IconButtonGroup = ({ onClothSelect, onExportPatternSVG, onLoadDemo, onToolSelect }) => {
  return (
    <Space size="middle">
      <DragDotButton />
      <FileSelectorButton />
      <AvatarButton />
      <ClothSelectorButton 
        onClick={onClothSelect} 
        onExportPatternSVG={onExportPatternSVG} 
        onLoadDemo={onLoadDemo} // Pass onLoadDemo to ClothSelectorButton
      />
      <TextureButton />
      <PenButton onToolSelect={onToolSelect} />
      <LabelButton />
      <CommentButton />
    </Space>
  );
};

export default IconButtonGroup;