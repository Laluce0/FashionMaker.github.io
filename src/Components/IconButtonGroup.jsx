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

const IconButtonGroup = ({ onClothSelect, onExportPatternSVG, onToolSelect }) => {
  return (
    <Space size="middle">
      <DragDotButton />
      <FileSelectorButton />
      <AvatarButton />
      <ClothSelectorButton onClick={onClothSelect} onExportPatternSVG={onExportPatternSVG} />
      <TextureButton />
      <PenButton onToolSelect={onToolSelect} />
      <LabelButton />
      <CommentButton />
    </Space>
  );
};

export default IconButtonGroup;