// Utility to generate deterministic 20 questions for Latihan Asas daily (Secondary School Level / Sekolah Menengah)

// Simple Pseudo-Random Generator based on seed
function createRandom(seedString) {
  let seed = 0;
  for (let i = 0; i < seedString.length; i++) {
    seed = (seed << 5) - seed + seedString.charCodeAt(i);
    seed |= 0;
  }
  seed = Math.abs(seed);
  return function () {
    seed = (seed * 9301 + 49297) % 233280;
    return Math.abs(seed) / 233280;
  };
}

function getRandomInt(rng, min, max) {
  const r = Math.min(0.99999, Math.max(0, rng()));
  const val = Math.floor(r * (max - min + 1)) + min;
  return Math.min(max, Math.max(min, val));
}

// Helper to simplify fraction (gcd)
function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
}

function formatFraction(num, den) {
  if (num === 0) return ["0"];
  if (den === 1) return [`${num}`];
  if (num === den) return ["1"];
  
  const g = gcd(num, den);
  const sNum = num / g;
  const sDen = den / g;
  
  const results = [`${sNum}/${sDen}`];
  if (g !== 1) {
    results.push(`${num}/${den}`);
  }

  // Add mixed fraction form if applicable
  if (sNum > sDen && sDen !== 1) {
    const whole = Math.floor(sNum / sDen);
    const rem = sNum % sDen;
    if (rem > 0) {
      results.push(`${whole} ${rem}/${sDen}`);
      results.push(`${whole}${rem}/${sDen}`);
    }
  }
  return results;
}

// 1. Generate Nombor Bulat (Sekolah Menengah Level)
function generateNomborBulat(rng, op) {
  let a, b, qText, ans, explanation;
  switch (op) {
    case '+':
      a = getRandomInt(rng, 1250, 9850);
      b = getRandomInt(rng, 850, 8450);
      ans = String(a + b);
      qText = `${a.toLocaleString('en-US')} + ${b.toLocaleString('en-US')}`;
      explanation = `${a.toLocaleString('en-US')} + ${b.toLocaleString('en-US')} = ${(a + b).toLocaleString('en-US')}`;
      break;
    case '-':
      a = getRandomInt(rng, 5400, 24500);
      b = getRandomInt(rng, 1250, a - 500);
      ans = String(a - b);
      qText = `${a.toLocaleString('en-US')} - ${b.toLocaleString('en-US')}`;
      explanation = `${a.toLocaleString('en-US')} - ${b.toLocaleString('en-US')} = ${(a - b).toLocaleString('en-US')}`;
      break;
    case '×':
      a = getRandomInt(rng, 125, 650);
      b = getRandomInt(rng, 12, 48);
      ans = String(a * b);
      qText = `${a.toLocaleString('en-US')} \\times ${b}`;
      explanation = `${a} \\times ${b} = ${(a * b).toLocaleString('en-US')}`;
      break;
    case '÷':
    default:
      b = getRandomInt(rng, 12, 45);
      ans = String(getRandomInt(rng, 45, 350));
      a = parseInt(ans) * b;
      qText = `${a.toLocaleString('en-US')} \\div ${b}`;
      explanation = `${a.toLocaleString('en-US')} \\div ${b} = ${ans}`;
      break;
  }

  const acceptable = [ans, ans.replace(/,/g, '')];
  const numVal = parseInt(ans);
  if (!isNaN(numVal)) {
    acceptable.push(numVal.toLocaleString('en-US'));
  }

  return {
    topic: 'Nombor Bulat',
    operation: op,
    questionText: qText,
    answer: ans,
    acceptableAnswers: acceptable,
    explanation
  };
}

// 2. Generate Pecahan (Sekolah Menengah Level - Different denominators & mixed numbers)
function generatePecahan(rng, op) {
  let d1, d2, n1, n2, qText, ansList, explanation;
  
  switch (op) {
    case '+': {
      d1 = getRandomInt(rng, 3, 9);
      do {
        d2 = getRandomInt(rng, 3, 10);
      } while (d2 === d1);
      n1 = getRandomInt(rng, 1, d1 - 1);
      n2 = getRandomInt(rng, 1, d2 - 1);
      
      const resNum = n1 * d2 + n2 * d1;
      const resDen = d1 * d2;
      ansList = formatFraction(resNum, resDen);
      qText = `\\frac{${n1}}{${d1}} + \\frac{${n2}}{${d2}}`;
      explanation = `\\frac{${n1} \\times ${d2}}{${d1} \\times ${d2}} + \\frac{${n2} \\times ${d1}}{${d2} \\times ${d1}} = \\frac{${resNum}}{${resDen}} = ${ansList[0]}`;
      break;
    }
    case '-': {
      d1 = getRandomInt(rng, 3, 8);
      do {
        d2 = getRandomInt(rng, 3, 9);
      } while (d2 === d1);
      n1 = getRandomInt(rng, 2, d1);
      n2 = getRandomInt(rng, 1, d2 - 1);
      if (n1 * d2 <= n2 * d1) {
        n1 = d1;
      }
      
      const resNum = n1 * d2 - n2 * d1;
      const resDen = d1 * d2;
      ansList = formatFraction(resNum, resDen);
      qText = `\\frac{${n1}}{${d1}} - \\frac{${n2}}{${d2}}`;
      explanation = `\\frac{${n1} \\times ${d2}}{${d1} \\times ${d2}} - \\frac{${n2} \\times ${d1}}{${d2} \\times ${d1}} = \\frac{${resNum}}{${resDen}} = ${ansList[0]}`;
      break;
    }
    case '×': {
      d1 = getRandomInt(rng, 3, 8);
      d2 = getRandomInt(rng, 3, 8);
      n1 = getRandomInt(rng, 1, d1 + 2);
      n2 = getRandomInt(rng, 1, d2 + 2);
      const resNum = n1 * n2;
      const resDen = d1 * d2;
      ansList = formatFraction(resNum, resDen);
      qText = `\\frac{${n1}}{${d1}} \\times \\frac{${n2}}{${d2}}`;
      explanation = `\\frac{${n1} \\times ${n2}}{${d1} \\times ${d2}} = \\frac{${resNum}}{${resDen}} = ${ansList[0]}`;
      break;
    }
    case '÷':
    default: {
      d1 = getRandomInt(rng, 3, 8);
      d2 = getRandomInt(rng, 3, 8);
      n1 = getRandomInt(rng, 1, d1 + 2);
      n2 = getRandomInt(rng, 1, d2 - 1);
      const resNum = n1 * d2;
      const resDen = d1 * n2;
      ansList = formatFraction(resNum, resDen);
      qText = `\\frac{${n1}}{${d1}} \\div \\frac{${n2}}{${d2}}`;
      explanation = `\\frac{${n1}}{${d1}} \\times \\frac{${d2}}{${n2}} = \\frac{${resNum}}{${resDen}} = ${ansList[0]}`;
      break;
    }
  }

  return {
    topic: 'Pecahan',
    operation: op,
    questionText: qText,
    answer: ansList[0],
    acceptableAnswers: ansList,
    explanation
  };
}

// 3. Generate Nombor Perpuluhan (Sekolah Menengah Level - 2 to 3 decimal places)
function generatePerpuluhan(rng, op) {
  let a, b, qText, ansStr, explanation;
  switch (op) {
    case '+': {
      a = (getRandomInt(rng, 1250, 9850) / 100).toFixed(2);
      b = (getRandomInt(rng, 850, 7450) / 100).toFixed(2);
      const sum = (parseFloat(a) + parseFloat(b)).toFixed(2);
      ansStr = String(parseFloat(sum));
      qText = `${a} + ${b}`;
      explanation = `${a} + ${b} = ${ansStr}`;
      break;
    }
    case '-': {
      a = (getRandomInt(rng, 4500, 15000) / 100).toFixed(2);
      b = (getRandomInt(rng, 1200, Math.floor(parseFloat(a) * 100 - 500)) / 100).toFixed(2);
      const diff = (parseFloat(a) - parseFloat(b)).toFixed(2);
      ansStr = String(parseFloat(diff));
      qText = `${a} - ${b}`;
      explanation = `${a} - ${b} = ${ansStr}`;
      break;
    }
    case '×': {
      a = (getRandomInt(rng, 125, 850) / 10).toFixed(1);
      b = (getRandomInt(rng, 12, 45) / 10).toFixed(1);
      const prod = (parseFloat(a) * parseFloat(b)).toFixed(2);
      ansStr = String(parseFloat(prod));
      qText = `${a} \\times ${b}`;
      explanation = `${a} \\times ${b} = ${ansStr}`;
      break;
    }
    case '÷':
    default: {
      b = (getRandomInt(rng, 12, 45) / 10).toFixed(1);
      const quotient = (getRandomInt(rng, 125, 650) / 10).toFixed(1);
      a = (parseFloat(quotient) * parseFloat(b)).toFixed(2);
      ansStr = String(parseFloat(quotient));
      qText = `${a} \\div ${b}`;
      explanation = `${a} \\div ${b} = ${ansStr}`;
      break;
    }
  }

  const acceptable = [ansStr];
  if (!ansStr.includes('.') && ansStr !== '0') {
    acceptable.push(ansStr + '.0');
    acceptable.push(ansStr + '.00');
  } else if (ansStr.split('.')[1]?.length === 1) {
    acceptable.push(ansStr + '0');
  }

  return {
    topic: 'Nombor Perpuluhan',
    operation: op,
    questionText: qText,
    answer: ansStr,
    acceptableAnswers: acceptable,
    explanation
  };
}

// 4. Generate Peratus (Sekolah Menengah Level)
function generatePeratus(rng, opIndex) {
  let qText, ansStr, acceptable = [], explanation;
  const pList = [5, 12, 15, 18, 25, 35, 45, 65, 75, 85, 110, 125, 150];

  if (opIndex === 0) { // Percentage of larger quantity
    const pct = pList[getRandomInt(rng, 0, pList.length - 1)];
    const base = getRandomInt(rng, 15, 120) * 40;
    const val = (pct / 100) * base;
    ansStr = String(val);
    qText = `${pct}\\% \\text{ daripada } ${base.toLocaleString('en-US')}`;
    acceptable = [ansStr, `${ansStr}%`, val.toLocaleString('en-US')];
    explanation = `\\frac{${pct}}{100} \\times ${base.toLocaleString('en-US')} = ${ansStr}`;
  } else if (opIndex === 1) { // Finding Percentage
    const base = getRandomInt(rng, 4, 25) * 20;
    const pct = getRandomInt(rng, 1, 19) * 5;
    const part = (pct / 100) * base;
    ansStr = `${pct}%`;
    qText = `\\text{Berapa peratuskah } ${part} \\text{ daripada } ${base}?`;
    acceptable = [`${pct}%`, `${pct}`];
    explanation = `\\frac{${part}}{${base}} \\times 100\\% = ${pct}\\%`;
  } else if (opIndex === 2) { // Fraction to Percentage with non-trivial denominators
    const fracMap = [
      { n: 3, d: 8, pct: 37.5 },
      { n: 5, d: 8, pct: 62.5 },
      { n: 7, d: 8, pct: 87.5 },
      { n: 7, d: 20, pct: 35 },
      { n: 9, d: 20, pct: 45 },
      { n: 13, d: 20, pct: 65 },
      { n: 17, d: 20, pct: 85 },
      { n: 3, d: 25, pct: 12 },
      { n: 7, d: 25, pct: 28 },
      { n: 18, d: 25, pct: 72 },
      { n: 9, d: 50, pct: 18 },
      { n: 21, d: 50, pct: 42 }
    ];
    const item = fracMap[getRandomInt(rng, 0, fracMap.length - 1)];
    ansStr = `${item.pct}%`;
    qText = `\\text{Tukar } \\frac{${item.n}}{${item.d}} \\text{ kepada peratus}`;
    acceptable = [`${item.pct}%`, `${item.pct}`];
    explanation = `\\frac{${item.n}}{${item.d}} \\times 100\\% = ${item.pct}\\%`;
  } else { // Percentage Greater than 100%
    const pct = getRandomInt(rng, 11, 25) * 10;
    const base = getRandomInt(rng, 12, 80) * 10;
    const val = (pct / 100) * base;
    ansStr = String(val);
    qText = `\\text{Nilaikan } ${pct}\\% \\text{ daripada } ${base.toLocaleString('en-US')}`;
    acceptable = [ansStr, `${ansStr}%`, val.toLocaleString('en-US')];
    explanation = `\\frac{${pct}}{100} \\times ${base} = ${ansStr}`;
  }

  return {
    topic: 'Peratus',
    operation: '%',
    questionText: qText,
    answer: ansStr,
    acceptableAnswers: acceptable,
    explanation
  };
}

/**
 * Generate 20 daily questions balanced across 4 topics and 4 operations
 * @param {string} dateStr - 'YYYY-MM-DD'
 * @param {string} childId - Child identifier
 * @returns {Array} List of 20 question objects
 */
export function generateDailyAsasQuestions(dateStr, childId = '') {
  const seedStr = `latihan_asas_${dateStr}_${childId}`;
  const rng = createRandom(seedStr);
  const questions = [];

  const ops = ['+', '-', '×', '÷'];

  // 5 Nombor Bulat
  for (let i = 0; i < 5; i++) {
    const op = ops[i % 4];
    questions.push(generateNomborBulat(rng, op));
  }

  // 5 Pecahan
  for (let i = 0; i < 5; i++) {
    const op = ops[i % 4];
    questions.push(generatePecahan(rng, op));
  }

  // 5 Nombor Perpuluhan
  for (let i = 0; i < 5; i++) {
    const op = ops[i % 4];
    questions.push(generatePerpuluhan(rng, op));
  }

  // 5 Peratus
  for (let i = 0; i < 5; i++) {
    questions.push(generatePeratus(rng, i % 4));
  }

  // Shuffle questions deterministically using the same rng
  for (let i = questions.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [questions[i], questions[j]] = [questions[j], questions[i]];
  }

  // Add question IDs
  return questions.map((q, idx) => ({
    id: `la_${dateStr}_${idx + 1}`,
    index: idx + 1,
    ...q
  }));
}
