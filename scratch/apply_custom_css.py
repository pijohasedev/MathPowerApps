with open("src/pages/ChildDashboard.jsx", "r") as f:
    content = f.read()

# Padankan 
find_padankan = """                      ) : currentQ?.jenisSoalan === 'padankan' ? (
                        <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
                          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl shadow-sm">
                            <p className="text-lg text-indigo-900 text-center font-bold mb-1">Teka & Padankan!</p>
                            <p className="text-sm text-indigo-700 text-center font-medium">Langkah 1: Klik kotak di sebelah Kiri. Langkah 2: Klik jawapan yang sepadan di sebelah Kanan.</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-6 md:gap-16 w-full px-2 relative">
                            {/* Kiri */}
                            <div className="flex flex-col gap-5">
                              <h4 className="text-center font-bold text-gray-500 uppercase tracking-widest mb-2">Soalan</h4>
                              {(currentQ.padanan || []).map((p) => {
                                const isAnswered = padananJawapan.find(ans => ans.kiriId === p.id);
                                const isSelected = padananKiriTerpilih === p.id;
                                return (
                                  <button 
                                    key={`kiri-${p.id}`}
                                    className={`relative flex flex-col items-center justify-center w-full min-h-[110px] border-4 rounded-2xl transition-all duration-300 ease-in-out font-extrabold text-2xl shadow-sm ${isAnswered ? 'bg-green-100 border-green-400 opacity-60 cursor-not-allowed scale-95' : isSelected ? 'bg-indigo-100 border-indigo-500 shadow-xl transform scale-105 ring-4 ring-indigo-200 text-indigo-900' : 'bg-white border-indigo-200 hover:border-indigo-400 hover:shadow-lg hover:-translate-y-1 text-gray-800'}`}
                                    onClick={() => !isAnswered && setPadananKiriTerpilih(p.id)}
                                    disabled={isAnswered || (feedback && feedback.isCorrect)}
                                  >
                                    <LatexRenderer>{p.kiri}</LatexRenderer>
                                    {isAnswered && <span className="absolute bottom-1 block text-xs text-green-700 font-extrabold tracking-widest uppercase bg-white/80 px-2 py-1 rounded-full">✓ Selesai</span>}
                                    {isSelected && <span className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-500 rounded-full border-4 border-white shadow-md z-10 flex items-center justify-center animate-pulse"><div className="w-2 h-2 bg-white rounded-full"></div></span>}
                                  </button>
                                );
                              })}
                            </div>
                            
                            {/* Kanan */}
                            <div className="flex flex-col gap-5">
                              <h4 className="text-center font-bold text-gray-500 uppercase tracking-widest mb-2">Jawapan</h4>
                              {(currentQ.padanan || []).map((p, idx) => {
                                const kananIdx = (idx + 1) % (currentQ.padanan || []).length;
                                const kananItem = (currentQ.padanan || [])[kananIdx];
                                
                                const isAnswered = padananJawapan.find(ans => ans.kananText === kananItem.kanan);
                                return (
                                  <button 
                                    key={`kanan-${kananItem.id}`}
                                    className={`relative flex flex-col items-center justify-center w-full min-h-[110px] border-4 rounded-2xl transition-all duration-300 ease-in-out font-extrabold text-2xl shadow-sm ${isAnswered ? 'bg-green-100 border-green-400 opacity-60 cursor-not-allowed scale-95' : 'bg-white border-pink-200 hover:border-pink-400 hover:shadow-lg hover:-translate-y-1 text-gray-800 hover:text-pink-600'}`}
                                    onClick={() => {
                                      if (!isAnswered && padananKiriTerpilih) {
                                        setPadananJawapan([...padananJawapan, { kiriId: padananKiriTerpilih, kananText: kananItem.kanan }]);
                                        setPadananKiriTerpilih(null);
                                      }
                                    }}
                                    disabled={isAnswered || (feedback && feedback.isCorrect)}
                                  >
                                    {padananKiriTerpilih && !isAnswered && <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-pink-100 rounded-full border-4 border-white shadow-md z-10 animate-bounce" />}
                                    <LatexRenderer>{kananItem.kanan}</LatexRenderer>
                                    {isAnswered && <span className="absolute bottom-1 block text-xs text-green-700 font-extrabold tracking-widest uppercase bg-white/80 px-2 py-1 rounded-full">✓ Selesai</span>}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-100">
                            <button className="btn btn-outline text-gray-600 border-gray-300 hover:bg-gray-50 px-6" onClick={() => {setPadananJawapan([]); setPadananKiriTerpilih(null);}}>Padam Semua Padanan (Reset)</button>
                            <button className="btn btn-secondary px-10 py-4 shadow-lg text-lg transform hover:-translate-y-1" onClick={() => handleAnswerSubmit('submit')} disabled={feedback && feedback.isCorrect}>Sahkan Jawapan</button>
                          </div>
                        </div>
                      ) : currentQ?.jenisSoalan === 'jadual' ? ("""

replace_padankan = """                      ) : currentQ?.jenisSoalan === 'padankan' ? (
                        <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
                          <div className="text-center mb-4">
                            <p className="text-primary font-bold" style={{fontSize: '1.2rem'}}>Teka & Padankan!</p>
                            <p className="text-muted">Langkah 1: Klik kotak di sebelah Kiri. Langkah 2: Klik jawapan yang sepadan di sebelah Kanan.</p>
                          </div>
                          
                          <div className="padanan-container">
                            {/* Kiri */}
                            <div className="flex-1">
                              <h4 className="padanan-title">Soalan</h4>
                              {(currentQ.padanan || []).map((p) => {
                                const isAnswered = padananJawapan.find(ans => ans.kiriId === p.id);
                                const isSelected = padananKiriTerpilih === p.id;
                                let classes = "padanan-box padanan-box-kiri";
                                if (isSelected) classes += " selected";
                                if (isAnswered) classes += " answered";
                                return (
                                  <button 
                                    key={`kiri-${p.id}`}
                                    className={classes}
                                    onClick={() => !isAnswered && setPadananKiriTerpilih(p.id)}
                                    disabled={isAnswered || (feedback && feedback.isCorrect)}
                                  >
                                    <LatexRenderer>{p.kiri}</LatexRenderer>
                                    {isAnswered && <span className="padanan-done-badge">✓ Selesai</span>}
                                    {isSelected && <span className="padanan-indicator padanan-indicator-kiri"></span>}
                                  </button>
                                );
                              })}
                            </div>
                            
                            {/* Kanan */}
                            <div className="flex-1">
                              <h4 className="padanan-title">Jawapan</h4>
                              {(currentQ.padanan || []).map((p, idx) => {
                                const kananIdx = (idx + 1) % (currentQ.padanan || []).length;
                                const kananItem = (currentQ.padanan || [])[kananIdx];
                                
                                const isAnswered = padananJawapan.find(ans => ans.kananText === kananItem.kanan);
                                let classes = "padanan-box padanan-box-kanan";
                                if (isAnswered) classes += " answered";
                                return (
                                  <button 
                                    key={`kanan-${kananItem.id}`}
                                    className={classes}
                                    onClick={() => {
                                      if (!isAnswered && padananKiriTerpilih) {
                                        setPadananJawapan([...padananJawapan, { kiriId: padananKiriTerpilih, kananText: kananItem.kanan }]);
                                        setPadananKiriTerpilih(null);
                                      }
                                    }}
                                    disabled={isAnswered || (feedback && feedback.isCorrect)}
                                  >
                                    {padananKiriTerpilih && !isAnswered && <span className="padanan-indicator padanan-indicator-kanan"></span>}
                                    <LatexRenderer>{kananItem.kanan}</LatexRenderer>
                                    {isAnswered && <span className="padanan-done-badge">✓ Selesai</span>}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                          <div className="flex justify-between items-center mt-6 pt-4" style={{borderTop: '1px solid #e2e8f0'}}>
                            <button className="btn btn-outline" onClick={() => {setPadananJawapan([]); setPadananKiriTerpilih(null);}}>Padam Semua Padanan (Reset)</button>
                            <button className="btn btn-secondary" style={{padding: '1rem 2.5rem', fontSize: '1.2rem'}} onClick={() => handleAnswerSubmit('submit')} disabled={feedback && feedback.isCorrect}>Sahkan Jawapan</button>
                          </div>
                        </div>
                      ) : currentQ?.jenisSoalan === 'jadual' ? ("""

content = content.replace(find_padankan, replace_padankan)

# Pelbagai Pilihan
find_pelbagai = """                      ) : currentQ?.jenisSoalan === 'pelbagai_pilihan' ? (
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
                              <div className="flex-1"><LatexRenderer>{(currentQ.pilihan || {})[opt]}</LatexRenderer></div>
                            </label>
                          ))}
                          <button className="btn btn-secondary mt-4 py-3" onClick={() => handleAnswerSubmit('submit')} disabled={feedback && feedback.isCorrect}>Hantar Jawapan</button>
                        </div>
                      ) : currentQ?.jenisSoalan === 'padankan' ? ("""

replace_pelbagai = """                      ) : currentQ?.jenisSoalan === 'pelbagai_pilihan' ? (
                        <div className="flex flex-col gap-4 text-left max-w-2xl mx-auto w-full">
                          {['A', 'B', 'C', 'D'].map((opt) => (
                            <label key={opt} className={`checkbox-label ${pelbagaiPilihanJawapan.includes(opt) ? 'checked' : ''}`}>
                              <input 
                                type="checkbox" 
                                className="checkbox-input"
                                checked={pelbagaiPilihanJawapan.includes(opt)}
                                onChange={(e) => {
                                  if (e.target.checked) setPelbagaiPilihanJawapan([...pelbagaiPilihanJawapan, opt]);
                                  else setPelbagaiPilihanJawapan(pelbagaiPilihanJawapan.filter(x => x !== opt));
                                }}
                                disabled={feedback && feedback.isCorrect}
                              />
                              <span className="text-primary" style={{fontWeight: '800', fontSize: '1.2rem'}}>{opt}.</span> 
                              <div style={{flex: 1, fontSize: '1.1rem'}}><LatexRenderer>{(currentQ.pilihan || {})[opt]}</LatexRenderer></div>
                            </label>
                          ))}
                          <button className="btn btn-secondary mt-4" style={{padding: '1rem', fontSize: '1.2rem'}} onClick={() => handleAnswerSubmit('submit')} disabled={feedback && feedback.isCorrect}>Hantar Jawapan</button>
                        </div>
                      ) : currentQ?.jenisSoalan === 'padankan' ? ("""

content = content.replace(find_pelbagai, replace_pelbagai)

# Drag & Drop
find_dragdrop = """                      ) : currentQ?.jenisSoalan === 'drag_drop' ? (
                        <div className="flex flex-col gap-6 max-w-3xl mx-auto">
                          <div className="bg-white p-8 rounded-2xl shadow-sm border border-indigo-100 text-xl leading-loose font-medium text-gray-800">
                            {(currentQ.soalan || '').split('[kosong]').map((part, index, arr) => (
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
                          
                          <button className="btn btn-secondary mt-4 py-3" onClick={() => handleAnswerSubmit('submit')} disabled={feedback && feedback.isCorrect}>Hantar Jawapan</button>
                        </div>
                      ) : ("""

replace_dragdrop = """                      ) : currentQ?.jenisSoalan === 'drag_drop' ? (
                        <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
                          <div className="drag-drop-text-container">
                            {(currentQ.soalan || '').split('[kosong]').map((part, index, arr) => (
                              <React.Fragment key={index}>
                                <LatexRenderer>{part}</LatexRenderer>
                                {index < arr.length - 1 && (
                                  <span 
                                    className="drop-zone"
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
                          
                          <div className="drag-options-container"
                               onDragOver={e => e.preventDefault()}
                               onDrop={e => {
                                  e.preventDefault();
                                  const draggedId = e.dataTransfer.getData('text/plain');
                                  setDragDropItems(items => items.map(it => 
                                    it.id === draggedId ? {...it, placedAt: null} : it
                                  ));
                               }}
                          >
                            <span className="w-full text-center font-bold text-primary mb-2 uppercase" style={{fontSize: '0.85rem', letterSpacing: '0.1em'}}>Pilihan Jawapan: (Tarik ke atas)</span>
                            {dragDropItems.filter(it => it.placedAt === null).map(it => (
                              <div 
                                key={it.id}
                                draggable={!(feedback && feedback.isCorrect)}
                                onDragStart={e => e.dataTransfer.setData('text/plain', it.id)}
                                className="drag-item"
                              >
                                {it.word}
                              </div>
                            ))}
                          </div>
                          
                          <button className="btn btn-secondary mt-4" style={{padding: '1rem', fontSize: '1.2rem'}} onClick={() => handleAnswerSubmit('submit')} disabled={feedback && feedback.isCorrect}>Hantar Jawapan</button>
                        </div>
                      ) : ("""

content = content.replace(find_dragdrop, replace_dragdrop)

# Jadual
find_jadual = """                      ) : currentQ?.jenisSoalan === 'jadual' ? (
                        <div className="flex flex-col gap-4 max-w-3xl mx-auto">
                          <table className="w-full text-center border-collapse bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                            <thead>
                              <tr className="bg-indigo-50 border-b border-indigo-100">
                                <th className="p-4 font-bold text-indigo-900 border-r border-indigo-100 w-1/3">Soalan</th>
                                <th className="p-4 font-bold text-indigo-900">Pilih Jawapan</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(currentQ.jadualItems || []).map((item, idx) => (
                                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                                  <td className="p-4 font-bold text-lg text-primary border-r border-gray-100 bg-white"><LatexRenderer>{item.item}</LatexRenderer></td>
                                  <td className="p-4 flex flex-col md:flex-row gap-2 justify-center">
                                      {(currentQ.jadualKategori || []).map(k => (
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
                      ) : currentQ?.jenisSoalan === 'drag_drop' ? ("""

replace_jadual = """                      ) : currentQ?.jenisSoalan === 'jadual' ? (
                        <div className="flex flex-col gap-4 max-w-4xl mx-auto w-full">
                          <table className="jadual-table">
                            <thead>
                              <tr>
                                <th className="jadual-th" style={{width: '40%'}}>Item</th>
                                <th className="jadual-th">Pilih Kategori</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(currentQ.jadualItems || []).map((item, idx) => (
                                <tr key={item.id}>
                                  <td className="jadual-td" style={{fontWeight: '800', fontSize: '1.2rem', color: 'var(--primary-color)'}}><LatexRenderer>{item.item}</LatexRenderer></td>
                                  <td className="jadual-td" style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center'}}>
                                      {(currentQ.jadualKategori || []).map(k => (
                                        <button
                                          key={k}
                                          className={`jadual-btn ${jadualJawapan[item.id] === k ? 'selected' : ''}`}
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
                          <div style={{display: 'flex', justifyContent: 'center'}}>
                            <button className="btn btn-secondary mt-4" style={{padding: '1rem 2.5rem', fontSize: '1.2rem'}} onClick={() => handleAnswerSubmit('submit')} disabled={feedback && feedback.isCorrect}>Hantar Jawapan</button>
                          </div>
                        </div>
                      ) : currentQ?.jenisSoalan === 'drag_drop' ? ("""

content = content.replace(find_jadual, replace_jadual)


with open("src/pages/ChildDashboard.jsx", "w") as f:
    f.write(content)

