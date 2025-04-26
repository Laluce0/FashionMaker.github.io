import React from 'react';
import { Button, Dropdown, Menu } from 'antd';
import ClothSelectorIcon from '../../assets/04_clothSelector.svg'; // Adjust path as needed
import './MenuButtonStyles.css';

const ClothSelectorButton = ({ onClick }) => {
  // Note: The original onClick prop might need adjustment depending on how menu item clicks are handled.
  // For now, the Dropdown trigger button itself won't trigger the original onClick.
  // Menu item clicks can be handled via the Menu's onClick prop if needed.
  const handleMenuClick = ({ key }) => {
    if (key === "import-clo3d" && onClick) {
      onClick();
    }
  };
  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.ItemGroup title="import">
        <Menu.Item key="import-2d">2D Pattern</Menu.Item>
        <Menu.Item key="import-clo3d">3D Cloth</Menu.Item>
      </Menu.ItemGroup>
      <Menu.Divider />
      <Menu.ItemGroup title="construction">
        <Menu.Item key="construction-mesh">Mesh</Menu.Item>
        <Menu.Item key="construction-pointcloud">Point Cloud</Menu.Item>
        <Menu.Item key="construction-images">Images</Menu.Item>
      </Menu.ItemGroup>
      <Menu.Divider />
      <Menu.ItemGroup title="export">
        <Menu.Item key="export-2d">2D Pattern</Menu.Item>
        <Menu.Item key="export-clo3d">CLO 3D Cloth</Menu.Item>
        <Menu.Item key="export-mesh">Mesh</Menu.Item>
      </Menu.ItemGroup>
    </Menu>
  );
  return (
    <Dropdown menu={menu} trigger={['click']}>
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