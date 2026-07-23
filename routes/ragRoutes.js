import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractStems, buildKeywordIndexLocally } from './keyword_index.js';
import { findPath } from './graphBuilder.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const toolsPath = path.resolve(__dirname, '../blue_bot_tools.json');
let rawTools = [];
try {
  rawTools = JSON.parse(fs.readFileSync(toolsPath, 'utf-8'));
} catch (err) {
  console.error('[ragRoutes] Error reading blue_bot_tools.json:', err);
}

let toolKeywordIndex = null;
function getToolKeywordIndex() {
  if (!toolKeywordIndex) {
    toolKeywordIndex = buildKeywordIndexLocally(rawTools);
    console.log(`[ragRoutes] Computed keyword index locally for ${rawTools.length} tools.`);
  }
  return toolKeywordIndex;
}



// In-memory storage for active plans
const activePlans = new Map();
// In-memory storage for conversation memory (context buffer)
const userMemory = new Map();
const searchMemory = new Map();

const generatePlanId = () => {
  return 'plan-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
};

function getToolIdForNode(node) {
  if (!node) return null;
  if (node.toolId && rawTools.some(t => t.id === node.toolId)) {
    return node.toolId;
  }
  if (!node.name) return null;
  return resolveToolIdByName(node.name);
}

function resolveToolIdByName(toolName) {
  if (!toolName) return null;
  const normalize = (str) => str.toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/['"']/g, '')
    .trim();
  const normalizedSearch = normalize(toolName);
  
  // 1. Exact or ID Match
  let tool = rawTools.find(t => normalize(t.name) === normalizedSearch || normalize(t.id) === normalizedSearch);
  if (tool) return tool.id;

  // 2. Substring Match
  tool = rawTools.find(t => normalize(t.name).includes(normalizedSearch) || normalizedSearch.includes(normalize(t.name)));
  if (tool) return tool.id;

  // 3. Word overlap Match (if at least one main word matches)
  const searchWords = normalizedSearch.split(/\s+/).filter(w => w.length > 2);
  if (searchWords.length > 0) {
    tool = rawTools.find(t => {
      const toolNameNorm = normalize(t.name);
      return searchWords.some(word => toolNameNorm.includes(word));
    });
    if (tool) return tool.id;
  }

  return null;
}

function syncPlanWithCanvas(plan, canvasNodes, canvasConnections) {
  if (!plan.instanceNodeMap) plan.instanceNodeMap = {};

  // Every canvas node id already claimed by some instance_key in this plan.
  // A node can only ever satisfy ONE instance — this is what lets two
  // instances of the same tool_id (e.g. two Karşılaştırıcı for two
  // different conditions) be tracked independently instead of one add_node
  // step completing both / one configure_parameter step overwriting both.
  const claimedNodeIds = new Set(Object.values(plan.instanceNodeMap).filter(Boolean));

  for (const step of plan.steps) {
    if (step.status === 'completed') continue;

    if (step.type === 'add_node') {
      const instKey = step.instance_key;
      const claimedId = plan.instanceNodeMap[instKey];
      if (claimedId && canvasNodes.some(n => n.id === claimedId)) {
        step.status = 'completed';
        continue;
      }
      const candidate = canvasNodes.find(n => getToolIdForNode(n) === step.tool_id && !claimedNodeIds.has(n.id));
      if (candidate) {
        plan.instanceNodeMap[instKey] = candidate.id;
        claimedNodeIds.add(candidate.id);
        step.status = 'completed';
      }
    } else if (step.type === 'configure_parameter') {
      const claimedId = plan.instanceNodeMap[step.instance_key];
      const node = claimedId ? canvasNodes.find(n => n.id === claimedId) : null;
      if (node) {
        const hasPoint = node.data && node.data.point && node.data.point.trim() !== "";
        const hasSetValue = node.data && node.data.setValue && node.data.setValue.trim() !== "";

        const param = step.params && step.params[0] ? step.params[0] : 'point';
        if (param === 'nokta_id' || param === 'point' || param === 'filtre_kriteri') {
          if (hasPoint) step.status = 'completed';
        } else if (param === 'setValue' || param === 'value' || param === 'limit' || param === 'esik') {
          if (hasSetValue) step.status = 'completed';
        } else {
          if (hasPoint || hasSetValue || (node.data && node.data[param])) {
            step.status = 'completed';
          }
        }
      }
    } else if (step.type === 'connect_nodes') {
      const fromNodeId = plan.instanceNodeMap[step.from_instance];
      const toNodeId = plan.instanceNodeMap[step.to_instance];
      if (fromNodeId && toNodeId) {
        const connectionExists = canvasConnections.some(conn => conn.fromId === fromNodeId && conn.toId === toNodeId);
        if (connectionExists) {
          step.status = 'completed';
        }
      }
    }
  }
}

// Detects and builds a plan for compound conditions joined by 've' (AND) or
// 'veya' (OR) — e.g. "X 50'den fazlaysa VE Y 08:00-18:00 arasındaysa Z yap".
// Each clause gets its own start-tool (+ Karşılaştırıcı if it needs a
// numeric threshold), all wired through distinct instance_keys so two
// clauses can safely use the very same tool_id (two separate Karşılaştırıcı
// nodes, for example) without colliding. The per-clause boolean results are
// chained through And Gate / Or Gate tools (binary, so 3+ clauses cascade
// through multiple gates) and the final gate feeds the end tool's trigger.
// Returns: { rawSteps, warning, logic, clauseCount } on success,
//          { error: "..." } if a clause/action couldn't be resolved,
//          or null if the query has no 've'/'veya' compound logic at all
//          (caller should fall through to the normal single-condition path).
function buildMultiConditionSteps(query, rawTools, startTools, endTools, getMatchScore, expandStems, extractStems, hasNumericThresholdSignal, rawIndex, tieBreak) {
  const hasOr = /\bveya\b/i.test(query);
  const hasAnd = /\bve\b/i.test(query);
  const logic = hasOr ? 'OR' : (hasAnd ? 'AND' : null);
  if (!logic) return null;

  const triggerRegex = /\b(eğer|ise|iken|iken|olursa|olduğunda|olduğu\s+zaman|geçerse|aşarsa|düşerse|büyükse|küçükse|eşitse|fazlaysa|arasındaysa|açılırsa|kapanırsa|kapandığında|açıldığında|tetiklenirse|tetiklendiğinde|oluşursa|oluşmuşsa|oluştuğunda|varsa|yoksa|algılanırsa|algılandığında|gösteriyorsa|gösterdiğinde|değişirse|değiştiğinde|başlarsa|başladığında|biterse|bittiğinde|gelirse|geldiğinde|girerse|girdiğinde|çıkarsa|çıktığında|aktifse|pasifse|bağlanırsa|kesilirse|arızalanırsa|arızalandığında|yükselirse|düşürse|artarsa|azalırsa|kalırsa|kalıyorsa|devredeyse|duruyorsa|çalışıyorsa|çalışmıyorsa|işliyorsa|işlemiyorsa|kaplıysa|doluysa|boşsa|açıksa|kapalıysa|etkinse|devre\s*dışıysa|düşükse|yüksekse|sıcaksa|soğuksa|uzaksa|yakınsa|içindeyse|dışındaysa|aşıyorsa|geçiyorsa|altındaysa|üzerindeyse|üstündeyse)\b/gi;
  let lastMatch = null, m;
  while ((m = triggerRegex.exec(query)) !== null) lastMatch = m;
  if (!lastMatch) return null; // can't find condition/action boundary — let the single-condition path try (and clarify if needed)

  const conditionBlobEnd = lastMatch.index + lastMatch[0].length;
  const conditionBlob = query.slice(0, conditionBlobEnd).replace(/^\s*eğer\s+/i, '');
  const actionText = query.slice(conditionBlobEnd);

  const splitRegex = logic === 'OR' ? /\bveya\b/i : /\bve\b/i;
  const rawClauses = conditionBlob.split(splitRegex).map(s => s.trim()).filter(Boolean);
  if (rawClauses.length < 2) return null; // 've'/'veya' appeared but not as a real condition separator (e.g. only in the action text)

  const clausePlans = [];
  for (const clauseText of rawClauses) {
    const clauseStems = expandStems(extractStems(clauseText));
    
    // Score all start tools for this clause, keeping top-3 as alternatives
    const scored = startTools
      .map(tool => ({ tool, score: getMatchScore(tool, clauseStems) }))
      .filter(x => x.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return tieBreak(a.tool, b.tool, clauseText, rawIndex) === a.tool ? -1 : 1;
      });
    
    let bestClauseStart = scored[0]?.tool || null;
    let bestScore = scored[0]?.score || 0;
    let alternatives = scored.slice(1, 4).map(x => x.tool);
    
    let usedFallback = false;
    if ((!bestClauseStart || bestScore === 0) && hasNumericThresholdSignal(clauseText)) {
      const generic = rawTools.find(t => t.id === 'portal_box_uc_nokta');
      if (generic) { bestClauseStart = generic; bestScore = 0.01; usedFallback = true; alternatives = []; }
    }
    if (!bestClauseStart || bestScore === 0) {
      return { error: `'${clauseText}' koşulu için uygun bir sensör/veri kaynağı bulamadım. Bu koşulu biraz daha netleştirebilir misiniz (örn. hangi sensör/veri)?` };
    }

    const numMatch = clauseText.match(/(\d+)\s*(kişi|derece|%|yüzde)?/i);
    const clauseNum = numMatch ? Number(numMatch[1]) : null;
    let clauseOp = '>';
    if (/(düşerse|altına|altında|küçükse|küçüktür|altındaysa)/i.test(clauseText)) clauseOp = '<';
    else if (/(eşitse|eşittir)/i.test(clauseText)) clauseOp = '==';

    const startOutputs = bestClauseStart.outputs || [];
    const boolOutput = startOutputs.find(o => o.type === 'boolean');

    clausePlans.push({
      clauseText, startTool: bestClauseStart, usedFallback, alternatives,
      needsComparator: !boolOutput,
      boolOutputName: boolOutput ? boolOutput.name : null,
      startOutputName: (startOutputs[0] || {}).name,
      extractedNum: clauseNum, extractedOp: clauseOp
    });
  }

  // Dedup: if two clauses picked the same tool, try to assign the alternative
  // for the one with a lower raw score. This handles cases like "yangın dedektöründe
  // arıza varsa VEYA kamerada alarm oluşmuşsa" where both clauses score the same
  // Yangın Dedektörü first but Clause 2 clearly wants Kamera Alarmı.
  for (let i = 0; i < clausePlans.length; i++) {
    for (let j = i + 1; j < clausePlans.length; j++) {
      if (clausePlans[i].startTool.id === clausePlans[j].startTool.id) {
        // j loses — find an alternative for it that isn't already used
        const usedIds = new Set(clausePlans.map(cp => cp.startTool.id));
        const alt = clausePlans[j].alternatives.find(t => !usedIds.has(t.id));
        if (alt) {
          const altOutputs = alt.outputs || [];
          const altBoolOutput = altOutputs.find(o => o.type === 'boolean');
          clausePlans[j].startTool = alt;
          clausePlans[j].needsComparator = !altBoolOutput;
          clausePlans[j].boolOutputName = altBoolOutput ? altBoolOutput.name : null;
          clausePlans[j].startOutputName = (altOutputs[0] || {}).name;
        }
      }
    }
  }

  const fullQueryStems = expandStems(extractStems(query));
  const actionStemsLocal = expandStems(extractStems(actionText));
  let bestEndLocal = null, bestEndScoreLocal = 0;
  for (const tool of endTools) {
    let score = getMatchScore(tool, actionStemsLocal);
    if (score === 0) score = getMatchScore(tool, fullQueryStems);
    if (score > bestEndScoreLocal || 
       (score === bestEndScoreLocal && bestEndLocal && tieBreak(tool, bestEndLocal, query, rawIndex) === tool)) {
      bestEndScoreLocal = score;
      bestEndLocal = tool;
    }
  }
  if (!bestEndLocal || bestEndScoreLocal === 0) {
    return { error: `Eylem kısmını ('${actionText.trim()}') analiz edemedim. Lütfen hangi aksiyonu gerçekleştirmek istediğinizi belirtin.` };
  }

  const rawSteps = [];
  let instanceCounter = 0;

  function pushAddNode(tool, labelSuffix) {
    const instanceKey = `inst_${++instanceCounter}`;
    rawSteps.push({
      action: 'add_node', tool_name: tool.name, instance_key: instanceKey,
      label_suffix: labelSuffix || null,
      message: `Lütfen '${tool.name}'${labelSuffix ? ` (${labelSuffix})` : ''} aracını ekleyin.`
    });
    return instanceKey;
  }
  function pushSetValue(tool, instanceKey, paramName, val, labelSuffix) {
    rawSteps.push({
      action: 'set_value', tool_name: tool.name, instance_key: instanceKey,
      param_name: paramName, value: val,
      label_suffix: labelSuffix || null,
      message: `Lütfen '${tool.name}'${labelSuffix ? ` (${labelSuffix})` : ''} aracı için '${paramName}' parametresini ${val !== null ? `'${val}' olarak ` : ''}ayarlayın.`
    });
  }
  function pushConnect(fromInstance, toInstance, fromName, toName, sourcePort, targetPort, fromSuffix, toSuffix) {
    rawSteps.push({
      action: 'connect_nodes', source_tool: fromName, source_port: sourcePort,
      target_tool: toName, target_port: targetPort,
      from_instance: fromInstance, to_instance: toInstance,
      from_label_suffix: fromSuffix || null,
      to_label_suffix: toSuffix || null,
      message: `'${fromName}'${fromSuffix ? ` (${fromSuffix})` : ''} aracının '${sourcePort}' çıkışını '${toName}'${toSuffix ? ` (${toSuffix})` : ''} aracının '${targetPort}' girişine bağlayın.`
    });
  }

  const boolSources = [];
  let usedAnyFallback = false;

  clausePlans.forEach((cp, i) => {
    const suffix = `Koşul ${i + 1}`;
    if (cp.usedFallback) usedAnyFallback = true;
    const startInstance = pushAddNode(cp.startTool, suffix);
    (cp.startTool.inputs || []).forEach(input => {
      if (input.connection === false) pushSetValue(cp.startTool, startInstance, input.name, null, suffix);
    });

    if (cp.needsComparator) {
      const cmpTool = rawTools.find(t => t.id === 'operator_karsilastirici');
      const cmpInstance = pushAddNode(cmpTool, suffix);
      pushSetValue(cmpTool, cmpInstance, 'input_2', cp.extractedNum, suffix);
      pushSetValue(cmpTool, cmpInstance, 'operator', cp.extractedOp, suffix);
      pushConnect(startInstance, cmpInstance, cp.startTool.name, cmpTool.name, cp.startOutputName, 'input_1', suffix, suffix);
      boolSources.push({ instanceKey: cmpInstance, toolName: cmpTool.name, outputPort: 'output', labelSuffix: suffix });
    } else {
      boolSources.push({ instanceKey: startInstance, toolName: cp.startTool.name, outputPort: cp.boolOutputName, labelSuffix: suffix });
    }
  });

  const gateTool = rawTools.find(t => t.id === (logic === 'OR' ? 'operator_or_gate' : 'operator_and_gate'));
  let current = boolSources[0];
  for (let i = 1; i < boolSources.length; i++) {
    const gateSuffix = boolSources.length > 2 ? `Kapı ${i}` : null;
    const gateInstance = pushAddNode(gateTool, gateSuffix);
    pushConnect(current.instanceKey, gateInstance, current.toolName, gateTool.name, current.outputPort, 'input_1', current.labelSuffix, gateSuffix);
    pushConnect(boolSources[i].instanceKey, gateInstance, boolSources[i].toolName, gateTool.name, boolSources[i].outputPort, 'input_2', boolSources[i].labelSuffix, gateSuffix);
    current = { instanceKey: gateInstance, toolName: gateTool.name, outputPort: 'output', labelSuffix: gateSuffix };
  }

  const endInstance = pushAddNode(bestEndLocal, null);
  (bestEndLocal.inputs || []).forEach(input => {
    if (input.connection === false) pushSetValue(bestEndLocal, endInstance, input.name, null, null);
  });
  const triggerInput = (bestEndLocal.inputs || []).find(i => i.connection === true);
  if (triggerInput) {
    pushConnect(current.instanceKey, endInstance, current.toolName, bestEndLocal.name, current.outputPort, triggerInput.name, current.labelSuffix, null);
  }

  return {
    rawSteps,
    warning: usedAnyFallback
      ? "Bazı koşullar için kütüphanede özel bir sensör aracı bulunamadığından jenerik 'Box Uç Nokta' önerildi; ilgili 'nokta_id' değerlerini elle girmeniz gerekecek."
      : null,
    logic,
    clauseCount: clausePlans.length
  };
}

function stripToolsForLLM(foundTools) {
  return foundTools.map(tool => ({
    name: tool.name,
    inputs: (tool.inputs || []).map(i => i.name),
    outputs: (tool.outputs || []).map(o => o.name)
  }));
}

function buildFullChecklistMessage(plan, rawTools) {
  const firstPendingNo = (plan.steps.find(s => s.status === 'pending') || {}).step_no;
  const completedCount = plan.steps.filter(s => s.status === 'completed').length;

  const lines = plan.steps.map(step => {
    const statusTag = step.status === 'completed'
      ? '**[TAMAMLANDI]**'
      : (step.step_no === firstPendingNo ? '**[AKTİF]**' : '**[BEKLİYOR]**');
    return `${step.step_no}. ${statusTag} ${step.note}`;
  });

  const header = `### İş Akışı İlerleme Planı (${completedCount}/${plan.steps.length} Adım Tamamlandı)\n\n`;
  const footer = completedCount < plan.steps.length
    ? `\n\n---\n**İpucu:** Bu adımları dilediğiniz sırayla tamamlayabilirsiniz. Sol panelden sürükleyip bırakabilir veya aktif adımın yanındaki hızlı-ekle butonunu kullanabilirsiniz. Canvas güncellendikçe liste otomatik olarak takip edilecektir.`
    : `\n\n---\n**Tüm adımlar tamamlandı!** Çalışmanızı test edebilir ve sağ üstteki 'Kaydet' butonuna tıklayabilirsiniz.`;

  return header + lines.join('\n') + footer;
}

function validateLLMOutput(llmJson, allowedTools) {
  const validToolsNames = allowedTools.map(t => t.name);
  let safeSteps = [];

  const stepsList = llmJson.steps || [];
  for (let step of stepsList) {
    // 1. Araç adı gerçekten listemizde var mı?
    if (!validToolsNames.includes(step.tool_name)) {
      console.warn(`[Guardrail] LLM uydurma araç üretti, adım atlanıyor: ${step.tool_name}`);
      continue;
    }

    // 2. Bağlantı adımında hedef/kaynak araçlar listemizde var mı?
    if (step.action === 'connect_nodes') {
      if (!validToolsNames.includes(step.source_tool) || !validToolsNames.includes(step.target_tool)) {
        console.warn(`[Guardrail] LLM geçersiz bağlantı kurdu, atlanıyor: ${step.source_tool} -> ${step.target_tool}`);
        continue;
      }
    }

    // Kuralı geçen güvenli adımı listeye ekle
    safeSteps.push(step);
  }

  return {
    missing_tools_warning: llmJson.missing_tools_warning,
    thought_process: llmJson.thought_process,
    steps: safeSteps
  };
}

// ─── Unified Copilot Route ──────────────────────────────────────────────────
// Stateful Step-by-Step Plan-Based Pipeline
// ─────────────────────────────────────────────────────────────────────────────
router.post('/copilot', async (req, res) => {
  try {
    const { query, nodes, connections, plan_id, is_new_query, session_id = 'default_session' } = req.body;
    if (!query) {
      return res.status(400).json({ message: 'query parametresi gereklidir.' });
    }
    const canvasNodes = nodes || [];
    const canvasConnections = connections || [];

    let plan = null;
    let currentPlanId = plan_id;

    // Check if we can reuse an active plan
    if (currentPlanId && activePlans.has(currentPlanId) && !is_new_query) {
      plan = activePlans.get(currentPlanId);
      console.log(`[Copilot] Reusing active plan: ${currentPlanId} (${plan.steps.length} steps)`);
    }

    // Load session memory history (last 3 interactions = 6 messages)
    let history = userMemory.get(session_id) || [];

    // ═══════════════════════════════════════════════════════════════════════
    // PLAN EXECUTION PHASE: If plan exists, sync and suggest first pending step
    // ═══════════════════════════════════════════════════════════════════════
    if (plan) {
      syncPlanWithCanvas(plan, canvasNodes, canvasConnections);

      let firstPending = plan.steps.find(s => s.status === 'pending');

      if (firstPending) {
        // Deduplication Guard: if suggested too many times in a row, auto-complete
        // (prevents an infinite loop if the frontend keeps re-sending the same
        // canvas state for a step it can't detect as done)
        firstPending.suggestedCount = (firstPending.suggestedCount || 0) + 1;
        if (firstPending.suggestedCount > 3) {
          console.warn(`[Copilot Guard] Step ${firstPending.step_no} (${firstPending.tool_id}) auto-completed to prevent loop`);
          firstPending.status = 'completed';
          syncPlanWithCanvas(plan, canvasNodes, canvasConnections);
          firstPending = plan.steps.find(s => s.status === 'pending');
        }
      }

      const isComplete = !firstPending;
      const chatMessage = buildFullChecklistMessage(plan, rawTools);

      let suggestedTool = null;
      if (firstPending && firstPending.tool_id) {
        suggestedTool = rawTools.find(t => t.id === firstPending.tool_id) || null;
      }
      const instanceMap = plan.instanceNodeMap || {};
      const targetNodeId = firstPending && firstPending.instance_key ? (instanceMap[firstPending.instance_key] || null) : null;

      history.push({ role: "assistant", content: chatMessage });
      userMemory.set(session_id, history);

      return res.status(200).json({
        intent: plan.intent || "workflow_creation",
        message: chatMessage,
        metadata: {},
        is_workflow_complete: isComplete,
        is_full_checklist: true,
        suggested_tool_id: firstPending ? (firstPending.tool_id || null) : null,
        suggested_tool: suggestedTool,
        action_type: firstPending ? (firstPending.type || "add_node") : "none",
        parameter_name: firstPending && firstPending.params ? firstPending.params[0] : null,
        target_node_id: targetNodeId,
        connection_hint: firstPending && firstPending.type === 'connect_nodes' ? {
          from: firstPending.from, to: firstPending.to,
          sourcePort: firstPending.sourcePort, targetPort: firstPending.targetPort,
          from_node_id: instanceMap[firstPending.from_instance] || null,
          to_node_id: instanceMap[firstPending.to_instance] || null
        } : null,
        chat_message: chatMessage,
        plan_id: currentPlanId,
        steps: plan.steps
      });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PLAN GENERATION PHASE: No active plan or new query, generate a fresh plan
    // ═══════════════════════════════════════════════════════════════════════
    
    // Ensure we only append the user query if it's new or not already the last user message
    const lastMsg = history[history.length - 1];
    if (!lastMsg || lastMsg.role !== 'user' || lastMsg.content !== query) {
      history.push({ role: "user", content: query });
      if (history.length > 6) history = history.slice(-6);
      userMemory.set(session_id, history);
    }

    const userMessages = history.filter(h => h.role === 'user');
    const contextQuery = userMessages.length > 1 
        ? `Önceki Bağlam: ${userMessages.slice(0, -1).map(m => m.content).join(" | ")}. Yeni İstek: ${query}` 
        : query;

    console.log(`[Copilot] Generating new plan for query: "${contextQuery}"`);

    // Stage 1: Local keyword extraction and matching
    const localIndex = getToolKeywordIndex();
    
    // Curved synonyms expansion dictionary
    const EXPANSION_DICT = {
      // İnsan / Kişi
      "kalabalık": "insan sayısı",
      "kalabalik": "insan sayısı",
      "kisi": "insan sayısı",
      "kişi": "insan sayısı",
      "insan": "insan sayısı bölge",
      "ziyaretçi": "insan sayısı",
      "çalışan": "insan sayısı",
      "personel": "insan sayısı",
      // Bildirim / Haber
      "haber": "bildirim gönder",
      "mesaj": "bildirim gönder",
      "uyarı": "bildirim gönder",
      "uyari": "bildirim gönder",
      "alert": "bildirim gönder",
      "bildir": "bildirim gönder",
      // Arıza / Bozuk
      "bozuk": "cihaz arıza",
      "arızalı": "cihaz arıza",
      "arizali": "cihaz arıza",
      "arıza": "cihaz arıza",
      "ariza": "cihaz arıza",
      "hata": "cihaz arıza",
      "sorun": "cihaz arıza",
      // Sıcaklık
      "sıcak": "sıcaklık",
      "sicak": "sıcaklık",
      "soğuk": "sıcaklık derece",
      "soguk": "sıcaklık derece",
      "ısı": "sıcaklık",
      "isi": "sıcaklık",
      "derece": "sıcaklık karşılaştırıcı",
      // Yangın / Duman
      "yangın": "yangın dedektörü alarmı",
      "yangin": "yangın dedektörü alarmı",
      "duman": "yangın dedektörü alarmı",
      "alev": "yangın dedektörü alarmı",
      "yanıyor": "yangın dedektörü alarmı",
      "dedektör": "yangın dedektörü alarmı",
      "dedektoru": "yangın dedektörü alarmı",
      // Kamera / Görüntü
      "kamera": "kamera alarmı",
      "kamerası": "kamera alarmı",
      "kamerasın": "kamera alarmı",
      "görüntü": "kamera alarmı",
      "goruntu": "kamera alarmı",
      "cctv": "kamera alarmı",
      "izleme": "kamera alarmı",
      // Alarm / Güvenlik
      "alarm": "alarm kamera yangın dedektör",
      "güvenlik": "alarm dijital giriş",
      "guvenlik": "alarm dijital giriş",
      "acil": "alarm yangın",
      "tehlike": "alarm",
      "uyarısı": "alarm",
      // Kapı / Giriş / Çıkış
      "kapı": "dijital giriş açık kapalı",
      "kapi": "dijital giriş açık kapalı",
      "kapısı": "dijital giriş açık kapalı",
      "kapının": "dijital giriş açık kapalı",
      "kapıdan": "dijital giriş açık kapalı",
      "kapıda": "dijital giriş açık kapalı",
      "açılırsa": "dijital giriş boolean",
      "açıldı": "dijital giriş boolean",
      "açık": "dijital giriş boolean",
      "kapandı": "dijital giriş boolean",
      "kapalı": "dijital giriş boolean",
      "giriş": "dijital giriş",
      "giris": "dijital giriş",
      "çıkış": "dijital giriş",
      "cikis": "dijital giriş",
      // Hareket / Algı
      "hareket": "dijital giriş boolean algılandı",
      "algılandı": "dijital giriş boolean",
      "algılanır": "dijital giriş boolean",
      "tetiklen": "dijital giriş boolean tetikleyici",
      "tetiklenirse": "dijital giriş boolean tetikleyici",
      // İş emri
      "is": "iş emri",
      "iş": "iş emri",
      "görev": "iş emri",
      "gorev": "iş emri",
      "bakım": "iş emri arıza",
      "bakim": "iş emri arıza",
      "servis": "iş emri",
      "tamir": "iş emri arıza",
      "onar": "iş emri arıza",
      // Yer / Bölge
      "oda": "bölge",
      "odadak": "bölge",
      "odası": "bölge",
      "mutfak": "bölge",
      "koridor": "bölge",
      "bodrum": "bölge",
      "kat": "bölge bina",
      "bina": "bölge bina",
      "depo": "bölge bina envanter",
      "ambar": "bölge bina envanter",
      // Nem / Su
      "nem": "dijital giriş teknik sayı sensör",
      "ıslak": "dijital giriş boolean",
      "su": "dijital giriş teknik sayı",
      "sızıntı": "cihaz arıza dijital giriş boolean",
      // Enerji / Elektrik
      "elektrik": "dijital giriş teknik sayı",
      "voltaj": "teknik sayı değeri",
      "akım": "teknik sayı değeri",
      "güç": "teknik sayı değeri",
      "enerji": "teknik sayı değeri draco",
      "kwh": "teknik sayı değeri draco"
    };

    function expandStems(stems) {
      const expanded = new Set(stems);
      for (const stem of stems) {
        if (EXPANSION_DICT[stem]) {
          const addedStems = extractStems(EXPANSION_DICT[stem]);
          for (const val of addedStems) {
            expanded.add(val);
          }
        }
      }
      return expanded;
    }

    // Conjunction splitting logic (Adım 2)
    const conjMatch = query.match(/\b(eğer|ise|iken|olursa|olduğunda|geçerse|aşarsa|düşerse|büyükse|küçükse|eşitse|fazlaysa|arasındaysa|açılırsa|kapanırsa|kapandığında|açıldığında|tetiklenirse|tetiklendiğinde|oluşursa|oluşmuşsa|oluştuğunda|varsa|yoksa|algılanırsa|algılandığında|gösteriyorsa|gösterdiğinde|değişirse|değiştiğinde|başlarsa|başladığında|biterse|bittiğinde|gelirse|geldiğinde|girerse|girdiğinde|çıkarsa|çıktığında|aktifse|pasifse|bağlanırsa|kesilirse|arızalanırsa|arızalandığında|yükselirse|düşürse|artarsa|azalırsa|kalırsa|kalıyorsa|devredeyse|duruyorsa|çalışıyorsa|çalışmıyorsa|içindeyse|dışındaysa|aşıyorsa|geçiyorsa|altındaysa|üzerindeyse|üstündeyse)\b/i);
    let conditionStems, actionStems;
    if (conjMatch) {
      const splitIdx = conjMatch.index;
      const condText = query.slice(0, splitIdx + conjMatch[0].length);
      const actText = query.slice(splitIdx);
      conditionStems = expandStems(extractStems(condText));
      actionStems = expandStems(extractStems(actText));
    } else {
      const stems = expandStems(extractStems(query));
      conditionStems = stems;
      actionStems = stems;
    }
    
    const queryStems = expandStems(extractStems(query));

    // 2. Match Start Node and End Node (Adım 3)
    // JSON sırasını kaydet (tie-breaker kural 4 için)
    const rawIndex = {};
    rawTools.forEach((t, i) => { rawIndex[t.id] = i; });

    const startTools = rawTools.filter(t => t.role && t.role.includes('start'));
    const endTools = rawTools.filter(t => t.role && t.role.includes('end'));

    function getMatchScore(tool, queryStemsSet) {
      const toolStems = localIndex[tool.id] || new Set();
      const nameStems = extractStems(tool.name);
      
      let intersect = 0;
      for (const elem of toolStems) {
        if (queryStemsSet.has(elem)) {
          if (nameStems.has(elem)) {
            intersect += 2.0;
          } else {
            intersect += 1.0;
          }
        }
      }
      if (intersect === 0) return 0;
      const union = toolStems.size + queryStemsSet.size - (intersect / 1.5);
      return intersect + (intersect / union);
    }

    function tieBreak(toolA, toolB, query, rawIndex) {
      const normalize = (s) => s.toLowerCase()
        .replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s')
        .replace(/ö/g,'o').replace(/ç/g,'c').replace(/ı/g,'i');

      const q = normalize(query);

      // Kural 1: araç adı sorguda geçiyor mu?
      const aInQuery = q.includes(normalize(toolA.name));
      const bInQuery = q.includes(normalize(toolB.name));
      if (aInQuery && !bInQuery) return toolA;
      if (bInQuery && !aInQuery) return toolB;

      // Kural 2: ham stem eşleşmesi fazla olan
      const qStems = extractStems(query);
      const aStems = new Set([
        ...extractStems(toolA.name),
        ...(toolA.tags || []).flatMap(t => extractStems(t))
      ]);
      const bStems = new Set([
        ...extractStems(toolB.name),
        ...(toolB.tags || []).flatMap(t => extractStems(t))
      ]);
      let aRaw = 0, bRaw = 0;
      for (const s of qStems) {
        if (aStems.has(s)) aRaw++;
        if (bStems.has(s)) bRaw++;
      }
      if (aRaw !== bRaw) return aRaw > bRaw ? toolA : toolB;

      // Kural 3: tag sayısı az olan daha spesifik
      const aTagCount = (toolA.tags || []).length;
      const bTagCount = (toolB.tags || []).length;
      if (aTagCount !== bTagCount) return aTagCount < bTagCount ? toolA : toolB;

      // Kural 4: son çare — JSON sırası (rawIndex küçük olan)
      return rawIndex[toolA.id] < rawIndex[toolB.id] ? toolA : toolB;
    }

    // Generic sensor fallback needs to be visible to both the multi-condition
    // and single-condition paths, so it's declared once here (function
    // declarations are hoisted within this route handler's scope either way,
    // but keeping the definition point clear avoids confusion).
    function hasNumericThresholdSignal(text) {
      const hasNumber = /\d/.test(text);
      const hasUnitOrConj = /(derece|yüzde|%|geçerse|aşarsa|düşerse|büyükse|küçükse|altına|altında|eşitse|fazlaysa|aşıyorsa|geçiyorsa|altındaysa|üzerindeyse)/i.test(text);
      return hasNumber && hasUnitOrConj;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // COMPOUND CONDITION CHECK (VE / VEYA): if the query has multiple
    // conditions joined by 've'/'veya', build the whole multi-branch plan
    // (per-clause start tools + Karşılaştırıcı, chained through And/Or
    // gates) up front. Falls through to the single-condition path below
    // when there's no compound logic at all.
    // ═══════════════════════════════════════════════════════════════════════
    const multiResult = buildMultiConditionSteps(query, rawTools, startTools, endTools, getMatchScore, expandStems, extractStems, hasNumericThresholdSignal, rawIndex, tieBreak);
    if (multiResult && multiResult.error) {
      history.push({ role: "assistant", content: multiResult.error });
      userMemory.set(session_id, history);
      return res.status(200).json({
        intent: 'workflow_creation',
        message: multiResult.error,
        metadata: {},
        is_workflow_complete: false,
        suggested_tool_id: null,
        suggested_tool: null,
        action_type: "clarify",
        chat_message: multiResult.error,
        plan_id: null,
        steps: []
      });
    }

    let rawSteps;
    let pathMsg = null;

    if (!multiResult) {
    let bestStart = null;
    let bestStartScore = 0;
    for (const tool of startTools) {
      let score = getMatchScore(tool, conditionStems);
      if (score === 0 && conjMatch) {
        // Fallback to the whole query, but never let a start-tool match be
        // decided purely by words that belong exclusively to the action
        // side (e.g. 'çalıştır', 'kural' in '...aşarsa BlueBot kuralını
        // çalıştır') — that caused unrelated tools whose description just
        // happens to share an action-side word to be falsely selected.
        const safeFallbackStems = new Set([...queryStems].filter(s => conditionStems.has(s) || !actionStems.has(s)));
        score = getMatchScore(tool, safeFallbackStems);
      }
      if (score > bestStartScore || 
         (score === bestStartScore && bestStart && tieBreak(tool, bestStart, query, rawIndex) === tool)) {
        bestStartScore = score;
        bestStart = tool;
      }
    }

    let bestEnd = null;
    let bestEndScore = 0;
    for (const tool of endTools) {
      let score = getMatchScore(tool, actionStems);
      if (score === 0 && conjMatch) {
        const safeFallbackStems = new Set([...queryStems].filter(s => actionStems.has(s) || !conditionStems.has(s)));
        score = getMatchScore(tool, safeFallbackStems);
      }
      if (score > bestEndScore || 
         (score === bestEndScore && bestEnd && tieBreak(tool, bestEnd, query, rawIndex) === tool)) {
        bestEndScore = score;
        bestEnd = tool;
      }
    }

    // Generic sensor fallback (Bölüm 5 - Orta öncelikli madde):
    // Kütüphanede özel bir eşleşme bulunamayan sensör tipleri için (örn. "nem",
    // "sıcaklık" gibi kelimeler blue_bot_tools.json'da özel bir start-tool'a
    // karşılık gelmiyor), koşul metninde açık bir sayısal eşik sinyali
    // (sayı + "derece"/"%"/karşılaştırma bağlacı) varsa sistem zorla bir şey
    // seçmek yerine jenerik "Box Uç Nokta" aracına güvenli bir şekilde düşer.
    let usedGenericStartFallback = false;
    if ((!bestStart || bestStartScore === 0) && hasNumericThresholdSignal(query)) {
      const genericStart = rawTools.find(t => t.id === 'portal_box_uc_nokta');
      if (genericStart) {
        bestStart = genericStart;
        bestStartScore = 0.01; // non-zero marker, aşağıdaki zero-result kontrolünü geçmesi için
        usedGenericStartFallback = true;
        console.log(`[Copilot Fallback] No dedicated sensor tool matched query stems, falling back to generic '${genericStart.name}'.`);
      }
    }

    // Zero-Result Management:
    if (!bestStart || bestStartScore === 0) {
      const fallbackMsg = "İsteğinizdeki koşulu veya tetikleyici durumu tam olarak analiz edemedim. Lütfen hangi sensörü veya portal verisini (örn: insan sayısı, sıcaklık, arıza) kullanmak istediğinizi belirtin.";
      history.push({ role: "assistant", content: fallbackMsg });
      userMemory.set(session_id, history);
      return res.status(200).json({
        intent: 'workflow_creation',
        message: fallbackMsg,
        metadata: {},
        is_workflow_complete: false,
        suggested_tool_id: null,
        suggested_tool: null,
        action_type: "clarify",
        chat_message: fallbackMsg,
        plan_id: null,
        steps: []
      });
    }

    if (!bestEnd || bestEndScore === 0) {
      const fallbackMsg = "İsteğinizdeki eylemi analiz edemedim. Lütfen hangi aksiyonu (örn: mail gönderme, bildirim gönderme, cihaz çıkışı ayarlama) gerçekleştirmek istediğinizi belirtin.";
      history.push({ role: "assistant", content: fallbackMsg });
      userMemory.set(session_id, history);
      return res.status(200).json({
        intent: 'workflow_creation',
        message: fallbackMsg,
        metadata: {},
        is_workflow_complete: false,
        suggested_tool_id: null,
        suggested_tool: null,
        action_type: "clarify",
        chat_message: fallbackMsg,
        plan_id: null,
        steps: []
      });
    }

    console.log(`[Copilot Deterministic] Best Start: ${bestStart.name} (${bestStart.id}), Best End: ${bestEnd.name} (${bestEnd.id})`);

    // 3. BFS Path Finding (Adım 4)
    const pathResult = findPath(rawTools, bestStart.id, bestEnd.id);
    pathMsg = usedGenericStartFallback
      ? "Bu sensör tipi için kütüphanede özel bir araç bulunamadığından, jenerik 'Box Uç Nokta' aracı önerildi. Lütfen 'nokta_id' parametresini ilgili cihazın kimliğiyle elle doldurun."
      : null;
    let intermediateNodes = [];
    let pathConnections = [];

    if (pathResult) {
      intermediateNodes = pathResult.nodes;
      pathConnections = pathResult.connections;
    } else {
      const noPathMsg = "otomatik tetikleyici bağlantısı bulunamadı, manuel bağlantı gerekebilir.";
      pathMsg = pathMsg ? `${pathMsg}\n${noPathMsg}` : noPathMsg;
      console.warn(`[Copilot Graph] No path found between ${bestStart.id} and ${bestEnd.id}`);
    }

    // 4. Parameter Extraction and Plan Generation (Adım 5 & 6)
    const numMatch = query.match(/(\d+)\s*(kişi|derece|%|yüzde)?/i);
    const extractedNum = numMatch ? Number(numMatch[1]) : null;

    const pctMatch = query.match(/%\s*(\d+)|(\d+)\s*%/);
    const extractedPct = pctMatch ? Number(pctMatch[1] || pctMatch[2]) : null;

    let extractedOp = '>';
    if (query.match(/(düşerse|altına|altında|küçükse|küçüktür)/i)) {
      extractedOp = '<';
    } else if (query.match(/(eşitse|eşittir)/i)) {
      extractedOp = '==';
    }

    rawSteps = [];
    let instanceCounter = 0;
    const toolIdToInstance = {}; // last-created instance_key per tool_id, used to resolve connect_nodes targets in the single-condition (each-tool-used-once) path

    function addNodeStep(tool) {
      const instanceKey = `inst_${++instanceCounter}`;
      toolIdToInstance[tool.id] = instanceKey;

      rawSteps.push({
        action: 'add_node',
        tool_name: tool.name,
        instance_key: instanceKey,
        message: `Lütfen '${tool.name}' aracını ekleyin.`
      });

      if (tool.inputs && Array.isArray(tool.inputs)) {
        tool.inputs.forEach(input => {
          if (input.connection === false) {
            let val = null;
            if (tool.id === 'operator_karsilastirici') {
              if (input.name === 'input_2') val = extractedNum;
              if (input.name === 'operator') val = extractedOp;
            } else if (tool.id === 'math_yuzde') {
              if (input.name === 'yuzde_orani') val = extractedPct !== null ? extractedPct : extractedNum;
            } else if (tool.id === 'math_sabit') {
              if (input.name === 'input') val = extractedNum;
            } else if (tool.id === 'math_rastgele' || tool.id === 'math_menzil_yuzde') {
              if (input.name === 'min_deger') val = 0;
              if (input.name === 'max_deger') val = extractedNum || 100;
            }
            
            rawSteps.push({
              action: 'set_value',
              tool_name: tool.name,
              instance_key: instanceKey,
              param_name: input.name,
              value: val,
              message: `Lütfen '${tool.name}' aracı için '${input.name}' parametresini ${val !== null ? `'${val}' olarak` : ''} ayarlayın.`
            });
          }
        });
      }
      return instanceKey;
    }

    addNodeStep(bestStart);
    for (const node of intermediateNodes) {
      addNodeStep(node);
    }
    addNodeStep(bestEnd);

    pathConnections.forEach(conn => {
      const fromTool = rawTools.find(t => t.id === conn.from);
      const toTool = rawTools.find(t => t.id === conn.to);
      rawSteps.push({
        action: 'connect_nodes',
        source_tool: fromTool ? fromTool.name : conn.from,
        source_port: conn.sourcePort,
        target_tool: toTool ? toTool.name : conn.to,
        target_port: conn.targetPort,
        from_instance: toolIdToInstance[conn.from] || null,
        to_instance: toolIdToInstance[conn.to] || null,
        message: `'${fromTool ? fromTool.name : conn.from}' aracının '${conn.sourcePort}' çıkışını '${toTool ? toTool.name : conn.to}' aracının '${conn.targetPort}' girişine bağlayın.`
      });
    });

    } else {
      // Compound (VE/VEYA) condition — use the pre-built multi-branch steps.
      rawSteps = multiResult.rawSteps;
      pathMsg = multiResult.warning || null;
      console.log(`[Copilot Multi-Condition] Logic: ${multiResult.logic}, Clauses: ${multiResult.clauseCount}, Steps: ${rawSteps.length}`);
    }

    const steps = rawSteps.map((s, idx) => {
      const action = s.action || 'add_node';
      const type = action === 'set_value' ? 'configure_parameter' : action;
      const tool_id = resolveToolIdByName(s.tool_name);
      
      let note = s.message || '';
      if (pathMsg && idx === 0) {
        note = `UYARI: ${pathMsg}\n\n${note}`;
      }
      
      const params = s.param_name ? [s.param_name] : [];
      const from = resolveToolIdByName(s.source_tool) || null;
      const to = resolveToolIdByName(s.target_tool) || null;
      const sourcePort = s.source_port || null;
      const targetPort = s.target_port || null;
      
      return {
        step_no: idx + 1,
        type,
        tool_id,
        instance_key: s.instance_key || null,
        from_instance: s.from_instance || null,
        to_instance: s.to_instance || null,
        label_suffix: s.label_suffix || null,
        from_label_suffix: s.from_label_suffix || null,
        to_label_suffix: s.to_label_suffix || null,
        note,
        params,
        from,
        to,
        sourcePort,
        targetPort,
        value: s.value !== undefined ? s.value : null,
        status: 'pending'
      };
    });

    const newPlanId = generatePlanId();
    const initializedPlan = {
      plan_id: newPlanId,
      query: query,
      intent: 'workflow_creation',
      steps: steps
    };

    activePlans.set(newPlanId, initializedPlan);
    console.log(`[Copilot] Generated deterministic plan ${newPlanId} with ${steps.length} steps.`);

    syncPlanWithCanvas(initializedPlan, canvasNodes, canvasConnections);
    
    function generateStepMessage(step) {
      const tool = rawTools.find(t => t.id === step.tool_id);
      const name = tool ? tool.name : step.tool_id;
      const suffix = step.label_suffix ? ` (${step.label_suffix})` : '';
      if (step.type === 'add_node') {
        return `Şimdi '${name}'${suffix} aracını Canvas'a ekleyin.`;
      } else if (step.type === 'configure_parameter') {
        const pName = step.params[0] || 'parametre';
        return `'${name}'${suffix} aracı için '${pName}' değerini ${step.value !== null ? `'${step.value}' olarak ` : ''}ayarlayın.`;
      } else if (step.type === 'connect_nodes') {
        const fromTool = rawTools.find(t => t.id === step.from);
        const toTool = rawTools.find(t => t.id === step.to);
        const fromName = fromTool ? fromTool.name : step.from;
        const toName = toTool ? toTool.name : step.to;
        const fromSuffix = step.from_label_suffix ? ` (${step.from_label_suffix})` : '';
        const toSuffix = step.to_label_suffix ? ` (${step.to_label_suffix})` : '';
        return `'${fromName}'${fromSuffix} aracının '${step.sourcePort}' çıkışını '${toName}'${toSuffix} aracının '${step.targetPort}' girişine bağlayın.`;
      }
      return step.note;
    }

    initializedPlan.steps.forEach(s => {
      const generated = generateStepMessage(s);
      s.note = (pathMsg && s.step_no === 1) ? `UYARI: ${pathMsg}\n\n${generated}` : generated;
    });

    const firstPending = initializedPlan.steps.find(s => s.status === 'pending');
    const chatMessage = buildFullChecklistMessage(initializedPlan, rawTools);
    history.push({ role: 'assistant', content: chatMessage });
    userMemory.set(session_id, history);

    let suggestedTool = null;
    if (firstPending && firstPending.tool_id) {
      suggestedTool = rawTools.find(t => t.id === firstPending.tool_id) || null;
    }
    const instanceMap0 = initializedPlan.instanceNodeMap || {};
    const targetNodeId0 = firstPending && firstPending.instance_key ? (instanceMap0[firstPending.instance_key] || null) : null;

    return res.status(200).json({
      intent: 'workflow_creation',
      message: chatMessage,
      metadata: {},
      is_workflow_complete: !firstPending,
      is_full_checklist: true,
      suggested_tool_id: firstPending ? (firstPending.tool_id || null) : null,
      suggested_tool: suggestedTool,
      action_type: firstPending ? (firstPending.type || "add_node") : "none",
      parameter_name: firstPending && firstPending.params ? firstPending.params[0] : null,
      target_node_id: targetNodeId0,
      connection_hint: firstPending && firstPending.type === 'connect_nodes' ? {
        from: firstPending.from, to: firstPending.to,
        sourcePort: firstPending.sourcePort, targetPort: firstPending.targetPort,
        from_node_id: instanceMap0[firstPending.from_instance] || null,
        to_node_id: instanceMap0[firstPending.to_instance] || null
      } : null,
      chat_message: chatMessage,
      plan_id: newPlanId,
      steps: initializedPlan.steps
    });

  } catch (err) {
    res.status(500).json({ message: 'Copilot yönlendirmesinde sunucu hatası.', error: err.message });
  }
});

export default router;
