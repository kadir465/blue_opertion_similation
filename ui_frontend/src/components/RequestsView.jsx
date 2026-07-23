import React, { useState, useEffect, useRef } from 'react';

// ─── Category display labels ─────────────────────────────────────────────────
const CATEGORY_LABELS = {
  Mekanik: 'Mekanik',
  Elektrik: 'Elektrik',
  Yazılım: 'Yazılım',
  work_orders: 'İş Emirleri',
  device_failures: 'Cihaz Arızaları',
  occupancy_metrics: 'Doluluk Metrikleri',
  alerts: 'Bildirimler',
};

// ─── Status badge class mapping ──────────────────────────────────────────────
const STATUS_BADGE = {
  active: { cls: 'ai-badge-danger', label: 'Aktif Arıza' },
  completed: { cls: 'ai-badge-success', label: 'Tamamlandı' },
  dispatched: { cls: 'ai-badge-info', label: 'Gönderildi' },
  all: { cls: 'ai-badge-neutral', label: 'Genel' },
};

// Helper to dynamically resolve active vs completed status from subject/metadata
const getDynamicStatus = (item) => {
  if (item.status) return item.status;
  const subj = (item.subject || '').toLowerCase();
  // Active/fault keywords
  const activeWords = ['arıza', 'sorun', 'sızıntı', 'hata', 'bozuk', 'sorunlu', 'arızalı', 'problem', 'bekleyen', 'açık'];
  if (activeWords.some(w => subj.includes(w))) return 'active';
  // Completed/maintenance keywords
  const completedWords = ['bakım', 'tamamlandı', 'tamamlanan', 'bitti', 'kapat', 'çözüldü', 'tamir'];
  if (completedWords.some(w => subj.includes(w))) return 'completed';
  return 'completed'; // default
};

const RequestsView = () => {
  // ─── State ─────────────────────────────────────────────────────────────────
  const [allData, setAllData] = useState([]);         // Full database records
  const [displayData, setDisplayData] = useState([]); // Currently displayed (filtered or all)
  const [dbLoading, setDbLoading] = useState(true);
  const [queryText, setQueryText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [latencyMs, setLatencyMs] = useState(null);
  const [activeIntent, setActiveIntent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);
  const [activeFiltersInfo, setActiveFiltersInfo] = useState('');
  const inputRef = useRef(null);

  // ─── Fetch ALL records from the real MongoDB API on mount ──────────────────
  useEffect(() => {
    fetch('http://localhost:5000/api/requests')
      .then(res => res.json())
      .then(data => {
        setAllData(data);
        setDisplayData(data);
        setDbLoading(false);
      })
      .catch(err => {
        console.error('Veritabanı bağlantı hatası:', err);
        setDbLoading(false);
      });
  }, []);

  // ─── Core: Analyze intent via local inference backend ──────────────────────
  const handleAnalyze = async () => {
    const text = queryText.trim();
    if (!text) {
      inputRef.current?.focus();
      return;
    }

    setAnalyzing(true);
    setShowModal(false);
    setLatencyMs(null);

    const roundTripStart = performance.now();

    try {
      const response = await fetch('http://localhost:5000/api/rag/analyze-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const roundTripMs = performance.now() - roundTripStart;

      console.log(`[AI Inference] Intent: "${data.intent}" | Server Latency: ${data.latency_ms}ms | Round-trip: ${roundTripMs.toFixed(1)}ms`);
      console.log('[AI Inference] Mapped Parameters:', data.mapped_parameters);

      setLatencyMs({ server: data.latency_ms, roundTrip: Math.round(roundTripMs) });

      // ─── Multi-field client-side filtering ─────────────────────────────
      const params = data.mapped_parameters;
      setActiveIntent(data.intent === 'unhandled' ? 'Genel Arama' : data.intent);

      // Build active filters user display string
      const filterLabels = [];
      if (params.building && params.building !== 'all') filterLabels.push(`Bina: ${params.building}`);
      const codeParam = (params.workOrderNo && params.workOrderNo !== 'all') ? params.workOrderNo : ((params.zone && params.zone !== 'all') ? params.zone : null);
      if (codeParam) filterLabels.push(`İş Emri / Bölge: ${codeParam}`);
      if (params.status && params.status !== 'all') {
        const statusText = params.status === 'completed' ? 'Tamamlandı' : params.status === 'dispatched' ? 'Gönderildi' : 'Aktif Arıza';
        filterLabels.push(`Durum: ${statusText}`);
      }
      if (params.category && params.category !== 'all') filterLabels.push(`Kategori: ${params.category}`);
      if (params.minScore !== null && params.minScore !== undefined) filterLabels.push(`Min Skor: ${params.minScore}`);
      if (params.date_range && params.date_range !== 'all') {
        const dateText = params.date_range === 'today' ? 'Bugün' :
                         params.date_range === 'yesterday' ? 'Dün' :
                         params.date_range === 'last_7_days' ? 'Son 7 Gün' :
                         params.date_range === 'last_30_days' ? 'Son 30 Gün' :
                         params.date_range === 'last_month' ? 'Geçen Ay' : params.date_range;
        filterLabels.push(`Tarih: ${dateText}`);
      }
      if (params.keywords && params.keywords.length > 0) filterLabels.push(`Anahtar Kelimeler: "${params.keywords.join(', ')}"`);

      setActiveFiltersInfo(filterLabels.join(', ') || 'Genel Filtre');

      const filtered = allData.filter(item => {
        // 1. Category filter
        if (params.category && params.category !== 'all' && params.category !== 'unknown') {
          const itemCat = (item.category || '').toLowerCase();
          const paramCat = params.category.toLowerCase();
          if (itemCat !== paramCat) return false;
        }

        // 2. Status filter
        if (params.status && params.status !== 'all' && params.status !== 'unknown') {
          const itemStatus = getDynamicStatus(item).toLowerCase();
          const paramStatus = params.status.toLowerCase();
          if (itemStatus !== paramStatus) return false;
        }

        // 3. Building filter (Match letter A/B/C or exact substring)
        if (params.building && params.building !== 'all') {
          const itemBuilding = (item.building || '').toLowerCase();
          const paramBuilding = params.building.toLowerCase();
          const itemLetter = itemBuilding.match(/[a-c]/i)?.[0];
          const paramLetter = paramBuilding.match(/[a-c]/i)?.[0];
          if (itemLetter && paramLetter) {
            if (itemLetter !== paramLetter) return false;
          } else if (!itemBuilding.includes(paramBuilding)) {
            return false;
          }
        }

        // 4. WorkOrder / Zone Code filter
        if (codeParam) {
          const itemCode = (item.workOrderNo || item.zone || '').replace(/[\s-]/g, '').toLowerCase();
          const searchCode = codeParam.replace(/[\s-]/g, '').toLowerCase();
          if (!itemCode.includes(searchCode)) return false;
        }

        // 5. Min Score filter
        if (params.minScore !== null && params.minScore !== undefined) {
          if (item.score !== undefined && item.score < params.minScore) return false;
        }

        // 4. Date Range filter
        if (params.date_range && params.date_range !== 'all' && params.date_range !== 'unknown') {
          if (!item.createdAt) return false;
          const itemDate = new Date(item.createdAt);
          const now = new Date();
          const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          
          if (params.date_range === 'today') {
            if (itemDate < startOfToday) return false;
          } else if (params.date_range === 'yesterday') {
            const startOfYesterday = new Date(startOfToday);
            startOfYesterday.setDate(startOfYesterday.getDate() - 1);
            if (itemDate < startOfYesterday || itemDate >= startOfToday) return false;
          } else if (params.date_range === 'last_7_days') {
            const sevenDaysAgo = new Date(startOfToday);
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            if (itemDate < sevenDaysAgo) return false;
          } else if (params.date_range === 'last_30_days') {
            const thirtyDaysAgo = new Date(startOfToday);
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            if (itemDate < thirtyDaysAgo) return false;
          } else if (params.date_range === 'last_month') {
            const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
            if (itemDate < startOfLastMonth || itemDate > endOfLastMonth) return false;
          }
        }

        // 5. Keyword search — applies in combination with all entity filters (Logical AND)
        if (params.keywords && params.keywords.length > 0) {
          const searchableText = [
            item.subject     || '',
            item.category    || '',
            item.building    || '',
            item.workOrderNo || '',
            item.duration    || '',
          ].join(' ').toLowerCase();

          const anyMatch = params.keywords.some(kw => {
            const kwLower = kw.toLowerCase();
            if (kwLower.length < 3) return false;
            if (searchableText.includes(kwLower)) return true;
            const prefix = kwLower.substring(0, Math.min(4, kwLower.length));
            return searchableText.split(/[\s,.-]+/).some(
              word => word.length >= 3 && (word.startsWith(prefix) || prefix.startsWith(word.substring(0, Math.min(4, word.length))))
            );
          });
          if (!anyMatch) return false;
        }

        return true;
      });

      setDisplayData(filtered);
      setIsFiltered(true);
    } catch (err) {
      console.error('[AI Inference] Error:', err);
      setShowModal(true);
      setActiveIntent(null);
    } finally {
      setAnalyzing(false);
    }
  };

  // ─── Reset filter ──────────────────────────────────────────────────────────
  const handleReset = () => {
    setDisplayData(allData);
    setIsFiltered(false);
    setActiveIntent(null);
    setLatencyMs(null);
    setQueryText('');
    setActiveFiltersInfo('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAnalyze();
  };

  const getBadge = (status) => {
    const key = (status || '').toLowerCase();
    const badge = STATUS_BADGE[key] || { cls: 'ai-badge-neutral', label: status || 'Bilinmiyor' };
    return <span className={badge.cls}>{badge.label}</span>;
  };

  // ─── Initial DB loading state ──────────────────────────────────────────────
  if (dbLoading) {
    return (
      <div className="ai-enhanced-view">
        <div className="ai-loading-overlay" style={{ position: 'relative', background: 'transparent', backdropFilter: 'none' }}>
          <div className="ai-loading-content" style={{ boxShadow: 'none' }}>
            <div className="ai-loading-spinner"></div>
            <p>Veritabanından talepler yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-enhanced-view">
      {/* ─── Page Header ─────────────────────────────────────────────────── */}
      <div className="ai-page-header">
        <div className="ai-page-title">
          <h2>Raporlama ve Analiz</h2>
          <div className="ai-page-subtitle">
            Veritabanında toplam <strong>{allData.length}</strong> kayıt bulunuyor.
          </div>
        </div>
        <div className="ai-page-actions">
          <select className="ai-btn-outline" defaultValue="Tablo Görünümü">
            <option>Tablo Görünümü</option>
            <option>Liste Görünümü</option>
          </select>
          <button className="ai-btn-outline">Dışa Aktar (PDF/Excel)</button>
          <button className="ai-btn-primary">Yeni Rapor</button>
        </div>
      </div>

      {/* ─── AI Search Card ──────────────────────────────────────────────── */}
      <div className="ai-search-card">
        <div className="ai-search-card-header">
          <div className="ai-search-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/><path d="M9.5 18.5 6 22"/><path d="M14.5 18.5 18 22"/><circle cx="12" cy="14" r="4"/></svg>
            AI Veri Sorgulama
          </div>
          {activeIntent && (
            <div className="ai-intent-badge">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="6"/></svg>
              {activeIntent.replace(/_/g, ' ')}
            </div>
          )}
        </div>
        <div className="ai-search-input-group">
          <input
            ref={inputRef}
            type="text"
            placeholder="Örn: A Blok'taki tamamlanan asansör bakımlarını listele..."
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={analyzing}
          />
          <button className="ai-search-btn" onClick={handleAnalyze} disabled={analyzing}>
            {analyzing ? (
              <><span className="ai-spinner"></span> Analiz ediliyor...</>
            ) : (
              'Analiz Et'
            )}
          </button>
          {isFiltered && (
            <button className="ai-btn-reset" onClick={handleReset}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              Tümünü Göster
            </button>
          )}
        </div>
      </div>

      {/* ─── Loading Overlay ─────────────────────────────────────────────── */}
      {analyzing && (
        <div className="ai-loading-overlay">
          <div className="ai-loading-content">
            <div className="ai-loading-spinner"></div>
            <p>Needle modeli analiz ediyor...</p>
          </div>
        </div>
      )}

      {/* ─── Connection Error Modal ─────────────────────────────────────────── */}
      {showModal && (
        <div className="ai-modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="ai-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ai-modal-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <h3>Bağlantı Hatası</h3>
            <p>Yapay zeka servis sunucusuyla iletişim kurulamadı. Model servisinin arka planda çalıştığından emin olun.</p>
            <button className="ai-btn-primary" onClick={() => setShowModal(false)}>Tamam</button>
          </div>
        </div>
      )}

      {/* ─── Data Table ──────────────────────────────────────────────────── */}
      <div className="ai-table-card">
        {isFiltered && activeFiltersInfo && (
          <div className="ai-table-filter-info">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            <span>
              Şu kriterler için sorgulanıyor: <strong style={{color: '#8950fc'}}>{activeFiltersInfo}</strong>
              <span className="ai-latency-sep">|</span>
              <strong>{displayData.length}</strong> / {allData.length} kayıt listelendi
            </span>
          </div>
        )}
        <div className="ai-table-wrapper">
          <table className="ai-table">
            <thead>
              <tr>
                <th>#</th>
                <th>TALEP ADI</th>
                <th>KATEGORİ</th>
                <th>BİNA</th>
                <th>İŞ EMRİ</th>
                <th>SÜRE</th>
                <th>SKOR</th>
                <th>TARİH</th>
                <th>DURUM</th>
              </tr>
            </thead>
            <tbody>
              {displayData.length === 0 ? (
                <tr><td colSpan="9" className="ai-table-empty">Bu filtreye uygun kayıt bulunamadı.</td></tr>
              ) : (
                displayData.map((req, index) => (
                  <tr key={req._id}>
                    <td>{index + 1}</td>
                    <td className="ai-td-subject">{req.subject}</td>
                    <td><span className="ai-category-tag">{CATEGORY_LABELS[req.category] || req.category}</span></td>
                    <td>{req.building}</td>
                    <td><code className="ai-code-tag">{req.workOrderNo}</code></td>
                    <td>{req.duration}</td>
                    <td>
                      {req.score != null && (
                        <span className={`ai-score ${req.score >= 85 ? 'high' : req.score >= 70 ? 'mid' : 'low'}`}>
                          {req.score}
                        </span>
                      )}
                    </td>
                    <td>{req.createdAt ? new Date(req.createdAt).toLocaleDateString('tr-TR') : '-'}</td>
                    <td>{getBadge(getDynamicStatus(req))}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Latency Footer ──────────────────────────────────────────────── */}
      {latencyMs && (
        <div className="ai-latency-footer">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span>Model: <strong>{latencyMs.server} ms</strong></span>
          <span className="ai-latency-sep">|</span>
          <span>Round-trip: <strong>{latencyMs.roundTrip} ms</strong></span>
        </div>
      )}
    </div>
  );
};

export default RequestsView;
