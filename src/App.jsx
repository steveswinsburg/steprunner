import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import StartSession from './pages/StartSession';
import SessionViewer from './pages/SessionViewer';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './components/LoginPage';
import useAuth from './hooks/useAuth';

function App() {

  const { user, authChecked, logout } = useAuth();

  if (!authChecked) return <div>Loading...</div>;


  return (
    <div className="d-flex flex-column min-vh-100">
    <Router>
      <Header user={user} onLogout={logout} />
        <main className="container my-4 flex-grow-1">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/"
              element={
                <ProtectedRoute user={user}>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route path="/start"
              element={
                <ProtectedRoute user={user}>
                  <StartSession />
                </ProtectedRoute>
              }
            />
            <Route path="/session/:sessionId"
              element={
                <ProtectedRoute user={user}>
                  <SessionViewer />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main> 
      <Footer />
    </Router>
    </div>
  );
}

export default App;