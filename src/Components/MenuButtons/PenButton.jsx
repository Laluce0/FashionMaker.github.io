import React from 'react';
import { Button, Dropdown, Space } from 'antd';
import {IconPen, IconDown} from '@arco-design/web-react/icon';
import PenIcon from '../../assets/06_pen.svg'; // Adjust path as needed
import './MenuButtonStyles.css';

const items = [
  {
    key: 'Vector_Tool',
    label: 'Vector Tools',
    type: 'group',
    children: [
      { key: 'Bezel_Pen', label: 'Bezel Pen' },
      { key: 'Pencil', label: 'Pencil' },
    ],
  },
  { type: 'divider' }, // Divider
  {
    key: 'Brush_Tool',
    label: 'Brush Tools',
    type: 'group',
    children: [
      { key: 'Region_Brush', label: 'Region Brush'},
      { key: 'Region_Eraser', label: 'Region Eraser'}
    ]
  }
];

const PenButton = () => {
  return (
    <Dropdown menu={{ items, selectable: true, }} placement='bottomLeft' arrow trigger={['click']}>
      <Button 
        type="text" 
        icon={<img src={PenIcon} alt="Pen" />} 
        className="menu-button"
      />
    </Dropdown>
  );
};

export default PenButton;