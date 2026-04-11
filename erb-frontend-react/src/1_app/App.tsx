import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import './App.css'; 
import 'leaflet/dist/leaflet.css'; 
import { DispatcherHubPage } from '@/2_pages/dispetcher_hub/ui/DispatcherHubPage';
import { DashboardPage } from '@/2_pages/dashboard/DashboardPage';
import { FleetPage } from '@/2_pages/fleet/ui/FleetPage';
import { ReportsPage } from '@/2_pages/reports/ui/ReportsPage';
import { OperationsPage } from '@/2_pages/operations/ui/OperationsPage';
import { SchedulePage } from '@/2_pages/schedule/ui/SchedulePage';

// Если у вас есть ThemeProvider от shadcn/ui или Nova, импортируйте его здесь
// import { ThemeProvider } from '@/shared/ui/theme-provider';

const App = () => {
  return (
    /* Если используете тему, оберните всё в <ThemeProvider> */
    
    <Router>
      <Routes>
        {/* Мап мережі */}
        <Route path="/" element={<DispatcherHubPage />} />
        
        {/* Операції наживо */}
        <Route path="/operations" element={<OperationsPage />} />
        
        {/* Розклад */}
        <Route path="/schedule" element={<SchedulePage />} />
        
        {/* Панель керування */}
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* Парк */}
        <Route path="/fleet" element={<FleetPage />} />
        
        {/* Логістичні звіти */}
        <Route path="/reports" element={<ReportsPage />} />

        {/* Страница 404 */}
        <Route path="*" element={<div className="h-screen w-full flex items-center justify-center">404 - Сторінку не знайдено</div>} />
      </Routes>
    </Router>
  );
};

export default App;