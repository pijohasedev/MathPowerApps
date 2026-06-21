import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="flex flex-col items-center justify-center text-center mt-8 gap-4">
      <h1 className="animate-fade-in">Selamat Datang ke <span className="text-primary">Math</span><span className="text-secondary">Power!</span></h1>
      <p className="text-muted max-w-md animate-fade-in" style={{ animationDelay: '0.1s' }}>
        Sistem pembelajaran matematik interaktif yang memotivasikan anak-anak dengan sistem ganjaran masa bermain.
      </p>
      
      <div className="flex gap-4 mt-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <Link to="/child" className="glass-panel text-center hover:shadow-lg transition-all" style={{ textDecoration: 'none' }}>
          <h2 className="text-primary mb-2">👦 Untuk Anak</h2>
          <p className="text-muted mb-4">Jawab soalan, kumpul mata & main game!</p>
          <button className="btn btn-primary w-full">Log Masuk</button>
        </Link>
        
        <Link to="/parent" className="glass-panel text-center hover:shadow-lg transition-all" style={{ textDecoration: 'none' }}>
          <h2 className="text-secondary mb-2">👨‍👩‍👧‍👦 Untuk Ibu Bapa</h2>
          <p className="text-muted mb-4">Urus soalan & semak prestasi anak.</p>
          <button className="btn btn-secondary w-full">Log Masuk</button>
        </Link>
      </div>
    </div>
  );
}

export default Home;
