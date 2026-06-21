import re

with open("src/pages/ChildDashboard.jsx", "r") as f:
    content = f.read()

find_padankan = """                      ) : currentQ?.jenisSoalan === 'padankan' ? (
                        <div className="flex flex-col gap-4 max-w-3xl mx-auto">
                          <p className="text-sm text-muted text-center font-bold">Langkah 1: Klik item di Kiri. Langkah 2: Klik jawapan di Kanan.</p>
                          <div className="flex gap-8">
                            {/* Kiri */}
                            <div className="flex-1 flex flex-col gap-3">
                              {(currentQ.padanan || []).map((p) => {
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
                              {(currentQ.padanan || []).map((p, idx) => {
                                const kananIdx = (idx + 1) % (currentQ.padanan || []).length;
                                const kananItem = (currentQ.padanan || [])[kananIdx];
                                
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
                      ) : currentQ?.jenisSoalan === 'jadual' ? ("""

replace_padankan = """                      ) : currentQ?.jenisSoalan === 'padankan' ? (
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

content = content.replace(find_padankan, replace_padankan)

with open("src/pages/ChildDashboard.jsx", "w") as f:
    f.write(content)

