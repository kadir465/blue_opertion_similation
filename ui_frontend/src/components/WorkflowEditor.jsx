import React, { useState, useRef, useEffect } from 'react';
import NodeLibrarySidebar from './NodeLibrarySidebar';
import WorkflowCanvas from './WorkflowCanvas';
import blueBotTools from '../../../blue_bot_tools.json';

export default function WorkflowEditor({ onNavigate }) {
  // ─── Lifted Canvas States ──────────────────────────────────────────────────
  const [nodes, setNodes] = useState([]);
  const [connections, setConnections] = useState([]);

  // ─── AI Copilot States ─────────────────────────────────────────────────────
  const [inputText, setInputText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeFiltersInfo, setActiveFiltersInfo] = useState('');
  const [userGoal, setUserGoal] = useState('');
  const [activePlanId, setActivePlanId] = useState(null);
  const isAutoExecutingRef = useRef(false);
  // Unique per-editor-instance session id. Without this every browser
  // tab/user fell back to the backend's 'default_session' default and
  // ended up sharing one global conversation history — which meant an
  // unrelated earlier query could get silently blended into a later one
  // via the "Önceki Bağlam: ..." context-wrapping.
  const sessionIdRef = useRef(`session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);
  const [messages, setMessages] = useState([
    {
      id: 'm-sys',
      type: 'system',
      text: 'BlueBot Copilot hazır. Canvas boş. Başlamak için sol taraftan bir tetikleyici sürükleyin veya bana "Draco Input ekle", "And Gate ekle" veya "Araçları listele" gibi bir komut yazın.'
    }
  ]);

  const chatEndRef = useRef(null);

  // Auto-scroll chat area to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Dynamic silent copilot RAG step-by-step trigger on node/connection changes.
  // Fires on ANY change to nodes or connections (not just array length), since
  // filling in a parameter or wiring a connection changes the array's *content*
  // (new object references via setNodes(prev => prev.map(...))) without
  // changing its length — a length-only check would silently miss those steps
  // and the checklist would appear to "get stuck" after the first add_node.
  const triggerSilentCopilotUpdate = async (updatedNodes, updatedConnections) => {
    if (!userGoal || isAutoExecutingRef.current) return;
    try {
      const response = await fetch('http://localhost:5000/api/rag/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: userGoal, 
          nodes: updatedNodes, 
          connections: updatedConnections,
          plan_id: activePlanId,
          is_new_query: false,
          session_id: sessionIdRef.current
        }),
      });
      if (!response.ok) return;
      const data = await response.json();
      const { message, suggested_tool_id, suggested_tool, action_type, is_workflow_complete, chat_message, plan_id, parameter_name, connection_hint, is_full_checklist, target_node_id } = data;
      
      if (plan_id) {
        setActivePlanId(plan_id);
      }

      if (is_workflow_complete) {
        setActivePlanId(null);
        setUserGoal('');
      }

      // The checklist is a single, ever-updating message (stable id keyed to
      // the plan) rather than a new chat bubble every time something changes
      // on the canvas — the whole point is the user doesn't have to wait on
      // a fresh confirmation from the assistant after each action.
      const msgId = is_full_checklist && plan_id ? `checklist-${plan_id}` : `msg-reply-${Date.now()}`;
      const assistantMsg = {
        id: msgId,
        type: 'assistant',
        text: chat_message || message,
        chat_message: chat_message || message,
        action_type: action_type,
        suggested_tool_id: suggested_tool_id,
        suggested_tool: suggested_tool,
        is_workflow_complete: is_workflow_complete,
        parameter_name: parameter_name,
        target_node_id: target_node_id,
        connection_hint: connection_hint
      };
      setMessages(prev => {
        const existingIdx = prev.findIndex(m => m.id === msgId);
        if (existingIdx !== -1) {
          const next = [...prev];
          next[existingIdx] = assistantMsg;
          return next;
        }
        return [...prev, assistantMsg];
      });
    } catch (err) {
      console.error("[Silent Copilot Update] Error:", err);
    }
  };

  const userGoalRef = useRef(userGoal);
  useEffect(() => { userGoalRef.current = userGoal; }, [userGoal]);

  const isFirstRenderRef = useRef(true);
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }
    // Only real canvas edits (nodes/connections) should trigger a silent
    // update — submitting a new chat message already triggers its own
    // explicit request in handleSend(). Watching userGoal here too caused a
    // second, redundant request to fire in a race against handleSend's own
    // fetch (before activePlanId was set), which the backend then treated
    // as a brand new plan — producing two different plan_ids for one query.
    if (userGoalRef.current) {
      triggerSilentCopilotUpdate(nodes, connections);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, connections]);

  const clearMessageAction = (msgId) => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, action_type: null, suggested_tool: null, connection_hint: null } : m));
  };

  const handleAutoAddNode = (tool) => {
    isAutoExecutingRef.current = true;
    const newNode = {
      id: `node-${Date.now()}`,
      toolId: tool.id,
      type: tool.category || "Portal Nesneleri",
      name: tool.name,
      description: tool.description || `Copilot tarafından eklendi.`,
      x: 100 + nodes.length * 40,
      y: 120 + nodes.length * 40,
      data: {
        point: tool.name.includes("Input") || tool.name.includes("Output") || tool.name.includes("Giriş") || tool.name.includes("Çıkış")
          ? (tool.name.includes("Draco") ? "Office Bacnet/ABS/region_1" : "Office bacnet/DI3/magnet_1")
          : "",
        setValue: tool.name.includes("Output") || tool.name.includes("Çıkış") ? "1" : ""
      }
    };
    setNodes(prev => [...prev, newNode]);
    setTimeout(() => { isAutoExecutingRef.current = false; }, 100);
  };

  // ─── Configure Node Parameters from Chat ──────────────────────────────────
  // nodeId (when provided) targets one exact canvas node instance — this is
  // what makes it safe to have two nodes of the same tool_id (e.g. two
  // Karşılaştırıcı, one per condition) on canvas at once. Without it we fall
  // back to the old broad toolId match, for backward compatibility with any
  // caller that doesn't yet know the specific instance.
  const handleConfigureParameter = (toolId, paramName, value, nodeId) => {
    const normalize = (str) => str.toLowerCase()
      .replace(/ı/g, 'i')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .trim();

    const tool = blueBotTools.find(t => t.id === toolId);
    if (!tool) return;

    setNodes(prev => {
      const updated = prev.map(n => {
        const isTarget = nodeId ? n.id === nodeId : (n.toolId === toolId || normalize(n.name) === normalize(tool.name));
        if (isTarget) {
          const data = { ...n.data };
          if (paramName === 'nokta_id' || paramName === 'point' || paramName === 'filtre_kriteri') {
            data.point = value;
          } else if (paramName === 'setValue' || paramName === 'value' || paramName === 'limit' || paramName === 'esik') {
            data.setValue = value;
          } else {
            data[paramName] = value;
          }
          return { ...n, data };
        }
        return n;
      });

      // Trigger silent update to let backend know parameter is configured
      setTimeout(() => triggerSilentCopilotUpdate(updated), 50);
      return updated;
    });
  };

  // ─── Connect Nodes automatically from Chat ─────────────────────────────────
  // fromNodeId/toNodeId (from the backend's connection_hint, resolved via the
  // plan's instance map) pin the connection to the exact two canvas nodes
  // involved — necessary once there can be multiple nodes sharing a tool_id.
  const handleAutoConnectNodes = (fromToolId, toToolId, fromPortName, toPortName, fromNodeId, toNodeId) => {
    const normalize = (str) => str.toLowerCase()
      .replace(/ı/g, 'i')
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .trim();

    const fromTool = blueBotTools.find(t => t.id === fromToolId);
    const toTool = blueBotTools.find(t => t.id === toToolId);
    if (!fromTool || !toTool) return;

    const fromNode = fromNodeId
      ? nodes.find(n => n.id === fromNodeId)
      : nodes.find(n => n.toolId === fromToolId || normalize(n.name) === normalize(fromTool.name));
    const toNode = toNodeId
      ? nodes.find(n => n.id === toNodeId)
      : nodes.find(n => n.toolId === toToolId || normalize(n.name) === normalize(toTool.name));

    if (!fromNode || !toNode) {
      alert("Bağlantı kurulacak düğümler canvas'ta bulunamadı!");
      return;
    }

    // Resolve port names to indices
    let fromPortIndex = 0;
    if (fromPortName && fromTool.outputs) {
      const idx = fromTool.outputs.findIndex(o => normalize(o.name) === normalize(fromPortName));
      if (idx !== -1) fromPortIndex = idx;
    }

    let toPortIndex = 0;
    if (toPortName && toTool.inputs) {
      const idx = toTool.inputs.findIndex(i => normalize(i.name) === normalize(toPortName));
      if (idx !== -1) toPortIndex = idx;
    }

    const newConn = {
      id: `conn-${Date.now()}`,
      fromId: fromNode.id,
      fromPort: fromPortIndex,
      toId: toNode.id,
      toPort: toPortIndex,
      colorClass: "perfect"
    };

    setConnections(prev => {
      const exists = prev.some(c => c.fromId === fromNode.id && c.toId === toNode.id && c.fromPort === fromPortIndex && c.toPort === toPortIndex);
      if (exists) return prev;

      const updated = [...prev, newConn];
      // Trigger silent update with nodes and updated connections
      setTimeout(() => triggerSilentCopilotUpdate(nodes, updated), 50);
      return updated;
    });
  };

  // ─── Copilot Action Engine ─────────────────────────────────────────────────
  const processAction = (action, keywords, category) => {
    const kwStr = (keywords || []).map(k => k.toLowerCase()).join(' ');

    if (action === 'add' || action === 'ekle') {
      let toolName = "Digital Input";
      let categoryGroup = "Portal Nesneleri";

      if (kwStr.includes('draco') && (kwStr.includes('giriş') || kwStr.includes('giris') || kwStr.includes('input'))) {
        toolName = "Draco Input";
      } else if (kwStr.includes('digital') && (kwStr.includes('giriş') || kwStr.includes('giris') || kwStr.includes('input'))) {
        toolName = "Digital Input";
      } else if (kwStr.includes('and') || kwStr.includes('ve')) {
        toolName = "And Gate";
        categoryGroup = "Operatörler";
      } else if (kwStr.includes('not') || kwStr.includes('değil') || kwStr.includes('degil')) {
        toolName = "Not Gate";
        categoryGroup = "Operatörler";
      } else if (kwStr.includes('output') || kwStr.includes('çıkış') || kwStr.includes('cikis') || kwStr.includes('draco çıkış')) {
        toolName = "Draco Output";
        categoryGroup = "Aksiyonlar";
      } else {
        if (kwStr.includes('giriş') || kwStr.includes('input')) {
          toolName = "Digital Input";
        } else if (kwStr.includes('çıkış') || kwStr.includes('output')) {
          toolName = "Draco Output";
          categoryGroup = "Aksiyonlar";
        }
      }

      const matchedTool = blueBotTools.find(t => {
        const normalize = (str) => str.toLowerCase().replace(/ı/g, 'i').replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's').replace(/ö/g, 'o').replace(/ç/g, 'c').trim();
        return normalize(t.name) === normalize(toolName);
      });
      const toolId = matchedTool ? matchedTool.id : null;

      const newNode = {
        id: `node-${Date.now()}`,
        toolId: toolId,
        type: categoryGroup,
        name: toolName,
        description: `Copilot tarafından '${categoryGroup}' kategorisinden eklendi.`,
        x: 80 + nodes.length * 35,
        y: 100 + nodes.length * 35,
        data: {
          point: toolName.includes("Input") || toolName.includes("Output") || toolName.includes("Giriş") || toolName.includes("Çıkış")
            ? (toolName.includes("Draco") ? "Office Bacnet/ABS/region_1" : "Office bacnet/DI3/magnet_1")
            : "",
          setValue: toolName.includes("Output") || toolName.includes("Çıkış") ? "1" : ""
        }
      };

      setNodes(prev => [...prev, newNode]);
      return `Canvas'a yeni bir **${toolName}** (${categoryGroup}) düğümü başarıyla ekledim.`;
    }

    if (action === 'list' || action === 'listele') {
      return `Kütüphanede bulunan kullanılabilir araçlar:\n• **Draco Input** (Portal Nesneleri)\n• **Digital Input** (Portal Nesneleri)\n• **And Gate** (Operatörler)\n• **Not Gate** (Operatörler)\n• **Draco Output** (Aksiyonlar)`;
    }

    if (action === 'start' || action === 'başlat') {
      return `İş akışı simülasyon motoru başlatıldı. Tüm bağlantı yolları aktif.`;
    }

    if (action === 'stop' || action === 'durdur') {
      return `İş akışı simülasyonu durduruldu.`;
    }

    return "Komutu aldım fakat yapılması gereken eylemi çözemedim. Lütfen 'ekle', 'listele' veya 'başlat' gibi eylemler içeren bir cümle yazın.";
  };

  // ─── Handle send message ───────────────────────────────────────────────────
  const handleSend = async () => {
    const text = inputText.trim();
    if (!text) return;

    setUserGoal(text);
    setActivePlanId(null); // Reset active plan ID on new query

    // Add user message to chat list
    const userMsg = { id: `msg-${Date.now()}`, type: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setAnalyzing(true);
    setActiveFiltersInfo('');

    try {
      // Call the Express backend's unified copilot endpoint
      const response = await fetch('http://localhost:5000/api/rag/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: text, 
          nodes: nodes, 
          connections: connections,
          is_new_query: true,
          session_id: sessionIdRef.current
        }),
      });

      if (!response.ok) {
        if (response.status === 422) {
          const errData = await response.json().catch(() => ({}));
          setMessages(prev => [
            ...prev,
            {
              id: `msg-err-422-${Date.now()}`,
              type: 'assistant',
              text: `Hata: ${errData.error || "İşlem için uygun adım bulunamadı."}`
            }
          ]);
          setAnalyzing(false);
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.status === 'warning') {
        setMessages(prev => [
          ...prev,
          {
            id: `msg-warn-${Date.now()}`,
            type: 'assistant',
            text: `Uyarı: ${data.message || "İlgili araç bulunamadı."}`
          }
        ]);
        setAnalyzing(false);
        return;
      }

      const { intent, message, metadata, is_workflow_complete, suggested_tool_id, suggested_tool, action_type, chat_message, plan_id, parameter_name, connection_hint, is_full_checklist, target_node_id } = data;

      if (plan_id) {
        setActivePlanId(plan_id);
      }

      // 1. Add assistant reply to message history
      const msgId = is_full_checklist && plan_id ? `checklist-${plan_id}` : `msg-reply-${Date.now()}`;
      setMessages(prev => [
        ...prev,
        {
          id: msgId,
          type: 'assistant',
          text: chat_message || message,
          chat_message: chat_message || message,
          action_type: action_type,
          suggested_tool_id: suggested_tool_id,
          suggested_tool: suggested_tool,
          is_workflow_complete: is_workflow_complete,
          parameter_name: parameter_name,
          target_node_id: target_node_id,
          connection_hint: connection_hint
        }
      ]);

      // 2. Display active entities search badge if present in metadata
      const filterLabels = [];
      if (metadata && metadata.category && metadata.category !== 'all' && metadata.category !== 'unknown') {
        filterLabels.push(`Kategori: ${metadata.category}`);
      }
      if (metadata && metadata.status && metadata.status !== 'all' && metadata.status !== 'unknown') {
        filterLabels.push(`Durum: ${metadata.status}`);
      }
      if (metadata && metadata.date_range && metadata.date_range !== 'all' && metadata.date_range !== 'unknown') {
        filterLabels.push(`Zaman: ${metadata.date_range}`);
      }

      if (filterLabels.length > 0) {
        setActiveFiltersInfo(`Niyet: ${intent} | Kriterler: ${filterLabels.join(', ')}`);
      }

      if (is_workflow_complete) {
        setMessages(prev => [
          ...prev,
          {
            id: `msg-complete-${Date.now()}`,
            type: 'system',
            text: 'Tebrikler! İş akışı başarıyla tamamlandı.'
          }
        ]);
      }

    } catch (err) {
      console.error('[AI Copilot] Connection Error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          type: 'assistant',
          text: 'Backend bağlantı hatası oluştu. Lütfen Node.js sunucusunun (port 5000) çalıştığından emin olun.'
        }
      ]);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="workflow-editor-container">
      {/* ─── Topbar ────────────────────────────────────────────────────────── */}
      <div className="workflow-topbar">
        <div className="workflow-topbar-left">
          <button className="workflow-btn-back" onClick={() => onNavigate && onNavigate('bluebot')}>
            <svg viewBox="0 0 24 24">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back
          </button>
          <div className="workflow-separator"></div>
          <div className="workflow-title">
            BlueBot Workflow Editor {nodes.length > 0 && <span className="workflow-nodes-badge">{nodes.length} Düğüm</span>}
          </div>
        </div>
        <div className="workflow-topbar-right">
          <button className="workflow-btn workflow-btn-debug" onClick={() => {
            // Simple validation alert
            if (nodes.length === 0) {
              alert("Canvas boş, debug edilecek düğüm bulunmuyor.");
              return;
            }
            
            // 1. Cycle Detection (Döngü Tespiti)
            const adj = {};
            for (const node of nodes) {
              adj[node.id] = [];
            }
            for (const conn of connections) {
              if (adj[conn.fromId]) {
                adj[conn.fromId].push(conn.toId);
              }
            }

            const visited = {};
            const recStack = {};

            function dfs(v) {
              if (!visited[v]) {
                visited[v] = true;
                recStack[v] = true;

                const neighbors = adj[v] || [];
                for (const neighbor of neighbors) {
                  if (!visited[neighbor] && dfs(neighbor)) {
                    return true;
                  } else if (recStack[neighbor]) {
                    return true;
                  }
                }
              }
              recStack[v] = false;
              return false;
            }

            let hasCycle = false;
            for (const node of nodes) {
              if (dfs(node.id)) {
                hasCycle = true;
                break;
              }
            }

            if (hasCycle) {
              alert("Hata: Sonsuz döngü tespit edildi! Lütfen geri besleme döngülerini kaldırın.");
              return;
            }

            alert("İş akışı başarıyla debug edildi. Herhangi bir döngü veya tip hatası bulunamadı.");
          }}>
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
            </svg>
            Debug
          </button>
          <button className="workflow-btn workflow-btn-save" onClick={async () => {
            try {
              const response = await fetch('http://localhost:5000/api/workflows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nodes, connections })
              });
              const data = await response.json();
              if (!response.ok) {
                alert(data.message || "İş akışı kaydedilirken bir hata oluştu.");
                return;
              }
              alert(data.message || "İş akışı başarıyla veritabanına kaydedildi.");
            } catch (err) {
              console.error("[Save Workflow] Error:", err);
              alert("Sunucuya bağlanılamadı. Node.js backend servisinin çalıştığından emin olun.");
            }
          }}>
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Kaydet
          </button>
        </div>
      </div>

      {/* ─── Unhandled Modal ─────────────────────────────────────────────── */}
      {showModal && (
        <div className="ai-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="ai-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ai-modal-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <h3>Sorgu Anlaşılamadı</h3>
            <p>Sorguyu tam anlayamadım, lütfen daha net belirtin. Model güven skoru eşik değerinin altında kaldı.</p>
            <button className="ai-btn-primary" onClick={() => setShowModal(false)}>Tamam</button>
          </div>
        </div>
      )}

      {/* ─── Main Editor Area ──────────────────────────────────────────────── */}
      <div className="workflow-main">
        {/* Left Sidebar */}
        <NodeLibrarySidebar />

        {/* Central Canvas */}
        <WorkflowCanvas 
          nodes={nodes}
          setNodes={setNodes}
          connections={connections}
          setConnections={setConnections}
        />

        {/* Right Sidebar: AI Copilot Panel */}
        <div className="workflow-copilot-panel">
          <div className="copilot-header">
            <svg className="copilot-header-icon" viewBox="0 0 24 24">
              <path d="M12 2a10 10 0 0 1 10 10v4a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-4a6 6 0 0 0-12 0v4a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-4a10 10 0 0 1 12-10z" />
              <circle cx="12" cy="14" r="2" fill="currentColor" />
            </svg>
            <div className="copilot-header-title">BlueBot Copilot</div>
          </div>
          
          <div className="copilot-chat-area">
            {messages.map(msg => (
              <div key={msg.id} className={`copilot-message ${msg.type}`}>
                {msg.type === 'system' && <strong>Sistem: </strong>}
                {msg.type === 'user' && <strong>Siz: </strong>}
                {msg.type === 'assistant' && <strong>Asistan: </strong>}
                {/* Parse simple markdown bold strings */}
                <span>
                  {(msg.chat_message || msg.text || '').split('**').map((chunk, idx) => 
                    idx % 2 === 1 ? <strong key={idx}>{chunk}</strong> : chunk
                  )}
                </span>
                
                {msg.action_type === 'add_node' && msg.suggested_tool && !msg.is_workflow_complete && (
                  <button 
                    className="add-suggestion-btn"
                    onClick={() => {
                      handleAutoAddNode(msg.suggested_tool);
                      clearMessageAction(msg.id);
                    }}
                    style={{
                      marginTop: '10px',
                      padding: '8px 12px',
                      backgroundColor: '#8950fc',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      display: 'block',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#7a42e5'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#8950fc'}
                  >
                    {msg.suggested_tool.name} Ekle
                  </button>
                )}

                {msg.action_type === 'configure_parameter' && msg.suggested_tool_id && (
                  <div className="configure-parameter-form" style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      placeholder={`${msg.parameter_name || 'Değer'} girin...`}
                      className="parameter-input"
                      id={`param-input-${msg.id}`}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '4px',
                        border: '1px solid #d4d4d8',
                        fontSize: '12px',
                        flexGrow: 1
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const val = e.target.value;
                          if (val) {
                            handleConfigureParameter(msg.suggested_tool_id, msg.parameter_name, val, msg.target_node_id);
                            clearMessageAction(msg.id);
                          }
                        }
                      }}
                    />
                    <button 
                      className="param-submit-btn"
                      onClick={() => {
                        const inputEl = document.getElementById(`param-input-${msg.id}`);
                        const value = inputEl ? inputEl.value : '';
                        if (value) {
                          handleConfigureParameter(msg.suggested_tool_id, msg.parameter_name, value, msg.target_node_id);
                          clearMessageAction(msg.id);
                        }
                      }}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Kaydet
                    </button>
                  </div>
                )}

                {msg.action_type === 'connect_nodes' && msg.connection_hint && (
                  <button 
                    className="connect-suggestion-btn"
                    onClick={() => {
                      handleAutoConnectNodes(
                        msg.connection_hint.from, 
                        msg.connection_hint.to,
                        msg.connection_hint.sourcePort,
                        msg.connection_hint.targetPort,
                        msg.connection_hint.from_node_id,
                        msg.connection_hint.to_node_id
                      );
                      clearMessageAction(msg.id);
                    }}
                    style={{
                      marginTop: '10px',
                      padding: '8px 12px',
                      backgroundColor: '#009ef7',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      display: 'block',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#0083cc'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#009ef7'}
                  >
                    Bağlantıyı Kur
                  </button>
                )}
              </div>
            ))}
            {analyzing && (
              <div className="copilot-message assistant analyzing">
                <span className="ai-spinner mr-2" style={{borderTopColor: '#8950fc'}}></span>
                Düşünülüyor...
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {activeFiltersInfo && (
            <div className="copilot-active-filter-banner" style={{
              background: '#f0e8ff',
              borderTop: '1px solid #e4d4ff',
              padding: '8px 16px',
              fontSize: '11px',
              fontWeight: '600',
              color: '#7239ea',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              <span>{activeFiltersInfo}</span>
            </div>
          )}
          
          <div className="copilot-input-area">
            <div className="copilot-input-wrapper">
              <input 
                type="text" 
                placeholder="Asistana ne yapmak istediğinizi yazın..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={analyzing}
              />
              <button 
                className="copilot-btn-send" 
                onClick={handleSend}
                disabled={analyzing || !inputText.trim()}
              >
                <svg viewBox="0 0 24 24">
                  <line x1="22" y1="2" x2="11" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
