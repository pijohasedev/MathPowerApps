import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import ChildDashboard from './pages/ChildDashboard';
import ParentDashboard from './pages/ParentDashboard';
import 'katex/dist/katex.min.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Simple Top Nav */}
        <nav style={{ padding: '1rem', background: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--card-border)' }}>
          <div className="container flex justify-between items-center">
            <h1 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--primary-color)' }}>
              Math<span style={{ color: 'var(--secondary-color)' }}>Power</span>
            </h1>
            <div className="flex gap-4">
              <Link to="/" className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Utama</Link>
              <Link to="/child" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Main & Belajar!</Link>
              <Link to="/parent" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Ibu Bapa</Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="container mt-8 animate-fade-in">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/child/*" element={<ChildDashboard />} />
            <Route path="/parent/*" element={<ParentDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
