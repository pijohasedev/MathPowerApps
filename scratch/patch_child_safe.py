import re

with open("src/pages/ChildDashboard.jsx", "r") as f:
    content = f.read()

# Make array/string accesses safe
content = content.replace("currentQ.padanan.length", "(currentQ.padanan || []).length")
content = content.replace("currentQ.padanan.find", "(currentQ.padanan || []).find")
content = content.replace("currentQ.padanan.map", "(currentQ.padanan || []).map")
content = content.replace("currentQ.padanan[kananIdx]", "(currentQ.padanan || [])[kananIdx]")

content = content.replace("currentQ.jadualItems.every", "(currentQ.jadualItems || []).every")
content = content.replace("currentQ.jadualItems.map", "(currentQ.jadualItems || []).map")
content = content.replace("currentQ.jadualKategori.map", "(currentQ.jadualKategori || []).map")

content = content.replace("currentQ.soalan.match", "(currentQ.soalan || '').match")
content = content.replace("currentQ.soalan.split", "(currentQ.soalan || '').split")

content = content.replace("currentQ.pilihan[opt]", "(currentQ.pilihan || {})[opt]")

with open("src/pages/ChildDashboard.jsx", "w") as f:
    f.write(content)

