import React, { useState } from 'react';

export default function Sidebar({ activeRoute, onNavigate, isCollapsed, onToggleCollapse }) {
  const [expandedMenus, setExpandedMenus] = useState({
    raporlar: true,
    woRapor: true,
    blueIndustry: false,
    ayarlar: false
  });

  const toggleSubmenu = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const handleMenuClick = (route, e) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(route);
    }
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <a href="#" className="sidebar-logo" onClick={(e) => handleMenuClick('dashboard', e)}>
          <span className="blue">Blue</span>Operation
        </a>
        <button className="sidebar-toggle" aria-label="Menüyü Daralt" onClick={onToggleCollapse}>
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <nav className="sidebar-menu">
        {/* 1. Dashboard */}
        <a 
          href="#" 
          className={`menu-item ${activeRoute === 'dashboard' ? 'active' : ''}`}
          onClick={(e) => handleMenuClick('dashboard', e)}
        >
          <div className="menu-item-left">
            <svg className="menu-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="7" height="9" rx="1" stroke="currentColor" strokeWidth="2" fill="none" />
              <rect x="14" y="3" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="2" fill="none" />
              <rect x="14" y="12" width="7" height="9" rx="1" stroke="currentColor" stroke-width="2" fill="none" />
              <rect x="3" y="16" width="7" height="5" rx="1" stroke="currentColor" stroke-width="2" fill="none" />
            </svg>
            <span>Dashboard</span>
          </div>
        </a>

        {/* 2. İletişim */}
        <a href="#" className="menu-item" onClick={(e) => e.preventDefault()}>
          <div className="menu-item-left">
            <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span>İletişim</span>
          </div>
          <div className="menu-arrow"></div>
        </a>

        {/* 3. Varlık */}
        <a href="#" className="menu-item" onClick={(e) => e.preventDefault()}>
          <div className="menu-item-left">
            <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            <span>Varlık</span>
          </div>
          <div className="menu-arrow"></div>
        </a>

        {/* 4. Kurumsal */}
        <a href="#" className="menu-item" onClick={(e) => e.preventDefault()}>
          <div className="menu-item-left">
            <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
              <line x1="9" y1="22" x2="9" y2="16" />
              <line x1="15" y1="22" x2="15" y2="16" />
              <line x1="9" y1="16" x2="15" y2="16" />
              <path d="M8 6h2M8 10h2M14 6h2M14 10h2" />
            </svg>
            <span>Kurumsal</span>
          </div>
          <div className="menu-arrow"></div>
        </a>

        {/* 5. Haritalar */}
        <a href="#" className="menu-item" onClick={(e) => e.preventDefault()}>
          <div className="menu-item-left">
            <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>Haritalar</span>
          </div>
          <div className="menu-arrow"></div>
        </a>

        {/* 6. IoT Teknolojileri */}
        <a href="#" className="menu-item" onClick={(e) => e.preventDefault()}>
          <div className="menu-item-left">
            <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
            </svg>
            <span>IoT Teknolojileri</span>
          </div>
        </a>

        {/* 7. BLE Motoru */}
        <a href="#" className="menu-item" onClick={(e) => e.preventDefault()}>
          <div className="menu-item-left">
            <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6.5 6.5l11 11L12 23V1l5.5 5.5-11 11" />
            </svg>
            <span>BLE Motoru</span>
          </div>
          <div className="menu-arrow"></div>
        </a>

        {/* 8. Blue Modems */}
        <a href="#" className="menu-item" onClick={(e) => e.preventDefault()}>
          <div className="menu-item-left">
            <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
              <line x1="6" y1="18" x2="6.01" y2="18" />
              <line x1="10" y1="18" x2="10.01" y2="18" />
              <path d="M20 14V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v9" />
            </svg>
            <span>Blue Modems</span>
          </div>
        </a>

        {/* 9. İş Emri */}
        <a href="#" className="menu-item" onClick={(e) => e.preventDefault()}>
          <div className="menu-item-left">
            <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <line x1="4" y1="22" x2="4" y2="15" />
            </svg>
            <span>İş Emri</span>
          </div>
          <div className="menu-arrow"></div>
        </a>

        {/* 10. CMMS */}
        <a href="#" className="menu-item" onClick={(e) => e.preventDefault()}>
          <div className="menu-item-left">
            <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
            <span>CMMS</span>
          </div>
        </a>

        {/* 11. RFID Yönetimi */}
        <a href="#" className="menu-item" onClick={(e) => e.preventDefault()}>
          <div className="menu-item-left">
            <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            <span>RFID Yönetimi</span>
          </div>
        </a>

        {/* 12. Blue Industry */}
        <a href="#" className="menu-item" onClick={(e) => e.preventDefault()}>
          <div className="menu-item-left">
            <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 20h20M2 17l4-4 4 4 4-4 4 4 4-4v7H2v-7z" />
            </svg>
            <span>Blue Industry</span>
          </div>
          <div className="menu-arrow"></div>
        </a>

        {/* 13. Acil Durum */}
        <a href="#" className="menu-item" onClick={(e) => e.preventDefault()}>
          <div className="menu-item-left">
            <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span>Acil Durum</span>
          </div>
        </a>

        {/* 14. BlueBot */}
        <a 
          href="#" 
          className={`menu-item ${activeRoute === 'bluebot' ? 'active' : ''}`} 
          onClick={(e) => handleMenuClick('bluebot', e)}
        >
          <div className="menu-item-left">
            <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            <span>BlueBot</span>
          </div>
        </a>

        {/* 15. Periyodik Görevler */}
        <a href="#" className="menu-item" onClick={(e) => e.preventDefault()}>
          <div className="menu-item-left">
            <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>Periyodik Görevler</span>
          </div>
        </a>

        {/* 16. Raporlar (Parent) */}
        <a 
          href="#" 
          className={`menu-item has-submenu ${expandedMenus.raporlar ? 'expanded' : ''}`}
          onClick={(e) => { e.preventDefault(); toggleSubmenu('raporlar'); }}
        >
          <div className="menu-item-left">
            <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
            <span>Raporlar</span>
          </div>
          <div className={`menu-arrow ${expandedMenus.raporlar ? 'down' : ''}`}></div>
        </a>

        {/* Raporlar Submenu Container */}
        <div className={`submenu-container ${!expandedMenus.raporlar ? 'collapsed' : ''}`}>
          {/* Müşteri Deneyimi */}
          <a 
            href="#" 
            className={`menu-item level-2 ${activeRoute === 'customer-experience' ? 'active' : ''}`}
            onClick={(e) => handleMenuClick('customer-experience', e)}
          >
            <div className="menu-item-left">
              <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83M22 12A10 10 0 0 0 12 2v10z"/>
              </svg>
              <span>Müşteri Deneyimi</span>
            </div>
          </a>

          {/* WO Rapor (Parent Level 2) */}
          <a 
            href="#" 
            className={`menu-item level-2 has-submenu ${expandedMenus.woRapor ? 'expanded' : ''}`}
            onClick={(e) => { e.preventDefault(); toggleSubmenu('woRapor'); }}
          >
            <div className="menu-item-left">
              <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <line x1="4" y1="22" x2="4" y2="15" />
              </svg>
              <span>WO Rapor</span>
            </div>
            <div className={`menu-arrow ${expandedMenus.woRapor ? 'down' : ''}`}></div>
          </a>

          {/* WO Rapor Submenu Container */}
          <div className={`submenu-container ${!expandedMenus.woRapor ? 'collapsed' : ''}`}>
            {/* Talepler */}
            <a 
              href="#" 
              className={`menu-item level-3 ${activeRoute === 'requests' ? 'active' : ''}`}
              onClick={(e) => handleMenuClick('requests', e)}
            >
              <div className="menu-item-left">
                <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
                  <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
                </svg>
                <span>Talepler</span>
              </div>
            </a>

            {/* Performans */}
            <a 
              href="#" 
              className={`menu-item level-3 ${activeRoute === 'performance' ? 'active' : ''}`}
              onClick={(e) => handleMenuClick('performance', e)}
            >
              <div className="menu-item-left">
                <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                  <line x1="4" y1="22" x2="4" y2="15" />
                </svg>
                <span>Performans</span>
              </div>
            </a>

            {/* Haftalık */}
            <a href="#" className="menu-item level-3" onClick={(e) => e.preventDefault()}>
              <div className="menu-item-left">
                <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>Haftalık</span>
              </div>
            </a>
          </div>

          {/* BlueIndustry (Parent Level 2) */}
          <a 
            href="#" 
            className={`menu-item level-2 has-submenu ${expandedMenus.blueIndustry ? 'expanded' : ''}`}
            onClick={(e) => { e.preventDefault(); toggleSubmenu('blueIndustry'); }}
          >
            <div className="menu-item-left">
              <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 20h20M2 17l4-4 4 4 4-4 4 4 4-4v7H2v-7z" />
              </svg>
              <span>BlueIndustry</span>
            </div>
            <div className={`menu-arrow ${expandedMenus.blueIndustry ? 'down' : ''}`}></div>
          </a>

          {/* BlueIndustry Submenu Container */}
          <div className={`submenu-container ${!expandedMenus.blueIndustry ? 'collapsed' : ''}`}>
            <a href="#" className="menu-item level-3" onClick={(e) => e.preventDefault()}>
              <div className="menu-item-left">
                <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /></svg>
                <span>Saha Analizi</span>
              </div>
            </a>
          </div>

          {/* Bölge Etkileşim */}
          <a href="#" className="menu-item level-2" onClick={(e) => e.preventDefault()}>
            <div className="menu-item-left">
              <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                <line x1="9" y1="3" x2="9" y2="18" />
                <line x1="15" y1="6" x2="15" y2="21" />
                <path d="M12 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
              </svg>
              <span>Bölge Etkileşim</span>
            </div>
          </a>
        </div>

        {/* 17. Ayarlar (Parent) */}
        <a 
          href="#" 
          className={`menu-item has-submenu ${expandedMenus.ayarlar ? 'expanded' : ''}`}
          onClick={(e) => { e.preventDefault(); toggleSubmenu('ayarlar'); }}
        >
          <div className="menu-item-left">
            <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span>Ayarlar</span>
          </div>
          <div className={`menu-arrow ${expandedMenus.ayarlar ? 'down' : ''}`}></div>
        </a>

        {/* Ayarlar Submenu Container */}
        <div className={`submenu-container ${!expandedMenus.ayarlar ? 'collapsed' : ''}`}>
          <a href="#" className="menu-item level-2" onClick={(e) => e.preventDefault()}>
            <div className="menu-item-left">
              <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /></svg>
              <span>Genel Ayarlar</span>
            </div>
          </a>
          <a href="#" className="menu-item level-2" onClick={(e) => e.preventDefault()}>
            <div className="menu-item-left">
              <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /></svg>
              <span>Kullanıcı Yönetimi</span>
            </div>
          </a>
        </div>
      </nav>
    </aside>
  );
}
