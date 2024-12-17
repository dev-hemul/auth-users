import Layout from './components/layout/layout';
import Login from './components/auth/login/index';
import Profile from './components/profile/index';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ResetPassword from './components/resetPassword/index';
import './App.css';
import { ToastContainer } from 'react-toastify';

function App() {
  return (
    <Router>
      <div>
        <Layout>
          <Routes>
            {/* Роут для логіна */}
            <Route path="/" element={<Login />} />
            {/* Захищений роут для профілю */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
          </Routes>
          <ToastContainer />
        </Layout>
      </div>
    </Router>
  );
}

export default App;
