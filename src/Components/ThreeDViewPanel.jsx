import React, { forwardRef, useImperativeHandle, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import CustomOrbitControls from './CustomOrbitControls'; // Changed from OrbitControls to CustomOrbitControls
//import { message } from 'antd'; 
import RenderModeMenu from './RenderModeMenu';
import * as THREE from 'three';


// 3D模型渲染组件
function Model({ 
    geometry, 
    renderMode, 
    activeHighlightColor, 
    setActiveHighlightColor, 
    brushSize, 
    brushColor, 
    brushEnabled, 
    isColorPickerMode,
  }) {
  const meshRef = useRef();
  const materialRef = useRef();
  const [iTime, setITime] = useState(0.0);
  const [isDrawing, setIsDrawing] = useState(false);
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
        const shaderMaterial = new THREE.ShaderMaterial(vertexGroupShader, {side:THREE.DoubleSide});
        materialRef.current = shaderMaterial; 
        return shaderMaterial;
      case 'vertexColorEdit': 
        return new THREE.MeshBasicMaterial({ 
          vertexColors: true, 
          side:THREE.DoubleSide, });
      case 'solid':
      default:
        return new THREE.MeshStandardMaterial({
          color: 'white',
          roughness: 0.5,
          metalness: 0.1,
          side:THREE.DoubleSide,
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
    e.stopPropagation();
    if (!e.face || !meshRef.current?.geometry) return;

    const faceColor = getFaceColor(e.face, meshRef.current.geometry);
    if (!faceColor) return;

    const color = new THREE.Color(faceColor[0], faceColor[1], faceColor[2]);
    const colorHex = `#${color.getHexString().toUpperCase()}`;

    // 如果在颜色选择器模式下，无论当前渲染模式如何，都获取顶点颜色
    if (isColorPickerMode) {
      // 派发事件，将选中的颜色传递给DesignerPage
      const event = new CustomEvent('brushColorChange', { detail: { color: colorHex } });
      window.dispatchEvent(event);
      //message.success(`画笔颜色已选择: ${colorHex}`);
      //setColorPickerMode(false); // 这将由DesignerPage监听brushColorChange事件处理
    } 
    // 如果在顶点颜色预览模式下且不在颜色选择器模式，设置高亮颜色
    else if (renderMode === 'vertexColor' && !isColorPickerMode) {
      setActiveHighlightColor(colorHex); // 更新共享状态以高亮面板
    }
    // 其他模式或状态（例如solid、wireframe或没有选择器的vertexColorEdit）在这里不执行任何操作
  };
  
  // 处理笔刷绘制
  const handlePointerDown = (e) => {
    if (!brushEnabled || renderMode !== 'vertexColorEdit') return;
    // 只在左键单击时触发（button为0表示左键）
    if (e.button !== 0 || e.shiftKey) return;
    e.stopPropagation();
    setIsDrawing(true);
    applyBrush(e);
  };
  
  const handlePointerMove = (e) => {
    if (!isDrawing || !brushEnabled || renderMode !== 'vertexColorEdit') return;
    // 确保只在左键拖拽时触发（不检查e.button，因为move事件中可能不准确）
    if (e.shiftKey) return;
    e.stopPropagation();
    applyBrush(e);
  };
  
  const handlePointerUp = () => {
    setIsDrawing(false);
  };
  
  // 应用笔刷效果
  const applyBrush = (e) => {
    if (!meshRef.current || !e.face) return;
    
    const geometry = meshRef.current.geometry;
    const position = geometry.attributes.position;
    const color = geometry.attributes.color;
    
    if (!color) {
      console.error('No color attribute found in geometry');
      return;
    }
    
    // 获取点击位置
    const point = e.point.clone();
    // 转换为模型局部坐标
    meshRef.current.worldToLocal(point);
    
    // 笔刷颜色
    const brushColorObj = new THREE.Color(brushColor);
    
    // 遍历所有顶点，计算与点击位置的距离，在笔刷范围内的顶点应用颜色
    const vertexCount = position.count;
    // 使用传入的brushSize，已经在外部应用了brushScaleFactor
    const brushSizeSquared = brushSize * brushSize; // brushSize已经是调整后的实际大小
    
    for (let i = 0; i < vertexCount; i++) {
      const vertexPosition = new THREE.Vector3(
        position.getX(i),
        position.getY(i),
        position.getZ(i)
      );
      
      const distanceSquared = point.distanceToSquared(vertexPosition);
      
      // 如果顶点在笔刷范围内，应用颜色
      if (distanceSquared < brushSizeSquared) {
        color.setXYZ(i, brushColorObj.r, brushColorObj.g, brushColorObj.b);
      }
    }
    
    // 更新颜色属性
    color.needsUpdate = true;
  };

  try {
    return (
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
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
  activeHighlightColor,
  setActiveHighlightColor, 
  brushSize,
  brushColor,
  brushEnabled
}, ref) => {
  const [renderMode, _setRenderMode] = useState('solid'); // 'wireframe', 'solid', 'vertexColor', 'vertexColorEdit'
  const renderModeRef = useRef(renderMode); // Ref to keep track of renderMode for callbacks
  const [isVertexColorEnabled, setIsVertexColorEnabled] = useState(false); // Controls if vertex color mode can be selected
  const [isColorPickerMode, setIsColorPickerMode] = useState(false); // 颜色选择器模式状态
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 }); // 新增：鼠标位置
  const [brushScaleFactor, setBrushScaleFactor] = useState(0.001); // 新增：笔刷比例系数
  const fileInputRef = useRef(null); // Ref for the hidden file input
  const canvasContainerRef = useRef(null); // 新增：Canvas容器引用

  // 当笔刷启用状态改变时，切换到顶点色编辑模式
  useEffect(() => {
    if (brushEnabled) {
      setIsVertexColorEnabled(true);
      setRenderMode('vertexColorEdit');
    }
  }, [brushEnabled]);

  // 处理鼠标移动，更新鼠标位置状态
  const handleMouseMove = (e) => {
    if (canvasContainerRef.current) {
      const rect = canvasContainerRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  // 设置渲染模式
  useEffect(() => {
    renderModeRef.current = renderMode;
  }, [renderMode]);

  const setRenderMode = (newMode) => {
    _setRenderMode(newMode);
    if (newMode === 'vertexColorEdit') {
      setIsVertexColorEnabled(true);
    } else if (newMode === 'vertexColor') {
      setIsVertexColorEnabled(true);
    } else {
      // If switching to a mode that's not vertexColor or vertexColorEdit,
      // and color picker is active, deactivate it.
      if (isColorPickerMode) {
        setIsColorPickerMode(false);
        // Optionally notify DesignerPage if it needs to update its state too
        // window.dispatchEvent(new CustomEvent('colorPickerDeactivated'));
      }
    }
  };

  // Expose functions via ref
  useImperativeHandle(ref, () => ({
    triggerUpload: () => {
      fileInputRef.current?.click();
    },
    enableVertexColorMode: () => { // This now sets to 'vertexColor' (preview)
      setIsVertexColorEnabled(true);
      setRenderMode('vertexColor'); 
    },
    disableVertexColorMode: () => {
      setRenderMode('solid'); 
      setIsVertexColorEnabled(false); 
    },
    setColorPickerMode: (active) => {
      if (active) {
        // 检查当前是否有顶点颜色模式（vertexColor或vertexColorEdit）
        const hasVertexColors = renderModeRef.current === 'vertexColor' || renderModeRef.current === 'vertexColorEdit';
        
        if (hasVertexColors) {
          // 如果当前模式支持顶点颜色，直接激活颜色选择器
          setIsColorPickerMode(true);
          //message.info('颜色选择器已启用，点击模型选择颜色');
        } else {
          // 如果当前模式不支持顶点颜色，先尝试切换到vertexColorEdit模式
          try {
            setRenderMode('vertexColorEdit');
            setIsVertexColorEnabled(true);
            setIsColorPickerMode(true);
          } catch (error) {
            // 如果切换失败，通知DesignerPage激活失败
            window.dispatchEvent(new CustomEvent('colorPickerActivationFailed'));
            return;
          }
        }
      } else {
        // 关闭颜色选择器模式
        setIsColorPickerMode(false);
      }
    },
    // Expose setRenderMode and getCurrentRenderMode
    setRenderMode: (mode) => {
        setRenderMode(mode);
    },
    getCurrentRenderMode: () => {
        return renderModeRef.current;
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

  // Removed window.isColorPickerMode and window.setBrushColorFromPicker logic
  // State is managed internally and events are used for communication
  // Event listener for brushColorChange is now in DesignerPage.jsx

  // 修改笔刷大小的实际影响范围
  const actualBrushSize = brushSize * brushScaleFactor;

  return (
    <div 
      ref={canvasContainerRef}
      style={{ flex: 3, backgroundColor: '#e0e0e0', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', height: '100%', width: '100%' }}
      onMouseMove={handleMouseMove}
    >
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
              brushSize={actualBrushSize} // 使用调整后的笔刷大小
              brushColor={brushColor}
              brushEnabled={brushEnabled}
              isColorPickerMode={isColorPickerMode}
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

      {/* 笔刷指示器 */}
      {(brushEnabled || isColorPickerMode) && (
        <div 
          style={{
            position: 'absolute',
            left: `${mousePosition.x}px`,
            top: `${mousePosition.y}px`,
            width: `${brushSize}px`,
            height: `${brushSize}px`,
            borderRadius: '50%',
            border: `2px solid ${isColorPickerMode ? '#ff0000' : brushColor}`,
            backgroundColor: `${brushColor}40`, // 添加透明度
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none', // 确保鼠标事件可以穿透
            zIndex: 10
          }}
        />
      )}

      {/* 颜色选择器模式提示 */}
      {isColorPickerMode && (
        <div style={{ position: 'absolute', top: '50px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', padding: '8px 16px', borderRadius: '4px', zIndex: 10 }}>
          点击模型选择颜色
        </div>
      )}
    </div>
  );
});

export default ThreeDViewPanel;