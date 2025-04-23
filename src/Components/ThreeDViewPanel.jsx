import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Edges } from '@react-three/drei';
import { Space, Button, Upload, Slider, Popover, message } from 'antd';
import { GlobalOutlined, BgColorsOutlined, EyeOutlined, UploadOutlined } from '@ant-design/icons';
import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib';
import { OBJLoader } from 'three-stdlib';

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

const ThreeDViewPanel = forwardRef((props, ref) => {
  const [geometry, setGeometry] = useState(null);
  const [vertexColors, setVertexColors] = useState([]); // [[r,g,b], ...]
  const [colorGroups, setColorGroups] = useState([]); // [{color, indices:[]}, ...]
  const [highlightGroup, setHighlightGroup] = useState(null);
  const [highlightColor, setHighlightColor] = useState('#00ff00');
  const [brushColor, setBrushColor] = useState(defaultBrushColor);
  const [brushSize, setBrushSize] = useState(10);
  const fileInputRef = useRef();

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    triggerModelImport: () => {
      if (fileInputRef.current) fileInputRef.current.click();
    }
  }));

  // 处理模型文件上传
  const handleModelUpload = (e) => {
    let file;
    if (e.target && e.target.files) {
      file = e.target.files[0];
    } else if (e.file && e.file.originFileObj) {
      file = e.file.originFileObj;
    }
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const filename = file.name.toLowerCase();
      if (filename.endsWith('.gltf') || filename.endsWith('.glb')) {
        const loader = new GLTFLoader();
        loader.parse(ev.target.result, '', (gltf) => {
          let mesh = null;
          gltf.scene.traverse((child) => {
            if (child.isMesh && !mesh) mesh = child;
          });
          if (mesh) {
            setGeometry(mesh.geometry);
            message.success('GLTF模型加载成功');
          } else {
            message.error('未找到可用Mesh');
          }
        }, (err) => {
          message.error('GLTF解析失败: ' + err.message);
        });
      } else if (filename.endsWith('.obj')) {
        const loader = new OBJLoader();
        const text = new TextDecoder().decode(ev.target.result);
        const obj = loader.parse(text);
        let mesh = null;
        obj.traverse((child) => {
          if (child.isMesh && !mesh) mesh = child;
        });
        if (mesh) {
          setGeometry(mesh.geometry);
          message.success('OBJ模型加载成功');
        } else {
          message.error('未找到可用Mesh');
        }
      } else {
        message.error('仅支持OBJ/GLTF/GLB格式');
      }
    };
    reader.readAsArrayBuffer(file);
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
      <Upload accept=".obj,.gltf,.glb" showUploadList={false} beforeUpload={() => false} onChange={handleModelUpload}>
        <Button icon={<UploadOutlined />}>上传3D模型</Button>
      </Upload>
      <input ref={fileInputRef} type="file" accept=".obj,.gltf,.glb" style={{ display: 'none' }} onChange={handleModelUpload} />
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