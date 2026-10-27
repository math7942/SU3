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

    // 원기둥의 "보이는 벽면 높이"(화면 픽셀 기준, 보는 각도 φ=0일 때의 최댓값).
    // renderCyl이 이 높이를 cos(φ)만큼 눌러 실제 보이는 몸통 높이로 쓴다.
    const CYL_H_PX = CYL_RADIUS_PX * 1.7;

    const FAN_W = 720;
    // 몸통(cos항)과 밑면 타원이 앞으로 튀어나오는 정도(sin항)의 합이 어떤
    // 각도에서도 이 한계를 넘지 않는다 (코시-슈바르츠 부등식:
    // a·cosφ + b·sinφ ≤ √(a²+b²)) — 각도가 바뀌어도 캔버스 위쪽 밖으로
    // 넘치지 않을 여백을 안전하게 미리 확보해 둔다.
    const ORIGIN_Y = CYL_RADIUS_PX + Math.hypot(CYL_H_PX, CYL_RADIUS_PX) + 20;
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
    // 숨은그림 퀴즈용 그림: 모두 EXAMPLE_CAT과 같은 방식(여러 색의 8x6 픽셀
    // 아트)으로 다시 그렸다. 한 가지 색 블록만으로는 거울로 바로잡아도 무슨
    // 그림인지 알아보기 어려워서, 부위마다 다른 색을 넣어 실루엣이 뚜렷하게
    // 드러나도록 했다(우산은 우산살 색과 손잡이 색을 다르게, 물고기는 몸통과
    // 꼬리·눈을 다르게 하는 식).
    const QUIZ_BANK = [
        {
            name: '하트',
            grid: gridFromRows([
                ['', 'R', 'R', '', '', 'R', 'R', ''],
                ['R', 'R', 'R', 'R', 'R', 'R', 'R', 'R'],
                ['R', 'H', 'R', 'R', 'R', 'R', 'R', 'R'],
                ['', 'R', 'R', 'R', 'R', 'R', 'R', ''],
                ['', '', 'R', 'R', 'R', 'R', '', ''],
                ['', '', '', 'R', 'R', '', '', ''],
            ], { R: '#e2434f', H: '#ff9eb3' }),
        },
        {
            name: '별',
            grid: gridFromRows([
                ['', '', '', 'Y', 'Y', '', '', ''],
                ['', '', 'Y', 'Y', 'Y', 'Y', '', ''],
                ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
                ['', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', ''],
                ['', 'Y', 'Y', '', '', 'Y', 'Y', ''],
                ['Y', 'Y', '', '', '', '', 'Y', 'Y'],
            ], { Y: '#f6d53f' }),
        },
        {
            name: '우산',
            grid: gridFromRows([
                ['', '', 'B', 'B', 'B', 'B', '', ''],
                ['', 'B', 'B', 'B', 'B', 'B', 'B', ''],
                ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'],
                ['', '', '', 'S', 'S', '', '', ''],
                ['', '', '', 'S', 'S', '', '', ''],
                ['', '', '', '', 'S', 'S', '', ''],
            ], { B: '#2a6fbe', S: '#6b4a2f' }),
        },
        {
            name: '물고기',
            grid: gridFromRows([
                ['', '', '', 'F', 'F', '', 'T', ''],
                ['', 'F', 'F', 'F', 'F', 'F', 'T', 'T'],
                ['E', 'F', 'F', 'F', 'F', 'F', 'F', 'T'],
                ['', 'F', 'F', 'F', 'F', 'F', 'T', 'T'],
                ['', '', '', 'F', 'F', '', 'T', ''],
                ['', '', '', '', '', '', '', ''],
            ], { F: '#42a5f5', T: '#1565c0', E: '#1b1830' }),
        },
    ];

    const DESIGN_ANGLE = M.DESIGN_ANGLE_DEG; // 45 — 종이(부채꼴)는 항상 이 각도로 설계되어 고정된다
    const SPAN_RAD = M.THETA_SPAN_DEG * Math.PI / 180;
    const TAN_DESIGN = Math.tan(DESIGN_ANGLE * Math.PI / 180);

    function hexToRgb(hex) {
        const n = parseInt(hex.slice(1), 16);
        return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    }

    // ---- 상태 ----
    // 빈 모눈으로 시작하면 거울 속에 비출 내용이 없어서, 슬라이더를 움직여도
    // 아무 변화도 안 보여(테두리만 있는 빈 원) 마치 안 바뀌는 것처럼 오해하기
    // 쉽다. 그래서 처음부터 예시 그림을 채워두고 시작한다.
    let grid = EXAMPLE_CAT.map(row => row.slice());
    let eyeAngle = DESIGN_ANGLE; // "보는 눈의 각도" 슬라이더 값 — 거울 미리보기에만 영향을 준다
    let showMirror = true;
    let showGrid = true;
    let view3d = false;   // "3D 돌려 보기" 켜짐 여부 — 켜져 있으면 끌어서 원기둥을 좌우로 돌려볼 수 있다
    let azimuthDeg = 0;   // 원기둥을 좌우로 돌려 보는 방위각 (0 = 정면)
    let selectedColor = PALETTE[0].color;
    let erasing = false;
    let painting = false;
    let activeTab = 'draw';

    // ---- 공통 렌더링 함수 (여러 탭의 캔버스가 재사용) ----
    // 종이 위 그림의 "내용"(어느 칸이 어디로 휘는가)은 항상 설계 각도(45°)로
    // 고정이지만, 그 종이를 지금 화면에 어떻게 "보여줄지"는 별개다 — 실제로
    // 체험자가 책상 위의 종이와 거울을 비스듬히 내려다보는 것처럼, 보는 각도·
    // 돌려보는 방향에 따라 종이도 거울과 함께 기울어 보여야 "내가 직접 돌아다니며
    // 본다"는 느낌이 난다. sceneProject가 그 하나의 공통 카메라 변환이고,
    // renderCyl의 밑면 타원(Rs, Rs·sin(elev))과 정확히 같은 식이라 종이와
    // 거울이 항상 같은 자리에서 자연스럽게 맞물린다.
    function sceneProject(x, y, elevDeg, azDeg) {
        const az = (azDeg || 0) * Math.PI / 180;
        const elev = Math.max(5, Math.min(85, elevDeg == null ? 90 : elevDeg)) * Math.PI / 180;
        const rx = x * Math.cos(az) - y * Math.sin(az);
        const ry = x * Math.sin(az) + y * Math.cos(az);
        return [rx, ry * Math.sin(elev)];
    }
    function unprojectFanPoint(px, py, elevDeg, azDeg) {
        const az = (azDeg || 0) * Math.PI / 180;
        const elev = Math.max(5, Math.min(85, elevDeg == null ? 90 : elevDeg)) * Math.PI / 180;
        const ry = py / Math.sin(elev);
        const rx = px;
        return { x: rx * Math.cos(az) + ry * Math.sin(az), y: -rx * Math.sin(az) + ry * Math.cos(az) };
    }
    function fanToCanvas(x, y, elevDeg, azDeg) {
        const [px, py] = sceneProject(x, y, elevDeg, azDeg);
        return [FAN_ORIGIN.x + px * FAN_PX_PER_UNIT, FAN_ORIGIN.y + py * FAN_PX_PER_UNIT];
    }

    function renderFan(ctx, gridData, showGridLines, elevDeg, azDeg) {
        ctx.clearRect(0, 0, FAN_W, FAN_H);
        ctx.fillStyle = '#faf7ff';
        ctx.fillRect(0, 0, FAN_W, FAN_H);

        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const poly = M.cellFanPolygon(c, r, DESIGN_ANGLE).map(([x, y]) => fanToCanvas(x, y, elevDeg, azDeg));
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
                const p = M.fanPoint(u, 1.04, DESIGN_ANGLE);
                const [x, y] = fanToCanvas(p.x, p.y, elevDeg, azDeg);
                ctx.fillText(String(c + 1), x, y);
            }
            for (let r = 0; r < ROWS; r++) {
                const { v } = M.cellUV(0, r);
                const p = M.fanPoint(-0.015, v, DESIGN_ANGLE);
                const [x, y] = fanToCanvas(p.x, p.y, elevDeg, azDeg);
                ctx.fillText(ROW_LABELS[r], x, y);
            }
        }
    }

    // fanCanvas와 똑같은 좌표계(FAN_ORIGIN, FAN_PX_PER_UNIT)를 그대로 써서, 원통의
    // 밑면이 항상 부채꼴의 중심(거울 위치)과 정확히 맞닿도록 그린다.
    //
    // 종이는 DESIGN_ANGLE(45°)로 고정되어 설계되었지만, 실제로 보는 사람은
    // viewingAngleDeg(= "보는 눈의 각도" 슬라이더)로 볼 수도 있다. 원통 옆면의
    // 법선은 어디서나 수평이라, 거울 바로 앞(F행, 모눈 맨 아랫줄)만 각도에
    // 상관없이 항상 거울 밑동(= 미리보기 원의 맨 아래)으로 정확히 되비친다.
    // 그 외의 칸은 tan(실제각도)/tan(설계각도) 배만큼 겉보기 높이가 달라져서,
    // 설계보다 높은 각도에서 보면 위쪽(A행 쪽)이 원 밖으로 밀려나 잘려 보이고,
    // 낮은 각도에서 보면 전체가 아래쪽에 눌려 붙어 보인다.
    // 원기둥 거울 표면에 비친 모습을, 화면 픽셀 하나하나에 대해 실제 반사
    // 광선을 거꾸로 추적해서 그린다 (정면·위에서 비스듬히 내려다보는 평행
    // 투영 카메라 가정). 화면 픽셀 (ix,iy)마다:
    //   1) 그 픽셀이 원기둥 벽면의 어느 지점(방위각 φ, 벽면 높이 0~1)인지 역산
    //   2) 원통 반사 법칙(법선이 항상 수평 ⇒ 반사는 광선의 수직 성분을 보존)으로
    //      그 지점이 "현재 보는 각도"에서 종이 위 어느 칸을 반사하고 있는지 계산
    //   3) 그 칸의 색을 읽어와 칠한다
    // — 장식으로 덧그린 캔이 아니라, 실제로 매 프레임 다시 레이캐스팅한 결과다.
    function renderCyl(ctx, gridData, show, viewingAngleDeg, azimuthDeg) {
        ctx.clearRect(0, 0, FAN_W, FAN_H);
        if (!show) return;

        const cx = FAN_ORIGIN.x, cy = FAN_ORIGIN.y, Rs = CYL_RADIUS_PX;
        const A = Math.max(5, Math.min(85, viewingAngleDeg)) * Math.PI / 180;
        const sa = Math.sin(A), ca = Math.cos(A), tanA = Math.tan(A);
        const azRad = (azimuthDeg || 0) * Math.PI / 180;
        const topOffPx = ca * CYL_H_PX;           // 현재 보는 각도에서 눈에 보이는 몸통 높이(픽셀)
        const w = Math.ceil(Rs * 2), h = Math.ceil(topOffPx + Rs * sa) + 2;

        // 칸마다 색을 미리 rgb로 변환해 둔다 (픽셀 루프 안에서 매번 파싱하지 않도록)
        const rgbGrid = gridData.map(row => row.map(c => c ? hexToRgb(c) : null));

        const img = ctx.createImageData(w, h);
        const o = img.data;
        for (let ix = 0; ix < w; ix++) {
            const sp = (ix + 0.5 - Rs) / Rs;           // sin(φ-az) — 이 화면 열이 원기둥의 어느 방위각인지(카메라 기준)
            if (sp <= -1 || sp >= 1) continue;          // 원기둥 바깥 (투명하게 남겨 둠)
            const cp = Math.sqrt(1 - sp * sp);
            // 보는 방향을 azRad만큼 옆으로 돌리면(= 원기둥을 손으로 돌려 보면), 화면
            // 열이 가리키는 "원래(종이 기준) 방위각"은 그만큼 밀려난다 — 부채꼴의
            // 열(column) 좌표는 이 "원래 방위각"으로 찾아야 돌려 봐도 그림이 바르게 붙어 있다.
            const u0 = (Math.asin(sp) + azRad) / SPAN_RAD + 0.5;   // 부채꼴의 열(column) 좌표로 환산
            const yb = sa * Rs * cp;                     // 이 열에서 밑면 타원의 앞/뒤 보정
            const shade = 0.86 + 0.14 * cp;               // 원기둥 입체감을 위한 음영(중앙이 밝고 옆이 어둡게)
            for (let iy = 0; iy < h; iy++) {
                const zpx = (yb - (iy + 0.5 - topOffPx)) / ca;   // 원기둥 벽면 위의 실제(눌리지 않은) 높이(픽셀)
                if (zpx < 0 || zpx > CYL_H_PX) continue;          // 몸통 범위 밖 — 투명
                const zFrac = zpx / CYL_H_PX;                      // 0(밑동) ~ 1(위쪽 끝)
                // 원통 법선은 항상 수평이라 반사가 광선의 수직 성분을 바꾸지 못한다 ⇒
                // 벽면의 zFrac 지점이 지금 반사하고 있는 "종이 위 실제 칸(v0)"은
                // 설계 각도(45°)에서의 비율로 환산하면 tan(설계각)/tan(보는각) 배만큼만 달라진다.
                const v0 = zFrac * TAN_DESIGN / tanA;
                let r, g, b;
                if (u0 >= 0 && u0 <= 1 && v0 >= 0 && v0 <= 1) {
                    const col = Math.min(COLS - 1, Math.max(0, Math.floor(u0 * COLS)));
                    const row = Math.min(ROWS - 1, Math.max(0, Math.floor((1 - v0) * ROWS)));
                    const rgb = rgbGrid[row][col];
                    if (rgb) { r = rgb.r; g = rgb.g; b = rgb.b; } else { r = 253; g = 250; b = 243; }
                } else {
                    r = 206; g = 213; b = 224; // 그림 범위 밖(거울이 반사하는 책상 자리) — 중립 회색
                }
                const idx = (iy * w + ix) * 4;
                o[idx] = r * shade; o[idx + 1] = g * shade; o[idx + 2] = b * shade; o[idx + 3] = 255;
            }
        }
        ctx.putImageData(img, cx - Rs, cy - topOffPx);

        // 레이캐스팅 결과, 각 열(column)마다 "원기둥 뚜껑 너머"에 해당하는
        // 투명한 빈 자리가 열마다 다른 높이로 남는다(중앙 열일수록 넓게) —
        // 정확히 뚜껑 타원의 앞쪽 절반 모양이다. destination-over로 그 자리에만
        // 금속 뚜껑을 채워 넣어, 구멍이 아니라 둥근 뚜껑처럼 보이게 한다.
        const ry = Rs * sa;
        ctx.save();
        ctx.globalCompositeOperation = 'destination-over';
        const capGrad = ctx.createRadialGradient(cx - Rs * 0.3, cy - topOffPx - ry * 0.3, Rs * 0.1, cx, cy - topOffPx, Rs);
        capGrad.addColorStop(0, '#fbfdff');
        capGrad.addColorStop(0.6, '#d7deec');
        capGrad.addColorStop(1, '#8e99b2');
        ctx.beginPath();
        ctx.ellipse(cx, cy - topOffPx, Rs, Math.max(ry, 0.6), 0, 0, Math.PI, false);
        ctx.closePath();
        ctx.fillStyle = capGrad;
        ctx.fill();
        ctx.restore();

        // 밑면 테두리(부채꼴 안쪽 호와 맞닿는 자리)와 위쪽 테두리(현재 각도에서
        // 보이는 몸통 끝)를 살짝 그려 금속 테두리처럼 보이게 한다.
        ctx.strokeStyle = 'rgba(27,24,48,0.32)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(cx, cy, Rs, Math.max(ry, 0.6), 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(cx, cy - topOffPx, Rs, Math.max(ry, 0.6), 0, 0, Math.PI * 2);
        ctx.stroke();

        // 살짝 광택
        const sheen = ctx.createLinearGradient(cx - Rs, 0, cx + Rs, 0);
        sheen.addColorStop(0, 'rgba(255,255,255,0.3)');
        sheen.addColorStop(0.22, 'rgba(255,255,255,0)');
        sheen.addColorStop(0.3, 'rgba(255,255,255,0.22)');
        sheen.addColorStop(0.42, 'rgba(255,255,255,0)');
        sheen.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.save();
        ctx.beginPath();
        ctx.rect(cx - Rs, cy - topOffPx - ry, Rs * 2, topOffPx + ry * 2);
        ctx.clip();
        ctx.fillStyle = sheen;
        ctx.fillRect(cx - Rs, cy - topOffPx - ry, Rs * 2, topOffPx + ry * 2);
        ctx.restore();
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
        renderFan(fctx, grid, showGrid, eyeAngle, azimuthDeg);
        renderCyl(cctx, grid, showMirror, eyeAngle, azimuthDeg);
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

    // ---- 부채꼴 종이 위에 직접 그리기: 종이 위의 한 점 → (이 종이가 거울에
    // 바르게 비치도록 설계된) 역함수로 어느 칸인지 알아내 같은 칸을 칠한다.
    // 모눈종이와 부채꼴 종이, 어느 쪽에 그려도 서로 똑같이 반영된다.
    function fanCellFromEvent(e) {
        const rect = fanCanvas.getBoundingClientRect();
        const px = (e.clientX - rect.left) * (FAN_W / rect.width);
        const py = (e.clientY - rect.top) * (FAN_H / rect.height);
        const projX = (px - FAN_ORIGIN.x) / FAN_PX_PER_UNIT;
        const projY = (py - FAN_ORIGIN.y) / FAN_PX_PER_UNIT;
        // 지금 화면에 보이는 종이는 보는 각도·돌려보는 방향만큼 기울어/돌아가
        // 있으므로, 클릭 좌표를 원래(평면) 좌표로 되돌린 다음 칸을 찾는다.
        const { x: dx, y: dy } = unprojectFanPoint(projX, projY, eyeAngle, azimuthDeg);
        const inv = M.fanInverse(dx, dy);
        if (!inv.inBounds) return null;
        return { col: inv.col, row: inv.row };
    }
    let paintingFan = false;
    function paintAtFan(e) {
        const cell = fanCellFromEvent(e);
        if (!cell) return;
        grid[cell.row][cell.col] = erasing ? null : selectedColor;
        redrawAll();
    }
    fanCanvas.addEventListener('pointerdown', (e) => {
        paintingFan = true;
        fanCanvas.setPointerCapture(e.pointerId);
        paintAtFan(e);
    });
    fanCanvas.addEventListener('pointermove', (e) => { if (paintingFan) paintAtFan(e); });
    fanCanvas.addEventListener('pointerup', () => { paintingFan = false; });
    fanCanvas.addEventListener('pointercancel', () => { paintingFan = false; });

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

    // ---- 사진으로 채우기: 업로드한 사진을 COLS×ROWS 칸의 평균색으로 축소해서 모눈에 채운다 ----
    function rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
    }
    function loadPhotoFile(file) {
        if (!file || file.type.indexOf('image/') !== 0) { showToast('이미지 파일만 불러올 수 있어요.'); return; }
        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                // 모눈(8:6 비율)을 꽉 채우도록 사진 가운데를 잘라낸다
                const targetAR = COLS / ROWS;
                const srcAR = img.width / img.height;
                let sx = 0, sy = 0, sw = img.width, sh = img.height;
                if (srcAR > targetAR) { sw = img.height * targetAR; sx = (img.width - sw) / 2; }
                else { sh = img.width / targetAR; sy = (img.height - sh) / 2; }
                const SAMPLE = 16; // 칸마다 이만큼 잘게 나눠 평균색을 구한다
                const tmp = document.createElement('canvas');
                tmp.width = COLS * SAMPLE; tmp.height = ROWS * SAMPLE;
                const tctx = tmp.getContext('2d', { willReadFrequently: true });
                tctx.drawImage(img, sx, sy, sw, sh, 0, 0, tmp.width, tmp.height);
                const data = tctx.getImageData(0, 0, tmp.width, tmp.height).data;
                const next = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
                for (let r = 0; r < ROWS; r++) {
                    for (let c = 0; c < COLS; c++) {
                        let tr = 0, tg = 0, tb = 0, n = 0;
                        for (let yy = 0; yy < SAMPLE; yy++) {
                            for (let xx = 0; xx < SAMPLE; xx++) {
                                const px = c * SAMPLE + xx, py = r * SAMPLE + yy;
                                const i = (py * tmp.width + px) * 4;
                                tr += data[i]; tg += data[i + 1]; tb += data[i + 2]; n++;
                            }
                        }
                        next[r][c] = rgbToHex(tr / n, tg / n, tb / n);
                    }
                }
                grid = next;
                redrawAll();
                showToast('사진을 모눈 색으로 채웠어요!');
            };
            img.onerror = () => showToast('이미지를 읽을 수 없어요.');
            img.src = reader.result;
        };
        reader.onerror = () => showToast('파일을 읽는 중 문제가 생겼어요.');
        reader.readAsDataURL(file);
    }
    document.getElementById('btnPhoto').addEventListener('click', () => {
        document.getElementById('photoInput').click();
    });
    document.getElementById('photoInput').addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        e.target.value = '';
        loadPhotoFile(file);
    });

    // ---- 인쇄용 전개도: 실제로 인쇄해서 거울을 세워 볼 수 있도록, 부채꼴
    // 그림을 고해상도로 새로 그려 PNG로 내려받는다. 화면 미리보기용 캔버스와는
    // 별도로, 같은 부채꼴 수식(M.cellFanPolygon)을 더 큰 배율로 다시 그린다.
    function exportParchmentPNG() {
        const SCALE = 160; // px per R_CYL unit — 화면용(72)보다 훨씬 선명하게
        const rhoMaxPx = M.R_CYL * M.RHO_MAX_FACTOR * SCALE;
        const halfSpanRad = (M.THETA_SPAN_DEG / 2) * Math.PI / 180;
        const maxX = rhoMaxPx * Math.sin(halfSpanRad);
        const W = Math.ceil(maxX * 2 + 100);
        const originY = M.R_CYL * SCALE + 90;
        const H = Math.ceil(originY + rhoMaxPx * 1.06 + 90);
        const originX = W / 2;
        const toCanvas = (x, y) => [originX + x * SCALE, originY + y * SCALE];

        const c = document.createElement('canvas');
        c.width = W; c.height = H;
        const g = c.getContext('2d');
        g.fillStyle = '#ffffff';
        g.fillRect(0, 0, W, H);

        for (let r = 0; r < ROWS; r++) {
            for (let col = 0; col < COLS; col++) {
                const poly = M.cellFanPolygon(col, r, DESIGN_ANGLE).map(([x, y]) => toCanvas(x, y));
                const color = grid[r][col];
                g.beginPath();
                poly.forEach(([x, y], i) => i === 0 ? g.moveTo(x, y) : g.lineTo(x, y));
                g.closePath();
                if (color) { g.fillStyle = color; g.fill(); }
                g.strokeStyle = 'rgba(91,75,214,0.45)';
                g.lineWidth = 1.2;
                g.stroke();
            }
        }
        g.fillStyle = '#5b4bd6';
        g.font = 'bold 20px "Pretendard Variable", sans-serif';
        g.textAlign = 'center'; g.textBaseline = 'middle';
        for (let col = 0; col < COLS; col++) {
            const { u } = M.cellUV(col, ROWS - 1);
            const p = M.fanPoint(u, 1.05, DESIGN_ANGLE);
            const [x, y] = toCanvas(p.x, p.y);
            g.fillText(String(col + 1), x, y);
        }
        for (let r = 0; r < ROWS; r++) {
            const { v } = M.cellUV(0, r);
            const p = M.fanPoint(-0.02, v, DESIGN_ANGLE);
            const [x, y] = toCanvas(p.x, p.y);
            g.fillText(ROW_LABELS[r], x, y);
        }

        // 거울을 세울 자리 — 점선 원
        g.setLineDash([10, 8]);
        g.strokeStyle = 'rgba(70,70,80,0.65)';
        g.lineWidth = 2.5;
        g.beginPath();
        g.arc(originX, originY, M.R_CYL * SCALE, 0, Math.PI * 2);
        g.stroke();
        g.setLineDash([]);
        g.fillStyle = 'rgba(70,70,80,0.78)';
        g.font = 'bold 17px "Pretendard Variable", sans-serif';
        g.fillText('원통 거울', originX, originY - 12);
        g.fillText('세우는 자리', originX, originY + 12);

        // 안내 문구
        g.textAlign = 'left'; g.fillStyle = '#26313f';
        g.font = 'bold 22px "Pretendard Variable", sans-serif';
        g.fillText('아나모르포시스 전개도 — 원통 거울 왜상', 24, 36);
        g.font = '15px "Pretendard Variable", sans-serif';
        g.fillStyle = '#5b6878';
        g.fillText('점선 원 자리에 원통 모양 컵·캔을 세우고, 45° 각도(비스듬히)에서 내려다보세요.', 24, 62);
        g.strokeStyle = '#d3dae3'; g.lineWidth = 2; g.strokeRect(1, 1, W - 2, H - 2);

        c.toBlob(blob => {
            if (!blob) { showToast('내보내기에 실패했어요.'); return; }
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const d = new Date();
            const z = n => String(n).padStart(2, '0');
            a.href = url;
            a.download = `아나모르포시스_전개도_${d.getFullYear()}${z(d.getMonth() + 1)}${z(d.getDate())}.png`;
            document.body.appendChild(a); a.click(); a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 5000);
            showToast('인쇄용 전개도를 저장했어요!');
        }, 'image/png');
    }
    document.getElementById('btnPrint').addEventListener('click', exportParchmentPNG);

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

    // ---- 3D 돌려 보기: 켜져 있는 동안은 거울 위를 끌면(드래그) 원기둥을 좌우로
    // 돌려 볼 수 있다. renderCyl의 azimuthDeg가 매 화면 열의 "원래 방위각"을
    // 밀어내서, 부채꼴 그림은 그대로 둔 채 비친 모습만 돌아간다.
    const btnView3d = document.getElementById('btnView3d');
    const fanDrawHint = document.getElementById('fanDrawHint');
    btnView3d.addEventListener('click', () => {
        view3d = !view3d;
        btnView3d.classList.toggle('btn-purple', view3d);
        btnView3d.textContent = view3d ? '🔄 3D 끄기' : '🔄 3D 돌려 보기';
        cylCanvas.style.pointerEvents = view3d ? 'auto' : 'none';
        cylCanvas.style.cursor = view3d ? 'grab' : '';
        fanDrawHint.textContent = view3d
            ? '🔄 거울 위를 좌우로 끌어서 돌려 보세요! (원래 각도로 돌아오려면 "3D 끄기")'
            : '💡 부채꼴 종이 위에 직접 그려도 거울 속에 바로 나타나요!';
        if (!view3d) { azimuthDeg = 0; redrawAll(); }
    });
    let rotating = false, rotateLastX = 0;
    cylCanvas.addEventListener('pointerdown', (e) => {
        if (!view3d) return;
        rotating = true;
        rotateLastX = e.clientX;
        cylCanvas.setPointerCapture(e.pointerId);
        cylCanvas.style.cursor = 'grabbing';
    });
    cylCanvas.addEventListener('pointermove', (e) => {
        if (!rotating) return;
        const dx = e.clientX - rotateLastX;
        rotateLastX = e.clientX;
        azimuthDeg = Math.max(-80, Math.min(80, azimuthDeg - dx * 0.5));
        redrawAll();
    });
    function endRotate() { rotating = false; if (view3d) cylCanvas.style.cursor = 'grab'; }
    cylCanvas.addEventListener('pointerup', endRotate);
    cylCanvas.addEventListener('pointercancel', endRotate);

    function updateAngleUI() {
        angleVal.textContent = eyeAngle + '°';
        angleVal2.textContent = eyeAngle + '°';
        const hint = document.getElementById('angleHint');
        const diff = eyeAngle - DESIGN_ANGLE;
        if (Math.abs(diff) < 1) {
            hint.innerHTML = `이 종이는 <b>${DESIGN_ANGLE}°</b>에서 보도록 설계되었어요. 지금 <b>${eyeAngle}°</b>에서 보고 있으니, 거울 속 그림이 정확하게 보여요.`;
        } else if (diff > 0) {
            hint.innerHTML = `이 종이는 <b>${DESIGN_ANGLE}°</b>에서 보도록 설계되었는데, 지금은 그보다 높은 <b>${eyeAngle}°</b>에서 보고 있어요. 그래서 거울 속 그림의 윗부분(F행에서 먼 쪽)이 거울 밖으로 밀려나 잘려 보여요.`;
        } else {
            hint.innerHTML = `이 종이는 <b>${DESIGN_ANGLE}°</b>에서 보도록 설계되었는데, 지금은 그보다 낮은 <b>${eyeAngle}°</b>에서 보고 있어요. 그래서 거울 속 그림 전체가 거울 밑동 쪽에 납작하게 눌려 보여요.`;
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
    const miniPreviewL = document.getElementById('miniPreviewL');
    const mctxL = miniPreviewL.getContext('2d');
    const MINI_W = 160, MINI_H = 120;
    miniPreviewL.width = MINI_W; miniPreviewL.height = MINI_H;

    // 여러 광선을 동시에 보여준다(최대 5개, 오래된 것부터 밀려남) — 각 점마다
    // 다른 색으로, 가장 최근 것만 입사각/반사각 표시와 법선을 함께 그린다.
    const RAY_MAX = 5;
    const RAY_COLORS = ['#e2434f', '#f5a623', '#2a6fbe', '#3fae5a', '#8558d8'];
    let rays = []; // { S:{x,y} } in fanCanvasL pixel coords, oldest first
    let photonT = 0;
    let photonRunning = false;

    // "눈에 보이는 거울 속 그림" — 모눈종이(= 거울 속에서 바르게 보일 그림)를
    // 작게 다시 그리고, 지금까지 누른 점들이 그 그림의 어느 자리(u,v)에
    // 해당하는지 각자의 색 점으로 표시한다. 거울이 그림을 "바로잡아 보여준다"는
    // 걸 직접 확인할 수 있다.
    function drawMiniPreview(dots) {
        mctxL.clearRect(0, 0, MINI_W, MINI_H);
        mctxL.fillStyle = '#fffaf3';
        mctxL.fillRect(0, 0, MINI_W, MINI_H);
        const cw = MINI_W / COLS, ch = MINI_H / ROWS;
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const color = grid[r][c];
                if (color) { mctxL.fillStyle = color; mctxL.fillRect(c * cw, r * ch, cw, ch); }
            }
        }
        mctxL.strokeStyle = 'rgba(91,75,214,0.3)';
        mctxL.lineWidth = 1;
        for (let c = 1; c < COLS; c++) { mctxL.beginPath(); mctxL.moveTo(c * cw, 0); mctxL.lineTo(c * cw, MINI_H); mctxL.stroke(); }
        for (let r = 1; r < ROWS; r++) { mctxL.beginPath(); mctxL.moveTo(0, r * ch); mctxL.lineTo(MINI_W, r * ch); mctxL.stroke(); }
        (dots || []).forEach(d => {
            mctxL.fillStyle = d.color;
            mctxL.beginPath();
            mctxL.arc(d.u * MINI_W, (1 - d.v) * MINI_H, 4, 0, Math.PI * 2);
            mctxL.fill();
            mctxL.strokeStyle = 'white'; mctxL.lineWidth = 1.5; mctxL.stroke();
        });
    }

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

    // 점 하나에 대한 반사 정보를 계산한다 (실패하면 null)
    function computeRay(S, color) {
        const result = M.reflectOffCircle(S, EYE_POS, FAN_ORIGIN, CYL_RADIUS_PX, M.THETA_SPAN_DEG);
        if (!result || !result.valid) return null;
        const dxWorld = (S.x - FAN_ORIGIN.x) / FAN_PX_PER_UNIT;
        const dyWorld = (S.y - FAN_ORIGIN.y) / FAN_PX_PER_UNIT;
        const inv = M.fanInverse(dxWorld, dyWorld);
        return { S, P: result.point, result, inv, color };
    }

    function drawRayPath(ctx, ray, isLast) {
        const { S, P, color } = ray;
        if (isLast) {
            const nFar = { x: FAN_ORIGIN.x + (P.x - FAN_ORIGIN.x) * 1.5, y: FAN_ORIGIN.y + (P.y - FAN_ORIGIN.y) * 1.5 };
            ctx.save();
            ctx.setLineDash([4, 4]);
            ctx.strokeStyle = '#94a3b8';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(FAN_ORIGIN.x, FAN_ORIGIN.y);
            ctx.lineTo(nFar.x, nFar.y);
            ctx.stroke();
            ctx.restore();
            ctx.fillStyle = '#78716c';
            ctx.font = '11px "Pretendard Variable", sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('법선', nFar.x + 4, nFar.y);
        }
        ctx.save();
        ctx.globalAlpha = isLast ? 1 : 0.55;
        ctx.strokeStyle = color;
        ctx.lineWidth = isLast ? 2.5 : 2;
        ctx.beginPath(); ctx.moveTo(S.x, S.y); ctx.lineTo(P.x, P.y); ctx.stroke();           // 입사광
        ctx.beginPath(); ctx.moveTo(P.x, P.y); ctx.lineTo(EYE_POS.x, EYE_POS.y); ctx.stroke(); // 반사광
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(S.x, S.y, isLast ? 5 : 4, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'white'; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.restore();
    }

    // 클릭한 점에서 출발해 거울에서 반사되어 눈까지 가는 빛 알갱이가 계속
    // 움직이는 것처럼 보이도록, 애니메이션 프레임마다 그 위치만 다시 계산한다.
    function photonPos(ray, t) {
        const L1 = Math.hypot(ray.P.x - ray.S.x, ray.P.y - ray.S.y);
        const L2 = Math.hypot(EYE_POS.x - ray.P.x, EYE_POS.y - ray.P.y);
        const d = t * (L1 + L2);
        if (d < L1) { const f = d / L1; return { x: ray.S.x + (ray.P.x - ray.S.x) * f, y: ray.S.y + (ray.P.y - ray.S.y) * f }; }
        const f = (d - L1) / L2;
        return { x: ray.P.x + (EYE_POS.x - ray.P.x) * f, y: ray.P.y + (EYE_POS.y - ray.P.y) * f };
    }
    function drawPhotonGlow(ray) {
        const pos = photonPos(ray, photonT);
        const gl = rctxL.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 12);
        gl.addColorStop(0, 'rgba(255,255,200,1)');
        gl.addColorStop(0.4, 'rgba(255,230,80,0.85)');
        gl.addColorStop(1, 'rgba(255,230,80,0)');
        rctxL.fillStyle = gl;
        rctxL.beginPath(); rctxL.arc(pos.x, pos.y, 12, 0, Math.PI * 2); rctxL.fill();
    }

    function renderRays() {
        rctxL.clearRect(0, 0, FAN_W, FAN_H);
        const computed = rays.map((S, i) => computeRay(S, RAY_COLORS[i % RAY_COLORS.length])).filter(Boolean);
        computed.forEach((ray, i) => drawRayPath(rctxL, ray, i === computed.length - 1));
        const last = computed[computed.length - 1];
        if (last) drawPhotonGlow(last);
        drawEyeMarker(rctxL);

        drawMiniPreview(computed.filter(r => r.inv.inBounds).map(r => ({ u: r.inv.u, v: r.inv.v, color: r.color })));

        const infoBox = document.getElementById('rayInfoBox');
        if (!last) {
            infoBox.innerHTML = rays.length
                ? '<p class="angle-readout-hint">이 위치에서는 거울에 반사되어 눈까지 닿지 않아요. 거울에 더 가까운 곳을 눌러보세요.</p>'
                : '<p class="angle-readout-hint">아직 누른 점이 없어요. 왼쪽 종이를 눌러보세요.</p>';
        } else {
            const { inv, result } = last;
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
        return computed;
    }

    function photonTick() {
        if (!photonRunning) return;
        photonT = (photonT + 0.012) % 1;
        if (activeTab === 'light' && rays.length) renderRays();
        requestAnimationFrame(photonTick);
    }
    function ensurePhotonRunning() {
        if (photonRunning) return;
        photonRunning = true;
        requestAnimationFrame(photonTick);
    }

    function redrawLightTab() {
        renderFan(fctxL, grid, true); // 빛의 경로 탭은 늘 위에서 내려다본 평면도로 고정
        renderCyl(cctxL, grid, true, eyeAngle);
        renderRays();
        if (rays.length) ensurePhotonRunning();
    }

    fanCanvasL.addEventListener('pointerdown', (e) => {
        const rect = fanCanvasL.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (FAN_W / rect.width);
        const y = (e.clientY - rect.top) * (FAN_H / rect.height);
        rays.push({ x, y });
        if (rays.length > RAY_MAX) rays.shift();
        renderRays();
        ensurePhotonRunning();
    });

    document.getElementById('btnClearRay').addEventListener('click', () => {
        rays = [];
        photonRunning = false;
        renderRays();
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
        renderFan(fctxQ, q.grid, true); // 퀴즈 탭도 평면도로 고정(슬라이더가 없다)
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
        else photonRunning = false; // 빛의 경로 탭을 벗어나면 애니메이션도 멈춘다
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
