import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Onboarding, { ONBOARDING_KEY } from './pages/Onboarding';
import Home from './pages/Home';
import Search from './pages/Search';
import Weeks from './pages/Weeks';

function hasOnboarded() {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === '1';
  } catch {
    return false;
  }
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        {/* Mobile-first column, centred on larger screens */}
        <div className="mx-auto min-h-dvh w-full max-w-md bg-page shadow-[0_0_40px_rgba(9,14,35,0.06)]">
          <Routes>
            <Route path="/" element={hasOnboarded() ? <Navigate to="/home" replace /> : <Onboarding />} />
            <Route path="/home" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/weeks" element={<Weeks />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </AppProvider>
    </BrowserRouter>
  );
}
