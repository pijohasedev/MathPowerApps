with open("src/pages/ParentDashboard.jsx", "r") as f:
    content = f.read()

# Fix jawapan requirement
find_val = "    if (!tahun || !topik || !soalan || !jawapan || !mata) {"
replace_val = """    const requiresJawapan = ['subjektif', 'objektif'].includes(jenisSoalan);
    if (!tahun || !topik || !soalan || !mata || (requiresJawapan && !jawapan)) {"""

content = content.replace(find_val, replace_val)

with open("src/pages/ParentDashboard.jsx", "w") as f:
    f.write(content)

