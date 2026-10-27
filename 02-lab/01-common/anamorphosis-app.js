// ---- 아나모르포시스(원통 거울) 도구 UI 로직 ----
(function () {
    const M = window.AnamorphMath;
    const COLS = M.COLS, ROWS = M.ROWS;

    const CELL = 46;
    const DRAW_W = COLS * CELL, DRAW_H = ROWS * CELL;

    const FAN_PX_PER_UNIT = 72;
    // 거울은 "위에서 내려다본" 원(= 부채꼴 수식이 가정하는 원통의 단면)으로
    // 그린다. 이 원의 중심·반지름이 부채꼴의 원점(FAN_ORIGIN)·안쪽 가장자리
    // (R_CYL)와 정확히 같은 값을 쓰므로, 거울의 둘레가 항상 부채꼴의 안쪽 호와
    // 한 치의 어긋남 없이 맞닿는다 — 비스듬한 3D 느낌의 원기둥 그림 대신, 수식과
    // 완전히 같은 좌표를 쓰는 원을 그려서 "거울 위치가 호를 따라 놓이는" 것을
    // 구조적으로 보장한다.
    const CYL_RADIUS_PX = M.R_CYL * FAN_PX_PER_UNIT; // 부채꼴 안쪽 가장자리와 동일

    const FAN_W = 720;
    const ORIGIN_Y = CYL_RADIUS_PX + 24; // 거울 원이 캔버스 위쪽에 다 들어갈 여백
    const rhoMaxPx = M.R_CYL * M.RHO_MAX_FACTOR * FAN_PX_PER_UNIT;
    const FAN_H = Math.ceil(ORIGIN_Y + rhoMaxPx * 1.06 + 30);
    const FAN_ORIGIN = { x: FAN_W / 2, y: ORIGIN_Y };

    // "빛의 경로" 탭에서 눈(관찰자)의 위치. 부채꼴 바깥, 화면 아래쪽에 고정해 둔다.
    const EYE_POS = { x: FAN_ORIGIN.x + 150, y: FAN_H - 36 };

    const ROW_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];
    const PALETTE = [
        { key: 'ink', color: '#1b1830', name: '검정' },
        { key: 'red', color: '#e2434f', name: '빨강' },
        { key: 'orange', color: '#f5a623', name: '주황' },
        { key: 'yellow', color: '#f6d53f', name: '노랑' },
        { key: 'green', color: '#3fae5a', name: '초록' },
        { key: 'blue', color: '#2a6fbe', name: '파랑' },
        { key: 'purple', color: '#8558d8', name: '보라' },
        { key: 'pink', color: '#ff8fb3', name: '분홍' },
    ];

    function gridFromRows(rows, colorOf) {
        return rows.map(r => r.map(k => k ? colorOf[k] : null));
    }

    // 예시 그림: 스마일 대신 직접 디자인한 고양이 얼굴 (8x6 모눈)
    const EXAMPLE_CAT = gridFromRows([
        ['', 'ear', '', '', '', '', 'ear', ''],
        ['', 'fur', 'fur', 'fur', 'fur', 'fur', 'fur', ''],
        ['fur', 'fur', 'eye', 'fur', 'fur', 'eye', 'fur', 'fur'],
        ['fur', 'white', 'fur', 'nose', 'nose', 'fur', 'white', 'fur'],
        ['fur', 'fur', 'mouth', 'mouth', 'mouth', 'mouth', 'fur', 'fur'],
        ['', 'fur', 'fur', 'fur', 'fur', 'fur', 'fur', ''],
    ], { ear: '#5b3a29', fur: '#f5a623', eye: '#3fae5a', nose: '#ff8fb3', mouth: '#1b1830', white: '#fff3df' });

    // ---- 숨은그림 퀴즈용 문제 은행 (직접 디자인한 8x6 픽셀 그림 4종) ----
    const QUIZ_BANK = [
        {
            name: '하트', color: '#e2434f',
            rows: [
                [0, 1, 1, 0, 0, 1, 1, 0],
                [1, 1, 1, 1, 1, 1, 1, 1],
                [1, 1, 1, 1, 1, 1, 1, 1],
                [0, 1, 1, 1, 1, 1, 1, 0],
                [0, 0, 1, 1, 1, 1, 0, 0],
                [0, 0, 0, 1, 1, 0, 0, 0],
            ],
        },
        {
            name: '별', color: '#f6d53f',
            rows: [
                [0, 0, 0, 1, 1, 0, 0, 0],
                [0, 1, 0, 1, 1, 0, 1, 0],
                [0, 0, 1, 1, 1, 1, 0, 0],
                [1, 1, 1, 1, 1, 1, 1, 1],
                [0, 0, 1, 1, 1, 1, 0, 0],
                [0, 1, 0, 1, 1, 0, 1, 0],
            ],
        },
        {
            name: '우산', color: '#2a6fbe',
            rows: [
                [0, 0, 1, 1, 1, 1, 0, 0],
                [0, 1, 1, 1, 1, 1, 1, 0],
                [1, 1, 1, 1, 1, 1, 1, 1],
                [0, 0, 0, 1, 1, 0, 0, 0],
                [0, 0, 0, 1, 1, 0, 0, 0],
                [0, 0, 0, 0, 1, 1, 0, 0],
            ],
        },
        {
            name: '물고기', color: '#3fae5a',
            rows: [
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 1, 1, 1, 1, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 0],
                [0, 0, 1, 1, 1, 1, 0, 1],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
            ],
        },
    ];
    QUIZ_BANK.forEach(q => {
        q.grid = q.rows.map(row => row.map(v => v ? q.color : null));
    });

    const DESIGN_ANGLE = M.DESIGN_ANGLE_DEG; // 45 — 종이(부채꼴)는 항상 이 각도로 설계되어 고정된다

    // ---- 상태 ----
    let grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    let eyeAngle = DESIGN_ANGLE; // "보는 눈의 각도" 슬라이더 값 — 거울 미리보기에만 영향을 준다
    let showMirror = true;
    let showGrid = true;
    let selectedColor = PALETTE[0].color;
    let erasing = false;
    let painting = false;
    let activeTab = 'draw';

    // ---- 공통 렌더링 함수 (여러 탭의 캔버스가 재사용) ----
    function fanToCanvas(x, y) { return [FAN_ORIGIN.x + x * FAN_PX_PER_UNIT, FAN_ORIGIN.y + y * FAN_PX_PER_UNIT]; }

    function renderFan(ctx, gridData, viewAngleDeg, showGridLines) {
        ctx.clearRect(0, 0, FAN_W, FAN_H);
        ctx.fillStyle = '#faf7ff';
        ctx.fillRect(0, 0, FAN_W, FAN_H);

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const poly = M.cellFanPolygon(c, r, viewAngleDeg).map(([x, y]) => fanToCanvas(x, y));
                const color = gridData[r][c];
                if (color) {
                    ctx.beginPath();
                    poly.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
                    ctx.closePath();
                    ctx.fillStyle = color;
                    ctx.fill();
                }
                if (showGridLines) {
                    ctx.beginPath();
                    poly.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
                    ctx.closePath();
                    ctx.strokeStyle = 'rgba(133,88,216,0.35)';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }

        if (showGridLines) {
            ctx.fillStyle = '#5b4bd6';
            ctx.font = 'bold 13px "Pretendard Variable", sans-serif';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            for (let c = 0; c < COLS; c++) {
                const { u } = M.cellUV(c, ROWS - 1);
                const p = M.fanPoint(u, 1.04, viewAngleDeg);
                const [x, y] = fanToCanvas(p.x, p.y);
                ctx.fillText(String(c + 1), x, y);
            }
            for (let r = 0; r < ROWS; r++) {
                const { v } = M.cellUV(0, r);
                const p = M.fanPoint(-0.015, v, viewAngleDeg);
                const [x, y] = fanToCanvas(p.x, p.y);
                ctx.fillText(ROW_LABELS[r], x, y);
            }
        }
    }

    // fanCanvas와 똑같은 좌표계(FAN_ORIGIN, FAN_PX_PER_UNIT)를 그대로 써서, 원통의
    // 밑면이 항상 부채꼴의 중심(거울 위치)과 정확히 맞닿도록 그린다.
    //
    // 종이는 DESIGN_ANGLE(45°)로 고정되어 설계되었지만, 실제로 보는 사람은
    // viewingAngleDeg(= "보는 눈의 각도" 슬라이더)로 볼 수도 있다. 두 각도가
    // 다르면, 각 칸이 "원래 의도한 세로 위치(v)"가 아니라 그 각도에서 보였을
    // "겉보기 위치(apparentV)"에 그려지므로 그림이 위아래로 눌리거나 늘어나
    // 보인다 — 오직 두 각도가 일치할 때만 정확히 복원된다.
    function renderCyl(ctx, gridData, show, viewingAngleDeg) {
        ctx.clearRect(0, 0, FAN_W, FAN_H);
        if (!show) return;

        const cx = FAN_ORIGIN.x, cy = FAN_ORIGIN.y, R = CYL_RADIUS_PX;

        // 금속 느낌의 원형 거울 (반지름이 부채꼴의 안쪽 호와 정확히 같다)
        const grad = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R);
        grad.addColorStop(0, '#fbfdff');
        grad.addColorStop(0.6, '#cfd6e6');
        grad.addColorStop(1, '#98a3ba');
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // 거의 수직으로(90°에 가깝게) 내려다보면 원통의 옆면이 거의 보이지
        // 않아 거울 속 그림을 알아볼 수 없다 (탄젠트 함수가 발산하는 구간).
        const nearStraightDown = viewingAngleDeg >= 85;

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.clip();

        if (nearStraightDown) {
            ctx.fillStyle = '#64748b';
            ctx.font = 'bold 13px "Pretendard Variable", sans-serif';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('원통 거울', cx, cy);
        } else {
            // 거울 속에 비친 그림: 각 행(row)을, 그 행이 실제로 설계된 반지름을
            // 현재 보는 각도로 되짚었을 때의 "겉보기 세로 위치"에 그린다.
            const previewR = R * 0.82;
            const cell = previewR / Math.hypot(COLS / 2, ROWS / 2);
            const imgW = COLS * cell, imgH = ROWS * cell;
            const left = cx - imgW / 2, top = cy - imgH / 2;
            for (let r = 0; r < ROWS; r++) {
                const rho0 = M.rhoOf(r / ROWS, DESIGN_ANGLE);
                const rho1 = M.rhoOf((r + 1) / ROWS, DESIGN_ANGLE);
                const av0 = M.apparentV(rho0, viewingAngleDeg);
                const av1 = M.apparentV(rho1, viewingAngleDeg);
                const y0 = top + av0 * imgH, y1 = top + av1 * imgH;
                for (let c = 0; c < COLS; c++) {
                    const color = gridData[r][c];
                    if (!color) continue;
                    ctx.fillStyle = color;
                    ctx.fillRect(left + c * cell, y0, cell + 0.5, (y1 - y0) + 0.5);
                }
            }
            // v=0, v=1 두 끝은 보는 각도에 상관없이 항상 제자리로 되짚이므로
            // (apparentV(rho(0))=0, apparentV(rho(1))=1 항상), 테두리는 각도와
            // 무관하게 원래 그림 전체 범위를 그대로 나타낸다.
            ctx.strokeStyle = 'rgba(30,41,59,0.5)';
            ctx.lineWidth = 1;
            ctx.strokeRect(left, top, imgW, imgH);
        }
        ctx.restore();

        // 살짝 광택
        const sheen = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
        sheen.addColorStop(0, 'rgba(255,255,255,0.4)');
        sheen.addColorStop(0.3, 'rgba(255,255,255,0)');
        sheen.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = sheen;
        ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
        ctx.restore();

        ctx.strokeStyle = 'rgba(27,24,48,0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, R, 0, Math.PI * 2);
        ctx.stroke();
    }

    // ---- DOM: 그려 보기 탭 ----
    const drawCanvas = document.getElementById('drawCanvas');
    const dctx = drawCanvas.getContext('2d');
    const fanCanvas = document.getElementById('fanCanvas');
    const fctx = fanCanvas.getContext('2d');
    const cylCanvas = document.getElementById('cylCanvas');
    const cctx = cylCanvas.getContext('2d');
    const angleSlider = document.getElementById('angleSlider');
    const angleVal = document.getElementById('angleVal');
    const angleVal2 = document.getElementById('angleVal2');

    [drawCanvas].forEach(c => { c.width = DRAW_W; c.height = DRAW_H; });
    [fanCanvas, cylCanvas].forEach(c => { c.width = FAN_W; c.height = FAN_H; });

    function drawDrawCanvas() {
        dctx.clearRect(0, 0, DRAW_W, DRAW_H);
        dctx.fillStyle = '#fffaf3';
        dctx.fillRect(0, 0, DRAW_W, DRAW_H);
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const color = grid[r][c];
                if (color) {
                    dctx.fillStyle = color;
                    dctx.fillRect(c * CELL, r * CELL, CELL, CELL);
                }
            }
        }
        if (showGrid) {
            dctx.strokeStyle = 'rgba(27,24,48,0.14)';
            dctx.lineWidth = 1;
            for (let c = 0; c <= COLS; c++) {
                dctx.beginPath(); dctx.moveTo(c * CELL, 0); dctx.lineTo(c * CELL, DRAW_H); dctx.stroke();
            }
            for (let r = 0; r <= ROWS; r++) {
                dctx.beginPath(); dctx.moveTo(0, r * CELL); dctx.lineTo(DRAW_W, r * CELL); dctx.stroke();
            }
        }
        dctx.strokeStyle = '#8558d8';
        dctx.lineWidth = 2;
        dctx.strokeRect(1, 1, DRAW_W - 2, DRAW_H - 2);
    }

    function redrawAll() {
        drawDrawCanvas();
        renderFan(fctx, grid, DESIGN_ANGLE, showGrid);
        renderCyl(cctx, grid, showMirror, eyeAngle);
        if (activeTab === 'light') redrawLightTab();
    }

    function cellFromEvent(e) {
        const rect = drawCanvas.getBoundingClientRect();
        const px = (e.clientX - rect.left) * (DRAW_W / rect.width);
        const py = (e.clientY - rect.top) * (DRAW_H / rect.height);
        const col = Math.floor(px / CELL), row = Math.floor(py / CELL);
        if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return null;
        return { col, row };
    }

    function paintAt(e) {
        const cell = cellFromEvent(e);
        if (!cell) return;
        grid[cell.row][cell.col] = erasing ? null : selectedColor;
        redrawAll();
    }

    drawCanvas.addEventListener('pointerdown', (e) => {
        painting = true;
        drawCanvas.setPointerCapture(e.pointerId);
        paintAt(e);
    });
    drawCanvas.addEventListener('pointermove', (e) => { if (painting) paintAt(e); });
    drawCanvas.addEventListener('pointerup', () => { painting = false; });
    drawCanvas.addEventListener('pointercancel', () => { painting = false; });

    const paletteEl = document.getElementById('palette');
    PALETTE.forEach((p, i) => {
        const btn = document.createElement('button');
        btn.className = 'swatch' + (i === 0 ? ' active' : '');
        btn.style.background = p.color;
        btn.title = p.name;
        btn.dataset.color = p.color;
        btn.addEventListener('click', () => {
            selectedColor = p.color;
            erasing = false;
            document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('btnEraser').classList.remove('active');
        });
        paletteEl.appendChild(btn);
    });

    document.getElementById('btnEraser').addEventListener('click', (e) => {
        erasing = true;
        document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
        e.currentTarget.classList.add('active');
    });

    document.getElementById('btnClearAll').addEventListener('click', () => {
        grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
        redrawAll();
    });

    document.getElementById('btnExample').addEventListener('click', () => {
        grid = EXAMPLE_CAT.map(row => row.slice());
        redrawAll();
    });

    document.getElementById('btnSave').addEventListener('click', () => {
        try {
            localStorage.setItem('anamorph-grid-v1', JSON.stringify(grid));
            showToast('저장했어요! 다음에 "불러오기"로 이어서 그릴 수 있어요.');
        } catch (err) {
            showToast('저장에 실패했어요.');
        }
    });

    document.getElementById('btnLoad').addEventListener('click', () => {
        try {
            const raw = localStorage.getItem('anamorph-grid-v1');
            if (!raw) { showToast('저장된 그림이 없어요.'); return; }
            const loaded = JSON.parse(raw);
            if (Array.isArray(loaded) && loaded.length === ROWS) {
                grid = loaded;
                redrawAll();
                showToast('불러왔어요!');
            }
        } catch (err) {
            showToast('불러오기에 실패했어요.');
        }
    });

    function showToast(msg) {
        const el = document.getElementById('toast');
        el.textContent = msg;
        el.classList.add('shown');
        clearTimeout(showToast._t);
        showToast._t = setTimeout(() => el.classList.remove('shown'), 1800);
    }

    document.getElementById('btnToggleMirror').addEventListener('click', (e) => {
        showMirror = !showMirror;
        e.currentTarget.textContent = showMirror ? '🫙 거울 치우기' : '🫙 거울 보기';
        redrawAll();
    });

    document.getElementById('btnToggleGrid').addEventListener('click', (e) => {
        showGrid = !showGrid;
        e.currentTarget.textContent = showGrid ? '▦ 모눈 끄기' : '▦ 모눈 켜기';
        redrawAll();
    });

    function updateAngleUI() {
        angleVal.textContent = eyeAngle + '°';
        angleVal2.textContent = eyeAngle + '°';
        const hint = document.getElementById('angleHint');
        const diff = eyeAngle - DESIGN_ANGLE;
        if (eyeAngle >= 80) {
            hint.innerHTML = `이 종이는 <b>${DESIGN_ANGLE}°</b>에서 보도록 설계되었어요. 지금처럼 거의 수직으로(<b>${eyeAngle}°</b>) 내려다보면 원통의 옆면이 거의 안 보여서, 거울 속 그림을 알아볼 수 없어요.`;
        } else if (Math.abs(diff) < 1) {
            hint.innerHTML = `이 종이는 <b>${DESIGN_ANGLE}°</b>에서 보도록 설계되었어요. 지금 <b>${eyeAngle}°</b>에서 보고 있으니, 거울 속 그림이 정확하게 보여요.`;
        } else if (diff > 0) {
            hint.innerHTML = `이 종이는 <b>${DESIGN_ANGLE}°</b>에서 보도록 설계되었는데, 지금은 그보다 높은 <b>${eyeAngle}°</b>에서 보고 있어요. 그래서 거울 속 그림이 위아래로 눌리거나 어긋나 보여요.`;
        } else {
            hint.innerHTML = `이 종이는 <b>${DESIGN_ANGLE}°</b>에서 보도록 설계되었는데, 지금은 그보다 낮은 <b>${eyeAngle}°</b>에서 보고 있어요. 그래서 거울 속 그림이 위아래로 늘어나거나 어긋나 보여요.`;
        }
    }

    angleSlider.addEventListener('input', () => {
        eyeAngle = Number(angleSlider.value);
        updateAngleUI();
        redrawAll();
    });

    document.getElementById('btnResetAngle').addEventListener('click', () => {
        eyeAngle = DESIGN_ANGLE;
        angleSlider.value = eyeAngle;
        updateAngleUI();
        redrawAll();
    });

    // ---- DOM: 빛의 경로 탭 ----
    const fanCanvasL = document.getElementById('fanCanvasL');
    const fctxL = fanCanvasL.getContext('2d');
    const cylCanvasL = document.getElementById('cylCanvasL');
    const cctxL = cylCanvasL.getContext('2d');
    const rayCanvasL = document.getElementById('rayCanvasL');
    const rctxL = rayCanvasL.getContext('2d');
    [fanCanvasL, cylCanvasL, rayCanvasL].forEach(c => { c.width = FAN_W; c.height = FAN_H; });

    let lastRayClick = null; // {x,y} in fanCanvasL pixel coords

    function drawEyeMarker(ctx) {
        ctx.save();
        ctx.fillStyle = '#334155';
        ctx.font = '20px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('👁', EYE_POS.x, EYE_POS.y);
        ctx.fillStyle = '#78716c';
        ctx.font = '11px "Pretendard Variable", sans-serif';
        ctx.fillText('눈 (멀리서 거울을 봐요)', EYE_POS.x, EYE_POS.y + 18);
        ctx.restore();
    }

    function renderRay(point) {
        rctxL.clearRect(0, 0, FAN_W, FAN_H);
        drawEyeMarker(rctxL);
        if (!point) return;

        const S = point;
        const result = M.reflectOffCircle(S, EYE_POS, FAN_ORIGIN, CYL_RADIUS_PX, M.THETA_SPAN_DEG);
        const infoBox = document.getElementById('rayInfoBox');
        if (!result || !result.valid) {
            infoBox.innerHTML = '<p class="angle-readout-hint">이 위치에서는 거울에 반사되어 눈까지 닿지 않아요. 거울에 더 가까운 곳을 눌러보세요.</p>';
            return;
        }
        const P = result.point;

        // 법선 (점선, 중심을 지나 바깥까지)
        const nFar = { x: FAN_ORIGIN.x + (P.x - FAN_ORIGIN.x) * 1.5, y: FAN_ORIGIN.y + (P.y - FAN_ORIGIN.y) * 1.5 };
        rctxL.save();
        rctxL.setLineDash([4, 4]);
        rctxL.strokeStyle = '#94a3b8';
        rctxL.lineWidth = 1.5;
        rctxL.beginPath();
        rctxL.moveTo(FAN_ORIGIN.x, FAN_ORIGIN.y);
        rctxL.lineTo(nFar.x, nFar.y);
        rctxL.stroke();
        rctxL.restore();
        rctxL.fillStyle = '#78716c';
        rctxL.font = '11px "Pretendard Variable", sans-serif';
        rctxL.textAlign = 'left';
        rctxL.fillText('법선', nFar.x + 4, nFar.y);

        // 입사광 (초록, 점 -> 거울)
        rctxL.strokeStyle = '#15803d';
        rctxL.lineWidth = 2.5;
        rctxL.beginPath();
        rctxL.moveTo(S.x, S.y);
        rctxL.lineTo(P.x, P.y);
        rctxL.stroke();

        // 반사광 (파랑, 거울 -> 눈)
        rctxL.strokeStyle = '#2a6fbe';
        rctxL.lineWidth = 2.5;
        rctxL.beginPath();
        rctxL.moveTo(P.x, P.y);
        rctxL.lineTo(EYE_POS.x, EYE_POS.y);
        rctxL.stroke();

        // 클릭한 점 표시
        rctxL.fillStyle = '#b91c1c';
        rctxL.beginPath();
        rctxL.arc(S.x, S.y, 4.5, 0, Math.PI * 2);
        rctxL.fill();
        rctxL.strokeStyle = 'white'; rctxL.lineWidth = 1.5; rctxL.stroke();

        drawEyeMarker(rctxL);

        const dxWorld = (S.x - FAN_ORIGIN.x) / FAN_PX_PER_UNIT;
        const dyWorld = (S.y - FAN_ORIGIN.y) / FAN_PX_PER_UNIT;
        const inv = M.fanInverse(dxWorld, dyWorld);
        let cellInfo;
        if (inv.inBounds) {
            const color = grid[inv.row][inv.col];
            cellInfo = `${ROW_LABELS[inv.row]}행 ${inv.col + 1}열` + (color ? '' : ' (아직 색칠 안 한 칸)');
        } else {
            cellInfo = '그림 영역 밖이라 모눈에는 없어요';
        }

        infoBox.innerHTML = `
            <div class="angle-readout-row">
                <span class="pair in">입사각 ${result.incidenceDeg.toFixed(0)}°</span>
                <span class="pair out">반사각 ${result.reflectionDeg.toFixed(0)}°</span>
            </div>
            <p class="angle-readout-eq">입사각 = 반사각</p>
            <p class="hint">${cellInfo}<br>(왼쪽 아래 작은 창의 점)</p>
        `;
    }

    function redrawLightTab() {
        renderFan(fctxL, grid, DESIGN_ANGLE, true);
        renderCyl(cctxL, grid, true, eyeAngle);
        renderRay(lastRayClick);
    }

    fanCanvasL.addEventListener('pointerdown', (e) => {
        const rect = fanCanvasL.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (FAN_W / rect.width);
        const y = (e.clientY - rect.top) * (FAN_H / rect.height);
        lastRayClick = { x, y };
        renderRay(lastRayClick);
    });

    document.getElementById('btnClearRay').addEventListener('click', () => {
        lastRayClick = null;
        renderRay(null);
        document.getElementById('rayInfoBox').innerHTML = '<p class="angle-readout-hint">아직 누른 점이 없어요. 왼쪽 종이를 눌러보세요.</p>';
    });

    // ---- DOM: 숨은그림 퀴즈 탭 ----
    const fanCanvasQ = document.getElementById('fanCanvasQ');
    const fctxQ = fanCanvasQ.getContext('2d');
    const cylCanvasQ = document.getElementById('cylCanvasQ');
    const cctxQ = cylCanvasQ.getContext('2d');
    [fanCanvasQ, cylCanvasQ].forEach(c => { c.width = FAN_W; c.height = FAN_H; });

    let quizOrder = [];
    let quizIndex = 0;
    let quizScore = { correct: 0, total: 0 };
    let quizAnswered = false;

    function shuffle(arr) {
        const a = arr.slice();
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function startQuiz() {
        quizOrder = shuffle(QUIZ_BANK.map((_, i) => i));
        quizIndex = 0;
        quizScore = { correct: 0, total: 0 };
        quizAnswered = false;
        document.getElementById('quizTotal').textContent = String(QUIZ_BANK.length);
        renderQuizQuestion();
    }

    function renderQuizQuestion() {
        quizAnswered = false;
        const q = QUIZ_BANK[quizOrder[quizIndex]];
        renderFan(fctxQ, q.grid, DESIGN_ANGLE, true);
        renderCyl(cctxQ, q.grid, false, DESIGN_ANGLE);
        document.getElementById('quizNum').textContent = String(quizIndex + 1);
        document.getElementById('quizScore').textContent = `${quizScore.correct} / ${quizScore.total}`;
        document.getElementById('quizFeedback').textContent = '';
        document.getElementById('quizFeedback').classList.remove('shown');
        document.getElementById('btnQuizNext').disabled = true;

        const choicesEl = document.getElementById('quizChoices');
        choicesEl.innerHTML = '';
        const choiceNames = shuffle(QUIZ_BANK.map(b => b.name));
        choiceNames.forEach(name => {
            const btn = document.createElement('button');
            btn.className = 'btn quiz-choice';
            btn.textContent = name;
            btn.addEventListener('click', () => onQuizChoice(name, btn, q));
            choicesEl.appendChild(btn);
        });
    }

    function onQuizChoice(name, btn, q) {
        if (quizAnswered) return;
        quizAnswered = true;
        quizScore.total++;
        const correct = name === q.name;
        if (correct) quizScore.correct++;

        document.querySelectorAll('#quizChoices .quiz-choice').forEach(b => {
            b.disabled = true;
            if (b.textContent === q.name) b.classList.add('correct');
            else if (b === btn) b.classList.add('wrong');
        });

        const fb = document.getElementById('quizFeedback');
        fb.textContent = correct ? '🎉 정답이에요!' : '아쉬워요! 거울 속을 보세요.';
        fb.style.color = correct ? '#15803d' : '#b91c1c';
        fb.classList.add('shown');

        document.getElementById('quizScore').textContent = `${quizScore.correct} / ${quizScore.total}`;
        renderCyl(cctxQ, q.grid, true, DESIGN_ANGLE); // 정답 공개(원통 속 모습 보여주기)
        document.getElementById('btnQuizNext').disabled = false;
    }

    document.getElementById('btnQuizNext').addEventListener('click', () => {
        quizIndex = (quizIndex + 1) % quizOrder.length;
        renderQuizQuestion();
    });
    document.getElementById('btnQuizRestart').addEventListener('click', startQuiz);

    // ---- 탭 전환 ----
    function setActiveTab(tab) {
        activeTab = tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
        document.getElementById('panelDraw').classList.toggle('active', tab === 'draw');
        document.getElementById('panelLight').classList.toggle('active', tab === 'light');
        document.getElementById('panelQuiz').classList.toggle('active', tab === 'quiz');
        if (tab === 'light') redrawLightTab();
        if (tab === 'quiz' && quizOrder.length === 0) startQuiz();
    }
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => setActiveTab(btn.dataset.tab));
    });

    // ---- 초기화 ----
    angleSlider.value = eyeAngle;
    updateAngleUI();
    redrawAll();
})();
