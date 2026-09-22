// ---- 탱그램 조각의 순수 기하 로직 (DOM에 의존하지 않음: Node에서 그대로 테스트 가능) ----
// 4cm x 4cm 정사각형을 표준 7조각 탱그램으로 자른 좌표 (x 오른쪽, y 아래쪽, 단위=1cm).
const TANGRAM_PIECES = [
    { id: 'smallA', name: '작은 삼각형 1', color: '#ef4444', verts: [[0, 0], [2, 0], [1, 1]] },
    { id: 'medium', name: '중간 삼각형', color: '#22c55e', verts: [[2, 0], [4, 0], [4, 2]] },
    { id: 'para', name: '평행사변형', color: '#14b8a6', verts: [[3, 1], [4, 2], [4, 4], [3, 3]] },
    { id: 'square', name: '정사각형 조각', color: '#8b5cf6', verts: [[1, 1], [2, 0], [3, 1], [2, 2]] },
    { id: 'smallB', name: '작은 삼각형 2', color: '#f97316', verts: [[2, 2], [3, 3], [3, 1]] },
    { id: 'large1', name: '큰 삼각형 1', color: '#3b82f6', verts: [[0, 4], [4, 4], [2, 2]] },
    { id: 'large2', name: '큰 삼각형 2', color: '#eab308', verts: [[0, 0], [0, 4], [2, 2]] },
];

function polyArea(verts) {
    let s = 0;
    for (let i = 0; i < verts.length; i++) {
        const [x1, y1] = verts[i];
        const [x2, y2] = verts[(i + 1) % verts.length];
        s += x1 * y2 - x2 * y1;
    }
    return Math.abs(s) / 2;
}

function centroidOf(verts) {
    let cx = 0, cy = 0;
    verts.forEach(([x, y]) => { cx += x; cy += y; });
    return [cx / verts.length, cy / verts.length];
}

// piece 배치 상태(x,y = 작업공간에서의 중심 좌표, rot = 도 단위 회전, flip = 좌우 반전)를 적용해
// 실제 다각형 꼭짓점 좌표를 계산한다.
function transformVerts(piece, state) {
    const [cx, cy] = centroidOf(piece.verts);
    const rad = (state.rot || 0) * Math.PI / 180;
    const cos = Math.cos(rad), sin = Math.sin(rad);
    return piece.verts.map(([x, y]) => {
        let dx = x - cx;
        let dy = y - cy;
        if (state.flip) dx = -dx;
        const rx = dx * cos - dy * sin;
        const ry = dx * sin + dy * cos;
        return [rx + state.x, ry + state.y];
    });
}

function pointInPoly(pt, verts) {
    const [px, py] = pt;
    let inside = false;
    for (let i = 0, j = verts.length - 1; i < verts.length; j = i++) {
        const [xi, yi] = verts[i];
        const [xj, yj] = verts[j];
        const intersect = ((yi > py) !== (yj > py)) &&
            (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

// Andrew's monotone chain convex hull. points: [[x,y],...] -> hull points in CCW order.
function convexHull(points) {
    const pts = points.slice().sort((a, b) => (a[0] - b[0]) || (a[1] - b[1]));
    const uniq = [];
    pts.forEach(p => {
        if (!uniq.length || Math.abs(uniq[uniq.length - 1][0] - p[0]) > 1e-9 || Math.abs(uniq[uniq.length - 1][1] - p[1]) > 1e-9) {
            uniq.push(p);
        }
    });
    if (uniq.length < 3) return uniq;
    const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lower = [];
    for (const p of uniq) {
        while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
        lower.push(p);
    }
    const upper = [];
    for (let i = uniq.length - 1; i >= 0; i--) {
        const p = uniq[i];
        while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
        upper.push(p);
    }
    lower.pop(); upper.pop();
    return lower.concat(upper);
}

// hull(볼록다각형 꼭짓점 목록)이 "정사각형"인지 판정. tol = 허용 오차(단위: cm 또는 cm^2 비율).
function isSquareHull(hull, tol) {
    if (hull.length !== 4) return false;
    const sides = [];
    for (let i = 0; i < 4; i++) {
        const [x1, y1] = hull[i];
        const [x2, y2] = hull[(i + 1) % 4];
        sides.push(Math.hypot(x2 - x1, y2 - y1));
    }
    const avg = sides.reduce((a, b) => a + b, 0) / 4;
    if (avg < 1e-6) return false;
    for (const s of sides) if (Math.abs(s - avg) > tol * avg) return false;
    // 인접한 두 변이 직각인지 확인 (정사각형이면 나머지도 자동으로 직각)
    for (let i = 0; i < 4; i++) {
        const a = hull[i], b = hull[(i + 1) % 4], c = hull[(i + 2) % 4];
        const v1 = [a[0] - b[0], a[1] - b[1]];
        const v2 = [c[0] - b[0], c[1] - b[1]];
        const dot = v1[0] * v2[0] + v1[1] * v2[1];
        const len1 = Math.hypot(...v1), len2 = Math.hypot(...v2);
        const cosAngle = dot / (len1 * len2);
        if (Math.abs(cosAngle) > tol * 3) return false;
    }
    return true;
}

// area의 제곱근을 k*sqrt(m) 형태(m은 더는 제곱인수가 없는 가장 간단한 형태)로 표현.
function simplifySqrt(area) {
    const rounded = Math.round(area);
    let coeff = 1, radicand = rounded;
    for (let k = Math.floor(Math.sqrt(rounded)); k >= 1; k--) {
        if (rounded % (k * k) === 0) { coeff = k; radicand = rounded / (k * k); break; }
    }
    return { coeff, radicand };
}

function formatSqrt(area) {
    const { coeff, radicand } = simplifySqrt(area);
    if (radicand === 1) return String(coeff);
    return coeff === 1 ? `√${radicand}` : `${coeff}√${radicand}`;
}

// 배치된 조각들(각각 {piece, state})이 정확히 "정사각형 하나"를 이루는지 검사.
// 반환: { valid, reason, area, side }
function checkSquareAssembly(placed, tol) {
    tol = tol || 0.05;
    if (placed.length === 0) return { valid: false, reason: 'empty' };

    const allVerts = [];
    const polys = placed.map(({ piece, state }) => {
        const v = transformVerts(piece, state);
        allVerts.push(...v);
        return v;
    });

    // 겹침 검사: 각 조각의 중심점과 꼭짓점-중심 중점들이 다른 조각 내부에 들어있으면 겹친 것으로 판단.
    for (let i = 0; i < polys.length; i++) {
        const samplePts = [];
        const c = centroidOf(polys[i]);
        samplePts.push(c);
        polys[i].forEach(v => samplePts.push([(v[0] + c[0]) / 2, (v[1] + c[1]) / 2]));
        for (let j = 0; j < polys.length; j++) {
            if (i === j) continue;
            for (const pt of samplePts) {
                if (pointInPoly(pt, polys[j])) {
                    return { valid: false, reason: 'overlap' };
                }
            }
        }
    }

    const totalArea = placed.reduce((s, { piece }) => s + polyArea(piece.verts), 0);
    const hull = convexHull(allVerts);
    const hullArea = polyArea(hull);

    if (Math.abs(hullArea - totalArea) > tol * totalArea) {
        return { valid: false, reason: 'gap', hullArea, totalArea };
    }
    if (!isSquareHull(hull, tol)) {
        return { valid: false, reason: 'not-square', hullArea, totalArea };
    }
    return { valid: true, area: totalArea, side: Math.sqrt(totalArea) };
}

if (typeof module !== 'undefined') {
    module.exports = {
        TANGRAM_PIECES, polyArea, centroidOf, transformVerts, pointInPoly,
        convexHull, isSquareHull, simplifySqrt, formatSqrt, checkSquareAssembly,
    };
}
