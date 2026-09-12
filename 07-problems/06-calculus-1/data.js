/* 미적분Ⅰ — 주제별 문제 생성기 */
(function () {
  var M = window.SU3M;

  window.SU3_SUBJECT = {
    id: 'calculus-1',
    name: '미적분Ⅰ',
    areas: [
      {
        name: '함수의 극한과 연속',
        topics: [
          {
            id: 'limit',
            name: '함수의 극한',
            desc: '$\\frac{0}{0}$ 꼴 극한값 구하기',
            concept: '<p>분모와 분자가 모두 0 이 되는 $\\dfrac{0}{0}$ 꼴은 <strong>분자를 인수분해하여 분모와 약분</strong>한 뒤 극한값을 구합니다.</p>',
            gen: function () {
              var a = M.nz(-6, 6), p = M.i(-7, 7);
              while (p === a) { p = M.i(-7, 7); }
              var num = M.poly([[1, 'x^2'], [-(a + p), 'x'], [a * p, '']]);
              var den = a > 0 ? 'x - ' + a : 'x + ' + (-a);
              return {
                q: '$\\displaystyle\\lim_{x \\to ' + a + '} \\frac{' + num + '}{' + den + '}$ 의 값을 구하시오.',
                type: 'num',
                ans: a - p,
                sol: '<p>분자를 인수분해하면 $(x ' + (a >= 0 ? '- ' + a : '+ ' + (-a)) + ')(x ' + (p >= 0 ? '- ' + p : '+ ' + (-p)) + ')$ 이므로</p>' +
                  '<p>$\\lim_{x \\to ' + a + '} (x ' + (p >= 0 ? '- ' + p : '+ ' + (-p)) + ') = ' + a + ' - (' + p + ') = ' + (a - p) + '$</p>'
              };
            }
          },
          {
            id: 'continuity',
            name: '함수의 연속',
            desc: '연속이 되도록 하는 값 찾기',
            concept: '<p>$x=a$ 에서 연속이려면 $\\lim_{x \\to a} f(x) = f(a)$ 여야 합니다. 분모가 0이 되는 점에서는 분자도 0이 되어야 극한값이 존재합니다.</p>',
            gen: function () {
              var a = M.nz(-5, 5), p = M.i(-6, 6);
              while (p === a) { p = M.i(-6, 6); }
              var num = M.poly([[1, 'x^2'], [-(a + p), 'x'], [a * p, '']]);
              var den = a > 0 ? 'x - ' + a : 'x + ' + (-a);
              return {
                q: '함수 $f(x) = \\begin{cases} \\dfrac{' + num + '}{' + den + '} & (x \\ne ' + a + ') \\\\ k & (x = ' + a + ') \\end{cases}$ ' +
                  '가 $x = ' + a + '$ 에서 연속일 때 상수 $k$ 의 값을 구하시오.',
                type: 'num',
                ans: a - p,
                sol: '<p>$x \\ne ' + a + '$ 일 때 $f(x) = x ' + (p >= 0 ? '- ' + p : '+ ' + (-p)) + '$ 이므로</p>' +
                  '<p>$\\lim_{x \\to ' + a + '} f(x) = ' + (a - p) + '$ 이고, 연속이려면 $k = ' + (a - p) + '$ 입니다.</p>'
              };
            }
          }
        ]
      },
      {
        name: '미분',
        topics: [
          {
            id: 'derivative',
            name: '도함수와 미분계수',
            desc: '$f\'(a)$ 의 값 구하기',
            concept: '<p>$(x^n)\' = nx^{n-1}$, 상수의 도함수는 0 입니다. 다항함수는 각 항을 따로 미분해 더하면 됩니다.</p>',
            gen: function () {
              var a = M.nz(-4, 4), b = M.nz(-6, 6), c = M.nz(-8, 8), d = M.i(-9, 9), k = M.i(-3, 3);
              var ans = 3 * a * k * k + 2 * b * k + c;
              return {
                q: '$f(x) = ' + M.poly([[a, 'x^3'], [b, 'x^2'], [c, 'x'], [d, '']]) + '$ 일 때 $f\'(' + k + ')$ 의 값을 구하시오.',
                type: 'num',
                ans: ans,
                sol: '<p>$f\'(x) = ' + M.poly([[3 * a, 'x^2'], [2 * b, 'x'], [c, '']]) + '$</p>' +
                  '<p>$f\'(' + k + ') = ' + (3 * a) + ' \\times ' + (k * k) + ' + (' + (2 * b) + ') \\times (' + k + ') + (' + c + ') = ' + ans + '$</p>'
              };
            }
          },
          {
            id: 'tangent',
            name: '접선의 방정식',
            desc: '접선의 기울기와 $y$ 절편',
            concept: '<p>곡선 $y=f(x)$ 위의 점 $(a, f(a))$ 에서의 접선의 기울기는 $f\'(a)$ 이고, 접선의 방정식은 $y - f(a) = f\'(a)(x-a)$ 입니다.</p>',
            gen: function () {
              var a = M.nz(-3, 3), b = M.i(-5, 5), c = M.i(-6, 6), k = M.i(-3, 3);
              var f = a * k * k * k + b * k * k + c;
              var slope = 3 * a * k * k + 2 * b * k;
              var askSlope = Math.random() < 0.5;
              var yint = f - slope * k;
              return {
                q: '곡선 $y = ' + M.poly([[a, 'x^3'], [b, 'x^2'], [c, '']]) + '$ 위의 $x = ' + k + '$ 인 점에서의 접선의 ' +
                  (askSlope ? '<strong>기울기</strong>를' : '<strong>$y$ 절편</strong>을') + ' 구하시오.',
                type: 'num',
                ans: askSlope ? slope : yint,
                sol: '<p>$f\'(x) = ' + M.poly([[3 * a, 'x^2'], [2 * b, 'x']]) + '$ 이므로 접선의 기울기는 $f\'(' + k + ') = ' + slope + '$ 입니다.</p>' +
                  '<p>접점은 $(' + k + ',\\ ' + f + ')$ 이므로 접선은 $y = ' + slope + '(x ' + (k >= 0 ? '- ' + k : '+ ' + (-k)) + ') ' +
                  (f >= 0 ? '+ ' + f : '- ' + (-f)) + '$, 즉 $y = ' + M.poly([[slope, 'x'], [yint, '']]) + '$ 입니다.</p>'
              };
            }
          },
          {
            id: 'extreme',
            name: '함수의 극대와 극소',
            desc: '도함수의 부호로 극값 찾기',
            concept: '<p>$f\'(x) = 0$ 이 되는 $x$ 를 찾고, 그 앞뒤에서 $f\'(x)$ 의 <strong>부호가 $+$ 에서 $-$ 로 바뀌면 극대</strong>, $-$ 에서 $+$ 로 바뀌면 극소입니다.</p>',
            gen: function () {
              var r = M.two(-4, 4);
              var p = Math.min(r[0], r[1]), q = Math.max(r[0], r[1]);
              var c = M.i(-6, 6);
              /* f(x) = 2x^3 - 3(p+q)x^2 + 6pq x + c, f'(x) = 6(x-p)(x-q) */
              var f = function (x) { return 2 * x * x * x - 3 * (p + q) * x * x + 6 * p * q * x + c; };
              var askMax = Math.random() < 0.5;
              return {
                q: '함수 $f(x) = ' + M.poly([[2, 'x^3'], [-3 * (p + q), 'x^2'], [6 * p * q, 'x'], [c, '']]) + '$ 의 ' +
                  (askMax ? '<strong>극댓값</strong>' : '<strong>극솟값</strong>') + '을 구하시오.',
                type: 'num',
                ans: askMax ? f(p) : f(q),
                sol: '<p>$f\'(x) = ' + M.poly([[6, 'x^2'], [-6 * (p + q), 'x'], [6 * p * q, '']]) + ' = 6(x ' +
                  (p >= 0 ? '- ' + p : '+ ' + (-p)) + ')(x ' + (q >= 0 ? '- ' + q : '+ ' + (-q)) + ')$</p>' +
                  '<p>$x = ' + p + '$ 에서 극대, $x = ' + q + '$ 에서 극소이므로 극댓값은 $f(' + p + ') = ' + f(p) + '$, 극솟값은 $f(' + q + ') = ' + f(q) + '$ 입니다.</p>'
              };
            }
          },
          {
            id: 'velocity',
            name: '속도와 가속도',
            desc: '위치의 미분으로 운동 해석하기',
            concept: '<p>점의 위치가 $x(t)$ 일 때 속도는 $v(t) = x\'(t)$, 가속도는 $a(t) = v\'(t) = x\'\'(t)$ 입니다.</p>',
            gen: function () {
              var a = M.nz(-3, 3), b = M.nz(-6, 6), c = M.i(-8, 8), t = M.i(1, 5);
              var askAcc = Math.random() < 0.4;
              var v = 3 * a * t * t + 2 * b * t + c;
              var acc = 6 * a * t + 2 * b;
              return {
                q: '수직선 위를 움직이는 점 $P$ 의 시각 $t$ 에서의 위치가 $x(t) = ' +
                  M.poly([[a, 't^3'], [b, 't^2'], [c, 't']]) + '$ 일 때, $t = ' + t + '$ 에서의 ' +
                  (askAcc ? '<strong>가속도</strong>' : '<strong>속도</strong>') + '를 구하시오.',
                type: 'num',
                ans: askAcc ? acc : v,
                sol: '<p>$v(t) = x\'(t) = ' + M.poly([[3 * a, 't^2'], [2 * b, 't'], [c, '']]) + '$, ' +
                  '$a(t) = v\'(t) = ' + M.poly([[6 * a, 't'], [2 * b, '']]) + '$</p>' +
                  '<p>$t = ' + t + '$ 을 대입하면 속도는 $' + v + '$, 가속도는 $' + acc + '$ 입니다.</p>'
              };
            }
          }
        ]
      },
      {
        name: '적분',
        topics: [
          {
            id: 'definite',
            name: '정적분의 계산',
            desc: '다항함수의 정적분',
            concept: '<p>$\\displaystyle\\int_a^b f(x)\\,dx = F(b) - F(a)$ 입니다. 여기서 $F$ 는 $f$ 의 부정적분이고, $\\int x^n dx = \\dfrac{x^{n+1}}{n+1} + C$ 입니다.</p>',
            gen: function () {
              var a3 = M.pick([3, 6, -3, 9]);
              var b2 = M.pick([2, 4, -2, 6]);
              var c = M.nz(-6, 6);
              var lo = M.i(-2, 1), hi = lo + M.i(1, 3);
              var F = function (x) { return (a3 / 3) * x * x * x + (b2 / 2) * x * x + c * x; };
              var ans = F(hi) - F(lo);
              return {
                q: '$\\displaystyle\\int_{' + lo + '}^{' + hi + '} (' + M.poly([[a3, 'x^2'], [b2, 'x'], [c, '']]) + ')\\,dx$ 의 값을 구하시오.',
                type: 'num',
                ans: ans,
                tol: 1e-6,
                sol: '<p>부정적분은 $F(x) = ' + M.poly([[a3 / 3, 'x^3'], [b2 / 2, 'x^2'], [c, 'x']]) + '$ 입니다.</p>' +
                  '<p>$F(' + hi + ') - F(' + lo + ') = ' + F(hi) + ' - (' + F(lo) + ') = ' + ans + '$</p>'
              };
            }
          },
          {
            id: 'area',
            name: '정적분과 넓이',
            desc: '곡선과 $x$ 축 사이의 넓이',
            concept: '<p>구간에서 $f(x) \\le 0$ 이면 넓이는 $\\displaystyle\\int_a^b \\{-f(x)\\}dx$ 입니다. 특히 $y=(x-\\alpha)(x-\\beta)$ 와 $x$ 축으로 둘러싸인 넓이는 $\\dfrac{(\\beta-\\alpha)^3}{6}$ 입니다.</p>',
            gen: function () {
              var r = M.two(-5, 5);
              var p = Math.min(r[0], r[1]), q = Math.max(r[0], r[1]);
              var d = q - p;
              var ans = Math.pow(d, 3) / 6;
              return {
                q: '곡선 $y = ' + M.poly([[1, 'x^2'], [-(p + q), 'x'], [p * q, '']]) + '$ 와 $x$ 축으로 둘러싸인 부분의 넓이를 구하시오.',
                type: 'num',
                ans: ans,
                ansText: '$' + M.fracTex(Math.pow(d, 3), 6) + '$',
                hint: '답이 분수이면 9/2 처럼 입력하세요.',
                tol: 1e-6,
                sol: '<p>두 근이 $' + p + ', ' + q + '$ 이므로 곡선은 그 사이에서 $x$ 축 아래에 있습니다.</p>' +
                  '<p>넓이 $= \\dfrac{(' + q + ' - (' + p + '))^3}{6} = \\dfrac{' + Math.pow(d, 3) + '}{6} = ' + M.fracTex(Math.pow(d, 3), 6) + '$</p>'
              };
            }
          }
        ]
      }
    ]
  };
})();
