/* eslint-disable react-hooks/set-state-in-effect, no-unused-vars */
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Delete, X } from 'lucide-react';

const PinPad = ({ title, expectedPin, onSuccess, onCancel, subtitle }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (pin.length === 4) {
      if (pin === expectedPin) {
        onSuccess();
      } else {
        setError(true);
        setTimeout(() => {
          setPin('');
          setError(false);
        }, 500);
      }
    }
  }, [pin, expectedPin, onSuccess]);

  const handlePress = (num) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setError(false);
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  const buttons = [
    1, 2, 3,
    4, 5, 6,
    7, 8, 9,
    'C', 0, 'del'
  ];

  const padContent = (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '1rem',
      background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)'
    }}>
      <div 
        className={error ? 'animate-shake' : 'animate-fade-in'}
        style={{ 
          position: 'relative',
          width: '100%', maxWidth: '320px',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '2.5rem 2rem', 
          background: 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))',
          borderRadius: '2rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255,255,255,0.5) inset'
        }}
      >
        
        {onCancel && (
          <button 
            onClick={onCancel} 
            style={{
              position: 'absolute', top: '1.25rem', right: '1.25rem',
              width: '2rem', height: '2rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '50%', background: '#f1f5f9', color: '#64748b',
              border: 'none', cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        )}

        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#1e293b', textAlign: 'center', margin: 0 }}>
          {title || 'Masukkan PIN'}
        </h2>
        {subtitle && (
          <p style={{ color: '#64748b', fontSize: '0.875rem', textAlign: 'center', marginBottom: '2rem', marginTop: '0.5rem', fontWeight: 500 }}>
            {subtitle}
          </p>
        )}
        {!subtitle && <div style={{ marginBottom: '2rem' }}></div>}

        {/* PIN Indicators */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
          {[0, 1, 2, 3].map(i => (
            <div 
              key={i} 
              style={{ 
                width: '1rem', height: '1rem', borderRadius: '50%',
                transition: 'all 0.3s ease-out',
                transform: i < pin.length ? 'scale(1.1)' : 'scale(1)',
                background: i < pin.length ? 'var(--primary-color)' : '#e2e8f0',
                boxShadow: i < pin.length ? '0 0 12px rgba(99, 102, 241, 0.6)' : 'inset 0 2px 4px rgba(0,0,0,0.05)'
              }}
            ></div>
          ))}
        </div>

        {/* Numpad */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          columnGap: '1.5rem',
          rowGap: '1rem',
          width: '100%',
          padding: '0 0.5rem'
        }}>
          {buttons.map((btn, idx) => {
            const btnStyle = {
              height: '4rem', width: '4rem', margin: '0 auto',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid #f1f5f9', background: '#ffffff',
              color: '#334155', fontSize: '1.5rem', fontWeight: '600',
              cursor: 'pointer', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              fontFamily: 'inherit'
            };

            const specialBtnStyle = {
              ...btnStyle,
              border: 'none', background: 'transparent', boxShadow: 'none',
              color: '#94a3b8', fontSize: '1.125rem', fontWeight: 'bold'
            };

            if (btn === 'C') {
              return (
                <button key={idx} onClick={() => setPin('')} style={specialBtnStyle}>
                  C
                </button>
              );
            }
            if (btn === 'del') {
              return (
                <button key={idx} onClick={handleDelete} style={specialBtnStyle}>
                  <Delete size={22} />
                </button>
              );
            }
            return (
              <button key={idx} onClick={() => handlePress(btn)} style={btnStyle}>
                {btn}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(padContent, document.body) : padContent;
};

export default PinPad;
