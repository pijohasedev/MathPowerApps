css_append = """
/* ---- Custom UI for New Question Types ---- */

/* Padankan (Matching) */
.padanan-container {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1.5rem;
  width: 100%;
}
@media (min-width: 768px) {
  .padanan-container {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 4rem;
  }
}

.padanan-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100px;
  border: 3px solid #cbd5e1;
  border-radius: var(--radius-lg);
  background: white;
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--text-main);
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  margin-bottom: 1rem;
}

.padanan-box:hover:not(:disabled) {
  transform: translateY(-4px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.padanan-box-kiri:hover:not(:disabled) {
  border-color: var(--primary-color);
  color: var(--primary-color);
}

.padanan-box-kanan:hover:not(:disabled) {
  border-color: var(--secondary-color);
  color: var(--secondary-color);
}

.padanan-box.selected {
  background: #eef2ff;
  border-color: var(--primary-color);
  color: var(--primary-color);
  transform: scale(1.02);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
}

.padanan-box.answered {
  background: #ecfdf5;
  border-color: var(--success);
  opacity: 0.6;
  cursor: not-allowed;
  transform: scale(0.98);
}

.padanan-indicator {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  z-index: 10;
}

.padanan-indicator-kiri {
  right: -0.75rem;
  background: var(--primary-color);
  animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.padanan-indicator-kanan {
  left: -0.75rem;
  background: #fbcfe8;
  animation: bounce-horizontal 1s infinite;
}

.padanan-done-badge {
  position: absolute;
  bottom: 0.25rem;
  background: rgba(255, 255, 255, 0.9);
  padding: 0.1rem 0.5rem;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  color: var(--success);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 800;
}

@keyframes pulse-ring {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}

@keyframes bounce-horizontal {
  0%, 100% { transform: translate(0, -50%); }
  50% { transform: translate(-25%, -50%); }
}

.padanan-title {
  text-align: center;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 0.5rem;
}

/* Pelbagai Pilihan (Multiple Select) */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid #cbd5e1;
  border-radius: var(--radius-md);
  background: white;
  cursor: pointer;
  transition: all var(--transition-fast);
  margin-bottom: 1rem;
}

.checkbox-label:hover {
  background: #f8fafc;
}

.checkbox-label.checked {
  background: #eef2ff;
  border-color: var(--primary-color);
}

.checkbox-input {
  width: 1.5rem;
  height: 1.5rem;
  accent-color: var(--primary-color);
  cursor: pointer;
}

/* Drag & Drop */
.drag-drop-text-container {
  background: white;
  padding: 2rem;
  border-radius: var(--radius-lg);
  border: 2px solid #e0e7ff;
  font-size: 1.25rem;
  line-height: 2.5;
  color: var(--text-main);
  box-shadow: var(--card-shadow);
  margin-bottom: 2rem;
}

.drop-zone {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
  height: 3rem;
  margin: 0 0.5rem;
  vertical-align: middle;
  border: 2px dashed var(--primary-color);
  background: #eef2ff;
  border-radius: var(--radius-sm);
  color: var(--primary-color);
  font-weight: 700;
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
}

.drag-options-container {
  background: rgba(99, 102, 241, 0.05);
  padding: 1.5rem;
  border-radius: var(--radius-md);
  border: 1px solid #e0e7ff;
  min-height: 120px;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  justify-content: center;
}

.drag-item {
  background: white;
  border: 2px solid #a5b4fc;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 700;
  color: var(--text-main);
  cursor: grab;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  transition: all var(--transition-fast);
}

.drag-item:hover {
  box-shadow: 0 6px 12px rgba(0,0,0,0.1);
  transform: translateY(-2px);
  border-color: var(--primary-color);
}

.drag-item:active {
  cursor: grabbing;
}

/* Jadual */
.jadual-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--card-shadow);
  border: 1px solid #e2e8f0;
}

.jadual-th {
  background: #eef2ff;
  padding: 1rem;
  font-weight: 700;
  color: var(--primary-color);
  border-bottom: 2px solid #c7d2fe;
}

.jadual-td {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  border-right: 1px solid #f1f5f9;
}

.jadual-btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  border: 2px solid #e2e8f0;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--text-muted);
  background: white;
  transition: all var(--transition-fast);
  cursor: pointer;
  margin: 0.25rem;
}

.jadual-btn:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.jadual-btn.selected {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  transform: scale(1.02);
  box-shadow: 0 4px 6px rgba(99, 102, 241, 0.2);
}
"""

with open("src/index.css", "a") as f:
    f.write("\n" + css_append)

