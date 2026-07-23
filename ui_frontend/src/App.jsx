import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import DashboardView from './components/DashboardView';
import ReportView from './components/ReportView';
import RequestsView from './components/RequestsView';
import PerformanceView from './components/PerformanceView';
import BlueBotView from './components/BlueBotView';
import WorkflowEditor from './components/WorkflowEditor';

export default function App() {
  const [activeRoute, setActiveRoute] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Sidebar Navigation */}
      <Sidebar 
        activeRoute={activeRoute} 
        onNavigate={setActiveRoute}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
      />

      {/* Main Container */}
      <div className="main-container">
        {/* Header Topbar */}
        <Topbar />

        {/* Content Area */}
        <main className="content-area">
          {activeRoute === 'dashboard' && <DashboardView />}
          {activeRoute === 'customer-experience' && (
            <ReportView onNavigateToDashboard={() => setActiveRoute('dashboard')} />
          )}
          {activeRoute === 'requests' && <RequestsView />}
          {activeRoute === 'performance' && <PerformanceView />}
          {activeRoute === 'bluebot' && <BlueBotView onNavigate={setActiveRoute} />}
          {activeRoute === 'workflow-editor' && <WorkflowEditor onNavigate={setActiveRoute} />}
        </main>
      </div>
    </div>
  );
}
