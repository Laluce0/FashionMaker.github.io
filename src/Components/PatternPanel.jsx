import React, { useState, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Button, Spin, Space, message, Alert } from 'antd'; // 新增 message 和 Alert

// Receive props from DesignerPage and use forwardRef
const PatternPanel = forwardRef(({ 
  panels, // Keep existing panels prop for potential future use or remove if fully replaced
  onPanelsChange, 
  filename,
  threeDViewRef, // Receive ref for ThreeDViewPanel
  activeHighlightColor, // New prop for shared highlight state
  setActiveHighlightColor // New prop for updating shared highlight state
}, ref) => {
  const [dragVertex, setDragVertex] = useState(null); // {panelId, vertexIdx} - Keep for potential future interaction
  const svgRef = useRef(null);
  // Remove local panelIdCounter state, use props instead
  // const [panelIdCounter, setPanelIdCounter] = useState(2);
  // 加载条相关状态 (Keep local UI state)
  const [spinningGenerate, setSpinningGenerate] = useState(false);
  const [percentGenerate, setPercentGenerate] = useState(0);
  const [isDividing, setIsDividing] = useState(false); // Loading state for Divide button
  const [percentDivide, setPercentDivide] = useState(0); // Progress for Divide button
  const [isGeneratePanelEnabled, setIsGeneratePanelEnabled] = useState(false); // Control Generate Panel button state
  const [drawnPatterns, setDrawnPatterns] = useState([]); // State to hold parsed pattern data for SVG
  const [svgViewBox, setSvgViewBox] = useState("0 0 500 400"); // Default viewBox
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [generateFailed, setGenerateFailed] = useState(false); // 新增：生成失败状态

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    exportSVG: () => { // Keep existing exportSVG method
      if (!svgRef.current) {
        message.error('SVG 元素未找到，无法导出');
        return;
      }
      try {
        const svgData = new XMLSerializer().serializeToString(svgRef.current);
        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const exportFilename = filename ? `${filename.split('.')[0]}_pattern.svg` : 'pattern.svg';
        link.download = exportFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        message.success('SVG 导出成功');
      } catch (error) {
        console.error('导出 SVG 时出错:', error);
        message.error('导出 SVG 失败');
      }
    },
    // New method to reset Generate Panel button state
    resetGenerateButtonState: () => {
      setIsGeneratePanelEnabled(false);
      // Optionally, also reset other related states if needed
      setDrawnPatterns([]); 
      setActiveHighlightColor(null); 
    }
  }));

  // 选中板片并更新全局高亮颜色
  const handlePanelClick = (color) => {
    // console.log("Pattern Color clicked:", color);
    setActiveHighlightColor(color); // Update the shared state
  };
  
  const handleCanvasMouseDown = (e) => {
    // Prevent dragging if clicking on a pattern element itself
    if (e.target.closest('g[onClick]')) {
      return;
    }
    setIsPanning(true);
    setPanStart({ x: e.clientX - canvasOffset.x, y: e.clientY - canvasOffset.y });
  };

  const handleCanvasMouseMove = useCallback((e) => {
    if (!isPanning) return;
    setCanvasOffset({
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y,
    });
  }, [isPanning, panStart]);

  const handleCanvasMouseUp = () => {
    setIsPanning(false);
  };

  // Vertex dragging logic (kept for potential future use, but separate from canvas panning)
  const handleVertexMouseMove = useCallback((e) => {
    if (!dragVertex) return;
    const svgRect = svgRef.current.getBoundingClientRect();
    // Adjust for canvas offset when calculating vertex position
    const x = e.clientX - svgRect.left - canvasOffset.x;
    const y = e.clientY - svgRect.top - canvasOffset.y;
    const updatedPanels = panels.map(panel => {
      if (panel.id !== dragVertex.panelId) return panel;
      const newVertices = panel.vertices.map((v, idx) => idx === dragVertex.vertexIdx ? { x, y } : v);
      return { ...panel, vertices: newVertices };
    });
    onPanelsChange(updatedPanels);
  }, [dragVertex, panels, onPanelsChange, canvasOffset]);

  const handleVertexMouseUp = () => {
    setDragVertex(null);
  };

  // Divide 按钮点击事件
  const handleDivideClick = () => {
    setIsDividing(true);
    let ptg = -10;
    const interval = setInterval(() => {
      ptg += 5;
      setPercentDivide(ptg);
      if (ptg > 120) {
        clearInterval(interval);
        setIsDividing(false);
        setPercentDivide(0);
        // Enable vertex color mode in 3D view and enable Generate Panel button
        threeDViewRef.current?.enableVertexColorMode();
        threeDViewRef.current?.setRenderMode('vertexColorEdit');
        setIsGeneratePanelEnabled(true);
      }
    }, 100);
  };

  // 生成板片按钮点击事件
  const handleGeneratePanel = async () => {
    //setFilename(filename);
    setSpinningGenerate(true);
    setGenerateFailed(false); // 重置生成失败状态
    let ptg = -10;
    const interval = setInterval(() => {
      ptg += 5;
      setPercentGenerate(ptg);
      if (ptg > 120) {
        clearInterval(interval);
        setSpinningGenerate(false);
        setPercentGenerate(0);
        // 新增：查找并解析SVG文件
        try {
          const modelName = filename.split('.')[0]; // TODO: 替换为动态获取模型名
          const svgFilePath = `/${modelName}.svg`;
          console.log('[调试] SVG文件路径:', svgFilePath);
          // 读取SVG文件内容
          fetch(svgFilePath)
            .then(res => {
              console.log('[调试] fetch响应:', res);
              if (!res.ok) throw new Error('SVG文件未找到');
              return res.text();
            })
            .then(svgText => {
              console.log('[调试] SVG文件内容长度:', svgText.length);
              if (!svgText || svgText.trim().length === 0) {
                //message.error('SVG文件内容为空，无法解析');
                return;
              }
              // 解析SVG内容
              const parser = new window.DOMParser();
              const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
              const pathNodes = Array.from(svgDoc.querySelectorAll('path'));
              if (pathNodes.length === 0) {
                //message.error('SVG中未找到path元素');
                return;
              }
              // 提取path数据
              const parsedPatterns = pathNodes.map((pathNode, idx) => {
                const d = pathNode.getAttribute('d');
                const fill = pathNode.getAttribute('fill') || 'none';
                const stroke = pathNode.getAttribute('stroke') || '#000';
                return {
                  id: pathNode.id || `svg-${idx}`,
                  path: d,
                  children: [],
                  originalPoints: [], // 可后续扩展解析点
                  fill,
                  stroke
                };
              });
              // 计算viewBox
              let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
              parsedPatterns.forEach(p => {
                // 简单解析d属性中的点（仅支持M/L命令，复杂曲线可后续扩展）
                const regex = /[ML]\s*(-?\d+(?:\.\d+)?)[, ]+(-?\d+(?:\.\d+)?)/gi;
                let match;
                while ((match = regex.exec(p.path)) !== null) {
                  const x = parseFloat(match[1]);
                  const y = parseFloat(match[2]);
                  if (x < minX) minX = x;
                  if (y < minY) minY = y;
                  if (x > maxX) maxX = x;
                  if (y > maxY) maxY = y;
                }
              });
              const padding = 50;
              const width = maxX - minX + 2 * padding;
              const height = maxY - minY + 2 * padding;
              if (width > 0 && height > 0) {
                setSvgViewBox(`${minX - padding} ${minY - padding} ${width} ${height}`);
              }
              setDrawnPatterns(parsedPatterns);
              // if (parsedPatterns.length > 0) { // Selection is now based on activeHighlightColor
              //   setSelectedPanelId(parsedPatterns[0].id);
              // }
              //message.success('SVG板片生成成功');
              threeDViewRef.current?.enableVertexColorMode();
            })
            .catch(err => {
              console.error('[调试] SVG文件读取或解析异常:', err);
              //message.error('SVG文件读取失败: ' + err.message);
              setGenerateFailed(true); // 设置生成失败状态
            });
        } catch (error) {
          console.error('[调试] 外层异常:', error);
        }
      }
    }, 100);
  };

  // 渲染生成的板片
  const renderGeneratedPanels = () => (
    drawnPatterns.map((pattern) => {
      const color = pattern.stroke; // Assuming stroke color is the unique identifier for highlighting
      const isSelected = color === activeHighlightColor;
      return (
        <g key={pattern.id} onClick={() => handlePanelClick(color)} style={{ cursor: 'pointer' }}>
          {/* Main Outline */}
          <path 
            d={pattern.path}
            //fill={isSelected ? `${color}40` : `${color}20`} // Lighter fill, slightly darker if selected
            fill={isSelected ? '#B8D6E6' : '#FFFFFF'}
            stroke={isSelected ? '#C686FF' : '#000000'}
            strokeWidth={isSelected ? 3 : 2}
            filter={isSelected ? "url(#shadow)" : "none"}
            // fillRule="evenodd" // Use if holes are part of the main path
          />
          {/* Children Shapes (Inner, Hole, Base) */}
          {pattern.children.map((child, childIdx) => {
            let strokeColor = isSelected ? '#1976d2' : color;
            let strokeWidth = isSelected ? 1.5 : 1;
            let fill = 'none';
            let strokeDasharray = 'none';

            if (child.type === "Hole Shape") {
              fill = '#fafafa'; // Match background to simulate hole
              strokeColor = isSelected ? '#1976d2' : color;
            } else if (child.type === "Base Line") {
              strokeColor = isSelected ? '#1976d2' : '#AAA'; // Grey for base lines
              strokeDasharray = "5,5";
            } else if (child.type === "InnerShape") {
               strokeColor = isSelected ? '#1976d2' : color;
            }

            return (
              <path
                key={`${pattern.id}-child-${childIdx}`}
                d={child.path}
                fill={fill}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
              />
            );
          })}
        </g>
      );
    })
  );

  // Global mouse event listeners for canvas panning
  React.useEffect(() => {
    if (isPanning) {
      window.addEventListener('mousemove', handleCanvasMouseMove);
      window.addEventListener('mouseup', handleCanvasMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleCanvasMouseMove);
        window.removeEventListener('mouseup', handleCanvasMouseUp);
      };
    }
  }, [isPanning, handleCanvasMouseMove, handleCanvasMouseUp]);

  // Global mouse event listeners for vertex dragging (if re-enabled)
  React.useEffect(() => {
    if (dragVertex) {
      window.addEventListener('mousemove', handleVertexMouseMove);
      window.addEventListener('mouseup', handleVertexMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleVertexMouseMove);
        window.removeEventListener('mouseup', handleVertexMouseUp);
      };
    }
  }, [dragVertex, handleVertexMouseMove, handleVertexMouseUp]);

  return (
    <div style={{
      flex: 1,
      width: '100%',
      background: '#fff',
      borderLeft: '1px solid #f0f0f0',
      padding: '10px',
      overflowY: 'auto',
      height: '100%'
    }}>
      {/* 顶部标题和按钮区 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h4 style={{ margin: 0 }}>Pattern Panel Making</h4>
        <Space>
          <Button type="default" onClick={handleDivideClick} loading={isDividing}>
            Divide
          </Button>
          <Button 
            type="primary" 
            onClick={handleGeneratePanel} 
            disabled={!isGeneratePanelEnabled} // Disable based on state
            loading={spinningGenerate}
          >
            Generate Panel
          </Button>
        </Space>
      </div>
      {/* 加载条特效 */}
      <Spin spinning={isDividing} percent={percentDivide} fullscreen tip="Dividing..." />
      <Spin spinning={spinningGenerate} percent={percentGenerate} fullscreen tip="Generating Panel..." />
      {/* 板片编辑区 */} 
      {/* 生成失败提示 */}
      {generateFailed && (
        <div style={{ marginBottom: '10px' }}>
          <Alert message="Generate Failed" type="error" showIcon />
        </div>
      )}
      <svg 
        ref={svgRef} 
        width="100%" 
        //height="400" // 设置固定高度
        viewBox={svgViewBox} // Use dynamic viewBox
        preserveAspectRatio="xMidYMid meet" // Adjust aspect ratio handling
        style={{
          border: '3px solid #ccc',
          background: '#fafafa',
          width: '100%',
          height: generateFailed ? '85%' : '92%', // 如果生成失败，调整高度以适应错误提示
          cursor: isPanning ? 'grabbing' : 'grab',
          userSelect: 'none', // Prevent text selection during pan
        }}
        onMouseDown={handleCanvasMouseDown}
        // onMouseMove and onMouseUp are handled globally when isPanning is true
      >
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feOffset dx="2" dy="2" result="offsetBlur" />
            <feMerge>
              <feMergeNode in="offsetBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g transform={`translate(${canvasOffset.x}, ${canvasOffset.y})`}>
          {renderGeneratedPanels()} {/* Render generated panels */}
        </g>
      </svg>
    </div>
  );
});

export default PatternPanel;