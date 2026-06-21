with open("src/index.css", "a") as f:
    f.write("""
/* ---- Label Rajah ---- */
.label-rajah-container {
  position: relative;
  display: inline-block;
  max-width: 100%;
}

.label-rajah-img {
  max-width: 100%;
  max-height: 400px;
  border-radius: var(--radius-md);
  box-shadow: var(--card-shadow);
  display: block;
}

.label-rajah-hotspot {
  position: absolute;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
  background-color: var(--primary-color);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.3);
  transition: all 0.2s;
  z-index: 10;
}

.label-rajah-hotspot:hover {
  transform: translate(-50%, -50%) scale(1.2);
}

.label-rajah-hotspot.selected {
  background-color: var(--warning);
  box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.3);
}

.label-rajah-dropzone {
  position: absolute;
  transform: translate(-50%, -50%);
  min-width: 100px;
  height: 40px;
  background-color: rgba(255, 255, 255, 0.9);
  border: 2px dashed var(--primary-color);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  color: var(--primary-color);
  box-shadow: var(--card-shadow);
  padding: 0 8px;
  z-index: 5;
  transition: all 0.2s;
}

.label-rajah-dropzone.filled {
  background-color: white;
  border-style: solid;
  border-color: var(--success);
  color: var(--success);
}
""")
