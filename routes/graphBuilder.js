// 'any' tipli ve type_safety:'warning' olarak işaretlenmiş bir çıkış (ör. Box Uç Nokta,
// HTTP Response Key, Portal Değişkeni...) doğrudan bir boolean tetikleyiciye
// bağlanmamalıdır. Şemanın kendi cast_suggestion açıklaması, bu ham değerin
// önce açık bir dönüştürücü/karşılaştırıcıdan geçmesi gerektiğini belirtir.
// Bu koruma olmadan, areTypesCompatible() fonksiyonundaki 'any' === 'her şeyle uyumlu'
// kuralı, planlayıcının işlenmemiş, tiplendirilmemiş bir değeri doğrudan eylemin
// tetikleyici girişine bağlamasına (kullanıcının istediği sayısal/eşik karşılaştırmasını
// sessizce atlamasına) neden olur. Bu kontrol, aramanın her adımında yapılır.
function isUnsafeAnyToBoolean(outType, outTypeSafety, inField) {
  return outType === 'any' && outTypeSafety === 'warning' && (inField.type || '').toLowerCase() === 'boolean';
}

/**
 * İki veri tipinin birbiriyle uyumlu olup olmadığını kontrol eder.
 */
export function areTypesCompatible(outType, inType) {
  if (!outType || !inType) return false;
  
  const t1 = outType.toLowerCase().trim();
  const t2 = inType.toLowerCase().trim();
  
  if (t1 === t2) return true;
  if (t1 === 'any' || t2 === 'any') return true;
  
  // Sayısal tip uyumluluğu
  const numericTypes = new Set(['float', 'integer', 'number', 'people_count', 'epoch_integer']);
  if (numericTypes.has(t1) && numericTypes.has(t2)) return true;
  
  // Metin / Kimlik (ID) uyumluluğu
  const stringTypes = new Set(['string', 'device_uuid', 'building_id', 'datetime_string', 'datetime_object', 'workorder_enum']);
  if (stringTypes.has(t1) && stringTypes.has(t2)) return true;
  
  // Dizi (Array) uyumluluğu
  const arrayTypes = new Set(['string_array', 'device_uuid_array', 'array']);
  if (arrayTypes.has(t1) && arrayTypes.has(t2)) return true;
  
  return false;
}

/**
 * Başlangıç ve bitiş araçları arasında (gerekirse ara düğümler ekleyerek) yol bulur (BFS algoritması).
 */
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

  // 1. Doğrudan yol kontrolü (Başlangıç çıkışı -> Bitiş girişi)
  // NOT: 'any' tipinde olup type_safety:'warning' bayrağı taşıyan çıkışlar (ör. Box Uç Nokta),
  // areTypesCompatible() 'any' tipini evrensel olarak uyumlu görse bile burada hariç tutulur.
  // Araç şeması, bu ham değerin kullanılmadan önce bir dönüştürücüye ihtiyacı olduğunu söyler.
  // Bu yüzden doğrudan bağlanmasına izin verilmez; BFS'den geçip uygun bir ara düğüm
  // (karşılaştırıcı, tip dönüştürücü vb.) seçmesi zorunlu tutulur.
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

  // 2. Ara düğümler için Genişlik Öncelikli Arama (BFS)
  const middleTools = tools.filter(t => t.role && t.role.includes('middle'));
  const queue = [];
  const globalVisited = new Set();

  // Başlangıç aracının çıkışlarından ilk kenarları kuyruğa ekle
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

      // Mevcut çıkışın T'nin herhangi bir girişiyle eşleşip eşleşmediğini kontrol et
      for (const inField of TInputs) {
        if (isUnsafeAnyToBoolean(curr.outPortType, curr.outPortTypeSafety, inField)) continue;
        if (areTypesCompatible(curr.outPortType, inField.type)) {
          // T'ye bağlanabiliyorsak, T'nin çıkışlarının bitiş düğümüne bağlanıp bağlanamayacağını kontrol et
          for (const out of TOutputs) {
            for (const endIn of endInputs) {
              if (isUnsafeAnyToBoolean(out.type, out.type_safety, endIn)) continue;
              if (areTypesCompatible(out.type, endIn.type)) {
                // Başarılı! Yol bulundu
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

            // Aksi takdirde T'yi BFS kuyruğuna bir adım olarak ekle
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

  // Yol bulunamadı
  return null;
}
