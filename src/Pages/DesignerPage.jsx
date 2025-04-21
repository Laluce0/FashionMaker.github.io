import React, { useRef } from 'react'; // Import useRef
import { Layout } from 'antd'; // Removed Upload as it's handled differently now
import DesignerMenuBar from '../Components/DesignerMenuBar'; // Import the menu bar
import ThreeDViewPanel from '../Components/ThreeDViewPanel'; // Import the 3D view panel
import PatternPanel from '../Components/PatternPanel'; // Import the pattern panel

const { Header, Content, Sider } = Layout;

const DesignerPage = () => {
  const fileInputRef = useRef(null); // Create a ref for the file input

  // Function to trigger the file input click
  const handleImportModel = () => {
    fileInputRef.current?.click(); // Programmatically click the hidden input
  };

  // Handler for file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('Selected file:', file.name);
      // Add model loading logic here
    }
  };
  return (
    <Layout style={{ height: 'calc(100vh - 64px)' }}> {/* Adjust height considering the main header */}
      {/* Pass the import handler to the menu bar */}
      <DesignerMenuBar onImportModel={handleImportModel} />
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept=".gltf,.glb,.obj" // Example: Accept common 3D model formats
      />
      <Layout style={{ height: 'calc(100% - 48px)' }}> {/* Ensure inner layout fills remaining space */}
        <Content style={{ padding: '0', margin: 0, display: 'flex', flexDirection: 'row', height: '100%' }}>
          {/* Left Panel: 3D View */}
          <ThreeDViewPanel />
          {/* Right Panel: Pattern Info */}
          <PatternPanel />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DesignerPage;