// ---- 원통 거울 아나모르포시스(왜상) 수학 모델 ----
// 정사각(직사각) 모눈에 그린 "원래 그림"을, 원통 거울 앞에 놓으면 그 그림으로
// 되비쳐 보이는 부채꼴 모양의 "왜상 그림"으로 변환한다.
//
// 핵심 아이디어: 모눈의 각 칸을 (u, v) 두 변수로 바꾼다.
//   u = 가로 위치 비율(0~1, 왼쪽→오른쪽)  -> 거울 둘레를 따라 도는 각도 θ로 대응
//   v = 세로 위치 비율(0~1, 위쪽=거울과 가까움→아래쪽=거울과 멀어짐) -> 거울에서부터의
//       거리(반지름) ρ로 대응
// 각도 θ는 u에 대해 그냥 비례(선형)하지만, 반지름 ρ는 v에 대해 탄젠트 함수로
// 늘어난다 — "보는 각도"가 가파를수록(위에서 내려다볼수록) 먼 부분일수록 종이 위에서는
// 훨씬 더 멀리 떨어뜨려 그려야 거울 속에서 비로소 고르게 보인다는, 원근 왜곡의 성질을
// 단순화해 표현한 것이다. (실제 광선 추적만큼 정밀하지는 않지만, 같은 수식으로
// 정그림→왜상→거울 재구성까지 한 번에 왕복되므로 그려본 그림이 거울 속에서 그대로
// 되살아나는 걸 눈으로 확인할 수 있다.)

(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory();
    } else {
        root.AnamorphMath = factory();
    }
})(typeof self !== 'undefined' ? self : this, function () {
    const COLS = 8;
    const ROWS = 6;
    const R_CYL = 1;            // 거울(원통) 반지름 = 1 단위
    const RHO_MAX_FACTOR = 4.6; // 부채꼴이 뻗어나가는 최대 반지름 = R_CYL * 이 값
    const THETA_SPAN_DEG = 168; // 부채꼴이 펼쳐지는 전체 각도 (거의 반원)

    // 종이(부채꼴) 위의 왜상은 "이 각도에서 보면 바르게 보이도록" 딱 한 번
    // 설계되어 고정된다. 보는 사람이 실제로는 다른 각도에서 보면(= 아래
    // "보는 눈의 각도" 슬라이더), 설계 각도와 실제로 보는 각도가 달라서
    // 거울 속 모습이 어긋나 보인다 — 이게 이 도구가 보여주려는 핵심이다.
    const DESIGN_ANGLE_DEG = 45;

    const DEG2RAD = Math.PI / 180;

    function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }

    // row는 모눈종이의 위에서부터 센 행 번호(0 = 맨 윗줄 A). v는 "거울로부터
    // 얼마나 먼가"(0 = 거울 바로 앞, 1 = 가장 먼 가장자리)이므로, 실제 참고
    // 자료를 살펴보면 맨 아랫줄(F, 턱 쪽)이 거울에 가장 가깝게 그려지고
    // 맨 윗줄(A, 이마 쪽)이 가장 멀리 펼쳐진다 — row가 커질수록(아래로
    // 내려갈수록) v는 작아진다(거울과 가까워진다).
    function rowToVSpan(row) {
        return { v0: 1 - (row + 1) / ROWS, v1: 1 - row / ROWS };
    }

    function cellUV(col, row) {
        const { v0, v1 } = rowToVSpan(row);
        return { u: (col + 0.5) / COLS, v: (v0 + v1) / 2 };
    }

    function thetaOf(u) {
        return (-THETA_SPAN_DEG / 2 + u * THETA_SPAN_DEG) * DEG2RAD;
    }

    // v(0~1) -> 거울로부터의 반지름 ρ. viewAngleDeg(5~85 권장)가 클수록 바깥쪽(v→1)
    // 이 급격하게 벌어진다.
    function rhoOf(v, viewAngleDeg) {
        const phi = clamp(viewAngleDeg, 1, 89) * DEG2RAD;
        const growth = Math.tan(v * phi) / Math.tan(phi);
        const rhoMax = R_CYL * RHO_MAX_FACTOR;
        return R_CYL + (rhoMax - R_CYL) * growth;
    }

    // 부채꼴(종이) 위에서의 좌표. 거울은 원점에 있고, y가 커질수록(아래로) 거울에서
    // 멀어진다 (캔버스 좌표계와 맞춤: 거울을 위쪽에 그리고 부채꼴은 아래로 펼쳐짐).
    function fanPoint(u, v, viewAngleDeg) {
        const theta = thetaOf(u);
        const rho = rhoOf(v, viewAngleDeg);
        return { x: rho * Math.sin(theta), y: rho * Math.cos(theta), rho, theta };
    }

    // 한 칸(col,row)을 부채꼴 위의 휘어진 사각형(폴리곤)으로 근사한다.
    // 각 변을 subdiv개로 쪼개 호(arc)를 매끈하게 표현한다.
    function cellFanPolygon(col, row, viewAngleDeg, subdiv) {
        subdiv = subdiv || 5;
        const u0 = col / COLS, u1 = (col + 1) / COLS;
        const { v0, v1 } = rowToVSpan(row);
        const pts = [];
        for (let i = 0; i <= subdiv; i++) { // 안쪽 호 (v0, u0->u1)
            const u = u0 + (u1 - u0) * (i / subdiv);
            pts.push(fanPoint(u, v0, viewAngleDeg));
        }
        for (let i = 0; i <= subdiv; i++) { // 바깥쪽 반지름 선 (u1, v0->v1)
            const v = v0 + (v1 - v0) * (i / subdiv);
            pts.push(fanPoint(u1, v, viewAngleDeg));
        }
        for (let i = 0; i <= subdiv; i++) { // 바깥쪽 호 (v1, u1->u0)
            const u = u1 - (u1 - u0) * (i / subdiv);
            pts.push(fanPoint(u, v1, viewAngleDeg));
        }
        for (let i = 0; i <= subdiv; i++) { // 안쪽 반지름 선 (u0, v1->v0)
            const v = v1 - (v1 - v0) * (i / subdiv);
            pts.push(fanPoint(u0, v, viewAngleDeg));
        }
        return pts.map(p => [p.x, p.y]);
    }

    // rhoOf(v, DESIGN_ANGLE_DEG)의 역함수: 종이 위 반지름 ρ에서, 그 점이 설계상
    // 원래 나타내려던 v(거울로부터의 거리 비율)를 되짚는다. ρ(v) 식이 깔끔한
    // 탄젠트 함수라 정확한 해석적 역함수가 존재한다.
    function trueVFromRho(rho) {
        const phi = DESIGN_ANGLE_DEG * DEG2RAD;
        const rhoMax = R_CYL * RHO_MAX_FACTOR;
        const growth = (rho - R_CYL) / (rhoMax - R_CYL);
        return Math.atan(Math.tan(phi) * growth) / phi;
    }

    // 원통의 옆면은 어디서나 법선이 수평(반지름 방향)이어서, 반사는 광선의
    // "수직" 방향 성분을 전혀 바꾸지 못한다 — 수평 방향만 뒤집는다. 그래서
    // 눈이 아주 멀리 있고(평행광선 근사) 바닥에서 비스듬히 φ만큼 내려다본다고
    // 하면, 거울 위 높이 z에서 반사된 광선은 바닥(종이)의 ρ = R + z/tanφ
    // 지점에서 왔다고 "보인다". 거울 바로 앞(ρ=R, z=0)은 각도에 상관없이 항상
    // 제자리로 되비치는 유일한 기준점이고, 그 외의 모든 점은 실제로 보는
      // 각도가 설계 각도와 다르면 tan(실제각도)/tan(설계각도) 배만큼 거울 위
    // 겉보기 높이가 달라진다 — 비율이 1보다 크면(더 높은 각도) 거울 윗부분
    // 밖으로 밀려나 안 보이게 되고, 1보다 작으면(더 낮은 각도) 거울 아랫부분에
    // 눌려 붙어 보인다.
    function apparentV(rho, viewAngleDeg) {
        const vTrue = trueVFromRho(rho);
        const phiDesign = DESIGN_ANGLE_DEG * DEG2RAD;
        const phiView = clamp(viewAngleDeg, 1, 89) * DEG2RAD;
        return vTrue * Math.tan(phiView) / Math.tan(phiDesign);
    }

    // fanPoint(u,v,...)의 역함수. 부채꼴 위의 한 점(거울 중심 기준 상대좌표 dx,dy,
    // 둘 다 "단위" 기준, 픽셀이 아님)이 원래 모눈종이의 몇 번째 칸(col,row)에
    // 해당하는지 되짚어 찾는다. (실제로 그려진 종이 자체를 읽을 때 쓰므로 항상
    // 설계 각도를 기준으로 삼는다.)
    function fanInverse(dx, dy) {
        const theta = Math.atan2(dx, dy);
        const u = theta / (THETA_SPAN_DEG * DEG2RAD) + 0.5;
        const rho = Math.hypot(dx, dy);
        const v = trueVFromRho(rho);
        const col = Math.floor(u * COLS);
        const rowFrac = 1 - v; // v(거울과의 거리) -> 위에서부터 센 행 위치로 환산
        const row = Math.floor(rowFrac * ROWS);
        const inBounds = u >= 0 && u <= 1 && v >= 0 && v <= 1 && col >= 0 && col < COLS && row >= 0 && row < ROWS;
        return { u, v, rho, theta, col, row, inBounds };
    }

    function vLen(v) { return Math.hypot(v.x, v.y); }
    function vNorm(v) { const m = vLen(v) || 1; return { x: v.x / m, y: v.y / m }; }
    function vAngleDeg(a, b) {
        const na = vNorm(a), nb = vNorm(b);
        let c = na.x * nb.x + na.y * nb.y;
        c = clamp(c, -1, 1);
        return Math.acos(c) * 180 / Math.PI;
    }

    // 원(거울 단면)에서 반사되어 S(종이 위의 한 점)에서 나온 빛이 E(눈)로 들어가는
    // 지점 P를 찾는다. 입사각=반사각 조건을 만족하는 β(원 위의 각도)를, 보이는
    // 범위(thetaSpanDeg) 안에서 촘촘히 스캔해 오차가 가장 작은 지점으로 근사한다.
    // (원에서의 반사는 일반적으로 닫힌 형태 해가 없어 수치적으로 탐색한다.)
    function reflectOffCircle(S, E, center, radius, thetaSpanDeg, samples) {
        samples = samples || 2000;
        const halfSpan = (thetaSpanDeg || THETA_SPAN_DEG) / 2;
        let best = null;
        for (let i = 0; i <= samples; i++) {
            const betaDeg = -halfSpan + (2 * halfSpan) * (i / samples);
            const beta = betaDeg * DEG2RAD;
            const n = { x: Math.sin(beta), y: Math.cos(beta) };
            const P = { x: center.x + radius * n.x, y: center.y + radius * n.y };
            const vIn = vNorm({ x: P.x - S.x, y: P.y - S.y });
            const dot = vIn.x * n.x + vIn.y * n.y;
            const reflected = { x: vIn.x - 2 * dot * n.x, y: vIn.y - 2 * dot * n.y };
            const vOutWanted = vNorm({ x: E.x - P.x, y: E.y - P.y });
            const err = vAngleDeg(reflected, vOutWanted);
            if (!best || err < best.err) best = { err, beta, betaDeg, P, n };
        }
        if (!best) return null;
        const vToSource = vNorm({ x: S.x - best.P.x, y: S.y - best.P.y });
        const vToEye = vNorm({ x: E.x - best.P.x, y: E.y - best.P.y });
        const incidenceDeg = vAngleDeg(vToSource, best.n);
        const reflectionDeg = vAngleDeg(vToEye, best.n);
        return {
            point: best.P, betaDeg: best.betaDeg, errDeg: best.err,
            incidenceDeg, reflectionDeg, valid: best.err < 1.5,
        };
    }

    return {
        COLS, ROWS, R_CYL, RHO_MAX_FACTOR, THETA_SPAN_DEG, DESIGN_ANGLE_DEG,
        cellUV, rowToVSpan, thetaOf, rhoOf, trueVFromRho, apparentV, fanPoint, cellFanPolygon,
        fanInverse, reflectOffCircle,
    };
});
