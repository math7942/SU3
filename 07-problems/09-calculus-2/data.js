/* 미적분Ⅱ — 주제별 문제 생성기 */
(function () {
  var M = window.SU3M;

  window.SU3_SUBJECT = {
    id: 'calculus-2',
    name: '미적분Ⅱ',
    areas: [
      {
        name: '수열의 극한',
        topics: [
          {
            id: 'seq-limit',
            name: '수열의 극한값',
            desc: '분수 꼴 수열의 극한',
            concept: '<p>분모의 최고차항으로 분모와 분자를 각각 나눈 뒤 $\\lim_{n\\to\\infty}\\dfrac{1}{n} = 0$ 을 이용합니다. 최고차항의 차수가 같으면 <strong>최고차항의 계수의 비</strong>가 극한값입니다.</p>',
            gen: function () {
              var a = M.nz(-6, 6), b = M.i(-8, 8), c = M.nz(1, 6), d = M.i(-8, 8);
              return {
                q: '$\\displaystyle\\lim_{n \\to \\infty} \\frac{' + M.poly([[a, 'n^2'], [b, 'n']]) + '}{' + M.poly([[c, 'n^2'], [d, 'n']]) + '}$ 의 값을 구하시오.',
                type: 'num',
                ans: a / c,
                ansText: '$' + M.fracTex(a, c) + '$',
                hint: '분수는 3/4 처럼 입력하세요.',
                sol: '<p>분모·분자를 $n^2$ 으로 나누면</p>' +
                  '<p>$\\dfrac{' + a + ' + \\frac{' + b + '}{n}}{' + c + ' + \\frac{' + d + '}{n}} \\to \\dfrac{' + a + '}{' + c + '} = ' + M.fracTex(a, c) + '$</p>'
              };
            }
          },
          {
            id: 'geo-series',
            name: '등비급수',
            desc: '무한등비급수의 합',
            concept: '<p>$|r| < 1$ 일 때 첫째항이 $a$, 공비가 $r$ 인 무한등비급수의 합은 $\\dfrac{a}{1-r}$ 입니다. $|r| \\ge 1$ 이면 발산합니다.</p>',
            gen: function () {
              var a = M.nz(-9, 9);
              var q = M.i(2, 6), p = M.nz(-(q - 1), q - 1);
              var num = a * q, den = q - p;
              return {
                q: '첫째항이 $' + a + '$, 공비가 $' + M.fracTex(p, q) + '$ 인 무한등비급수의 합을 구하시오.',
                type: 'num',
                ans: num / den,
                ansText: '$' + M.fracTex(num, den) + '$',
                hint: '분수는 3/4 처럼 입력하세요.',
                sol: '<p>$\\dfrac{a}{1-r} = \\dfrac{' + a + '}{1 - ' + M.fracTex(p, q) + '} = \\dfrac{' + a + '}{' + M.fracTex(den, q) + '} = ' + M.fracTex(num, den) + '$</p>'
              };
            }
          }
        ]
      },
      {
        name: '미분법',
        topics: [
          {
            id: 'diff-rules',
            name: '곱·몫·합성함수의 미분',
            desc: '미분법의 기본 공식',
            concept: '<p>$(fg)\' = f\'g + fg\'$, $\\left(\\dfrac{f}{g}\\right)\' = \\dfrac{f\'g - fg\'}{g^2}$, $\\{f(g(x))\\}\' = f\'(g(x))g\'(x)$ 입니다.</p>',
            gen: function () {
              var kind = M.pick(['product', 'quotient', 'chain']);
              if (kind === 'product') {
                var a = M.nz(-4, 4), b = M.i(-5, 5), c = M.nz(-3, 3), d = M.i(-5, 5), k = M.i(-2, 2);
                /* f = (ax+b)(cx^2+d) ,  f' = a(cx^2+d) + (ax+b)(2cx) */
                var ans = a * (c * k * k + d) + (a * k + b) * (2 * c * k);
                return {
                  q: '$f(x) = (' + M.poly([[a, 'x'], [b, '']]) + ')(' + M.poly([[c, 'x^2'], [d, '']]) + ')$ 일 때 $f\'(' + k + ')$ 의 값을 구하시오.',
                  type: 'num',
                  ans: ans,
                  sol: '<p>$f\'(x) = ' + a + '(' + M.poly([[c, 'x^2'], [d, '']]) + ') + (' + M.poly([[a, 'x'], [b, '']]) + ')(' + M.term(2 * c, 'x') + ')$</p>' +
                    '<p>$x = ' + k + '$ 을 대입하면 $f\'(' + k + ') = ' + ans + '$ 입니다.</p>'
                };
              }
              if (kind === 'quotient') {
                var p = M.nz(-4, 4), q = M.i(-5, 5), r = M.i(-4, 4), k2 = M.i(-2, 3);
                while (k2 + r === 0) { k2 = M.i(-2, 3); }
                /* f = (px+q)/(x+r), f' = (p(x+r) - (px+q))/(x+r)^2 = (pr - q)/(x+r)^2 */
                var den = (k2 + r) * (k2 + r);
                var numv = p * r - q;
                return {
                  q: '$f(x) = \\dfrac{' + M.poly([[p, 'x'], [q, '']]) + '}{' + M.poly([[1, 'x'], [r, '']]) + '}$ 일 때 $f\'(' + k2 + ')$ 의 값을 구하시오.',
                  type: 'num',
                  ans: numv / den,
                  ansText: '$' + M.fracTex(numv, den) + '$',
                  hint: '분수는 3/4 처럼 입력하세요.',
                  sol: '<p>$f\'(x) = \\dfrac{' + p + '(x ' + (r >= 0 ? '+ ' + r : '- ' + (-r)) + ') - (' + M.poly([[p, 'x'], [q, '']]) + ')}{(x ' +
                    (r >= 0 ? '+ ' + r : '- ' + (-r)) + ')^2} = \\dfrac{' + numv + '}{(x ' + (r >= 0 ? '+ ' + r : '- ' + (-r)) + ')^2}$</p>' +
                    '<p>$f\'(' + k2 + ') = \\dfrac{' + numv + '}{' + den + '} = ' + M.fracTex(numv, den) + '$</p>'
                };
              }
              var a3 = M.nz(-3, 3), b3 = M.i(-4, 4), n = M.i(2, 4), k3 = M.i(-2, 2);
              var inner = a3 * k3 + b3;
              var ans3 = n * Math.pow(inner, n - 1) * a3;
              return {
                q: '$f(x) = (' + M.poly([[a3, 'x'], [b3, '']]) + ')^{' + n + '}$ 일 때 $f\'(' + k3 + ')$ 의 값을 구하시오.',
                type: 'num',
                ans: ans3,
                sol: '<p>$f\'(x) = ' + n + '(' + M.poly([[a3, 'x'], [b3, '']]) + ')^{' + (n - 1) + '} \\times ' + a3 + '$</p>' +
                  '<p>$f\'(' + k3 + ') = ' + n + ' \\times (' + inner + ')^{' + (n - 1) + '} \\times ' + a3 + ' = ' + ans3 + '$</p>'
              };
            }
          },
          {
            id: 'diff-trans',
            name: '지수·로그·삼각함수의 미분',
            desc: '초월함수의 도함수',
            concept: '<p>$(e^x)\' = e^x$, $(\\ln x)\' = \\dfrac{1}{x}$, $(\\sin x)\' = \\cos x$, $(\\cos x)\' = -\\sin x$, $(\\tan x)\' = \\sec^2 x$ 입니다. 합성함수이면 안쪽 함수의 도함수를 곱합니다.</p>',
            gen: function () {
              var k = M.nz(-5, 5);
              var bank = [
                { f: 'e^{' + k + 'x}', d: M.term(k, 'e^{' + k + 'x}'), at: '0', v: k, note: '$x=0$ 에서 $e^0 = 1$ 입니다.' },
                { f: 'xe^x', d: '(1+x)e^x', at: '0', v: 1, note: '곱의 미분법을 씁니다.' },
                { f: '\\ln(' + M.term(k, 'x') + ' + 1)', d: '\\dfrac{' + k + '}{' + M.term(k, 'x') + ' + 1}', at: '0', v: k, note: '합성함수의 미분법을 씁니다.' },
                { f: 'x\\ln x', d: '\\ln x + 1', at: '1', v: 1, note: '$\\ln 1 = 0$ 입니다.' },
                { f: '\\sin ' + M.term(k, 'x'), d: M.term(k, '\\cos ' + M.term(k, 'x')), at: '0', v: k, note: '$\\cos 0 = 1$ 입니다.' },
                { f: '\\tan x', d: '\\sec^2 x', at: '0', v: 1, note: '$\\sec 0 = 1$ 입니다.' },
                { f: '\\sin x \\cos x', d: '\\cos 2x', at: '0', v: 1, note: '$\\sin x\\cos x = \\frac{1}{2}\\sin 2x$ 로 고치면 편합니다.' }
              ];
              var b = M.pick(bank);
              return {
                q: '$f(x) = ' + b.f + '$ 일 때 $f\'(' + b.at + ')$ 의 값을 구하시오.',
                type: 'num',
                ans: b.v,
                sol: '<p>$f\'(x) = ' + b.d + '$</p><p>' + b.note + '</p><p>$f\'(' + b.at + ') = ' + b.v + '$</p>'
              };
            }
          },
          {
            id: 'implicit',
            name: '음함수와 매개변수의 미분',
            desc: '$\\frac{dy}{dx}$ 구하기',
            concept: '<p>음함수는 양변을 $x$ 로 미분하며 $y$ 는 $x$ 의 함수로 봅니다($\\frac{d}{dx}y^2 = 2y\\frac{dy}{dx}$). 매개변수로 주어지면 $\\dfrac{dy}{dx} = \\dfrac{dy/dt}{dx/dt}$ 입니다.</p>',
            gen: function () {
              if (Math.random() < 0.5) {
                var t = M.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17]]);
                var x0 = t[0] * M.pick([1, -1]), y0 = t[1] * M.pick([1, -1]);
                return {
                  q: '원 $x^2 + y^2 = ' + (t[2] * t[2]) + '$ 위의 점 $(' + x0 + ',\\ ' + y0 + ')$ 에서 $\\dfrac{dy}{dx}$ 의 값을 구하시오.',
                  type: 'num',
                  ans: -x0 / y0,
                  ansText: '$' + M.fracTex(-x0, y0) + '$',
                  hint: '분수는 3/4 처럼 입력하세요.',
                  sol: '<p>양변을 $x$ 로 미분하면 $2x + 2y\\dfrac{dy}{dx} = 0$ 이므로 $\\dfrac{dy}{dx} = -\\dfrac{x}{y}$ 입니다.</p>' +
                    '<p>$-\\dfrac{' + x0 + '}{' + y0 + '} = ' + M.fracTex(-x0, y0) + '$</p>'
                };
              }
              var a = M.nz(-3, 3), b = M.nz(-3, 3), k = M.nz(-3, 3);
              /* x = a t^2 + 1, y = b t^3  ->  dy/dx = 3b t^2 / (2a t) = 3b t / (2a) */
              var num = 3 * b * k, den = 2 * a;
              return {
                q: '매개변수 $t$ 로 나타낸 곡선 $x = ' + M.term(a, 't^2') + ' + 1$, $y = ' + M.term(b, 't^3') + '$ 에 대하여 ' +
                  '$t = ' + k + '$ 일 때 $\\dfrac{dy}{dx}$ 의 값을 구하시오.',
                type: 'num',
                ans: num / den,
                ansText: '$' + M.fracTex(num, den) + '$',
                hint: '분수는 3/4 처럼 입력하세요.',
                sol: '<p>$\\dfrac{dx}{dt} = ' + M.term(2 * a, 't') + '$, $\\dfrac{dy}{dt} = ' + M.term(3 * b, 't^2') + '$ 이므로</p>' +
                  '<p>$\\dfrac{dy}{dx} = \\dfrac{' + M.term(3 * b, 't^2') + '}{' + M.term(2 * a, 't') + '} = ' + M.fracTex(3 * b, 2 * a) + 't$ 이고, ' +
                  '$t = ' + k + '$ 에서 $' + M.fracTex(num, den) + '$ 입니다.</p>'
              };
            }
          }
        ]
      },
      {
        name: '적분법',
        topics: [
          {
            id: 'substitution',
            name: '치환적분',
            desc: '안쪽 식을 $t$ 로 놓기',
            concept: '<p>$\\displaystyle\\int f(g(x))g\'(x)dx$ 꼴은 $g(x) = t$ 로 놓으면 $\\int f(t)dt$ 가 됩니다. 정적분에서는 <strong>적분 구간도 함께 바꿉니다</strong>.</p>',
            gen: function () {
              var n = M.i(2, 4), a = M.i(1, 3);
              /* ∫_0^a 2x(x^2+1)^n dx = [(x^2+1)^(n+1)/(n+1)] = ((a^2+1)^(n+1) - 1)/(n+1) */
              var top = Math.pow(a * a + 1, n + 1) - 1;
              var den = n + 1;
              return {
                q: '$\\displaystyle\\int_{0}^{' + a + '} 2x(x^2+1)^{' + n + '}\\,dx$ 의 값을 구하시오.',
                type: 'num',
                ans: top / den,
                ansText: '$' + M.fracTex(top, den) + '$',
                hint: '분수는 31/3 처럼 입력하세요.',
                tol: 1e-6,
                sol: '<p>$x^2 + 1 = t$ 로 놓으면 $2x\\,dx = dt$ 이고, $x: 0 \\to ' + a + '$ 일 때 $t: 1 \\to ' + (a * a + 1) + '$ 입니다.</p>' +
                  '<p>$\\int_{1}^{' + (a * a + 1) + '} t^{' + n + '}dt = \\left[\\dfrac{t^{' + (n + 1) + '}}{' + (n + 1) + '}\\right]_{1}^{' + (a * a + 1) + '}' +
                  ' = \\dfrac{' + Math.pow(a * a + 1, n + 1) + ' - 1}{' + (n + 1) + '} = ' + M.fracTex(top, den) + '$</p>'
              };
            }
          },
          {
            id: 'area-between',
            name: '두 곡선 사이의 넓이',
            desc: '정적분으로 넓이 구하기',
            concept: '<p>구간 $[\\alpha, \\beta]$ 에서 $f(x) \\ge g(x)$ 이면 두 곡선 사이의 넓이는 $\\displaystyle\\int_{\\alpha}^{\\beta}\\{f(x)-g(x)\\}dx$ 입니다. 두 그래프의 교점을 먼저 구합니다.</p>',
            gen: function () {
              var a = M.i(2, 6);
              /* y = x^2 과 y = ax 의 교점 0, a → 넓이 = a^3/6 */
              var top = Math.pow(a, 3);
              return {
                q: '곡선 $y = x^2$ 과 직선 $y = ' + M.term(a, 'x') + '$ 로 둘러싸인 부분의 넓이를 구하시오.',
                type: 'num',
                ans: top / 6,
                ansText: '$' + M.fracTex(top, 6) + '$',
                hint: '분수는 9/2 처럼 입력하세요.',
                tol: 1e-6,
                sol: '<p>$x^2 = ' + M.term(a, 'x') + '$ 에서 교점의 $x$ 좌표는 $0$ 과 $' + a + '$ 입니다.</p>' +
                  '<p>$\\int_{0}^{' + a + '} (' + M.term(a, 'x') + ' - x^2)dx = \\left[\\dfrac{' + a + 'x^2}{2} - \\dfrac{x^3}{3}\\right]_{0}^{' + a + '}' +
                  ' = \\dfrac{' + top + '}{6} = ' + M.fracTex(top, 6) + '$</p>'
              };
            }
          }
        ]
      }
    ]
  };
})();
