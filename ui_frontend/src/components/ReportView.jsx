import React from 'react';

export default function ReportView({ onNavigateToDashboard }) {
  const rows = [
    {
      id: 1,
      rating: "Terrible",
      faceColor: "#e74c3c",
      faceBg: "#fdf2f2",
      facePath: <path d="M16 16s-1.5-2-4-2-4 2-4 2" />,
      hasEyebrows: true,
      lang: "en",
      date: "30.12.2021 14:33:30",
      location: "Feedback Monitor"
    },
    {
      id: 2,
      rating: "Bad",
      faceColor: "#e67e22",
      faceBg: "#fdf6f0",
      facePath: <path d="M16 16s-1.5-1.5-4-1.5-4 1.5-4 1.5" />,
      hasEyebrows: false,
      lang: "en",
      date: "30.12.2021 14:33:54",
      location: "Feedback Monitor"
    },
    {
      id: 3,
      rating: "Normal",
      faceColor: "#f1c40f",
      faceBg: "#fefde8",
      facePath: <line x1="8" y1="15" x2="16" y2="15" />,
      hasEyebrows: false,
      lang: "en",
      date: "30.12.2021 14:34:00",
      location: "Feedback Monitor"
    },
    {
      id: 4,
      rating: "Bad",
      faceColor: "#e67e22",
      faceBg: "#fdf6f0",
      facePath: <path d="M16 16s-1.5-1.5-4-1.5-4 1.5-4 1.5" />,
      hasEyebrows: false,
      lang: "en",
      date: "30.12.2021 14:34:06",
      location: "Feedback Monitor"
    },
    {
      id: 5,
      rating: "Terrible",
      faceColor: "#e74c3c",
      faceBg: "#fdf2f2",
      facePath: <path d="M16 16s-1.5-2-4-2-4 2-4 2" />,
      hasEyebrows: true,
      lang: "en",
      date: "30.12.2021 14:42:25",
      location: "Feedback Monitor"
    },
    {
      id: 6,
      rating: "Terrible",
      faceColor: "#e74c3c",
      faceBg: "#fdf2f2",
      facePath: <path d="M16 16s-1.5-2-4-2-4 2-4 2" />,
      hasEyebrows: true,
      lang: "tr",
      date: "11.1.2022 14:14:43",
      location: "Feedback Monitor"
    },
    {
      id: 7,
      rating: "Normal",
      faceColor: "#f1c40f",
      faceBg: "#fefde8",
      facePath: <line x1="8" y1="15" x2="16" y2="15" />,
      hasEyebrows: false,
      lang: "tr",
      date: "11.1.2022 15:00:56",
      location: "Feedback Monitor"
    },
    {
      id: 8,
      rating: "Terrible",
      faceColor: "#e74c3c",
      faceBg: "#fdf2f2",
      facePath: <path d="M16 16s-1.5-2-4-2-4 2-4 2" />,
      hasEyebrows: true,
      lang: "tr",
      date: "11.1.2022 17:38:14",
      location: "Feedback Monitor"
    },
    {
      id: 9,
      rating: "Terrible",
      faceColor: "#e74c3c",
      faceBg: "#fdf2f2",
      facePath: <path d="M16 16s-1.5-2-4-2-4 2-4 2" />,
      hasEyebrows: true,
      lang: "tr",
      date: "11.1.2022 17:38:41",
      location: "Feedback Monitor"
    },
    {
      id: 10,
      rating: "Terrible",
      faceColor: "#e74c3c",
      faceBg: "#fdf2f2",
      facePath: <path d="M16 16s-1.5-2-4-2-4 2-4 2" />,
      hasEyebrows: true,
      lang: "tr",
      date: "12.1.2022 16:11:39",
      location: "Feedback Monitor"
    },
    {
      id: 11,
      rating: "Terrible",
      faceColor: "#e74c3c",
      faceBg: "#fdf2f2",
      facePath: <path d="M16 16s-1.5-2-4-2-4 2-4 2" />,
      hasEyebrows: true,
      lang: "tr",
      date: "16.1.2022 14:35:33",
      location: "Feedback Monitor"
    }
  ];

  return (
    <div id="customer-experience-report-view" className="report-view-container">
      {/* Left Filter Panel */}
      <aside className="filter-panel">
        <div className="filter-divider">Cihazlar</div>
        <div className="filter-input-wrapper">
          <select className="filter-select" defaultValue="Cihazlar">
            <option disabled value="Cihazlar">Cihazlar</option>
            <option>Feedback Monitor 1</option>
            <option>Feedback Monitor 2</option>
          </select>
        </div>

        <div className="filter-divider">Kim</div>
        <div className="filter-input-wrapper">
          <input type="text" className="filter-input" placeholder="kullanıcının adını yazınız" />
        </div>

        <div className="filter-divider">Görevler</div>
        <div className="filter-input-wrapper">
          <select className="filter-select" defaultValue="Görevler">
            <option disabled value="Görevler">Görevler</option>
            <option>Temizlik</option>
            <option>Bakım</option>
          </select>
        </div>

        <div className="filter-divider">Seçenekler</div>
        <div className="filter-input-wrapper">
          <select className="filter-select" defaultValue="Seçenekler">
            <option disabled value="Seçenekler">Seçenekler</option>
            <option>Terrible</option>
            <option>Bad</option>
            <option>Normal</option>
            <option>Good</option>
          </select>
        </div>

        <div className="filter-divider">Tarih</div>
        <div className="filter-input-wrapper date-picker">
          <svg className="clock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <input type="text" className="filter-input" value="Başla - Bitiş" readOnly />
        </div>

        <div className="filter-divider">Buton</div>
        <div className="filter-input-wrapper">
          <select className="filter-select" defaultValue="Seç">
            <option disabled value="Seç">Seç</option>
            <option>Seçenek 1</option>
            <option>Seçenek 2</option>
          </select>
        </div>

        <button className="btn-search">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <span>Ara</span>
        </button>
      </aside>

      {/* Right Table Panel */}
      <section className="table-panel">
        <header className="report-header">
          <h1 className="report-title">Müşteri Deneyimi Raporu</h1>
          <div className="report-actions">
            <button className="btn-action-outline btn-action-dashboard" onClick={onNavigateToDashboard}>
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <line x1="18" y1="20" x2="18" y2="10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <line x1="12" y1="20" x2="12" y2="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <line x1="6" y1="20" x2="6" y2="14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              Dashboard
            </button>
            <button className="btn-action-outline btn-action-excel" onClick={() => alert('Excel raporu hazırlanıyor...')}>
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="2" fill="none" />
                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2" />
                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2" />
              </svg>
              Excele Aktar
            </button>
          </div>
        </header>

        {/* Table Wrapper */}
        <div className="table-wrapper">
          <table className="report-table">
            <thead>
              <tr>
                {["#", "Dil", "Seçenek", "Oylama Tarihi", "Oylama Noktası", "Son Temizlik", "Kullanıcılar", "Görev"].map((header, idx) => (
                  <th key={idx}>
                    <div className="th-content">
                      {header}
                      <span className="sort-arrows">
                        <span className="sort-arrow-up"></span>
                        <span className="sort-arrow-down"></span>
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    {/* Dynamic Rating Face SVG */}
                    <svg className="feedback-face" viewBox="0 0 24 24" fill="none" stroke={row.faceColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" fill={row.faceBg} />
                      {row.facePath}
                      <line x1="9" y1="9" x2="9.01" y2="9" />
                      <line x1="15" y1="9" x2="15.01" y2="9" />
                      {row.hasEyebrows && <path d="M9 7l2 1M15 7l-2 1" strokeWidth="1.5" />}
                    </svg>
                  </td>
                  <td>
                    {/* Flag Icons */}
                    {row.lang === "en" ? (
                      <svg className="flag-icon-table" viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg">
                        <rect width="60" height="30" fill="#012169" />
                        <path d="M0 0l60 30M0 30l60-30" stroke="#fff" strokeWidth="6" />
                        <path d="M0 0l60 30M0 30l60-30" stroke="#c8102e" strokeWidth="4" />
                        <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" />
                        <path d="M30 0v30M0 15h60" stroke="#c8102e" strokeWidth="6" />
                      </svg>
                    ) : (
                      <svg className="flag-icon-table" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
                        <rect width="1200" height="800" fill="#e30a17" />
                        <circle cx="400" cy="400" r="200" fill="#fff" />
                        <circle cx="450" cy="400" r="160" fill="#e30a17" />
                        <polygon points="575,400 663,429 617,348 688,300 600,300 575,219 550,300 462,300 533,348 487,429" fill="#fff" />
                      </svg>
                    )}
                  </td>
                  <td>{row.rating}</td>
                  <td>{row.date}</td>
                  <td>{row.location}</td>
                  <td className="cell-empty">?</td>
                  <td className="cell-empty">?</td>
                  <td className="cell-empty">?</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
