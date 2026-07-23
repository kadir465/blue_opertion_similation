import React from 'react';

const BlueBotView = ({ onNavigate }) => {
  const bots = [
    { id: 1, name: 'MeetingRoom-Daily-Usage-P IR', delay: '0 saniye', active: false, type: 'calendar', date: '14.5.2026 20:13:52' },
    { id: 2, name: 'SingleLineSimulation', delay: '0 saniye', active: true, type: 'calendar', date: '12.5.2026 02:44:00' },
    { id: 3, name: 'Telegram Test', delay: '0 saniye', active: false, type: 'calendar', date: '3.4.2026 22:14:17' },
    { id: 4, name: 'PortalStringRef value get/set', delay: '0 saniye', active: false, type: 'calendar', date: '13.3.2026 21:39:12' },
    { id: 5, name: 'WakeOnTheLan', delay: '0 saniye', active: true, type: 'calendar', date: '11.3.2026 21:34:08' },
    { id: 6, name: 'AI Agent Docs', delay: '0 saniye', active: true, type: 'gear', date: '20.1.2026 08:45:16' },
    { id: 7, name: 'When the camera is being watched by someone', delay: '0 saniye', active: false, type: 'calendar', date: '15.12.2025 22:55:06' },
    { id: 8, name: 'Test Notification', delay: '0 saniye', active: true, type: 'calendar', date: '13.12.2025 02:22:17' },
    { id: 9, name: 'Simulation_Humidity_Distribution', delay: '0 saniye', active: false, type: 'gear', date: '21.11.2025 15:07:35' },
  ];

  return (
    <div className="bluebot-container">
      {/* Top Action Bar */}
      <div className="bluebot-action-bar">
        <div className="bluebot-search-wrapper">
          <svg className="bluebot-search-icon" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input type="text" className="bluebot-search-input" placeholder="Kural adı, açıklaması" />
        </div>
        <button className="bluebot-create-btn" onClick={() => onNavigate && onNavigate('workflow-editor')}>
          + Oluştur
        </button>
      </div>

      {/* Table Area */}
      <div className="bluebot-table-wrapper">
        <table className="bluebot-table">
          <thead>
            <tr>
              <th>#</th>
              <th>
                <div className="bluebot-th-content">
                  İsim
                  <div className="bluebot-sort-caret">
                    <svg viewBox="0 0 8 4"><polygon points="4,0 8,4 0,4" /></svg>
                    <svg viewBox="0 0 8 4"><polygon points="4,4 8,0 0,0" /></svg>
                  </div>
                </div>
              </th>
              <th>
                <div className="bluebot-th-content">
                  Gecikme
                  <div className="bluebot-sort-caret">
                    <svg viewBox="0 0 8 4"><polygon points="4,0 8,4 0,4" /></svg>
                    <svg viewBox="0 0 8 4"><polygon points="4,4 8,0 0,0" /></svg>
                  </div>
                </div>
              </th>
              <th>
                <div className="bluebot-th-content">
                  Durum
                  <div className="bluebot-sort-caret">
                    <svg viewBox="0 0 8 4"><polygon points="4,0 8,4 0,4" /></svg>
                    <svg viewBox="0 0 8 4"><polygon points="4,4 8,0 0,0" /></svg>
                  </div>
                </div>
              </th>
              <th>
                <div className="bluebot-th-content">
                  Tip
                  <div className="bluebot-sort-caret">
                    <svg viewBox="0 0 8 4"><polygon points="4,0 8,4 0,4" /></svg>
                    <svg viewBox="0 0 8 4"><polygon points="4,4 8,0 0,0" /></svg>
                  </div>
                </div>
              </th>
              <th>
                <div className="bluebot-th-content">
                  Tarih
                  <div className="bluebot-sort-caret">
                    <svg viewBox="0 0 8 4"><polygon points="4,0 8,4 0,4" /></svg>
                    <svg viewBox="0 0 8 4"><polygon points="4,4 8,0 0,0" /></svg>
                  </div>
                </div>
              </th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {bots.map((bot) => (
              <tr key={bot.id}>
                <td className="bluebot-icon-cell">
                  {/* Robot Face Icon */}
                  <svg viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="10" rx="2" fill="#0047ff" stroke="#000000" />
                    <circle cx="12" cy="5" r="2" />
                    <path d="M12 7v4" />
                    <line x1="8" y1="16" x2="10" y2="16" stroke="#ffffff" />
                    <line x1="14" y1="16" x2="16" y2="16" stroke="#ffffff" />
                    <path d="M2 14h1M21 14h1" />
                  </svg>
                </td>
                <td>
                  <a href="#" className="bluebot-name-link">{bot.name}</a>
                </td>
                <td>
                  <span className="bluebot-delay-badge">{bot.delay}</span>
                </td>
                <td>
                  <label className="bluebot-toggle">
                    <input type="checkbox" defaultChecked={bot.active} />
                    <span className="bluebot-toggle-slider"></span>
                  </label>
                </td>
                <td className="bluebot-type-icon">
                  {bot.type === 'calendar' ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="#7e8299" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" stroke="#f1416c" />
                      <circle cx="15" cy="16" r="3" fill="#3f4254" stroke="none" />
                      <path d="M15 14.5v1.5l1 1" stroke="#ffffff" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="#ffc107" stroke="none">
                      <path d="M12 2l1.5 3h3.5v3.5l3 1.5-3 1.5v3.5h-3.5l-1.5 3-1.5-3h-3.5v-3.5l-3-1.5 3-1.5v-3.5h3.5z" />
                      <circle cx="12" cy="12" r="3" fill="#ffffff" />
                    </svg>
                  )}
                </td>
                <td>{bot.date}</td>
                <td>
                  <div className="bluebot-actions">
                    <button className="bluebot-btn-edit">
                      <svg viewBox="0 0 24 24"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
                      Düzenle
                    </button>
                    <button className="bluebot-btn-delete">
                      <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                      Sil
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="bluebot-footer">
        <div className="bluebot-footer-left">
          © 2026 <span>Blue Operation</span> Tüm hakları saklıdır.
        </div>
        <div className="bluebot-footer-right">
          <a href="#" className="bluebot-footer-link">Hakkımızda</a>
          <a href="#" className="bluebot-footer-link">Gizlilik</a>
          <div className="bluebot-help-icon">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlueBotView;
