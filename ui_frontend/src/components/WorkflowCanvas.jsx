import React, { useState, useEffect, useRef } from 'react';
import blueBotTools from '../../../blue_bot_tools.json';

// Default canvas dimensions
const NODE_WIDTH = 200;

const normalizeName = (str) => {
  if (!str) return "";
  return str.toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .trim();
};

const areTypesCompatible = (outType, inType) => {
  if (!outType || !inType) return false;
  
  const t1 = outType.toLowerCase().trim();
  const t2 = inType.toLowerCase().trim();
  
  if (t1 === t2) return true;
  if (t1 === 'any' || t2 === 'any') return true;
  
  // Numeric compatibility
  const numericTypes = new Set(['float', 'integer', 'number', 'people_count', 'epoch_integer']);
  if (numericTypes.has(t1) && numericTypes.has(t2)) return true;
  
  // String/ID/Object compatibility
  const stringTypes = new Set(['string', 'device_uuid', 'building_id', 'datetime_string', 'datetime_object', 'workorder_enum']);
  if (stringTypes.has(t1) && stringTypes.has(t2)) return true;
  
  // Arrays compatibility
  const arrayTypes = new Set(['string_array', 'device_uuid_array', 'array']);
  if (arrayTypes.has(t1) && arrayTypes.has(t2)) return true;
  
  return false;
};

export default function WorkflowCanvas({ nodes, setNodes, connections, setConnections }) {

  // Dynamic premium toast alert helper
  const showToast = (message, type = "error") => {
    let container = document.getElementById("custom-toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "custom-toast-container";
      container.style.cssText = "position: fixed; bottom: 20px; right: 20px; z-index: 10000; display: flex; flex-direction: column; gap: 10px;";
      document.body.appendChild(container);
    }
    
    const toast = document.createElement("div");
    toast.innerText = message;
    const bgColor = type === "error" ? "#f1416c" : type === "info" ? "#009ef7" : "#50cd89";
    toast.style.cssText = `background: ${bgColor}; color: white; padding: 12px 20px; border-radius: 8px; font-size: 13px; font-weight: 500; box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: toastFadeIn 0.3s ease; min-width: 250px; text-align: left;`;
    
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  };

  // Connection validation logic (Type Compatibility Matrix)
  const validateConnection = (fromNodeId, fromPortIndex, toNodeId, toPortIndex) => {
    const sourceNode = nodes.find(n => n.id === fromNodeId);
    const targetNode = nodes.find(n => n.id === toNodeId);

    if (!sourceNode || !targetNode) return { valid: false };

    // Loop Check
    if (sourceNode.id === targetNode.id) {
      showToast("Bir araç kendi kendine bağlanamaz!", "error");
      return { valid: false };
    }

    const sourceTool = blueBotTools.find(t => normalizeName(t.name) === normalizeName(sourceNode.name));
    const targetTool = blueBotTools.find(t => normalizeName(t.name) === normalizeName(targetNode.name));

    const sourceOutputType = sourceTool && sourceTool.outputs && sourceTool.outputs[fromPortIndex]
      ? sourceTool.outputs[fromPortIndex].type
      : "any";
    const targetInputType = targetTool && targetTool.inputs && targetTool.inputs[toPortIndex]
      ? targetTool.inputs[toPortIndex].type
      : "any";

    // Connection validation using unified types compatibility
    if (areTypesCompatible(sourceOutputType, targetInputType)) {
      const isPerfect = sourceOutputType === targetInputType;
      const isAny = sourceOutputType === "any" || targetInputType === "any";
      const isNumeric = !isPerfect && !isAny && ["float", "integer", "number", "people_count", "epoch_integer"].includes(sourceOutputType);
      
      return { 
        valid: true, 
        colorClass: isPerfect ? "perfect" : isAny ? "any" : isNumeric ? "numeric" : "perfect" 
      };
    }

    // Strict Block
    showToast(`Tip Uyuşmazlığı: ${sourceOutputType} tipi ${targetInputType} girişine bağlanamaz!`, "error");

    const numericTypes = ["float", "integer", "number", "people_count", "epoch_integer"];
    if (sourceOutputType === "string" && numericTypes.includes(targetInputType)) {
      showToast("İpucu: Araya 'String to Integer/Float' dönüştürücü aracı eklemelisiniz.", "info");
    }

    return { valid: false };
  };

  // Canvas Viewport Pan & Zoom state
  const [pan, setPan] = useState({ x: 30, y: 10 });
  const [zoom, setZoom] = useState(0.85);

  // Selection state
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  // Dragging states
  const [draggedNodeId, setDraggedNodeId] = useState(null);
  const [dragStartOffset, setDragStartOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Wiring states
  const [activeConnection, setActiveConnection] = useState(null);

  const containerRef = useRef(null);

  // Keyboard listener to delete nodes and connections
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === "Delete" || e.key === "Backspace") && selectedNodeId) {
        if (document.activeElement.tagName === "INPUT") return;
        setNodes(prev => prev.filter(n => n.id !== selectedNodeId));
        setConnections(prev => prev.filter(c => c.fromId !== selectedNodeId && c.toId !== selectedNodeId));
        setSelectedNodeId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId]);

  // Visual delete button handler
  const deleteNode = (nodeId, e) => {
    e.stopPropagation();
    e.preventDefault();
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setConnections(prev => prev.filter(c => c.fromId !== nodeId && c.toId !== nodeId));
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
  };

  // Helper: Convert screen mouse coordinates into local Canvas coordinates
  const getCanvasCoords = (clientX, clientY) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const x = (clientX - rect.left - pan.x) / zoom;
    const y = (clientY - rect.top - pan.y) / zoom;
    return { x, y };
  };

  // Zooming Handler centered on mouse pointer
  const handleWheel = (e) => {
    e.preventDefault();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomIntensity = 0.08;
    const wheel = e.deltaY < 0 ? 1 : -1;
    const zoomFactor = Math.exp(wheel * zoomIntensity);
    const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.2), 2);

    const newPanX = mouseX - (mouseX - pan.x) * (newZoom / zoom);
    const newPanY = mouseY - (mouseY - pan.y) * (newZoom / zoom);

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  // Canvas MouseDown
  const handleCanvasMouseDown = (e) => {
    // If clicking directly on the canvas background, enable panning
    if (e.target.classList.contains('workflow-canvas-grid-bg') || e.target.classList.contains('workflow-canvas-container')) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      setSelectedNodeId(null);
    }
  };

  // Universal MouseMove
  const handleMouseMove = (e) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    } else if (draggedNodeId) {
      const coords = getCanvasCoords(e.clientX, e.clientY);
      setNodes(prev => prev.map(n => n.id === draggedNodeId ? {
        ...n,
        x: coords.x - dragStartOffset.x,
        y: coords.y - dragStartOffset.y
      } : n));
    } else if (activeConnection) {
      const coords = getCanvasCoords(e.clientX, e.clientY);
      setActiveConnection(prev => ({
        ...prev,
        currentX: coords.x,
        currentY: coords.y
      }));
    }
  };

  // Universal MouseUp
  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggedNodeId(null);
    setActiveConnection(null);
  };

  // Drag start on node header
  const handleNodeHeaderMouseDown = (nodeId, e) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedNodeId(nodeId);
    
    const coords = getCanvasCoords(e.clientX, e.clientY);
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      setDragStartOffset({
        x: coords.x - node.x,
        y: coords.y - node.y
      });
      setDraggedNodeId(nodeId);
    }
  };

  // Port position calculator relative to node coordinate
  const getPortPosition = (node, portType, portIndex = 0) => {
    const name = node.name;
    let nodeHeight = 60; // Fallback default height

    // Categorize heights for perfect wire centering
    if (name === "Draco Input" || name === "Digital Input" || name === "Dijital Giriş") {
      nodeHeight = 85;
      if (portType === "output") return { x: node.x + NODE_WIDTH, y: node.y + 44 };
    } else if (name === "And Gate" || name === "Or Gate" || name === "Nand Kapısı" || name === "Nor Kapısı" || name === "Karşılaştırıcı" || name === "Toplam" || name === "Çarpma" || name === "Çıkarma" || name === "Bölme") {
      nodeHeight = 72;
      if (portType === "input") {
        return { x: node.x, y: node.y + (portIndex === 0 ? 25 : 47) };
      }
      if (portType === "output") return { x: node.x + NODE_WIDTH, y: node.y + 36 };
    } else if (name === "Not Gate" || name === "Not Gate" || name.includes("Not") || name === "# Num/Bool" || name === "Bool seçici" || name === "Numerik Seçici" || name.includes("Dönüştürücü")) {
      nodeHeight = 60;
      if (portType === "input") return { x: node.x, y: node.y + 30 };
      if (portType === "output") return { x: node.x + NODE_WIDTH, y: node.y + 30 };
    } else if (name === "Draco Output" || name === "Draco Çıkış" || name === "Darco Çıkış" || name === "Draco Analog sot") {
      nodeHeight = 105;
      if (portType === "input") return { x: node.x, y: node.y + 52 };
    }

    // Standard Fallback
    if (portType === "input") return { x: node.x, y: node.y + nodeHeight / 2 };
    return { x: node.x + NODE_WIDTH, y: node.y + nodeHeight / 2 };
  };

  // Drag wire start from output handle
  const handleOutputPortMouseDown = (nodeId, portIndex, e) => {
    e.stopPropagation();
    e.preventDefault();
    const coords = getCanvasCoords(e.clientX, e.clientY);
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      const portPos = getPortPosition(node, "output", portIndex);
      setActiveConnection({
        fromNodeId: nodeId,
        fromPortIndex: portIndex,
        startX: portPos.x,
        startY: portPos.y,
        currentX: coords.x,
        currentY: coords.y
      });
    }
  };

  // MouseUp on input handle to establish a connection
  const handleInputPortMouseUp = (toNodeId, toPortIndex, e) => {
    e.stopPropagation();
    if (activeConnection && activeConnection.fromNodeId !== toNodeId) {
      // Validate type safety and loop errors via Guardrails
      const validation = validateConnection(
        activeConnection.fromNodeId,
        activeConnection.fromPortIndex,
        toNodeId,
        toPortIndex
      );

      if (!validation.valid) {
        setActiveConnection(null);
        return;
      }

      // Avoid duplicate connections to the same port
      setConnections(prev => {
        const filtered = prev.filter(c => c.toId === toNodeId && c.toPort === toPortIndex);
        if (filtered.length > 0) return prev; // already connected
        
        return [
          ...prev,
          {
            id: `conn-${Date.now()}`,
            fromId: activeConnection.fromNodeId,
            fromPort: activeConnection.fromPortIndex,
            toId: toNodeId,
            toPort: toPortIndex,
            colorClass: validation.colorClass
          }
        ];
      });
    }
    setActiveConnection(null);
  };

  // Node Drag and Drop from sidebar
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const dataStr = e.dataTransfer.getData("application/reactflow-node");
    if (!dataStr) return;
    const tool = JSON.parse(dataStr);
    
    const coords = getCanvasCoords(e.clientX, e.clientY);
    
    // Find actual tool ID from blueBotTools by normalizing and matching name
    const normalizedToolName = tool.name.toLowerCase()
      .replace(/ı/g, 'i')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .trim();
    const matchedTool = blueBotTools.find(t => {
      const tName = t.name.toLowerCase()
        .replace(/ı/g, 'i')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .trim();
      return tName === normalizedToolName;
    });
    const toolId = matchedTool ? matchedTool.id : tool.id;

    const newNode = {
      id: `node-${Date.now()}`,
      toolId: toolId,
      type: tool.category,
      name: tool.name,
      description: tool.description,
      x: coords.x - 100, // center relative to width
      y: coords.y - 30,  // center relative to height
      data: {
        point: tool.name.includes("Input") || tool.name.includes("Output") || tool.name.includes("Giriş") || tool.name.includes("Çıkış")
          ? (tool.name.includes("Draco") ? "Office Bacnet/ABS/region_1" : "Office bacnet/DI3/magnet_1")
          : "",
        setValue: tool.name.includes("Output") || tool.name.includes("Çıkış") ? "1" : ""
      }
    };
    setNodes(prev => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
  };

  // Node value editing handlers
  const handlePointChange = (nodeId, val) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, data: { ...n.data, point: val } } : n));
  };

  const handleSetChange = (nodeId, val) => {
    setNodes(prev => prev.map(n => n.id === nodeId ? { ...n, data: { ...n.data, setValue: val } } : n));
  };

  // Bezier curve calculations
  const calculateBezier = (x1, y1, x2, y2) => {
    const dx = Math.abs(x2 - x1) * 0.45;
    const offset = Math.max(dx, 45);
    return `M ${x1} ${y1} C ${x1 + offset} ${y1}, ${x2 - offset} ${y2}, ${x2} ${y2}`;
  };

  // Render Category Icon for headers
  const getHeaderIcon = (category) => {
    switch (category) {
      case "Portal Nesneleri":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="node-header-svg">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        );
      case "Operatörler":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="node-header-svg">
            <circle cx="6" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="12" r="3" />
            <line x1="9" y1="6" x2="15" y2="12" />
            <line x1="9" y1="18" x2="15" y2="12" />
          </svg>
        );
      case "Matematik":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="node-header-svg">
            <line x1="4" y1="9" x2="20" y2="9" />
            <line x1="4" y1="15" x2="20" y2="15" />
            <line x1="10" y1="3" x2="14" y2="21" />
          </svg>
        );
      case "Aksiyonlar":
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="node-header-svg">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="node-header-svg">
            <polygon points="12 2 2 22 22 22" />
          </svg>
        );
    }
  };

  return (
    <div 
      className="workflow-canvas-container"
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Blueprint Grid Background */}
      <div 
        className="workflow-canvas-grid-bg"
        style={{
          backgroundPosition: `${pan.x}px ${pan.y}px`,
          backgroundSize: `${30 * zoom}px ${30 * zoom}px`,
        }}
      />

      {/* Scaled/Panned workspace */}
      <div 
        className="workflow-canvas-viewport"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0'
        }}
      >
        {/* SVG Drawing Layer for Wires */}
        <svg className="workflow-canvas-svg-layer">
          {/* Active drag connection wire */}
          {activeConnection && (
            <path 
              d={calculateBezier(
                activeConnection.startX, 
                activeConnection.startY, 
                activeConnection.currentX, 
                activeConnection.currentY
              )}
              className="workflow-canvas-wire-active"
            />
          )}

          {/* Stored connections */}
          {connections.map(conn => {
            const fromNode = nodes.find(n => n.id === conn.fromId);
            const toNode = nodes.find(n => n.id === conn.toId);
            if (!fromNode || !toNode) return null;
            
            const start = getPortPosition(fromNode, "output", conn.fromPort);
            const end = getPortPosition(toNode, "input", conn.toPort);
            
            return (
              <path 
                key={conn.id}
                d={calculateBezier(start.x, start.y, end.x, end.y)}
                className={`workflow-canvas-wire ${conn.colorClass || ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  // Option: Delete wire on click
                  setConnections(prev => prev.filter(c => c.id !== conn.id));
                }}
              />
            );
          })}
        </svg>

        {/* Nodes Layer */}
        {nodes.map(node => {
          const isSelected = selectedNodeId === node.id;
          const matchedTool = blueBotTools.find(t => t.id === node.toolId || normalizeName(t.name) === normalizeName(node.name));
          const hasInput = node.name === "And Gate" || node.name === "Or Gate" || node.name === "Nand Kapısı" || node.name === "Nor Kapısı" || node.name === "Karşılaştırıcı" || node.name === "Toplam" || node.name === "Çarpma" || node.name === "Çıkarma" || node.name === "Bölme" || node.name === "Not Gate" || node.name === "Not Gate" || node.name.includes("Not") || node.name === "# Num/Bool" || node.name === "Bool seçici" || node.name === "Numerik Seçici" || node.name.includes("Dönüştürücü") || node.name.includes("Output") || node.name.includes("Çıkış") ||
            (matchedTool && matchedTool.inputs && matchedTool.inputs.some(i => i.connection === true));
          const hasOutput = !node.name.includes("Output") && !node.name.includes("Çıkış") && !node.name.includes("Gönder") && !node.name.includes("Set") && !node.name.includes("Kaptır") && !node.name.includes("Mail") && !node.name.includes("Telegram") && !node.name.includes("Slack") && !node.name.includes("Discord");
          const isDoubleInput = node.name === "And Gate" || node.name === "Or Gate" || node.name === "Nand Kapısı" || node.name === "Nor Kapısı" || node.name === "Karşılaştırıcı" || node.name === "Toplam" || node.name === "Çarpma" || node.name === "Çıkarma" || node.name === "Bölme";

          return (
            <div 
              key={node.id}
              className={`canvas-node-card ${isSelected ? 'selected' : ''}`}
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`,
                width: `${NODE_WIDTH}px`
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                setSelectedNodeId(node.id);
              }}
            >
              {/* Input Ports (Left) */}
              {hasInput && (
                <div className="ports-column-left">
                  {isDoubleInput ? (
                    <>
                      <div 
                        className="canvas-port input-port"
                        onMouseUp={(e) => handleInputPortMouseUp(node.id, 0, e)}
                        title="Giriş 1"
                      />
                      <div 
                        className="canvas-port input-port mt-4"
                        onMouseUp={(e) => handleInputPortMouseUp(node.id, 1, e)}
                        title="Giriş 2"
                      />
                    </>
                  ) : (
                    <div 
                      className="canvas-port input-port"
                      onMouseUp={(e) => handleInputPortMouseUp(node.id, 0, e)}
                      title="Giriş"
                    />
                  )}
                </div>
              )}

              {/* Output Port (Right) */}
              {hasOutput && (
                <div className="ports-column-right">
                  <div 
                    className="canvas-port output-port"
                    onMouseDown={(e) => handleOutputPortMouseDown(node.id, 0, e)}
                    title="Çıkış"
                  />
                </div>
              )}

              {/* Node Header */}
              <div 
                className="canvas-node-header"
                onMouseDown={(e) => handleNodeHeaderMouseDown(node.id, e)}
              >
                <div className="canvas-node-header-content">
                  {getHeaderIcon(node.type)}
                  <span className="canvas-node-title-text">{node.name}</span>
                </div>
                <button 
                  className="canvas-node-delete-btn"
                  onClick={(e) => deleteNode(node.id, e)}
                  title="Öğeyi Sil"
                  onMouseDown={(e) => e.stopPropagation()} // Prevent dragging when clicking delete
                >
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              {/* Node Body (Only render if has fields) */}
              {(node.name.includes("Input") || node.name.includes("Output") || node.name.includes("Giriş") || node.name.includes("Çıkış")) && (
                <div className="canvas-node-body">
                  {/* Point Input Field */}
                  {node.data.point !== undefined && (
                    <div className="node-body-field">
                      <label className="node-field-label">Point</label>
                      <input 
                        type="text"
                        value={node.data.point}
                        onChange={(e) => handlePointChange(node.id, e.target.value)}
                        className="node-field-input"
                        placeholder="Point path..."
                        onMouseDown={(e) => e.stopPropagation()} // stop parent dragging
                      />
                    </div>
                  )}

                  {/* Set value for Output nodes */}
                  {(node.name.includes("Output") || node.name.includes("Çıkış")) && (
                    <div className="node-body-field mt-1.5">
                      <label className="node-field-label">Set</label>
                      <input 
                        type="text"
                        value={node.data.setValue}
                        onChange={(e) => handleSetChange(node.id, e.target.value)}
                        className="node-field-input"
                        placeholder="Value..."
                        onMouseDown={(e) => e.stopPropagation()} // stop parent dragging
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Visual Canvas Info Indicator (Bottom-Right) */}
      <div className="canvas-zoom-indicator">
        Zoom: {Math.round(zoom * 100)}% | [Backspace/Delete] to remove
      </div>
    </div>
  );
}
