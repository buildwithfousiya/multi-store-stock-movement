import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <Router>
      <div className="app">
        <main className="main-content">
          <Routes>
            <Route path="/login" element={<LoginPage onLoginSuccess={setUser} />} />
            <Route path="/register" element={<RegisterPage onRegisterSuccess={setUser} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
