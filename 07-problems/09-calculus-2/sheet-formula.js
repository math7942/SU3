/* 미적분 공식 쪽지시험 — 기본형(공식 그대로) / 변형(계수가 붙은 꼴)
 *
 * 한 세트는 미분 공식 16개(왼쪽)와 적분 공식 15개(오른쪽)로 이루어집니다.
 * 항목: { q: 문제 TeX('=' 앞까지), a: 정답 TeX, pre?: 앞에 붙는 글(HTML, 수식은 \\( \\)),
 *         kind: 'd'|'i', expr|integrand: 검산용 식 }
 */
(function () {
  'use strict';

  var M = window.SU3M;
  var K = window.SU3K;

  function ints(a, b) { var r = [], i; for (i = a; i <= b; i++) { r.push(i); } return r; }

  /* ---------- 기본형: 고정된 공식 31개 ---------- */
  function d(q, a) { return { kind: 'd', q: q, a: a }; }
  function i(q, a, pre) { return { kind: 'i', q: '\\int ' + q + '\\,dx', a: a + ' + C', pre: pre }; }

  function basicDiff() {
    return [
      d('\\{\\ln|f(x)|\\}\'', '\\frac{f\'(x)}{f(x)}'),
      d('(e^x)\'', 'e^x'),
      d('(\\cot\\theta)\'', '-\\csc^2\\theta'),
      d('(\\log_a|f(x)|)\'', '\\frac{f\'(x)}{f(x)\\ln a}'),
      d('(\\log_a|x|)\'', '\\frac{1}{x\\ln a}'),
      d('(\\sec\\theta)\'', '\\sec\\theta\\tan\\theta'),
      d('(\\ln|x|)\'', '\\frac{1}{x}'),
      d('(\\csc\\theta)\'', '-\\csc\\theta\\cot\\theta'),
      d('(\\sin x)\'', '\\cos x'),
      d('(\\ln x)\'', '\\frac{1}{x}'),
      d('\\{f(g(x))\\}\'', 'f\'(g(x))\\,g\'(x)'),
      d('(a^x)\'', 'a^x\\ln a'),
      d('(\\ln|f(x)|)\'', '\\frac{f\'(x)}{f(x)}'),
      d('(\\cos x)\'', '-\\sin x'),
      d('(\\log_a x)\'', '\\frac{1}{x\\ln a}'),
      d('(\\tan\\theta)\'', '\\sec^2\\theta')
    ];
  }

  function basicInt() {
    return [
      i('\\csc x\\cot x', '-\\csc x'),
      i('\\frac{-f\'(x)}{\\{f(x)\\}^2}', '\\frac{1}{f(x)}'),
      i('a^x', '\\frac{a^x}{\\ln a}'),
      i('x^{-1}', '\\ln|x|'),
      i('\\tan x', '-\\ln|\\cos x|'),
      i('\\ln x', 'x\\ln x-x'),
      i('x^n', '\\frac{x^{n+1}}{n+1}', '\\(n\\ne -1\\)인 실수일 때, '),
      i('\\frac{f\'(x)}{f(x)}', '\\ln|f(x)|'),
      i('\\cos x', '\\sin x'),
      i('\\sec^2 x', '\\tan x'),
      i('e^x', 'e^x'),
      i('\\sin x', '-\\cos x'),
      i('\\csc^2 x', '-\\cot x'),
      i('\\sec x\\tan x', '\\sec x'),
      i('\\sec x', '\\ln|\\sec x+\\tan x|')
    ];
  }

  /* ---------- 변형: 계수·밑이 바뀐 꼴 ---------- */
  var K25 = ints(2, 5);

  function kv(k, v) { return k + v; }                 /* 3x, 2\theta */
  function dd(expr, a, brace) {
    return { kind: 'd', expr: expr, q: brace ? '\\{' + expr + '\\}\'' : '(' + expr + ')\'', a: a };
  }
  function ii(integrand, F) {
    return { kind: 'i', integrand: integrand, q: '\\int ' + integrand + '\\,dx', a: F + ' + C' };
  }

  /* 다항식 P 와 도함수 (표시용) */
  function pickPoly() {
    var t = M.pick(['q', 'q', 'b', 'c', 'l']);
    var c, b, a;
    if (t === 'q') { c = M.pick([1, 2, 3, 5, -4, -9]); return { p: M.poly([[1, 'x^2'], [c, '']]), dp: '2x' }; }
    if (t === 'b') { b = M.pick([1, 2, 3, -1, -2]); return { p: M.poly([[1, 'x^2'], [b, 'x']]), dp: M.poly([[2, 'x'], [b, '']]) }; }
    if (t === 'c') { b = M.pick([1, -1, 2, 3]); return { p: M.poly([[1, 'x^3'], [b, 'x']]), dp: M.poly([[3, 'x^2'], [b, '']]) }; }
    do { a = M.pick([2, 3, 4, 5]); b = M.pick([-3, -2, -1, 1, 2, 3]); } while (M.gcd(a, Math.abs(b)) !== 1);  /* 약분되는 꼴(3x-3 등)은 피함 */
    return { p: M.poly([[a, 'x'], [b, '']]), dp: String(a) };
  }

  var DIFF_MAKERS = {
    ln1: function () {
      if (Math.random() < 0.5) { return dd('\\ln ' + kv(M.i(2, 6), 'x'), '\\frac{1}{x}'); }
      var n = M.i(2, 4);
      return dd('\\ln x^' + n, '\\frac{' + n + '}{x}');
    },
    ln2: function () {
      if (Math.random() < 0.5) { return dd('\\ln|' + kv(M.i(2, 6), 'x') + '|', '\\frac{1}{x}'); }
      var n = M.i(3, 5);
      return dd('\\ln|x^' + n + '|', '\\frac{' + n + '}{x}');
    },
    exp: function () { var k = M.pick(K25); return dd('e^{' + kv(k, 'x') + '}', k + 'e^{' + kv(k, 'x') + '}'); },
    sin: function () { var k = M.pick(K25); return dd('\\sin ' + kv(k, 'x'), k + '\\cos ' + kv(k, 'x')); },
    cos: function () { var k = M.pick(K25); return dd('\\cos ' + kv(k, 'x'), '-' + k + '\\sin ' + kv(k, 'x')); },
    tan: function () { var k = M.pick(K25); return dd('\\tan ' + kv(k, '\\theta'), k + '\\sec^2 ' + kv(k, '\\theta')); },
    cot: function () { var k = M.pick(K25); return dd('\\cot ' + kv(k, '\\theta'), '-' + k + '\\csc^2 ' + kv(k, '\\theta')); },
    sec: function () {
      var k = M.pick(K25), a = kv(k, '\\theta');
      return dd('\\sec ' + a, k + '\\sec ' + a + '\\tan ' + a);
    },
    csc: function () {
      var k = M.pick(K25), a = kv(k, '\\theta');
      return dd('\\csc ' + a, '-' + k + '\\csc ' + a + '\\cot ' + a);
    },
    logx: function () { var a = M.pick([2, 3, 5, 7]); return dd('\\log_{' + a + '} x', '\\frac{1}{x\\ln ' + a + '}'); },
    logabs: function () { var a = M.pick([2, 3, 5, 7]); return dd('\\log_{' + a + '}|x|', '\\frac{1}{x\\ln ' + a + '}'); },
    pow: function () { var a = M.pick([2, 3, 5, 7]); return dd(a + '^x', a + '^x\\ln ' + a); },
    lnP: function () { var P = pickPoly(); return dd('\\ln|' + P.p + '|', '\\frac{' + P.dp + '}{' + P.p + '}'); },
    logP: function () {
      var P = pickPoly(), a = M.pick([2, 3, 5]);
      return dd('\\log_{' + a + '}|' + P.p + '|', '\\frac{' + P.dp + '}{(' + P.p + ')\\ln ' + a + '}');
    },
    chain: function () {
      var t = M.pick(['lin', 'lin', 'sq', 'cube', 'sin', 'exp', 'ln', 'cos']);
      var k, b, g;
      if (t === 'lin') {
        k = M.pick([2, 3, 4]); b = M.pick([-3, -2, -1, 1, 2, 3]); g = K.lin(k, b);
        return dd('f(' + g + ')', k + 'f\'(' + g + ')', true);
      }
      if (t === 'sq') { return dd('f(x^2)', '2xf\'(x^2)', true); }
      if (t === 'cube') { return dd('f(x^3)', '3x^2f\'(x^3)', true); }
      if (t === 'sin') { return dd('f(\\sin x)', '\\cos x\\,f\'(\\sin x)', true); }
      if (t === 'cos') { return dd('f(\\cos x)', '-\\sin x\\,f\'(\\cos x)', true); }
      if (t === 'exp') { return dd('f(e^x)', 'e^xf\'(e^x)', true); }
      return dd('f(\\ln x)', '\\frac{f\'(\\ln x)}{x}', true);
    },
    lnchain: function () {
      var t = M.pick(['k', 'k', 'b', 'sq', 'cube']);
      var k, b;
      if (t === 'k') { k = M.pick([2, 3, 4, 5]); return dd('\\ln|f(' + kv(k, 'x') + ')|', '\\frac{' + k + 'f\'(' + kv(k, 'x') + ')}{f(' + kv(k, 'x') + ')}', true); }
      if (t === 'b') { b = M.pick([-3, -2, -1, 1, 2, 3]); return dd('\\ln|f(' + K.lin(1, b) + ')|', '\\frac{f\'(' + K.lin(1, b) + ')}{f(' + K.lin(1, b) + ')}', true); }
      if (t === 'sq') { return dd('\\ln|f(x^2)|', '\\frac{2xf\'(x^2)}{f(x^2)}', true); }
      return dd('\\ln|f(x^3)|', '\\frac{3x^2f\'(x^3)}{f(x^3)}', true);
    }
  };
  var DIFF_ORDER = ['ln1', 'exp', 'sin', 'cos', 'tan', 'cot', 'sec', 'csc', 'logx', 'logabs', 'pow', 'lnP', 'logP', 'chain', 'lnchain', 'ln2'];

  /* ln P' / P 와 -P'/P^2 는 같은 P 를 공유하는 짝으로 냅니다. */
  function pickPair() {
    var t = M.pick(['q', 'xx', 'cube', 'exp', 'sin', 'q2', 'c3']);
    var c;
    if (t === 'q') { c = M.i(1, 5); return { p: 'x^2+' + c, dp: '2x', dpTex: '2x', ln: '\\ln(x^2+' + c + ')' }; }
    if (t === 'xx') { c = M.i(1, 3); return { p: 'x^2+x+' + c, dp: '2x+1', dpTex: '(2x+1)', multi: true, ln: '\\ln(x^2+x+' + c + ')' }; }
    if (t === 'cube') { return { p: 'x^3+1', dp: '3x^2', dpTex: '3x^2', ln: '\\ln|x^3+1|' }; }
    if (t === 'exp') { c = M.i(1, 3); return { p: 'e^x+' + c, dp: 'e^x', dpTex: 'e^x', ln: '\\ln(e^x+' + c + ')' }; }
    if (t === 'sin') { return { p: '\\sin x+2', dp: '\\cos x', dpTex: '\\cos x', ln: '\\ln(\\sin x+2)' }; }
    if (t === 'q2') { return { p: '2x^2+1', dp: '4x', dpTex: '4x', ln: '\\ln(2x^2+1)' }; }
    return { p: 'x^3+x', dp: '3x^2+1', dpTex: '(3x^2+1)', multi: true, ln: '\\ln|x^3+x|' };
  }

  var INT_MAKERS = {
    pow: function () { var a = M.pick([2, 3, 4, 5, 7]); return ii(a + '^x', '\\frac{' + a + '^x}{\\ln ' + a + '}'); },
    cos: function () { var k = M.pick(K25); return ii('\\cos ' + kv(k, 'x'), K.cx(1, k, '\\sin ' + kv(k, 'x'))); },
    sin: function () { var k = M.pick(K25); return ii('\\sin ' + kv(k, 'x'), K.cx(-1, k, '\\cos ' + kv(k, 'x'))); },
    csc2: function () { var k = M.pick(K25); return ii('\\csc^2 ' + kv(k, 'x'), K.cx(-1, k, '\\cot ' + kv(k, 'x'))); },
    sec2: function () { var k = M.pick(K25); return ii('\\sec^2 ' + kv(k, 'x'), K.cx(1, k, '\\tan ' + kv(k, 'x'))); },
    sectan: function () { var k = M.pick(K25), a = kv(k, 'x'); return ii('\\sec ' + a + '\\tan ' + a, K.cx(1, k, '\\sec ' + a)); },
    csccot: function () { var k = M.pick(K25), a = kv(k, 'x'); return ii('\\csc ' + a + '\\cot ' + a, K.cx(-1, k, '\\csc ' + a)); },
    xn: function () { var n = M.i(2, 9); return ii('x^{' + n + '}', '\\frac{x^{' + (n + 1) + '}}{' + (n + 1) + '}'); },
    inv: function () { var k = M.i(2, 6); return ii(k + 'x^{-1}', k + '\\ln|x|'); },
    ln: function () { var k = M.i(2, 6), a = kv(k, 'x'); return ii('\\ln ' + a, 'x\\ln ' + a + '-x'); },
    tan: function () { var k = M.pick(K25), a = kv(k, 'x'); return ii('\\tan ' + a, K.cx(-1, k, '\\ln|\\cos ' + a + '|')); },
    sec: function () { var k = M.pick(K25), a = kv(k, 'x'); return ii('\\sec ' + a, K.cx(1, k, '\\ln|\\sec ' + a + '+\\tan ' + a + '|')); },
    exp: function () {
      var k = M.pick([2, 3, 4, 5, -1]);
      if (k === -1) { return ii('e^{-x}', '-e^{-x}'); }
      return ii('e^{' + kv(k, 'x') + '}', K.cx(1, k, 'e^{' + kv(k, 'x') + '}'));
    }
  };
  var INT_ORDER = ['pow', 'cos', 'sin', 'csc2', 'sec2', 'sectan', 'csccot', 'xn', 'inv', 'ln', 'tan', 'sec', 'exp'];

  function variantSet() {
    var left = DIFF_ORDER.map(function (name) { return DIFF_MAKERS[name](); });
    var right = INT_ORDER.map(function (name) { return INT_MAKERS[name](); });
    var P = pickPair();
    right.push(ii('\\frac{' + P.dp + '}{' + P.p + '}', P.ln));
    right.push(ii('\\frac{-' + P.dpTex + '}{(' + P.p + ')^2}', '\\frac{1}{' + P.p + '}'));
    return { left: M.shuffle(left), right: M.shuffle(right) };
  }

  function basicSet() {
    return { left: M.shuffle(basicDiff()), right: M.shuffle(basicInt()) };
  }

  window.SU3_SHEETS.formula = {
    id: 'formula',
    layout: 'formula',
    title: '미적분 공식 쪽지시험',
    total: 31,
    modes: [
      { id: 'basic', label: '기본형', sub: '' },
      { id: 'variant', label: '변형', sub: '(변형)' }
    ],
    note: '',
    build: function (modeId) {
      if (modeId === 'basic') {
        /* 기본형은 같은 31개 공식의 순서만 세트마다 섞습니다. */
        return K.fourSets(basicSet, function () { return []; });
      }
      return K.fourSets(variantSet, function (s) {
        return s.left.concat(s.right).map(function (it) { return it.q; });
      });
    }
  };
})();
