const fs = require('fs');
const text = fs.readFileSync('soalan md/Modul_Matematik_Tingkatan1_Bab1_Nombor_Nisbah.md', 'utf8');

const questionsRaw = text.split(/\*\*\s*(?:Soalan|S)\s*\d+[\s:.]*\*\*/i).slice(1);
const answersRaw = text.split(/(?:##|###)\s*(?:Soalan|S)\s*\d+[\s:.]*/i).slice(1);

console.log("Questions:", questionsRaw.length);
console.log("Answers:", answersRaw.length);
