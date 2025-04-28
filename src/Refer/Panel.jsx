const PatternPanel1 = ({ 
    panels, // Keep existing panels prop for potential future use or remove if fully replaced
    onPanelsChange, 
    onPanelSelect, 
    panelIdCounter, 
    setPanelIdCounter,
    createNewPanel, // Receive helper function
    threeDViewRef // Receive ref for ThreeDViewPanel
  }) => {
    // Remove local panels state, use props instead
    // const [panels, setPanels] = useState([createNewPanel(1)]);
    const [selectedPanelId, setSelectedPanelId] = useState(null); // Updated logic below
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
  
    // Update selectedPanelId based on drawnPatterns
    React.useEffect(() => {
      if (!drawnPatterns.find(p => p.id === selectedPanelId) && drawnPatterns.length > 0) {
        setSelectedPanelId(drawnPatterns[0].id);
      }
      if (drawnPatterns.length === 0) {
        setSelectedPanelId(null);
      }
    }, [drawnPatterns, selectedPanelId]);
  
    // 选中板片并通知3D视图 (Update to use drawn pattern ID)
    const handlePanelClick = (panelId) => {
      setSelectedPanelId(panelId);
      if (onPanelSelect) onPanelSelect(panelId); // Notify 3D view if needed
    };
    
    const handleMouseMove = useCallback((e) => {
      // Disabled for generated panels
      // if (!dragVertex) return;
      const svgRect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - svgRect.left;
      const y = e.clientY - svgRect.top;
      // Use onPanelsChange to update state in App.jsx
      const updatedPanels = panels.map(panel => {
        if (panel.id !== dragVertex.panelId) return panel;
        const newVertices = panel.vertices.map((v, idx) => idx === dragVertex.vertexIdx ? { x, y } : v);
        return { ...panel, vertices: newVertices };
      });
      onPanelsChange(updatedPanels);
    }, [dragVertex, panels, onPanelsChange]); // Add dependencies
  
    const handleMouseUp = () => {
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
          setIsGeneratePanelEnabled(true);
        }
      }, 100);
    };
  
    // 生成板片按钮点击事件
    const handleGeneratePanel = async () => {
      setSpinningGenerate(true);
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
            const modelName = 'Jacket'; // TODO: 替换为动态获取模型名
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
                  message.error('SVG文件内容为空，无法解析');
                  return;
                }
                // 解析SVG内容
                const parser = new window.DOMParser();
                const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
                const pathNodes = Array.from(svgDoc.querySelectorAll('path'));
                if (pathNodes.length === 0) {
                  message.error('SVG中未找到path元素');
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
                if (parsedPatterns.length > 0) {
                  setSelectedPanelId(parsedPatterns[0].id);
                }
                message.success('SVG板片生成成功');
              })
              .catch(err => {
                console.error('[调试] SVG文件读取或解析异常:', err);
                message.error('SVG文件读取失败: ' + err.message);
              });
          } catch (error) {
            console.error('[调试] 外层异常:', error);
          }
        }
      }, 100);
    };
  
    // 渲染生成的板片
    const renderGeneratedPanels = () => (
      drawnPatterns.map((pattern, idx) => {
        const color = PANEL_COLORS[idx % PANEL_COLORS.length];
        const isSelected = pattern.id === selectedPanelId;
        return (
          <g key={pattern.id} onClick={() => handlePanelClick(pattern.id)} style={{ cursor: 'pointer' }}>
            {/* Main Outline */}
            <path 
              d={pattern.path}
              fill={isSelected ? `${color}40` : `${color}20`} // Lighter fill, slightly darker if selected
              stroke={isSelected ? '#1976d2' : color}
              strokeWidth={isSelected ? 2 : 1.5}
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
                strokeColor = isSelected ? '#1976d2' : '#aaa'; // Grey for base lines
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
            {/* Add ID text if needed */}
             {/* <text x={center.x} y={center.y} ... /> */}
          </g>
        );
      })
    );
  
    // 监听全局鼠标事件 (Keep as is, but functionality is disabled)
    React.useEffect(() => {
      if (dragVertex) {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
        };
      }
    }, [dragVertex, handleMouseMove]);
  
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
            height: '92%', // Remove fixed height
            // maxHeight: '100%', // 移除maxHeight，防止受容器影响
            cursor: 'default' // Changed from grabbing
          }}
        >
          {renderGeneratedPanels()} {/* Render generated panels */}
          {/* {renderPanels()} */}{/* Keep or remove original renderPanels based on needs */}
        </svg>
      </div>
    );
  };
  