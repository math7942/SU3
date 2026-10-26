/* 부분적분법 쪽지시험 (기본형)
 *
 * 1번은 부분적분 공식을 쓰는 문제(고정), 2~10번은 부분적분으로 푸는 문제 9개입니다.
 * 9개는 부정적분 7개 + 정적분 2개입니다.
 * 풀이는 f(미분할 쪽), g'(적분할 쪽)을 먼저 밝히고 fg - ∫f'g 로 이어집니다.
 */
(function () {
  'use strict';

  var M = window.SU3M;
  var K = window.SU3K;
  var DX = '\\,dx';
  var AGAIN = '\\quad(\\text{한 번 더 부분적분})';

  function indef(integrand, F, sol) {
    return { kind: 'i', integrand: integrand, q: '\\int ' + integrand + DX, a: F + ' + C', sol: sol };
  }
  function def(lo, hi, integrand, val, sol) {
    return { kind: 'def', lo: lo, hi: hi, integrand: integrand, q: '\\int_{' + lo + '}^{' + hi + '} ' + integrand + DX, a: val, sol: sol };
  }
  function rat(n, d) { return M.fracTex(n, d); }
  function eTex(E) { return E === 1 ? 'e' : 'e^{' + E + '}'; }
  function ekx(k) { return k === 1 ? 'e^x' : (k === -1 ? 'e^{-x}' : 'e^{' + k + 'x}'); }

  /* ---------- 부정적분 ---------- */

  /* (px+q)e^{kx} */
  function A() {
    var k = M.pick([1, 1, 1, 1, 2, 3, -1]);
    var p = 1, q = 0;
    if (k === 1) {
      p = M.pick([1, 1, 2, 3, 4]);
      q = M.pick([-2, -1, 0, 1, 2, 3, 4]);
      if (p === 1 && q === 0) { q = M.pick([1, 2, 3]); }
    }
    var P = K.lin(p, q);
    var body = q === 0 ? P : '(' + P + ')';
    var E = ekx(k);
    var A1 = p * k, A0 = q * k - p, D = k * k;
    var neg = A1 < 0;
    if (neg) { A1 = -A1; A0 = -A0; }
    var poly = K.lin(A1, A0);
    var ans = (neg ? '-' : '') + (D === 1 ? (A0 === 0 ? poly : '(' + poly + ')') + E : '\\frac{' + poly + '}{' + D + '}' + E);
    var first = Math.abs(k) === 1 ? (k === 1 ? '' : '-') + body + E : '\\frac{' + P + '}{' + k + '}' + E;
    var sol = 'f=' + P + ',\\ g\'=' + E + '\\ \\Rightarrow\\ ' + K.sum([[1, 1, first], [-p, k, '\\int ' + E + '\\,dx']]);
    return indef(body + E, ans, [sol]);
  }

  /* x sin kx, x cos kx */
  function xk(k) { return k === 1 ? 'x' : '\\frac{x}{' + k + '}'; }
  function Bs() {
    var k = M.i(1, 4), a = k === 1 ? 'x' : k + 'x';
    return indef('x\\sin ' + a, '-' + xk(k) + '\\cos ' + a + ' + ' + K.cx(1, k * k, '\\sin ' + a),
      ['f=x,\\ g\'=\\sin ' + a + '\\ \\Rightarrow\\ -' + xk(k) + '\\cos ' + a + '+' + K.cx(1, k, '\\int\\cos ' + a + '\\,dx')]);
  }
  function Bc() {
    var k = M.i(1, 4), a = k === 1 ? 'x' : k + 'x';
    return indef('x\\cos ' + a, xk(k) + '\\sin ' + a + ' + ' + K.cx(1, k * k, '\\cos ' + a),
      ['f=x,\\ g\'=\\cos ' + a + '\\ \\Rightarrow\\ ' + xk(k) + '\\sin ' + a + '-' + K.cx(1, k, '\\int\\sin ' + a + '\\,dx')]);
  }

  /* ln kx */
  function C() {
    var k = M.pick([1, 2, 3, 5]), a = k === 1 ? 'x' : k + 'x';
    return indef('\\ln ' + a, 'x\\ln ' + a + '-x',
      ['f=\\ln ' + a + ',\\ g\'=1\\ \\Rightarrow\\ x\\ln ' + a + '-\\int x\\cdot\\frac{1}{x}\\,dx']);
  }

  /* x^n ln x */
  function Dn() {
    var n = M.i(1, 3), m = n + 1;
    var xn = n === 1 ? 'x' : 'x^{' + n + '}';
    return indef(xn + '\\ln x', '\\frac{x^{' + m + '}}{' + m + '}\\ln x-\\frac{x^{' + m + '}}{' + (m * m) + '}',
      ['f=\\ln x,\\ g\'=' + xn + '\\ \\Rightarrow\\ \\frac{x^{' + m + '}}{' + m + '}\\ln x-\\int\\frac{' + xn + '}{' + m + '}\\,dx']);
  }

  /* x^2 e^{kx} */
  function E2() {
    var k = M.pick([1, 1, -1, 2]);
    var Ek = ekx(k), ans, line1, line2;
    if (k === 1) {
      ans = '(x^2-2x+2)e^x';
      line1 = 'f=x^2,\\ g\'=e^x\\ \\Rightarrow\\ x^2e^x-2\\int xe^x\\,dx' + AGAIN;
      line2 = '=x^2e^x-2(x-1)e^x';
    } else if (k === -1) {
      ans = '-(x^2+2x+2)e^{-x}';
      line1 = 'f=x^2,\\ g\'=e^{-x}\\ \\Rightarrow\\ -x^2e^{-x}+2\\int xe^{-x}\\,dx' + AGAIN;
      line2 = '=-x^2e^{-x}-2(x+1)e^{-x}';
    } else {
      ans = '\\frac{2x^2-2x+1}{4}e^{2x}';
      line1 = 'f=x^2,\\ g\'=e^{2x}\\ \\Rightarrow\\ \\frac{x^2}{2}e^{2x}-\\int xe^{2x}\\,dx' + AGAIN;
      line2 = '=\\frac{x^2}{2}e^{2x}-\\frac{2x-1}{4}e^{2x}';
    }
    return indef('x^2' + Ek, ans, [line1, line2]);
  }

  /* x^2 sin x, x^2 cos x */
  function Fs() {
    return indef('x^2\\sin x', '-x^2\\cos x+2x\\sin x+2\\cos x',
      ['f=x^2,\\ g\'=\\sin x\\ \\Rightarrow\\ -x^2\\cos x+2\\int x\\cos x\\,dx' + AGAIN, '=-x^2\\cos x+2(x\\sin x+\\cos x)']);
  }
  function Fc() {
    return indef('x^2\\cos x', 'x^2\\sin x+2x\\cos x-2\\sin x',
      ['f=x^2,\\ g\'=\\cos x\\ \\Rightarrow\\ x^2\\sin x-2\\int x\\sin x\\,dx' + AGAIN, '=x^2\\sin x-2(-x\\cos x+\\sin x)']);
  }

  /* ln x / x^m */
  function G() {
    var m = M.pick([2, 3]);
    if (m === 2) {
      return indef('\\frac{\\ln x}{x^2}', '-\\frac{\\ln x}{x}-\\frac{1}{x}',
        ['f=\\ln x,\\ g\'=x^{-2}\\ \\Rightarrow\\ -\\frac{\\ln x}{x}+\\int\\frac{1}{x^2}\\,dx']);
    }
    return indef('\\frac{\\ln x}{x^3}', '-\\frac{\\ln x}{2x^2}-\\frac{1}{4x^2}',
      ['f=\\ln x,\\ g\'=x^{-3}\\ \\Rightarrow\\ -\\frac{\\ln x}{2x^2}+\\frac{1}{2}\\int\\frac{1}{x^3}\\,dx']);
  }

  var INDEF = [A, A, Bs, Bc, C, Dn, E2, Fs, Fc, G];

  /* ---------- 정적분 ---------- */
  function Dsin() {
    var t = M.pick(['pi', 'half']);
    if (t === 'pi') {
      return def('0', '\\pi', 'x\\sin x', '\\pi',
        ['f=x,\\ g\'=\\sin x\\ \\Rightarrow\\ \\left[-x\\cos x\\right]_{0}^{\\pi}+\\int_{0}^{\\pi}\\cos x\\,dx=\\pi+0']);
    }
    return def('0', '\\frac{\\pi}{2}', 'x\\sin x', '1',
      ['f=x,\\ g\'=\\sin x\\ \\Rightarrow\\ \\left[-x\\cos x\\right]_{0}^{\\frac{\\pi}{2}}+\\int_{0}^{\\frac{\\pi}{2}}\\cos x\\,dx=0+1']);
  }
  function Dcos() {
    var t = M.pick(['pi', 'half']);
    if (t === 'pi') {
      return def('0', '\\pi', 'x\\cos x', '-2',
        ['f=x,\\ g\'=\\cos x\\ \\Rightarrow\\ \\left[x\\sin x\\right]_{0}^{\\pi}-\\int_{0}^{\\pi}\\sin x\\,dx=0-2']);
    }
    return def('0', '\\frac{\\pi}{2}', 'x\\cos x', '\\frac{\\pi}{2}-1',
      ['f=x,\\ g\'=\\cos x\\ \\Rightarrow\\ \\left[x\\sin x\\right]_{0}^{\\frac{\\pi}{2}}-\\int_{0}^{\\frac{\\pi}{2}}\\sin x\\,dx=\\frac{\\pi}{2}-1']);
  }
  function Dexp() {
    var t = M.pick([[1, 0, 1], [1, 0, 2], [1, 0, 3], [1, 1, 1], [2, 1, 1], [1, 2, 1], [2, 0, 1], [1, -1, 1], [3, 1, 1]]);
    var p = t[0], q = t[1], m = t[2];
    var P = K.lin(p, q), body = q === 0 ? P : '(' + P + ')';
    var Acoef = p * m + q - p, B = p - q;
    var val = K.sum([[Acoef, 1, eTex(m)], [B, 1, '']]);
    return def('0', String(m), body + 'e^x', val,
      ['f=' + P + ',\\ g\'=e^x\\ \\Rightarrow\\ \\left[' + body + 'e^x\\right]_{0}^{' + m + '}-' + K.cx(p, 1, '\\int_{0}^{' + m + '}e^x\\,dx'),
        '=' + K.sum([[p * m + q, 1, eTex(m)], [-q, 1, '']]) + '-' + (p === 1 ? '' : p) + '(' + eTex(m) + '-1)=' + val]);
  }
  function Dexp2() {
    var m = M.pick([1, 1, 2]);
    var val = m === 1 ? '\\frac{e^{2}+1}{4}' : '\\frac{3e^{4}+1}{4}';
    return def('0', String(m), 'xe^{2x}', val,
      ['f=x,\\ g\'=e^{2x}\\ \\Rightarrow\\ \\left[\\frac{x}{2}e^{2x}\\right]_{0}^{' + m + '}-\\frac{1}{2}\\int_{0}^{' + m + '}e^{2x}\\,dx',
        '=' + (m === 1 ? '\\frac{e^{2}}{2}-\\frac{e^{2}-1}{4}' : 'e^{4}-\\frac{e^{4}-1}{4}') + '=' + val]);
  }
  function Dln() {
    var t = M.pick(['ln', 'xln', 'x2ln', 'ln2', 'lnx2']);
    if (t === 'ln') {
      return def('1', 'e', '\\ln x', '1', ['f=\\ln x,\\ g\'=1\\ \\Rightarrow\\ \\left[x\\ln x\\right]_{1}^{e}-\\int_{1}^{e}1\\,dx=e-(e-1)']);
    }
    if (t === 'xln') {
      return def('1', 'e', 'x\\ln x', '\\frac{e^{2}+1}{4}',
        ['f=\\ln x,\\ g\'=x\\ \\Rightarrow\\ \\left[\\frac{x^{2}}{2}\\ln x\\right]_{1}^{e}-\\int_{1}^{e}\\frac{x}{2}\\,dx=\\frac{e^{2}}{2}-\\frac{e^{2}-1}{4}']);
    }
    if (t === 'x2ln') {
      return def('1', 'e', 'x^2\\ln x', '\\frac{2e^{3}+1}{9}',
        ['f=\\ln x,\\ g\'=x^2\\ \\Rightarrow\\ \\left[\\frac{x^{3}}{3}\\ln x\\right]_{1}^{e}-\\int_{1}^{e}\\frac{x^{2}}{3}\\,dx=\\frac{e^{3}}{3}-\\frac{e^{3}-1}{9}']);
    }
    if (t === 'ln2') {
      return def('1', '2', '\\ln x', '2\\ln 2-1',
        ['f=\\ln x,\\ g\'=1\\ \\Rightarrow\\ \\left[x\\ln x\\right]_{1}^{2}-\\int_{1}^{2}1\\,dx=2\\ln 2-1']);
    }
    return def('1', 'e', '\\frac{\\ln x}{x^2}', '1-\\frac{2}{e}',
      ['f=\\ln x,\\ g\'=x^{-2}\\ \\Rightarrow\\ \\left[-\\frac{\\ln x}{x}\\right]_{1}^{e}+\\int_{1}^{e}\\frac{1}{x^2}\\,dx=-\\frac{1}{e}+\\left(1-\\frac{1}{e}\\right)']);
  }
  var DEFINITE = [Dsin, Dcos, Dexp, Dexp2, Dln];

  function makeSet() {
    var seen = {};
    var makers = M.sample(INDEF, 7).concat(M.sample(DEFINITE, 2));
    var items = makers.map(function (mk) {
      var it, tries = 0;
      do { it = mk(); tries++; } while (seen[it.q] && tries < 40);
      seen[it.q] = true;
      return it;
    });
    return {
      items: [{
        tagged: true,
        parts: [{ q: '\\int f(x)g\'(x)\\,dx', a: 'f(x)g(x)-\\int f\'(x)g(x)\\,dx' }]
      }].concat(M.shuffle(items))
    };
  }

  window.SU3_SHEETS.parts = {
    id: 'parts',
    layout: 'quiz',
    title: '부분적분법 쪽지시험',
    total: 10,
    modes: [{ id: 'basic', label: '기본형', sub: '(기본형)' }],
    note: '※ 1번은 공식을 쓰고, 2~10번은 부분적분법으로 구하시오. 풀이 과정을 쓰고, 부정적분에는 적분상수 C를 붙이시오.',
    build: function () {
      return K.fourSets(makeSet, function (s) { return s.items.slice(1).map(function (it) { return it.q; }); });
    }
  };
})();
