import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Workflow from '../models/Workflow.js';
import { areTypesCompatible } from './graphBuilder.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const toolsPath = path.resolve(__dirname, '../blue_bot_tools.json');
let rawTools = [];
try {
  rawTools = JSON.parse(fs.readFileSync(toolsPath, 'utf-8'));
} catch (err) {
  console.error('[workflowRoutes] Error reading blue_bot_tools.json:', err);
}

const normalize = (str) => {
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

router.post('/', async (req, res) => {
  try {
    const { nodes, connections } = req.body;
    if (!nodes || !connections) {
      return res.status(400).json({ message: 'nodes ve connections alanları zorunludur.' });
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
      return res.status(400).json({ message: 'Sonsuz döngü tespit edildi! Kaydetme işlemi iptal edildi.' });
    }

    // 2. Type Compatibility Check (Tip Uyumluluğu)
    for (const conn of connections) {
      const sourceNode = nodes.find(n => n.id === conn.fromId);
      const targetNode = nodes.find(n => n.id === conn.toId);
      if (!sourceNode || !targetNode) continue;

      const sourceTool = rawTools.find(t => normalize(t.name) === normalize(sourceNode.name));
      const targetTool = rawTools.find(t => normalize(t.name) === normalize(targetNode.name));

      const sourceOutputType = sourceTool && sourceTool.outputs && sourceTool.outputs[conn.fromPort]
        ? sourceTool.outputs[conn.fromPort].type
        : "any";
      const targetInputType = targetTool && targetTool.inputs && targetTool.inputs[conn.toPort]
        ? targetTool.inputs[conn.toPort].type
        : "any";

      // Verify connection type compatibility using unified matrix
      if (areTypesCompatible(sourceOutputType, targetInputType)) {
        continue;
      }

      return res.status(400).json({ 
        message: `Tip Uyuşmazlığı: ${sourceNode.name} (${sourceOutputType}) ile ${targetNode.name} (${targetInputType}) arasındaki bağlantı geçersizdir.` 
      });
    }

    // 3. Required Inputs Check (Zorunlu Alan Kontrolü)
    for (const node of nodes) {
      const tool = rawTools.find(t => normalize(t.name) === normalize(node.name));
      if (!tool || !tool.inputs) continue;

      for (let i = 0; i < tool.inputs.length; i++) {
        const input = tool.inputs[i];
        if (input.required) {
          // Check if there is a connection to this input port
          const isConnected = connections.some(conn => conn.toId === node.id && conn.toPort === i);
          if (!isConnected) {
            return res.status(400).json({ 
              message: `Zorunlu Alan Hatası: ${node.name} aracının '${input.name}' girişi bağlanmalıdır.` 
            });
          }
        }
      }
    }

    // Save to Database
    const newWorkflow = new Workflow({ nodes, connections });
    const savedWorkflow = await newWorkflow.save();
    res.status(201).json({ message: 'İş akışı başarıyla doğrulandı ve veritabanına kaydedildi.', data: savedWorkflow });

  } catch (error) {
    res.status(500).json({ message: 'İş akışı kaydedilirken sunucu hatası oluştu.', error: error.message });
  }
});

export default router;
