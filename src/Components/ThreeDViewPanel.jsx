import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import CustomOrbitControls from './CustomOrbitControls'; // Changed from OrbitControls to CustomOrbitControls
import { message } from 'antd'; 
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
        iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        edgeColor: { value: new THREE.Color(1,1,0) },
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
            float t = sin(iTime * 2.0) * 0.5 + 0.5;
            gl_FragColor = vec4(t, t, t, 1.0); // 高亮颜色
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
      case 'vertexColorEdit': // 新增顶点色编辑模式的处理
        // 使用 MeshBasicMaterial 并启用顶点色，直接显示原始顶点颜色
        return new THREE.MeshBasicMaterial({ vertexColors: true, side:THREE.DoubleSide, });
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
    if (e.face) {
      const faceColor = getFaceColor(e.face, meshRef.current.geometry);
      
      if (faceColor) {
        const color = new THREE.Color(faceColor[0], faceColor[1], faceColor[2]);
        const colorHex = `#${color.getHexString().toUpperCase()}`;
        // console.log('Face color clicked:', colorHex);
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

// Receive props from DesignerPage
const ThreeDViewPanel = forwardRef(({ 
  geometry, 
  onModelLoad, 
  activeHighlightColor, // New prop for shared highlight state
  setActiveHighlightColor // New prop for updating shared highlight state
}, ref) => {
  const [renderMode, setRenderMode] = useState('solid'); // 'wireframe', 'solid', 'vertexColor'
  const [isVertexColorEnabled, setIsVertexColorEnabled] = useState(false); // Controls if vertex color mode can be selected
  // const [highlightColor, setHighlightColor] = useState('#00ff00'); // Removed, highlight is now managed by activeHighlightColor in Model component
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
      //message.info('顶点色模式已启用');
    },
    // New method to disable vertex color mode
    disableVertexColorMode: () => {
      setRenderMode('solid'); // Reset to default render mode
      setIsVertexColorEnabled(false); // Disable vertex color mode selection
      // Optionally, reset activeHighlightColor if it's tied to vertex coloring
      // setActiveHighlightColor(null); 
      //message.info('顶点色模式已禁用');
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
    }
    // Reset the input value to allow uploading the same file again
    if (event.target) {
      event.target.value = null;
    }
  };

  // 保留handleGroupSelect函数用于潜在的未来功能

  // 隐藏文件输入（仅保留文件上传功能，移除笔刷面板）
  const renderHiddenInput = () => (
    <input 
      ref={fileInputRef} 
      type="file" 
      accept=".obj,.gltf,.glb" 
      style={{ display: 'none' }} 
      onChange={handleFileChange} 
    />
  );

  // Removed iconStyle and disabledIconStyle as they are handled within button components

  return (
    <div style={{ flex: 3, backgroundColor: '#e0e0e0', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', height: '100%', width: '100%' }}>
      {renderHiddenInput()}
      <div style={{ width: '100%', height: '100%' }}>
        <Canvas camera={{ position: [0, 0, 5], fov: 60 }} style={{ width: '100%', height: '100%' }}>
          <axesHelper args={[1]} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 5, 5]} intensity={0.7} />
          {geometry && (
            <Model
              geometry={geometry}
              renderMode={renderMode}
              activeHighlightColor={activeHighlightColor} // Pass down activeHighlightColor
              setActiveHighlightColor={setActiveHighlightColor} // Pass down setActiveHighlightColor
            />
          )}
          <CustomOrbitControls enableDamping />
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