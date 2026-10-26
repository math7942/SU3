/* 쪽지시험 출력용 문제 생성 도우미 (window.SU3K)
 *
 * problems.js 가 먼저 불러와져 window.SU3M 이 있어야 합니다.
 * 수식은 모두 TeX 문자열로 만들고, 화면에 그리는 일은 sheets.js 가 맡습니다.
 */
(function () {
  'use strict';

  var M = window.SU3M;
  var K = {};
  window.SU3K = K;

  /* 계수 n/d 를 body 에 곱한 TeX. body 가 비어 있으면 상수.
   * abs 가 true 이면 부호를 떼고 크기만 적습니다. (합을 만들 때 부호를 따로 붙이기 위해) */
  K.cx = function (n, d, body, abs) {
    var f = M.frac(n, d === undefined ? 1 : d);
    var neg = f[0] < 0;
    var a = Math.abs(f[0]);
    var s;
    body = body || '';
    if (body === '') {
      s = f[1] === 1 ? String(a) : '\\frac{' + a + '}{' + f[1] + '}';
    } else if (f[1] === 1) {
      s = a === 1 ? body : a + (/^[0-9]/.test(body) ? '\\cdot ' : '') + body;
    } else {
      s = '\\frac{' + a + '}{' + f[1] + '}' + body;
    }
    return (neg && !abs ? '-' : '') + s;
  };

  /* [[분자, 분모, 식], ...] 를 부호까지 맞춰 이어 붙입니다. 계수가 0 인 항은 건너뜁니다. */
  K.sum = function (terms) {
    var out = '';
    terms.forEach(function (t) {
      var f = M.frac(t[0], t[1] === undefined ? 1 : t[1]);
      if (f[0] === 0) { return; }
      var body = t[2] || '';
      if (out === '') {
        out = K.cx(f[0], f[1], body);
      } else {
        out += (f[0] < 0 ? ' - ' : ' + ') + K.cx(f[0], f[1], body, true);
      }
    });
    return out === '' ? '0' : out;
  };

  /* 완전제곱수·세제곱수 등이면 [밑, 지수], 아니면 [n, 1] */
  K.perfPow = function (n) {
    var e, b;
    for (e = Math.floor(Math.log(n) / Math.LN2 + 1e-9); e >= 2; e--) {
      b = Math.round(Math.pow(n, 1 / e));
      if (Math.pow(b, e) === n) { return [b, e]; }
    }
    return [n, 1];
  };

  /* (cn/cd) ln n 을 합의 항으로. ln 4 = 2 ln 2 처럼 거듭제곱이면 밑을 줄여 줍니다. */
  K.lnT = function (cn, cd, n) {
    var p = K.perfPow(n);
    return [cn * p[1], cd === undefined ? 1 : cd, '\\ln ' + p[0]];
  };

  /* ln(n/d) 의 TeX (기약분수) */
  K.lnFrac = function (n, d) {
    var f = M.frac(n, d);
    return f[1] === 1 ? '\\ln ' + f[0] : '\\ln\\frac{' + f[0] + '}{' + f[1] + '}';
  };

  /* ax+b (문자는 v) */
  K.lin = function (a, b, v) { return M.poly([[a, v || 'x'], [b, '']]); };

  /* 1 - x 처럼 상수항이 앞에 오는 꼴을 선호하는 일차식·이차식 */
  K.linP = function (a, b, v) {
    v = v || 'x';
    if (a < 0 && b > 0) { return b + ' - ' + M.term(-a, v); }
    return K.lin(a, b, v);
  };
  K.quadP = function (a, b) {
    if (a < 0 && b > 0) { return b + ' - ' + M.term(-a, 'x^2'); }
    return M.poly([[a, 'x^2'], [b, '']]);
  };

  /* 항이 둘 이상이면 괄호로 감쌉니다. */
  K.wrap = function (tex) { return /[+-]/.test(tex.replace(/^-/, '').replace(/\^\{[^}]*\}/g, '')) ? '(' + tex + ')' : tex; };

  /* 한 세트를 네 번 만들되, 세트끼리 같은 문항이 겹치지 않도록 여러 번 다시 뽑습니다.
   * keysOf(set) 는 겹침을 따질 문항 키(문제 TeX) 목록을 돌려줍니다. */
  K.fourSets = function (makeSet, keysOf) {
    var labels = ['A', 'B', 'C', 'D'];
    var used = {};
    var sets = [];
    var i, tries, best, bestDup, s, keys, dup;
    for (i = 0; i < 4; i++) {
      best = null;
      bestDup = 1e9;
      for (tries = 0; tries < 120; tries++) {
        s = makeSet(i);
        keys = keysOf(s);
        dup = keys.filter(function (k) { return used[k]; }).length;
        if (dup < bestDup) { best = s; bestDup = dup; }
        if (dup === 0) { break; }
      }
      keysOf(best).forEach(function (k) { used[k] = true; });
      best.label = labels[i];
      sets.push(best);
    }
    return sets;
  };

  /* 같은 세트 안에서 문제가 겹치지 않도록 n 개를 만듭니다. makers 는 문항 하나를 만드는 함수 목록. */
  K.uniqueItems = function (makers) {
    var seen = {};
    return makers.map(function (mk) {
      var it, tries = 0;
      do { it = mk(); tries++; } while (seen[it.q] && tries < 60);
      seen[it.q] = true;
      return it;
    });
  };

  window.SU3_SHEETS = window.SU3_SHEETS || {};
})();
