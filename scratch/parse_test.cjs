const fs = require('fs');

const text = fs.readFileSync('../input/Modul_Pemfaktoran_Tingkatan_2.md', 'utf8');

const questionsRaw = text.split(/\*\*Soalan \d+\*\*/i).slice(1);
const answersRaw = text.split(/## Soalan \d+/i).slice(1);

let successCount = 0;
for (let i = 0; i < questionsRaw.length; i++) {
  const qTextChunk = questionsRaw[i].split(/---|##/)[0].trim();
  let aTextChunk = "";
  
  if (answersRaw[i]) {
    const ansParts = answersRaw[i].split('---')[0].split('\n');
    aTextChunk = ansParts.slice(1).join('\n').trim();
  }

  const firstSubMatch = /^\([a-z]\)/m.exec(qTextChunk);
  let rootText = qTextChunk;
  
  if (firstSubMatch) {
    rootText = qTextChunk.substring(0, firstSubMatch.index).trim();
    const lines = qTextChunk.substring(firstSubMatch.index).split('\n');
    let tempSubQ = [];
    let currentLetter = '';
    let currentText = [];
    for(let line of lines) {
       const m = line.match(/^\(([a-z])\)(.*)/);
       if (m) {
          if (currentLetter) {
             tempSubQ.push({ letter: currentLetter, text: currentText.join('\n').trim() });
          }
          currentLetter = m[1];
          currentText = [m[2].trim()];
       } else if (currentLetter) {
          currentText.push(line);
       }
    }
    if (currentLetter) {
       tempSubQ.push({ letter: currentLetter, text: currentText.join('\n').trim() });
    }
    
    let tempSubA = {};
    if (aTextChunk) {
       const aLines = aTextChunk.split('\n');
       let curALetter = '';
       let curAText = [];
       for(let line of aLines) {
          const m = line.match(/^\(([a-z])\)(.*)/);
          if (m) {
             if (curALetter) {
                tempSubA[curALetter] = curAText.join('\n').trim();
             }
             curALetter = m[1];
             curAText = [m[2].trim()];
          } else if (curALetter) {
             curAText.push(line);
          }
       }
       if (curALetter) {
          tempSubA[curALetter] = curAText.join('\n').trim();
       }
    }
    
    for(let sub of tempSubQ) {
       const fullQuestion = `${rootText}\n(${sub.letter}) ${sub.text}`.trim();
       const fullAnswer = tempSubA[sub.letter] || "Tiada Skema";
       console.log(`\n=== SOALAN ${i+1}${sub.letter} ===\n${fullQuestion}\n--JAWAPAN--\n${fullAnswer}`);
    }
  } else {
     console.log(`\n=== SOALAN ${i+1} ===\n${qTextChunk}\n--JAWAPAN--\n${aTextChunk}`);
  }
}
