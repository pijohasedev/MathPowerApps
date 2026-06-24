import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, getDoc, query, orderBy, setDoc } from "firebase/firestore"; 
import { db } from "./firebase";

// --- QUESTIONS ---
export const getQuestions = async () => {
  try {
    const q = query(collection(db, "questions"));
    const querySnapshot = await getDocs(q);
    const questions = [];
    querySnapshot.forEach((doc) => {
      questions.push({ id: doc.id, ...doc.data() });
    });
    return questions;
  } catch (error) {
    console.error("Error getting questions: ", error);
    return [];
  }
};

export const addQuestion = async (question) => {
  try {
    const tahapCode = question.tahun ? question.tahun.replace(/[^A-Z0-9]/ig, '').substring(0, 2).toUpperCase() : 'XX';
    const topikCode = question.topik ? question.topik.substring(0, 3).toUpperCase() : 'XXX';
    const suffix = Math.floor(Math.random() * 10000).toString(16).toUpperCase().padStart(4, '0');
    const kodSoalan = `${tahapCode}-${topikCode}-${suffix}`;
    
    const questionWithCode = { ...question, kodSoalan };
    const docRef = await addDoc(collection(db, "questions"), questionWithCode);
    return { id: docRef.id, ...questionWithCode };
  } catch (error) {
    console.error("Error adding question: ", error);
    throw error;
  }
};

export const updateQuestion = async (id, updatedQuestion) => {
  try {
    const docRef = doc(db, "questions", id);
    await updateDoc(docRef, updatedQuestion);
    return { id, ...updatedQuestion };
  } catch (error) {
    console.error("Error updating question: ", error);
    throw error;
  }
};

export const deleteQuestion = async (id) => {
  try {
    const docRef = doc(db, "questions", id);
    await deleteDoc(docRef);
    return id;
  } catch (error) {
    console.error("Error deleting question: ", error);
    throw error;
  }
};

// --- PROFILES ---
export const getProfiles = async () => {
  try {
    const q = query(collection(db, "profiles"));
    const querySnapshot = await getDocs(q);
    const profiles = [];
    querySnapshot.forEach((doc) => {
      profiles.push({ id: doc.id, ...doc.data() });
    });
    return profiles;
  } catch (error) {
    console.error("Error getting profiles: ", error);
    return [];
  }
};

export const addProfile = async (profile) => {
  try {
    const newProfile = { pin: '0000', ...profile, points: 0, answeredQuestions: [] };
    const docRef = await addDoc(collection(db, "profiles"), newProfile);
    return { id: docRef.id, ...newProfile };
  } catch (error) {
    console.error("Error adding profile: ", error);
    throw error;
  }
};

export const updateProfile = async (id, updatedData) => {
  try {
    const profileRef = doc(db, "profiles", id);
    await updateDoc(profileRef, updatedData);
    return true;
  } catch (error) {
    console.error("Error updating profile: ", error);
    throw error;
  }
};

export const deleteProfile = async (id) => {
  try {
    const profileRef = doc(db, "profiles", id);
    await deleteDoc(profileRef);
    return true;
  } catch (error) {
    console.error("Error deleting profile: ", error);
    throw error;
  }
};

export const updatePoints = async (childId, pointsToAdd, questionId = null) => {
  try {
    const profileRef = doc(db, "profiles", childId);
    const profileSnap = await getDoc(profileRef);
    
    if (profileSnap.exists()) {
      const data = profileSnap.data();
      const currentPoints = data.points || 0;
      const newPoints = currentPoints + pointsToAdd;
      
      const updateData = { points: newPoints };
      let updatedAnsweredQuestions = data.answeredQuestions || [];
      
      if (questionId && !updatedAnsweredQuestions.includes(questionId)) {
        updatedAnsweredQuestions = [...updatedAnsweredQuestions, questionId];
        updateData.answeredQuestions = updatedAnsweredQuestions;
      }
      
      await updateDoc(profileRef, updateData);
      return { newPoints, answeredQuestions: updatedAnsweredQuestions };
    }
    return { newPoints: 0, answeredQuestions: [] };
  } catch (error) {
    console.error("Error updating points: ", error);
    return { newPoints: 0, answeredQuestions: [] };
  }
};

export const completeSifir = async (childId, sifirNumber, pointsToReward) => {
  try {
    const profileRef = doc(db, "profiles", childId);
    const profileSnap = await getDoc(profileRef);
    
    if (profileSnap.exists()) {
      const data = profileSnap.data();
      const currentPoints = data.points || 0;
      const newPoints = currentPoints + pointsToReward;
      
      const todayDate = new Date().toISOString().split('T')[0];
      let dailySifir = data.dailySifir || {};
      
      if (dailySifir.date !== todayDate) {
        dailySifir = { date: todayDate, completed: [] };
      }
      
      if (!dailySifir.completed.includes(sifirNumber)) {
        dailySifir.completed.push(sifirNumber);
      }
      
      await updateDoc(profileRef, { 
        points: newPoints,
        dailySifir: dailySifir
      });
      
      return { newPoints, dailySifir };
    }
    return null;
  } catch (error) {
    console.error("Error completing sifir: ", error);
    return null;
  }
};

export const resetQuestionForProfiles = async (questionId) => {
  try {
    const q = query(collection(db, "profiles"));
    const querySnapshot = await getDocs(q);
    
    const updatePromises = [];
    querySnapshot.forEach((document) => {
      const data = document.data();
      if (data.answeredQuestions && data.answeredQuestions.includes(questionId)) {
        const updatedAnsweredQuestions = data.answeredQuestions.filter(id => id !== questionId);
        const profileRef = doc(db, "profiles", document.id);
        updatePromises.push(updateDoc(profileRef, { answeredQuestions: updatedAnsweredQuestions }));
      }
    });
    
    await Promise.all(updatePromises);
    return true;
  } catch (error) {
    console.error("Error resetting question for profiles: ", error);
    throw error;
  }
};

export const deductPoints = async (childId, pointsToDeduct) => {
  try {
    const profileRef = doc(db, "profiles", childId);
    const profileSnap = await getDoc(profileRef);
    
    if (profileSnap.exists()) {
      const currentPoints = profileSnap.data().points || 0;
      if (currentPoints >= pointsToDeduct) {
        const newPoints = currentPoints - pointsToDeduct;
        await updateDoc(profileRef, { points: newPoints });
        return newPoints;
      }
    }
    return -1;
  } catch (error) {
    console.error("Error deducting points: ", error);
    return -1;
  }
};

// --- REDEMPTIONS ---
export const getRedemptions = async () => {
  try {
    const q = query(collection(db, "redemptions"), orderBy("timestamp", "desc"));
    const querySnapshot = await getDocs(q);
    const redemptions = [];
    querySnapshot.forEach((doc) => {
      redemptions.push({ id: doc.id, ...doc.data() });
    });
    return redemptions;
  } catch (error) {
    console.error("Error getting redemptions: ", error);
    // If index is missing, it will throw an error, fallback to without order
    if (error.message && error.message.includes("index")) {
      const fallbackQ = query(collection(db, "redemptions"));
      const fallbackSnap = await getDocs(fallbackQ);
      const r = [];
      fallbackSnap.forEach(d => r.push({id: d.id, ...d.data()}));
      return r.sort((a,b) => b.timestamp.localeCompare(a.timestamp));
    }
    return [];
  }
};

export const addRedemption = async (childId, childName, redemptionInfo) => {
  try {
    const newRedemption = { 
      ...redemptionInfo, 
      childId,
      childName,
      timestamp: new Date().toISOString(),
      displayTime: new Date().toLocaleString()
    };
    const docRef = await addDoc(collection(db, "redemptions"), newRedemption);
    return { id: docRef.id, ...newRedemption };
  } catch (error) {
    console.error("Error adding redemption: ", error);
    throw error;
  }
};

// --- REWARDS ---
export const getRewards = async () => {
  try {
    const q = query(collection(db, "rewards"));
    const querySnapshot = await getDocs(q);
    const rewards = [];
    querySnapshot.forEach((doc) => {
      rewards.push({ id: doc.id, ...doc.data() });
    });
    return rewards;
  } catch (error) {
    console.error("Error getting rewards: ", error);
    return [];
  }
};

export const addReward = async (reward) => {
  try {
    const docRef = await addDoc(collection(db, "rewards"), reward);
    return { id: docRef.id, ...reward };
  } catch (error) {
    console.error("Error adding reward: ", error);
    throw error;
  }
};

export const updateReward = async (id, updatedReward) => {
  try {
    const docRef = doc(db, "rewards", id);
    await updateDoc(docRef, updatedReward);
    return { id, ...updatedReward };
  } catch (error) {
    console.error("Error updating reward: ", error);
    throw error;
  }
};

export const deleteReward = async (id) => {
  try {
    const docRef = doc(db, "rewards", id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error("Error deleting reward: ", error);
    throw error;
  }
};

// --- SESSION TRACKING ---
export const updateLastLogin = async (childId) => {
  try {
    const profileRef = doc(db, "profiles", childId);
    await updateDoc(profileRef, { 
      lastLogin: new Date().toISOString(),
      displayLastLogin: new Date().toLocaleString()
    });
  } catch (error) {
    console.error("Error updating last login: ", error);
  }
};

export const updateSessionTime = async (childId, sessionStartISO) => {
  try {
    const profileRef = doc(db, "profiles", childId);
    const profileSnap = await getDoc(profileRef);
    
    if (profileSnap.exists()) {
      const data = profileSnap.data();
      let sessions = data.usageSessions || [];
      
      const sessionIndex = sessions.findIndex(s => s.start === sessionStartISO);
      
      if (sessionIndex >= 0) {
        sessions[sessionIndex].minutes = (sessions[sessionIndex].minutes || 0) + 1;
      } else {
        sessions.push({ start: sessionStartISO, minutes: 1 });
      }
      
      await updateDoc(profileRef, { usageSessions: sessions });
    }
  } catch (error) {
    console.error("Error updating session time: ", error);
  }
};

// --- AUTH / PIN SETTINGS ---
export const getParentPin = async () => {
  try {
    const docRef = doc(db, "settings", "parentAuth");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().pin || "1234";
    }
    return "1234";
  } catch (error) {
    console.error("Error getting parent pin: ", error);
    return "1234";
  }
};

export const updateParentPin = async (newPin) => {
  try {
    const docRef = doc(db, "settings", "parentAuth");
    await setDoc(docRef, { pin: newPin }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error updating parent pin: ", error);
    return false;
  }
};

// --- TELEGRAM NOTIFICATIONS ---
export const getTelegramSettings = async () => {
  try {
    const docRef = doc(db, "settings", "telegram");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return { token: '', chatId: '' };
  } catch (error) {
    console.error("Error getting Telegram settings: ", error);
    return { token: '', chatId: '' };
  }
};

export const updateTelegramSettings = async (token, chatId) => {
  try {
    const docRef = doc(db, "settings", "telegram");
    await setDoc(docRef, { token, chatId }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error updating Telegram settings: ", error);
    return false;
  }
};

export const sendTelegramNotification = async (message) => {
  try {
    const settings = await getTelegramSettings();
    if (!settings || !settings.token || !settings.chatId) {
      console.log("Telegram not configured, skipping notification.");
      return false;
    }

    const url = `https://api.telegram.org/bot${settings.token}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: settings.chatId,
        text: message,
        parse_mode: 'Markdown'
      }),
    });

    if (response.ok) {
      return true;
    } else {
      console.error("Failed to send Telegram message", await response.text());
      return false;
    }
  } catch (error) {
    console.error("Error sending Telegram notification: ", error);
    return false;
  }
};

// --- PERFORMANCE TRACKING ---
export const logAnswer = async (childId, questionId, kodSoalan, topik, isCorrect, attempts, timeTaken, isStuck, extraData = {}) => {
  try {
    const logData = {
      childId,
      questionId,
      kodSoalan: kodSoalan || 'Tiada Kod',
      topik: topik || 'Tiada Topik',
      isCorrect,
      attempts,
      timeTaken,
      isStuck,
      ...extraData,
      timestamp: new Date().toISOString()
    };
    await addDoc(collection(db, "performanceLogs"), logData);
    return true;
  } catch (error) {
    console.error("Error logging answer: ", error);
    return false;
  }
};

export const getPerformanceReport = async (childId) => {
  try {
    const q = query(collection(db, "performanceLogs"));
    const querySnapshot = await getDocs(q);
    const logs = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.childId === childId) {
        logs.push({ id: doc.id, ...data });
      }
    });
    return logs;
  } catch (error) {
    console.error("Error getting performance report: ", error);
    return [];
  }
};

// --- AI SETTINGS ---
export const getAiSettings = async () => {
  try {
    const docRef = doc(db, "settings", "ai");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return { apiKey: '' };
  } catch (error) {
    console.error("Error getting AI settings: ", error);
    return { apiKey: '' };
  }
};

export const updateAiSettings = async (apiKey) => {
  try {
    const docRef = doc(db, "settings", "ai");
    await setDoc(docRef, { apiKey }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error updating AI settings: ", error);
    return false;
  }
};

export const evaluateWithGemini = async (question, studentAnswer, answerKey, apiKey) => {
  try {
    const prompt = `Anda adalah seorang guru matematik yang menyemak jawapan subjektif pelajar.
Soalan: ${question}
Skema Jawapan: ${answerKey}
Jawapan Pelajar: ${studentAnswer}

Bandingkan jawapan pelajar dengan skema. Fokus kepada pemahaman konsep dan jalan kerja, bukan sekadar format. Jika maknanya sama, anggap ia betul.
SANGAT PENTING: Sila abaikan ketiadaan unit mata wang seperti 'RM' atau simbol unit lain, dan abaikan jarak (spaces). Jika nilai angka jawapan pelajar sama dengan nilai angka skema jawapan, anda wajib menetapkan isCorrect kepada true dan memberi markah penuh.
Sila berikan maklum balas ringkas dalam bahasa Melayu dan nilai sama ada ia betul (isCorrect: true/false) dan markah (score: 0-10).
Sila balas HANYA dalam format JSON yang sah seperti ini (tiada teks lain):
{
  "isCorrect": true,
  "score": 10,
  "feedback": "Jawapan tepat dan jalan kerja jelas."
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1, responseMimeType: "application/json" }
      })
    });

    if (!response.ok) {
      throw new Error('API Error');
    }

    const data = await response.json();
    let textResult = data.candidates[0].content.parts[0].text;
    
    textResult = textResult.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(textResult);
  } catch (error) {
    console.error("Error evaluating with Gemini:", error);
    return null;
  }
};

// --- MANUAL REVIEWS ---
export const getPendingReviews = async () => {
  try {
    const q = query(collection(db, "performanceLogs"));
    const querySnapshot = await getDocs(q);
    const logs = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.needsManualReview) {
        logs.push({ id: doc.id, ...data });
      }
    });
    return logs.sort((a,b) => b.timestamp.localeCompare(a.timestamp));
  } catch (error) {
    console.error("Error getting pending reviews: ", error);
    return [];
  }
};

export const updateReviewStatus = async (logId, isCorrect, scoreOverride) => {
  try {
    const docRef = doc(db, "performanceLogs", logId);
    await updateDoc(docRef, { 
      needsManualReview: false, 
      isCorrect: isCorrect,
      aiScore: scoreOverride,
      reviewedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error("Error updating review status: ", error);
    return false;
  }
};
