import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Edges } from '@react-three/drei';
import { Space, Button, Slider, Popover, message } from 'antd'; // Removed Upload and UploadOutlined
import { GlobalOutlined, BgColorsOutlined, EyeOutlined } from '@ant-design/icons'; // Removed UploadOutlined
import * as THREE from 'three';
// Remove unused loaders, handled in App.jsx
// import { GLTFLoader } from 'three-stdlib';
// import { OBJLoader } from 'three-stdlib';

// 顶点色分组高亮辅助组件
function HighlightEdges({ geometry, color, visible }) {
  if (!geometry || !visible) return null;
  return <Edges geometry={geometry} scale={1.01} color={color} />;
}

// 3D模型渲染组件
function Model({ geometry, vertexColors, highlightGroup, highlightColor }) {
  const meshRef = useRef();
  // 生成材质，支持顶点色
  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.5,
    metalness: 0.1,
  });
  // 顶点色分组高亮
  return (
    <mesh ref={meshRef} geometry={geometry} material={material}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 5, 5]} intensity={0.7} />
      {highlightGroup && (
        <HighlightEdges geometry={geometry} color={highlightColor} visible={!!highlightGroup} />
      )}
    </mesh>
  );
}

const defaultBrushColor = '#ff0000';

// Receive props from DesignerPage
const ThreeDViewPanel = forwardRef(({ geometry, onModelLoad }, ref) => {
  // Remove local geometry state, use props instead
  // const [geometry, setGeometry] = useState(null);
  const [vertexColors, setVertexColors] = useState([]); // Keep local UI state
  const [colorGroups, setColorGroups] = useState([]); // Keep local UI state
  const [highlightGroup, setHighlightGroup] = useState(null); // Keep local UI state
  const [highlightColor, setHighlightColor] = useState('#00ff00'); // Keep local UI state
  const [brushColor, setBrushColor] = useState(defaultBrushColor); // Keep local UI state
  const [brushSize, setBrushSize] = useState(10); // Keep local UI state
  const fileInputRef = useRef(null); // Ref for the hidden file input

  // Expose a function to trigger the hidden file input click
  useImperativeHandle(ref, () => ({
    triggerUpload: () => {
      fileInputRef.current?.click();
    }
  }));

  // Handler for the hidden file input's change event
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onModelLoad(file); // Call the handler passed from App/DesignerPage
    }
    // Reset the input value to allow uploading the same file again
    if (event.target) {
      event.target.value = null;
    }
  };

  // 顶点色分组与高亮逻辑（示例，需结合实际模型数据）
  const handleGroupSelect = (groupIdx) => {
    setHighlightGroup(groupIdx);
    setHighlightColor(colorGroups[groupIdx]?.color || '#00ff00');
  };

  // 笔刷颜色选择
  const handleBrushColorChange = (e) => {
    setBrushColor(e.target.value);
  };

  // 笔刷大小调整
  const handleBrushSizeChange = (value) => {
    setBrushSize(value);
  };

  // 顶点色编辑（点击/拖拽修改，需结合实际模型数据实现）
  const handleVertexPaint = (e) => {
    // TODO: 结合raycaster和brushSize修改vertexColors
    message.info('顶点色编辑功能待实现');
  };

  // 侧边交互面板
  const renderControlPanel = () => (
    <div style={{ position: 'absolute', left: 10, top: 10, background: 'rgba(255,255,255,0.9)', padding: 12, borderRadius: 8, zIndex: 2 }}>
      {/* Hidden file input for model upload */}
      <input 
        ref={fileInputRef} 
        type="file" 
        accept=".obj,.gltf,.glb" 
        style={{ display: 'none' }} 
        onChange={handleFileChange} 
      />
      {/* Button to trigger the hidden input (optional, as triggering is done via ref) */}
      {/* <Button onClick={() => fileInputRef.current?.click()}>上传3D模型</Button> */}
      
      <div style={{ marginTop: 16 }}>
        <span>笔刷颜色：</span>
        <input type="color" value={brushColor} onChange={handleBrushColorChange} style={{ width: 32, height: 32, border: 'none', background: 'none' }} />
      </div>
      <div style={{ marginTop: 12 }}>
        <span>笔刷大小：</span>
        <Slider min={1} max={50} value={brushSize} onChange={handleBrushSizeChange} style={{ width: 120 }} />
      </div>
      <div style={{ marginTop: 12 }}>
        <span>顶点色分组：</span>
        <Space direction="vertical">
          {colorGroups.map((group, idx) => (
            <Button key={idx} style={{ background: group.color, color: '#fff', border: highlightGroup === idx ? '2px solid #333' : 'none' }} onClick={() => handleGroupSelect(idx)}>
              分组{idx+1}
            </Button>
          ))}
        </Space>
      </div>
    </div>
  );

  return (
    <div style={{ flex: 3, backgroundColor: '#e0e0e0', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', height: '100%', width: '100%' }}>
      {renderControlPanel()}
      <div style={{ width: '100%', height: '100%' }} onClick={handleVertexPaint}>
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }} style={{ width: '100%', height: '100%' }}>
          <axesHelper args={[1]} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 5, 5]} intensity={0.7} />
          {geometry && (
            <Model geometry={geometry} vertexColors={vertexColors} highlightGroup={highlightGroup} highlightColor={highlightColor} />
          )}
          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} panSpeed={1.2} rotateSpeed={1.1} zoomSpeed={1.1} />
        </Canvas>
      </div>
      {/* 右上角渲染模式图标 */}
      <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: 'rgba(0,0,0,0.5)', padding: '5px 8px', borderRadius: '4px' }}>
        <Space size="middle">
          <GlobalOutlined style={{ color: 'white', fontSize: '16px', cursor: 'pointer' }} />
          <BgColorsOutlined style={{ color: 'white', fontSize: '16px', cursor: 'pointer' }} />
          <EyeOutlined style={{ color: 'white', fontSize: '16px', cursor: 'pointer' }} />
        </Space>
      </div>
    </div>
  );
});

export default ThreeDViewPanel;