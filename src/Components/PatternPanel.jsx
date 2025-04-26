import React, { useState, useRef, useCallback } from 'react';
import { Button, Spin } from 'antd';

// 板片数据结构：包含唯一编号、顶点数组、边数组
function createNewPanel(id) {
  // 默认正方形
  return {
    id,
    vertices: [
      { x: 80, y: 80 },
      { x: 180, y: 80 },
      { x: 180, y: 180 },
      { x: 80, y: 180 }
    ],
    edges: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0]
    ]
  };
}

const PANEL_COLORS = ['#6ec1e4', '#f7b267', '#b5e48c', '#f28482', '#b5838d'];

const PatternPanel = ({ onPanelSelect }) => {
  const [panels, setPanels] = useState([createNewPanel(1)]);
  const [selectedPanelId, setSelectedPanelId] = useState(1);
  const [dragVertex, setDragVertex] = useState(null); // {panelId, vertexIdx}
  const svgRef = useRef(null);
  const [panelIdCounter, setPanelIdCounter] = useState(2);
  // 加载条相关状态
  const [spinning, setSpinning] = useState(false);
  const [percent, setPercent] = useState(0);

  // 选中板片并通知3D视图
  const handlePanelClick = (panelId) => {
    setSelectedPanelId(panelId);
    if (onPanelSelect) onPanelSelect(panelId);
  };

  // 拖动顶点
  const handleVertexMouseDown = (panelId, vertexIdx, e) => {
    e.stopPropagation();
    setDragVertex({ panelId, vertexIdx });
  };

  const handleMouseMove = useCallback((e) => {
    if (!dragVertex) return;
    const svgRect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - svgRect.left;
    const y = e.clientY - svgRect.top;
    setPanels((prev) => prev.map(panel => {
      if (panel.id !== dragVertex.panelId) return panel;
      const newVertices = panel.vertices.map((v, idx) => idx === dragVertex.vertexIdx ? { x, y } : v);
      return { ...panel, vertices: newVertices };
    }));
  }, [dragVertex]);

  const handleMouseUp = () => {
    setDragVertex(null);
  };

  // 添加新板片
  const handleAddPanel = () => {
    setPanels(prev => [...prev, createNewPanel(panelIdCounter)]);
    setSelectedPanelId(panelIdCounter);
    setPanelIdCounter(prev => prev + 1);
  };

  // 删除当前板片
  const handleDeletePanel = () => {
    if (panels.length <= 1) return;
    setPanels(prev => prev.filter(p => p.id !== selectedPanelId));
    setSelectedPanelId(panels[0].id);
  };

  // 生成板片按钮点击事件
  const handleGeneratePanel = () => {
    setSpinning(true);
    let ptg = -10;
    const interval = setInterval(() => {
      ptg += 5;
      setPercent(ptg);
      if (ptg > 120) {
        clearInterval(interval);
        setSpinning(false);
        setPercent(0);
      }
    }, 100);
  };

  // 渲染板片
  const renderPanels = () => (
    panels.map((panel, idx) => {
      const color = PANEL_COLORS[idx % PANEL_COLORS.length];
      // 边
      const edges = panel.edges.map(([from, to], i) => (
        <line
          key={i}
          x1={panel.vertices[from].x}
          y1={panel.vertices[from].y}
          x2={panel.vertices[to].x}
          y2={panel.vertices[to].y}
          stroke={panel.id === selectedPanelId ? '#1976d2' : color}
          strokeWidth={panel.id === selectedPanelId ? 3 : 2}
          style={{ cursor: 'pointer' }}
          onClick={() => handlePanelClick(panel.id)}
        />
      ));
      // 顶点
      const vertices = panel.vertices.map((v, i) => (
        <circle
          key={i}
          cx={v.x}
          cy={v.y}
          r={7}
          fill={panel.id === selectedPanelId ? '#1976d2' : color}
          stroke="#fff"
          strokeWidth={2}
          style={{ cursor: 'pointer' }}
          onMouseDown={(e) => handleVertexMouseDown(panel.id, i, e)}
        />
      ));
      // 板片编号
      const center = panel.vertices.reduce((acc, v) => ({ x: acc.x + v.x, y: acc.y + v.y }), { x: 0, y: 0 });
      center.x /= panel.vertices.length;
      center.y /= panel.vertices.length;
      return (
        <g key={panel.id}>
          {edges}
          {vertices}
          <text x={center.x} y={center.y} fontSize="18" fill="#333" textAnchor="middle" alignmentBaseline="middle" style={{ pointerEvents: 'none', fontWeight: 'bold' }}>{panel.id}</text>
        </g>
      );
    })
  );

  // 监听全局鼠标事件
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
        <Button type="primary" onClick={handleGeneratePanel}>Generate Panel</Button>
      </div>
      {/* 加载条特效 */}
      <Spin spinning={spinning} percent={percent} fullscreen />
      {/* 板片编辑区 */}
      <svg ref={svgRef} width="100%" height="400" style={{ border: '1px solid #eee', background: '#fafafa', width: '100%', height: 400, cursor: dragVertex ? 'grabbing' : 'default' }}>
        {renderPanels()}
      </svg>
      <div style={{ marginTop: 12 }}>
        <b>板片列表：</b>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {panels.map(panel => (
            <li key={panel.id} style={{ padding: '4px 0', cursor: 'pointer', color: panel.id === selectedPanelId ? '#1976d2' : '#333', fontWeight: panel.id === selectedPanelId ? 'bold' : 'normal' }} onClick={() => handlePanelClick(panel.id)}>
              板片 #{panel.id}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PatternPanel;