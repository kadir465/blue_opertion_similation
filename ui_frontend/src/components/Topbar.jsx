import React from 'react';

export default function Topbar() {
  return (
    <header className="topbar">
      <div className="topbar-actions">
        {/* Plus Button */}
        <button className="action-btn" aria-label="Ekle">
          <svg className="action-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
        
        {/* Search Button */}
        <button className="action-btn" aria-label="Ara">
          <svg className="action-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
        
        {/* Mail/Inbox Button */}
        <button className="action-btn" aria-label="Mesajlar">
          <svg className="action-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
        </button>
        
        {/* Bell/Notification Button */}
        <button className="action-btn" aria-label="Bildirimler">
          <svg className="action-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </button>
        
        {/* Network/Nodes Button */}
        <button className="action-btn" aria-label="Sistem Ağları">
          <svg className="action-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="5" r="3"></circle>
            <circle cx="5" cy="19" r="3"></circle>
            <circle cx="19" cy="19" r="3"></circle>
            <line x1="5" y1="16" x2="10" y2="8"></line>
            <line x1="19" y1="16" x2="14" y2="8"></line>
            <line x1="8" y1="19" x2="16" y2="19"></line>
          </svg>
        </button>
        
        {/* Country Flag selector */}
        <div className="lang-selector" title="Dil Seçimi">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" className="flag-icon">
            <rect width="1200" height="800" fill="#e30a17"/>
            <circle cx="400" cy="400" r="200" fill="#fff"/>
            <circle cx="450" cy="400" r="160" fill="#e30a17"/>
            <polygon points="575,400 663,429 617,348 688,300 600,300 575,219 550,300 462,300 533,348 487,429" fill="#fff"/>
          </svg>
          <div className="arrow-down"></div>
        </div>
        
        {/* User Profile */}
        <div className="user-profile">
          <div className="avatar-wrapper">
            <img src="/user_avatar.png" alt="Kullanıcı Profili" className="avatar-img" />
          </div>
          <div className="arrow-down"></div>
        </div>
      </div>
    </header>
  );
}
