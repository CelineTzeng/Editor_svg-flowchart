// 預設資料
let nodes = [
    { id: 1, shape: "terminator", text: "[請輸入文字]\n例:施工前準備", star: false, asterisk: false },
    { id: 2, shape: "decision", text: "[請輸入文字]\n例:材料進場", star: true, asterisk: true },
    { id: 3, shape: "decision", text: "[請輸入文字]\n例:模板組立", star: true, asterisk: false },
    { id: 4, shape: "process", text: "[請輸入文字]", star: false, asterisk: false },
    { id: 5, shape: "terminator", text: "完成", star: false, asterisk: false }
];

const sidebarNodeList = document.getElementById('node-list');
const svgCanvas = document.getElementById('flowchart-svg');

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
ctx.font = '16px "標楷體", "BiauKai", "DFKai-SB", serif';

function init() {
    document.getElementById('btn-add').addEventListener('click', addNode);
    document.getElementById('btn-png').addEventListener('click', exportPNG);

    // 建議 HTML 按鈕 id 改成 btn-svg
    // 若你目前 HTML 還是 btn-word，這段也可以暫時相容
    const svgButton = document.getElementById('btn-svg') || document.getElementById('btn-word');
    if (svgButton) {
        svgButton.addEventListener('click', exportSVG);
    }

    renderSidebar();
    renderCanvas();
}

function renderSidebar() {
    sidebarNodeList.innerHTML = '';

    nodes.forEach((node, index) => {
        const div = document.createElement('div');
        div.className = 'node-item';

        div.innerHTML = `
            <strong>步驟 ${index + 1}</strong>

            <select onchange="updateNode(${node.id}, 'shape', this.value)">
                <option value="process" ${node.shape === 'process' ? 'selected' : ''}>矩形 (處理程序)</option>
                <option value="terminator" ${node.shape === 'terminator' ? 'selected' : ''}>圓角矩形 (開始/結束)</option>
                <option value="decision" ${node.shape === 'decision' ? 'selected' : ''}>菱形 (判斷/檢查)</option>
                <option value="hexagon" ${node.shape === 'hexagon' ? 'selected' : ''}>六角形 (巡檢)</option>
            </select>

            <textarea rows="2" onchange="updateNode(${node.id}, 'text', this.value)">${node.text}</textarea>

            <div>
                <label>
                    <input type="checkbox" ${node.star ? 'checked' : ''} onchange="updateNode(${node.id}, 'star', this.checked)">
                    加上藍色 ★
                </label>
                <br>
                <label>
                    <input type="checkbox" ${node.asterisk ? 'checked' : ''} onchange="updateNode(${node.id}, 'asterisk', this.checked)">
                    加上紅色 ※
                </label>
            </div>

            <button class="delete-btn" onclick="deleteNode(${node.id})">刪除步驟</button>
        `;

        sidebarNodeList.appendChild(div);
    });
}

window.updateNode = (id, key, value) => {
    const node = nodes.find(n => n.id === id);

    if (node) {
        node[key] = value;
    }

    renderCanvas();
};

window.deleteNode = (id) => {
    nodes = nodes.filter(n => n.id !== id);
    renderSidebar();
    renderCanvas();
};

function addNode() {
    const newId = nodes.length > 0
        ? Math.max(...nodes.map(n => n.id)) + 1
        : 1;

    nodes.push({
        id: newId,
        shape: "process",
        text: "新步驟",
        star: false,
        asterisk: false
    });

    renderSidebar();
    renderCanvas();
}

function renderCanvas() {
    let svgHTML = '';

    const startX = 400;
    let currentY = 50;
    const arrowGap = 60;

    nodes.forEach((node, index) => {
        const lines = node.text.split('\n');

        let maxTextWidth = 0;

        lines.forEach(line => {
            const lineWidth = ctx.measureText(line).width;
            if (lineWidth > maxTextWidth) {
                maxTextWidth = lineWidth;
            }
        });

        let rectWidth = Math.max(160, maxTextWidth + 60);
        let rectHeight = Math.max(60, lines.length * 24 + 30);

        if (node.shape === 'decision') {
            rectWidth += 50;
            rectHeight += 30;
        } else if (node.shape === 'hexagon') {
            rectWidth += 30;
        }

        const leftX = startX - rectWidth / 2;

        // 箭頭與符號
        if (index > 0) {
            const arrowStartY = currentY - arrowGap;

            svgHTML += `
                <line 
                    x1="${startX}" 
                    y1="${arrowStartY}" 
                    x2="${startX}" 
                    y2="${currentY}" 
                    stroke="black" 
                    stroke-width="2" 
                />
                <polygon 
                    points="${startX - 5},${currentY - 10} ${startX + 5},${currentY - 10} ${startX},${currentY}" 
                    fill="black" 
                />
            `;

            let symbols = '';

            if (node.star) {
                symbols += `<tspan fill="blue">★</tspan>`;
            }

            if (node.asterisk) {
                symbols += `<tspan fill="red">※</tspan>`;
            }

            if (symbols) {
                svgHTML += `
                    <text 
                        x="${startX + 15}" 
                        y="${currentY - 20}" 
                        font-size="20" 
                        font-family="'標楷體', 'BiauKai', 'DFKai-SB', serif"
                    >
                        ${symbols}
                    </text>
                `;
            }
        }

        // 節點圖形
        if (node.shape === 'process') {
            svgHTML += `
                <rect 
                    x="${leftX}" 
                    y="${currentY}" 
                    width="${rectWidth}" 
                    height="${rectHeight}" 
                    fill="white" 
                    stroke="black" 
                    stroke-width="2" 
                />
            `;
        } else if (node.shape === 'terminator') {
            const radius = rectHeight / 2;

            svgHTML += `
                <rect 
                    x="${leftX}" 
                    y="${currentY}" 
                    width="${rectWidth}" 
                    height="${rectHeight}" 
                    rx="${radius}" 
                    ry="${radius}" 
                    fill="white" 
                    stroke="black" 
                    stroke-width="2" 
                />
            `;
        } else if (node.shape === 'decision') {
            svgHTML += `
                <polygon 
                    points="
                        ${startX},${currentY} 
                        ${startX + rectWidth / 2},${currentY + rectHeight / 2} 
                        ${startX},${currentY + rectHeight} 
                        ${startX - rectWidth / 2},${currentY + rectHeight / 2}
                    " 
                    fill="white" 
                    stroke="black" 
                    stroke-width="2" 
                />
            `;
        } else if (node.shape === 'hexagon') {
            const corner = 25;

            svgHTML += `
                <polygon 
                    points="
                        ${leftX + corner},${currentY} 
                        ${leftX + rectWidth - corner},${currentY} 
                        ${leftX + rectWidth},${currentY + rectHeight / 2} 
                        ${leftX + rectWidth - corner},${currentY + rectHeight} 
                        ${leftX + corner},${currentY + rectHeight} 
                        ${leftX},${currentY + rectHeight / 2}
                    " 
                    fill="white" 
                    stroke="black" 
                    stroke-width="2" 
                />
            `;
        }

        // 節點文字
        let textY = currentY + (rectHeight / 2) - ((lines.length - 1) * 12) + 6;

        let textHTML = `
            <text 
                x="${startX}" 
                y="${textY}" 
                text-anchor="middle" 
                font-size="16" 
                fill="black" 
                font-family="'標楷體', 'BiauKai', 'DFKai-SB', serif"
            >
        `;

        lines.forEach((line, i) => {
            textHTML += `<tspan x="${startX}" dy="${i === 0 ? 0 : 24}">${line}</tspan>`;
        });

        textHTML += `</text>`;

        svgHTML += textHTML;

        currentY += rectHeight + arrowGap;
    });

    const finalHeight = Math.max(currentY + 40, 800);

    svgCanvas.setAttribute('height', finalHeight);
    svgCanvas.setAttribute('viewBox', `0 0 1000 ${finalHeight}`);
    svgCanvas.style.height = finalHeight + 'px';
    svgCanvas.style.minHeight = finalHeight + 'px';

    svgCanvas.innerHTML = svgHTML;
}

function exportPNG() {
    const svgWidth = 1000;
    const svgHeight = parseInt(svgCanvas.getAttribute('height'));

    const svgString = new XMLSerializer().serializeToString(svgCanvas);
    const svgBlob = new Blob([svgString], {
        type: 'image/svg+xml;charset=utf-8'
    });

    const blobURL = URL.createObjectURL(svgBlob);

    const image = new Image();

    image.onload = function () {
        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = svgWidth;
        exportCanvas.height = svgHeight;

        const context = exportCanvas.getContext('2d');

        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, svgWidth, svgHeight);
        context.drawImage(image, 0, 0);

        const pngURL = exportCanvas.toDataURL('image/png');

        const link = document.createElement('a');
        link.href = pngURL;
        link.download = '公共工程流程圖.png';
        link.click();

        URL.revokeObjectURL(blobURL);
    };

    image.src = blobURL;
}

function exportSVG() {
    const svgHeight = parseInt(svgCanvas.getAttribute('height'));
    const innerSVG = svgCanvas.innerHTML;

    const completeSVG = `<?xml version="1.0" encoding="utf-8"?>
<svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="1000" 
    height="${svgHeight}" 
    viewBox="0 0 1000 ${svgHeight}"
>
    <rect width="100%" height="100%" fill="#ffffff" />
    ${innerSVG}
</svg>`;

    const blob = new Blob([completeSVG], {
        type: 'image/svg+xml;charset=utf-8'
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = '公共工程流程圖.svg';
    link.click();
}

init();