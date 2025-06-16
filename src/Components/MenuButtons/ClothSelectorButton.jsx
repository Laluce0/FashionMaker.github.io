import React from 'react';
import { Button, Dropdown } from 'antd';
import ClothSelectorIcon from '../../assets/MenuIcons/04_clothSelector.svg'; // Adjust path as needed
import './MenuButtonStyles.css';

const ClothSelectorButton = ({ onClick, onExportPatternSVG, onLoadDemo }) => {
  // Note: The original onClick prop might need adjustment depending on how menu item clicks are handled.
  // For now, the Dropdown trigger button itself won't trigger the original onClick.
  // Menu item clicks can be handled via the Menu's onClick prop if needed.
  const handleMenuClick = ({ key }) => {
    if (key === 'import-clo3d' && onClick) {
      onClick(); // Call the passed onClick handler for the specific item
    }
    if (key === 'export-2d' && onExportPatternSVG) {
      onExportPatternSVG(); // Call the passed export handler for the specific item
    }
    if (key === 'demo' && onLoadDemo) {
      onLoadDemo(); // Call the passed onLoadDemo handler for the demo item
    }
  };

  const items = [
    {
      key: 'import-group',
      label: 'Import',
      type: 'group',
      children: [
        { key: 'import-2d', label: '2D Pattern', disabled: true },
        { key: 'import-clo3d', label: '3D Cloth' },
        { key: 'demo', label: 'Demo' },
      ],
    },
    { type: 'divider' }, // Divider
    {
      key: 'construction-group',
      label: 'Construction',
      type: 'group',
      children: [
        { key: 'construction-mesh', label: 'Mesh', disabled: true },
        { key: 'construction-pointcloud', label: 'Point Cloud', disabled: true },
        { key: 'construction-images', label: 'Images', disabled: true },
      ],
    },
    { type: 'divider' }, // Divider
    {
      key: 'export-group',
      label: 'Export',
      type: 'group',
      children: [
        { key: 'export-2d', label: '2D Pattern' },
        { key: 'export-clo3d', label: 'CLO 3D Cloth' , disabled: true },
        { key: 'export-mesh', label: 'Mesh' , disabled: true },
      ],
    },
  ];

  return (
    <Dropdown menu={{ items, onClick: handleMenuClick }} trigger={['click']} placement='bottomLeft' arrow>
      <a onClick={e => e.preventDefault()}>
        <Button 
          type="text" 
          icon={<img src={ClothSelectorIcon} alt="Cloth Selector" />} 
          className="menu-button"
        />
      </a>
    </Dropdown>
  );
};

export default ClothSelectorButton;