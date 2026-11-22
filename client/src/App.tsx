import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

// Route Code-Splitting / Lazy Loading for Performance & Efficiency
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const CropManagement = lazy(() => import('./pages/CropManagement'));
const CropDetail = lazy(() => import('./pages/CropDetail'));
const FarmingCalendar = lazy(() => import('./pages/FarmingCalendar'));
const Weather = lazy(() => import('./pages/Weather'));
const Assistant = lazy(() => import('./pages/Assistant'));
const DiseaseDetection = lazy(() => import('./pages/DiseaseDetection'));
const SoilRecommendations = lazy(() => import('./pages/SoilRecommendations'));
const KnowledgeCentre = lazy(() => import('./pages/KnowledgeCentre'));
const ArticleDetail = lazy(() => import('./pages/ArticleDetail'));
const Notifications = lazy(() => import('./pages/Notifications'));
const MoreMenu = lazy(() => import('./pages/MoreMenu'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const ManageFarmers = lazy(() => import('./pages/admin/ManageFarmers'));
const ManageCrops = lazy(() => import('./pages/admin/ManageCrops'));
const ManageKnowledge = lazy(() => import('./pages/admin/ManageKnowledge'));
const ManageDisease = lazy(() => import('./pages/admin/ManageDisease'));

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <Suspense fallback={<LoadingSpinner text="Loading KrishiMitra..." />}>
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
          </Suspense>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
