import React, { useState, useEffect } from 'react';
import { 
  BarChart, Users, Settings, PlusCircle, LogOut, Trash2, Edit, Save, X, List, Upload, Image as ImageIcon,
  ChevronDown, ChevronUp, Info, RotateCcw, Gift, Clock
} from 'lucide-react';
import { 
  getProfiles, addProfile, deleteProfile, getQuestions, addQuestion, updateQuestion, deleteQuestion, updateProfile, getRedemptions, resetQuestionForProfiles, getParentPin, updateParentPin, getRewards, addReward, updateReward, deleteReward, getTelegramSettings, updateTelegramSettings, sendTelegramNotification, getPerformanceReport, getAiSettings, updateAiSettings, getPendingReviews, updateReviewStatus, updatePoints
} from '../services/store';
import LatexRenderer from '../components/LatexRenderer';
import PinPad from '../components/PinPad';
import Papa from 'papaparse';
import pemfaktoranData from '../data/pemfaktoran_tingkatan2.json';
import { PieChart, Pie, Cell, Tooltip as RTooltip, ResponsiveContainer } from 'recharts';

function ParentDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [filterUnverified, setFilterUnverified] = useState(false);
  const [filterAnswered, setFilterAnswered] = useState(false);
  
  // Auth State
  const [isParentAuthenticated, setIsParentAuthenticated] = useState(false);
  const [parentPin, setParentPin] = useState('1234');
  const [newParentPin, setNewParentPin] = useState('');
  
  // Telegram Settings State
  const [telegramToken, setTelegramToken] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [telegramTestStatus, setTelegramTestStatus] = useState(null);
  
  // AI Settings State
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [aiSaveStatus, setAiSaveStatus] = useState(null);
  
  // Pending Reviews State
  const [pendingReviews, setPendingReviews] = useState([]);
  
  // State for Add Question form
  const [tahun, setTahun] = useState('');
  const [topik, setTopik] = useState('');
  const [aras, setAras] = useState('Sederhana');
  const [jenisSoalan, setJenisSoalan] = useState('subjektif');
  const [rajah, setRajah] = useState(null);
  const [soalan, setSoalan] = useState('');
  const [jawapan, setJawapan] = useState('');
  const [pilihanA, setPilihanA] = useState('');
  const [pilihanB, setPilihanB] = useState('');
  const [pilihanC, setPilihanC] = useState('');
  const [pilihanD, setPilihanD] = useState('');
  const [mata, setMata] = useState(10);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [padanan, setPadanan] = useState([{ id: Date.now(), kiri: '', kanan: '' }]);
  const [pelbagaiPilihanJawapan, setPelbagaiPilihanJawapan] = useState([]);
  const [dragDropJawapan, setDragDropJawapan] = useState('');
  const [dragDropEkstra, setDragDropEkstra] = useState('');
  const [jadualKategori, setJadualKategori] = useState('Integer, Bukan Integer');
  const [jadualItems, setJadualItems] = useState([{ id: Date.now(), item: '', kategori: '' }]);
  const [labelRajahItems, setLabelRajahItems] = useState([]);
  const [statusMessage, setStatusMessage] = useState('');
  const [showLatexGuide, setShowLatexGuide] = useState(false);

  const mathSymbols = [
    { label: 'Pecahan', code: ' $\\frac{1}{2}$ ' },
    { label: 'Kuasa 2', code: ' $x^{2}$ ' },
    { label: 'Punca Kuasa', code: ' $\\sqrt{x}$ ' },
    { label: 'Darjah (°)', code: ' $^{\\circ}$ ' },
    { label: 'Darab (×)', code: ' $\\times$ ' },
    { label: 'Bahagi (÷)', code: ' $\\div$ ' },
    { label: 'Pi (π)', code: ' $\\pi$ ' },
    { label: 'Sama/Tidak (≠)', code: ' $\\neq$ ' },
  ];

  const resetQuestionForm = () => {
    setTahun(''); setTopik(''); setAras('Sederhana'); setJenisSoalan('subjektif'); setRajah(null);
    setSoalan(''); setJawapan(''); setPilihanA(''); setPilihanB(''); 
    setPilihanC(''); setPilihanD(''); setMata(10); setEditingQuestionId(null);
    setPadanan([{ id: Date.now(), kiri: '', kanan: '' }]);
    setPelbagaiPilihanJawapan([]);
    setDragDropJawapan(''); setDragDropEkstra('');
    setJadualKategori('Integer, Bukan Integer');
    setJadualItems([{ id: Date.now(), item: '', kategori: '' }]);
    setLabelRajahItems([]);
  };

  const insertLatex = (latexString) => {
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'INPUT') && activeEl.type !== 'file') {
      const start = activeEl.selectionStart;
      const end = activeEl.selectionEnd;
      const text = activeEl.value;
      const newText = text.substring(0, start) + latexString + text.substring(end);
      
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
      
      if (activeEl.tagName === 'INPUT') {
        nativeInputValueSetter.call(activeEl, newText);
      } else {
        nativeTextAreaValueSetter.call(activeEl, newText);
      }
      
      const event = new Event('input', { bubbles: true });
      activeEl.dispatchEvent(event);
      
      setTimeout(() => {
        activeEl.focus();
        activeEl.setSelectionRange(start + latexString.length, start + latexString.length);
      }, 10);
    } else {
      setSoalan(prev => prev + latexString);
    }
  };

  const [questionsList, setQuestionsList] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const generateTempCode = (q) => {
    const tahapCode = q.tahun ? q.tahun.replace(/[^A-Z0-9]/ig, '').substring(0, 2).toUpperCase() : 'XX';
    const topikCode = q.topik ? q.topik.substring(0, 3).toUpperCase() : 'XXX';
    const suffix = q.id ? q.id.substring(0, 4).toUpperCase() : '0000';
    return `${tahapCode}-${topikCode}-${suffix}`;
  };
  const [profiles, setProfiles] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [performanceLogs, setPerformanceLogs] = useState([]);
  const [selectedPerformanceProfile, setSelectedPerformanceProfile] = useState(null);

  const loadPerformance = async (childId) => {
    if (!childId) return;
    setPerformanceLogs(await getPerformanceReport(childId));
  };

  useEffect(() => {
    if (selectedPerformanceProfile) {
      loadPerformance(selectedPerformanceProfile.id);
    }
  }, [selectedPerformanceProfile]);

  // Profile Form States
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileLevel, setNewProfileLevel] = useState('');
  const [newProfilePin, setNewProfilePin] = useState('');
  const [editingProfileId, setEditingProfileId] = useState(null);
  const [editProfileName, setEditProfileName] = useState('');
  const [editProfileLevel, setEditProfileLevel] = useState('');
  const [editProfilePoints, setEditProfilePoints] = useState(0);
  const [editProfilePin, setEditProfilePin] = useState('');

  // Rewards State
  const [rewardsList, setRewardsList] = useState([]);
  const [newRewardName, setNewRewardName] = useState('');
  const [newRewardPoints, setNewRewardPoints] = useState(50);
  const [newRewardIcon, setNewRewardIcon] = useState('🎁');
  const [editingRewardId, setEditingRewardId] = useState(null);
  const [editRewardName, setEditRewardName] = useState('');
  const [editRewardPoints, setEditRewardPoints] = useState(0);
  const [editRewardIcon, setEditRewardIcon] = useState('🎁');

  // State for CSV Upload
  const [csvFile, setCsvFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');

  // State for MD Upload
  const [mdFile, setMdFile] = useState(null);
  const [mdTahun, setMdTahun] = useState('');
  const [mdTopik, setMdTopik] = useState('');

  const tahapOptions = [
    "Tahun 1", "Tahun 2", "Tahun 3", "Tahun 4", "Tahun 5", "Tahun 6",
    "Tingkatan 1", "Tingkatan 2", "Tingkatan 3", "Tingkatan 4", "Tingkatan 5"
  ];

  useEffect(() => {
    loadProfiles();
    loadQuestions();
    loadRedemptions();
    loadParentPin();
    loadRewards();
    loadTelegramSettings();
    loadAiSettings();
    loadPendingReviews();
  }, [activeTab]);

  const loadProfiles = async () => setProfiles(await getProfiles());
  const loadQuestions = async () => setQuestionsList(await getQuestions());
  const loadRedemptions = async () => setRedemptions(await getRedemptions());
  const loadParentPin = async () => setParentPin(await getParentPin());
  const loadRewards = async () => setRewardsList(await getRewards());
  const loadTelegramSettings = async () => {
    const settings = await getTelegramSettings();
    setTelegramToken(settings.token || '');
    setTelegramChatId(settings.chatId || '');
  };
  const loadAiSettings = async () => {
    const settings = await getAiSettings();
    setGeminiApiKey(settings.apiKey || '');
  };
  const loadPendingReviews = async () => setPendingReviews(await getPendingReviews());

  const handleSaveTelegram = async () => {
    const success = await updateTelegramSettings(telegramToken, telegramChatId);
    if (success) {
      setTelegramTestStatus({ type: 'success', msg: 'Tetapan Telegram berjaya disimpan!' });
      setTimeout(() => setTelegramTestStatus(null), 3000);
    } else {
      setTelegramTestStatus({ type: 'error', msg: 'Gagal menyimpan tetapan.' });
    }
  };

  const handleSaveAiSettings = async () => {
    const success = await updateAiSettings(geminiApiKey);
    if (success) {
      setAiSaveStatus({ type: 'success', msg: 'Kekunci API Gemini berjaya disimpan!' });
      setTimeout(() => setAiSaveStatus(null), 3000);
    } else {
      setAiSaveStatus({ type: 'error', msg: 'Gagal menyimpan kekunci API.' });
    }
  };

  const handleReviewAction = async (logId, isCorrect, overrideScore) => {
    const log = pendingReviews.find(r => r.id === logId);
    if (!log) return;
    
    const success = await updateReviewStatus(logId, isCorrect, overrideScore);
    if (success) {
      // Periksa jika keputusan berbeza dengan keputusan asal AI
      if (isCorrect && !log.isCorrect && overrideScore > 0) {
        // AI kata salah, tapi ibu bapa kata betul -> Tambah mata
        await updatePoints(log.childId, overrideScore, log.questionId);
      } else if (!isCorrect && log.isCorrect) {
        // AI kata betul, tapi ibu bapa kata salah -> Tolak mata yang dah diberi
        await updatePoints(log.childId, -(log.questionMata || 10));
      }
      // Jika isCorrect === log.isCorrect, mata sudah pun diberi/tidak diberi semasa anak menjawab, jadi abaikan.
      
      loadProfiles(); 
      setPendingReviews(pendingReviews.filter(r => r.id !== logId));
    }
  };

  const handleTestTelegram = async () => {
    setTelegramTestStatus({ type: 'loading', msg: 'Sedang menghantar...' });
    const success = await sendTelegramNotification('✅ *Ujian Telegram Berjaya!*\nSistem notifikasi MathPowerApps anda berfungsi dengan baik.');
    if (success) {
      setTelegramTestStatus({ type: 'success', msg: 'Mesej ujian berjaya dihantar ke Telegram anda!' });
    } else {
      setTelegramTestStatus({ type: 'error', msg: 'Gagal! Sila semak Token dan Chat ID.' });
    }
    setTimeout(() => setTelegramTestStatus(null), 5000);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRajah(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSimpanSoalan = async () => {
    const requiresJawapan = ['subjektif', 'objektif', 'isi_tempat_kosong'].includes(jenisSoalan);
    if (!tahun || !topik || !soalan || !mata || (requiresJawapan && !jawapan)) {
      setStatusMessage('Sila isikan maklumat yang wajib (Tahun, Topik, Soalan, Jawapan, Mata)!');
      setTimeout(() => setStatusMessage(''), 3000);
      return;
    }
    if (jenisSoalan === 'objektif' && (!pilihanA || !pilihanB || !pilihanC || !pilihanD)) {
      setStatusMessage('Sila isikan semua pilihan A, B, C, dan D untuk soalan objektif!');
      setTimeout(() => setStatusMessage(''), 3000);
      return;
    }
    if (jenisSoalan === 'padankan' && padanan.some(p => !p.kiri || !p.kanan)) {
      setStatusMessage('Sila lengkapkan semua pasangan padanan!');
      setTimeout(() => setStatusMessage(''), 3000);
      return;
    }
    if (jenisSoalan === 'pelbagai_pilihan' && (!pilihanA || !pilihanB || !pilihanC || !pilihanD || pelbagaiPilihanJawapan.length === 0)) {
      setStatusMessage('Sila isikan pilihan A-D dan pilih sekurang-kurangnya satu jawapan betul!');
      setTimeout(() => setStatusMessage(''), 3000);
      return;
    }
    if (jenisSoalan === 'drag_drop' && !dragDropJawapan) {
      setStatusMessage('Sila isikan jawapan untuk Drag & Drop!');
      setTimeout(() => setStatusMessage(''), 3000);
      return;
    }
    if (jenisSoalan === 'jadual' && (jadualItems.some(i => !i.item || !i.kategori) || !jadualKategori)) {
      setStatusMessage('Sila lengkapkan item jadual dan kategori!');
      setTimeout(() => setStatusMessage(''), 3000);
      return;
    }
    if (jenisSoalan === 'label_rajah' && (!rajah || labelRajahItems.length === 0 || labelRajahItems.some(i => !i.jawapan))) {
      setStatusMessage('Sila pastikan rajah dimuat naik, dan semua titik mempunyai jawapan!');
      setTimeout(() => setStatusMessage(''), 3000);
      return;
    }
    
    setStatusMessage('Menyimpan ke pangkalan data...');
    
    try {
      const questionData = {
        tahun, topik, aras, jenisSoalan, rajah, soalan, jawapan,
        mata: parseInt(mata, 10)
      };
      
      if (jenisSoalan === 'objektif' || jenisSoalan === 'pelbagai_pilihan') {
        questionData.pilihan = { A: pilihanA, B: pilihanB, C: pilihanC, D: pilihanD };
      }
      if (jenisSoalan === 'pelbagai_pilihan') questionData.pelbagaiPilihanJawapan = pelbagaiPilihanJawapan;
      if (jenisSoalan === 'padankan') questionData.padanan = padanan;
      if (jenisSoalan === 'drag_drop') {
        questionData.dragDropJawapan = dragDropJawapan.split(',').map(s => s.trim()).filter(Boolean);
        questionData.dragDropEkstra = dragDropEkstra.split(',').map(s => s.trim()).filter(Boolean);
      }
      if (jenisSoalan === 'jadual') {
        questionData.jadualKategori = jadualKategori.split(',').map(s => s.trim()).filter(Boolean);
        questionData.jadualItems = jadualItems;
      }
      if (jenisSoalan === 'label_rajah') {
        questionData.labelRajahItems = labelRajahItems;
      }

      // Paksa isVerified kepada true jika ditambah/disunting secara manual
      questionData.isVerified = true;

      let newQuestion;
      if (editingQuestionId) {
        await updateQuestion(editingQuestionId, questionData);
        setQuestionsList(questionsList.map(q => q.id === editingQuestionId ? { ...questionData, id: editingQuestionId } : q));
        alert('Soalan berjaya dikemas kini!');
        setEditingQuestionId(null);
      } else {
        newQuestion = await addQuestion(questionData);
        setQuestionsList([...questionsList, newQuestion]);
        alert('Soalan berjaya ditambah!');
      }
      
      resetQuestionForm();
      setActiveTab('list');
      setStatusMessage('Soalan berjaya disimpan!');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (error) {
      setStatusMessage(`Gagal menyimpan: ${error.message}`);
      setTimeout(() => setStatusMessage(''), 8000);
    }
  };

  const handleEditQuestion = (q) => {
    setTahun(q.tahun || ''); setTopik(q.topik || ''); setAras(q.aras || 'Sederhana'); setJenisSoalan(q.jenisSoalan || 'subjektif'); setRajah(q.rajah || null);
    setSoalan(q.soalan || ''); setJawapan(q.jawapan || ''); setMata(q.mata || 10);
    if (q.pilihan) {
      setPilihanA(q.pilihan.A || ''); setPilihanB(q.pilihan.B || ''); 
      setPilihanC(q.pilihan.C || ''); setPilihanD(q.pilihan.D || '');
    } else {
      setPilihanA(''); setPilihanB(''); setPilihanC(''); setPilihanD('');
    }
    setPadanan(q.padanan || [{ id: Date.now(), kiri: '', kanan: '' }]);
    setPelbagaiPilihanJawapan(q.pelbagaiPilihanJawapan || []);
    setDragDropJawapan(q.dragDropJawapan ? q.dragDropJawapan.join(', ') : '');
    setDragDropEkstra(q.dragDropEkstra ? q.dragDropEkstra.join(', ') : '');
    setJadualKategori(q.jadualKategori ? q.jadualKategori.join(', ') : 'Integer, Bukan Integer');
    setJadualItems(q.jadualItems || [{ id: Date.now(), item: '', kategori: '' }]);
    setLabelRajahItems(q.labelRajahItems || []);
    setEditingQuestionId(q.id);
    setActiveTab('add');
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Adakah anda pasti mahu memadam ${selectedQuestions.length} soalan yang dipilih ini?`)) {
      try {
        for (const id of selectedQuestions) {
          await deleteQuestion(id);
        }
        const updatedQuestions = await getQuestions();
        setQuestionsList(updatedQuestions);
        setSelectedQuestions([]);
        alert('Soalan berjaya dipadam secara pukal!');
      } catch (error) {
        console.error('Ralat memadam soalan secara pukal:', error);
      }
    }
  };

  const handleBulkReset = async () => {
    if (window.confirm(`Adakah anda pasti mahu melepaskan (reset) ${selectedQuestions.length} soalan yang dipilih ini untuk semua profil? Mereka akan dapat menjawab soalan ini semula.`)) {
      try {
        for (const id of selectedQuestions) {
          await resetQuestionForProfiles(id);
        }
        const updatedProfiles = await getProfiles();
        setProfiles(updatedProfiles);
        alert('Berjaya melepaskan soalan! Anak-anak kini boleh menjumpai dan menjawabnya semula.');
        setSelectedQuestions([]);
      } catch (error) {
        console.error('Ralat reset soalan secara pukal:', error);
        alert('Gagal melepaskan soalan.');
      }
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (window.confirm('Adakah anda pasti mahu memadam soalan ini?')) {
      try {
        await deleteQuestion(id);
        const updatedQuestions = await getQuestions();
        setQuestionsList(updatedQuestions);
      } catch (error) {
        console.error('Ralat memadam soalan:', error);
      }
    }
  };

  const handleResetQuestion = async (id) => {
    if (window.confirm('Adakah anda pasti mahu melepaskan (reset) soalan ini untuk semua profil? Mereka akan dapat menjawab soalan ini semula.')) {
      try {
        await resetQuestionForProfiles(id);
        const updatedProfiles = await getProfiles();
        setProfiles(updatedProfiles);
        alert('Berjaya melepaskan soalan! Anak-anak kini boleh menjumpai dan menjawabnya semula.');
      } catch (error) {
        console.error('Ralat reset soalan:', error);
        alert('Gagal melepaskan soalan.');
      }
    }
  };

  const handleTambahProfil = async () => {
    if (!newProfileName || !newProfileLevel) {
      alert("Sila isikan nama dan tahap/tingkatan anak.");
      return;
    }
    try {
      await addProfile({ name: newProfileName, tahunTingkatan: newProfileLevel, pin: newProfilePin || '0000' });
      setNewProfileName('');
      setNewProfileLevel('');
      setNewProfilePin('');
      setProfiles(await getProfiles());
      alert("Profil berjaya ditambah!");
    } catch (error) {
      alert(`Gagal menambah profil: ${error.message}\n\nSila pastikan Firestore ditetapkan pada 'Test Mode' (Mod Ujian).`);
    }
  };

  const handleEditProfile = (p) => {
    setEditingProfileId(p.id);
    setEditProfileName(p.name);
    setEditProfileLevel(p.tahunTingkatan);
    setEditProfilePoints(p.points || 0);
    setEditProfilePin(p.pin || '0000');
  };

  const handleSimpanEditProfil = async () => {
    if (!editProfileName || !editProfileLevel) {
      alert("Nama dan tahap tidak boleh kosong.");
      return;
    }
    try {
      await updateProfile(editingProfileId, { 
        name: editProfileName, 
        tahunTingkatan: editProfileLevel,
        points: parseInt(editProfilePoints, 10) || 0,
        pin: editProfilePin || '0000'
      });
      setEditingProfileId(null);
      setProfiles(await getProfiles());
    } catch (error) {
      alert("Gagal kemas kini profil: " + error.message);
    }
  };

  const handleDeleteProfile = async (id, name) => {
    if (window.confirm(`Adakah anda pasti mahu memadam profil ${name}? Segala mata yang dikumpul akan hilang.`)) {
      try {
        await deleteProfile(id);
        setProfiles(await getProfiles());
      } catch (error) {
        alert("Gagal memadam profil: " + error.message);
      }
    }
  };

  const handleCsvUpload = () => {
    if (!csvFile) {
      setUploadStatus('Sila pilih fail CSV dahulu.');
      return;
    }
    
    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: async function(results) {
        let successCount = 0;
        setUploadStatus('Memuat naik ke Firebase... Sila tunggu.');
        for (const row of results.data) {
          if (row.Tahun && row.Topik && row.Soalan && row.Jawapan && row.Tahap) {
            const jenis = row.Jenis ? row.Jenis.toLowerCase() : 'subjektif';
            const pilihan = jenis === 'objektif' ? {
              A: row.A || '', B: row.B || '', C: row.C || '', D: row.D || ''
            } : null;
            
            let aras = "Sederhana";
            let mata = 5;
            if (row.Tahap) {
              const tahapLower = row.Tahap.toLowerCase().trim();
              if (tahapLower === 'senang') {
                aras = "Senang";
                mata = 2;
              } else if (tahapLower === 'sukar') {
                aras = "Sukar";
                mata = 10;
              }
            }
            
            await addQuestion({
              tahun: row.Tahun,
              topik: row.Topik,
              aras: aras,
              jenisSoalan: jenis,
              rajah: row.Rajah || null,
              soalan: row.Soalan,
              jawapan: row.Jawapan,
              pilihan,
              mata: mata,
              isVerified: false
            });
            successCount++;
          }
        }
        setUploadStatus(`Berjaya memuat naik ${successCount} soalan!`);
        setQuestionsList(await getQuestions());
        document.getElementById('csvInput').value = '';
        setCsvFile(null);
      },
      error: function(error) {
        setUploadStatus(`Ralat: ${error.message}`);
      }
    });
  };

  const handleAutoImportPemfaktoran = async () => {
    if (window.confirm("Adakah anda pasti mahu memuat naik Modul Pemfaktoran (Tingkatan 2) ke dalam sistem?")) {
      setUploadStatus('Memuat naik modul Pemfaktoran... Sila tunggu.');
      let successCount = 0;
      for (const q of pemfaktoranData) {
        try {
          await addQuestion({ ...q, isVerified: false });
          successCount++;
        } catch (e) {
          console.error(e);
        }
      }
      setUploadStatus(`Berjaya memuat naik ${successCount} soalan Pemfaktoran!`);
      setQuestionsList(await getQuestions());
    }
  };

  const parseMdAndImport = async () => {
    if (!mdFile) {
      setUploadStatus('Sila pilih fail .md dahulu.');
      return;
    }
    if (!mdTahun || !mdTopik) {
      setUploadStatus('Sila isikan Tahun dan Topik untuk modul ini.');
      return;
    }

    setUploadStatus('Membaca fail markdown... Sila tunggu.');
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      
      try {
        const matches = [...text.matchAll(/\*\*\s*(?:Soalan|S)\s*\d+[\s:.]*\*\*/ig)];
        const questionsRaw = text.split(/\*\*\s*(?:Soalan|S)\s*\d+[\s:.]*\*\*/i).slice(1);
        const answersRaw = text.split(/(?:##|###)\s*(?:Soalan|S)\s*\d+[\s:.]*/i).slice(1);
        
        if (questionsRaw.length === 0) {
          setUploadStatus('Tiada soalan dijumpai. Sila pastikan format "**Soalan X**" digunakan.');
          return;
        }

        let successCount = 0;
        
        for (let i = 0; i < questionsRaw.length; i++) {
          let parsedAras = "Sederhana";
          if (matches[i]) {
            const qIndex = matches[i].index;
            const textBefore = text.substring(0, qIndex).toUpperCase();
            const lastSenang = textBefore.lastIndexOf("ARAS SENANG");
            const lastSederhana = textBefore.lastIndexOf("ARAS SEDERHANA");
            const lastSukar = textBefore.lastIndexOf("ARAS SUKAR");
            const maxArasIndex = Math.max(lastSenang, lastSederhana, lastSukar);
            
            if (maxArasIndex !== -1) {
              if (maxArasIndex === lastSenang) parsedAras = "Senang";
              else if (maxArasIndex === lastSederhana) parsedAras = "Sederhana";
              else parsedAras = "Sukar";
            }
          }

          const qTextChunk = questionsRaw[i].split(/---|##/)[0].replace(/^[\s:]+/, '').trim();
          let aTextChunk = "";
          
          if (answersRaw[i]) {
            aTextChunk = answersRaw[i].split('---')[0].replace(/^[\s:]+/, '').trim();
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
               
               await addQuestion({
                  tahun: mdTahun,
                  topik: mdTopik,
                  aras: parsedAras,
                  jenisSoalan: "subjektif",
                  rajah: null,
                  soalan: fullQuestion,
                  jawapan: fullAnswer,
                  mata: 10,
                  isVerified: false
               });
               successCount++;
            }
          } else {
             if (qTextChunk) {
                await addQuestion({
                  tahun: mdTahun,
                  topik: mdTopik,
                  aras: parsedAras,
                  jenisSoalan: "subjektif",
                  rajah: null,
                  soalan: qTextChunk,
                  jawapan: aTextChunk || "Tiada Skema",
                  mata: 10,
                  isVerified: false
                });
                successCount++;
             }
          }
        }
        
        setUploadStatus(`Berjaya memuat naik ${successCount} soalan dari fail .md!`);
        setQuestionsList(await getQuestions());
        document.getElementById('mdInput').value = '';
        setMdFile(null);
      } catch (error) {
        console.error(error);
        setUploadStatus(`Ralat: ${error.message}`);
      }
    };
    reader.readAsText(mdFile);
  };

  const calculateTimeStats = (profile) => {
    const sessions = profile.usageSessions || [];
    const sortedSessions = [...sessions].sort((a, b) => new Date(b.start) - new Date(a.start));
    
    if (sortedSessions.length === 0) {
      return { 
        lastLogin: profile.displayLastLogin || 'Tiada rekod', 
        lastSession: '0 Minit', 
        daily: '0 Minit', 
        weekly: '0 Minit', 
        monthly: '0 Minit' 
      };
    }

    const now = new Date();
    const todayStr = now.toDateString();
    
    const getStartOfWeek = (d) => {
      const date = new Date(d);
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      return new Date(date.setDate(diff)).toDateString();
    };
    const currentWeekStart = getStartOfWeek(now);
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let daily = 0, weekly = 0, monthly = 0;

    sortedSessions.forEach(s => {
      const d = new Date(s.start);
      const mins = s.minutes || 0;
      
      if (d.toDateString() === todayStr) daily += mins;
      if (getStartOfWeek(d) === currentWeekStart) weekly += mins;
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) monthly += mins;
    });

    const formatMins = (m) => m >= 60 ? `${Math.floor(m/60)} Jam ${m%60 > 0 ? m%60 + ' Minit' : ''}` : `${m} Minit`;

    return {
      lastLogin: profile.displayLastLogin || new Date(sortedSessions[0].start).toLocaleString(),
      lastSession: formatMins(sortedSessions[0].minutes || 0),
      daily: formatMins(daily),
      weekly: formatMins(weekly),
      monthly: formatMins(monthly)
    };
  };

  const handleTambahReward = async () => {
    if (!newRewardName || !newRewardPoints) return;
    try {
      await addReward({ name: newRewardName, points: parseInt(newRewardPoints, 10), icon: newRewardIcon || '🎁' });
      setNewRewardName('');
      setNewRewardPoints(50);
      setNewRewardIcon('🎁');
      setRewardsList(await getRewards());
    } catch (e) {
      console.error(e);
      alert("Gagal menambah hadiah.");
    }
  };

  const handleEditReward = (r) => {
    setEditingRewardId(r.id);
    setEditRewardName(r.name);
    setEditRewardPoints(r.points || 0);
    setEditRewardIcon(r.icon || '🎁');
  };

  const handleSimpanEditReward = async () => {
    try {
      await updateReward(editingRewardId, { name: editRewardName, points: parseInt(editRewardPoints, 10), icon: editRewardIcon });
      setEditingRewardId(null);
      setRewardsList(await getRewards());
    } catch (e) {
      console.error(e);
    }
  };

  const handlePadamReward = async (id) => {
    if (window.confirm('Adakah anda pasti mahu memadam hadiah ini?')) {
      await deleteReward(id);
      setRewardsList(await getRewards());
    }
  };

  const handleUpdateParentPin = async () => {
    if (newParentPin.length !== 4 || isNaN(newParentPin)) {
      alert("PIN mestilah 4 digit nombor.");
      return;
    }
    const success = await updateParentPin(newParentPin);
    if (success) {
      setParentPin(newParentPin);
      setNewParentPin('');
      alert("PIN Ibu Bapa berjaya dikemas kini!");
    } else {
      alert("Gagal mengemas kini PIN.");
    }
  };

  if (!isParentAuthenticated) {
    return (
      <PinPad 
        title="Log Masuk Ibu Bapa"
        subtitle="Sila masukkan PIN (Lalai: 1234)"
        expectedPin={parentPin}
        onSuccess={() => setIsParentAuthenticated(true)}
      />
    );
  }

  return (
    <div className="flex gap-4">
      {/* Sidebar */}
      <div className="glass-panel" style={{ width: '250px', padding: '1.5rem 1rem' }}>
        <h3 className="text-secondary mb-8 text-center">Papan Pemuka</h3>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <li>
            <button onClick={() => setActiveTab('overview')} className={`sidebar-link ${activeTab === 'overview' ? 'active' : ''}`}>
              <Settings size={18} /> Ringkasan
            </button>
          </li>
          <li>
            <button onClick={() => setActiveTab('profiles')} className={`sidebar-link ${activeTab === 'profiles' ? 'active' : ''}`}>
              <Users size={18} /> Urus Anak
            </button>
          </li>
          <li>
            <button onClick={() => setActiveTab('rewards')} className={`sidebar-link ${activeTab === 'rewards' ? 'active' : ''}`}>
              <Gift size={18} /> Urus Hadiah
            </button>
          </li>
          <li>
            <button onClick={() => { resetQuestionForm(); setActiveTab('add'); }} className={`sidebar-link ${activeTab === 'add' ? 'active' : ''}`}>
              <PlusCircle size={18} /> Tambah Soalan
            </button>
          </li>
          <li>
            <button onClick={() => setActiveTab('upload')} className={`sidebar-link ${activeTab === 'upload' ? 'active' : ''}`}>
              <Upload size={18} /> Muat Naik Pukal
            </button>
          </li>
          <li>
            <button onClick={() => setActiveTab('list')} className={`sidebar-link ${activeTab === 'list' ? 'active' : ''}`}>
              <List size={18} /> Senarai Soalan
            </button>
          </li>
          <li>
            <button onClick={() => setActiveTab('performance')} className={`sidebar-link ${activeTab === 'performance' ? 'active' : ''}`}>
              <BarChart size={18} /> Laporan Prestasi
            </button>
            <button onClick={() => setActiveTab('review')} className={`sidebar-link ${activeTab === 'review' ? 'active' : ''}`}>
              <Edit size={18} /> Semakan Jawapan
              {pendingReviews.length > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full ml-auto">
                  {pendingReviews.length}
                </span>
              )}
            </button>
            <button onClick={() => setActiveTab('settings')} className={`sidebar-link ${activeTab === 'settings' ? 'active' : ''}`}>
              <Settings size={18} /> Tetapan
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content Area */}
      <div className="glass-panel w-full">
        
        {/* REVIEW TAB */}
        {activeTab === 'review' && (
          <div className="fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2>Semakan Jawapan Subjektif</h2>
            </div>
            
            {pendingReviews.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 text-green-500">
                  <span style={{ fontSize: '2rem' }}>✨</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Tiada Jawapan Menunggu Semakan</h3>
                <p className="text-muted">Semua jawapan subjektif telah disemak. Syabas!</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {pendingReviews.map((log) => {
                  const profile = profiles.find(p => p.id === log.childId);
                  const childName = profile ? profile.name : 'Pelajar Tidak Dikenali';
                  
                  return (
                    <div key={log.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-4">
                      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                        <div>
                          <span className="text-sm text-indigo-600 font-bold tracking-wider">{log.kodSoalan}</span>
                          <h3 className="text-lg font-bold">{childName}</h3>
                          <p className="text-xs text-muted">{new Date(log.timestamp).toLocaleString()}</p>
                        </div>
                        <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200">
                          Perlu Semakan
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Student Answer */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-gray-200">
                          <h4 className="text-xs uppercase font-bold text-gray-500 mb-2">Jawapan Pelajar</h4>
                          <p className="text-md font-bold whitespace-pre-wrap">{log.userAnswer || '(Tiada Jawapan)'}</p>
                        </div>
                        
                        {/* AI Feedback */}
                        {log.aiFeedback && (
                          <div className={`p-4 rounded-xl border ${log.aiScore > 5 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <h4 className="text-xs uppercase font-bold text-gray-500 mb-2">Maklum Balas AI (Sementara)</h4>
                            <p className="text-sm font-bold mb-1">{log.aiScore > 5 ? '✅ AI Anggap Betul' : '❌ AI Anggap Salah'} (Markah AI: {log.aiScore}/10)</p>
                            <p className="text-sm text-gray-700">{log.aiFeedback}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-3 mt-2">
                        <button 
                          className="btn btn-primary"
                          onClick={() => handleReviewAction(log.id, true, log.questionMata || 10)}
                        >
                          Tandakan Betul ({log.questionMata || 10} Markah)
                        </button>
                        <button 
                          className="btn bg-green-500 hover:bg-green-600 text-white"
                          onClick={() => handleReviewAction(log.id, true, log.questionMata || 10)}
                        >
                          Terima Keputusan AI ({log.questionMata || 10} Markah)
                        </button>
                        <button 
                          className="btn bg-red-500 hover:bg-red-600 text-white ml-auto"
                          onClick={() => handleReviewAction(log.id, false, 0)}
                        >
                          Tandakan Salah (0 Markah)
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PERFORMANCE TAB */}
        {activeTab === 'performance' && (
          <div className="animate-fade-in">
            <h2 className="text-primary mb-2">Laporan Prestasi Anak</h2>
            <p className="text-muted font-medium mb-8">Pantau perkembangan anak, kelajuan menjawab, dan topik kelemahan mereka secara terperinci.</p>
            
            {profiles.length === 0 ? (
              <div className="bg-gray-50 p-8 rounded-xl border border-dashed border-gray-300 text-center">
                <p className="text-muted m-0">Tiada anak didaftarkan lagi.</p>
              </div>
            ) : (
              <div>
                <div className="flex gap-4 mb-8 flex-wrap">
                  {profiles.map(p => (
                    <button 
                      key={p.id} 
                      className={`btn py-2 px-6 rounded-full transition-all ${selectedPerformanceProfile?.id === p.id ? 'btn-primary shadow-md' : 'btn-outline bg-white hover:bg-indigo-50'}`}
                      onClick={() => setSelectedPerformanceProfile(p)}
                    >
                      👤 {p.name}
                    </button>
                  ))}
                </div>

                {selectedPerformanceProfile && (
                  <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                      <h3 className="text-2xl text-gray-800 m-0 flex items-center gap-3">
                        Statistik: <span className="text-primary">{selectedPerformanceProfile.name}</span>
                      </h3>
                      <button onClick={() => loadPerformance(selectedPerformanceProfile.id)} className="btn btn-outline py-1 px-3 text-sm flex items-center gap-2">
                        <RotateCcw size={16} /> Segar Semula
                      </button>
                    </div>
                    
                    {performanceLogs.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-2xl">
                        <div className="text-4xl mb-4">📊</div>
                        <p className="text-muted font-bold m-0">Belum ada rekod jawapan untuk dianalisis.</p>
                        <p className="text-sm text-gray-400 mt-2">Minta anak anda bermain "Cabaran Matematik" dahulu!</p>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem', width: '100%' }}>
                        {(() => {
                          const totalQuestions = performanceLogs.length;
                          const correctFirstTry = performanceLogs.filter(log => log.isCorrect && log.attempts === 1).length;
                          const accuracy = Math.round((correctFirstTry / totalQuestions) * 100) || 0;
                          
                          const correctLogs = performanceLogs.filter(log => log.isCorrect);
                          const avgTime = correctLogs.length > 0 
                            ? Math.round(correctLogs.reduce((acc, log) => acc + (log.timeTaken || 0), 0) / correctLogs.length) 
                            : 0;

                          const stuckLogs = performanceLogs.filter(log => log.isStuck);
                          const stuckRate = Math.round((stuckLogs.length / totalQuestions) * 100) || 0;

                          const accuracyData = [
                            { name: 'Tepat', value: correctFirstTry },
                            { name: 'Kurang Tepat', value: totalQuestions - correctFirstTry }
                          ];
                          const stuckData = [
                            { name: 'Tersangkut', value: stuckLogs.length },
                            { name: 'Lancar', value: totalQuestions - stuckLogs.length }
                          ];

                          return (
                            <>
                              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
                                <h4 className="text-muted text-center" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold', marginBottom: '0.5rem' }}>Ketepatan Jawapan</h4>
                                <div style={{ width: '100%', height: '160px' }}>
                                  <ResponsiveContainer>
                                    <PieChart>
                                      <Pie data={accuracyData} innerRadius={55} outerRadius={70} paddingAngle={5} dataKey="value" stroke="none">
                                        <Cell fill="#16a34a" />
                                        <Cell fill="#f3f4f6" />
                                      </Pie>
                                      <RTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                    </PieChart>
                                  </ResponsiveContainer>
                                </div>
                                <div className="text-center" style={{ marginTop: '-20px' }}>
                                  <p style={{ fontSize: '1.875rem', fontWeight: '800', color: '#16a34a', margin: 0 }}>{accuracy}%</p>
                                  <p style={{ fontSize: '10px', color: '#4ade80', marginTop: '4px', fontWeight: 'bold', textTransform: 'uppercase', margin: 0 }}>(Percubaan Pertama)</p>
                                </div>
                              </div>
                              
                              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
                                <h4 className="text-muted text-center" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', verticalAlign: 'middle' }}>
                                    <Clock size={14} style={{ color: '#3b82f6' }} />
                                    Kelajuan Menjawab
                                  </span>
                                </h4>
                                <div style={{ width: '100%', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <div style={{ color: '#2563eb', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '4rem', fontWeight: '800', lineHeight: 1 }}>{avgTime}</span>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>saat</span>
                                  </div>
                                </div>
                                <div className="text-center" style={{ marginTop: '-20px' }}>
                                  <p style={{ fontSize: '10px', color: '#60a5fa', fontWeight: 'bold', textTransform: 'uppercase', margin: 0 }}>(Purata masa jawapan betul)</p>
                                </div>
                              </div>
                              
                              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
                                <h4 className="text-muted text-center" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold', marginBottom: '0.5rem' }}>Kekerapan Tersangkut</h4>
                                <div style={{ width: '100%', height: '160px' }}>
                                  <ResponsiveContainer>
                                    <PieChart>
                                      <Pie data={stuckData} innerRadius={55} outerRadius={70} paddingAngle={5} dataKey="value" stroke="none">
                                        <Cell fill="#dc2626" />
                                        <Cell fill="#f3f4f6" />
                                      </Pie>
                                      <RTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                    </PieChart>
                                  </ResponsiveContainer>
                                </div>
                                <div className="text-center" style={{ marginTop: '-20px' }}>
                                  <p style={{ fontSize: '1.875rem', fontWeight: '800', color: '#dc2626', margin: 0 }}>{stuckRate}%</p>
                                  <p style={{ fontSize: '10px', color: '#f87171', marginTop: '4px', fontWeight: 'bold', textTransform: 'uppercase', margin: 0 }}>({stuckLogs.length} soalan gagal)</p>
                                </div>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}

                    {performanceLogs.length > 0 && (
                      <div className="mt-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        <h4 className="mb-4 text-gray-800 flex items-center gap-2"><Info size={20} className="text-primary"/> Analisis Kelemahan (Topik Tersangkut)</h4>
                        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                          {(() => {
                            const stuckLogs = performanceLogs.filter(log => log.isStuck);
                            if (stuckLogs.length === 0) return (
                              <div className="text-center py-4">
                                <div className="text-3xl mb-2">🏆</div>
                                <p className="text-green-600 font-bold m-0">Hebat! Tiada rekod tersangkut buat masa ini.</p>
                              </div>
                            );
                            
                            const topicCounts = {};
                            stuckLogs.forEach(log => {
                              let actualCode = log.kodSoalan;
                              if (!actualCode || actualCode === 'Tiada Kod') {
                                const q = questionsList.find(ql => ql.id === log.questionId);
                                actualCode = q ? (q.kodSoalan || generateTempCode(q)) : log.questionId.substring(0,6).toUpperCase();
                              }
                              const key = `${log.topik || 'Lain-lain'}___${actualCode}`;
                              if (!topicCounts[key]) {
                                topicCounts[key] = { topik: log.topik || 'Lain-lain', kodSoalan: actualCode, count: 0, totalTime: 0 };
                              }
                              topicCounts[key].count += 1;
                              topicCounts[key].totalTime += (log.timeTaken || 0);
                            });
                            
                            const sortedTopics = Object.values(topicCounts).sort((a,b) => b.count - a.count);
                            
                            return (
                              <div className="overflow-x-auto mt-4 rounded-xl border border-gray-200 shadow-sm">
                                <table className="w-full text-center border-collapse bg-white">
                                  <thead>
                                    <tr className="bg-red-50/80 text-red-800">
                                      <th className="p-4 border-b border-red-100 font-bold text-center">Topik</th>
                                      <th className="p-4 border-b border-red-100 font-bold text-center">Kod Soalan</th>
                                      <th className="p-4 border-b border-red-100 font-bold text-center">Jumlah Tersangkut</th>
                                      <th className="p-4 border-b border-red-100 font-bold text-center">Jumlah Masa Berada</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {sortedTopics.map((item, idx) => (
                                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors text-center">
                                        <td className="p-4 font-bold text-gray-700">{item.topik}</td>
                                        <td className="p-4 text-gray-600 font-mono text-sm">{item.kodSoalan}</td>
                                        <td className="p-4">
                                          <span className="bg-red-100 text-red-700 font-bold px-3 py-1 rounded-full text-sm">
                                            {item.count} kali
                                          </span>
                                        </td>
                                        <td className="p-4 text-gray-600 font-medium">
                                          {item.totalTime}s
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="animate-fade-in">
            <h2>Ringkasan</h2>
            
            <div className="mt-8">
              <h3>Profil Anak</h3>
              {profiles.length === 0 ? (
                <p className="text-muted bg-gray-50 p-4 rounded border border-dashed border-gray-300">Belum ada anak yang didaftarkan. Sila ke tab "Urus Anak".</p>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200" style={{ backgroundColor: 'rgba(248, 250, 252, 0.8)' }}>
                          <th className="p-4 table-header text-center">Nama</th>
                          <th className="p-4 table-header text-center">Tahap</th>
                          <th className="p-4 table-header text-center">Masa Sesi<br/><span className="text-[10px] font-normal text-muted">(Harian | Mingguan | Bulanan)</span></th>
                          <th className="p-4 table-header text-center">Log Masuk Akhir</th>
                          <th className="p-4 table-header text-center">Mata</th>
                        </tr>
                      </thead>
                      <tbody style={{ borderTop: '1px solid #f1f5f9' }}>
                        {profiles.map(p => {
                          const stats = calculateTimeStats(p);
                          return (
                            <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                              <td className="p-4 text-center font-bold text-primary align-middle text-[15px]">{p.name}</td>
                              <td className="p-4 text-center text-sm text-muted align-middle">{p.tahunTingkatan}</td>
                              <td className="p-4 text-center align-middle">
                                <div className="flex justify-center gap-2 text-[11px] font-bold">
                                  <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded" title="Masa Harian">{stats.daily}</span>
                                  <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded" title="Masa Mingguan">{stats.weekly}</span>
                                  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded" title="Masa Bulanan">{stats.monthly}</span>
                                </div>
                              </td>
                              <td className="p-4 text-center text-xs font-medium text-gray-500 align-middle">{stats.lastLogin}</td>
                              <td className="p-4 text-center align-middle">
                                <span className="badge-points inline-block !text-sm !px-3 !py-1">{p.points}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-8">
              <h3>Sejarah Penebusan Masa 🎮</h3>
              {redemptions.length === 0 ? (
                <p className="text-muted bg-gray-50 p-4 rounded border border-dashed border-gray-300">Belum ada sebarang rekod penebusan.</p>
              ) : (
                <div className="flex flex-col gap-2 mt-4">
                  {redemptions.map(r => (
                    <div key={r.id} className="bg-white p-3 rounded shadow-sm border-l-4 border-primary flex justify-between items-center">
                      <div>
                        <strong>{r.childName} tebus {r.masa}</strong>
                        <p className="text-xs text-muted mb-0">{r.displayTime || r.timestamp}</p>
                      </div>
                      <span className="text-danger font-bold">-{r.kos} Mata</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* PROFILES TAB */}
        {activeTab === 'profiles' && (
          <div className="animate-fade-in">
            <h2>Urus Profil Anak</h2>
            
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mt-4 mb-8">
              <h3 className="mb-4">Daftar Anak Baru</h3>
              <div className="flex gap-4 flex-wrap" style={{ alignItems: 'flex-end' }}>
                <div className="input-group mb-0 flex-1">
                  <label className="input-label">Nama Panggilan</label>
                  <input type="text" className="input-field" placeholder="Contoh: Ali" value={newProfileName} onChange={(e) => setNewProfileName(e.target.value)} />
                </div>
                <div className="input-group mb-0 flex-1">
                  <label className="input-label">Tahun / Tingkatan</label>
                  <select className="input-field" value={newProfileLevel} onChange={(e) => setNewProfileLevel(e.target.value)}>
                    <option value="">-- Pilih --</option>
                    {tahapOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="input-group mb-0" style={{ width: '100px' }}>
                  <label className="input-label">PIN</label>
                  <input type="text" className="input-field" placeholder="0000" maxLength="4" value={newProfilePin} onChange={(e) => setNewProfilePin(e.target.value.replace(/[^0-9]/g, ''))} />
                </div>
                <div className="input-group mb-0">
                  <label className="input-label" style={{ visibility: 'hidden' }}>Daftar</label>
                  <button className="btn btn-secondary" style={{ height: '100%' }} onClick={handleTambahProfil}>Daftar Profil</button>
                </div>
              </div>
            </div>

            <h3>Senarai Anak Yang Didaftarkan</h3>
            {profiles.length === 0 ? (
              <p className="text-muted">Tiada profil setakat ini.</p>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-4">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200" style={{ backgroundColor: 'rgba(248, 250, 252, 0.8)' }}>
                      <th className="p-4 table-header text-center">Nama</th>
                      <th className="p-4 table-header text-center">Tahap</th>
                      <th className="p-4 table-header text-center">Baki Mata</th>
                      <th className="p-4 table-header text-center">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody style={{ borderTop: '1px solid #f1f5f9' }}>
                    {profiles.map(p => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        {editingProfileId === p.id ? (
                          <td colSpan="4" className="p-4">
                            <div className="flex gap-3 w-full items-center flex-wrap bg-gray-50 p-3 rounded-lg border border-indigo-100">
                              <input type="text" className="input-field flex-1 mb-0 min-w-[120px]" value={editProfileName} onChange={(e) => setEditProfileName(e.target.value)} placeholder="Nama" />
                              <select className="input-field flex-1 mb-0 min-w-[120px]" value={editProfileLevel} onChange={(e) => setEditProfileLevel(e.target.value)}>
                                {tahapOptions.map(t => <option key={t} value={t}>{t}</option>)}
                              </select>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-600">PIN:</span>
                                <input type="text" className="input-field mb-0" style={{ width: '70px', minWidth: '70px', padding: '0.5rem', textAlign: 'center' }} maxLength="4" placeholder="0000" value={editProfilePin} onChange={(e) => setEditProfilePin(e.target.value.replace(/[^0-9]/g, ''))} />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-600">Mata:</span>
                                <input type="number" className="input-field mb-0" style={{ width: '100px', minWidth: '100px', padding: '0.5rem', textAlign: 'center' }} value={editProfilePoints} onChange={(e) => setEditProfilePoints(e.target.value)} />
                              </div>
                              <div className="flex gap-2">
                                <button className="btn btn-primary px-4 py-2 text-sm" onClick={handleSimpanEditProfil}>Simpan</button>
                                <button className="btn btn-outline px-4 py-2 text-sm" onClick={() => setEditingProfileId(null)}>Batal</button>
                              </div>
                            </div>
                          </td>
                        ) : (
                          <>
                            <td className="p-4 text-center">
                              <span style={{ fontWeight: '600', color: '#1e293b', fontSize: '15px' }}>{p.name}</span>
                            </td>
                            <td className="p-4 text-muted text-center" style={{ fontSize: '14px' }}>{p.tahunTingkatan}</td>
                            <td className="p-4 text-center">
                              <span className="badge-points">
                                {p.points}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex gap-2 justify-center">
                                <button 
                                  className="btn-icon btn-icon-edit" 
                                  onClick={() => handleEditProfile(p)} 
                                  title="Edit Profil"
                                >
                                  <Edit size={18} />
                                </button>
                                <button 
                                  className="btn-icon btn-icon-delete" 
                                  onClick={() => handleDeleteProfile(p.id, p.name)} 
                                  title="Padam Profil"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* REWARDS TAB */}
        {activeTab === 'rewards' && (
          <div className="animate-fade-in">
            <h2>Urus Hadiah & Ganjaran 🎁</h2>
            <p className="text-muted mb-8">Tambah ganjaran yang boleh ditebus oleh anak-anak menggunakan mata mereka.</p>
            
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
              <h3 className="mb-4">Tambah Hadiah Baru</h3>
              <div className="flex gap-4 flex-wrap" style={{ alignItems: 'flex-end' }}>
                <div className="input-group mb-0 flex-1">
                  <label className="input-label">Nama Hadiah</label>
                  <input type="text" className="input-field" placeholder="Contoh: Main Roblox 30 Minit" value={newRewardName} onChange={(e) => setNewRewardName(e.target.value)} />
                </div>
                <div className="input-group mb-0" style={{ width: '120px' }}>
                  <label className="input-label">Kos Mata</label>
                  <input type="number" className="input-field" value={newRewardPoints} onChange={(e) => setNewRewardPoints(e.target.value)} />
                </div>
                <div className="input-group mb-0" style={{ width: '120px' }}>
                  <label className="input-label">Ikon (Emoji)</label>
                  <input type="text" className="input-field text-center text-xl" value={newRewardIcon} onChange={(e) => setNewRewardIcon(e.target.value)} />
                </div>
                <div className="input-group mb-0">
                  <label className="input-label" style={{ visibility: 'hidden' }}>Tambah</label>
                  <button className="btn btn-secondary" style={{ height: '100%' }} onClick={handleTambahReward}>Tambah Hadiah</button>
                </div>
              </div>
            </div>

            <h3>Senarai Hadiah Sedia Ada</h3>
            {rewardsList.length === 0 ? (
              <p className="text-muted">Tiada hadiah ditetapkan. Sila tambah hadiah di atas.</p>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-4">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200" style={{ backgroundColor: 'rgba(248, 250, 252, 0.8)' }}>
                      <th className="p-4 table-header text-center w-20">Ikon</th>
                      <th className="p-4 table-header">Nama Hadiah</th>
                      <th className="p-4 table-header text-center">Kos Mata</th>
                      <th className="p-4 table-header text-center">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody style={{ borderTop: '1px solid #f1f5f9' }}>
                    {rewardsList.map(r => (
                      <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        {editingRewardId === r.id ? (
                          <td colSpan="4" className="p-4">
                            <div className="flex gap-3 w-full items-center flex-wrap bg-gray-50 p-3 rounded-lg border border-indigo-100">
                              <input type="text" className="input-field mb-0 text-center text-xl" style={{ width: '80px', minWidth: '80px' }} value={editRewardIcon} onChange={(e) => setEditRewardIcon(e.target.value)} />
                              <input type="text" className="input-field flex-1 mb-0" value={editRewardName} onChange={(e) => setEditRewardName(e.target.value)} />
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-600">Mata:</span>
                                <input type="number" className="input-field mb-0" style={{ width: '100px', minWidth: '100px', padding: '0.5rem', textAlign: 'center' }} value={editRewardPoints} onChange={(e) => setEditRewardPoints(e.target.value)} />
                              </div>
                              <div className="flex gap-2">
                                <button className="btn btn-primary px-4 py-2 text-sm" onClick={handleSimpanEditReward}>Simpan</button>
                                <button className="btn btn-outline px-4 py-2 text-sm" onClick={() => setEditingRewardId(null)}>Batal</button>
                              </div>
                            </div>
                          </td>
                        ) : (
                          <>
                            <td className="p-4 text-center text-2xl">{r.icon}</td>
                            <td className="p-4" style={{ fontWeight: '600', color: '#1e293b' }}>{r.name}</td>
                            <td className="p-4 text-center">
                              <span className="badge-points">{r.points}</span>
                            </td>
                            <td className="p-4">
                              <div className="flex gap-2 justify-center">
                                <button className="btn-icon btn-icon-edit" onClick={() => handleEditReward(r)} title="Edit Hadiah">
                                  <Edit size={18} />
                                </button>
                                <button className="btn-icon btn-icon-delete" onClick={() => handlePadamReward(r.id)} title="Padam Hadiah">
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ADD QUESTION TAB */}
        {activeTab === 'add' && (
          <div className="animate-fade-in max-w-3xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="mb-0">{editingQuestionId ? 'Kemas Kini Soalan' : 'Tambah Soalan Baru'}</h2>
              {editingQuestionId && (
                <button className="btn btn-outline" onClick={resetQuestionForm}>
                  <X size={18} className="mr-2" /> Batal Edit
                </button>
              )}
            </div>

            {statusMessage && (
              <div className="p-4 mb-4 text-white bg-green-500 rounded" style={{ background: statusMessage.includes('Sila') || statusMessage.includes('Gagal') ? 'var(--danger)' : 'var(--success)' }}>
                {statusMessage}
              </div>
            )}
            
            <div className="flex flex-col gap-6 mt-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="mb-4 text-primary">1. Maklumat Asas Soalan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="input-group mb-0">
                    <label className="input-label">Tahun / Tingkatan (Soalan ini untuk siapa?)</label>
                    <select className="input-field" value={tahun} onChange={(e) => setTahun(e.target.value)}>
                      <option value="">-- Pilih --</option>
                      {tahapOptions.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="input-group mb-0">
                    <label className="input-label">Topik</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      value={topik} 
                      onChange={(e) => setTopik(e.target.value)} 
                      list="topik-options" 
                      placeholder="Pilih atau taip topik baru..."
                    />
                    <datalist id="topik-options">
                      {[...new Set([...questionsList.map(q => q.topik).filter(Boolean), "Operasi Asas (Tambah/Tolak)", "Pecahan", "Perpuluhan", "Peratus", "Ruang & Geometri", "Poligon", "Ungkapan Algebra"])].map(t => (
                        <option key={t} value={t} />
                      ))}
                    </datalist>
                  </div>
                  <div className="input-group mb-0">
                    <label className="input-label">Aras Soalan</label>
                    <select className="input-field" value={aras} onChange={(e) => setAras(e.target.value)}>
                      <option value="Senang">Senang</option>
                      <option value="Sederhana">Sederhana</option>
                      <option value="Sukar">Sukar</option>
                    </select>
                  </div>
                  <div className="input-group mb-0">
                    <label className="input-label">Jenis Soalan</label>
                    <select className="input-field" value={jenisSoalan} onChange={(e) => setJenisSoalan(e.target.value)}>
                      <option value="subjektif">Subjektif (Tulis jawapan di bawah)</option>
                      <option value="isi_tempat_kosong">Isi Tempat Kosong (Taip di dalam teks)</option>
                      <option value="objektif">Objektif (Satu Jawapan)</option>
                      <option value="pelbagai_pilihan">Pelbagai Pilihan (Lebih 1 Jawapan)</option>
                      <option value="padankan">Padankan (Kiri & Kanan)</option>
                      <option value="drag_drop">Drag & Drop (Tarik kata ke tempat kosong)</option>
                      <option value="jadual">Jadual / Kategorikan</option>
                      <option value="label_rajah">Label Rajah (Drag & Drop atas Imej)</option>
                    </select>
                  </div>
                  <div className="input-group mb-0">
                    <label className="input-label">Mata Ganjaran</label>
                    <input type="number" className="input-field" placeholder="10" value={mata} onChange={(e) => setMata(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-primary mb-0">2. Kandungan Soalan</h3>
                  <button 
                    onClick={() => setShowLatexGuide(!showLatexGuide)} 
                    className="btn btn-outline py-1 px-3" 
                    style={{ fontSize: '0.85rem' }}
                  >
                    <Info size={14} className="mr-1" /> Panduan Matematik {showLatexGuide ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>

                {showLatexGuide && (
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 mb-6 animate-fade-in text-sm text-indigo-900">
                    <h4 className="text-indigo-800 mb-2">Panduan Menaip Formula (LaTeX)</h4>
                    <p className="mb-2">Untuk menulis formula matematik sebenar, anda perlu mengurung formula anda menggunakan tanda <code>$</code>. Contohnya:</p>
                    <ul className="list-disc pl-5 mb-4 space-y-1">
                      <li>Tulis <code>Kira $\frac{1}{2}$ daripada 10</code> untuk menghasilkan: <LatexRenderer>Kira $\frac{1}{2}$ daripada 10</LatexRenderer></li>
                      <li>Tulis <code>$3^{2} + 4$</code> untuk menghasilkan: <LatexRenderer>$3^{2} + 4$</LatexRenderer></li>
                    </ul>
                    
                    <p className="font-bold mb-2">Klik butang di bawah untuk memasukkan simbol pantas ke dalam kursor anda:</p>
                    <div className="flex flex-wrap gap-2">
                      {mathSymbols.map(sym => (
                        <button 
                          key={sym.label} 
                          className="bg-white border border-indigo-200 rounded px-3 py-1 hover:bg-indigo-100 transition-colors shadow-sm"
                          onClick={() => insertLatex(sym.code)}
                          title={`Masukkan ${sym.code}`}
                        >
                          {sym.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="input-group">
                  <label className="input-label flex items-center gap-2">
                    <ImageIcon size={16} /> Rajah / Gambar (Pilihan)
                  </label>
                  <label className="btn btn-outline w-full justify-center border-dashed border-gray-300 py-3 cursor-pointer text-gray-500 hover:bg-gray-50 hover:text-indigo-600 transition-colors text-sm">
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                    <Upload size={18} className="mr-2" /> Pilih fail imej...
                  </label>
                  {rajah && (
                    <div className="mt-2 text-center">
                      <img src={rajah} alt="Pratonton Rajah" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '8px' }} />
                      <button className="btn btn-outline mt-2" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => setRajah(null)}>Padam Gambar</button>
                    </div>
                  )}
                </div>
                
                <div className="input-group">
                  <label className="input-label">Teks Soalan</label>
                  <textarea className="input-field" placeholder="Sila taip soalan di sini... Contoh: Kira nilai $\frac{3}{4}$" rows="3" value={soalan} onChange={(e) => setSoalan(e.target.value)} />
                </div>
                
                {soalan && (
                  <div className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-lg mb-4">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Pratonton Soalan (Live Preview):</span>
                    <div className="text-lg whitespace-pre-line"><LatexRenderer>{soalan}</LatexRenderer></div>
                  </div>
                )}
                
                {(jenisSoalan === 'objektif' || jenisSoalan === 'pelbagai_pilihan') && (
                  <div className="p-4 bg-indigo-50/50 rounded-lg border border-indigo-100 mb-4">
                    <p className="text-sm font-bold mb-3 text-indigo-900">Pilihan Jawapan:</p>
                    {jenisSoalan === 'pelbagai_pilihan' && <p className="text-xs text-indigo-700 mb-2">Tandakan kotak pada jawapan yang betul di ruangan Jawapan Betul di bawah.</p>}
                    <div className="flex flex-col gap-3 mb-2">
                      <div className="flex gap-2 items-start">
                        <span className="font-bold w-6 mt-1">A.</span>
                        <div className="flex-1 flex flex-col gap-1">
                          <input type="text" className="input-field py-1 mb-0" value={pilihanA} onChange={(e) => setPilihanA(e.target.value)} />
                          {pilihanA && (
                            <div className="text-sm text-indigo-900 -mt-1" style={{ paddingLeft: '18px' }}>
                              <LatexRenderer>{pilihanA}</LatexRenderer>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 items-start">
                        <span className="font-bold w-6 mt-1">B.</span>
                        <div className="flex-1 flex flex-col gap-1">
                          <input type="text" className="input-field py-1 mb-0" value={pilihanB} onChange={(e) => setPilihanB(e.target.value)} />
                          {pilihanB && (
                            <div className="text-sm text-indigo-900 -mt-1" style={{ paddingLeft: '18px' }}>
                              <LatexRenderer>{pilihanB}</LatexRenderer>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 items-start">
                        <span className="font-bold w-6 mt-1">C.</span>
                        <div className="flex-1 flex flex-col gap-1">
                          <input type="text" className="input-field py-1 mb-0" value={pilihanC} onChange={(e) => setPilihanC(e.target.value)} />
                          {pilihanC && (
                            <div className="text-sm text-indigo-900 -mt-1" style={{ paddingLeft: '18px' }}>
                              <LatexRenderer>{pilihanC}</LatexRenderer>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 items-start">
                        <span className="font-bold w-6 mt-1">D.</span>
                        <div className="flex-1 flex flex-col gap-1">
                          <input type="text" className="input-field py-1 mb-0" value={pilihanD} onChange={(e) => setPilihanD(e.target.value)} />
                          {pilihanD && (
                            <div className="text-sm text-indigo-900 -mt-1" style={{ paddingLeft: '18px' }}>
                              <LatexRenderer>{pilihanD}</LatexRenderer>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="input-group mb-0">
                  <label className="input-label">Jawapan Betul (Untuk Subjektif/Objektif)</label>
                  {jenisSoalan === 'objektif' ? (
                    <select className="input-field" value={jawapan} onChange={(e) => setJawapan(e.target.value)}>
                      <option value="">-- Pilih Jawapan Betul --</option>
                      <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
                    </select>
                  ) : jenisSoalan === 'pelbagai_pilihan' ? (
                    <div className="flex gap-4">
                      {['A', 'B', 'C', 'D'].map(opt => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 border rounded">
                          <input type="checkbox" checked={pelbagaiPilihanJawapan.includes(opt)} onChange={(e) => {
                            if(e.target.checked) setPelbagaiPilihanJawapan([...pelbagaiPilihanJawapan, opt]);
                            else setPelbagaiPilihanJawapan(pelbagaiPilihanJawapan.filter(x => x !== opt));
                          }} /> {opt}
                        </label>
                      ))}
                    </div>
                  ) : jenisSoalan === 'padankan' ? (
                    <div className="flex flex-col gap-2 bg-yellow-50 p-4 border border-yellow-200 rounded">
                      <p className="text-sm font-bold mb-2">Pasangan Padanan (Kiri = Kanan)</p>
                      {padanan.map((p, idx) => (
                        <React.Fragment key={p.id}>
                          <div className="flex gap-2">
                            <input type="text" className="input-field flex-1 mb-0" placeholder="Kiri..." value={p.kiri} onChange={e => {
                              const newP = [...padanan]; newP[idx].kiri = e.target.value; setPadanan(newP);
                            }}/>
                            <input type="text" className="input-field flex-1 mb-0" placeholder="Kanan..." value={p.kanan} onChange={e => {
                              const newP = [...padanan]; newP[idx].kanan = e.target.value; setPadanan(newP);
                            }}/>
                            <button className="btn btn-outline text-red-500" onClick={() => setPadanan(padanan.filter(x => x.id !== p.id))}>X</button>
                          </div>
                          <div className="flex gap-2 text-sm text-yellow-800 -mt-1 ml-2 mb-2">
                            <span className="flex-1 opacity-80"><LatexRenderer>{p.kiri}</LatexRenderer></span>
                            <span className="flex-1 opacity-80 pl-2"><LatexRenderer>{p.kanan}</LatexRenderer></span>
                          </div>
                        </React.Fragment>
                      ))}
                      <button className="btn btn-secondary mt-2 text-sm" onClick={() => setPadanan([...padanan, {id: Date.now(), kiri: '', kanan: ''}])}>+ Tambah Pasangan</button>
                    </div>
                  ) : jenisSoalan === 'drag_drop' ? (
                    <div className="flex flex-col gap-2 bg-blue-50 p-4 border border-blue-200 rounded">
                      <p className="text-sm text-blue-800">Nota: Tulis [kosong] di dalam Teks Soalan di atas untuk mewakili tempat kosong.</p>
                      <input type="text" className="input-field mb-2" placeholder="Jawapan (pisahkan dengan koma)" value={dragDropJawapan} onChange={e => setDragDropJawapan(e.target.value)}/>
                      <input type="text" className="input-field mb-0" placeholder="Jawapan Ekstra Mengelirukan (pisahkan dengan koma)" value={dragDropEkstra} onChange={e => setDragDropEkstra(e.target.value)}/>
                      
                      {(dragDropJawapan || dragDropEkstra) && (
                        <div className="mt-2 p-3 bg-white border border-dashed border-blue-300 rounded-lg">
                           <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Pratonton Jawapan:</span>
                           <div className="flex flex-wrap gap-2">
                             {dragDropJawapan.split(',').filter(s => s.trim()).map((ans, i) => (
                               <span key={`ans-${i}`} className="px-3 py-1 bg-green-50 text-green-800 border border-green-300 rounded shadow-sm text-sm font-bold"><LatexRenderer>{ans.trim()}</LatexRenderer></span>
                             ))}
                             {dragDropEkstra.split(',').filter(s => s.trim()).map((ans, i) => (
                               <span key={`eks-${i}`} className="px-3 py-1 bg-red-50 text-red-800 border border-red-300 rounded shadow-sm text-sm font-bold"><LatexRenderer>{ans.trim()}</LatexRenderer></span>
                             ))}
                           </div>
                        </div>
                      )}
                    </div>
                  ) : jenisSoalan === 'label_rajah' ? (
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 mt-4 animate-fade-in">
                      <h4 className="font-bold text-gray-700 mb-4">Pengaturan Label Rajah</h4>
                      
                      {!rajah ? (
                        <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm mb-4">
                          Sila muat naik Rajah di bahagian atas terlebih dahulu. Anda perlu rajah untuk menetapkan titik label.
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-gray-600 mb-4">
                            <strong>Arahan:</strong> Klik pada mana-mana kawasan pada imej di bawah untuk meletakkan titik label. 
                            Kemudian masukkan jawapan untuk titik tersebut di bahagian bawah.
                          </p>
                          
                          <div className="text-center mb-6">
                            <div 
                              className="label-rajah-container mx-auto cursor-crosshair"
                              onClick={(e) => {
                                const rect = e.target.getBoundingClientRect();
                                const x = ((e.clientX - rect.left) / rect.width) * 100;
                                const y = ((e.clientY - rect.top) / rect.height) * 100;
                                setLabelRajahItems([...labelRajahItems, { id: Date.now().toString(), x, y, jawapan: '' }]);
                              }}
                            >
                              <img src={rajah} alt="Rajah" className="label-rajah-img" />
                              
                              {labelRajahItems.map((item, index) => (
                                <div 
                                  key={item.id}
                                  className="label-rajah-hotspot"
                                  style={{ left: `${item.x}%`, top: `${item.y}%` }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                  title={`Titik ${index + 1}`}
                                >
                                  {index + 1}
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {labelRajahItems.length > 0 && (
                            <div>
                              <h5 className="font-bold text-sm mb-3">Senarai Jawapan (Mengikut Nombor Titik):</h5>
                              <div className="space-y-3">
                                {labelRajahItems.map((item, index) => (
                                  <React.Fragment key={item.id}>
                                    <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
                                      <div className="w-8 h-8 flex-shrink-0 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                                      {index + 1}
                                    </div>
                                    <div className="flex-1">
                                      <input 
                                        type="text" 
                                        className="input-field mb-0" 
                                        placeholder="Jawapan untuk titik ini (cth: Daun)" 
                                        value={item.jawapan}
                                        onChange={(e) => {
                                          const newItems = [...labelRajahItems];
                                          newItems[index].jawapan = e.target.value;
                                          setLabelRajahItems(newItems);
                                        }}
                                      />
                                    </div>
                                    <button 
                                      className="text-red-500 hover:text-red-700 p-2"
                                      onClick={() => {
                                        setLabelRajahItems(labelRajahItems.filter(i => i.id !== item.id));
                                      }}
                                    >
                                      <span className="font-bold">Padam</span>
                                    </button>
                                  </div>
                                  {item.jawapan && (
                                    <div className="text-sm text-indigo-900 ml-12 -mt-1 mb-2 bg-indigo-50/50 p-2 rounded inline-block">
                                      <LatexRenderer>{item.jawapan}</LatexRenderer>
                                    </div>
                                  )}
                                </React.Fragment>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ) : jenisSoalan === 'jadual' ? (
                    <div className="flex flex-col gap-2 bg-green-50 p-4 border border-green-200 rounded">
                      <label className="text-sm font-bold">Kategori Tersedia (pisahkan dengan koma)</label>
                      <input type="text" className="input-field mb-4" placeholder="Contoh: Integer, Bukan Integer" value={jadualKategori} onChange={e => setJadualKategori(e.target.value)}/>
                      
                      <label className="text-sm font-bold">Item Jadual</label>
                      {jadualItems.map((item, idx) => (
                        <React.Fragment key={item.id}>
                          <div className="flex gap-2">
                            <input type="text" className="input-field flex-1 mb-0" placeholder="Nama Item..." value={item.item} onChange={e => {
                              const newI = [...jadualItems]; newI[idx].item = e.target.value; setJadualItems(newI);
                            }}/>
                            <select className="input-field flex-1 mb-0" value={item.kategori} onChange={e => {
                              const newI = [...jadualItems]; newI[idx].kategori = e.target.value; setJadualItems(newI);
                            }}>
                              <option value="">-- Pilih Kategori --</option>
                              {jadualKategori.split(',').map(s => s.trim()).filter(Boolean).map(k => (
                                <option key={k} value={k}>{k}</option>
                              ))}
                            </select>
                            <button className="btn btn-outline text-red-500" onClick={() => setJadualItems(jadualItems.filter(x => x.id !== item.id))}>X</button>
                          </div>
                          {item.item && (
                            <div className="text-sm text-green-800 -mt-1 ml-2 mb-2 bg-green-50/50 p-1 px-2 rounded inline-block">
                              <LatexRenderer>{item.item}</LatexRenderer>
                            </div>
                          )}
                        </React.Fragment>
                      ))}
                      <button className="btn btn-secondary mt-2 text-sm" onClick={() => setJadualItems([...jadualItems, {id: Date.now(), item: '', kategori: ''}])}>+ Tambah Item Jadual</button>
                    </div>
                  ) : jenisSoalan === 'isi_tempat_kosong' ? (
                    <div className="flex flex-col gap-2 bg-purple-50 p-4 border border-purple-200 rounded">
                      <p className="text-sm text-purple-800 font-bold">Nota: Tulis [kosong] di dalam Teks Soalan di atas untuk mewakili tempat kosong.</p>
                      <input type="text" className="input-field mb-2" placeholder="Jawapan (pisahkan dengan koma mengikut turutan)" value={jawapan} onChange={e => setJawapan(e.target.value)}/>
                      {jawapan && (
                        <div className="mt-2 p-3 bg-white border border-dashed border-purple-300 rounded-lg">
                           <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Pratonton Jawapan:</span>
                           <div className="flex flex-wrap gap-2">
                             {jawapan.split(',').filter(s => s.trim()).map((ans, i) => (
                               <span key={`ans-${i}`} className="px-3 py-1 bg-purple-100 text-purple-800 border border-purple-300 rounded shadow-sm text-sm font-bold">Tempat {i+1}: <LatexRenderer>{ans.trim()}</LatexRenderer></span>
                             ))}
                           </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <textarea className="input-field" placeholder="Contoh: x=5. Sila taip jawapan penuh di sini..." rows="4" value={jawapan} onChange={(e) => setJawapan(e.target.value)} />
                      {jawapan && (
                        <div className="mt-2 p-3 bg-gray-50 border border-dashed border-gray-300 rounded text-sm whitespace-pre-line">
                          <span className="font-bold text-gray-500 mr-2">Pratonton Jawapan:</span>
                          <LatexRenderer>{jawapan}</LatexRenderer>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <button className="btn btn-primary mt-6 w-full py-3" onClick={handleSimpanSoalan}>
              <Save size={18} className="mr-2" /> {editingQuestionId ? 'Simpan Kemas Kini' : 'Simpan Soalan'}
            </button>
          </div>
        )}

        {/* UPLOAD TAB */}
        {activeTab === 'upload' && (
          <div className="animate-fade-in">
            <h2>Muat Naik Fail CSV</h2>
            <p className="text-muted mb-4">Muat naik fail yang mengandungi senarai soalan, jawapan, dan tahap soalan secara pukal.</p>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-200">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-blue-800 m-0">Format CSV Yang Dibenarkan</h4>
                <button 
                  className="btn btn-primary py-1 px-3 text-xs"
                  onClick={() => {
                    const csvContent = "data:text/csv;charset=utf-8,Tahun,Topik,Jenis,Tahap,Soalan,Rajah,Jawapan,A,B,C,D\nTingkatan 1,Pecahan,objektif,Senang,Berapakah 1+1?,https://imej.com/contoh.png,A,2,3,4,5";
                    const encodedUri = encodeURI(csvContent);
                    const link = document.createElement("a");
                    link.setAttribute("href", encodedUri);
                    link.setAttribute("download", "Templat_Soalan.csv");
                    document.body.appendChild(link);
                    link.click();
                  }}
                >
                  📥 Muat Turun Templat
                </button>
              </div>
              <p className="text-sm text-blue-700 mb-2">Pastikan baris pertama (header) fail anda mengandungi nama lajur berikut (ejaan mesti tepat):</p>
              <code className="bg-white p-2 rounded block text-xs overflow-x-auto whitespace-nowrap border border-blue-100">Tahun, Topik, Jenis, Soalan, Rajah, Jawapan, Mata, A, B, C, D</code>
              <p className="text-xs text-blue-600 mt-2">* Lajur <strong>Rajah</strong> digunakan untuk memasukkan pautan internet (URL) gambar rajah sekiranya ada. Kosongkan jika tiada gambar.</p>
            </div>

            <div className="border-2 border-dashed border-indigo-200 p-8 text-center rounded-2xl bg-indigo-50 flex flex-col items-center hover:border-indigo-400 transition-colors">
              <Upload size={48} className="text-indigo-400 mb-4 mx-auto" />
              
              <label className="btn bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 cursor-pointer shadow-sm mb-4 px-6 py-2 rounded-full font-bold transition-all">
                <input 
                  type="file" 
                  accept=".csv"
                  onChange={(e) => setCsvFile(e.target.files[0])}
                  style={{ display: 'none' }}
                  id="csvInput"
                />
                {csvFile ? csvFile.name : 'Pilih Fail .csv'}
              </label>
              
              <button className="btn btn-primary" onClick={handleCsvUpload}>
                Muat Naik Sekarang
              </button>
              
              {uploadStatus && (
                <p className="mt-4 font-bold text-secondary">{uploadStatus}</p>
              )}
            </div>

            <div className="mt-8 bg-purple-50 p-6 rounded-xl border border-purple-200">
              <h3 className="text-purple-800 mb-2">Import Dari Fail Markdown (.md)</h3>
              <p className="text-sm text-purple-700 mb-4">
                Pilih fail .md yang mengandungi soalan. Anda perlu isikan Tahun dan Topik bagi modul ini terlebih dahulu.
              </p>
              
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1 input-group mb-0">
                  <label className="input-label text-purple-800 font-bold">Tahun/Tingkatan</label>
                  <input type="text" className="input-field mb-0 border-purple-300" placeholder="Contoh: Tingkatan 2" value={mdTahun} onChange={(e) => setMdTahun(e.target.value)} />
                </div>
                <div className="flex-1 input-group mb-0">
                  <label className="input-label text-purple-800 font-bold">Topik</label>
                  <input type="text" className="input-field mb-0 border-purple-300" placeholder="Contoh: Pemfaktoran" value={mdTopik} onChange={(e) => setMdTopik(e.target.value)} />
                </div>
              </div>

              <label className="btn bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 cursor-pointer shadow-sm mb-4 px-6 py-3 w-full flex items-center justify-center rounded-lg font-bold transition-all">
                <input 
                  type="file" 
                  accept=".md"
                  onChange={(e) => setMdFile(e.target.files[0])}
                  style={{ display: 'none' }}
                  id="mdInput"
                />
                <Upload size={18} className="mr-2" />
                {mdFile ? mdFile.name : 'Pilih Fail .md'}
              </label>

              <button className="btn btn-secondary w-full py-3 shadow text-base" onClick={parseMdAndImport}>
                Import Soalan Dari .md Sekarang
              </button>
            </div>
          </div>
        )}

        {/* LIST TAB */}
        {activeTab === 'list' && (
          <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <h2 className="mb-0">Senarai Soalan</h2>
                <label className="flex items-center gap-2 text-sm font-bold cursor-pointer text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-100 transition-colors">
                  <input type="checkbox" checked={filterUnverified} onChange={(e) => setFilterUnverified(e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer" style={{ width: '16px', height: '16px' }} />
                  Unverified Sahaja <span className="bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-black">{questionsList.filter(q => !q.isVerified).length}</span>
                </label>
                <label className="flex items-center gap-2 text-sm font-bold cursor-pointer text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm hover:bg-gray-100 transition-colors">
                  <input type="checkbox" checked={filterAnswered} onChange={(e) => setFilterAnswered(e.target.checked)} className="rounded text-green-600 focus:ring-green-500 cursor-pointer" style={{ width: '16px', height: '16px' }} />
                  Telah Dijawab Sahaja <span className="bg-green-200 text-green-800 px-2 py-0.5 rounded-full text-xs font-black">{questionsList.filter(q => profiles.some(p => p.answeredQuestions?.includes(q.id))).length}</span>
                </label>
              </div>
              <div className="flex gap-2 w-full md:w-auto items-center flex-wrap">
                {selectedQuestions.length > 0 && (
                  <>
                    <button className="btn btn-danger py-2 px-3 text-sm flex items-center shadow-sm" style={{ backgroundColor: 'var(--danger)', color: 'white' }} onClick={handleBulkDelete}>
                      <Trash2 size={16} className="mr-1" /> Padam ({selectedQuestions.length})
                    </button>
                    <button className="btn btn-warning py-2 px-3 text-sm flex items-center shadow-sm" style={{ backgroundColor: '#f59e0b', color: 'white' }} onClick={handleBulkReset}>
                      <RotateCcw size={16} className="mr-1" /> Reset ({selectedQuestions.length})
                    </button>
                  </>
                )}
                <input 
                  type="text" 
                  className="input-field max-w-xs mb-0 py-2 border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
                  placeholder="🔍 Cari Kod, Topik..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="overflow-x-auto shadow-sm border border-gray-200 rounded-lg">
              <table className="w-full text-center border-collapse min-w-[700px] bg-white">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 table-header">
                    <th className="p-4 w-12 text-center align-middle">
                      <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        checked={questionsList.length > 0 && selectedQuestions.length === questionsList.length}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedQuestions(questionsList.map(q => q.id));
                          } else {
                            setSelectedQuestions([]);
                          }
                        }}
                      />
                    </th>
                    <th className="p-4 w-12 text-center align-middle">No.</th>
                    <th className="p-4 text-center align-middle whitespace-nowrap" style={{ minWidth: '120px' }}>Kod Soalan</th>
                    <th className="p-4 text-center align-middle">Tahap/Tingkatan</th>
                    <th className="p-4 text-center align-middle">Topik</th>
                    <th className="p-4 text-center align-middle">Aras</th>
                    <th className="p-4 text-center align-middle">Jenis</th>
                    <th className="p-4 text-center align-middle">Butiran</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const filteredQuestions = questionsList.filter(q => {
                      const term = searchQuery.toLowerCase();
                      const kod = (q.kodSoalan || generateTempCode(q)).toLowerCase();
                      const topik = (q.topik || '').toLowerCase();
                      const tahun = (q.tahun || '').toLowerCase();
                      
                      const matchesSearch = kod.includes(term) || topik.includes(term) || tahun.includes(term);
                      const matchesVerified = filterUnverified ? !q.isVerified : true;
                      
                      const isAnsweredByAny = profiles.some(p => p.answeredQuestions?.includes(q.id));
                      const matchesAnswered = filterAnswered ? isAnsweredByAny : true;
                      
                      return matchesSearch && matchesVerified && matchesAnswered;
                    });

                    if (filteredQuestions.length === 0) {
                      return (
                        <tr>
                          <td colSpan="8" className="p-8 text-center text-muted bg-white italic">
                            Tiada soalan ditemui untuk carian "{searchQuery}"
                          </td>
                        </tr>
                      );
                    }

                    return filteredQuestions.map((q, idx) => {
                      const kodSoalan = q.kodSoalan || generateTempCode(q);
                      const isExpanded = expandedQuestionId === q.id;
                      const isSelected = selectedQuestions.includes(q.id);
                      
                      return (
                        <React.Fragment key={q.id || idx}>
                          <tr 
                            className={`border-b border-gray-100 hover:bg-indigo-50/50 cursor-pointer transition-colors ${isExpanded ? 'bg-indigo-50/30' : ''}`}
                            onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                          >
                            <td className="p-4 text-center align-middle" onClick={(e) => e.stopPropagation()}>
                              <input 
                                type="checkbox"
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedQuestions([...selectedQuestions, q.id]);
                                  } else {
                                    setSelectedQuestions(selectedQuestions.filter(id => id !== q.id));
                                  }
                                }}
                              />
                            </td>
                            <td className="p-4 text-center font-bold text-gray-400 align-middle">{idx + 1}</td>
                            <td className="p-4 text-center font-mono text-sm text-indigo-600 font-bold whitespace-nowrap align-middle">
                              {kodSoalan}
                              {!q.isVerified && <span className="ml-2 px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-[10px] font-black uppercase tracking-wider">Unverified</span>}
                              {profiles.some(p => p.answeredQuestions?.includes(q.id)) && <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-[10px] font-black uppercase tracking-wider" title="Telah Dijawab">✓ Dijawab</span>}
                            </td>
                            <td className="p-4 text-center text-sm font-bold text-primary align-middle">{q.tahun}</td>
                            <td className="p-4 text-center text-sm text-muted align-middle">{q.topik}</td>
                            <td className="p-4 text-center text-sm align-middle">
                              <span 
                                className="px-3 py-1.5 rounded-full text-xs font-bold"
                                style={{
                                  backgroundColor: (q.aras || '').toLowerCase().includes('senang') ? '#dcfce7' : (q.aras || '').toLowerCase().includes('sukar') ? '#fee2e2' : '#ffedd5',
                                  color: (q.aras || '').toLowerCase().includes('senang') ? '#15803d' : (q.aras || '').toLowerCase().includes('sukar') ? '#b91c1c' : '#c2410c'
                                }}
                              >
                                {q.aras || 'Sederhana'}
                              </span>
                            </td>
                            <td className="p-4 text-center text-sm uppercase align-middle"><span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold">{q.jenisSoalan}</span></td>
                            <td className="p-4 text-center align-middle">
                              <div className="flex justify-center items-center gap-2">
                                <button className="btn-icon text-green-600 hover:bg-green-50" onClick={(e) => { e.stopPropagation(); handleResetQuestion(q.id); }} title="Lepaskan Soalan (Reset)">
                                  <RotateCcw size={18} />
                                </button>
                                <button className="btn-icon btn-icon-edit" onClick={(e) => { e.stopPropagation(); handleEditQuestion(q); }} title="Kemas Kini">
                                  <Edit size={18} />
                                </button>
                                <button className="btn-icon btn-icon-delete" onClick={(e) => { e.stopPropagation(); handleDeleteQuestion(q.id); }} title="Padam">
                                  <Trash2 size={18} />
                                </button>
                                {!q.isVerified && (
                                  <button 
                                    className="btn-icon text-white bg-green-500 hover:bg-green-600 border border-green-600 ml-1 rounded-full p-1 shadow-sm" 
                                    onClick={async (e) => { 
                                      e.stopPropagation(); 
                                      await updateQuestion(q.id, { isVerified: true });
                                      setQuestionsList(questionsList.map(item => item.id === q.id ? { ...item, isVerified: true } : item));
                                    }} 
                                    title="Verify (Sahkan)"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                  </button>
                                )}
                                <div className="text-muted ml-2">
                                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </div>
                              </div>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="bg-indigo-50/30 border-b border-gray-200">
                              <td colSpan="2"></td>
                              <td colSpan="6" className="py-6 pr-6 pl-4 md:pl-8">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left', width: '100%' }}>
                                  <div style={{ width: '100%' }}>
                                    <span className="mb-2 block text-left" style={{ fontWeight: '900', fontSize: '0.9rem', color: '#111827', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kandungan Soalan:</span>
                                    <div className="mt-0 mb-3 text-lg whitespace-pre-line font-bold" style={{ color: '#1f2937' }}><LatexRenderer>{q.soalan}</LatexRenderer></div>
                                    {q.rajah && <div className="mb-3"><img src={q.rajah} alt="Rajah" className="rounded border border-gray-200" style={{ maxHeight: '120px' }} /></div>}
                                    
                                    {(() => {
                                      const answeredProfiles = profiles.filter(p => p.answeredQuestions && p.answeredQuestions.includes(q.id));
                                      if (answeredProfiles.length > 0) {
                                        return (
                                          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg inline-block">
                                            <span className="text-sm font-bold text-green-800 mr-2">Telah Dijawab Oleh:</span>
                                            <span className="text-sm font-medium text-green-700">{answeredProfiles.map(p => p.name).join(', ')}</span>
                                          </div>
                                        );
                                      }
                                      return null;
                                    })()}
                                  </div>
                                  <div className="pt-6 border-t border-gray-200/60" style={{ width: '100%', textAlign: 'left' }}>
                                    <span className="mb-2 block" style={{ fontWeight: '900', fontSize: '0.9rem', color: '#111827', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kunci Jawapan:</span>
                                    <div className="text-lg font-bold" style={{ margin: '0 0 10px 0', color: 'var(--success)', whiteSpace: 'pre-line' }}>
                                      {q.jenisSoalan === 'jadual' ? (
                                        <table className="w-full max-w-lg border-collapse border border-green-200 rounded overflow-hidden mt-2">
                                          <thead>
                                            <tr className="bg-green-50">
                                              <th className="border border-green-200 p-2 text-left text-sm text-green-800">Item</th>
                                              <th className="border border-green-200 p-2 text-center text-sm text-green-800">Kategori (Jawapan)</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {(q.jadualItems || []).map((item, idx) => (
                                              <tr key={idx} className="bg-white">
                                                <td className="border border-green-200 p-2 text-sm text-gray-800"><LatexRenderer>{item.item}</LatexRenderer></td>
                                                <td className="border border-green-200 p-2 text-sm text-center text-green-700 font-black bg-green-50/30">{item.kategori}</td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      ) : q.jenisSoalan === 'padankan' ? (
                                        <div className="flex flex-col gap-2 mt-2">
                                          {(q.padanan || []).map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-4 text-sm bg-green-50 p-3 rounded-lg border border-green-200 max-w-md shadow-sm">
                                              <span className="flex-1 text-gray-800"><LatexRenderer>{item.kiri}</LatexRenderer></span>
                                              <span className="text-green-600 font-black text-lg">→</span>
                                              <span className="flex-1 text-green-700 font-bold"><LatexRenderer>{item.kanan}</LatexRenderer></span>
                                            </div>
                                          ))}
                                        </div>
                                      ) : q.jenisSoalan === 'drag_drop' ? (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                          {(q.dragDropJawapan || []).map((ans, idx) => (
                                            <span key={idx} className="px-4 py-2 bg-green-50 text-green-800 border border-green-300 rounded-lg text-sm shadow-sm font-bold">{idx + 1}. <LatexRenderer>{ans}</LatexRenderer></span>
                                          ))}
                                        </div>
                                      ) : q.jenisSoalan === 'isi_tempat_kosong' ? (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                          {(q.jawapan || '').split(',').map((ans, idx) => (
                                            <span key={idx} className="px-4 py-2 bg-purple-50 text-purple-800 border border-purple-300 rounded-lg text-sm shadow-sm font-bold">{idx + 1}. <LatexRenderer>{ans.trim()}</LatexRenderer></span>
                                          ))}
                                        </div>
                                      ) : q.jenisSoalan === 'objektif' ? (
                                        <div className="text-md mt-1">
                                          <span className="text-xl font-black mr-2 text-green-700">{q.jawapan}.</span> 
                                          <LatexRenderer>{(q.pilihan || {})[q.jawapan]}</LatexRenderer>
                                        </div>
                                      ) : q.jenisSoalan === 'pelbagai_pilihan' ? (
                                        <div className="flex flex-col gap-2 mt-2">
                                          {(q.pelbagaiPilihanJawapan || []).sort().map(ans => (
                                            <div key={ans} className="text-md flex items-start gap-2 bg-green-50/50 p-2 rounded max-w-md">
                                              <span className="text-green-700 font-black">{ans}.</span>
                                              <span className="text-green-700"><LatexRenderer>{(q.pilihan || {})[ans]}</LatexRenderer></span>
                                            </div>
                                          ))}
                                        </div>
                                      ) : q.jenisSoalan === 'label_rajah' ? (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                          {(q.labelRajahItems || []).map((item, idx) => (
                                            <span key={item.id} className="px-4 py-2 bg-green-50 text-green-800 border border-green-300 rounded-lg text-sm shadow-sm font-bold">Titik {idx + 1}: <LatexRenderer>{item.jawapan}</LatexRenderer></span>
                                          ))}
                                        </div>
                                      ) : (
                                        <LatexRenderer>{q.jawapan}</LatexRenderer>
                                      )}
                                    </div>
                                    <span className="text-sm text-indigo-600 font-bold bg-indigo-50 inline-block px-3 py-1.5 rounded-lg mt-2"><span className="mr-1">🎁</span>{q.mata} mata</span>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="animate-fade-in">
            <h2>Tetapan Sistem</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {/* Security Settings */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="mb-4">Tukar PIN Ibu Bapa</h3>
                <p className="text-muted text-sm mb-6">PIN ini digunakan untuk mengakses Papan Pemuka Ibu Bapa.</p>
                
                <div className="input-group">
                  <label className="input-label">PIN Baharu (4 Digit)</label>
                  <input 
                    type="password" 
                    className="input-field" 
                    placeholder="****" 
                    maxLength="4" 
                    value={newParentPin} 
                    onChange={(e) => setNewParentPin(e.target.value.replace(/[^0-9]/g, ''))} 
                  />
                </div>
                
                <button className="btn btn-primary w-full mt-2" onClick={handleUpdateParentPin}>Simpan PIN Baru</button>
              </div>

              {/* Telegram Settings */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="mb-4 flex items-center gap-2">
                  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M21.5 2L2 11.5l6.5 2.5L20 4.5 10 14.5l8 6L21.5 2z"></path></svg>
                  Notifikasi Telegram
                </h3>
                <p className="text-muted text-sm mb-6">Terima mesej automatik apabila anak menebus hadiah.</p>
                
                <div className="input-group">
                  <label className="input-label">Bot Token</label>
                  <input 
                    type="text" 
                    className="input-field text-sm" 
                    placeholder="123456789:ABCdefGHIjklMNOpqrSTUvwxYZ" 
                    value={telegramToken} 
                    onChange={(e) => setTelegramToken(e.target.value)} 
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Chat ID</label>
                  <input 
                    type="text" 
                    className="input-field" 
                    value={telegramChatId} 
                    onChange={(e) => setTelegramChatId(e.target.value)} 
                    placeholder="Contoh: 123456789"
                  />
                  <p className="text-xs text-muted mt-1">Anda boleh dapatkan Chat ID dari bot @userinfobot</p>
                </div>
                
                {telegramTestStatus && (
                  <div className={`p-3 mb-4 rounded-lg text-sm ${telegramTestStatus.type === 'success' ? 'bg-green-50 text-green-700' : telegramTestStatus.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                    {telegramTestStatus.msg}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <button className="btn btn-primary" onClick={handleSaveTelegram}>Simpan Tetapan</button>
                  <button className="btn btn-secondary flex items-center justify-center gap-2" onClick={handleTestTelegram}>
                    <Info size={16} /> Uji Telegram
                  </button>
                </div>
              </div>
              
              {/* AI Settings */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="mb-4">Integrasi AI (Semakan Automatik)</h3>
                <p className="text-muted text-sm mb-6">Masukkan kunci API untuk membolehkan AI menyemak jawapan subjektif secara automatik.</p>
                
                <div className="input-group">
                  <label className="input-label">AI API Key</label>
                  <input 
                    type="password" 
                    className="input-field" 
                    value={geminiApiKey} 
                    onChange={(e) => setGeminiApiKey(e.target.value)} 
                    placeholder="sk-or-... atau AIzaSy..."
                  />
                  <p className="text-xs text-muted mt-1">Masukkan API Key dari pembekal pilihan anda.</p>
                </div>
                
                {aiSaveStatus && (
                  <div className={`p-3 mb-4 rounded-lg text-sm ${aiSaveStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {aiSaveStatus.msg}
                  </div>
                )}
                
                <button className="btn btn-primary" onClick={handleSaveAiSettings}>Simpan API Key</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default ParentDashboard;
