import React, { useState, useRef, useEffect } from 'react';
import { evaluate } from 'mathjs';
import { X, Delete } from 'lucide-react';

const Calculator = ({ onClose }) => {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  
  // Ref for draggable
  const modalRef = useRef(null);
  const [position, setPosition] = useState({ x: window.innerWidth / 2 - 160, y: Math.max(window.innerHeight / 2 - 250, 20) });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      }
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleInput = (value) => {
    setExpression((prev) => prev + value);
    setResult('');
  };

  const calculate = () => {
    try {
      if (expression.trim() === '') return;
      // Evaluate using mathjs
      const evalResult = evaluate(expression);
      
      // Format number to avoid long decimals
      const formattedResult = typeof evalResult === 'number' 
        ? parseFloat(evalResult.toFixed(8)).toString() 
        : evalResult.toString();
        
      setResult(formattedResult);
    } catch (error) {
      setResult('Error');
    }
  };

  const clear = () => {
    setExpression('');
    setResult('');
  };

  const backspace = () => {
    setExpression((prev) => prev.slice(0, -1));
    setResult('');
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      const validChars = '0123456789.+-*/()^';
      if (validChars.includes(e.key)) {
        handleInput(e.key);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        calculate();
      } else if (e.key === 'Backspace') {
        backspace();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [expression, onClose]);

  const btnClass = "btn btn-outline py-3 px-0 font-bold text-lg hover:-translate-y-1 transition-all rounded-lg shadow-sm border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center";
  const funcBtnClass = "btn py-3 px-0 font-bold text-sm hover:-translate-y-1 transition-all rounded-lg shadow-sm border-gray-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 flex items-center justify-center border-0";
  const actionBtnClass = "btn py-3 px-0 font-bold text-lg hover:-translate-y-1 transition-all rounded-lg shadow-sm border-gray-200 flex items-center justify-center border-0";

  return (
    <div 
      ref={modalRef}
      className="calc-modal"
      style={{ 
        width: '320px', 
        left: `${position.x}px`, 
        top: `${position.y}px`
      }}
    >
      {/* Header / Drag Handle */}
      <div 
        className="calc-header"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm tracking-wider">KALKULATOR SAINTIFIK</span>
        </div>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }} onMouseDown={(e) => e.stopPropagation()}>
          <X size={18} />
        </button>
      </div>

      {/* Display */}
      <div className="calc-display">
        <div style={{ textAlign: 'right', color: '#6b7280', minHeight: '24px', fontSize: '0.875rem', wordBreak: 'break-all', fontFamily: 'monospace' }}>
          {expression || '0'}
        </div>
        <div style={{ textAlign: 'right', fontSize: '1.875rem', fontWeight: 'bold', color: '#1f2937', minHeight: '40px', marginTop: '0.25rem', overflow: 'hidden' }}>
          {result || ''}
        </div>
      </div>

      {/* Keypad */}
      <div className="calc-keypad">
        {/* Scientific Functions */}
        <button className={funcBtnClass} onClick={() => handleInput('sin(')}>sin</button>
        <button className={funcBtnClass} onClick={() => handleInput('cos(')}>cos</button>
        <button className={funcBtnClass} onClick={() => handleInput('tan(')}>tan</button>
        <button className={funcBtnClass} onClick={() => handleInput('log(')}>log</button>
        
        <button className={funcBtnClass} onClick={() => handleInput('sqrt(')}>√</button>
        <button className={funcBtnClass} onClick={() => handleInput('^')}>^</button>
        <button className={funcBtnClass} onClick={() => handleInput('(')}>(</button>
        <button className={funcBtnClass} onClick={() => handleInput(')')}>)</button>

        {/* Numbers & Basic Ops */}
        <button className={`${actionBtnClass} bg-red-100 text-red-700 hover:bg-red-200`} onClick={clear}>AC</button>
        <button className={`${actionBtnClass} bg-orange-100 text-orange-700 hover:bg-orange-200`} onClick={backspace}><Delete size={20} /></button>
        <button className={`${actionBtnClass} bg-blue-100 text-blue-700 hover:bg-blue-200`} onClick={() => handleInput('%')}>%</button>
        <button className={`${actionBtnClass} bg-blue-100 text-blue-700 hover:bg-blue-200 text-xl`} onClick={() => handleInput('/')}>÷</button>

        <button className={btnClass} onClick={() => handleInput('7')}>7</button>
        <button className={btnClass} onClick={() => handleInput('8')}>8</button>
        <button className={btnClass} onClick={() => handleInput('9')}>9</button>
        <button className={`${actionBtnClass} bg-blue-100 text-blue-700 hover:bg-blue-200 text-xl`} onClick={() => handleInput('*')}>×</button>

        <button className={btnClass} onClick={() => handleInput('4')}>4</button>
        <button className={btnClass} onClick={() => handleInput('5')}>5</button>
        <button className={btnClass} onClick={() => handleInput('6')}>6</button>
        <button className={`${actionBtnClass} bg-blue-100 text-blue-700 hover:bg-blue-200 text-2xl`} onClick={() => handleInput('-')}>-</button>

        <button className={btnClass} onClick={() => handleInput('1')}>1</button>
        <button className={btnClass} onClick={() => handleInput('2')}>2</button>
        <button className={btnClass} onClick={() => handleInput('3')}>3</button>
        <button className={`${actionBtnClass} bg-blue-100 text-blue-700 hover:bg-blue-200 text-2xl`} onClick={() => handleInput('+')}>+</button>

        <button className={`${btnClass} col-span-2`} onClick={() => handleInput('0')}>0</button>
        <button className={btnClass} onClick={() => handleInput('.')}>.</button>
        <button className={`${actionBtnClass} bg-indigo-600 text-white hover:bg-indigo-700 text-2xl shadow-md`} onClick={calculate}>=</button>
      </div>
    </div>
  );
};

export default Calculator;
