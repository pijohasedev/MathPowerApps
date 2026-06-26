const normalizeAnswer = (ans) => {
  if (!ans) return "";
  let s = String(ans).toLowerCase();
  
  // Buang unit RM (Ringgit Malaysia)
  s = s.replace(/rm/g, '');
  
  // Buang tanda dolar (LaTeX)
  s = s.replace(/\$/g, '');
  // Tukar pecahan LaTeX \frac{A}{B} kepada A/B
  s = s.replace(/\\frac\s*\{\s*([^{}]+)\s*\}\s*\{\s*([^{}]+)\s*\}/g, '$1/$2');
  // Tukar simbol darab
  s = s.replace(/\\times/g, 'x');
  s = s.replace(/\*/g, 'x');
  // Tukar simbol bahagi
  s = s.replace(/\\div/g, '/');
  // Tukar kuasa LaTeX
  s = s.replace(/\^\{\s*([^{}]+)\s*\}/g, '^$1');
  
  // Tukar perkataan 'dan', 'and', atau '&' kepada koma supaya "1 dan b" sama dengan "1, b"
  s = s.replace(/\bdan\b/g, ',');
  s = s.replace(/\band\b/g, ',');
  s = s.replace(/&/g, ',');
  
  // Buang koma supaya senarai jawapan (1, 2, 3) dan (1 2 3) menjadi sama (123)
  s = s.replace(/,/g, '');
  
  // Buang semua ruangan kosong
  s = s.replace(/\s+/g, '');
  return s;
};

console.log(normalizeAnswer("rm444 600"));
console.log(normalizeAnswer("444600"));
console.log(normalizeAnswer("RM444,600"));
console.log(normalizeAnswer("rm 444 600"));
