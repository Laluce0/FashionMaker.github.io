import { useState, useCallback, useEffect } from 'react';
import useEventListener from './useEventListener';

/**
 * 自定义Hook，用于管理与顶点颜色相关的事件和状态
 * @param {Object} threeDViewRef - ThreeDViewPanel的引用
 * @param {Function} handleToolSelect - 工具选择处理函数
 * @param {boolean} isColorPickerActive - 颜色选择器是否激活
 * @param {Function} setIsColorPickerActive - 设置颜色选择器激活状态的函数
 */
const useVertexColorEvents = (threeDViewRef, handleToolSelect, isColorPickerActive, setIsColorPickerActive) => {
  // 顶点色渲染模式状态
  const [isVertexColorModeEnabled, setIsVertexColorModeEnabled] = useState(false);
  // 笔刷状态
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushEnabled, setBrushEnabled] = useState(false);
  const [brushSize, setBrushSize] = useState(10);

  // 检查顶点色渲染模式状态
  const checkVertexColorMode = useCallback(() => {
    if (threeDViewRef.current) {
      const currentRenderMode = threeDViewRef.current.getCurrentRenderMode?.();
      const isEnabled = currentRenderMode === 'vertexColor' || currentRenderMode === 'vertexColorEdit';
      setIsVertexColorModeEnabled(isEnabled);
    }
  }, [threeDViewRef]);

  // 处理顶点模式启用事件
  const handleVertexModeEnabled = useCallback(() => {
    setIsVertexColorModeEnabled(true);
  }, []);

  // 使用自定义Hook监听vertexColorModeEnabled事件
  useEventListener('vertexColorModeEnabled', handleVertexModeEnabled);

  // 处理笔刷颜色变化事件
  const handleBrushColorChange = useCallback((e) => {
    // 设置笔刷颜色为选中的颜色
    setBrushColor(e.detail.color);
    // 确保笔刷功能启用
    setBrushEnabled(true);
    
    // 颜色选择后自动关闭颜色选择器模式
    if (isColorPickerActive) {
      setIsColorPickerActive(false);
      if (threeDViewRef.current) {
        threeDViewRef.current.setColorPickerMode(false);
      }
    }
    
    // 确保渲染模式为顶点颜色编辑模式
    if (threeDViewRef.current?.getCurrentRenderMode && 
        threeDViewRef.current.getCurrentRenderMode() !== 'vertexColorEdit') {
      threeDViewRef.current.setRenderMode('vertexColorEdit');
    }
    
    // 自动选择Region_Brush工具
    handleToolSelect('Region_Brush');
  }, [isColorPickerActive, setIsColorPickerActive, threeDViewRef, handleToolSelect]);

  // 处理颜色选择器激活失败事件
  const handleColorPickerActivationFailed = useCallback(() => {
    // 如果ThreeDViewPanel无法激活颜色选择器（例如，错误的模式），
    // 恢复本地isColorPickerActive状态
    if (isColorPickerActive) {
      setIsColorPickerActive(false);
    }
  }, [isColorPickerActive, setIsColorPickerActive]);

  // 使用自定义Hook监听brushColorChange事件
  useEventListener('brushColorChange', handleBrushColorChange, window, [isColorPickerActive, setIsColorPickerActive, threeDViewRef, handleToolSelect]);
  
  // 使用自定义Hook监听colorPickerActivationFailed事件
  useEventListener('colorPickerActivationFailed', handleColorPickerActivationFailed, window, [isColorPickerActive, setIsColorPickerActive]);

  // 在组件挂载时检查顶点色渲染模式状态
  useEffect(() => {
    checkVertexColorMode();
  }, [checkVertexColorMode]);

  return {
    isVertexColorModeEnabled,
    brushColor,
    setBrushColor,
    brushEnabled,
    setBrushEnabled,
    brushSize,
    setBrushSize,
    checkVertexColorMode
  };
};

export default useVertexColorEvents;