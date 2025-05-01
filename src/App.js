import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import StartSession from './pages/StartSession';
import SessionViewer from './pages/SessionViewer';
import Login from './components/Login';

function App() {
  return (
    <Router>
      <Header />
        <main className="container my-4">
          <Login />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/start" element={<StartSession />} />
            <Route path="/session/:sessionId" element={<SessionViewer />} />
          </Routes>
        </main> 
      <Footer />
    </Router>
  );
}

export default App;