import React from 'react';
import { Button, Dropdown } from 'antd';
import ClothSelectorIcon from '../../assets/04_clothSelector.svg'; // Adjust path as needed
import './MenuButtonStyles.css';

const ClothSelectorButton = ({ onClick }) => {
  // Note: The original onClick prop might need adjustment depending on how menu item clicks are handled.
  // For now, the Dropdown trigger button itself won't trigger the original onClick.
  // Menu item clicks can be handled via the Menu's onClick prop if needed.
  const handleMenuClick = ({ key }) => {
    if (key === 'import-clo3d' && onClick) {
      onClick(); // Call the passed onClick handler for the specific item
    }
    // Handle other menu item clicks if needed
    console.log(`Clicked on item with key: ${key}`);
  };

  const items = [
    {
      key: 'import-group',
      label: 'import',
      type: 'group',
      children: [
        { key: 'import-2d', label: '2D Pattern' },
        { key: 'import-clo3d', label: '3D Cloth' },
      ],
    },
    { type: 'divider' }, // Divider
    {
      key: 'construction-group',
      label: 'construction',
      type: 'group',
      children: [
        { key: 'construction-mesh', label: 'Mesh' },
        { key: 'construction-pointcloud', label: 'Point Cloud' },
        { key: 'construction-images', label: 'Images' },
      ],
    },
    { type: 'divider' }, // Divider
    {
      key: 'export-group',
      label: 'export',
      type: 'group',
      children: [
        { key: 'export-2d', label: '2D Pattern' },
        { key: 'export-clo3d', label: 'CLO 3D Cloth' },
        { key: 'export-mesh', label: 'Mesh' },
      ],
    },
  ];

  return (
    <Dropdown menu={{ items, onClick: handleMenuClick }} trigger={['click']}>
      <Button 
        type="text" 
        icon={<img src={ClothSelectorIcon} alt="Cloth Selector" />} 
        className="menu-button"
        // onClick={onClick} // Removed original onClick from Button, handled by Dropdown trigger
      />
    </Dropdown>
  );
};

export default ClothSelectorButton;