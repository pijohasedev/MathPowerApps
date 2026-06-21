import re

with open("src/pages/ChildDashboard.jsx", "r") as f:
    content = f.read()

# 1. State Additions
find_state = "  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);"
replace_state = """  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [padananKiriTerpilih, setPadananKiriTerpilih] = useState(null);
  const [padananJawapan, setPadananJawapan] = useState([]);
  const [pelbagaiPilihanJawapan, setPelbagaiPilihanJawapan] = useState([]);
  const [dragDropItems, setDragDropItems] = useState([]);
  const [jadualJawapan, setJadualJawapan] = useState({});"""
content = content.replace(find_state, replace_state)

# 2. useEffect Additions
find_effect = "  const currentQ = mathQuestions[currentQuestionIndex];"
replace_effect = """  const currentQ = mathQuestions[currentQuestionIndex];
  
  useEffect(() => {
    if (currentQ) {
      setUserAnswer('');
      setPadananKiriTerpilih(null);
      setPadananJawapan([]);
      setPelbagaiPilihanJawapan([]);
      setJadualJawapan({});
      if (currentQ.jenisSoalan === 'drag_drop') {
         const allWords = [...(currentQ.dragDropJawapan || []), ...(currentQ.dragDropEkstra || [])];
         // shuffle deterministic-ish for drag drop initially
         allWords.sort(() => Math.random() - 0.5);
         setDragDropItems(allWords.map((w, i) => ({ id: i.toString(), word: w, placedAt: null })));
      }
    }
  }, [currentQ]);"""
content = content.replace(find_effect, replace_effect)

# 3. handleAnswerSubmit logic
find_handle = """    const normalizedChild = normalizeAnswer(finalAnswer);
    const normalizedParent = normalizeAnswer(currentQ.jawapan);

    if (normalizedChild === normalizedParent) {"""

replace_handle = """    let isCorrect = false;
    
    if (currentQ.jenisSoalan === 'pelbagai_pilihan') {
       const userSorted = [...pelbagaiPilihanJawapan].sort();
       const parentSorted = [...(currentQ.pelbagaiPilihanJawapan || [])].sort();
       isCorrect = JSON.stringify(userSorted) === JSON.stringify(parentSorted);
    } else if (currentQ.jenisSoalan === 'padankan') {
       if (padananJawapan.length === currentQ.padanan.length) {
         isCorrect = padananJawapan.every(p => {
           const orig = currentQ.padanan.find(origP => origP.id === p.kiriId);
           return orig && orig.kanan === p.kananText;
         });
       }
    } else if (currentQ.jenisSoalan === 'drag_drop') {
       const userAnswers = [];
       const blanksCount = (currentQ.soalan.match(/\\[kosong\\]/g) || []).length;
       for(let i=0; i<blanksCount; i++) {
         const item = dragDropItems.find(it => it.placedAt === i);
         userAnswers.push(item ? item.word : '');
       }
       isCorrect = JSON.stringify(userAnswers) === JSON.stringify(currentQ.dragDropJawapan || []);
    } else if (currentQ.jenisSoalan === 'jadual') {
       isCorrect = currentQ.jadualItems.every(i => jadualJawapan[i.id] === i.kategori);
    } else {
       const normalizedChild = normalizeAnswer(finalAnswer);
       const normalizedParent = normalizeAnswer(currentQ.jawapan);
       isCorrect = (normalizedChild === normalizedParent);
    }

    if (isCorrect) {"""
content = content.replace(find_handle, replace_handle)

# 4. UI Replacement
find_ui_start = "                      {currentQ?.jenisSoalan === 'objektif' ? ("
find_ui_end = """                          {['A', 'B', 'C', 'D'].map((opt) => (
                            <button 
                              key={opt}
                              className="btn btn-outline py-3 px-5 justify-start hover:bg-indigo-50 shadow-sm hover:shadow transition-all"
                              style={{ fontSize: '1.1rem', textAlign: 'left', whiteSpace: 'normal', height: 'auto' }}
                              onClick={() => handleAnswerSubmit(opt)}
                              disabled={feedback && feedback.isCorrect}
                            >
                              <span className="font-bold mr-3 text-primary">{opt}.</span> 
                              <div><LatexRenderer>{currentQ.pilihan[opt]}</LatexRenderer></div>
                            </button>
                          ))}
                        </div>
                      ) : ("""

replace_ui = """                      {currentQ?.jenisSoalan === 'objektif' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                          {['A', 'B', 'C', 'D'].map((opt) => (
                            <button 
                              key={opt}
                              className="btn btn-outline py-3 px-5 justify-start hover:bg-indigo-50 shadow-sm hover:shadow transition-all"
                              style={{ fontSize: '1.1rem', textAlign: 'left', whiteSpace: 'normal', height: 'auto' }}
                              onClick={() => handleAnswerSubmit(opt)}
                              disabled={feedback && feedback.isCorrect}
                            >
                              <span className="font-bold mr-3 text-primary">{opt}.</span> 
                              <div><LatexRenderer>{currentQ.pilihan[opt]}</LatexRenderer></div>
                            </button>
                          ))}
                        </div>
                      ) : currentQ?.jenisSoalan === 'pelbagai_pilihan' ? (
                        <div className="flex flex-col gap-4 text-left max-w-2xl mx-auto">
                          {['A', 'B', 'C', 'D'].map((opt) => (
                            <label key={opt} className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${pelbagaiPilihanJawapan.includes(opt) ? 'bg-indigo-50 border-indigo-500' : 'bg-white hover:bg-gray-50'}`}>
                              <input 
                                type="checkbox" 
                                className="w-6 h-6 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                checked={pelbagaiPilihanJawapan.includes(opt)}
                                onChange={(e) => {
                                  if (e.target.checked) setPelbagaiPilihanJawapan([...pelbagaiPilihanJawapan, opt]);
                                  else setPelbagaiPilihanJawapan(pelbagaiPilihanJawapan.filter(x => x !== opt));
                                }}
                                disabled={feedback && feedback.isCorrect}
                              />
                              <span className="font-bold text-primary">{opt}.</span> 
                              <div className="flex-1"><LatexRenderer>{currentQ.pilihan[opt]}</LatexRenderer></div>
                            </label>
                          ))}
                          <button className="btn btn-secondary mt-4 py-3" onClick={() => handleAnswerSubmit('submit')} disabled={feedback && feedback.isCorrect}>Hantar Jawapan</button>
                        </div>
                      ) : currentQ?.jenisSoalan === 'padankan' ? (
                        <div className="flex flex-col gap-4 max-w-3xl mx-auto">
                          <p className="text-sm text-muted text-center font-bold">Langkah 1: Klik item di Kiri. Langkah 2: Klik jawapan di Kanan.</p>
                          <div className="flex gap-8">
                            {/* Kiri */}
                            <div className="flex-1 flex flex-col gap-3">
                              {currentQ.padanan.map((p) => {
                                const isAnswered = padananJawapan.find(ans => ans.kiriId === p.id);
                                const isSelected = padananKiriTerpilih === p.id;
                                return (
                                  <button 
                                    key={`kiri-${p.id}`}
                                    className={`p-4 border-2 rounded-xl transition-all ${isAnswered ? 'bg-green-50 border-green-300 opacity-50 cursor-not-allowed' : isSelected ? 'bg-indigo-100 border-indigo-500 shadow-md transform scale-105' : 'bg-white hover:border-indigo-300'}`}
                                    onClick={() => !isAnswered && setPadananKiriTerpilih(p.id)}
                                    disabled={isAnswered || (feedback && feedback.isCorrect)}
                                  >
                                    <LatexRenderer>{p.kiri}</LatexRenderer>
                                    {isAnswered && <span className="block text-xs text-green-700 mt-2 font-bold">✓ Dipadankan</span>}
                                  </button>
                                );
                              })}
                            </div>
                            
                            {/* Kanan */}
                            <div className="flex-1 flex flex-col gap-3">
                              {currentQ.padanan.map((p, idx) => {
                                const kananIdx = (idx + 1) % currentQ.padanan.length;
                                const kananItem = currentQ.padanan[kananIdx];
                                
                                const isAnswered = padananJawapan.find(ans => ans.kananText === kananItem.kanan);
                                return (
                                  <button 
                                    key={`kanan-${kananItem.id}`}
                                    className={`p-4 border-2 rounded-xl transition-all ${isAnswered ? 'bg-green-50 border-green-300 opacity-50 cursor-not-allowed' : 'bg-white hover:bg-gray-50 hover:border-indigo-300 shadow-sm'}`}
                                    onClick={() => {
                                      if (!isAnswered && padananKiriTerpilih) {
                                        setPadananJawapan([...padananJawapan, { kiriId: padananKiriTerpilih, kananText: kananItem.kanan }]);
                                        setPadananKiriTerpilih(null);
                                      }
                                    }}
                                    disabled={isAnswered || (feedback && feedback.isCorrect)}
                                  >
                                    <LatexRenderer>{kananItem.kanan}</LatexRenderer>
                                    {isAnswered && <span className="block text-xs text-green-700 mt-2 font-bold">✓ Dipadankan</span>}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                          <div className="flex justify-between mt-4">
                            <button className="btn btn-outline" onClick={() => {setPadananJawapan([]); setPadananKiriTerpilih(null);}}>Padam Semua Padanan (Reset)</button>
                            <button className="btn btn-secondary" onClick={() => handleAnswerSubmit('submit')} disabled={feedback && feedback.isCorrect}>Hantar Jawapan</button>
                          </div>
                        </div>
                      ) : currentQ?.jenisSoalan === 'jadual' ? (
                        <div className="flex flex-col gap-4 max-w-3xl mx-auto">
                          <table className="w-full text-center border-collapse bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                            <thead>
                              <tr className="bg-indigo-50 border-b border-indigo-100">
                                <th className="p-4 font-bold text-indigo-900 border-r border-indigo-100 w-1/3">Soalan</th>
                                <th className="p-4 font-bold text-indigo-900">Pilih Jawapan</th>
                              </tr>
                            </thead>
                            <tbody>
                              {currentQ.jadualItems.map((item, idx) => (
                                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                                  <td className="p-4 font-bold text-lg text-primary border-r border-gray-100 bg-white"><LatexRenderer>{item.item}</LatexRenderer></td>
                                  <td className="p-4 flex flex-col md:flex-row gap-2 justify-center">
                                      {currentQ.jadualKategori.map(k => (
                                        <button
                                          key={k}
                                          className={`flex-1 px-4 py-3 rounded-lg border font-bold text-sm transition-all ${jadualJawapan[item.id] === k ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-[1.02]' : 'bg-white text-gray-600 border-gray-300 hover:bg-indigo-50'}`}
                                          onClick={() => setJadualJawapan({...jadualJawapan, [item.id]: k})}
                                          disabled={feedback && feedback.isCorrect}
                                        >
                                          {k}
                                        </button>
                                      ))}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <button className="btn btn-secondary mt-4 py-3 w-full max-w-xs mx-auto text-lg shadow-md" onClick={() => handleAnswerSubmit('submit')} disabled={feedback && feedback.isCorrect}>Hantar Jawapan</button>
                        </div>
                      ) : currentQ?.jenisSoalan === 'drag_drop' ? (
                        <div className="flex flex-col gap-6 max-w-3xl mx-auto">
                          <div className="bg-white p-8 rounded-2xl shadow-sm border border-indigo-100 text-xl leading-loose font-medium text-gray-800">
                            {currentQ.soalan.split('[kosong]').map((part, index, arr) => (
                              <React.Fragment key={index}>
                                <LatexRenderer>{part}</LatexRenderer>
                                {index < arr.length - 1 && (
                                  <span 
                                    className="inline-block min-w-[100px] h-12 px-4 mx-2 align-middle border-2 border-dashed border-indigo-400 bg-indigo-50 rounded-lg text-center font-bold text-indigo-700 shadow-inner"
                                    style={{ lineHeight: '2.5rem' }}
                                    onDragOver={e => e.preventDefault()}
                                    onDrop={e => {
                                      e.preventDefault();
                                      const draggedId = e.dataTransfer.getData('text/plain');
                                      setDragDropItems(items => items.map(it => {
                                        if (it.placedAt === index) return {...it, placedAt: null};
                                        if (it.id === draggedId) return {...it, placedAt: index};
                                        return it;
                                      }));
                                    }}
                                  >
                                    {dragDropItems.find(it => it.placedAt === index)?.word || ''}
                                  </span>
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                          
                          <div className="bg-indigo-50/50 p-6 rounded-xl border border-indigo-100 min-h-[120px] flex flex-wrap gap-4 items-center justify-center"
                               onDragOver={e => e.preventDefault()}
                               onDrop={e => {
                                  e.preventDefault();
                                  const draggedId = e.dataTransfer.getData('text/plain');
                                  setDragDropItems(items => items.map(it => 
                                    it.id === draggedId ? {...it, placedAt: null} : it
                                  ));
                               }}
                          >
                            <span className="w-full text-center text-sm font-bold text-indigo-400 mb-2 uppercase tracking-wider">Pilihan Jawapan: (Tarik ke atas)</span>
                            {dragDropItems.filter(it => it.placedAt === null).map(it => (
                              <div 
                                key={it.id}
                                draggable={!(feedback && feedback.isCorrect)}
                                onDragStart={e => e.dataTransfer.setData('text/plain', it.id)}
                                className="bg-white border-2 border-indigo-300 px-6 py-3 rounded-xl font-bold text-indigo-900 cursor-grab shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
                              >
                                {it.word}
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex justify-between mt-4">
                            <button className="btn btn-outline" onClick={() => setDragDropItems(items => items.map(it => ({...it, placedAt: null})))}>Reset Semua</button>
                            <button className="btn btn-secondary px-8 py-3 shadow-md" onClick={() => handleAnswerSubmit('submit')} disabled={feedback && feedback.isCorrect}>Hantar Jawapan</button>
                          </div>
                        </div>
                      ) : ("""
import re
content = re.sub(re.escape(find_ui_start) + r".*?" + re.escape(find_ui_end), replace_ui, content, flags=re.DOTALL)

with open("src/pages/ChildDashboard.jsx", "w") as f:
    f.write(content)

