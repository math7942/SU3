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
        2: '2개의 조각을 사용해서 정사각형을 만들어 보세요. 방법이 두 가지 있어요 — 조각 4개를 모두 꺼내서 한 화면에 정사각형 두 개를 동시에 만들어봐도 좋아요!',
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

    // ---- 마우스로 회전하는 손잡이 ----
    function pieceRadius(piece) {
        const [cx, cy] = centroidOf(piece.verts);
        return Math.max(...piece.verts.map(([x, y]) => Math.hypot(x - cx, y - cy)));
    }
    function handleWorldPos(piece, state) {
        const r = pieceRadius(piece) + 0.5;
        const theta = (state.rot - 90) * Math.PI / 180;
        return [state.x + r * Math.cos(theta), state.y + r * Math.sin(theta)];
    }
    function drawHandle(piece, state) {
        const [hx, hy] = handleWorldPos(piece, state);
        const [chx, chy] = worldToCanvas(hx, hy);
        const [ccx, ccy] = worldToCanvas(state.x, state.y);
        ctx.beginPath();
        ctx.moveTo(ccx, ccy);
        ctx.lineTo(chx, chy);
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 2]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(chx, chy, 11, 0, Math.PI * 2);
        ctx.fillStyle = '#a855f7';
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = 'white';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('↻', chx, chy);
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
        if (selectedId && pieceStates[selectedId].placed) {
            drawHandle(byId(selectedId), pieceStates[selectedId]);
        }
        document.getElementById('selectedVal').textContent = selectedId ? byId(selectedId).name : '없음';
        const usedCount = placedOrder.filter(id => pieceStates[id].placed).length;
        document.getElementById('usedCountVal').textContent = `${usedCount} / 7`;
    }

    // ---- 조각 보관함 ----
    // 모든 조각을 "같은 크기의 뷰박스" 안에 중앙 정렬해서 그리면, 실제 조각들끼리의
    // 상대적인 크기 차이(큰 삼각형 vs 작은 삼각형)가 보관함에서도 그대로 보인다.
    const TRAY_MAX_DIM = Math.max(...TANGRAM_PIECES.map(p => {
        const xs = p.verts.map(v => v[0]), ys = p.verts.map(v => v[1]);
        return Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
    }));
    function pieceSvgMarkup(piece) {
        const xs = piece.verts.map(v => v[0]), ys = piece.verts.map(v => v[1]);
        const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
        const w = maxX - minX, h = maxY - minY;
        const pad = 0.15 * TRAY_MAX_DIM;
        const vb = TRAY_MAX_DIM + 2 * pad;
        const offX = (vb - w) / 2 - minX;
        const offY = (vb - h) / 2 - minY;
        const pts = piece.verts.map(([x, y]) => `${(x + offX).toFixed(3)},${(y + offY).toFixed(3)}`).join(' ');
        return `<svg viewBox="0 0 ${vb.toFixed(3)} ${vb.toFixed(3)}"><polygon points="${pts}" fill="${piece.color}" stroke="#1e293b" stroke-width="0.06"/></svg>`;
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
        const cascade = placeCascade % 5;
        placeCascade++;
        // 판의 위쪽 왼쪽에 계단식으로 배치해서 기존 조각과 겹치지 않게
        pieceStates[id] = { placed: true, x: -1.2 + cascade * 0.4, y: -0.8 - (cascade % 3) * 0.4, rot: 0, flip: false };
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

        // 회전 손잡이를 잡았다면 회전 모드로 드래그 시작 (선택된 조각에만 손잡이가 보인다)
        if (selectedId && pieceStates[selectedId].placed) {
            const st = pieceStates[selectedId];
            const [hx, hy] = handleWorldPos(byId(selectedId), st);
            if (Math.hypot(wx - hx, wy - hy) < 0.35) {
                dragging = { id: selectedId, mode: 'rotate' };
                canvas.setPointerCapture(e.pointerId);
                canvas.style.cursor = 'grabbing';
                render();
                return;
            }
        }

        const hitId = pickPieceAt([wx, wy]);
        selectedId = hitId;
        if (hitId) {
            const st = pieceStates[hitId];
            dragging = { id: hitId, mode: 'move', offX: wx - st.x, offY: wy - st.y };
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
        if (dragging.mode === 'rotate') {
            const theta = Math.atan2(wy - st.y, wx - st.x);
            let deg = theta * 180 / Math.PI + 90;
            deg = ((deg % 360) + 360) % 360;
            st.rot = deg;
        } else {
            st.x = wx - dragging.offX;
            st.y = wy - dragging.offY;
        }
        render();
    });
    function isPointOverTray(clientX, clientY) {
        const trayRect = document.getElementById('tray').getBoundingClientRect();
        return clientX >= trayRect.left && clientX <= trayRect.right && clientY >= trayRect.top && clientY <= trayRect.bottom;
    }
    function endDrag(e) {
        if (!dragging) return;
        const id = dragging.id;
        const mode = dragging.mode;
        if (mode === 'move' && e && isPointOverTray(e.clientX, e.clientY)) {
            dragging = null;
            canvas.style.cursor = 'grab';
            returnToTray(id);
            return;
        }
        if (mode === 'rotate') {
            const st = pieceStates[id];
            st.rot = ((Math.round(st.rot / 45) * 45) % 360 + 360) % 360;
        }
        trySnap(id);
        dragging = null;
        canvas.style.cursor = 'grab';
        render();
    }
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', () => endDrag(null));
    canvas.addEventListener('dblclick', (e) => {
        const [cx, cy] = canvasPointFromEvent(e);
        const [wx, wy] = canvasToWorld(cx, cy);
        const hitId = pickPieceAt([wx, wy]);
        if (hitId) returnToTray(hitId);
    });

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

    // 서로 맞닿아 있는(스냅으로 정확히 붙은) 조각들끼리 그룹으로 묶는다.
    // 이렇게 하면 작업 공간 안에 정사각형 여러 개를 동시에 만들어도 각각 따로 판정할 수 있다.
    function clusterPlacedPieces() {
        const ids = placedOrder.filter(id => pieceStates[id].placed);
        const parent = {};
        ids.forEach(id => { parent[id] = id; });
        function find(x) { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; }
        function union(a, b) { const ra = find(a), rb = find(b); if (ra !== rb) parent[ra] = rb; }
        const EPS = 0.12;
        const vertsCache = {};
        ids.forEach(id => { vertsCache[id] = transformVerts(byId(id), pieceStates[id]); });
        for (let i = 0; i < ids.length; i++) {
            for (let j = i + 1; j < ids.length; j++) {
                let touching = false;
                for (const a of vertsCache[ids[i]]) {
                    for (const b of vertsCache[ids[j]]) {
                        if (Math.hypot(a[0] - b[0], a[1] - b[1]) < EPS) { touching = true; break; }
                    }
                    if (touching) break;
                }
                if (touching) union(ids[i], ids[j]);
            }
        }
        const groups = {};
        ids.forEach(id => { const r = find(id); (groups[r] = groups[r] || []).push(id); });
        return Object.values(groups);
    }

    const stageFoundSolutions = {}; // stage -> Set('id1,id2,...')
    const stageGalleries = {}; // stage -> Array of {img, pieces, area}

    // ---- 갤러리 함수 ----
    function saveToGallery(clusterIds, result) {
        const imgData = canvas.toDataURL('image/png');
        const pieces = clusterIds.map(id => byId(id).name).join('+');
        const areaRounded = Math.round(result.area * 1000) / 1000;

        if (!stageGalleries[currentStage]) stageGalleries[currentStage] = [];
        stageGalleries[currentStage].push({ img: imgData, pieces, area: areaRounded });

        // localStorage에도 저장
        const key = `tangram_gallery_stage_${currentStage}`;
        localStorage.setItem(key, JSON.stringify(stageGalleries[currentStage]));

        renderGallery();
    }

    function renderGallery() {
        const container = document.getElementById('galleryContainer');
        const gallery = stageGalleries[currentStage] || [];

        if (gallery.length === 0) {
            container.innerHTML = '<p style="margin: 0; font-size: 0.78rem; color: #a78bfa; font-style: italic;">정사각형을 확인하면 여기에 저장됩니다</p>';
            return;
        }

        container.innerHTML = '';
        gallery.forEach((item, idx) => {
            const thumb = document.createElement('div');
            thumb.className = 'gallery-thumbnail';
            thumb.innerHTML = `
                <img src="${item.img}" alt="Success ${idx + 1}">
                <div class="tooltip">${item.pieces} (${item.area}cm²)</div>
            `;
            container.appendChild(thumb);
        });
    }

    function loadGalleryFromStorage() {
        for (let s = 1; s <= 7; s++) {
            const key = `tangram_gallery_stage_${s}`;
            const stored = localStorage.getItem(key);
            if (stored) {
                try {
                    stageGalleries[s] = JSON.parse(stored);
                } catch (e) {
                    console.error('Failed to load gallery for stage', s);
                }
            }
        }
        renderGallery();
    }

    document.getElementById('btnCheck').addEventListener('click', () => {
        const clusters = clusterPlacedPieces();
        if (clusters.length === 0) {
            showResult('아직 작업 공간에 조각이 없어요. 보관함에서 조각을 클릭해 올려보세요.', 'info');
            return;
        }
        let anyOverlap = false;
        const foundMsgs = [];
        clusters.forEach(clusterIds => {
            const placed = clusterIds.map(id => ({ piece: byId(id), state: pieceStates[id] }));
            const result = checkSquareAssembly(placed);
            if (result.valid) {
                const sig = clusterIds.slice().sort().join(',');
                if (!stageFoundSolutions[currentStage]) stageFoundSolutions[currentStage] = new Set();
                const isNew = !stageFoundSolutions[currentStage].has(sig);
                stageFoundSolutions[currentStage].add(sig);
                const areaRounded = Math.round(result.area * 1000) / 1000;
                foundMsgs.push(`${clusterIds.length}개(${clusterIds.map(id => byId(id).name).join('+')}) → 넓이 ${areaRounded}cm², 한 변 ${formatSqrt(result.area)}cm${isNew ? ' ✨새 방법!' : ''}`);
                // 갤러리에 저장
                saveToGallery(clusterIds, result);
            } else if (clusterIds.length >= 2 && result.reason === 'overlap') {
                anyOverlap = true;
            }
        });
        if (foundMsgs.length > 0) {
            stageSolved[currentStage] = true;
            renderStageBar();
            const total = stageFoundSolutions[currentStage].size;
            showResult(`🎉 ${foundMsgs.join(' · ')} (이 단계에서 지금까지 찾은 방법: ${total}가지)`, 'ok');
        } else if (anyOverlap) {
            showResult('조각이 서로 겹쳐 있어요. 겹치지 않게 옮겨보세요.', 'bad');
        } else {
            showResult('아직 정사각형이 없어요. 조각을 더 맞춰보세요.', 'bad');
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
        renderGallery();
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
    loadGalleryFromStorage();
    loadStage(1);
})();
