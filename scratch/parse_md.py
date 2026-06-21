import re
import json
import csv

with open('../input/Modul_Pemfaktoran_Tingkatan_2.md', 'r', encoding='utf-8') as f:
    text = f.read()

# Extract questions
# They look like: **Soalan 1**\n<content until next **Soalan or --- >
questions_raw = re.split(r'\*\*Soalan \d+\*\*', text)[1:]
questions_dict = {}

for i, q in enumerate(questions_raw):
    num = i + 1
    # split by --- or ## to get just the question text
    q_text = re.split(r'---|##', q)[0].strip()
    questions_dict[num] = {"soalan": q_text, "jawapan": ""}

# Extract answers
# They look like: ## Soalan 1 — <title>\n<content until next ## Soalan >
answers_raw = re.split(r'## Soalan \d+', text)[1:]
for i, a in enumerate(answers_raw):
    num = i + 1
    # split by --- to get just the answer
    a_text = a.split('---')[0].split('\n', 1)[1].strip() if '\n' in a else a.strip()
    if num in questions_dict:
        questions_dict[num]["jawapan"] = a_text

# Convert to final array
results = []
for k, v in questions_dict.items():
    results.append({
        "tahun": "Tingkatan 2",
        "topik": "Pemfaktoran Ungkapan Algebra",
        "jenisSoalan": "subjektif",
        "rajah": None,
        "soalan": v["soalan"],
        "jawapan": v["jawapan"],
        "mata": 10
    })

# We'll save it as a JSON file
with open('../src/data/pemfaktoran_tingkatan2.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print(f"Parsed {len(results)} questions.")
