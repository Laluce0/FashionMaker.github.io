
import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Edges, Wireframe } from '@react-three/drei'; // Import Wireframe
import { Space, Button, Slider, Popover, message } from 'antd'; // Removed Upload, UploadOutlined, and Tooltip
import { GlobalOutlined, BgColorsOutlined, EyeOutlined } from '@ant-design/icons'; // Keep if used elsewhere, remove if only for old buttons
// Import the new menu component
import RenderModeMenu from './RenderModeMenu';
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
function Model({ geometry, renderMode, vertexColors, highlightGroup, highlightColor, colorGroups, onGroupSelect }) {
  const meshRef = useRef();
  let raycaster, camera, scene;
  try {
    ({ raycaster, camera, scene } = useThree());
  } catch (err) {
    console.error('useThree hook error:', err);
    return null;
  }
  const [hovered, setHovered] = useState(false);

  // 设置顶点色
  React.useEffect(() => {
    if (geometry && vertexColors && vertexColors.length > 0) {
      const colors = new Float32Array(vertexColors);
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }
  }, [geometry, vertexColors]);

  // 自定义shader材质（仅vertexColor模式下）
  const vertexGroupShader = React.useMemo(() => {
    return {
      uniforms: {
        highlightGroup: { value: highlightGroup !== null ? highlightGroup : -1 },
        highlightColor: { value: new THREE.Color(highlightColor) },
        groupCount: { value: colorGroups ? colorGroups.length : 0 },
      },
      vertexShader: `
        varying vec4 vColor;
        void main() {
          vColor = color;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform int highlightGroup;
        uniform vec3 highlightColor;
        uniform int groupCount;
        varying vec4 vColor;
        void main() {
          int groupId = int(vColor.r * 255.0 + 0.5);
          vec3 baseColor = vColor.rgb;
          if (highlightGroup >= 0 && groupId == highlightGroup) {
            // 高亮组
            gl_FragColor = vec4(mix(baseColor, highlightColor, 0.7), 1.0);
          } else {
            gl_FragColor = vec4(baseColor, 1.0);
          }
        }
      `,
      vertexColors: true
    };
  }, [highlightGroup, highlightColor, colorGroups]);

  // 根据渲染模式选择材质
  const material = React.useMemo(() => {
    switch (renderMode) {
      case 'wireframe':
        return new THREE.MeshBasicMaterial({ wireframe: true, color: 'black' });
      case 'vertexColor':
        return new THREE.ShaderMaterial(vertexGroupShader);
      case 'solid':
      default:
        return new THREE.MeshStandardMaterial({
          color: 'white',
          roughness: 0.5,
          metalness: 0.1,
        });
    }
  }, [renderMode, vertexGroupShader]);

  // 处理点击事件
  const handleClick = (e) => {
    if (renderMode !== 'vertexColor') return;
    e.stopPropagation();
    let mouse = e.mouse;
    if (!mouse) {
      // 手动计算归一化设备坐标
      const canvas = e.target instanceof HTMLCanvasElement ? e.target : (e.target && e.target.ownerDocument && e.target.ownerDocument.querySelector('canvas'));
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        mouse = {
          x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
          y: -((e.clientY - rect.top) / rect.height) * 2 + 1
        };
      } else {
        // fallback，防止报错
        mouse = { x: 0, y: 0 };
      }
    }
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(meshRef.current);
    if (intersects.length > 0) {
      const intersect = intersects[0];
      const { face } = intersect;
      if (face) {
        const colorAttr = meshRef.current.geometry.attributes.color;
        const colors = [
          colorAttr.getX(face.a),
          colorAttr.getY(face.a),
          colorAttr.getZ(face.a),
        ];
        const groupId = Math.round(colors[0] * 255);
        if (groupId >= 0 && groupId < colorGroups.length) {
          setHovered(true);
          if (onGroupSelect) onGroupSelect(groupId);
        }
      }
    }
  };

  try {
    return (
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={0.7} />
        {renderMode !== 'wireframe' && highlightGroup !== null && (
          <HighlightEdges geometry={geometry} color={highlightColor} visible={true} />
        )}
      </mesh>
    );
  } catch (err) {
    console.error('Model render error:', err);
    return null;
  }
}

const defaultBrushColor = '#ff0000';

// Receive props from DesignerPage
const ThreeDViewPanel = forwardRef(({ geometry, onModelLoad }, ref) => {
  const [renderMode, setRenderMode] = useState('solid'); // 'wireframe', 'solid', 'vertexColor'
  const [isVertexColorEnabled, setIsVertexColorEnabled] = useState(false); // Controls if vertex color mode can be selected
  const [vertexColors, setVertexColors] = useState([]); // Keep local UI state
  const [colorGroups, setColorGroups] = useState([]); // Keep local UI state
  const [highlightGroup, setHighlightGroup] = useState(null); // Keep local UI state
  const [highlightColor, setHighlightColor] = useState('#00ff00'); // Keep local UI state
  const [brushColor, setBrushColor] = useState(defaultBrushColor); // Keep local UI state
  const [brushSize, setBrushSize] = useState(10); // Keep local UI state
  const fileInputRef = useRef(null); // Ref for the hidden file input

  // Expose functions via ref
  useImperativeHandle(ref, () => ({
    triggerUpload: () => {
      fileInputRef.current?.click();
    },
    // Function to enable vertex color mode and switch to it
    enableVertexColorMode: () => {
      setIsVertexColorEnabled(true);
      setRenderMode('vertexColor');
      message.info('顶点色模式已启用');
    }
  }));

  // Handler for the hidden file input's change event
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onModelLoad(file); // Call the handler passed from App/DesignerPage
      // Reset states on new model load
      setRenderMode('solid');
      setIsVertexColorEnabled(false);
      setVertexColors([]);
      setColorGroups([]);
      setHighlightGroup(null);
    }
    // Reset the input value to allow uploading the same file again
    if (event.target) {
      event.target.value = null;
    }
  };

  // 顶点色分组与高亮逻辑（示例，需结合实际模型数据）
  // 1. 为每个顶点组分配唯一编号，并在colorGroups数组中保存编号和颜色的对应关系
  // 2. 点击模型表面时，通过raycaster获取点击面片的顶点色分组编号，并将该编号设置为高亮组
  // 3. 在Model组件中，HighlightEdges组件应根据高亮组编号，仅渲染该组的轮廓
  // 4. 在3D视图中为每个分组显示编号标签
  
  // colorGroups结构示例：[{ id: 0, color: '#ff0000' }, { id: 1, color: '#00ff00' }, ...]
  // 假设vertexColors编码为 [groupId/255, g, b, ...]，groupId为编号
  
  // 新增：渲染分组编号标签（简单实现，实际可用Sprite/Html等方式美化）
  function GroupLabels({ geometry, colorGroups }) {
    if (!geometry || !colorGroups || colorGroups.length === 0) return null;
    // 计算每组的中心点
    const positions = geometry.attributes.position.array;
    const colors = geometry.attributes.color ? geometry.attributes.color.array : null;
    if (!colors) return null;
    const groupCenters = {};
    for (let i = 0; i < positions.length; i += 3) {
      const groupId = Math.round(colors[i] * 255);
      if (!groupCenters[groupId]) {
        groupCenters[groupId] = { x: 0, y: 0, z: 0, count: 0 };
      }
      groupCenters[groupId].x += positions[i];
      groupCenters[groupId].y += positions[i + 1];
      groupCenters[groupId].z += positions[i + 2];
      groupCenters[groupId].count += 1;
    }
    // 生成标签
    return Object.entries(groupCenters).map(([groupId, center]) => {
      const { x, y, z, count } = center;
      if (count === 0) return null;
      return (
        <group key={groupId} position={[x / count, y / count, z / count]}>
          <mesh>
            <sphereGeometry args={[0.5, 8, 8]} />
            <meshBasicMaterial color={colorGroups[groupId]?.color || '#fff'} />
          </mesh>
          <Html center style={{ color: '#222', background: '#fff', borderRadius: '4px', padding: '2px 4px', fontSize: '12px', opacity: 0.85 }}>
            {groupId}
          </Html>
        </group>
      );
    });
  }
  const handleGroupSelect = (groupIdx) => {
    setHighlightGroup(groupIdx);
    setHighlightColor(colorGroups[groupIdx]?.color || '#00ff00');
  };
  // 供Model组件点击面片时调用，实现高亮
  const handleModelGroupSelect = (groupIdx) => {
    handleGroupSelect(groupIdx);
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
    if (renderMode !== 'vertexColor') return; // Only allow painting in vertex color mode
    // TODO: 结合raycaster和brushSize修改vertexColors
    message.info('顶点色编辑功能待实现');
  };

  // 侧边交互面板 (Keep as is for now)
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

  // Removed iconStyle and disabledIconStyle as they are handled within button components

  return (
    <div style={{ flex: 3, backgroundColor: '#e0e0e0', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', height: '100%', width: '100%' }}>
      {renderControlPanel()}
      <div style={{ width: '100%', height: '100%' }} onClick={handleVertexPaint}>
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }} style={{ width: '100%', height: '100%' }}>
          <axesHelper args={[1]} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 5, 5]} intensity={0.7} />
          {geometry && (
            <Model
              geometry={geometry}
              renderMode={renderMode}
              vertexColors={vertexColors}
              highlightGroup={highlightGroup}
              highlightColor={highlightColor}
              colorGroups={colorGroups}
              onGroupSelect={handleModelGroupSelect}
            />
          )}
          <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} panSpeed={1.2} rotateSpeed={1.1} zoomSpeed={1.1} />
        </Canvas>
      </div>
      {/* 右上角渲染模式菜单 */} 
      <div style={{ position: 'absolute', top: '10px', right: '10px', padding: '0 8px', borderRadius: '4px', zIndex: 2 }}>
        <RenderModeMenu 
          currentMode={renderMode} 
          onModeChange={setRenderMode} 
          isVertexColorEnabled={isVertexColorEnabled} 
        />
      </div>
    </div>
  );
});

export default ThreeDViewPanel;

// 错误边界组件
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Canvas Error Boundary:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <div style={{ color: 'red', padding: 16 }}>3D渲染出错: {this.state.error?.message || '未知错误'}</div>;
    }
    return this.props.children;
  }
}