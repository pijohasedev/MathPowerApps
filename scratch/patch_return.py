import re

with open("src/pages/ChildDashboard.jsx", "r") as f:
    content = f.read()

insert_func = """  const handleReturnToTopics = () => {
    setSelectedTopic(null);
    setCurrentQuestionIndex(0);
    if (currentChild) {
      const answered = currentChild.answeredQuestions || [];
      const filteredQuestions = allQuestions.filter(q => 
        q.tahun === currentChild.tahunTingkatan && !answered.includes(q.id)
      );
      setQuestions(filteredQuestions);
    }
  };

  const handleSelectProfile = (profile) => {"""

content = content.replace("  const handleSelectProfile = (profile) => {", insert_func)

# Replace instances
# 1. Sidebar math tab
find1 = "onClick={() => {setActiveTab('math'); setSelectedTopic(null);}}"
replace1 = "onClick={() => {setActiveTab('math'); handleReturnToTopics();}}"
content = content.replace(find1, replace1)

# 2. Kembali button
find2 = "onClick={() => { setSelectedTopic(null); setShowSymbols(false); }}"
replace2 = "onClick={() => { handleReturnToTopics(); setShowSymbols(false); }}"
content = content.replace(find2, replace2)

# 3. Pilih Topik Lain button
find3 = "onClick={() => setSelectedTopic(null)}>Pilih Topik Lain"
replace3 = "onClick={handleReturnToTopics}>Pilih Topik Lain"
content = content.replace(find3, replace3)

with open("src/pages/ChildDashboard.jsx", "w") as f:
    f.write(content)

