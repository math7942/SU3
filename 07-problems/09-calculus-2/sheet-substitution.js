/* 치환적분법 쪽지시험 (기본형)
 *
 * 1번은 치환적분 공식을 쓰는 문제(고정), 2~10번은 치환적분으로 푸는 문제 9개입니다.
 * 9개는 부정적분 7개 + 정적분 2개로, 모두 g(x)=t 로 치환하면 바로 풀리는 꼴입니다.
 * 항목: { q, a, sol: [TeX...], kind: 'i'|'def', integrand, lo?, hi? }
 */
(function () {
  'use strict';

  var M = window.SU3M;
  var K = window.SU3K;
  var DX = '\\,dx';

  function indef(integrand, F, sol) {
    return { kind: 'i', integrand: integrand, q: '\\int ' + integrand + DX, a: F + ' + C', sol: sol };
  }
  function def(lo, hi, integrand, val, sol) {
    return { kind: 'def', lo: lo, hi: hi, integrand: integrand, q: '\\int_{' + lo + '}^{' + hi + '} ' + integrand + DX, a: val, sol: sol };
  }

  /* dt 를 c 로 나눈 꼴 (c 는 0 이 아닌 정수) */
  function dtOver(c) {
    var s = Math.abs(c) === 1 ? 'dt' : '\\frac{dt}{' + Math.abs(c) + '}';
    return (c < 0 ? '-' : '') + s;
  }
  function pw(v, n) { return n === 1 ? v : v + '^{' + n + '}'; }
  function eTex(E) { return E === 1 ? 'e' : 'e^{' + E + '}'; }
  function rat(n, d) { return M.fracTex(n, d); }

  /* ---------- 부정적분 ---------- */
  function S1() {
    var n = M.i(2, 4);
    return indef('\\sin x\\cos^{' + n + '}x', K.cx(-1, n + 1, '\\cos^{' + (n + 1) + '}x'),
      ['t=\\cos x,\\ -\\sin x\\,dx=dt\\ \\Rightarrow\\ -\\int t^{' + n + '}\\,dt=' + K.cx(-1, n + 1, 't^{' + (n + 1) + '}')]);
  }
  function S2() {
    var n = M.i(2, 4);
    return indef('\\cos x\\sin^{' + n + '}x', K.cx(1, n + 1, '\\sin^{' + (n + 1) + '}x'),
      ['t=\\sin x,\\ \\cos x\\,dx=dt\\ \\Rightarrow\\ \\int t^{' + n + '}\\,dt=' + K.cx(1, n + 1, 't^{' + (n + 1) + '}')]);
  }
  function S3() {
    var n = M.i(1, 3);
    return indef(n === 1 ? '\\frac{\\ln x}{x}' : '\\frac{(\\ln x)^{' + n + '}}{x}', K.cx(1, n + 1, pw('(\\ln x)', n + 1)),
      ['t=\\ln x,\\ \\frac{1}{x}\\,dx=dt\\ \\Rightarrow\\ \\int ' + pw('t', n) + '\\,dt=' + K.cx(1, n + 1, pw('t', n + 1))]);
  }
  function S4() {
    return indef('\\frac{1}{x\\ln x}', '\\ln|\\ln x|',
      ['t=\\ln x,\\ \\frac{1}{x}\\,dx=dt\\ \\Rightarrow\\ \\int\\frac{1}{t}\\,dt=\\ln|t|']);
  }
  function S5() {
    var a = M.pick([1, 1, 2, 3]), b = M.pick([-1, 1, 2, 3, 4]), n = M.i(2, 4);
    var Q = M.poly([[a, 'x^2'], [b, '']]);
    return indef('x(' + Q + ')^{' + n + '}', K.cx(1, 2 * a * (n + 1), '(' + Q + ')^{' + (n + 1) + '}'),
      ['t=' + Q + ',\\ x\\,dx=' + dtOver(2 * a) + '\\ \\Rightarrow\\ ' + K.cx(1, 2 * a, '\\int t^{' + n + '}\\,dt') + '=' + K.cx(1, 2 * a * (n + 1), 't^{' + (n + 1) + '}')]);
  }
  function S6() {
    var a = M.pick([2, 3, 4, 5, -1]), n = M.i(2, 4), b;
    b = a === -1 ? M.pick([2, 3, 4, 5]) : M.pick([-3, -2, -1, 1, 2, 3, 4]);
    var L = K.linP(a, b);
    return indef('(' + L + ')^{' + n + '}', K.cx(1, a * (n + 1), '(' + L + ')^{' + (n + 1) + '}'),
      ['t=' + L + ',\\ dt=' + (a === -1 ? '-' : a) + '\\,dx\\ \\Rightarrow\\ ' + K.cx(1, a, '\\int t^{' + n + '}\\,dt') + '=' + K.cx(1, a * (n + 1), 't^{' + (n + 1) + '}')]);
  }
  function S7() {
    var a, ex, c;
    if (Math.random() < 0.55) {
      a = M.pick([1, 2, 3, -1]);
      ex = a === 1 ? 'x^2' : (a === -1 ? '-x^2' : a + 'x^2');
      return indef('xe^{' + ex + '}', K.cx(1, 2 * a, 'e^{' + ex + '}'),
        ['t=' + ex + ',\\ x\\,dx=' + dtOver(2 * a) + '\\ \\Rightarrow\\ ' + K.cx(1, 2 * a, '\\int e^{t}\\,dt')]);
    }
    a = M.pick([1, 2]);
    ex = a === 1 ? 'x^3' : a + 'x^3';
    c = 3 * a;
    return indef('x^2e^{' + ex + '}', K.cx(1, c, 'e^{' + ex + '}'),
      ['t=' + ex + ',\\ x^2\\,dx=' + dtOver(c) + '\\ \\Rightarrow\\ ' + K.cx(1, c, '\\int e^{t}\\,dt')]);
  }
  function S8() {
    var a = M.pick([1, 1, 2, 3]), b = M.i(1, 4);
    var Q = M.poly([[a, 'x^2'], [b, '']]);
    return indef('\\frac{x}{' + Q + '}', K.cx(1, 2 * a, '\\ln(' + Q + ')'),
      ['t=' + Q + ',\\ x\\,dx=' + dtOver(2 * a) + '\\ \\Rightarrow\\ ' + K.cx(1, 2 * a, '\\int\\frac{1}{t}\\,dt') + '=' + K.cx(1, 2 * a, '\\ln|t|')]);
  }
  function S9() {
    var a = M.pick([1, 1, 2]), b = M.i(1, 3);
    var Q = M.poly([[a, 'x^3'], [b, '']]);
    return indef('\\frac{x^2}{' + Q + '}', K.cx(1, 3 * a, '\\ln|' + Q + '|'),
      ['t=' + Q + ',\\ x^2\\,dx=' + dtOver(3 * a) + '\\ \\Rightarrow\\ ' + K.cx(1, 3 * a, '\\int\\frac{1}{t}\\,dt') + '=' + K.cx(1, 3 * a, '\\ln|t|')]);
  }
  function S10() {
    var p = M.pick([1, 2]), a = M.pick([1, 1, 2]), b = M.i(1, 4);
    var Q = M.poly([[a, 'x^2'], [b, '']]);
    return indef('\\frac{' + (p === 1 ? 'x' : p + 'x') + '}{\\sqrt{' + Q + '}}', K.cx(p, a, '\\sqrt{' + Q + '}'),
      ['t=' + Q + ',\\ x\\,dx=' + dtOver(2 * a) + '\\ \\Rightarrow\\ ' + K.cx(p, 2 * a, '\\int t^{-\\frac{1}{2}}\\,dt') + '=' + K.cx(p, a, 't^{\\frac{1}{2}}')]);
  }
  var INDEF = [S1, S2, S3, S4, S5, S5, S6, S7, S8, S9, S10];

  /* ---------- 정적분 ---------- */
  function D1() {
    var n = M.i(2, 4), half = Math.random() < 0.5;
    if (half) {
      return def('0', '\\frac{\\pi}{2}', '\\cos x\\sin^{' + n + '}x', rat(1, n + 1),
        ['t=\\sin x,\\ \\cos x\\,dx=dt,\\ x:0\\to\\frac{\\pi}{2}\\Rightarrow t:0\\to1',
          '\\int_{0}^{1}' + pw('t', n) + '\\,dt=' + rat(1, n + 1)]);
    }
    return def('0', '\\frac{\\pi}{6}', '\\cos x\\sin^{' + n + '}x', rat(1, (n + 1) * Math.pow(2, n + 1)),
      ['t=\\sin x,\\ \\cos x\\,dx=dt,\\ x:0\\to\\frac{\\pi}{6}\\Rightarrow t:0\\to\\frac{1}{2}',
        '\\int_{0}^{\\frac{1}{2}}t^{' + n + '}\\,dt=\\left[\\frac{t^{' + (n + 1) + '}}{' + (n + 1) + '}\\right]_{0}^{\\frac{1}{2}}=' + rat(1, (n + 1) * Math.pow(2, n + 1))]);
  }
  function D2() {
    var n = M.i(2, 4), half = Math.random() < 0.5, pwr = Math.pow(2, n + 1);
    if (half) {
      return def('0', '\\frac{\\pi}{2}', '\\sin x\\cos^{' + n + '}x', rat(1, n + 1),
        ['t=\\cos x,\\ -\\sin x\\,dx=dt,\\ x:0\\to\\frac{\\pi}{2}\\Rightarrow t:1\\to0',
          '-\\int_{1}^{0}t^{' + n + '}\\,dt=\\int_{0}^{1}t^{' + n + '}\\,dt=' + rat(1, n + 1)]);
    }
    return def('0', '\\frac{\\pi}{3}', '\\sin x\\cos^{' + n + '}x', rat(pwr - 1, (n + 1) * pwr),
      ['t=\\cos x,\\ -\\sin x\\,dx=dt,\\ x:0\\to\\frac{\\pi}{3}\\Rightarrow t:1\\to\\frac{1}{2}',
        '-\\int_{1}^{\\frac{1}{2}}t^{' + n + '}\\,dt=\\int_{\\frac{1}{2}}^{1}t^{' + n + '}\\,dt=\\left[\\frac{t^{' + (n + 1) + '}}{' + (n + 1) + '}\\right]_{\\frac{1}{2}}^{1}=' + rat(pwr - 1, (n + 1) * pwr)]);
  }
  function D3() {
    var n = M.i(1, 3);
    return def('1', 'e', n === 1 ? '\\frac{\\ln x}{x}' : '\\frac{(\\ln x)^{' + n + '}}{x}', rat(1, n + 1),
      ['t=\\ln x,\\ \\frac{1}{x}\\,dx=dt,\\ x:1\\to e\\Rightarrow t:0\\to1',
        '\\int_{0}^{1}' + pw('t', n) + '\\,dt=' + rat(1, n + 1)]);
  }
  function D4() {
    var ab = M.pick([[1, 1], [1, 2], [1, 3], [-1, 1], [-1, 2], [2, 1], [2, 2]]), n = M.i(2, 4);
    var a = ab[0], b = ab[1];
    var Q = K.quadP(a, b);
    var num = Math.pow(a + b, n + 1) - Math.pow(b, n + 1), den = 2 * a * (n + 1);
    return def('0', '1', 'x(' + Q + ')^{' + n + '}', rat(num, den),
      ['t=' + Q + ',\\ x\\,dx=' + dtOver(2 * a) + ',\\ x:0\\to1\\Rightarrow t:' + b + '\\to' + (a + b),
        K.cx(1, 2 * a, '\\int_{' + b + '}^{' + (a + b) + '}t^{' + n + '}\\,dt') + '=' + K.cx(1, 2 * a, '\\left[\\frac{t^{' + (n + 1) + '}}{' + (n + 1) + '}\\right]_{' + b + '}^{' + (a + b) + '}') + '=' + rat(num, den)]);
  }
  function D5() {
    var m = M.i(1, 3), b = M.pick([1, 1, 2, 3, 4]);
    var Q = M.poly([[1, 'x^2'], [b, '']]);
    var val = K.cx(1, 2, K.lnFrac(m * m + b, b));
    return def('0', String(m), '\\frac{x}{' + Q + '}', val,
      ['t=' + Q + ',\\ x\\,dx=\\frac{dt}{2},\\ x:0\\to' + m + '\\Rightarrow t:' + b + '\\to' + (m * m + b),
        '\\frac{1}{2}\\int_{' + b + '}^{' + (m * m + b) + '}\\frac{1}{t}\\,dt=\\frac{1}{2}\\left[\\ln|t|\\right]_{' + b + '}^{' + (m * m + b) + '}=' + val]);
  }
  function D6() {
    var u, a, c, ex, E, val, sol0;
    if (Math.random() < 0.55) {
      a = M.pick([1, 1, 2, -1]); u = a === 2 ? 1 : M.pick([1, 2]); c = 2;
      ex = a === 1 ? 'x^2' : (a === -1 ? '-x^2' : a + 'x^2');
      E = a * u * u;
      sol0 = ['t=' + ex + ',\\ x\\,dx=' + dtOver(2 * a) + ',\\ x:0\\to' + u + '\\Rightarrow t:0\\to' + E,
        K.cx(1, 2 * a, '\\int_{0}^{' + E + '}e^{t}\\,dt') + '=' + K.cx(1, 2 * a, '\\left[e^{t}\\right]_{0}^{' + E + '}')];
      val = a > 0 ? '\\frac{' + eTex(E) + '-1}{' + (c * a) + '}' : '\\frac{1-' + eTex(E) + '}{' + (c * -a) + '}';
      return def('0', String(u), 'xe^{' + ex + '}', val, sol0);
    }
    a = M.pick([1, 1, -1]); u = a === -1 ? 1 : M.pick([1, 2]); c = 3;
    ex = a === 1 ? 'x^3' : '-x^3';
    E = a * u * u * u;
    sol0 = ['t=' + ex + ',\\ x^2\\,dx=' + dtOver(3 * a) + ',\\ x:0\\to' + u + '\\Rightarrow t:0\\to' + E,
      K.cx(1, 3 * a, '\\int_{0}^{' + E + '}e^{t}\\,dt') + '=' + K.cx(1, 3 * a, '\\left[e^{t}\\right]_{0}^{' + E + '}')];
    val = a > 0 ? '\\frac{' + eTex(E) + '-1}{3}' : '\\frac{1-' + eTex(E) + '}{3}';
    return def('0', String(u), 'x^2e^{' + ex + '}', val, sol0);
  }
  function D7() {
    var t = M.pick([[3, 16, '1'], [4, 9, '2'], [2, 5, '3-\\sqrt{5}'], [1, 3, '2-\\sqrt{3}'], [1, 8, '3-2\\sqrt{2}'], [3, 7, '4-\\sqrt{7}'], [4, 20, '6-2\\sqrt{5}'], [2, 12, '4-2\\sqrt{3}']]);
    var m = t[0], b = t[1];
    return def('0', String(m), '\\frac{x}{\\sqrt{x^2+' + b + '}}', t[2],
      ['t=x^2+' + b + ',\\ x\\,dx=\\frac{dt}{2},\\ x:0\\to' + m + '\\Rightarrow t:' + b + '\\to' + (m * m + b),
        '\\frac{1}{2}\\int_{' + b + '}^{' + (m * m + b) + '}t^{-\\frac{1}{2}}\\,dt=\\left[\\sqrt{t}\\right]_{' + b + '}^{' + (m * m + b) + '}=' + t[2]]);
  }
  function D8() {
    var a = M.pick([2, 3, 4]), b = M.pick([1, 2]), n = M.i(2, 3);
    var L = K.lin(a, b);
    var num = Math.pow(a + b, n + 1) - Math.pow(b, n + 1), den = a * (n + 1);
    return def('0', '1', '(' + L + ')^{' + n + '}', rat(num, den),
      ['t=' + L + ',\\ dt=' + a + '\\,dx,\\ x:0\\to1\\Rightarrow t:' + b + '\\to' + (a + b),
        K.cx(1, a, '\\int_{' + b + '}^{' + (a + b) + '}t^{' + n + '}\\,dt') + '=' + K.cx(1, a, '\\left[\\frac{t^{' + (n + 1) + '}}{' + (n + 1) + '}\\right]_{' + b + '}^{' + (a + b) + '}') + '=' + rat(num, den)]);
  }
  function D9() {
    var t = M.pick(['e1', 'e2', 'l1', 'l2']);
    if (t === 'e1') {
      return def('0', '\\frac{\\pi}{2}', '\\cos x\\,e^{\\sin x}', 'e-1',
        ['t=\\sin x,\\ \\cos x\\,dx=dt,\\ x:0\\to\\frac{\\pi}{2}\\Rightarrow t:0\\to1', '\\int_{0}^{1}e^{t}\\,dt=\\left[e^{t}\\right]_{0}^{1}=e-1']);
    }
    if (t === 'e2') {
      return def('0', '\\frac{\\pi}{2}', '\\sin x\\,e^{\\cos x}', 'e-1',
        ['t=\\cos x,\\ -\\sin x\\,dx=dt,\\ x:0\\to\\frac{\\pi}{2}\\Rightarrow t:1\\to0', '-\\int_{1}^{0}e^{t}\\,dt=\\int_{0}^{1}e^{t}\\,dt=e-1']);
    }
    if (t === 'l1') {
      return def('0', '\\frac{\\pi}{2}', '\\frac{\\cos x}{1+\\sin x}', '\\ln 2',
        ['t=1+\\sin x,\\ \\cos x\\,dx=dt,\\ x:0\\to\\frac{\\pi}{2}\\Rightarrow t:1\\to2', '\\int_{1}^{2}\\frac{1}{t}\\,dt=\\left[\\ln|t|\\right]_{1}^{2}=\\ln 2']);
    }
    return def('0', '\\frac{\\pi}{2}', '\\frac{\\sin x}{1+\\cos x}', '\\ln 2',
      ['t=1+\\cos x,\\ -\\sin x\\,dx=dt,\\ x:0\\to\\frac{\\pi}{2}\\Rightarrow t:2\\to1', '-\\int_{2}^{1}\\frac{1}{t}\\,dt=\\int_{1}^{2}\\frac{1}{t}\\,dt=\\ln 2']);
  }
  var DEFINITE = [D1, D2, D3, D4, D5, D6, D7, D8, D9];

  function makeSet() {
    var seen = {};
    var indefMakers = M.sample(INDEF, 7);
    var defMakers = M.sample(DEFINITE, 2);
    var items = indefMakers.concat(defMakers).map(function (mk) {
      var it, tries = 0;
      do { it = mk(); tries++; } while (seen[it.q] && tries < 40);
      seen[it.q] = true;
      return it;
    });
    return {
      items: [{
        parts: [
          { q: '\\int f(g(x))g\'(x)\\,dx', a: '\\int f(t)\\,dt' },
          { q: '\\int_{a}^{b}f(g(x))g\'(x)\\,dx', a: '\\int_{g(a)}^{g(b)}f(t)\\,dt' }
        ]
      }].concat(M.shuffle(items))
    };
  }

  window.SU3_SHEETS.substitution = {
    id: 'substitution',
    layout: 'quiz',
    title: '치환적분법 쪽지시험',
    total: 10,
    modes: [{ id: 'basic', label: '기본형', sub: '(기본형)' }],
    note: '※ 1번은 g(x)=t로 치환할 때의 공식을 쓰고, 2~10번은 치환적분법으로 구하시오. 풀이 과정을 쓰고, 부정적분에는 적분상수 C를 붙이시오.',
    build: function () {
      return K.fourSets(makeSet, function (s) { return s.items.slice(1).map(function (it) { return it.q; }); });
    }
  };
})();
