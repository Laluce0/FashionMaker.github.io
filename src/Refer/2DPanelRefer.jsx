import React, { useState, useEffect } from 'react';
import { Stage, Layer, Path, Text, Group } from 'react-konva';

const SvgDesigner = () => {
  const [shapes, setShapes] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  // 加载并解析SVG文件
  useEffect(() => {
    const loadSvg = async () => {
      try {
        const response = await fetch('/sample.svg');
        const svgText = await response.text();
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
        
        const paths = Array.from(svgDoc.querySelectorAll('path'));
        const parsedShapes = paths.map((path, index) => ({
          id: index + 1,
          data: path.getAttribute('d'),
          stroke: path.getAttribute('stroke') || '#000000',
          fill: path.getAttribute('fill') || 'transparent',
          x: 0,
          y: 0
        }));
        
        setShapes(parsedShapes);
      } catch (error) {
        console.error('Error loading SVG:', error);
      }
    };

    loadSvg();
  }, []);

  // 钢笔工具绘图逻辑
  const handleMouseDown = (e) => {
    if (e.evt.button !== 0) return; // 只响应左键
    
    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();
    setCurrentPath(`M${pos.x},${pos.y}`);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;
    
    const pos = e.target.getStage().getPointerPosition();
    setCurrentPath(prev => `${prev} L${pos.x},${pos.y}`);
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    if (currentPath.length > 1) {
      setShapes(prev => [
        ...prev,
        {
          id: prev.length + 1,
          data: currentPath,
          stroke: '#000000',
          fill: 'transparent',
          x: 0,
          y: 0
        }
      ]);
      setCurrentPath('');
    }
  };

  // 计算路径中心点
  const getPathCenter = (pathData) => {
    const points = [];
    const commands = pathData.split(/[A-Z]/).filter(Boolean);
    
    commands.forEach(cmd => {
      const coords = cmd.split(/[,\s]+/).filter(Boolean);
      for (let i = 0; i < coords.length; i += 2) {
        if (coords[i] && coords[i+1]) {
          points.push({
            x: parseFloat(coords[i]),
            y: parseFloat(coords[i+1])
          });
        }
      }
    });

    const avgX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const avgY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
    
    return isNaN(avgX) || isNaN(avgY) 
      ? { x: 0, y: 0 } 
      : { x: avgX, y: avgY };
  };

  return (
    <div style={{ margin: 20 }}>
      <h1>SVG 2D设计器</h1>
      <div style={{ border: '1px solid #ccc', display: 'inline-block' }}>
        <Stage
          width={800}
          height={600}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <Layer>
            {/* 当前正在绘制的路径 */}
            {isDrawing && (
              <Path
                data={currentPath}
                stroke="#3498db"
                strokeWidth={2}
                fill="transparent"
              />
            )}

            {/* 已创建的图形 */}
            {shapes.map(shape => {
              const center = getPathCenter(shape.data);
              return (
                <Group
                  key={shape.id}
                  x={shape.x}
                  y={shape.y}
                  draggable
                  onDragEnd={(e) => {
                    setShapes(shapes.map(s => 
                      s.id === shape.id 
                        ? { ...s, x: e.target.x(), y: e.target.y() } 
                        : s
                    ));
                  }}
                  onClick={() => setSelectedId(shape.id)}
                >
                  <Path
                    data={shape.data}
                    stroke={selectedId === shape.id ? '#e74c3c' : shape.stroke}
                    fill={shape.fill}
                    strokeWidth={selectedId === shape.id ? 3 : 2}
                  />
                  <Text
                    text={String(shape.id)}
                    fontSize={16}
                    fill="#000"
                    x={center.x - 8}
                    y={center.y - 8}
                  />
                </Group>
              );
            })}
          </Layer>
        </Stage>
      </div>
      
      <div style={{ marginTop: 20 }}>
        <p>图形数量: {shapes.length}</p>
        <p>当前选中: {selectedId || '无'}</p>
        <button onClick={() => setShapes([])}>清空画布</button>
      </div>
    </div>
  );
};

export default SvgDesigner;