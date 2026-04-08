import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import './App.css'; 
import 'leaflet/dist/leaflet.css'; 
import { DispatcherHubPage } from '@/2_pages/dispetcher_hub/ui/DispatcherHubPage';

// Если у вас есть ThemeProvider от shadcn/ui или Nova, импортируйте его здесь
// import { ThemeProvider } from '@/shared/ui/theme-provider';

const App = () => {
  return (
    /* Если используете тему, оберните всё в <ThemeProvider> */
    
    <Router>
      <Routes>
        {/* Главная страница: Диспетчерский хаб */}
        <Route path="/" element={<DispatcherHubPage />} />

        {/* Здесь вы в будущем добавите остальные страницы:
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/fleet" element={<FleetPage />} />
        <Route path="/reports" element={<ReportsPage />} /> 
        */}

        {/* Страница 404 */}
        <Route path="*" element={<div className="h-screen w-full flex items-center justify-center">404 - Сторінку не знайдено</div>} />
      </Routes>
    </Router>
  );
};

export default App;