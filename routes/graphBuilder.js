// An 'any' typed output flagged type_safety:'warning' (e.g. Box Uç Nokta,
// HTTP Response Key, Portal Değişkeni...) must never be treated as directly
// usable as a boolean trigger. The schema's own cast_suggestion says this
// raw value needs an explicit converter/comparator first. Without this
// guard, areTypesCompatible()'s 'any' === universally-compatible rule lets
// the planner wire an unprocessed, untyped value straight into an action's
// tetikleyici input — silently skipping whatever numeric/threshold
// comparison the user actually asked for. This is checked at every hop of
// the search, not just the first, since the same problem re-appears one
// level deeper if left unchecked (multiple portal tools share this 'any'
// output pattern).
function isUnsafeAnyToBoolean(outType, outTypeSafety, inField) {
  return outType === 'any' && outTypeSafety === 'warning' && (inField.type || '').toLowerCase() === 'boolean';
}

export function areTypesCompatible(outType, inType) {
  if (!outType || !inType) return false;
  
  const t1 = outType.toLowerCase().trim();
  const t2 = inType.toLowerCase().trim();
  
  if (t1 === t2) return true;
  if (t1 === 'any' || t2 === 'any') return true;
  
  // Numeric compatibility
  const numericTypes = new Set(['float', 'integer', 'number', 'people_count', 'epoch_integer']);
  if (numericTypes.has(t1) && numericTypes.has(t2)) return true;
  
  // String/ID compatibility
  const stringTypes = new Set(['string', 'device_uuid', 'building_id', 'datetime_string', 'datetime_object', 'workorder_enum']);
  if (stringTypes.has(t1) && stringTypes.has(t2)) return true;
  
  // Arrays compatibility
  const arrayTypes = new Set(['string_array', 'device_uuid_array', 'array']);
  if (arrayTypes.has(t1) && arrayTypes.has(t2)) return true;
  
  return false;
}

export function findPath(tools, startToolId, endToolId) {
  const startTool = tools.find(t => t.id === startToolId);
  const endTool = tools.find(t => t.id === endToolId);
  
  if (!startTool || !endTool) {
    return null;
  }

  const startOutputs = startTool.outputs || [];
  const endInputs = (endTool.inputs || []).filter(i => i.connection === true);

  if (endInputs.length === 0) {
    return null;
  }

  // 1. Direct path check (Start output -> End input)
  // NOTE: 'any' type outputs that carry a type_safety:'warning' flag (e.g.
  // Box Uç Nokta) are excluded here even though areTypesCompatible() would
  // treat 'any' as universally compatible. The tool schema itself says this
  // raw value needs a cast/converter before use (cast_suggestion), so we
  // never let it silently satisfy a direct connection — it must go through
  // BFS and pick up an appropriate middle node (comparator, type converter,
  // etc.) instead.
  for (const out of startOutputs) {
    for (const inField of endInputs) {
      if (isUnsafeAnyToBoolean(out.type, out.type_safety, inField)) continue;
      if (areTypesCompatible(out.type, inField.type)) {
        return {
          nodes: [],
          connections: [
            {
              from: startToolId,
              sourcePort: out.name,
              to: endToolId,
              targetPort: inField.name
            }
          ]
        };
      }
    }
  }

  // 2. BFS for middle nodes
  const middleTools = tools.filter(t => t.role && t.role.includes('middle'));
  const queue = [];
  const globalVisited = new Set();

  // Enqueue initial edges from start tool outputs
  for (const out of startOutputs) {
    queue.push({
      nodeId: startToolId,
      outPortName: out.name,
      outPortType: out.type,
      outPortTypeSafety: out.type_safety || null,
      path: [],
      connections: [],
      visited: new Set([startToolId])
    });
  }

  while (queue.length > 0) {
    const curr = queue.shift();

    const stateKey = `${curr.nodeId}::${curr.outPortName}`;
    if (globalVisited.has(stateKey)) continue;
    globalVisited.add(stateKey);

    for (const T of middleTools) {
      if (curr.visited.has(T.id)) continue;

      const TInputs = (T.inputs || []).filter(i => i.connection === true);
      const TOutputs = T.outputs || [];

      // Check if current output matches any input of T
      for (const inField of TInputs) {
        if (isUnsafeAnyToBoolean(curr.outPortType, curr.outPortTypeSafety, inField)) continue;
        if (areTypesCompatible(curr.outPortType, inField.type)) {
          // If we connect to T, check if T's outputs can connect to the end node
          for (const out of TOutputs) {
            for (const endIn of endInputs) {
              if (isUnsafeAnyToBoolean(out.type, out.type_safety, endIn)) continue;
              if (areTypesCompatible(out.type, endIn.type)) {
                // Success! Path found
                return {
                  nodes: [...curr.path, T],
                  connections: [
                    ...curr.connections,
                    {
                      from: curr.nodeId,
                      sourcePort: curr.outPortName,
                      to: T.id,
                      targetPort: inField.name
                    },
                    {
                      from: T.id,
                      sourcePort: out.name,
                      to: endToolId,
                      targetPort: endIn.name
                    }
                  ]
                };
              }
            }

            // Otherwise, enqueue T as a step in BFS
            queue.push({
              nodeId: T.id,
              outPortName: out.name,
              outPortType: out.type,
              outPortTypeSafety: out.type_safety || null,
              path: [...curr.path, T],
              connections: [
                ...curr.connections,
                {
                  from: curr.nodeId,
                  sourcePort: curr.outPortName,
                  to: T.id,
                  targetPort: inField.name
                }
              ],
              visited: new Set([...curr.visited, T.id])
            });
          }
        }
      }
    }
  }

  // Path not found
  return null;
}
