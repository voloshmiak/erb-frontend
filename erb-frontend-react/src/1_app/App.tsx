import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import './App.css'; 
import 'leaflet/dist/leaflet.css'; 
import { DispatcherHubPage } from '@/2_pages/dispetcher_hub/ui/DispatcherHubPage';
import { Dashboard } from '@/2_pages/dashboard/ui/Dashboard';
import { FreightRequestPage } from '@/2_pages/freight-request/FreightRequestPage';
import { FleetPage } from '@/2_pages/fleet/ui/FleetPage';
import { ReportsPage } from '@/2_pages/reports/ui/ReportsPage';
import { MetricsPage } from '@/2_pages/metrics/ui/MetricsPage';
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
        
        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Створення заявок */}
        <Route path="/freight-request" element={<FreightRequestPage />} />
        
        {/* Парк вагонів */}
        <Route path="/fleet" element={<FleetPage />} />
        
        {/* Логістичні звіти */}
        <Route path="/reports" element={<ReportsPage />} />

        {/* Метрики оптимізації */}
        <Route path="/metrics" element={<MetricsPage />} />

        {/* Страница 404 */}
        <Route path="*" element={<div className="h-screen w-full flex items-center justify-center">404 - Сторінку не знайдено</div>} />
      </Routes>
    </Router>
  );
};

export default App;