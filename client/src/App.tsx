import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import CropManagement from './pages/CropManagement';
import CropDetail from './pages/CropDetail';
import FarmingCalendar from './pages/FarmingCalendar';
import Weather from './pages/Weather';
import Assistant from './pages/Assistant';
import DiseaseDetection from './pages/DiseaseDetection';
import SoilRecommendations from './pages/SoilRecommendations';
import KnowledgeCentre from './pages/KnowledgeCentre';
import ArticleDetail from './pages/ArticleDetail';
import Notifications from './pages/Notifications';
import MoreMenu from './pages/MoreMenu';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageFarmers from './pages/admin/ManageFarmers';
import ManageCrops from './pages/admin/ManageCrops';
import ManageKnowledge from './pages/admin/ManageKnowledge';
import ManageDisease from './pages/admin/ManageDisease';

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/crops" element={<CropManagement />} />
              <Route path="/crops/:id" element={<CropDetail />} />
              <Route path="/calendar" element={<FarmingCalendar />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/assistant" element={<Assistant />} />
              <Route path="/disease" element={<DiseaseDetection />} />
              <Route path="/soil" element={<SoilRecommendations />} />
              <Route path="/knowledge" element={<KnowledgeCentre />} />
              <Route path="/knowledge/:id" element={<ArticleDetail />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/more" element={<MoreMenu />} />

              {/* Admin routes */}
              <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/farmers" element={<ProtectedRoute adminOnly><ManageFarmers /></ProtectedRoute>} />
              <Route path="/admin/crops" element={<ProtectedRoute adminOnly><ManageCrops /></ProtectedRoute>} />
              <Route path="/admin/knowledge" element={<ProtectedRoute adminOnly><ManageKnowledge /></ProtectedRoute>} />
              <Route path="/admin/disease" element={<ProtectedRoute adminOnly><ManageDisease /></ProtectedRoute>} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
