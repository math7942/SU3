// ---- 아나모르포시스(원통 거울) 도구 UI 로직 ----
(function () {
    const M = window.AnamorphMath;
    const COLS = M.COLS, ROWS = M.ROWS;

    const CELL = 46;
    const DRAW_W = COLS * CELL, DRAW_H = ROWS * CELL;

    const FAN_PX_PER_UNIT = 72;
    // 거울(원통) 그래픽은 fanCanvas와 "똑같은 좌표계" 위에 겹쳐 그린다. 원통의
    // 밑면 반지름을 R_CYL(부채꼴의 안쪽 가장자리)과 정확히 일치시켜서, 거울
    // 그림의 아랫부분이 부채꼴의 중심(거울 위치)과 어긋나지 않게 한다.
    const CYL_RADIUS_PX = M.R_CYL * FAN_PX_PER_UNIT; // 부채꼴 안쪽 가장자리와 동일
    const CAN_OUTER_RX = CYL_RADIUS_PX + 10;
    const CYL_TOP_ELLIPSE_RY = 15;
    const CYL_HEIGHT_PX = 170; // 원통의 시각적 전체 높이
    const CYL_PREVIEW_HEIGHT_PX = 138; // 그림이 입혀지는 범위(위쪽 테두리를 살짝 남김)

    // 캔버스 높이는 "원통이 들어갈 자리(CYL_HEIGHT_PX + 여백) + 부채꼴이 뻗어나갈
    // 최대 길이"를 모두 담을 수 있도록 역산한다. 거울(부채꼴 중심)은 원통 바로
    // 아래, 즉 원통 높이만큼 아래로 내려온 지점에 위치한다.
    const FAN_W = 720;
    const ORIGIN_Y = CYL_HEIGHT_PX + 18;
    const rhoMaxPx = M.R_CYL * M.RHO_MAX_FACTOR * FAN_PX_PER_UNIT;
    const FAN_H = Math.ceil(ORIGIN_Y + rhoMaxPx * 1.06 + 30);
    const FAN_ORIGIN = { x: FAN_W / 2, y: ORIGIN_Y };
    const CYL_BODY_TOP_Y = FAN_ORIGIN.y - CYL_HEIGHT_PX;
    const CYL_BODY_BOTTOM_Y = FAN_ORIGIN.y; // = 부채꼴의 중심(거울) 위치
    const CYL_PREVIEW_TOP_Y = FAN_ORIGIN.y - CYL_PREVIEW_HEIGHT_PX;

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

    // 예시 그림: 스마일 대신 직접 디자인한 고양이 얼굴 (8x6 모눈)
    const EXAMPLE_CAT = (() => {
        const fur = '#f5a623', ear = '#5b3a29', eye = '#3fae5a', nose = '#ff8fb3', mouth = '#1b1830', white = '#fff3df';
        const rows = [
            ['', 'ear', '', '', '', '', 'ear', ''],
            ['', 'fur', 'fur', 'fur', 'fur', 'fur', 'fur', ''],
            ['fur', 'fur', 'eye', 'fur', 'fur', 'eye', 'fur', 'fur'],
            ['fur', 'white', 'fur', 'nose', 'nose', 'fur', 'white', 'fur'],
            ['fur', 'fur', 'mouth', 'mouth', 'mouth', 'mouth', 'fur', 'fur'],
            ['', 'fur', 'fur', 'fur', 'fur', 'fur', 'fur', ''],
        ];
        const colorOf = { ear, fur, eye, nose, mouth, white };
        return rows.map(r => r.map(k => k ? colorOf[k] : null));
    })();

    // ---- 상태 ----
    let grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    let viewAngle = 45;
    let showMirror = true;
    let showGrid = true;
    let selectedColor = PALETTE[0].color;
    let erasing = false;
    let painting = false;

    // ---- DOM ----
    const drawCanvas = document.getElementById('drawCanvas');
    const dctx = drawCanvas.getContext('2d');
    const fanCanvas = document.getElementById('fanCanvas');
    const fctx = fanCanvas.getContext('2d');
    const cylCanvas = document.getElementById('cylCanvas');
    const cctx = cylCanvas.getContext('2d');
    const angleSlider = document.getElementById('angleSlider');
    const angleVal = document.getElementById('angleVal');
    const angleVal2 = document.getElementById('angleVal2');

    drawCanvas.width = DRAW_W; drawCanvas.height = DRAW_H;
    fanCanvas.width = FAN_W; fanCanvas.height = FAN_H;
    cylCanvas.width = FAN_W; cylCanvas.height = FAN_H;

    // ---- 그리기 캔버스 (모눈종이 = 거울 속에 보일 그림) ----
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

    // ---- 부채꼴(종이에 그릴 왜상) 캔버스 ----
    function fanToCanvas(x, y) { return [FAN_ORIGIN.x + x * FAN_PX_PER_UNIT, FAN_ORIGIN.y + y * FAN_PX_PER_UNIT]; }

    function drawFanCanvas() {
        fctx.clearRect(0, 0, FAN_W, FAN_H);
        fctx.fillStyle = '#faf7ff';
        fctx.fillRect(0, 0, FAN_W, FAN_H);

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const poly = M.cellFanPolygon(c, r, viewAngle).map(([x, y]) => fanToCanvas(x, y));
                const color = grid[r][c];
                if (color) {
                    fctx.beginPath();
                    poly.forEach(([x, y], i) => i === 0 ? fctx.moveTo(x, y) : fctx.lineTo(x, y));
                    fctx.closePath();
                    fctx.fillStyle = color;
                    fctx.fill();
                }
                if (showGrid) {
                    fctx.beginPath();
                    poly.forEach(([x, y], i) => i === 0 ? fctx.moveTo(x, y) : fctx.lineTo(x, y));
                    fctx.closePath();
                    fctx.strokeStyle = 'rgba(133,88,216,0.35)';
                    fctx.lineWidth = 1;
                    fctx.stroke();
                }
            }
        }

        if (showGrid) {
            fctx.fillStyle = '#5b4bd6';
            fctx.font = 'bold 13px "Pretendard Variable", sans-serif';
            fctx.textAlign = 'center'; fctx.textBaseline = 'middle';
            for (let c = 0; c < COLS; c++) {
                const { u } = M.cellUV(c, ROWS - 1);
                const p = M.fanPoint(u, 1.04, viewAngle);
                const [x, y] = fanToCanvas(p.x, p.y);
                fctx.fillText(String(c + 1), x, y);
            }
            for (let r = 0; r < ROWS; r++) {
                const { v } = M.cellUV(0, r);
                const p = M.fanPoint(-0.015, v, viewAngle);
                const [x, y] = fanToCanvas(p.x, p.y);
                fctx.fillText(ROW_LABELS[r], x, y);
            }
        }
    }

    // ---- 원통 거울 미리보기 ----
    // fanCanvas와 똑같은 좌표계(FAN_ORIGIN, FAN_PX_PER_UNIT)를 그대로 써서, 원통의
    // 밑면이 항상 부채꼴의 중심(거울 위치)과 정확히 맞닿도록 그린다.
    function drawCylCanvas() {
        cctx.clearRect(0, 0, FAN_W, FAN_H);
        if (!showMirror) return;

        const cx = FAN_ORIGIN.x;
        const topY = CYL_BODY_TOP_Y, bottomY = CYL_BODY_BOTTOM_Y;

        function bodyPath() {
            cctx.beginPath();
            cctx.moveTo(cx - CAN_OUTER_RX, topY);
            cctx.lineTo(cx - CAN_OUTER_RX, bottomY);
            cctx.ellipse(cx, bottomY, CAN_OUTER_RX, CYL_TOP_ELLIPSE_RY, 0, Math.PI, 0, true);
            cctx.lineTo(cx + CAN_OUTER_RX, topY);
            cctx.ellipse(cx, topY, CAN_OUTER_RX, CYL_TOP_ELLIPSE_RY, 0, 0, Math.PI, true);
            cctx.closePath();
        }

        // 몸통 (금속 느낌 그라디언트)
        const bodyGrad = cctx.createLinearGradient(cx - CAN_OUTER_RX, 0, cx + CAN_OUTER_RX, 0);
        bodyGrad.addColorStop(0, '#cfd6e6');
        bodyGrad.addColorStop(0.5, '#f3f6fb');
        bodyGrad.addColorStop(1, '#b9c2d6');
        cctx.fillStyle = bodyGrad;
        bodyPath();
        cctx.fill();

        // 비친 그림을 몸통 앞면(보이는 범위)에 클립해서 그린다
        cctx.save();
        bodyPath();
        cctx.clip();

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const color = grid[r][c];
                if (!color) continue;
                const poly = M.cellCylinderPolygon(c, r, CYL_RADIUS_PX, CYL_PREVIEW_HEIGHT_PX)
                    .map(([x, y]) => [cx + x, CYL_PREVIEW_TOP_Y + y]);
                cctx.beginPath();
                poly.forEach(([x, y], i) => i === 0 ? cctx.moveTo(x, y) : cctx.lineTo(x, y));
                cctx.closePath();
                cctx.fillStyle = color;
                cctx.fill();
            }
        }
        // 살짝 광택
        const sheen = cctx.createLinearGradient(cx - CAN_OUTER_RX, 0, cx + CAN_OUTER_RX, 0);
        sheen.addColorStop(0, 'rgba(255,255,255,0.35)');
        sheen.addColorStop(0.18, 'rgba(255,255,255,0)');
        sheen.addColorStop(0.82, 'rgba(255,255,255,0)');
        sheen.addColorStop(1, 'rgba(255,255,255,0.3)');
        cctx.fillStyle = sheen;
        cctx.fillRect(cx - CAN_OUTER_RX, topY, CAN_OUTER_RX * 2, bottomY - topY + 24);
        cctx.restore();

        // 테두리
        cctx.strokeStyle = 'rgba(27,24,48,0.25)';
        cctx.lineWidth = 1.4;
        cctx.beginPath();
        cctx.ellipse(cx, topY, CAN_OUTER_RX, CYL_TOP_ELLIPSE_RY, 0, 0, Math.PI * 2);
        cctx.stroke();
    }

    function redrawAll() {
        drawDrawCanvas();
        drawFanCanvas();
        drawCylCanvas();
    }

    // ---- 그리기 상호작용 ----
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

    // ---- 팔레트 ----
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

    angleSlider.addEventListener('input', () => {
        viewAngle = Number(angleSlider.value);
        angleVal.textContent = viewAngle + '°';
        angleVal2.textContent = viewAngle + '°';
        redrawAll();
    });

    // ---- 초기화 ----
    angleSlider.value = viewAngle;
    angleVal.textContent = viewAngle + '°';
    angleVal2.textContent = viewAngle + '°';
    redrawAll();
})();
