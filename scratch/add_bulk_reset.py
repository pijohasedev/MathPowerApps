with open("src/pages/ParentDashboard.jsx", "r") as f:
    content = f.read()

func_to_find = """  const handleBulkDelete = async () => {
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
        alert('Gagal memadam soalan secara pukal.');
      }
    }
  };"""

func_to_replace = """  const handleBulkDelete = async () => {
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
        alert('Gagal memadam soalan secara pukal.');
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
  };"""

content = content.replace(func_to_find, func_to_replace)

jsx_to_find = """              <div className="flex gap-2 w-full md:w-auto items-center">
                {selectedQuestions.length > 0 && (
                  <button className="btn btn-danger py-2 px-3 text-sm flex items-center shadow-sm" style={{ backgroundColor: 'var(--danger)', color: 'white' }} onClick={handleBulkDelete}>
                    <Trash2 size={16} className="mr-1" /> Padam ({selectedQuestions.length})
                  </button>
                )}"""

jsx_to_replace = """              <div className="flex gap-2 w-full md:w-auto items-center">
                {selectedQuestions.length > 0 && (
                  <>
                    <button className="btn btn-danger py-2 px-3 text-sm flex items-center shadow-sm" style={{ backgroundColor: 'var(--danger)', color: 'white' }} onClick={handleBulkDelete}>
                      <Trash2 size={16} className="mr-1" /> Padam ({selectedQuestions.length})
                    </button>
                    <button className="btn btn-warning py-2 px-3 text-sm flex items-center shadow-sm" style={{ backgroundColor: '#f59e0b', color: 'white' }} onClick={handleBulkReset}>
                      <RotateCcw size={16} className="mr-1" /> Reset ({selectedQuestions.length})
                    </button>
                  </>
                )}"""

content = content.replace(jsx_to_find, jsx_to_replace)

with open("src/pages/ParentDashboard.jsx", "w") as f:
    f.write(content)

