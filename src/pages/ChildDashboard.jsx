import React, { useState, useEffect } from 'react';
import { getQuestions, getProfiles, updatePoints, deductPoints, addRedemption, updateLastLogin, updateSessionTime, getRewards, completeSifir, sendTelegramNotification, logAnswer, getAiSettings, evaluateWithGemini } from '../services/store';
import LatexRenderer from '../components/LatexRenderer';
import { createPortal } from 'react-dom';
import '../calculator.css';
import PinPad from '../components/PinPad';
import ScientificCalculator from '../components/Calculator';
import { LogOut, LayoutGrid, Brain, Gift as GiftIcon, Calculator, Hash, Medal, ChevronLeft } from 'lucide-react';
import confetti from 'canvas-confetti';

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

function ChildDashboard() {
  const [profiles, setProfiles] = useState([]);
  const [currentChild, setCurrentChild] = useState(null); 
  const [pendingProfile, setPendingProfile] = useState(null);
  const [rewardsList, setRewardsList] = useState([]);

  const [allQuestions, setAllQuestions] = useState([]);
  const [questions, setQuestions] = useState([]);
  

  const [padananKiriTerpilih, setPadananKiriTerpilih] = useState(null);
  const [padananJawapan, setPadananJawapan] = useState([]);
  const [pelbagaiPilihanJawapan, setPelbagaiPilihanJawapan] = useState([]);
  const [dragDropItems, setDragDropItems] = useState([]);
  const [jadualJawapan, setJadualJawapan] = useState({});
  const [userAnswer, setUserAnswer] = useState('');
  const [fillBlankJawapan, setFillBlankJawapan] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [isShaking, setIsShaking] = useState(false);
  
  const [attemptsCount, setAttemptsCount] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  
  // Navigation State
  const [activeTab, setActiveTab] = useState('math');
  const [selectedTopic, setSelectedTopic] = useState(null);

  // Math Symbols Toggle State
  const [showSymbols, setShowSymbols] = useState(false);

  // Sifir State
  const [selectedSifir, setSelectedSifir] = useState(null);
  const [sifirQuestions, setSifirQuestions] = useState([]);
  const [sifirIndex, setSifirIndex] = useState(0);

  // State for Redeem UI
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemMessage, setRedeemMessage] = useState(null);

  const [showCalculator, setShowCalculator] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setProfiles(await getProfiles());
      setAllQuestions(await getQuestions());
      setRewardsList(await getRewards());
    };
    fetchData();
  }, []);

  // Session Tracking Effect
  useEffect(() => {
    let sessionInterval;
    if (currentChild) {
      // Rekod log masuk
      updateLastLogin(currentChild.id);
      
      // Hasilkan ID sesi (timestamp semasa)
      const sessionStartISO = new Date().toISOString();
      
      // Mula mengira masa
      sessionInterval = setInterval(() => {
        updateSessionTime(currentChild.id, sessionStartISO);
      }, 60000); // 1 minit ping
    }
    
    return () => {
      if (sessionInterval) clearInterval(sessionInterval);
    };
  }, [currentChild]);

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    setAttemptsCount(0);
    setFeedback(null);
    setUserAnswer('');
    setPadananKiriTerpilih(null);
    setQuestionStartTime(Date.now());
  };

  const handleReturnToTopics = () => {
    setSelectedTopic(null);
  };

  const handleSelectProfile = (profile) => {
    setPendingProfile(profile);
  };

  const handlePinSuccess = () => {
    const profile = pendingProfile;
    setCurrentChild(profile);
    setPendingProfile(null);
    setActiveTab('math');
    setSelectedTopic(null);
    setSelectedSifir(null);
    
    // Tapis soalan berdasarkan tahun/tingkatan anak dan buang yang dah dijawab
    const answered = profile.answeredQuestions || [];
    const filteredQuestions = allQuestions.filter(q => 
      q.tahun === profile.tahunTingkatan && !answered.includes(q.id) && q.isVerified === true
    );
    setQuestions(filteredQuestions);
  };

  const handleAnswerSubmit = async (answerValue) => {
    const finalAnswer = typeof answerValue === 'string' ? answerValue : userAnswer;
    if (!finalAnswer) return;

    const currentQ = questions.filter(q => q.topik === selectedTopic)[0];
    
    let isCorrect = false;
    let extraLogData = {};
    
    if (currentQ.jenisSoalan === 'pelbagai_pilihan') {
       const userSorted = [...pelbagaiPilihanJawapan].sort();
       const parentSorted = [...(currentQ.pelbagaiPilihanJawapan || [])].sort();
       isCorrect = JSON.stringify(userSorted) === JSON.stringify(parentSorted);
    } else if (currentQ.jenisSoalan === 'padankan') {
       if (padananJawapan.length === (currentQ.padanan || []).length) {
         isCorrect = padananJawapan.every(p => {
           const orig = (currentQ.padanan || []).find(origP => origP.id === p.kiriId);
           return orig && orig.kanan === p.kananText;
         });
       }
    } else if (currentQ.jenisSoalan === 'drag_drop') {
       const userAnswers = [];
       const blanksCount = ((currentQ.soalan || '').match(/\[kosong\]/g) || []).length;
       for(let i=0; i<blanksCount; i++) {
         const item = dragDropItems.find(it => it.placedAt === i);
         userAnswers.push(item ? item.word : '');
       }
       isCorrect = JSON.stringify(userAnswers) === JSON.stringify(currentQ.dragDropJawapan || []);
    } else if (currentQ.jenisSoalan === 'jadual') {
       isCorrect = (currentQ.jadualItems || []).every(i => jadualJawapan[i.id] === i.kategori);
    } else if (currentQ.jenisSoalan === 'isi_tempat_kosong') {
       const userAnswers = [];
       const blanksCount = ((currentQ.soalan || '').match(/\[kosong\]/g) || []).length;
       for(let i=0; i<blanksCount; i++) {
         userAnswers.push(fillBlankJawapan[i] || '');
       }
       const expectedAnswers = (currentQ.jawapan || '').split(',').map(s => s.trim());
       isCorrect = JSON.stringify(userAnswers.map(normalizeAnswer)) === JSON.stringify(expectedAnswers.map(normalizeAnswer));
    } else if (currentQ.jenisSoalan === 'subjektif' || !currentQ.jenisSoalan) {
       const normalizedChild = normalizeAnswer(finalAnswer);
       const normalizedParent = normalizeAnswer(currentQ.jawapan);
       
       if (normalizedChild === normalizedParent) {
         // Padanan tepat selepas normalisasi (buang RM, jarak, dll)
         isCorrect = true;
         extraLogData = {
           userAnswer: finalAnswer,
           aiFeedback: "Jawapan tepat sepenuhnya. (Disemak secara automatik)",
           aiScore: 10,
           needsManualReview: true,
           questionMata: currentQ.mata
         };
       } else {
         const settings = await getAiSettings();
         const apiKey = settings?.apiKey;
         
         if (apiKey) {
           setFeedback({ isLoading: true, message: 'AI sedang menyemak jawapan anda... 🤖' });
           const aiResult = await evaluateWithGemini(currentQ.soalan, finalAnswer, currentQ.jawapan, apiKey);
           if (aiResult) {
             isCorrect = aiResult.isCorrect;
             extraLogData = { 
               userAnswer: finalAnswer, 
               aiFeedback: aiResult.feedback, 
               aiScore: aiResult.score, 
               needsManualReview: true,
               questionMata: currentQ.mata
             };
           } else {
             isCorrect = false;
             extraLogData = {
               userAnswer: finalAnswer,
               aiFeedback: "Gagal memanggil AI. Sila semak secara manual.",
               aiScore: 0,
               needsManualReview: true,
               questionMata: currentQ.mata
             };
           }
         } else {
           isCorrect = false;
           extraLogData = {
             userAnswer: finalAnswer,
             aiFeedback: "AI tidak diaktifkan. Sila semak secara manual.",
             aiScore: 0,
             needsManualReview: true,
             questionMata: currentQ.mata
           };
         }
       }
    } else {
       const normalizedChild = normalizeAnswer(finalAnswer);
       const normalizedParent = normalizeAnswer(currentQ.jawapan);
       isCorrect = (normalizedChild === normalizedParent);
    }

    const timeTaken = Math.round((Date.now() - questionStartTime) / 1000);

    if (isCorrect) {
      await logAnswer(currentChild.id, currentQ.id, currentQ.kodSoalan || currentQ.id, currentQ.topik, true, attemptsCount + 1, timeTaken, false, extraLogData);
      const result = await updatePoints(currentChild.id, currentQ.mata, currentQ.id);
      setCurrentChild({ ...currentChild, points: result.newPoints, answeredQuestions: result.answeredQuestions });
      
      const successMsg = `Tahniah ${currentChild.name}! Anda dapat ${currentQ.mata} mata! 🎉`;
      setFeedback({ isCorrect: true, message: successMsg });
      
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#ec4899', '#10b981', '#f59e0b']
      });

      setTimeout(() => {
        setFeedback(null);
        setUserAnswer('');
        setQuestions(prev => prev.filter(q => q.id !== currentQ.id));
      }, extraLogData.aiFeedback ? 3500 : 2000);
    } else {
      const newAttempts = attemptsCount + 1;
      setAttemptsCount(newAttempts);
      
      let maxAttempts = 5;
      if (currentQ.jenisSoalan === 'objektif') {
        maxAttempts = 2;
      } else if (['pelbagai_pilihan', 'padankan', 'drag_drop', 'jadual'].includes(currentQ.jenisSoalan)) {
        maxAttempts = 3;
      }
      
      if (newAttempts >= maxAttempts) {
        await logAnswer(currentChild.id, currentQ.id, currentQ.kodSoalan || currentQ.id, currentQ.topik, false, newAttempts, timeTaken, true, extraLogData);
        
        const failMsg = extraLogData.aiFeedback ? `AI: ${extraLogData.aiFeedback}` : 'Mari cuba soalan seterusnya. 💪';
        setFeedback({ isCorrect: false, message: failMsg });
        setTimeout(() => {
          setFeedback(null);
          setUserAnswer('');
          setQuestions(prev => {
            const newList = prev.filter(q => q.id !== currentQ.id);
            newList.push(currentQ);
            return newList;
          });
        }, extraLogData.aiFeedback ? 3500 : 1500);
      } else {
        const retryMsg = extraLogData.aiFeedback ? `AI: ${extraLogData.aiFeedback} Cuba lagi.` : 'Ops! Cuba lagi ya. 💪';
        setFeedback({ isCorrect: false, message: retryMsg });
        setIsShaking(true);
        setTimeout(() => {
          setFeedback(null);
          setIsShaking(false);
        }, extraLogData.aiFeedback ? 3500 : 1500);
      }
    }
  };

  const startSifir = (n) => {
    const qs = [];
    for (let i = 1; i <= 12; i++) {
      qs.push({ q: `${i} x ${n}`, answer: i * n });
    }
    // kocok rawak
    for (let i = qs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [qs[i], qs[j]] = [qs[j], qs[i]];
    }
    setSifirQuestions(qs);
    setSifirIndex(0);
    setSelectedSifir(n);
    setUserAnswer('');
  };

  const handleSifirSubmit = async (answerValue) => {
    const finalAnswer = typeof answerValue === 'string' ? answerValue : userAnswer;
    if (!finalAnswer) return;

    const currentQ = sifirQuestions[sifirIndex];
    if (parseInt(finalAnswer) === currentQ.answer) {
      if (sifirIndex === sifirQuestions.length - 1) {
        const points = selectedSifir <= 5 ? 2 : 5;
        const res = await completeSifir(currentChild.id, selectedSifir, points);
        if (res) {
           setCurrentChild({ ...currentChild, points: res.newPoints, dailySifir: res.dailySifir });
        }
        setFeedback({ isCorrect: true, message: `Tahniah! Anda siapkan Sifir ${selectedSifir} & dapat +${points} mata! 🎉` });
        confetti({
          particleCount: 150, spread: 80, origin: { y: 0.6 },
          colors: ['#6366f1', '#ec4899', '#10b981', '#f59e0b']
        });
        setTimeout(() => {
          setFeedback(null);
          setUserAnswer('');
          setSelectedSifir(null);
        }, 3000);
      } else {
        setFeedback({ isCorrect: true, message: 'Bagus! 👍' });
        setTimeout(() => {
          setFeedback(null);
          setUserAnswer('');
          setSifirIndex(prev => prev + 1);
        }, 1000);
      }
    } else {
      setFeedback({ isCorrect: false, message: 'Ops! Cuba lagi ya. 💪' });
      setIsShaking(true);
      setTimeout(() => {
        setFeedback(null);
        setIsShaking(false);
      }, 1500);
    }
  };

  const handleRedeemPoints = async (cost, time) => {
    if (currentChild.points >= cost) {
      const newPoints = await deductPoints(currentChild.id, cost);
      
      if (newPoints !== -1) {
        setCurrentChild({ ...currentChild, points: newPoints });
        await addRedemption(currentChild.id, currentChild.name, { masa: time, kos: cost });
        setRedeemMessage({ success: true, text: `Berjaya! Anda telah menebus ${time}. Sila beritahu ibu/bapa anda untuk buka game! 🎮` });
        
        // Hantar notifikasi Telegram secara senyap di belakang tabir
        sendTelegramNotification(`🎉 *Tahniah!* \n\nAnak anda, *${currentChild.name}* baru sahaja menebus hadiah:\n🎁 *${time}*\n💰 Menggunakan *${cost} mata*.\n\nSila tunaikan permintaan mereka! 😉`);
      } else {
        setRedeemMessage({ success: false, text: 'Ralat semasa menolak mata.' });
      }
    } else {
      setRedeemMessage({ success: false, text: `Mata tidak cukup! Anda perlukan ${cost - currentChild.points} mata lagi untuk menebus ${time}.` });
    }
    
    setTimeout(() => setRedeemMessage(null), 4000);
  };


  const uniqueTopics = [...new Set(questions.map(q => q.topik))];
  const mathQuestions = selectedTopic ? questions.filter(q => q.topik === selectedTopic) : [];
  const isCompleted = selectedTopic && mathQuestions.length === 0;
  const currentQ = mathQuestions[0];
  
  useEffect(() => {
    if (currentQ) {
      setUserAnswer('');
      setAttemptsCount(0);
      setQuestionStartTime(Date.now());
      setPadananKiriTerpilih(null);
      setPadananJawapan([]);
      setPelbagaiPilihanJawapan([]);
      setJadualJawapan({});
      setFillBlankJawapan({});
      if (currentQ.jenisSoalan === 'drag_drop') {
         const allWords = [...(currentQ.dragDropJawapan || []), ...(currentQ.dragDropEkstra || [])];
         allWords.sort(() => Math.random() - 0.5);
         setDragDropItems(allWords.map((w, i) => ({ id: i.toString(), word: w, placedAt: null })));
      }
    }
  }, [currentQ]);

  // Paparan Skrin Pemilihan Profil
  if (!currentChild) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        
        {pendingProfile && (
          <PinPad 
            title={`Log Masuk: ${pendingProfile.name}`}
            subtitle="Sila masukkan PIN anak (Lalai: 0000)"
            expectedPin={pendingProfile.pin || '0000'}
            onSuccess={handlePinSuccess}
            onCancel={() => setPendingProfile(null)}
          />
        )}

        <div className="glass-panel text-center max-w-lg w-full">
          <h2 className="text-primary mb-2">Siapa Yang Bermain? 🚀</h2>
          <p className="text-muted mb-8">Sila pilih nama anda untuk bermula</p>
          
          {profiles.length === 0 ? (
            <div className="bg-gray-50 p-8 rounded border border-dashed border-gray-300">
              <p className="mb-0 text-muted">Belum ada profil didaftarkan.</p>
              <p className="text-sm">Minta ibu bapa daftarkan nama anda di Papan Pemuka Ibu Bapa dahulu.</p>
            </div>
          ) : (
            <div className="flex justify-center gap-4 flex-wrap">
              {profiles.map(p => (
                <button 
                  key={p.id} 
                  className="btn btn-outline flex-col py-6 px-12 hover:-translate-y-1 hover:shadow-md transition-all"
                  style={{ minWidth: '160px' }}
                  onClick={() => handleSelectProfile(p)}
                >
                  <h3 className="mb-2 text-primary">{p.name}</h3>
                  <span className="text-sm font-bold text-muted bg-gray-100 px-3 py-1 rounded-full">{p.tahunTingkatan}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }


  

  
  const todayDate = new Date().toISOString().split('T')[0];
  const completedSifirs = (currentChild.dailySifir && currentChild.dailySifir.date === todayDate) ? currentChild.dailySifir.completed : [];

  return (
    <div className="flex gap-4 w-full">
      {/* Sidebar */}
      <div className="glass-panel" style={{ width: '250px', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column' }}>
        <h3 className="text-primary mb-2 text-center text-xl">{currentChild.name}</h3>
        <p className="text-center text-sm font-bold text-muted bg-gray-100 px-3 py-1 rounded-full w-max mx-auto mb-6">{currentChild.tahunTingkatan}</p>
        
        <div className="text-center mb-8 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
          <h4 className="text-xs uppercase tracking-wider text-muted font-bold mb-1">Mata Terkumpul</h4>
          <h2 className="text-3xl text-primary m-0 flex items-center justify-center gap-2"><span className="text-xl">🌟</span>{currentChild.points}</h2>
        </div>

        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: 0 }}>
          <li>
            <button onClick={() => {setActiveTab('math'); handleReturnToTopics();}} className={`sidebar-link ${activeTab === 'math' ? 'active' : ''} w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition-all`}>
              <Brain size={18} /> Cabaran Matematik
            </button>
          </li>
          <li>
            <button onClick={() => {setActiveTab('sifir'); setSelectedSifir(null);}} className={`sidebar-link ${activeTab === 'sifir' ? 'active' : ''} w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition-all`}>
              <Calculator size={18} /> Cabaran Sifir
            </button>
          </li>
          <li>
            <button onClick={() => setActiveTab('rewards')} className={`sidebar-link ${activeTab === 'rewards' ? 'active' : ''} w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition-all`}>
              <GiftIcon size={18} /> Tebus Hadiah
            </button>
          </li>
        </ul>
        <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
           <button className="btn btn-outline w-full flex items-center justify-center gap-2 text-sm text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300" onClick={() => {setCurrentChild(null); setQuestions([]);}}>
             <LogOut size={16} /> Tukar Profil
           </button>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="glass-panel w-full relative overflow-hidden" style={{ minHeight: '600px' }}>
        
        {/* REWARDS TAB */}
        {activeTab === 'rewards' && (
          <div className="animate-fade-in">
            <h2 className="text-secondary mb-4">Kedai Hadiah 🎁</h2>
            <p className="text-muted font-medium mb-6">Pilih hadiah yang anda inginkan. Pastikan mata anda mencukupi!</p>
            
            {redeemMessage && (
              <div className="p-4 rounded-lg font-bold mb-6 animate-fade-in" style={{ backgroundColor: redeemMessage.success ? '#dcfce7' : '#fee2e2', color: redeemMessage.success ? '#166534' : '#991b1b' }}>
                {redeemMessage.text}
              </div>
            )}

            {rewardsList.length === 0 ? (
              <div className="bg-gray-50 p-8 rounded-xl border border-dashed border-gray-300 text-center mt-8">
                <p className="text-muted mb-0">Tiada hadiah di kedai buat masa ini.</p>
                <p className="text-sm">Minta ibu bapa letakkan hadiah di sini!</p>
              </div>
            ) : (
              <div className="rewards-grid">
                {rewardsList.map((r, idx) => (
                  <div key={r.id} className={`reward-card ${idx === 1 && rewardsList.length > 2 ? 'popular' : ''}`}>
                    {idx === 1 && rewardsList.length > 2 && (
                      <div className="absolute -top-3 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">Pilihan Popular</div>
                    )}
                    <div style={{ fontSize: '6rem', lineHeight: '1', marginBottom: '1rem', marginTop: '0.5rem' }}>{r.icon || '🎁'}</div>
                    <h3 className="text-xl mb-1 text-center leading-tight">{r.name}</h3>
                    <p className="text-primary font-bold mb-5 bg-indigo-50 px-4 py-1 rounded-full text-sm">Kos: {r.points} Mata</p>
                    <button className={`btn w-full rounded-xl ${idx === 1 && rewardsList.length > 2 ? 'btn-secondary shadow-md hover:shadow-lg' : 'btn-primary'}`} onClick={() => handleRedeemPoints(r.points, r.name)}>Tebus!</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SIFIR TAB */}
        {activeTab === 'sifir' && (
          <div className="animate-fade-in">
            {!selectedSifir ? (
              <>
                <h2 className="text-primary mb-2">Cabaran Sifir Harian ✖️</h2>
                <p className="text-muted font-medium mb-8">Pilih sifir untuk diselesaikan. Anda hanya boleh jawab setiap sifir sekali sehari!</p>
                
                <div className="sifir-grid">
                  {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => {
                    const isDone = completedSifirs.includes(num);
                    const pts = num <= 5 ? 2 : 5;
                    return (
                      <button 
                        key={num}
                        disabled={isDone}
                        onClick={() => startSifir(num)}
                        className="sifir-card"
                      >
                        <h3 className={`text-3xl mb-2 ${isDone ? 'text-gray-400' : 'text-primary'}`}>{num}</h3>
                        {isDone ? (
                          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                            ✅ Siap Hari Ini
                          </span>
                        ) : (
                          <span className="bg-indigo-50 text-indigo-600 text-sm font-bold px-3 py-1 rounded-lg">
                            <span className="mr-1">🎁</span>{pts} mata
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </>
            ) : (
              <div className={`text-center max-w-2xl mx-auto transition-all ${isShaking ? 'shake-animation' : ''}`}>
                <div className="flex justify-between items-center mb-8">
                  <button className="btn btn-outline py-1 px-3 flex items-center gap-2 text-sm" onClick={() => setSelectedSifir(null)}>
                    <ChevronLeft size={16} /> Kembali
                  </button>
                  <span className="bg-indigo-100 text-indigo-800 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                    Sifir {selectedSifir} • Soalan {sifirIndex + 1} / 12
                  </span>
                  <div className="w-20"></div> {/* Spacer for centering */}
                </div>
                
                <h2 className="text-5xl font-bold my-12 text-gray-800">
                  {sifirQuestions[sifirIndex]?.q} = ?
                </h2>
                
                <div className="flex flex-col items-center w-full max-w-md mx-auto">
                  <input 
                    type="number" 
                    className="input-field text-center w-full" 
                    style={{ fontSize: '2rem', fontWeight: 'bold', padding: '1rem' }}
                    placeholder="Jawapan..." 
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSifirSubmit(userAnswer)}
                    disabled={feedback && feedback.isCorrect}
                    autoFocus
                  />
                  <button 
                    className="btn btn-secondary mt-4 w-full py-4 text-lg rounded-xl" 
                    onClick={() => handleSifirSubmit(userAnswer)}
                    disabled={feedback && feedback.isCorrect}
                  >
                    Hantar Jawapan
                  </button>
                </div>
                
                {feedback && (
                  <div className="p-4 mt-6 rounded-lg font-bold animate-fade-in" style={{ backgroundColor: feedback.isCorrect ? '#dcfce7' : '#fee2e2', color: feedback.isCorrect ? '#166534' : '#991b1b' }}>
                    {feedback.message}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* MATH TAB */}
        {activeTab === 'math' && (
          <div className="animate-fade-in">
            {!selectedTopic ? (
              <>
                <h2 className="text-primary mb-2">Cabaran Matematik ✏️</h2>
                <p className="text-muted font-medium mb-8">Pilih topik untuk mula mengumpul mata.</p>
                
                {uniqueTopics.length === 0 ? (
                  <div className="bg-gray-50 p-8 rounded border border-dashed border-gray-300 text-center">
                    <p className="mb-0 text-muted">Tiada soalan tersedia untuk tahun/tingkatan anda.</p>
                  </div>
                ) : (
                  <div className="math-topics-grid">
                    {uniqueTopics.map(topic => {
                      const topicQuestions = questions.filter(q => q.topik === topic);
                      return (
                        <button 
                          key={topic}
                          onClick={() => {
                            setSelectedTopic(topic);
                            setUserAnswer('');
                            setFeedback(null);
                          }}
                          className="topic-card"
                        >
                          <div className="topic-card-content">
                            <h3 title={topic}>{topic}</h3>
                            <p className="text-sm text-muted m-0">{topicQuestions.length} Soalan Belum Dijawab</p>
                          </div>
                          <div className="topic-icon-wrapper">
                            <ChevronLeft size={20} style={{ transform: 'rotate(180deg)' }} />
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </>
            ) : (
              <div className="bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-200">
                <div className="grid grid-cols-3 items-center mb-6">
                  <div className="justify-self-start">
                    <button className="btn btn-outline py-1 px-3 flex items-center gap-2 text-sm" onClick={() => { handleReturnToTopics(); setShowSymbols(false); }}>
                      <ChevronLeft size={16} /> Kembali
                    </button>
                  </div>
                  <h3 className="m-0 text-gray-600 text-center justify-self-center whitespace-nowrap overflow-hidden text-ellipsis w-full px-2">{selectedTopic}</h3>
                  <div className="justify-self-end"></div>
                </div>

                {isCompleted ? (
                  <div className="text-center py-12 animate-fade-in">
                    <div className="text-6xl mb-4">🌟</div>
                    <h2>Bagus! Anda telah siapkan topik ini!</h2>
                    <p className="text-muted font-medium mt-2 mb-6">Pilih topik lain atau tebus hadiah dengan mata yang terkumpul.</p>
                    <div className="flex gap-4 justify-center">
                      <button className="btn btn-outline" onClick={handleReturnToTopics}>Pilih Topik Lain</button>
                      <button className="btn btn-secondary" onClick={() => setActiveTab('rewards')}>🎁 Tebus Hadiah</button>
                    </div>
                  </div>
                ) : (
                  <div className={`animate-fade-in text-center max-w-2xl mx-auto transition-all ${isShaking ? 'shake-animation' : ''}`}>
                    <span className="inline-block bg-indigo-100 text-indigo-800 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
                      Baki Soalan: {mathQuestions.length}
                    </span>
                    
                    {currentQ?.rajah && (
                      <div className="my-6 bg-white p-4 rounded-xl shadow-sm inline-block border border-gray-100">
                        <img src={currentQ.rajah} alt="Rajah Soalan" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }} className="rounded-lg" />
                      </div>
                    )}
                    
                    <div className="font-bold my-6 text-gray-800 leading-snug whitespace-pre-line" style={{ fontSize: '1.5rem' }}>
                      {currentQ && currentQ.jenisSoalan !== 'drag_drop' && currentQ.jenisSoalan !== 'isi_tempat_kosong' && <LatexRenderer>{currentQ.soalan}</LatexRenderer>}
                    </div>
                    
                    <div className="mt-8 mb-6">
                      {currentQ?.jenisSoalan === 'objektif' ? (
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
                              <div><LatexRenderer>{(currentQ.pilihan || {})[opt]}</LatexRenderer></div>
                            </button>
                          ))}
                        </div>
                      ) : currentQ?.jenisSoalan === 'pelbagai_pilihan' ? (
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
                      ) : currentQ?.jenisSoalan === 'padankan' ? (
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
                      ) : currentQ?.jenisSoalan === 'jadual' ? (
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
                      ) : currentQ?.jenisSoalan === 'drag_drop' ? (
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
                                    <LatexRenderer>{dragDropItems.find(it => it.placedAt === index)?.word || ''}</LatexRenderer>
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
                                <LatexRenderer>{it.word}</LatexRenderer>
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex justify-between items-center mt-6 pt-4" style={{borderTop: '1px solid #e2e8f0'}}>
                            <button className="btn btn-outline" onClick={() => setDragDropItems(items => items.map(it => ({...it, placedAt: null})))}>Reset Semua</button>
                            <button className="btn btn-secondary" style={{padding: '1rem 2.5rem', fontSize: '1.2rem'}} onClick={() => handleAnswerSubmit('submit')} disabled={feedback && feedback.isCorrect}>Sahkan Jawapan</button>
                          </div>
                        </div>
                      ) : currentQ?.jenisSoalan === 'isi_tempat_kosong' ? (
                        <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
                          <div className="text-center font-bold my-6 text-gray-800 leading-snug whitespace-pre-line" style={{ fontSize: '1.5rem' }}>
                            {(currentQ.soalan || '').split('[kosong]').map((part, index, arr) => (
                              <React.Fragment key={index}>
                                <LatexRenderer>{part}</LatexRenderer>
                                {index < arr.length - 1 && (
                                  <input 
                                    type="text"
                                    className="input-field text-center inline-block mx-2 mb-0"
                                    style={{ width: '80px', fontSize: '1.2rem', padding: '0.2rem', borderBottom: '3px solid #6366f1', borderRadius: '4px' }}
                                    value={fillBlankJawapan[index] || ''}
                                    onChange={(e) => {
                                      setFillBlankJawapan(prev => ({...prev, [index]: e.target.value}));
                                    }}
                                    disabled={feedback && feedback.isCorrect}
                                  />
                                )}
                              </React.Fragment>
                            ))}
                          </div>
                          
                          <div className="flex justify-center mt-6 pt-4" style={{borderTop: '1px solid #e2e8f0'}}>
                            <button className="btn btn-secondary" style={{padding: '1rem 2.5rem', fontSize: '1.2rem'}} onClick={() => handleAnswerSubmit('submit')} disabled={feedback && feedback.isCorrect}>Hantar Jawapan</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col justify-center w-full max-w-2xl mx-auto items-center relative">
                          {/* Ruangan Input */}
                          <div className="flex flex-col items-center w-full">
                            <div className="flex items-center gap-2 w-full mb-4">
                              <textarea 
                                className="input-field flex-1 mb-0 p-4" 
                                style={{ fontSize: '1.2rem', minHeight: '150px', resize: 'vertical', width: '100%' }}
                                placeholder="Tulis jawapan anda di sini..." 
                                value={userAnswer}
                                onChange={(e) => setUserAnswer(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAnswerSubmit(userAnswer);
                                  }
                                }}
                                disabled={feedback && feedback.isCorrect}
                              />
                              <button 
                                className={`btn py-2 px-3 h-[60px] rounded-lg transition-all ${showSymbols ? 'btn-primary' : 'btn-outline bg-white'}`}
                                onClick={() => setShowSymbols(!showSymbols)}
                                title="Buka Panel Simbol"
                              >
                                <span className="text-xl">🧮</span>
                              </button>
                            </div>
                            
                            {/* Panel Butang Simbol (Boleh Buka/Tutup) */}
                            {showSymbols && (
                              <div className="bg-white border border-indigo-100 rounded-xl p-3 shadow-md mb-4 animate-fade-in mx-auto" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 45px)', gap: '8px' }}>
                                <button className="btn btn-outline p-0 text-base rounded shadow-sm hover:-translate-y-1 transition-all font-bold aspect-square flex items-center justify-center" onClick={() => setUserAnswer(prev => prev + '/')}>/</button>
                                <button className="btn btn-outline p-0 text-base rounded shadow-sm hover:-translate-y-1 transition-all font-bold aspect-square flex items-center justify-center" onClick={() => setUserAnswer(prev => prev + 'x')}>×</button>
                                <button className="btn btn-outline p-0 text-base rounded shadow-sm hover:-translate-y-1 transition-all font-bold aspect-square flex items-center justify-center" onClick={() => setUserAnswer(prev => prev + '^2')}>x²</button>
                                <button className="btn btn-outline p-0 text-base rounded shadow-sm hover:-translate-y-1 transition-all font-bold aspect-square flex items-center justify-center" onClick={() => setUserAnswer(prev => prev + '^3')}>x³</button>
                                <button className="btn btn-outline p-0 text-base rounded shadow-sm hover:-translate-y-1 transition-all font-bold aspect-square flex items-center justify-center" onClick={() => setUserAnswer(prev => prev + '√')}>√</button>
                              </div>
                            )}

                            <button 
                              className="btn btn-primary w-full py-4 text-lg rounded-xl shadow-md" 
                              onClick={() => handleAnswerSubmit(userAnswer)}
                              disabled={feedback && feedback.isCorrect}
                            >
                              Hantar Jawapan
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {feedback && (
                      <div className="p-4 rounded-lg font-bold animate-fade-in" style={{ backgroundColor: feedback.isLoading ? '#eff6ff' : (feedback.isCorrect ? '#dcfce7' : '#fee2e2'), color: feedback.isLoading ? '#1d4ed8' : (feedback.isCorrect ? '#166534' : '#991b1b') }}>
                        {feedback.message}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Calculator Button via Portal */}
      {createPortal(
        <>
          {(activeTab === 'math' || activeTab === 'sifir') && !showCalculator && (
            <button 
              className="floating-btn"
              onClick={() => setShowCalculator(true)}
              title="Buka Kalkulator"
            >
              <Calculator size={28} />
            </button>
          )}

          {/* The Calculator */}
          {showCalculator && (
            <ScientificCalculator onClose={() => setShowCalculator(false)} />
          )}
        </>,
        document.body
      )}
    </div>
  );
}

export default ChildDashboard;
