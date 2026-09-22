// ---- 탱그램 시뮬레이터 UI 로직 (tangram-geometry.js의 순수 함수들을 사용) ----
(function () {
    const byId = id => TANGRAM_PIECES.find(p => p.id === id);
    const SCALE = 42;
    const OFFX = 280, OFFY = 210;
    const SNAP_THRESHOLD = 0.6;

    function worldToCanvas(x, y) { return [x * SCALE + OFFX, y * SCALE + OFFY]; }
    function canvasToWorld(px, py) { return [(px - OFFX) / SCALE, (py - OFFY) / SCALE]; }

    // ---- 상태 ----
    const pieceStates = {};
    TANGRAM_PIECES.forEach(p => { pieceStates[p.id] = { placed: false, x: 0, y: 0, rot: 0, flip: false }; });
    let placedOrder = []; // 배치된 순서 (위에 그려질 순서)
    let selectedId = null;
    let currentStage = 1;
    const stageSolved = {};
    let placeCascade = 0;
    let dragging = null; // { id, offX, offY }

    const STAGE_DESC = {
        1: '1개의 조각만 사용해서 정사각형을 만들어 보세요.',
        2: '2개의 조각을 사용해서 정사각형을 만들어 보세요. (방법이 두 가지 있어요!)',
        3: '3개의 조각을 사용해서 정사각형을 만들어 보세요.',
        4: '4개의 조각을 사용해서 정사각형을 만들어 보세요. (방법이 여러 가지예요!)',
        5: '5개의 조각을 사용해서 정사각형을 만들어 보세요.',
        6: '6개의 조각으로도 될까요? 최선을 다해 시도해보세요.',
        7: '7개, 즉 모든 조각을 사용해서 정사각형을 만들어 보세요.',
    };

    // ---- 캔버스 ----
    const canvas = document.getElementById('workCanvas');
    const ctx = canvas.getContext('2d');

    function drawPiece(piece, state, highlight) {
        const verts = transformVerts(piece, state).map(([x, y]) => worldToCanvas(x, y));
        ctx.beginPath();
        verts.forEach(([x, y], i) => { if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
        ctx.closePath();
        ctx.fillStyle = piece.color;
        ctx.globalAlpha = 0.85;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = highlight ? '#7e22ce' : '#1e293b';
        ctx.lineWidth = highlight ? 3 : 1.3;
        ctx.stroke();
    }

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fefaff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // 은은한 격자
        ctx.strokeStyle = '#f3e8ff'; ctx.lineWidth = 1;
        for (let gx = OFFX % SCALE; gx < canvas.width; gx += SCALE) {
            ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, canvas.height); ctx.stroke();
        }
        for (let gy = OFFY % SCALE; gy < canvas.height; gy += SCALE) {
            ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(canvas.width, gy); ctx.stroke();
        }
        placedOrder.forEach(id => {
            const st = pieceStates[id];
            if (!st.placed) return;
            drawPiece(byId(id), st, id === selectedId);
        });
        document.getElementById('selectedVal').textContent = selectedId ? byId(selectedId).name : '없음';
        const usedCount = placedOrder.filter(id => pieceStates[id].placed).length;
        document.getElementById('usedCountVal').textContent = `${usedCount} / ${currentStage}`;
    }

    // ---- 조각 보관함 ----
    function pieceSvgMarkup(piece) {
        const xs = piece.verts.map(v => v[0]), ys = piece.verts.map(v => v[1]);
        const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
        const w = Math.max(maxX - minX, 0.2), h = Math.max(maxY - minY, 0.2);
        const pad = 0.18 * Math.max(w, h);
        const vbW = w + 2 * pad, vbH = h + 2 * pad;
        const pts = piece.verts.map(([x, y]) => `${(x - minX + pad).toFixed(3)},${(y - minY + pad).toFixed(3)}`).join(' ');
        return `<svg viewBox="0 0 ${vbW.toFixed(3)} ${vbH.toFixed(3)}"><polygon points="${pts}" fill="${piece.color}" stroke="#1e293b" stroke-width="0.06"/></svg>`;
    }

    function renderTray() {
        const tray = document.getElementById('tray');
        tray.innerHTML = '';
        TANGRAM_PIECES.forEach(piece => {
            const used = pieceStates[piece.id].placed;
            const slot = document.createElement('div');
            slot.className = 'tray-slot' + (used ? ' used' : '');
            slot.dataset.id = piece.id;
            slot.innerHTML = pieceSvgMarkup(piece) + `<span class="piece-label">${piece.name}</span>`;
            if (!used) {
                slot.addEventListener('click', () => placeFromTray(piece.id));
            }
            tray.appendChild(slot);
        });
    }

    function placeFromTray(id) {
        const placedNow = placedOrder.filter(pid => pieceStates[pid].placed).length;
        if (placedNow >= currentStage) {
            showResult(`이번 단계는 조각 ${currentStage}개만 사용할 수 있어요. 먼저 다른 조각을 보관함으로 돌려보내 보세요.`, 'bad');
            return;
        }
        const cascade = placeCascade % 5;
        placeCascade++;
        pieceStates[id] = { placed: true, x: (cascade - 2) * 0.5, y: (cascade % 2) * 0.5, rot: 0, flip: false };
        if (!placedOrder.includes(id)) placedOrder.push(id);
        else { placedOrder = placedOrder.filter(x => x !== id); placedOrder.push(id); }
        selectedId = id;
        trySnap(id);
        renderTray();
        render();
    }

    function returnToTray(id) {
        if (!id) return;
        pieceStates[id].placed = false;
        if (selectedId === id) selectedId = null;
        renderTray();
        render();
    }

    // ---- 스냅 ----
    function trySnap(id) {
        const piece = byId(id);
        const state = pieceStates[id];
        const myVerts = transformVerts(piece, state);
        let best = null;
        placedOrder.forEach(otherId => {
            if (otherId === id || !pieceStates[otherId].placed) return;
            const otherVerts = transformVerts(byId(otherId), pieceStates[otherId]);
            myVerts.forEach(mv => {
                otherVerts.forEach(ov => {
                    const dist = Math.hypot(mv[0] - ov[0], mv[1] - ov[1]);
                    if (dist < SNAP_THRESHOLD && (!best || dist < best.dist)) {
                        best = { dist, dx: ov[0] - mv[0], dy: ov[1] - mv[1] };
                    }
                });
            });
        });
        if (best) {
            state.x += best.dx;
            state.y += best.dy;
        } else {
            state.x = Math.round(state.x * 4) / 4;
            state.y = Math.round(state.y * 4) / 4;
        }
    }

    // ---- 드래그 ----
    function pickPieceAt(worldPt) {
        for (let i = placedOrder.length - 1; i >= 0; i--) {
            const id = placedOrder[i];
            if (!pieceStates[id].placed) continue;
            const verts = transformVerts(byId(id), pieceStates[id]);
            if (pointInPoly(worldPt, verts)) return id;
        }
        return null;
    }

    function canvasPointFromEvent(e) {
        const rect = canvas.getBoundingClientRect();
        const cx = (e.clientX - rect.left) * (canvas.width / rect.width);
        const cy = (e.clientY - rect.top) * (canvas.height / rect.height);
        return [cx, cy];
    }

    canvas.addEventListener('pointerdown', (e) => {
        const [cx, cy] = canvasPointFromEvent(e);
        const [wx, wy] = canvasToWorld(cx, cy);
        const hitId = pickPieceAt([wx, wy]);
        selectedId = hitId;
        if (hitId) {
            const st = pieceStates[hitId];
            dragging = { id: hitId, offX: wx - st.x, offY: wy - st.y };
            canvas.setPointerCapture(e.pointerId);
            canvas.style.cursor = 'grabbing';
        }
        render();
    });
    canvas.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        const [cx, cy] = canvasPointFromEvent(e);
        const [wx, wy] = canvasToWorld(cx, cy);
        const st = pieceStates[dragging.id];
        st.x = wx - dragging.offX;
        st.y = wy - dragging.offY;
        render();
    });
    function endDrag() {
        if (!dragging) return;
        trySnap(dragging.id);
        dragging = null;
        canvas.style.cursor = 'grab';
        render();
    }
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);

    // ---- 버튼 ----
    document.getElementById('btnRotate').addEventListener('click', () => {
        if (!selectedId) return;
        const st = pieceStates[selectedId];
        st.rot = (st.rot + 45) % 360;
        trySnap(selectedId);
        render();
    });
    document.getElementById('btnFlip').addEventListener('click', () => {
        if (!selectedId) return;
        const st = pieceStates[selectedId];
        st.flip = !st.flip;
        trySnap(selectedId);
        render();
    });
    document.getElementById('btnReturn').addEventListener('click', () => returnToTray(selectedId));
    document.getElementById('btnResetStage').addEventListener('click', () => loadStage(currentStage));

    function showResult(msg, type) {
        const el = document.getElementById('resultBanner');
        el.textContent = msg;
        el.className = 'result-banner ' + type;
    }

    document.getElementById('btnCheck').addEventListener('click', () => {
        const placedIds = placedOrder.filter(id => pieceStates[id].placed);
        if (placedIds.length !== currentStage) {
            showResult(`지금 ${placedIds.length}개를 사용 중이에요. ${currentStage}단계는 정확히 ${currentStage}개를 사용해야 해요.`, 'bad');
            return;
        }
        const placed = placedIds.map(id => ({ piece: byId(id), state: pieceStates[id] }));
        const result = checkSquareAssembly(placed);
        if (result.valid) {
            const areaRounded = Math.round(result.area * 1000) / 1000;
            showResult(`🎉 정사각형 완성! 넓이 = ${areaRounded}cm², 한 변 = ${formatSqrt(result.area)}cm (=√${areaRounded}cm)`, 'ok');
            stageSolved[currentStage] = true;
            renderStageBar();
        } else if (result.reason === 'overlap') {
            showResult('조각이 서로 겹쳐 있어요. 겹치지 않게 옮겨보세요.', 'bad');
        } else {
            showResult('아직 정사각형이 아니에요. 빈틈이나 어긋난 부분이 없는지 확인해보세요.', 'bad');
        }
    });

    // ---- 단계 관리 ----
    function renderStageBar() {
        const bar = document.getElementById('stageBar');
        bar.innerHTML = '';
        for (let n = 1; n <= 7; n++) {
            const dot = document.createElement('div');
            dot.className = 'stage-dot' + (n === currentStage ? ' current' : '') + (stageSolved[n] ? ' solved' : '');
            dot.textContent = stageSolved[n] ? '✓' : String(n);
            dot.addEventListener('click', () => loadStage(n));
            bar.appendChild(dot);
        }
    }

    function loadStage(n) {
        currentStage = n;
        TANGRAM_PIECES.forEach(p => { pieceStates[p.id] = { placed: false, x: 0, y: 0, rot: 0, flip: false }; });
        placedOrder = [];
        selectedId = null;
        placeCascade = 0;
        document.getElementById('stageTitle').textContent = `${n}단계 — ${n}조각으로 정사각형 만들기`;
        document.getElementById('stageDesc').textContent = STAGE_DESC[n];
        document.getElementById('explainBox').style.display = (n === 6) ? 'block' : 'none';
        showResult('아래 조각 보관함에서 조각을 클릭해 작업 공간에 올려보세요.', 'info');
        document.getElementById('btnPrevStage').disabled = (n === 1);
        document.getElementById('btnNextStage').disabled = (n === 7);
        renderStageBar();
        renderTray();
        render();
    }

    document.getElementById('btnPrevStage').addEventListener('click', () => { if (currentStage > 1) loadStage(currentStage - 1); });
    document.getElementById('btnNextStage').addEventListener('click', () => { if (currentStage < 7) loadStage(currentStage + 1); });

    // ---- STEP1 소개 캔버스 + 퀴즈 ----
    function renderIntro() {
        const c = document.getElementById('introCanvas');
        const ictx = c.getContext('2d');
        const scale = 78, offx = 24, offy = 24;
        ictx.clearRect(0, 0, c.width, c.height);
        TANGRAM_PIECES.forEach(piece => {
            const verts = piece.verts.map(([x, y]) => [x * scale + offx, y * scale + offy]);
            ictx.beginPath();
            verts.forEach(([x, y], i) => { if (i === 0) ictx.moveTo(x, y); else ictx.lineTo(x, y); });
            ictx.closePath();
            ictx.fillStyle = piece.color;
            ictx.fill();
            ictx.strokeStyle = '#ffffff';
            ictx.lineWidth = 2;
            ictx.stroke();
        });
        // 모눈(1cm 간격 안쪽 눈금선) — 조각 위에 겹쳐 그려서 몇 칸인지 셀 수 있게 한다.
        ictx.strokeStyle = 'rgba(255,255,255,0.85)';
        ictx.lineWidth = 1;
        for (let i = 1; i < 4; i++) {
            ictx.beginPath();
            ictx.moveTo(offx + i * scale, offy);
            ictx.lineTo(offx + i * scale, offy + 4 * scale);
            ictx.stroke();
            ictx.beginPath();
            ictx.moveTo(offx, offy + i * scale);
            ictx.lineTo(offx + 4 * scale, offy + i * scale);
            ictx.stroke();
        }

        ictx.strokeStyle = '#1e293b';
        ictx.lineWidth = 2.5;
        ictx.strokeRect(offx, offy, 4 * scale, 4 * scale);
    }

    document.getElementById('btnCheckIntro').addEventListener('click', () => {
        const area = Number(document.getElementById('areaInput').value);
        const side = Number(document.getElementById('sideInput').value);
        const fb = document.getElementById('introFeedback');
        if (area === 16 && side === 4) {
            fb.textContent = '정답이에요! 모눈 4×4칸이니 넓이 16cm², 한 변 4cm입니다.';
            fb.className = 'quiz-feedback ok';
        } else {
            fb.textContent = '다시 확인해보세요 — 모눈이 가로세로 몇 칸인지 세어보세요.';
            fb.className = 'quiz-feedback bad';
        }
    });

    // ---- 힌트 토글 ----
    document.querySelectorAll('.hint-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById(btn.dataset.target).classList.toggle('shown');
        });
    });
    document.getElementById('btnRevealExplain').addEventListener('click', () => {
        document.getElementById('explainReveal').classList.toggle('shown');
    });

    // ---- 초기화 ----
    renderIntro();
    loadStage(1);
})();
