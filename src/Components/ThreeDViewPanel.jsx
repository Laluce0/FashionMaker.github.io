import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Edges, } from '@react-three/drei';
import { Space, Button, Slider, message } from 'antd'; 
// Import the new menu component
import RenderModeMenu from './RenderModeMenu';
import * as THREE from 'three';


// 3D模型渲染组件
function Model({ geometry, renderMode, activeHighlightColor, setActiveHighlightColor }) {
  const meshRef = useRef();
  const materialRef = useRef();
  const [iTime, setITime] = useState(0.0);
  // const [highlightColor,setHighlightColor] = useState(new THREE.Color(0,0,0)); // Removed, using activeHighlightColor prop
  let raycaster, camera, scene;
  try {
    ({ raycaster, camera, scene } = useThree());
  } catch (err) {
    console.error('useThree hook error:', err);
    return null;
  }
  //const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    setITime(prev => prev + delta);
    
    // 直接更新着色器材质的 uniform 值
    if (materialRef.current && materialRef.current.uniforms) {
      materialRef.current.uniforms.iTime.value = iTime + delta;
      // Use activeHighlightColor prop for the shader
      materialRef.current.uniforms.highlightColor.value = activeHighlightColor ? new THREE.Color(activeHighlightColor) : new THREE.Color(0,0,0);
    }
  });

  // 自定义shader材质（仅vertexColor模式下）
  const vertexGroupShader = React.useMemo(() => {
    return {
      uniforms: {
        // Use activeHighlightColor prop for the shader uniform
        highlightColor: { value: activeHighlightColor ? new THREE.Color(activeHighlightColor) : new THREE.Color(0,0,0) },
        iTime: { value: 0.0 },
      },
      vertexShader: `
        varying vec4 vColor;
        void main() {
          vColor = color;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 highlightColor;
        uniform float iTime;
        varying vec4 vColor;
        void main() {
          vec3 baseColor = vColor.rgb;
          
          // 计算当前颜色与透明颜色之间的距离
          float colorDist = distance(baseColor, highlightColor);
          
          if (colorDist < 0.1) {
            gl_FragColor = vec4(fract(iTime), fract(iTime), fract(iTime), 1.0); // 高亮颜色
          } else {
            // 否则使用原始颜色
            gl_FragColor = vec4(baseColor, 1.0);
          }
        }
      `,
      vertexColors: true,
    };
  }, [activeHighlightColor]); // Depend on activeHighlightColor

  // 根据渲染模式选择材质
  const material = React.useMemo(() => {
    switch (renderMode) {
      case 'wireframe':
        return new THREE.MeshBasicMaterial({ wireframe: true, color: 'black' });
      case 'vertexColor':
        const shaderMaterial = new THREE.ShaderMaterial(vertexGroupShader);
        materialRef.current = shaderMaterial; // 保存对材质的引用
        return shaderMaterial;
      case 'solid':
      default:
        return new THREE.MeshStandardMaterial({
          color: 'white',
          roughness: 0.5,
          metalness: 0.1,
        });
    }
  }, [renderMode, vertexGroupShader]);

  const getFaceColor = (face, geometry) => {
    if (!face || !geometry.attributes.color) return null;
    
    const colorAttr = geometry.attributes.color;
    // 获取面片第一个顶点的颜色作为面片颜色
    const colors = [
      colorAttr.getX(face.a),
      colorAttr.getY(face.a),
      colorAttr.getZ(face.a)
    ];
    
    return colors;
  };

  // 处理点击事件
  const handleClick = (e) => {
    if (renderMode !== 'vertexColor') return;
    e.stopPropagation();
    
    // 直接使用Three Fiber提供的标准化点击位置
    // e.point 是世界空间中的点击位置
    // e.uv 是模型上的UV坐标
    // e.distance 是从相机到交点的距离
    
    // R3F已经处理了交点,我们可以直接获取face
    if (e.face) {
      const faceColor = getFaceColor(e.face, meshRef.current.geometry);
      
      if (faceColor) {
        const color = new THREE.Color(faceColor[0], faceColor[1], faceColor[2]);
        const colorHex = `#${color.getHexString()}`;
        console.log('Face color clicked:', colorHex);
        // setHighlightColor(color); // Removed
        setActiveHighlightColor(colorHex); // Update shared state
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
        //onPointerOver={() => setHovered(true)}
        //onPointerOut={() => setHovered(false)}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={0.7} />
      </mesh>
    );
  } catch (err) {
    console.error('Model render error:', err);
    return null;
  }
}

const defaultBrushColor = '#ff0000';

// Receive props from DesignerPage
const ThreeDViewPanel = forwardRef(({ 
  geometry, 
  onModelLoad, 
  activeHighlightColor, // New prop for shared highlight state
  setActiveHighlightColor // New prop for updating shared highlight state
}, ref) => {
  const [renderMode, setRenderMode] = useState('solid'); // 'wireframe', 'solid', 'vertexColor'
  const [isVertexColorEnabled, setIsVertexColorEnabled] = useState(false); // Controls if vertex color mode can be selected
  const [vertexColors, setVertexColors] = useState([]); // Keep local UI state
  const [colorGroups, setColorGroups] = useState([]); // Keep local UI state
  const [highlightGroup, setHighlightGroup] = useState(null); // Keep local UI state
  // const [highlightColor, setHighlightColor] = useState('#00ff00'); // Removed, highlight is now managed by activeHighlightColor in Model component
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
  
  const handleGroupSelect = (groupIdx) => {
    setHighlightGroup(groupIdx);
    // setHighlightColor(colorGroups[groupIdx]?.color || '#00ff00'); // Removed, Model will use activeHighlightColor
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
              activeHighlightColor={activeHighlightColor} // Pass down activeHighlightColor
              setActiveHighlightColor={setActiveHighlightColor} // Pass down setActiveHighlightColor
              //colorGroups={colorGroups}
              //onGroupSelect={handleModelGroupSelect}
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