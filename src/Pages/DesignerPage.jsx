import React, { useRef, forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import { Layout, message } from 'antd';
import Splitter from 'antd/es/splitter';
import DesignerMenuBar from '../Components/DesignerMenuBar';
import ThreeDViewPanel from '../Components/ThreeDViewPanel';
import PatternPanel from '../Components/PatternPanel';
import { GLTFLoader } from 'three-stdlib'; // Import loaders
import { OBJLoader } from 'three-stdlib';
import useVertexColorEvents from '../hooks/useVertexColorEvents';

// Use forwardRef to receive ref from App.jsx (if still needed for external calls like export)
const DesignerPage = forwardRef(({ /* Props from App.jsx are reduced */ }, ref) => {
  const [filename, setFilename] = useState('jacket.glb');
  const [geometry, setGeometry] = useState(null);
  const [activeHighlightColor, setActiveHighlightColor] = useState(null);

  // Handler to load and set geometry from file (moved from App.jsx)
  const handleModelLoad = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const currentFilename = file.name; // Use a local variable for the current file's name
      setFilename(currentFilename); // Set filename state
      if (currentFilename.endsWith('.gltf') || currentFilename.endsWith('.glb')) {
        const loader = new GLTFLoader();
        loader.parse(ev.target.result, '', (gltf) => {
          let mesh = null;
          gltf.scene.traverse((child) => {
            if (child.isMesh && !mesh) mesh = child;
          });
          if (mesh) {
            setGeometry(mesh.geometry);
            //message.success('GLTF model loaded successfully');
          } else {
            //message.error('No usable Mesh found in GLTF');
          }
        }, (err) => {
          //message.error('GLTF parsing failed: ' + err.message);
        });
      } else if (currentFilename.endsWith('.obj')) {
        const loader = new OBJLoader();
        const text = new TextDecoder().decode(ev.target.result);
        const obj = loader.parse(text);
        let mesh = null;
        obj.traverse((child) => {
          if (child.isMesh && !mesh) mesh = child;
        });
        if (mesh) {
          setGeometry(mesh.geometry);
          //message.success('OBJ model loaded successfully');
        } else {
          //message.error('No usable Mesh found in OBJ');
        }
      } else {
        //message.error('Only OBJ/GLTF/GLB formats are supported');
      }
    };
    reader.readAsArrayBuffer(file);
  };
  // 引用对象
  // Add ref for ThreeDViewPanel
  const threeDViewRef = useRef(null);
  const patternPanelRef = useRef(null); // Add ref for PatternPanel

  // Define handler to trigger upload in ThreeDViewPanel
  // This now uses the internal handleModelLoad
  const handleClothSelect = () => { // This function is passed to DesignerMenuBar for the 'Import Cloth' button
    // It should trigger the file input in ThreeDViewPanel, which then calls onModelLoad (now local)
    if (threeDViewRef.current && threeDViewRef.current.triggerUpload) {
      threeDViewRef.current.triggerUpload(); 
    }
  };

  // Handler to trigger SVG export in PatternPanel
  const handleExportPatternSVG = () => {
    patternPanelRef.current?.exportSVG();
  };
  
  // 处理颜色选择器点击状态
  const [isColorPickerActive, setIsColorPickerActive] = useState(false); // 颜色选择器激活状态
  
  // 处理笔刷工具选择
  const handleToolSelect = (toolKey) => {
    if (toolKey === 'Region_Brush') {
      setBrushEnabled(true);
      // Ensure brushColor is not white if it was previously eraser
      if (brushColor === '#FFFFFF') {
        setBrushColor('#000000'); // Default to black or last used color
      }
      threeDViewRef.current?.setRenderMode('vertexColorEdit');
    } else if (toolKey === 'Region_Eraser') {
      setBrushEnabled(true);
      setBrushColor('#FFFFFF'); // Eraser is white
      threeDViewRef.current?.setRenderMode('vertexColorEdit');
    } else if (toolKey === 'Move') {
      setBrushEnabled(false);
      // Optionally switch back to a default viewing mode, e.g., 'solid' or 'vertexColor'
      // threeDViewRef.current?.setRenderMode('solid'); 
    }

    // If any tool other than brush/eraser is selected, and color picker was active, deactivate it.
    if (toolKey !== 'Region_Brush' && toolKey !== 'Region_Eraser' && isColorPickerActive) {
        setIsColorPickerActive(false);
        threeDViewRef.current?.setColorPickerMode(false);
    }
  };
  
  // 使用自定义Hook管理顶点颜色相关事件和状态
  const {
    isVertexColorModeEnabled,
    brushColor,
    setBrushColor,
    brushEnabled,
    setBrushEnabled,
    brushSize,
    setBrushSize
  } = useVertexColorEvents(threeDViewRef, handleToolSelect, isColorPickerActive, setIsColorPickerActive);

  const handleColorPickerClick = () => {
    // 如果顶点色渲染模式未激活，不执行任何操作
    if (!isVertexColorModeEnabled || !threeDViewRef.current) {
      message.warning('请先点击Divide按钮激活顶点色渲染模式');
      return;
    }
    
    // 如果当前正在使用笔刷工具，先关闭笔刷模式
    if (brushEnabled) {
      setBrushEnabled(false);
    }
    
    const newPickerState = !isColorPickerActive;
    
    // 如果激活颜色选择器，确保先切换到顶点颜色编辑模式
    if (newPickerState) {
      // 获取当前渲染模式
      const currentRenderMode = threeDViewRef.current.getCurrentRenderMode?.();
      
      // 如果当前不是顶点颜色编辑模式，先切换到该模式
      if (currentRenderMode !== 'vertexColorEdit') {
        threeDViewRef.current.setRenderMode('vertexColorEdit');
      }
    }
    
    // 设置本地状态
    setIsColorPickerActive(newPickerState);
    // 设置ThreeDViewPanel中的颜色选择器模式
    threeDViewRef.current.setColorPickerMode(newPickerState);
  };
  
  // 处理添加新颜色
  const handleAddNewColor = () => {
    // 这里可以实现添加新颜色的逻辑，例如打开颜色选择器
    // 暂时简单实现为随机生成一个颜色
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
    setBrushColor(randomColor);
  };

  // Expose method to App.jsx via ref (e.g., if App needs to trigger export)
  useImperativeHandle(ref, () => ({
    triggerExportPatternSVG: handleExportPatternSVG // Expose the local handler
  }));

  // 监听几何体变化
  useEffect(() => {
    if (geometry) { // Check if geometry is not null or undefined
      console.log('New model loaded, disabling vertex color mode and Generate Panel button.');
      threeDViewRef.current?.disableVertexColorMode();
      patternPanelRef.current?.resetGenerateButtonState();
    }
  }, [geometry]); // Run effect when geometry changes

  return (
    <Layout style={{ height: 'calc(100vh - 64px)' }}>
      <DesignerMenuBar 
        onClothSelect={handleClothSelect} // For importing cloth, triggers file input in ThreeDViewPanel
        onExportPatternSVG={handleExportPatternSVG} // For exporting SVG from PatternPanel
        brushSize={brushSize}
        setBrushSize={setBrushSize}
        brushColor={brushColor}
        setBrushColor={setBrushColor}
        onColorPickerClick={handleColorPickerClick}
        onAddNewColor={handleAddNewColor}
        onToolSelect={handleToolSelect}
        isVertexColorModeEnabled={isVertexColorModeEnabled} // 传递顶点色渲染模式状态
      />
      <Layout style={{ height: 'calc(100% - 48px)' }}>
        <Splitter style={{ height: '100%' }} direction="horizontal" min={200} max={800} defaultValue={300}>
          <Splitter.Panel defaultSize="60%" min="20%" max="70%" style={{background: '#fff' }}>
            {/* Pass geometry, onModelLoad (now local), ref, activeHighlightColor, and setActiveHighlightColor to ThreeDViewPanel */}
            <ThreeDViewPanel 
              ref={threeDViewRef} 
              geometry={geometry} // from local state
              onModelLoad={handleModelLoad} // local handler
              activeHighlightColor={activeHighlightColor} // from local state
              setActiveHighlightColor={setActiveHighlightColor} // from local state
              brushSize={brushSize}
              brushColor={brushColor}
              brushEnabled={brushEnabled}
            />
          </Splitter.Panel>
          <Splitter.Panel style={{ height: '100%' }}>
            {/* Pass panels state, handlers, and threeDViewRef to PatternPanel */}
            <PatternPanel 
              filename={filename} // from local state
              threeDViewRef={threeDViewRef} // Pass the ref here
              ref={patternPanelRef} // Pass ref to PatternPanel
              activeHighlightColor={activeHighlightColor} // from local state
              setActiveHighlightColor={setActiveHighlightColor} // from local state
            />
          </Splitter.Panel>
        </Splitter>
      </Layout>
    </Layout>
  );
});

export default DesignerPage;