const state = { pawns: [], pawnWidth: 1.0, pawnHeight: 1.5 };
let styleClipboard = null; 
const STAT_KEYS = ["Init", "AC", "HP", "P.D.", "C.D.", "S.D.", "Inv.", "Foc"];

const pageEl = document.getElementById('page');
document.getElementById('file-input').addEventListener('change', handleFiles);

// Drag & Drop
window.addEventListener('dragover', e => { e.preventDefault(); document.body.style.opacity = '0.7'; });
window.addEventListener('dragleave', e => { e.preventDefault(); document.body.style.opacity = '1'; });
window.addEventListener('drop', e => {
    e.preventDefault(); document.body.style.opacity = '1';
    handleFiles({ target: { files: e.dataTransfer.files } });
});

// Global Paste Listener (Ctrl+V / Cmd+V)
window.addEventListener('paste', e => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    const files = [];
    for (let index in items) {
        const item = items[index];
        if (item.kind === 'file' && item.type.startsWith('image/')) {
            const file = item.getAsFile();
            files.push(file);
        }
    }
    if (files.length > 0) {
        handleFiles({ target: { files: files, id: 'paste-event' } });
    }
});

// Paste Button Logic
async function pasteFromClipboardButton() {
    try {
        if (!navigator.clipboard || !navigator.clipboard.read) {
            throw new Error("Clipboard API not supported or blocked.");
        }
        const clipboardItems = await navigator.clipboard.read();
        const files = [];
        for (const clipboardItem of clipboardItems) {
            for (const type of clipboardItem.types) {
                if (type.startsWith('image/')) {
                    const blob = await clipboardItem.getType(type);
                    const file = new File([blob], "pasted-image.png", { type: type });
                    files.push(file);
                }
            }
        }
        if (files.length > 0) {
            handleFiles({ target: { files: files, id: 'paste-btn' } });
        } else {
            alert("No image found on your clipboard.");
        }
    } catch (err) {
        alert("Browser blocked clipboard access. Please click anywhere on the page and press Ctrl+V (or Cmd+V) to paste!");
    }
}

async function handleFiles(e) {
    const files = e.target.files;
    if (!files) return;
    for (let file of files) {
        if (!file.type.startsWith('image/')) continue;
        
        const dataUrl = await new Promise(r => {
            const reader = new FileReader();
            reader.onload = ev => r(ev.target.result);
            reader.readAsDataURL(file);
        });

        const img = new Image();
        await new Promise(r => { img.onload = r; img.src = dataUrl; });

        const emptyStats = {};
        STAT_KEYS.forEach(key => emptyStats[key] = '');

        state.pawns.push({
            img: img, dataUrl: dataUrl, name: '', number: '', isEditing: false,
            isDark: calculateDarkness(img), isFlipped: false, showBorder: false, 
            borderColor: '#000000', textColor: '#000000', textBgColor: '#FFFFFFEE',
            scale: 1.0, rotation: 0, offsetX: 0, offsetY: 0,
            stats: emptyStats      
        });
    }
    if(e.target.id === 'file-input') e.target.value = ''; 
    renderAll();
}

function calculateDarkness(img) {
    try {
        const cvs = document.createElement('canvas');
        const ctx = cvs.getContext('2d', { willReadFrequently: true });
        cvs.width = img.width; cvs.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, cvs.width, cvs.height).data;
        let totalBrightness = 0, opaquePixels = 0;
        for (let i = 0; i < imageData.length; i += 4) {
            if (imageData[i + 3] > 50) { 
                totalBrightness += (0.299 * imageData[i] + 0.587 * imageData[i + 1] + 0.114 * imageData[i + 2]);
                opaquePixels++;
            }
        }
        if (opaquePixels === 0) return false;
        return (totalBrightness / opaquePixels) < 127.5;
    } catch (err) { return false; }
}

function removePawn(index) { state.pawns.splice(index, 1); renderAll(); }

// --- Smart Unique Incrementing Clone Logic ---
function duplicatePawn(index) {
    const original = state.pawns[index];
    let newNumber = original.number;

    if (newNumber && newNumber.trim() !== '' && !isNaN(newNumber)) {
        let targetNum = parseInt(newNumber, 10) + 1;
        
        while (state.pawns.some(p => 
            p.dataUrl === original.dataUrl && 
            p.name === original.name && 
            parseInt(p.number, 10) === targetNum
        )) {
            targetNum++;
        }
        newNumber = targetNum.toString();
    }

    const newStats = { ...original.stats };
    const copy = { ...original, number: newNumber, isEditing: false, stats: newStats }; 
    
    state.pawns.push(copy);
    renderAll();
}

function copyStyle(index) {
    const p = state.pawns[index];
    styleClipboard = {
        borderColor: p.borderColor, textColor: p.textColor, textBgColor: p.textBgColor,
        showBorder: p.showBorder, isDark: p.isDark, isFlipped: p.isFlipped,
        scale: p.scale, rotation: p.rotation, offsetX: p.offsetX, offsetY: p.offsetY
    };
    renderAll(); 
}

function pasteStyle(index) {
    if (!styleClipboard) return;
    Object.assign(state.pawns[index], styleClipboard);
    renderAll(); 
}

function toggleEdit(index) {
    state.pawns[index].isEditing = !state.pawns[index].isEditing;
    const settingsDiv = document.getElementById(`settings-${index}`);
    const editBtn = document.getElementById(`edit-btn-${index}`);
    if (state.pawns[index].isEditing) {
        settingsDiv.style.display = 'flex';
        editBtn.innerHTML = '▲ Hide Controls';
    } else {
        settingsDiv.style.display = 'none';
        editBtn.innerHTML = '▼ Edit Controls';
    }
}

function updatePawnValue(index, field, value) {
    state.pawns[index][field] = value;
    renderSinglePawn(index);
}

function updatePawnStat(index, key, value) {
    state.pawns[index].stats[key] = value;
    renderSinglePawn(index);
}

function updatePawnColor(index, field, value, includeAlpha=false) {
    if (includeAlpha) {
        let currentAlpha = state.pawns[index][field].slice(7) || 'EE';
        state.pawns[index][field] = value + currentAlpha;
    } else {
        state.pawns[index][field] = value;
    }
    renderSinglePawn(index);
}

function updatePawnTransform(index, field, value) {
    state.pawns[index][field] = parseFloat(value);
    renderSinglePawn(index);
}

function updateSize() {
    const size = document.getElementById('size-select').value;
    if (size === 'small') { state.pawnWidth = 0.75; state.pawnHeight = 1.0; }
    if (size === 'medium') { state.pawnWidth = 1.0; state.pawnHeight = 1.5; }
    if (size === 'large') { state.pawnWidth = 1.25; state.pawnHeight = 2.0; }
    renderAll();
}

// --- Core Load / Save Logic ---
function getExportFilename(extension) {
    if (state.pawns.length === 0) return `Pawns_Project${extension}`;
    
    let baseName = state.pawns[0].name.trim() || "Unnamed Pawn";
    const others = state.pawns.length - 1;
    
    if (others > 0) {
        baseName += ` (and ${others} other${others > 1 ? 's' : ''})`;
    }
    
    baseName = baseName.replace(/[<>:"/\\|?*]/g, '');
    return baseName + extension;
}

function saveProject() {
    if (state.pawns.length === 0) {
        alert("Please add at least one pawn before saving.");
        return;
    }
    const projectData = {
        pawnWidth: state.pawnWidth, pawnHeight: state.pawnHeight,
        pawns: state.pawns.map(p => ({
            dataUrl: p.dataUrl, name: p.name, number: p.number,
            borderColor: p.borderColor, textColor: p.textColor, textBgColor: p.textBgColor,
            isDark: p.isDark, isFlipped: p.isFlipped, showBorder: p.showBorder, 
            scale: p.scale, rotation: p.rotation, offsetX: p.offsetX, offsetY: p.offsetY,
            stats: p.stats
        }))
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projectData));
    const a = document.createElement('a'); a.href = dataStr; 
    a.download = getExportFilename('.json');
    document.body.appendChild(a); a.click(); a.remove();
}

async function loadProjectFromJSON(projectData) {
    state.pawnWidth = projectData.pawnWidth || 1.0; 
    state.pawnHeight = projectData.pawnHeight || 1.5;
    const select = document.getElementById('size-select');
    if (state.pawnWidth === 0.75) select.value = 'small';
    if (state.pawnWidth === 1.0) select.value = 'medium';
    if (state.pawnWidth === 1.25) select.value = 'large';

    state.pawns = [];
    for (let p of projectData.pawns) {
        const img = new Image(); 
        await new Promise(r => { img.onload = r; img.src = p.dataUrl; });
        
        const loadedStats = p.stats || {};
        const safeStats = {};
        STAT_KEYS.forEach(key => safeStats[key] = loadedStats[key] || '');

        state.pawns.push({
            img: img, dataUrl: p.dataUrl, name: p.name || '', number: p.number || '', isEditing: false,
            borderColor: p.borderColor || '#000000', textColor: p.textColor || '#000000', textBgColor: p.textBgColor || '#FFFFFFEE',
            isDark: p.isDark !== undefined ? p.isDark : calculateDarkness(img),
            isFlipped: p.isFlipped || false, showBorder: p.showBorder || false,
            scale: p.scale || 1.0, rotation: p.rotation || 0, offsetX: p.offsetX || 0, offsetY: p.offsetY || 0,
            stats: safeStats
        });
    }
    renderAll();
}

async function handleFileLoad(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const projectData = JSON.parse(event.target.result);
            await loadProjectFromJSON(projectData);
        } catch (error) { alert('Error loading project.'); }
    };
    reader.readAsText(file); e.target.value = ''; 
}

// --- Output Generation Handlers ---
function handlePrint() {
    if (state.pawns.length === 0) {
        alert("Please add at least one pawn before printing."); return;
    }
    const originalTitle = document.title;
    document.title = getExportFilename('');
    window.print();
    setTimeout(() => { document.title = originalTitle; }, 500);
}

function exportWord() {
    if (state.pawns.length === 0) {
        alert("Please add at least one pawn before exporting."); return;
    }
    let htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset="utf-8"><title>Pawns Export</title>
        <style>@page { margin: 0.5in; size: letter portrait; } body { margin: 0; padding: 0; font-family: Arial, sans-serif; } img { margin: 0 0.25in 0.25in 0; display: inline-block; }</style>
        </head><body>
    `;
    state.pawns.forEach((pawn, index) => {
        const container = document.getElementById(`canvas-container-${index}`);
        const canvas = container.querySelector('canvas');
        if (canvas) {
            const dataUrl = canvas.toDataURL('image/png');
            const wInches = parseFloat(canvas.style.width); 
            const hInches = parseFloat(canvas.style.height);
            const wPx = Math.round(wInches * 96);
            const hPx = Math.round(hInches * 96);
            htmlContent += `<img src="${dataUrl}" width="${wPx}" height="${hPx}" style="width:${wInches}in; height:${hInches}in;" />`;
        }
    });
    htmlContent += `</body></html>`;
    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = getExportFilename('.doc'); document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

function exportODT() {
    if (state.pawns.length === 0) {
        alert("Please add at least one pawn before exporting."); return;
    }
    let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
    <office:document xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0" xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0" xmlns:draw="urn:oasis:names:tc:opendocument:xmlns:drawing:1.0" xmlns:svg="urn:oasis:names:tc:opendocument:xmlns:svg-compatible:1.0" office:mimetype="application/vnd.oasis.opendocument.text">
      <office:body><office:text><text:p>`;
    state.pawns.forEach((pawn, index) => {
        const container = document.getElementById(`canvas-container-${index}`);
        const canvas = container.querySelector('canvas');
        if (canvas) {
            const dataUrl = canvas.toDataURL('image/png');
            const base64Data = dataUrl.split(',')[1]; 
            const wInches = canvas.style.width; const hInches = canvas.style.height;
            xmlContent += `<draw:frame svg:width="${wInches}" svg:height="${hInches}"><draw:image><office:binary-data>${base64Data}</office:binary-data></draw:image></draw:frame><text:s text:c="2"/>`; 
        }
    });
    xmlContent += `</text:p></office:text></office:body></office:document>`;
    const blob = new Blob([xmlContent], { type: 'application/vnd.oasis.opendocument.text' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = getExportFilename('.fodt'); 
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
}

function createSliderGroup(index, labelTxt, field, min, max, step, defaultValue) {
    const group = document.createElement('div'); group.className = 'slider-group';
    const label = document.createElement('label'); label.innerText = labelTxt;
    const slider = document.createElement('input'); slider.type = 'range';
    slider.min = min; slider.max = max; slider.step = step; slider.value = state.pawns[index][field];
    slider.oninput = (e) => updatePawnTransform(index, field, e.target.value);
    const resetBtn = document.createElement('button');
    resetBtn.className = 'reset-slider-btn'; resetBtn.innerHTML = '↺'; resetBtn.title = 'Reset Setting';
    resetBtn.onclick = () => { slider.value = defaultValue; updatePawnTransform(index, field, defaultValue); };
    group.appendChild(label); group.appendChild(slider); group.appendChild(resetBtn);
    return group;
}

function renderAll() {
    pageEl.innerHTML = '';
    state.pawns.forEach((pawn, index) => {
        const wrapper = document.createElement('div'); wrapper.className = 'pawn-wrapper'; wrapper.id = `pawn-wrapper-${index}`;
        
        const leftActions = document.createElement('div'); leftActions.className = 'action-group-left';
        const dupBtn = document.createElement('button'); dupBtn.className = 'circle-btn btn-dup'; dupBtn.innerHTML = '+';
        dupBtn.title = 'Duplicate Pawn'; dupBtn.onclick = () => duplicatePawn(index); leftActions.appendChild(dupBtn);
        const copyBtn = document.createElement('button'); copyBtn.className = 'circle-btn btn-copy'; copyBtn.innerHTML = 'C';
        copyBtn.title = 'Copy Style'; copyBtn.onclick = () => copyStyle(index); leftActions.appendChild(copyBtn);
        const pasteBtn = document.createElement('button'); pasteBtn.className = 'circle-btn btn-paste'; pasteBtn.innerHTML = 'P';
        pasteBtn.title = 'Paste Style'; pasteBtn.disabled = styleClipboard === null; pasteBtn.onclick = () => pasteStyle(index);
        leftActions.appendChild(pasteBtn);
        wrapper.appendChild(leftActions);

        const rightActions = document.createElement('div'); rightActions.className = 'action-group-right';
        const delBtn = document.createElement('button'); delBtn.className = 'circle-btn btn-del'; delBtn.innerHTML = '×';
        delBtn.title = 'Remove Pawn'; delBtn.onclick = () => removePawn(index); 
        rightActions.appendChild(delBtn); wrapper.appendChild(rightActions);

        const canvasContainer = document.createElement('div'); canvasContainer.id = `canvas-container-${index}`;
        wrapper.appendChild(canvasContainer);

        const editBtn = document.createElement('button'); editBtn.className = 'edit-toggle-btn'; editBtn.id = `edit-btn-${index}`;
        editBtn.innerHTML = pawn.isEditing ? '▲ Hide Controls' : '▼ Edit Controls';
        editBtn.onclick = () => toggleEdit(index); wrapper.appendChild(editBtn);

        const settingsDiv = document.createElement('div'); settingsDiv.className = 'pawn-settings';
        settingsDiv.id = `settings-${index}`; settingsDiv.style.display = pawn.isEditing ? 'flex' : 'none';

        const inputs = document.createElement('div'); inputs.className = 'pawn-inputs';
        const nameInput = document.createElement('input'); nameInput.type = 'text'; nameInput.className = 'input-name';
        nameInput.placeholder = 'Name...'; nameInput.value = pawn.name; nameInput.oninput = (e) => updatePawnValue(index, 'name', e.target.value);
        const numInput = document.createElement('input'); numInput.type = 'text'; numInput.className = 'input-number';
        numInput.placeholder = '#'; numInput.value = pawn.number; numInput.oninput = (e) => updatePawnValue(index, 'number', e.target.value);
        inputs.appendChild(nameInput); inputs.appendChild(numInput); settingsDiv.appendChild(inputs);

        const statsContainer = document.createElement('div'); statsContainer.className = 'pawn-stats-grid';
        STAT_KEYS.forEach(key => {
            const statWrapper = document.createElement('div');
            const statLabel = document.createElement('label'); statLabel.innerText = key;
            const statInput = document.createElement('input'); statInput.type = 'text';
            statInput.value = pawn.stats[key]; statInput.placeholder = '-';
            statInput.oninput = (e) => updatePawnStat(index, key, e.target.value);
            statWrapper.appendChild(statLabel); statWrapper.appendChild(statInput);
            statsContainer.appendChild(statWrapper);
        });
        settingsDiv.appendChild(statsContainer);

        const optionsRow = document.createElement('div'); optionsRow.className = 'pawn-options';
        const borderHexLabel = document.createElement('label');
        const borderHexInput = document.createElement('input'); borderHexInput.type = 'color'; borderHexInput.className = 'input-color';
        borderHexInput.value = pawn.borderColor; borderHexInput.title = "Color for Border, 'X', and Outline"; 
        borderHexInput.oninput = (e) => updatePawnColor(index, 'borderColor', e.target.value);
        borderHexLabel.appendChild(borderHexInput); borderHexLabel.appendChild(document.createTextNode('Border/X'));

        const textHexLabel = document.createElement('label');
        const textHexInput = document.createElement('input'); textHexInput.type = 'color'; textHexInput.className = 'input-color';
        textHexInput.value = pawn.textColor; textHexInput.title = "Color for Name & Number text"; 
        textHexInput.oninput = (e) => updatePawnColor(index, 'textColor', e.target.value);
        textHexLabel.appendChild(textHexInput); textHexLabel.appendChild(document.createTextNode('Text'));

        const textBgHexLabel = document.createElement('label');
        const textBgHexInput = document.createElement('input'); textBgHexInput.type = 'color'; textBgHexInput.className = 'input-color';
        textBgHexInput.value = pawn.textBgColor.slice(0,7); textBgHexInput.title = "Color for bar behind text"; 
        textBgHexInput.oninput = (e) => updatePawnColor(index, 'textBgColor', e.target.value, true); 
        textBgHexLabel.appendChild(textBgHexInput); textBgHexLabel.appendChild(document.createTextNode('T-Bg'));

        optionsRow.appendChild(borderHexLabel); optionsRow.appendChild(textHexLabel); optionsRow.appendChild(textBgHexLabel);
        settingsDiv.appendChild(optionsRow);

        const checksRow = document.createElement('div'); checksRow.className = 'pawn-options'; checksRow.style.paddingTop = '0';
        const borderLabel = document.createElement('label');
        const borderCheckbox = document.createElement('input'); borderCheckbox.type = 'checkbox';
        borderCheckbox.checked = pawn.showBorder; borderCheckbox.onchange = (e) => updatePawnValue(index, 'showBorder', e.target.checked);
        borderLabel.appendChild(borderCheckbox); borderLabel.appendChild(document.createTextNode("Draw Border"));

        const darkLabel = document.createElement('label');
        const darkCheckbox = document.createElement('input'); darkCheckbox.type = 'checkbox';
        darkCheckbox.checked = pawn.isDark; darkCheckbox.onchange = (e) => updatePawnValue(index, 'isDark', e.target.checked);
        darkLabel.appendChild(darkCheckbox); darkLabel.appendChild(document.createTextNode("'X' Back"));

        const flipLabel = document.createElement('label');
        const flipCheckbox = document.createElement('input'); flipCheckbox.type = 'checkbox';
        flipCheckbox.checked = pawn.isFlipped; flipCheckbox.onchange = (e) => updatePawnValue(index, 'isFlipped', e.target.checked);
        flipLabel.appendChild(flipCheckbox); flipLabel.appendChild(document.createTextNode("Flip Image"));
        
        checksRow.appendChild(borderLabel); checksRow.appendChild(darkLabel); checksRow.appendChild(flipLabel);
        settingsDiv.appendChild(checksRow);

        const controls = document.createElement('div'); controls.className = 'pawn-controls';
        controls.appendChild(createSliderGroup(index, 'Size', 'scale', 0.2, 3.0, 0.05, 1.0));
        controls.appendChild(createSliderGroup(index, 'Rotate', 'rotation', -180, 180, 1, 0));
        controls.appendChild(createSliderGroup(index, 'X-Pos', 'offsetX', -300, 300, 2, 0));
        controls.appendChild(createSliderGroup(index, 'Y-Pos', 'offsetY', -300, 300, 2, 0));
        settingsDiv.appendChild(controls);

        wrapper.appendChild(settingsDiv);
        pageEl.appendChild(wrapper);
        renderSinglePawn(index);
    });
}

function renderSinglePawn(index) {
    const pawn = state.pawns[index];
    const container = document.getElementById(`canvas-container-${index}`);
    if (!container) return;
    container.innerHTML = ''; container.appendChild(drawPawnCanvas(pawn));
}

function drawPawnCanvas(pawn) {
    const canvas = document.createElement('canvas');
    const printDPI = 300; const tabWidthInches = 0.25; const panels = 3;
    const internalTabWidth = tabWidthInches * printDPI; const internalPanelWidth = state.pawnWidth * printDPI;
    const internalWidth = (internalPanelWidth * panels) + internalTabWidth; const internalHeight = state.pawnHeight * printDPI;

    canvas.width = internalWidth; canvas.height = internalHeight;
    canvas.style.width = (state.pawnWidth * panels + tabWidthInches) + "in"; canvas.style.height = state.pawnHeight + "in";

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'white'; ctx.fillRect(0, 0, internalWidth, internalHeight);
    ctx.strokeStyle = '#888'; ctx.lineWidth = 2; ctx.setLineDash([15, 15]);

    const textHeight = 45; const textPaddingBottom = 15;
    const hasText = pawn.name.trim() !== '' || pawn.number.trim() !== '';
    const reservedBottom = hasText ? textHeight + textPaddingBottom : 0; 

    for (let i = 0; i < panels; i++) {
        let xBase = i * internalPanelWidth;
        ctx.save();
        
        const margin = internalHeight * 0.05;
        const availableHeight = internalHeight - margin - reservedBottom;

        const autoScale = Math.min(internalPanelWidth / pawn.img.width, availableHeight / pawn.img.height) * 0.95; 
        const finalScale = autoScale * pawn.scale;
        const w = pawn.img.width * finalScale; const h = pawn.img.height * finalScale;
        const shiftX = pawn.offsetX * (printDPI / 100); const shiftY = pawn.offsetY * (printDPI / 100);
        
        const xCenter = xBase + (internalPanelWidth / 2);
        const yCenter = internalHeight - (h / 2) - (margin / 2) - reservedBottom + shiftY;

        ctx.beginPath(); ctx.rect(xBase, 0, internalPanelWidth, internalHeight); ctx.clip();

        let shouldFlip = (i === 1) ? !pawn.isFlipped : pawn.isFlipped;

        if (i === 2 && pawn.isDark) {
            ctx.strokeStyle = pawn.borderColor; ctx.lineWidth = 6; ctx.setLineDash([]);
            const p = 30; ctx.beginPath();
            ctx.moveTo(xBase + p, p); ctx.lineTo(xBase + internalPanelWidth - p, internalHeight - p);
            ctx.moveTo(xBase + internalPanelWidth - p, p); ctx.lineTo(xBase + p, internalHeight - p);
            ctx.stroke();
        } else {
            ctx.save();
            ctx.translate(xCenter, yCenter);
            if (shouldFlip) ctx.scale(-1, 1);
            ctx.translate(shiftX, 0);
            ctx.rotate((pawn.rotation * Math.PI) / 180);
            if (i === 2) ctx.filter = 'brightness(0)'; 
            
            ctx.drawImage(pawn.img, -w/2, -h/2, w, h);
            ctx.restore();
        }
        ctx.restore(); 

        if (i === 2) {
            const activeStats = STAT_KEYS.filter(key => pawn.stats[key] && pawn.stats[key].trim() !== '');
            if (activeStats.length > 0) {
                ctx.save();
                const boxW = internalPanelWidth * 0.42; 
                const boxH = Math.floor(internalPanelWidth * 0.15); 
                const pad = Math.floor(internalPanelWidth * 0.03);
                const labelFont = Math.floor(internalPanelWidth * 0.065);
                const valFont = Math.floor(internalPanelWidth * 0.08);

                const startY = internalHeight * 0.08; 
                const startX = xBase + (internalPanelWidth - (2 * boxW + pad)) / 2;

                activeStats.forEach((key, idx) => {
                    const col = idx % 2; const row = Math.floor(idx / 2);
                    const x = startX + col * (boxW + pad); const y = startY + row * (boxH + pad);

                    ctx.fillStyle = pawn.textBgColor; ctx.fillRect(x, y, boxW, boxH);
                    ctx.strokeStyle = pawn.borderColor; ctx.lineWidth = 3; ctx.setLineDash([]); ctx.strokeRect(x, y, boxW, boxH);

                    ctx.fillStyle = pawn.textColor; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
                    ctx.font = `bold ${labelFont}px sans-serif`; ctx.fillText(key, x + 8, y + boxH/2);

                    ctx.textAlign = 'right'; ctx.font = `bold ${valFont}px sans-serif`;
                    ctx.fillText(pawn.stats[key], x + boxW - 8, y + boxH/2);
                });
                ctx.restore();
            }
        }

        if (pawn.showBorder) {
            ctx.save();
            ctx.strokeStyle = pawn.borderColor; ctx.lineWidth = 12; ctx.setLineDash([]);
            ctx.strokeRect(xBase + 6, 6, internalPanelWidth - 12, internalHeight - 12);
            ctx.restore();
        }

        drawText(ctx, pawn, xBase, internalPanelWidth, internalHeight, reservedBottom, textPaddingBottom);

        if (i < panels - 1) {
            ctx.setLineDash([15, 15]); ctx.strokeStyle = '#888'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(xBase + internalPanelWidth, 0); ctx.lineTo(xBase + internalPanelWidth, internalHeight); ctx.stroke();
        }
    }

    let xTab = panels * internalPanelWidth;
    ctx.setLineDash([]); ctx.strokeStyle = pawn.borderColor; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(xTab, 0); ctx.lineTo(xTab, internalHeight); ctx.stroke();
    ctx.fillStyle = '#e8e8e8'; ctx.fillRect(xTab, 0, internalTabWidth, internalHeight);
    
    ctx.save();
    ctx.fillStyle = pawn.borderColor; ctx.translate(xTab + internalTabWidth/2, internalHeight/2);
    ctx.rotate(-Math.PI/2); ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.font = "bold 28px sans-serif"; ctx.fillText("GLUE", 0, 0);
    ctx.restore();

    ctx.strokeStyle = pawn.borderColor; ctx.lineWidth = 4; ctx.strokeRect(0, 0, internalWidth, internalHeight);
    return canvas;
}

function drawText(ctx, pawn, xBase, panelWidth, panelHeight, reservedBottom, paddingBottom) {
    let displayText = pawn.name;
    if (pawn.number) { displayText += displayText ? ` #${pawn.number}` : `#${pawn.number}`; }
    if (!displayText) return;

    const x = xBase + panelWidth / 2;
    const y = panelHeight - paddingBottom;
    const barHeight = reservedBottom;

    if (pawn.textBgColor) {
        ctx.save();
        ctx.fillStyle = pawn.textBgColor; 
        ctx.fillRect(xBase, panelHeight - barHeight, panelWidth, barHeight);
        ctx.restore();
    }

    ctx.save();
    ctx.textAlign = "center"; ctx.textBaseline = "bottom"; ctx.font = "bold 32px sans-serif";
    ctx.lineWidth = 6; ctx.strokeStyle = 'white'; ctx.strokeText(displayText, x, y);
    ctx.fillStyle = pawn.textColor; ctx.fillText(displayText, x, y);
    ctx.restore();
}

// --- Initialization via External JSON ---
window.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('default-pawns.json');
        if (response.ok) {
            const initData = await response.json();
            await loadProjectFromJSON(initData);
        } else {
            console.log("No default-pawns.json found, starting with an empty workspace.");
        }
    } catch(e) {
        console.error("Failed to load default-pawns.json. Note: This feature requires a local web server (http://) and won't work on file:/// paths.", e);
    }
});
