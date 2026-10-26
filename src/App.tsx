import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import DirectionsPage from './pages/DirectionsPage';
import DirectionDetailPage from './pages/DirectionDetailPage';
import SchedulePage from './pages/SchedulePage';
import TrainingDetailPage from './pages/TrainingDetailPage';
import TrainersPage from './pages/TrainersPage';
import TrainerDetailPage from './pages/TrainerDetailPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import RoutesPage from './pages/RoutesPage';
import NewsPage from './pages/NewsPage';
import NewsDetailPage from './pages/NewsDetailPage';
import ResultsPage from './pages/ResultsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CabinetLayout from './pages/cabinet/CabinetLayout';
import CabinetHome from './pages/cabinet/CabinetHome';
import AthleteRegistrations from './pages/cabinet/AthleteRegistrations';
import AthleteCalendar from './pages/cabinet/AthleteCalendar';
import AthleteResults from './pages/cabinet/AthleteResults';
import AthleteNotifications from './pages/cabinet/AthleteNotifications';
import AccountSettings from './pages/cabinet/AccountSettings';
import TrainerSchedule from './pages/cabinet/TrainerSchedule';
import TrainerStudents from './pages/cabinet/TrainerStudents';
import TrainerAttendance from './pages/cabinet/TrainerAttendance';
import AdminUsers from './pages/cabinet/AdminUsers';
import AdminTrainers from './pages/cabinet/AdminTrainers';
import AdminNews from './pages/cabinet/AdminNews';
import AdminEvents from './pages/cabinet/AdminEvents';
import AdminTestimonials from './pages/cabinet/AdminTestimonials';
import AdminTrainings from './pages/cabinet/AdminTrainings';
import AdminResults from './pages/cabinet/AdminResults';
import AdminNotifications from './pages/cabinet/AdminNotifications';
import PaymentPage from './pages/cabinet/PaymentPage';
import CalendarExport from './pages/cabinet/CalendarExport';
import EventQR from './pages/cabinet/EventQR';
import PrivacyPage from './pages/PrivacyPage';
import NotFoundPage from './pages/NotFoundPage';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              {/* Публичные страницы */}
              <Route index element={<HomePage />} />
              <Route path="directions" element={<DirectionsPage />} />
              <Route path="directions/:id" element={<DirectionDetailPage />} />
              <Route path="schedule" element={<SchedulePage />} />
              <Route path="schedule/:id" element={<TrainingDetailPage />} />
              <Route path="trainers" element={<TrainersPage />} />
              <Route path="trainers/:id" element={<TrainerDetailPage />} />
              <Route path="events" element={<EventsPage />} />
              <Route path="events/:id" element={<EventDetailPage />} />
              <Route path="routes" element={<RoutesPage />} />
              <Route path="news" element={<NewsPage />} />
              <Route path="news/:id" element={<NewsDetailPage />} />
              <Route path="results" element={<ResultsPage />} />
              <Route path="privacy" element={<PrivacyPage />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="events/:id/qr" element={<EventQR />} />

              {/* Приватный кабинет */}
              <Route
                path="cabinet"
                element={
                  <ProtectedRoute>
                    <CabinetLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<CabinetHome />} />

                {/* Спортсмен */}
                <Route
                  path="registrations"
                  element={
                    <ProtectedRoute roles={['athlete', 'admin']}>
                      <AthleteRegistrations />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="calendar"
                  element={
                    <ProtectedRoute roles={['athlete', 'admin']}>
                      <AthleteCalendar />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="results"
                  element={
                    <ProtectedRoute roles={['athlete', 'admin']}>
                      <AthleteResults />
                    </ProtectedRoute>
                  }
                />
                <Route path="notifications" element={<AthleteNotifications />} />
                <Route path="settings" element={<AccountSettings />} />
                <Route
                  path="payment"
                  element={
                    <ProtectedRoute roles={['athlete', 'admin']}>
                      <PaymentPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="calendar-export"
                  element={
                    <ProtectedRoute roles={['athlete', 'admin']}>
                      <CalendarExport />
                    </ProtectedRoute>
                  }
                />

                {/* Тренер */}
                <Route
                  path="schedule"
                  element={
                    <ProtectedRoute roles={['trainer', 'admin']}>
                      <TrainerSchedule />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="students"
                  element={
                    <ProtectedRoute roles={['trainer', 'admin']}>
                      <TrainerStudents />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="attendance"
                  element={
                    <ProtectedRoute roles={['trainer', 'admin']}>
                      <TrainerAttendance />
                    </ProtectedRoute>
                  }
                />

                {/* Администратор */}
                <Route
                  path="admin/users"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <AdminUsers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/news"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <AdminNews />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/events"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <AdminEvents />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/testimonials"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <AdminTestimonials />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/trainers"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <AdminTrainers />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/trainings"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <AdminTrainings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/results"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <AdminResults />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="admin/notifications"
                  element={
                    <ProtectedRoute roles={['admin']}>
                      <AdminNotifications />
                    </ProtectedRoute>
                  }
                />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
