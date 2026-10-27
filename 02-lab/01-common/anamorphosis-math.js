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

    const DEG2RAD = Math.PI / 180;

    function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }

    function cellUV(col, row) {
        return { u: (col + 0.5) / COLS, v: (row + 0.5) / ROWS };
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
        const v0 = row / ROWS, v1 = (row + 1) / ROWS;
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

    // 원통 거울에 비친 모습(미리보기)용 좌표. 원기둥을 옆에서 바라본 것처럼
    // sin(θ)로 가로 위치를, cos(θ)로 폭(원근 압축)을 결정하는 표준적인 "라벨
    // 감싸기" 투영이다. 세로는 v에 비례(그대로 유지).
    function cylinderPoint(u, v, previewRadius, previewHeight) {
        const theta = thetaOf(u);
        return {
            x: previewRadius * Math.sin(theta),
            y: v * previewHeight,
            foreshorten: Math.cos(theta),
        };
    }

    function cellCylinderPolygon(col, row, previewRadius, previewHeight, subdiv) {
        subdiv = subdiv || 4;
        const u0 = col / COLS, u1 = (col + 1) / COLS;
        const v0 = row / ROWS, v1 = (row + 1) / ROWS;
        const pts = [];
        for (let i = 0; i <= subdiv; i++) {
            const u = u0 + (u1 - u0) * (i / subdiv);
            pts.push(cylinderPoint(u, v0, previewRadius, previewHeight));
        }
        for (let i = 0; i <= subdiv; i++) {
            const u = u1 - (u1 - u0) * (i / subdiv);
            pts.push(cylinderPoint(u, v1, previewRadius, previewHeight));
        }
        return pts.map(p => [p.x, p.y]);
    }

    return {
        COLS, ROWS, R_CYL, RHO_MAX_FACTOR, THETA_SPAN_DEG,
        cellUV, thetaOf, rhoOf, fanPoint, cellFanPolygon,
        cylinderPoint, cellCylinderPolygon,
    };
});
