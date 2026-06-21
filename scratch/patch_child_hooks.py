with open("src/pages/ChildDashboard.jsx", "r") as f:
    content = f.read()

# Remove the useEffect from below the early return
find_effect = """  useEffect(() => {
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
content = content.replace(find_effect, "")

# And we also need to move currentQ evaluation to the top OR we just use a useEffect that listens to currentQuestionIndex and selectedTopic.
# Actually, the best way is to move mathQuestions and currentQ above the early return!

find_vars = """  const uniqueTopics = [...new Set(questions.map(q => q.topik))];
  const mathQuestions = selectedTopic ? questions.filter(q => q.topik === selectedTopic) : [];
  const isCompleted = selectedTopic && currentQuestionIndex >= mathQuestions.length;
  const currentQ = mathQuestions[currentQuestionIndex];"""
content = content.replace(find_vars, "")

insert_at_top = """
  const uniqueTopics = [...new Set(questions.map(q => q.topik))];
  const mathQuestions = selectedTopic ? questions.filter(q => q.topik === selectedTopic) : [];
  const isCompleted = selectedTopic && currentQuestionIndex >= mathQuestions.length;
  const currentQ = mathQuestions[currentQuestionIndex];
  
  useEffect(() => {
    if (currentQ) {
      setUserAnswer('');
      setPadananKiriTerpilih(null);
      setPadananJawapan([]);
      setPelbagaiPilihanJawapan([]);
      setJadualJawapan({});
      if (currentQ.jenisSoalan === 'drag_drop') {
         const allWords = [...(currentQ.dragDropJawapan || []), ...(currentQ.dragDropEkstra || [])];
         allWords.sort(() => Math.random() - 0.5);
         setDragDropItems(allWords.map((w, i) => ({ id: i.toString(), word: w, placedAt: null })));
      }
    }
  }, [currentQ]);
"""

# Insert right before the early return
find_early_return = "  // Paparan Skrin Pemilihan Profil"
content = content.replace(find_early_return, insert_at_top + "\n" + find_early_return)

with open("src/pages/ChildDashboard.jsx", "w") as f:
    f.write(content)

