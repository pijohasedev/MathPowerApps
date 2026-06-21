import re

with open("src/pages/ParentDashboard.jsx", "r") as f:
    content = f.read()

# 1. Add states
state_addition = """  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [padanan, setPadanan] = useState([{ id: Date.now(), kiri: '', kanan: '' }]);
  const [pelbagaiPilihanJawapan, setPelbagaiPilihanJawapan] = useState([]);
  const [dragDropJawapan, setDragDropJawapan] = useState('');
  const [dragDropEkstra, setDragDropEkstra] = useState('');
  const [jadualKategori, setJadualKategori] = useState('Integer, Bukan Integer');
  const [jadualItems, setJadualItems] = useState([{ id: Date.now(), item: '', kategori: '' }]);"""
content = content.replace("  const [editingQuestionId, setEditingQuestionId] = useState(null);", state_addition)

# 2. resetQuestionForm
reset_replace = """    setPilihanC(''); setPilihanD(''); setMata(10); setEditingQuestionId(null);
    setPadanan([{ id: Date.now(), kiri: '', kanan: '' }]);
    setPelbagaiPilihanJawapan([]);
    setDragDropJawapan(''); setDragDropEkstra('');
    setJadualKategori('Integer, Bukan Integer');
    setJadualItems([{ id: Date.now(), item: '', kategori: '' }]);"""
content = content.replace("    setPilihanC(''); setPilihanD(''); setMata(10); setEditingQuestionId(null);", reset_replace)

# 3. handleSimpanSoalan validation and data
simpan_start = "    if (jenisSoalan === 'objektif' && (!pilihanA || !pilihanB || !pilihanC || !pilihanD)) {"
simpan_validation = """    if (jenisSoalan === 'objektif' && (!pilihanA || !pilihanB || !pilihanC || !pilihanD)) {
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
    }"""
content = re.sub(r"    if \(jenisSoalan === 'objektif'.*?return;\n    \}", simpan_validation, content, flags=re.DOTALL)

# Modify questionData object
qdata_find = """      const questionData = {
        tahun, topik, jenisSoalan, rajah, soalan, jawapan,
        pilihan: jenisSoalan === 'objektif' ? { A: pilihanA, B: pilihanB, C: pilihanC, D: pilihanD } : null,
        mata: parseInt(mata, 10)
      };"""
qdata_replace = """      const questionData = {
        tahun, topik, jenisSoalan, rajah, soalan, jawapan,
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
      }"""
content = content.replace(qdata_find, qdata_replace)

# 4. handleEditQuestion
edit_find = """    if (q.pilihan) {
      setPilihanA(q.pilihan.A || ''); setPilihanB(q.pilihan.B || ''); 
      setPilihanC(q.pilihan.C || ''); setPilihanD(q.pilihan.D || '');
    } else {
      setPilihanA(''); setPilihanB(''); setPilihanC(''); setPilihanD('');
    }"""
edit_replace = """    if (q.pilihan) {
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
    setJadualItems(q.jadualItems || [{ id: Date.now(), item: '', kategori: '' }]);"""
content = content.replace(edit_find, edit_replace)

# 5. UI Options
select_find = """                      <option value="subjektif">Subjektif (Isi tempat kosong / Tulis jawapan)</option>
                      <option value="objektif">Objektif (Pilihan A, B, C, D)</option>"""
select_replace = """                      <option value="subjektif">Subjektif (Isi tempat kosong / Tulis jawapan)</option>
                      <option value="objektif">Objektif (Satu Jawapan)</option>
                      <option value="pelbagai_pilihan">Pelbagai Pilihan (Lebih 1 Jawapan)</option>
                      <option value="padankan">Padankan (Kiri & Kanan)</option>
                      <option value="drag_drop">Drag & Drop (Tarik kata ke tempat kosong)</option>
                      <option value="jadual">Jadual / Kategorikan</option>"""
content = content.replace(select_find, select_replace)


# 6. Form UI
jawapan_betul_find = """                <div className="input-group mb-0">
                  <label className="input-label">Jawapan Betul</label>
                  {jenisSoalan === 'objektif' ? ("""
jawapan_betul_replace = """                <div className="input-group mb-0">
                  <label className="input-label">Jawapan Betul (Untuk Subjektif/Objektif)</label>
                  {jenisSoalan === 'objektif' ? ("""
content = content.replace(jawapan_betul_find, jawapan_betul_replace)

objektif_ui_find = """                {jenisSoalan === 'objektif' && (
                  <div className="p-4 bg-indigo-50/50 rounded-lg border border-indigo-100 mb-4">
                    <p className="text-sm font-bold mb-3 text-indigo-900">Pilihan Jawapan:</p>"""
                    
ui_addition = """                {(jenisSoalan === 'objektif' || jenisSoalan === 'pelbagai_pilihan') && (
                  <div className="p-4 bg-indigo-50/50 rounded-lg border border-indigo-100 mb-4">
                    <p className="text-sm font-bold mb-3 text-indigo-900">Pilihan Jawapan:</p>
                    {jenisSoalan === 'pelbagai_pilihan' && <p className="text-xs text-indigo-700 mb-2">Tandakan kotak pada jawapan yang betul di ruangan Jawapan Betul di bawah.</p>}"""
content = content.replace(objektif_ui_find, ui_addition)

jawapan_objektif_find = """                  {jenisSoalan === 'objektif' ? (
                    <select className="input-field" value={jawapan} onChange={(e) => setJawapan(e.target.value)}>
                      <option value="">-- Pilih Jawapan Betul --</option>
                      <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
                    </select>
                  ) : ("""
jawapan_objektif_replace = """                  {jenisSoalan === 'objektif' ? (
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
                        <div key={p.id} className="flex gap-2">
                          <input type="text" className="input-field flex-1 mb-0" placeholder="Kiri..." value={p.kiri} onChange={e => {
                            const newP = [...padanan]; newP[idx].kiri = e.target.value; setPadanan(newP);
                          }}/>
                          <input type="text" className="input-field flex-1 mb-0" placeholder="Kanan..." value={p.kanan} onChange={e => {
                            const newP = [...padanan]; newP[idx].kanan = e.target.value; setPadanan(newP);
                          }}/>
                          <button className="btn btn-outline text-red-500" onClick={() => setPadanan(padanan.filter(x => x.id !== p.id))}>X</button>
                        </div>
                      ))}
                      <button className="btn btn-secondary mt-2 text-sm" onClick={() => setPadanan([...padanan, {id: Date.now(), kiri: '', kanan: ''}])}>+ Tambah Pasangan</button>
                    </div>
                  ) : jenisSoalan === 'drag_drop' ? (
                    <div className="flex flex-col gap-2 bg-blue-50 p-4 border border-blue-200 rounded">
                      <p className="text-sm text-blue-800">Nota: Tulis [kosong] di dalam Teks Soalan di atas untuk mewakili tempat kosong.</p>
                      <input type="text" className="input-field mb-2" placeholder="Jawapan (pisahkan dengan koma)" value={dragDropJawapan} onChange={e => setDragDropJawapan(e.target.value)}/>
                      <input type="text" className="input-field mb-0" placeholder="Jawapan Ekstra Mengelirukan (pisahkan dengan koma)" value={dragDropEkstra} onChange={e => setDragDropEkstra(e.target.value)}/>
                    </div>
                  ) : jenisSoalan === 'jadual' ? (
                    <div className="flex flex-col gap-2 bg-green-50 p-4 border border-green-200 rounded">
                      <label className="text-sm font-bold">Kategori Tersedia (pisahkan dengan koma)</label>
                      <input type="text" className="input-field mb-4" placeholder="Contoh: Integer, Bukan Integer" value={jadualKategori} onChange={e => setJadualKategori(e.target.value)}/>
                      
                      <label className="text-sm font-bold">Item Jadual</label>
                      {jadualItems.map((item, idx) => (
                        <div key={item.id} className="flex gap-2">
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
                      ))}
                      <button className="btn btn-secondary mt-2 text-sm" onClick={() => setJadualItems([...jadualItems, {id: Date.now(), item: '', kategori: ''}])}>+ Tambah Item Jadual</button>
                    </div>
                  ) : ("""
content = content.replace(jawapan_objektif_find, jawapan_objektif_replace)

with open("src/pages/ParentDashboard.jsx", "w") as f:
    f.write(content)

