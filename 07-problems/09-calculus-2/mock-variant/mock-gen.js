/* 최근 시험 변형 문항 생성기 (window.SU3MockGen)
 * 각 문항은 gen() 을 부르면 새 숫자로 된 문항 하나를 돌려줍니다.
 * 반환: { stmt(TeX), choices[5](TeX), ans(1~5), val(TeX 정답), src(출처) }
 */
(function () {
  'use strict';

  function ri(lo, hi) { return lo + Math.floor(Math.random() * (hi - lo + 1)); }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function gcd(a, b) { return b ? gcd(b, a % b) : Math.abs(a); }
  /* 분수 TeX. 약분하고, 분모가 1이면 정수만 씁니다. */
  function frac(n, d) {
    var g = gcd(n, d); n /= g; d /= g;
    if (d < 0) { n = -n; d = -d; }
    if (d === 1) return String(n);
    return (n < 0 ? '-' : '') + '\\frac{' + Math.abs(n) + '}{' + d + '}';
  }
  /* 정답 하나와 오답 후보들로 선택지 5개를 만듭니다. 후보에서 정답과 같은 것과 중복은 뺍니다. */
  function pack(correct, pool) {
    var ds = [];
    pool.forEach(function (x) { if (x !== correct && ds.indexOf(x) < 0) ds.push(x); });
    if (ds.length < 4) throw new Error('오답 후보 부족');
    var opts = [correct].concat(ds.slice(0, 4));
    shuffle(opts);
    return { choices: opts, ans: opts.indexOf(correct) + 1, val: correct };
  }

  /* ---------- 2027학년도 6월 모의평가 ---------- */
  var S2706 = '2027학년도 6월 모의평가';
  function g2706_23() {
    var p = ri(2, 6), q = ri(1, 5);
    var r = pack(String(p), [String(q), String(p + 1), String(p - 1), String(2 * p), String(p + 2), String(p * q), String(q + 1), String(p + q), String(2 * q), String(p * p), String(p + q + 1), String(q - 1)]);
    r.stmt = '\\lim_{n\\to\\infty}\\frac{' + p + '\\cdot5^n-' + q + '\\cdot2^{n+1}}{5^n+2^n}\\text{의 값은?}';
    return r;
  }
  function g2706_24() {
    var a = ri(2, 5), b = a - 1;
    var c = '-' + frac(2, 2 * a - 1);
    var r = pack(c, ['-' + frac(1, 2 * a - 1), '-' + frac(2, 2 * a + 1), frac(2, 2 * a - 1), '-' + frac(2, a), '-' + frac(2, 2 * a - 3), '-' + frac(1, a)]);
    r.stmt = '\\text{곡선 }' + a + 'x+\\sqrt y=' + (b === 1 ? '' : b) + 'xy\\text{ 위의 점 }(-1,1)\\text{에서의 접선의 기울기는?}';
    return r;
  }
  function g2706_25() {
    var opts = [[20, 16], [10, 9], [12, 8], [30, 25]];
    var o = pick(opts), c = o[0], d = o[1], cnt = 0;
    for (var k = -40; k <= 40; k++) { var v = k * k - c; if (-d < v && v <= d) cnt++; }
    var r = pack(String(cnt), [String(cnt + 1), String(cnt - 1), String(cnt + 2), String(Math.max(cnt - 2, 0)), String(cnt + 3)]);
    r.stmt = '\\text{정수 }k\\text{에 대하여 수열 }\\{a_n\\}\\text{의 일반항 }a_n=\\left(\\frac{k^2-' + c + '}{' + d + '}\\right)^n\\text{이 수렴하도록 하는 모든 정수 }k\\text{의 개수는?}';
    return r;
  }
  function g2706_26() {
    var c = ri(1, 4);
    var corr = c + '\\ln\\frac43-\\frac{' + c + '}{8}';
    var r = pack(corr, [c + '\\ln\\frac43-\\frac{' + c + '}{4}', c + '\\ln\\frac43+\\frac{' + c + '}{8}',
      c + '\\ln\\frac32-\\frac{' + c + '}{8}', c + '\\ln\\frac34-\\frac{' + c + '}{8}', c + '\\ln\\frac43-\\frac{' + c + '}{16}']);
    r.stmt = '\\text{곡선 }y=\\frac{' + c + '}{x^2+x}\\,(x>0)\\text{ 위의 점 }(1,\\tfrac{' + c + '}{2})\\text{에서의 접선을 }l\\text{이라 하자. 곡선, 직선 }l\\text{ 및 직선 }x=2\\text{로 둘러싸인 부분의 넓이는?}';
    return r;
  }
  function g2706_27() {
    var m = ri(1, 3), coef = m * m === 1 ? '' : (m * m);
    var corr = '-e^{' + (2 * m) + '}';
    var r = pack(corr, ['-e^{' + m + '}', '-\\frac{e^{' + (2 * m) + '}}{2}', '-2e^{' + (2 * m) + '}', '-e^{' + (2 * m + 2) + '}', 'e^{' + (2 * m) + '}']);
    r.stmt = '\\text{함수 }f(x)=(\\ln x)^3-' + coef + '\\ln x\\text{에 대하여 }x\\ge-2\\text{에서 정의된 함수 }g(x)\\text{는 }x>-2\\text{에서 미분가능하고, }t\\ge e\\text{인 모든 실수 }t\\text{에 대하여 }g(f(t))=t^2\\text{을 만족시킨다. }x>\\tfrac1e\\text{에서 정의된 }h(x)=g(f(x))\\text{에 대하여 }h\'(1)\\text{의 값은?}';
    return r;
  }

  /* ---------- 2027학년도 9월 모의평가 ---------- */
  var S2709 = '2027학년도 9월 모의평가';
  function g2709_23() {
    var b = ri(1, 4);
    var r = pack(frac(1, b), [String(b), frac(2, b), frac(1, b + 1), frac(b, 2), frac(1, 2 * b), frac(3, b), frac(b, 3), frac(1, b + 2)]);
    r.stmt = '\\lim_{x\\to0}\\frac{x}{\\ln(1+' + (b === 1 ? '' : b) + 'x)}\\text{의 값은?}';
    return r;
  }
  function g2709_24() {
    var p = ri(1, 4), q = ri(1, 3);
    var corr = p + '+' + q + '(e-1)';
    var r = pack(corr, [p + '+' + q + 'e', p + 'e+' + q, p + '+' + q + '(e+1)', (p + q) + '(e-1)', (q + 1) + '+' + p + '(e-1)', (p + 1) + '+' + q + '(e-1)', q + '+' + p + '(e-1)']);
    r.stmt = '\\int_0^1(' + (p === 1 ? '' : p) + 'x+' + q + ')e^x\\,dx\\text{의 값은?}';
    return r;
  }
  function g2709_25() {
    var p = pick([2, 4, 5, 6, 7]);
    var r = pack('\\frac{1}{' + (3 * p) + '}', ['\\frac{1}{' + p + '}', '\\frac{1}{' + (3 * p + 3) + '}', '\\frac{1}{' + (2 * p) + '}', '\\frac{1}{' + (3 * p + 6) + '}', '\\frac{1}{' + (p + 3) + '}']);
    r.stmt = '\\text{공차가 3인 두 등차수열 }\\{a_n\\},\\{b_n\\}\\text{의 첫째항이 각각 }' + p + ',\\ ' + (p + 3) + '\\text{일 때, }\\sum_{n=1}^\\infty\\frac{1}{a_nb_n}\\text{의 값은?}';
    return r;
  }
  function g2709_26() {
    var o = pick([
      { a: '\\frac{\\pi}{4}', v: '2\\sqrt2' }, { a: '\\frac{\\pi}{6}', v: '4\\sqrt3' }, { a: '\\frac{\\pi}{3}', v: '\\frac43' }]);
    var r = pack(o.v, ['2\\sqrt2', '4\\sqrt3', '\\frac43', '\\sqrt2', '2\\sqrt3', '\\frac34', '\\sqrt3']);
    r.stmt = '\\text{곡선 }y=\\sin x\\,(0<x<\\pi)\\text{와 직선 }y=\\sin ' + o.a + '\\text{이 만나는 서로 다른 두 점을 }A,B\\text{라 하자. 두 점에서의 접선이 이루는 예각의 크기를 }\\theta\\text{라 할 때, }\\tan\\theta\\text{의 값은?}';
    return r;
  }
  function g2709_27() {
    var r = pack('\\frac{19}{3}', ['\\frac{10}{3}', '\\frac{13}{3}', '\\frac{16}{3}', '\\frac{22}{3}', '\\frac{25}{3}']);
    r.stmt = '\\text{매개변수 }t\\,(0<t<\\tfrac\\pi2)\\text{로 나타내어진 곡선 }x=\\cos t+t\\sin t,\\ y=\\sin t-t\\cos t\\text{ 위의 점 }P(a,b)\\text{에서의 접선과 직선 }y=\\tfrac x2\\text{가 이루는 예각의 크기를 }\\theta\\text{라 하면 }\\tan\\theta=\\tfrac12\\text{이다. }3a+4b+\\tan k\\text{의 값은? (단, }k\\text{는 }0<k<\\tfrac\\pi2\\text{인 상수)}';
    return r;
  }

  /* ---------- 2026학년도 10월 고3 전국연합학력평가 ---------- */
  var S2610 = '2026학년도 10월 고3 전국연합학력평가';
  function g2610_23() {
    var o = pick([[5, 2], [3, 1], [2, 3], [4, 3]]), b = o[0], c = o[1];
    var r = pack(frac(b, c), [frac(c, b), frac(b, c + 1), frac(b + 1, c), frac(2 * b, c), frac(b, 2 * c)]);
    r.stmt = '\\lim_{x\\to0}\\frac{\\ln(1+' + b + 'x^2)}{' + (c === 1 ? '' : c) + 'x^2}\\text{의 값은?}';
    return r;
  }
  function g2610_24() {
    var p = ri(1, 4);
    var corr = '\\ln2+' + frac(p, 2);
    var r = pack(corr, ['\\ln2+' + p, '\\ln2+' + frac(p + 1, 2), '2\\ln2+' + frac(p, 2), '\\ln2+' + frac(p, 4), '\\ln2+' + frac(p + 2, 2)]);
    r.stmt = '\\int_1^2\\frac{x+' + p + '}{x^2}\\,dx\\text{의 값은?}';
    return r;
  }
  function g2610_25() {
    var m = pick([4, 9, 16]);
    var k = frac(1, Math.round(Math.sqrt(m)));
    var r = pack(k, [frac(1, m), frac(1, 2 * m), frac(2, m), frac(1, m + 1), String(Math.round(Math.sqrt(m)))]);
    r.stmt = '\\text{상수 }k\\,(k>0)\\text{과 수열 }\\{a_n\\}\\text{이 모든 자연수 }n\\text{에 대하여 }(ka_n-n^2)^2<n^2\\text{을 만족한다. }\\lim_{n\\to\\infty}\\frac{a_n}{' + m + 'n^2+1}=k\\text{일 때, }k\\text{의 값은?}';
    return r;
  }
  function g2610_26() {
    var c = ri(1, 3);
    var corr = '\\frac{(' + (c + 1) + 'e-' + (c + 2) + ')\\pi}{8}';
    var r = pack(corr, ['\\frac{(' + (c + 1) + 'e-' + c + ')\\pi}{8}', '\\frac{(' + (c + 1) + 'e-' + (c + 2) + ')\\pi}{4}', '\\frac{(' + c + 'e-' + (c + 1) + ')\\pi}{8}', '\\frac{(' + (c + 2) + 'e-' + (c + 2) + ')\\pi}{8}', '\\frac{(' + (c + 1) + 'e-' + (c + 1) + ')\\pi}{8}']);
    r.stmt = '\\text{곡선 }y=\\sqrt{' + c + '+(\\ln x)^2}\\text{과 }x\\text{축 및 두 직선 }x=1,\\ x=e\\text{로 둘러싸인 부분을 밑면으로 하는 입체도형이 있다. 이 입체도형을 }x\\text{축에 수직인 평면으로 자른 단면이 모두 반원일 때, 이 입체도형의 부피는?}';
    return r;
  }
  function g2610_27() {
    var v = pick([8, 2]);
    var corr = v === 8 ? '\\frac{1}{10}' : '\\frac{1}{8}';
    var others = ['\\frac{1}{40}', '\\frac{1}{20}', '\\frac{3}{40}', v === 8 ? '\\frac{1}{8}' : '\\frac{1}{10}'];
    var r = pack(corr, others);
    r.stmt = '\\text{실수 전체의 집합에서 미분가능한 함수 }f(x)\\text{는 } f(x)=\\begin{cases}e^{2x}-2 & (x<b)\\\\ 2e^x-8e^{-x}+a & (x\\ge b)\\end{cases}\\text{이다. 두 상수 }a,b\\text{에 대하여 }f(x)\\text{의 역함수를 }g\\text{라 할 때, }g\'(' + v + ')\\text{의 값은?}';
    return r;
  }

  /* ---------- 2026학년도 9월 모의평가 ---------- */
  var S2609 = '2026학년도 9월 모의평가';
  function g2609_23() {
    var k = ri(1, 3), E = function (n) { return n === 1 ? 'e' : 'e^{' + n + '}'; };
    var C = function (n) { return n === 1 ? '' : String(n); };
    var r = pack(C(k) + E(k), [E(k), C(k) + 'e', C(k) + E(k + 1), C(k * k) + E(k), C(k + 1) + E(k), C(2 * k) + E(k), 'e^{' + (k + 2) + '}', C(k) + E(k + 2), C(k + 2) + E(k), C(k) + E(k) + '+1']);
    r.stmt = '\\lim_{x\\to1}\\frac{e^{' + k + 'x}-e^{' + k + '}}{x-1}\\text{의 값은?}';
    return r;
  }
  function g2609_24() {
    var m = ri(1, 3), E = function (n) { return n === 1 ? 'e' : 'e^{' + n + '}'; };
    var r = pack('\\frac{' + E(m) + '-1}{' + m + '}', ['e^{' + m + '}-1', '\\frac{e^{' + m + '}+1}{' + m + '}', '\\frac{e^{' + m + '}-1}{' + (m + 1) + '}', 'e^{' + m + '}-' + m, '\\frac{e^{' + m + '}-1}{' + (2 * m) + '}', 'e^{' + m + '}', '\\frac{e^{' + m + '}}{' + m + '}', m + '(e^{' + m + '}-1)']);
    r.stmt = '\\int_{\\pi/4}^{3\\pi/4}\\cos\\!\\left(x-\\tfrac\\pi4\\right)e^{' + (m === 1 ? '' : m) + '\\sin\\left(x-\\frac\\pi4\\right)}\\,dx\\text{의 값은?}';
    return r;
  }
  function g2609_25() {
    var L = pick([4, 6, 8, 10]);
    var r = pack(String(3 * L / 2 - 1), [String(3 * L / 2), String(3 * L / 2 + 1), String(L - 1), String(3 * L / 2 - 2), String(L)]);
    r.stmt = '\\text{두 실수 }a,b\\text{에 대하여 }\\lim_{n\\to\\infty}\\frac{a\\,n^b}{\\sqrt{n^4+4n}-\\sqrt{n^4+n}}=' + L + '\\text{일 때, }a+b\\text{의 값은?}';
    return r;
  }
  function g2609_26() {
    var q = pick([2, 3, 4]);
    var num = 3 * (q * q - 1), den = 2 * q;   /* (1+q)(xA-xB)/2 = 3(q^2-1)/(2q) */
    var corr = frac(num, den) + '-3\\ln' + q;
    var r = pack(corr, ['4-3\\ln3', '3-3\\ln2', '4-2\\ln3', '3+3\\ln2', '3+3\\ln3', '\\frac94+3\\ln2']);
    r.stmt = '\\text{곡선 }y=\\frac{3}{x-1}\\,(x>1)\\text{이 두 직선 }y=1,\\ y=' + q + '\\text{과 만나는 점을 각각 }A,B\\text{라 하자. 곡선 }y=\\frac{3}{x-1}\\,(x>1)\\text{과 직선 }AB\\text{로 둘러싸인 부분의 넓이는?}';
    return r;
  }
  function g2609_27() {
    var p = pick([8, 24, 48]);
    var a = { 8: 1, 24: 2, 48: 3 }[p];
    var corr = frac(4 * a + 1, 4 * a);   /* 1 + 1/(4a) */
    var r = pack(corr, ['\\frac{3}{2}', '\\frac{11}{8}', '\\frac{7}{4}', '\\frac{13}{8}', '\\frac{5}{4}', '\\frac{9}{8}', '\\frac{13}{12}']);
    r.stmt = '\\text{실수 전체의 집합에서 미분가능한 함수 }f(x)\\text{가 모든 실수 }x\\text{에 대하여 }f\'(x)>0\\text{이다. 함수 }f(x^3+x)\\text{의 역함수를 }g(x)\\text{라 할 때, }f(2)=1,\\ f\'(2)=' + p + 'g\'(1)-1\\text{이다. }g(1)+g\'(1)\\text{의 값은?}';
    return r;
  }

  /* ---------- 2026학년도 대학수학능력시험 (홀수형) ---------- */
  var S26S = '2026학년도 대학수학능력시험 (홀수형)';
  function g26S_23() {
    var o = pick([[6, 2], [4, 1], [9, 4]]), b = o[0], c = o[1];
    var r = pack(frac(b, c), [frac(c, b), frac(b + c, c), frac(b, c + 1), frac(2 * b, c), frac(b, 2 * c)]);
    r.stmt = '\\lim_{x\\to0}\\frac{\\tan ' + b + 'x}{' + (c === 1 ? '' : c) + 'x}\\text{의 값은?}';
    return r;
  }
  function g26S_24() {
    var k = pick([1, 3, 6]);
    var r = pack(frac(2 * k, 3), [frac(k, 3), frac(3, 2 * k), frac(k, 2), frac(2 * k, 5), frac(1, 2)]);
    r.stmt = '\\int_0^{\\pi/2}' + (k === 1 ? '' : k) + '\\sqrt{\\sin x-\\sin^3x}\\,dx\\text{의 값은?}';
    return r;
  }
  function g26S_25() {
    var s = pick([4, 5, 6]);
    var r = pack(frac(s * s, s + 5), [frac(s, 5), frac(s * s, 5), frac(s * s, s), frac(s * s, s + 4), frac(s, 2), frac(s * s, s + 6), frac(s + 1, s + 5), frac(s * s, s + 10)]);
    r.stmt = '\\text{수열 }\\{a_n\\}\\text{이 모든 자연수 }n\\text{에 대하여 }\\sqrt{9n^2-5}+' + (s - 3) + 'n<a_n<' + s + 'n+1\\text{을 만족시킬 때, }\\lim_{n\\to\\infty}\\frac{(a_n+2)^2}{na_n+5n^2-2}\\text{의 값은?}';
    return r;
  }
  function g26S_26() {
    var k = pick([1, 2, 3]);
    var corr = k === 1 ? '\\frac{\\sqrt3(3+8\\ln2)}{16}' : (k === 2 ? '\\sqrt3\\ln2' : '\\frac{\\sqrt3(-3+24\\ln2)}{16}');
    var r = pack(corr, ['\\frac{\\sqrt3(' + (6 - 3 * k) + '-8' + k + '\\ln2)}{16}', '\\frac{\\sqrt3(' + (6 - 3 * k) + '+' + (4 * k) + '\\ln2)}{16}', '\\frac{\\sqrt3(' + (6 + 3 * k) + '+' + (8 * k) + '\\ln2)}{16}', '\\frac{\\sqrt3(' + (6 - 3 * k) + '+' + (8 * k) + '\\ln2)}{8}', '\\frac{\\sqrt3(' + (6 - 3 * k) + '+' + (8 * k) + '\\ln2)}{24}']);
    r.stmt = '\\text{곡선 }y=\\sqrt{x+' + (k === 1 ? '' : k) + 'x\\ln x}\\text{와 }x\\text{축 및 두 직선 }x=1,\\ x=2\\text{로 둘러싸인 부분을 밑면으로 하는 입체도형이 있다. 이 입체도형을 }x\\text{축에 수직인 평면으로 자른 단면이 모두 정삼각형일 때, 이 입체도형의 부피는?}';
    return r;
  }
  function g26S_27() {
    var p = pick([1, 2, 3]);
    var corr = p === 1 ? '\\frac{3\\pi-2}{\\pi+6}' : (p === 2 ? '\\frac12' : '-\\frac{3\\pi+2}{6-\\pi}');
    var r = pack(corr, ['\\frac{3\\pi-4}{\\pi+4}', '\\frac{3\\pi}{\\pi+8}', '\\frac{3\\pi+2}{\\pi+10}', '\\frac{3\\pi+4}{\\pi+12}', '\\frac14']);
    r.stmt = '\\text{매개변수 }t\\text{로 나타내어진 곡선 }C:\\ x=e^{4t}(1+\\sin^2\\pi t),\\ y=e^{4t}(1-3\\cos^2\\pi t)\\text{가 직선 }y=3x-5' + (p === 1 ? 'e' : 'e^{' + p + '}') + '\\text{와 만나는 점을 }P\\text{라 할 때, 곡선 }C\\text{ 위의 점 }P\\text{에서의 접선의 기울기는?}';
    return r;
  }

  /* 문항 목록. big = 대유형, src = 출처 */
  var ITEMS = [
    { src: S2706, no: 23, big: '극한', gen: g2706_23 },
    { src: S2706, no: 24, big: '미분·곡선', gen: g2706_24 },
    { src: S2706, no: 25, big: '수열·급수', gen: g2706_25 },
    { src: S2706, no: 26, big: '적분', gen: g2706_26 },
    { src: S2706, no: 27, big: '미분·곡선', gen: g2706_27 },
    { src: S2709, no: 23, big: '극한', gen: g2709_23 },
    { src: S2709, no: 24, big: '적분', gen: g2709_24 },
    { src: S2709, no: 25, big: '수열·급수', gen: g2709_25 },
    { src: S2709, no: 26, big: '미분·곡선', gen: g2709_26 },
    { src: S2709, no: 27, big: '미분·곡선', gen: g2709_27 },
    { src: S2610, no: 23, big: '극한', gen: g2610_23 },
    { src: S2610, no: 24, big: '적분', gen: g2610_24 },
    { src: S2610, no: 25, big: '수열·급수', gen: g2610_25 },
    { src: S2610, no: 26, big: '적분', gen: g2610_26 },
    { src: S2610, no: 27, big: '미분·곡선', gen: g2610_27 },
    { src: S2609, no: 23, big: '극한', gen: g2609_23 },
    { src: S2609, no: 24, big: '적분', gen: g2609_24 },
    { src: S2609, no: 25, big: '수열·급수', gen: g2609_25 },
    { src: S2609, no: 26, big: '적분', gen: g2609_26 },
    { src: S2609, no: 27, big: '미분·곡선', gen: g2609_27 },
    { src: S26S, no: 23, big: '극한', gen: g26S_23 },
    { src: S26S, no: 24, big: '적분', gen: g26S_24 },
    { src: S26S, no: 25, big: '수열·급수', gen: g26S_25 },
    { src: S26S, no: 26, big: '적분', gen: g26S_26 },
    { src: S26S, no: 27, big: '미분·곡선', gen: g26S_27 }
  ];

  var api = { ITEMS: ITEMS, frac: frac, pack: pack };
  if (typeof window !== "undefined") { window.SU3MockGen = api; }
  if (typeof module !== 'undefined') { module.exports = api; }
})();
