import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export default function LatexRenderer({ children }) {
  if (typeof children !== 'string') return <span style={{ whiteSpace: 'pre-wrap' }}>{children}</span>;

  // Split text by $...$
  const parts = children.split(/(\$.*?\$)/g);
  
  return (
    <span style={{ whiteSpace: 'pre-wrap' }}>
      {parts.map((part, index) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          const math = part.slice(1, -1);
          try {
            const html = katex.renderToString(math, { 
              throwOnError: false,
              displayMode: false
            });
            return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
          } catch (e) {
            return <span key={index} className="text-red-500">{part}</span>;
          }
        }
        // Sokongan untuk **huruf tebal**
        const boldParts = part.split(/(\*\*.*?\*\*)/g);
        return (
          <span key={index}>
            {boldParts.map((bPart, bIndex) => {
              if (bPart.startsWith('**') && bPart.endsWith('**')) {
                return <strong key={bIndex} style={{ fontWeight: '900', color: '#111827' }}>{bPart.slice(2, -2)}</strong>;
              }
              return <span key={bIndex}>{bPart}</span>;
            })}
          </span>
        );
      })}
    </span>
  );
}
