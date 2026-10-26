/* 정적분과 급수의 합 쪽지시험
 *
 * 1~6번: 시그마로 나타낸 합의 극한 (그대로 구분구적법 꼴로 바꾸는 문제)
 * 7~10번: 항을 나열한 합의 극한 (시그마로 먼저 나타낸 뒤 구하는 문제)
 *
 * 항목: { q, a, sol: [TeX...], wide: bool,
 *         meta: { pre, upper, summand, terms? } }
 *   meta 는 화면에는 쓰이지 않고, 극한값을 수치로 검산할 때만 쓰입니다.
 *   (합 = pre × Σ_{k=1}^{upper} summand,  terms 는 나열된 앞의 세 항과 마지막 항)
 */
(function () {
  'use strict';

  var M = window.SU3M;
  var K = window.SU3K;

  var LIM = '\\lim_{n\\to\\infty}';
  var TXT = '\\text{시그마로 나타내기: }';
  var XDX = '\\frac{k}{n}\\to x,\\ \\frac{1}{n}\\to dx';

  function rat(n, d) { return M.fracTex(n, d); }
  function pw(v, n) { return n === 1 ? v : v + '^{' + n + '}'; }
  function cn(c) { return c === 1 ? 'n' : c + 'n'; }          /* cn, 1n -> n */
  function ck(c) { return c === 1 ? 'k' : c + 'k'; }
  function eTex(E) { return E === 1 ? 'e' : 'e^{' + E + '}'; }
  function lnOne(c) { return c === 1 ? 'x' : c + 'x'; }       /* 1+cx 의 cx */

  /* 시그마로 나타낸 한 문항 */
  function compact(pre, upper, summand, a, sol) {
    return {
      q: LIM + pre + '\\sum_{k=1}^{' + upper + '}' + summand,
      a: a, sol: sol, wide: false,
      meta: { pre: pre || '1', upper: upper, summand: summand }
    };
  }

  /* 항을 나열한 한 문항. T(j) 는 k=j 일 때의 항 TeX, join 은 나열을 감싸는 방법 */
  function expanded(pre, upper, summand, T, wrapFn, a, sol) {
    var terms = [T(1), T(2), T(3), T('n')];
    var list = terms[0] + '+' + terms[1] + '+' + terms[2] + '+\\cdots+' + terms[3];
    return {
      q: LIM + wrapFn(list), a: a, sol: sol, wide: true,
      meta: { pre: pre || '1', upper: upper, summand: summand, terms: terms }
    };
  }

  /* ---------- 1~6번 후보 ---------- */

  /* (1/n) Σ_{k=1}^{cn} (k/n)^m  →  ∫_0^c x^m dx */
  function P1() {
    var t = M.pick([[2, 2], [3, 1], [2, 3], [3, 2], [2, 1], [4, 1], [3, 3]]);
    var c = t[0], m = t[1];
    var base = m === 1 ? '\\frac{k}{n}' : '\\left(\\frac{k}{n}\\right)^{' + m + '}';
    return compact('\\frac{1}{n}', cn(c), base, rat(Math.pow(c, m + 1), m + 1), [
      XDX + ',\\ k=' + cn(c) + '\\Rightarrow x=' + c + '\\ \\Rightarrow\\ \\int_{0}^{' + c + '}' + pw('x', m) + '\\,dx',
      '=\\left[\\frac{x^{' + (m + 1) + '}}{' + (m + 1) + '}\\right]_{0}^{' + c + '}'
    ]);
  }

  /* Σ (a/n)(b + ak/n)^m  →  ∫_b^{a+b} x^m dx */
  function P2() {
    var a = M.pick([2, 3, 4]), b = M.pick([1, 2, 3]), m = M.pick([2, 3]);
    var num = Math.pow(a + b, m + 1) - Math.pow(b, m + 1);
    return compact('', 'n', '\\frac{' + a + '}{n}\\left(' + b + '+\\frac{' + ck(a) + '}{n}\\right)^{' + m + '}', rat(num, m + 1), [
      b + '+\\frac{' + ck(a) + '}{n}\\to x,\\ \\frac{' + a + '}{n}\\to dx,\\ x:' + b + '\\to' + (a + b) + '\\ \\Rightarrow\\ \\int_{' + b + '}^{' + (a + b) + '}x^{' + m + '}\\,dx',
      '=\\left[\\frac{x^{' + (m + 1) + '}}{' + (m + 1) + '}\\right]_{' + b + '}^{' + (a + b) + '}=\\frac{' + (a + b) + '^{' + (m + 1) + '}-' + b + '^{' + (m + 1) + '}}{' + (m + 1) + '}'
    ]);
  }

  /* Σ (ln(cn+k) - ln cn)/n  →  ∫_0^1 ln(1+x/c) dx   또는   Σ (ln(n+ck) - ln n)/n → ∫_0^1 ln(1+cx) dx */
  function lnFormVal(c) {                                       /* ∫_0^1 ln(1+cx) dx = ((1+c)ln(1+c) - c)/c */
    if (c === 1) { return K.sum([K.lnT(2, 1, 2), [-1, 1, '']]); }
    return K.sum([K.lnT(1 + c, c, 1 + c), [-1, 1, '']]);
  }
  function P3() {
    var c, val;
    if (Math.random() < 0.5) {
      c = M.pick([1, 2, 3, 4]);
      val = c === 1 ? '2\\ln 2-1' : (c + 1) + '\\ln\\frac{' + (c + 1) + '}{' + c + '}-1';
      return compact('', 'n', '\\frac{\\ln(' + cn(c) + '+k)-\\ln ' + cn(c) + '}{n}', val, [
        '\\frac{\\ln(' + cn(c) + '+k)-\\ln ' + cn(c) + '}{n}=\\frac{1}{n}\\ln\\left(1+' + (c === 1 ? '\\frac{k}{n}' : '\\frac{k}{' + cn(c) + '}') + '\\right)',
        '\\Rightarrow\\int_{0}^{1}\\ln\\left(1+' + (c === 1 ? 'x' : '\\frac{x}{' + c + '}') + '\\right)dx=\\left[(' + c + '+x)\\ln\\left(1+' + (c === 1 ? 'x' : '\\frac{x}{' + c + '}') + '\\right)-x\\right]_{0}^{1}'
      ]);
    }
    c = M.pick([2, 3, 4]);
    return compact('', 'n', '\\frac{\\ln(n+' + ck(c) + ')-\\ln n}{n}', lnFormVal(c), [
      '\\frac{\\ln(n+' + ck(c) + ')-\\ln n}{n}=\\frac{1}{n}\\ln\\left(1+\\frac{' + ck(c) + '}{n}\\right)',
      '\\Rightarrow\\int_{0}^{1}\\ln(1+' + lnOne(c) + ')\\,dx=\\left[\\frac{(1+' + lnOne(c) + ')\\ln(1+' + lnOne(c) + ')-(1+' + lnOne(c) + ')}{' + c + '}\\right]_{0}^{1}'
    ]);
  }

  /* (1/n) Σ ln(1 + ck/n)   또는   (1/n) Σ ln(a + k/n) */
  function P4() {
    var c, a, inner;
    if (Math.random() < 0.55) {
      c = M.pick([1, 2, 3, 4]);
      inner = '1+' + lnOne(c);
      return compact('\\frac{1}{n}', 'n', '\\ln\\left(1+\\frac{' + ck(c) + '}{n}\\right)', lnFormVal(c), [
        XDX + '\\ \\Rightarrow\\ \\int_{0}^{1}\\ln(' + inner + ')\\,dx',
        c === 1 ? '=\\left[(1+x)\\ln(1+x)-(1+x)\\right]_{0}^{1}' : '=\\left[\\frac{(' + inner + ')\\ln(' + inner + ')-(' + inner + ')}{' + c + '}\\right]_{0}^{1}'
      ]);
    }
    a = M.pick([2, 3, 4]);
    return compact('\\frac{1}{n}', 'n', '\\ln\\left(' + a + '+\\frac{k}{n}\\right)',
      K.sum([K.lnT(a + 1, 1, a + 1), K.lnT(-a, 1, a), [-1, 1, '']]), [
        XDX + '\\ \\Rightarrow\\ \\int_{0}^{1}\\ln(' + a + '+x)\\,dx',
        '=\\left[(' + a + '+x)\\ln(' + a + '+x)-(' + a + '+x)\\right]_{0}^{1}'
      ]);
  }

  /* (1/n) Σ_{k=1}^{mn} e^{ck/n}  →  ∫_0^m e^{cx} dx */
  function P5() {
    var t = M.pick([[1, 1], [2, 1], [3, 1], [-1, 1], [1, 2], [1, 3], [-1, 2], [2, 2]]);
    var c = t[0], m = t[1], E = c * m, val;
    var ex = c === 1 ? 'k/n' : (c === -1 ? '-k/n' : c + 'k/n');
    if (c > 0) { val = c === 1 ? eTex(E) + '-1' : '\\frac{' + eTex(E) + '-1}{' + c + '}'; }
    else { val = '1-' + (E === -1 ? '\\frac{1}{e}' : '\\frac{1}{e^{' + (-E) + '}}'); }
    var cx = c === 1 ? 'x' : (c === -1 ? '-x' : c + 'x');
    return compact('\\frac{1}{n}', m === 1 ? 'n' : cn(m), 'e^{' + ex + '}', val, [
      XDX + (m === 1 ? '' : ',\\ k=' + cn(m) + '\\Rightarrow x=' + m) + '\\ \\Rightarrow\\ \\int_{0}^{' + m + '}e^{' + cx + '}\\,dx',
      '=\\left[' + K.cx(1, c, 'e^{' + cx + '}') + '\\right]_{0}^{' + m + '}'
    ]);
  }

  /* 유리식: k/(n²+ck²), k/(cn²+k²), k²/(n³+ck³) */
  function P6() {
    var t = M.pick(['a', 'b', 'c']), c, inner;
    if (t === 'a') {
      c = M.pick([1, 2, 3, 4]);
      inner = c === 1 ? '1+x^2' : '1+' + c + 'x^2';
      return compact('', 'n', '\\frac{k}{n^{2}+' + (c === 1 ? '' : c) + 'k^{2}}', K.sum([K.lnT(1, 2 * c, 1 + c)]), [
        '\\frac{k}{n^{2}+' + (c === 1 ? '' : c) + 'k^{2}}=\\frac{1}{n}\\cdot\\frac{\\frac{k}{n}}{1+' + (c === 1 ? '' : c) + '\\left(\\frac{k}{n}\\right)^{2}}',
        '\\Rightarrow\\int_{0}^{1}\\frac{x}{' + inner + '}\\,dx=\\left[' + K.cx(1, 2 * c, '\\ln(' + inner + ')') + '\\right]_{0}^{1}'
      ]);
    }
    if (t === 'b') {
      c = M.pick([2, 3, 4]);
      return compact('', 'n', '\\frac{k}{' + c + 'n^{2}+k^{2}}', K.cx(1, 2, K.lnFrac(c + 1, c)), [
        '\\frac{k}{' + c + 'n^{2}+k^{2}}=\\frac{1}{n}\\cdot\\frac{\\frac{k}{n}}{' + c + '+\\left(\\frac{k}{n}\\right)^{2}}',
        '\\Rightarrow\\int_{0}^{1}\\frac{x}{' + c + '+x^{2}}\\,dx=\\left[\\frac{1}{2}\\ln(' + c + '+x^{2})\\right]_{0}^{1}'
      ]);
    }
    c = M.pick([1, 2, 3]);
    inner = c === 1 ? '1+x^3' : '1+' + c + 'x^3';
    return compact('', 'n', '\\frac{k^{2}}{n^{3}+' + (c === 1 ? '' : c) + 'k^{3}}', K.sum([K.lnT(1, 3 * c, 1 + c)]), [
      '\\frac{k^{2}}{n^{3}+' + (c === 1 ? '' : c) + 'k^{3}}=\\frac{1}{n}\\cdot\\frac{\\left(\\frac{k}{n}\\right)^{2}}{1+' + (c === 1 ? '' : c) + '\\left(\\frac{k}{n}\\right)^{3}}',
      '\\Rightarrow\\int_{0}^{1}\\frac{x^{2}}{' + inner + '}\\,dx=\\left[' + K.cx(1, 3 * c, '\\ln(' + inner + ')') + '\\right]_{0}^{1}'
    ]);
  }

  /* Σ_{k=1}^{cn} 1/(n+k)  →  ln(1+c) */
  function P7() {
    var c = M.pick([2, 3]);
    return compact('', cn(c), '\\frac{1}{n+k}', K.sum([K.lnT(1, 1, 1 + c)]), [
      '\\frac{1}{n+k}=\\frac{1}{n}\\cdot\\frac{1}{1+\\frac{k}{n}},\\ \\frac{k}{n}\\to x\\ (x:0\\to' + c + ')',
      '\\Rightarrow\\int_{0}^{' + c + '}\\frac{1}{1+x}\\,dx=\\left[\\ln(1+x)\\right]_{0}^{' + c + '}'
    ]);
  }

  /* ---------- 7~10번 후보 ---------- */

  /* 삼각함수 */
  function arg(j, d) { return '\\frac{' + (j === 1 ? '' : j) + '\\pi}{' + (d === 1 ? '' : d) + 'n}'; }
  function E1() {
    var t = M.pick([
      ['sin', 1, 'u', '\\frac{2}{\\pi}'], ['sin', 1, 'p', '2'],
      ['sin', 2, 'u', '\\frac{2}{\\pi}'], ['sin', 2, 'p', '1'],
      ['sin', 3, 'u', '\\frac{3}{2\\pi}'], ['sin', 3, 'p', '\\frac{1}{2}'],
      ['cos', 2, 'u', '\\frac{2}{\\pi}'], ['cos', 2, 'p', '1'],
      ['cos', 3, 'u', '\\frac{3\\sqrt{3}}{2\\pi}'], ['cos', 3, 'p', '\\frac{\\sqrt{3}}{2}']
    ]);
    var fn = t[0], d = t[1], unit = t[2] === 'u', val = t[3];
    var pre = unit ? '\\frac{1}{n}' : '\\frac{\\pi}{' + (d === 1 ? '' : d) + 'n}';
    var summand = '\\' + fn + '\\frac{k\\pi}{' + (d === 1 ? '' : d) + 'n}';
    var T = function (j) { return '\\' + fn + arg(j === 'n' ? 'n' : j, d); };
    var sumLine = TXT + LIM + pre + '\\sum_{k=1}^{n}' + summand;
    var sign = fn === 'sin' ? '-' : '';
    var other = fn === 'sin' ? 'cos' : 'sin';
    var sol;
    if (unit) {
      var ax = d === 1 ? '\\pi x' : '\\frac{\\pi x}{' + d + '}';
      sol = [sumLine, XDX + '\\ \\Rightarrow\\ \\int_{0}^{1}\\' + fn + ' ' + ax + '\\,dx',
        '=\\left[' + sign + '\\frac{' + d + '}{\\pi}\\' + other + ' ' + ax + '\\right]_{0}^{1}'];
    } else {
      var up = d === 1 ? '\\pi' : '\\frac{\\pi}{' + d + '}';
      sol = [sumLine, '\\frac{k\\pi}{' + (d === 1 ? '' : d) + 'n}\\to x,\\ \\frac{\\pi}{' + (d === 1 ? '' : d) + 'n}\\to dx,\\ x:0\\to' + up + '\\ \\Rightarrow\\ \\int_{0}^{' + up + '}\\' + fn + ' x\\,dx',
        '=\\left[' + sign + '\\' + other + ' x\\right]_{0}^{' + up + '}'];
    }
    return expanded(pre, 'n', summand, T, function (list) { return pre + '\\left(' + list + '\\right)'; }, val, sol);
  }

  /* (1/n){(b+1/n)^m + ... + (b+n/n)^m} */
  function E2() {
    var b = M.pick([1, 1, 2]), m = M.pick([2, 3, 4, 5]);
    var num = Math.pow(b + 1, m + 1) - Math.pow(b, m + 1);
    var T = function (j) { return '\\left(' + b + '+\\frac{' + j + '}{n}\\right)^{' + m + '}'; };
    var summand = '\\left(' + b + '+\\frac{k}{n}\\right)^{' + m + '}';
    return expanded('\\frac{1}{n}', 'n', summand, T,
      function (list) { return '\\frac{1}{n}\\left\\{' + list + '\\right\\}'; }, rat(num, m + 1), [
        TXT + LIM + '\\frac{1}{n}\\sum_{k=1}^{n}' + summand,
        XDX + '\\ \\Rightarrow\\ \\int_{0}^{1}(' + b + '+x)^{' + m + '}\\,dx',
        '=\\left[\\frac{(' + b + '+x)^{' + (m + 1) + '}}{' + (m + 1) + '}\\right]_{0}^{1}=\\frac{' + (b + 1) + '^{' + (m + 1) + '}-' + b + '^{' + (m + 1) + '}}{' + (m + 1) + '}'
      ]);
  }

  /* 1/(an+1) + ... + 1/(bn),   또는   1/(n+s) + 1/(n+2s) + ... + 1/((s+1)n) */
  function E3() {
    if (Math.random() < 0.7) {
      var ab = M.pick([[1, 2], [1, 3], [2, 3], [3, 4], [2, 5], [1, 4], [3, 5], [4, 5]]);
      var a = ab[0], b = ab[1], w = b - a;
      var T = function (j) { return j === 'n' ? '\\frac{1}{' + cn(b) + '}' : '\\frac{1}{' + cn(a) + '+' + j + '}'; };
      var val = a === 1 ? K.sum([K.lnT(1, 1, b)]) : K.lnFrac(b, a);
      var frac = a === 1 ? '\\frac{1}{1+\\frac{k}{n}}' : '\\frac{1}{' + a + '+\\frac{k}{n}}';
      return expanded('', cn(w), '\\frac{1}{' + cn(a) + '+k}', T,
        function (list) { return '\\left(' + list + '\\right)'; }, val, [
          TXT + LIM + '\\sum_{k=1}^{' + cn(w) + '}\\frac{1}{' + cn(a) + '+k}',
          '\\frac{1}{' + cn(a) + '+k}=\\frac{1}{n}\\cdot' + frac,
          '\\Rightarrow\\int_{0}^{' + w + '}\\frac{1}{' + a + '+x}\\,dx=\\left[\\ln(' + a + '+x)\\right]_{0}^{' + w + '}=\\ln ' + b + (a === 1 ? '' : '-\\ln ' + a)
        ]);
    }
    var s = M.pick([2, 2, 3, 4]);
    var Ts = function (j) { return j === 'n' ? '\\frac{1}{' + cn(s + 1) + '}' : '\\frac{1}{n+' + (s * j) + '}'; };
    return expanded('', 'n', '\\frac{1}{n+' + ck(s) + '}', Ts,
      function (list) { return '\\left(' + list + '\\right)'; }, K.sum([K.lnT(1, s, s + 1)]), [
        TXT + LIM + '\\sum_{k=1}^{n}\\frac{1}{n+' + ck(s) + '}',
        '\\frac{1}{n+' + ck(s) + '}=\\frac{1}{n}\\cdot\\frac{1}{1+' + ck(s).replace('k', '\\frac{k}{n}') + '}',
        '\\Rightarrow\\int_{0}^{1}\\frac{1}{1+' + lnOne(s) + '}\\,dx=\\left[' + K.cx(1, s, '\\ln(1+' + lnOne(s) + ')') + '\\right]_{0}^{1}'
      ]);
  }

  /* (1^m + ... + n^m) / n^(m+1),   또는   (1/n^3){(1^2+g) + ... + (n^2+g)} */
  function E4() {
    if (Math.random() < 0.5) {
      var m = M.pick([2, 3, 4]);
      var T = function (j) { return pw(String(j), m); };
      return expanded('\\frac{1}{n^{' + (m + 1) + '}}', 'n', 'k^{' + m + '}', T,
        function (list) { return '\\frac{' + list + '}{n^{' + (m + 1) + '}}'; }, rat(1, m + 1), [
          TXT + LIM + '\\sum_{k=1}^{n}\\frac{k^{' + m + '}}{n^{' + (m + 1) + '}}',
          '\\frac{k^{' + m + '}}{n^{' + (m + 1) + '}}=\\frac{1}{n}\\left(\\frac{k}{n}\\right)^{' + m + '}',
          '\\Rightarrow\\int_{0}^{1}x^{' + m + '}\\,dx=\\left[\\frac{x^{' + (m + 1) + '}}{' + (m + 1) + '}\\right]_{0}^{1}'
        ]);
    }
    var g = M.pick(['kn', '2kn', '3kn', 'n2', '2n2', '3n2']);
    var lin = { kn: 1, '2kn': 2, '3kn': 3 }[g];
    /* g = k·n 의 lin 배(kn, 2kn, 3kn) 또는 n² 의 c0 배(n², 2n², 3n²) */
    var c0 = lin ? 0 : (g === 'n2' ? 1 : +g.charAt(0));
    var gk = function (j) {                                   /* j 번째 항의 g */
      if (lin) { return j === 'n' ? (lin === 1 ? '' : lin) + 'n^2' : (lin * j === 1 ? '' : lin * j) + 'n'; }
      return (c0 === 1 ? '' : c0) + 'n^2';
    };
    var T2 = function (j) { return '(' + j + '^2+' + gk(j) + ')'; };
    var gsum = lin ? (lin === 1 ? '' : lin) + 'kn' : (c0 === 1 ? '' : c0) + 'n^2';
    var extra = lin ? K.cx(lin, 1, '\\frac{k}{n}') : String(c0);
    var poly = lin ? [[1, 3, 'x^3'], [lin, 2, 'x^2']] : [[1, 3, 'x^3'], [c0, 1, 'x']];
    var val = lin ? rat(2 + 3 * lin, 6) : rat(1 + 3 * c0, 3);   /* 1/3 + lin/2 , 1/3 + c0 */
    return expanded('\\frac{1}{n^{3}}', 'n', 'k^{2}+' + gsum, T2,
      function (list) { return '\\frac{1}{n^{3}}\\left\\{' + list + '\\right\\}'; }, val, [
        TXT + LIM + '\\sum_{k=1}^{n}\\frac{k^{2}+' + gsum + '}{n^{3}}',
        '\\frac{k^{2}+' + gsum + '}{n^{3}}=\\frac{1}{n}\\left\\{\\left(\\frac{k}{n}\\right)^{2}+' + extra + '\\right\\}',
        '\\Rightarrow\\int_{0}^{1}(x^{2}+' + (lin ? K.cx(lin, 1, 'x') : c0) + ')\\,dx=\\left[' + K.sum(poly) + '\\right]_{0}^{1}'
      ]);
  }

  /* ---------- 한 세트 ---------- */
  function makeSet() {
    var six = [P2, P3, P4, P5, P6, M.pick([P1, P7])];
    var first = M.shuffle(six).map(function (mk) { return mk(); });
    var rest = M.shuffle([E1, E2, E3, E4]).map(function (mk) { return mk(); });
    return { items: first.concat(rest) };
  }

  window.SU3_SHEETS.series = {
    id: 'series',
    layout: 'series',
    title: '정적분과 급수의 합 쪽지시험',
    total: 10,
    modes: [{ id: 'basic', label: '쪽지시험', sub: '' }],
    note: '※ 정적분을 이용하여 다음 극한값을 구하시오. 7~10번은 합이 나열되어 있으므로 시그마(Σ)로 식을 먼저 나타내고 풀이 과정을 쓰시오.',
    build: function () {
      return K.fourSets(makeSet, function (s) { return s.items.map(function (it) { return it.q; }); });
    }
  };
})();
