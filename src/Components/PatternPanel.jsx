import React from 'react';

const PatternPanel = () => {
  // Placeholder content - add actual pattern elements and interaction logic later
  const patterns = ['Pattern 1', 'Pattern 2', 'Pattern 3'];

  const handlePatternClick = (patternName) => {
    console.log(`Clicked on ${patternName}. Highlight corresponding part in 3D view.`);
    // Add logic to communicate with the 3D view panel for highlighting
  };

  return (
    <div style={{ flex: 1, maxWidth: '30%', background: '#fff', borderLeft: '1px solid #f0f0f0', padding: '10px', overflowY: 'auto', height: '100%' }}>
      <h4>Pattern Panel</h4>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {patterns.map((pattern, index) => (
          <li 
            key={index} 
            onClick={() => handlePatternClick(pattern)}
            style={{ padding: '8px', borderBottom: '1px solid #eee', cursor: 'pointer' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {pattern}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PatternPanel;