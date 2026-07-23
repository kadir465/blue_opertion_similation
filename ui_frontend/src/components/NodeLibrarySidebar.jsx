import React, { useState, useEffect } from 'react';
import { toolsData } from '../data/toolsData';

export default function NodeLibrarySidebar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({
    "Portal Nesneleri": true,
    "Operatörler": false,
    "Matematik": false,
    "Aksiyonlar": false,
  });
  const [hoveredTool, setHoveredTool] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });

  // Handle search and auto-expansion
  const filteredTools = toolsData.filter(tool => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      tool.name.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query)
    );
  });

  // Determine which categories have matches
  const categoriesWithMatches = Array.from(
    new Set(filteredTools.map(t => t.category))
  );

  // Auto-expand categories with matches when searching
  useEffect(() => {
    if (searchQuery.trim() !== '') {
      const newExpanded = {};
      ["Portal Nesneleri", "Operatörler", "Matematik", "Aksiyonlar"].forEach(cat => {
        newExpanded[cat] = categoriesWithMatches.includes(cat);
      });
      setExpandedCategories(newExpanded);
    }
  }, [searchQuery]);

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Icon mapping based on category
  const getCategoryIcon = (category) => {
    switch (category) {
      case "Portal Nesneleri":
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#3699ff' }}>
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        );
      case "Operatörler":
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#a855f7' }}>
            <circle cx="6" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="12" r="3" />
            <line x1="9" y1="6" x2="15" y2="12" />
            <line x1="9" y1="18" x2="15" y2="12" />
          </svg>
        );
      case "Matematik":
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#50cd89' }}>
            <line x1="4" y1="9" x2="20" y2="9" />
            <line x1="4" y1="15" x2="20" y2="15" />
            <line x1="10" y1="3" x2="14" y2="21" />
          </svg>
        );
      case "Aksiyonlar":
        return (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#f1416c' }}>
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getToolIcon = (category) => {
    switch (category) {
      case "Portal Nesneleri":
        return (
          <svg viewBox="0 0 24 24" fill="#e3f2fd" stroke="#3699ff" strokeWidth="2" strokeLinejoin="round" width="20" height="20">
            <rect x="4" y="4" width="16" height="16" rx="2" />
            <line x1="8" y1="8" x2="16" y2="8" stroke="#3699ff" />
            <line x1="8" y1="12" x2="14" y2="12" stroke="#3699ff" />
            <circle cx="16" cy="4" r="2" fill="#ef5350" stroke="none" />
          </svg>
        );
      case "Operatörler":
        return (
          <svg viewBox="0 0 24 24" fill="#f3e5f5" stroke="#a855f7" strokeWidth="2" strokeLinejoin="round" width="20" height="20">
            <polygon points="12 2 22 12 12 22 2 12" />
            <text x="12" y="15" fontSize="10" fontWeight="bold" textAnchor="middle" fill="#a855f7" stroke="none">OP</text>
          </svg>
        );
      case "Matematik":
        return (
          <svg viewBox="0 0 24 24" fill="#e8f5e9" stroke="#50cd89" strokeWidth="2" strokeLinejoin="round" width="20" height="20">
            <circle cx="12" cy="12" r="9" />
            <path d="M9 12h6M12 9v6" stroke="#50cd89" />
          </svg>
        );
      case "Aksiyonlar":
        return (
          <svg viewBox="0 0 24 24" fill="#ffebee" stroke="#f1416c" strokeWidth="2" strokeLinejoin="round" width="20" height="20">
            <polygon points="12 2 2 22 22 22" />
            <path d="M12 17v-4M12 9h.01" stroke="#f1416c" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      default:
        return null;
    }
  };

  const handleDragStart = (e, tool) => {
    e.dataTransfer.setData("application/reactflow-node", JSON.stringify(tool));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleMouseEnter = (tool, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredTool(tool);
    // Align with the right side of the sidebar, considering it has a fixed width (300px)
    setTooltipPos({
      top: rect.top,
      left: rect.right + 8
    });
  };

  const handleMouseLeave = () => {
    setHoveredTool(null);
  };

  const categories = ["Portal Nesneleri", "Operatörler", "Matematik", "Aksiyonlar"];

  return (
    <div className="node-library-sidebar">
      {/* Sticky Search Header */}
      <div className="node-library-search-container">
        <div className="node-library-search-wrapper">
          <svg className="node-library-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input 
            type="text" 
            placeholder="Element tipini yazınız" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="node-library-search-input"
          />
          {searchQuery && (
            <button className="node-library-search-clear" onClick={() => setSearchQuery('')}>
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Collapsible Accordion Categories */}
      <div className="node-library-categories">
        {categories.map(catName => {
          const categoryTools = filteredTools.filter(t => t.category === catName);
          const isExpanded = expandedCategories[catName];
          
          if (searchQuery.trim() !== '' && categoryTools.length === 0) {
            return null;
          }

          return (
            <div key={catName} className="node-library-category-group">
              <div 
                className="node-library-category-header"
                onClick={() => toggleCategory(catName)}
              >
                <div className="node-library-category-header-left">
                  {/* Caret indicating expanded/collapsed state */}
                  <svg 
                    className={`node-library-caret ${isExpanded ? 'expanded' : ''}`} 
                    viewBox="0 0 24 24" 
                    width="12" 
                    height="12" 
                    fill="currentColor"
                  >
                    <polygon points="6,9 12,15 18,9" />
                  </svg>
                  {getCategoryIcon(catName)}
                  <span className="node-library-category-title-text">{catName}</span>
                </div>
                <span className="node-library-category-count">
                  {categoryTools.length}
                </span>
              </div>

              {isExpanded && (
                <div className="node-library-node-list">
                  {categoryTools.length === 0 ? (
                    <div className="node-library-empty-category">
                      Eşleşen öğe bulunamadı
                    </div>
                  ) : (
                    categoryTools.map(tool => (
                      <div 
                        key={tool.id} 
                        className="node-library-node-item"
                        draggable
                        onDragStart={(e) => handleDragStart(e, tool)}
                        onMouseEnter={(e) => handleMouseEnter(tool, e)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <div className="node-library-node-icon">
                          {getToolIcon(catName)}
                        </div>
                        <div className="node-library-node-info">
                          <div className="node-library-node-title">{tool.name}</div>
                          <div className="node-library-node-desc">
                            {tool.description.length > 38 
                              ? tool.description.substring(0, 35) + '...' 
                              : tool.description
                            }
                          </div>
                        </div>
                        <div className="node-library-drag-handle">
                          <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                            <circle cx="9" cy="5" r="1.5" />
                            <circle cx="15" cy="5" r="1.5" />
                            <circle cx="9" cy="12" r="1.5" />
                            <circle cx="15" cy="12" r="1.5" />
                            <circle cx="9" cy="19" r="1.5" />
                            <circle cx="15" cy="19" r="1.5" />
                          </svg>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Custom Hover Tooltip */}
      {hoveredTool && (
        <div 
          className="node-library-tooltip" 
          style={{ 
            position: 'fixed',
            top: tooltipPos.top,
            left: tooltipPos.left,
            zIndex: 100000,
          }}
        >
          <div className="node-library-tooltip-arrow" />
          <div className="node-library-tooltip-header">
            {getCategoryIcon(hoveredTool.category)}
            <span>{hoveredTool.name}</span>
          </div>
          <div className="node-library-tooltip-body">
            {hoveredTool.description}
          </div>
          <div className="node-library-tooltip-footer">
            Sürükleyip çalışma alanına bırakın
          </div>
        </div>
      )}
    </div>
  );
}
