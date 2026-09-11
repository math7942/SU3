/* 대수 — 주제별 문제 생성기 */
(function () {
  var M = window.SU3M;

  window.SU3_SUBJECT = {
    id: 'algebra',
    name: '대수',
    areas: [
      {
        name: '지수함수와 로그함수',
        topics: [
          {
            id: 'exponent',
            name: '지수법칙',
            desc: '유리수 지수의 값 구하기',
            concept: '<p>$a^{\\frac{n}{m}} = \\sqrt[m]{a^n}$ 입니다. 밑을 소인수의 거듭제곱으로 고친 뒤 $(a^p)^q = a^{pq}$ 를 쓰면 간단해집니다. 예를 들어 $8^{\\frac{2}{3}} = (2^3)^{\\frac{2}{3}} = 2^2 = 4$ 입니다.</p>',
            gen: function () {
              var bank = [
                [8, 2, 3, 4, 2, 3], [8, 4, 3, 16, 2, 3], [16, 3, 4, 8, 2, 4], [16, 1, 2, 4, 2, 4],
                [27, 2, 3, 9, 3, 3], [27, 4, 3, 81, 3, 3], [32, 3, 5, 8, 2, 5], [81, 3, 4, 27, 3, 4],
                [125, 2, 3, 25, 5, 3], [64, 2, 3, 16, 2, 6], [243, 2, 5, 9, 3, 5]
              ];
              var b = M.pick(bank);
              var base = b[0], n = b[1], m = b[2], ans = b[3], p = b[4], e = b[5];
              return {
                q: '$' + base + '^{\\frac{' + n + '}{' + m + '}}$ 의 값을 구하시오.',
                type: 'num',
                ans: ans,
                sol: '<p>$' + base + ' = ' + p + '^{' + e + '}$ 이므로</p>' +
                  '<p>$' + base + '^{\\frac{' + n + '}{' + m + '}} = (' + p + '^{' + e + '})^{\\frac{' + n + '}{' + m + '}} = ' +
                  p + '^{' + (e * n / m) + '} = ' + ans + '$</p>'
              };
            }
          },
          {
            id: 'log-prop',
            name: '로그의 성질',
            desc: '로그의 합·차·실수배',
            concept: '<p>$\\log_a xy = \\log_a x + \\log_a y$, $\\log_a \\dfrac{x}{y} = \\log_a x - \\log_a y$, $\\log_a x^n = n\\log_a x$ 입니다. 또 $\\log_a a = 1$, $\\log_a 1 = 0$ 입니다.</p>',
            gen: function () {
              var base = M.pick([2, 3, 5]);
              var e1 = M.i(1, 5), e2 = M.i(1, 4), e3 = M.i(1, 3);
              var x = Math.pow(base, e1), y = Math.pow(base, e2), z = Math.pow(base, e3);
              var ans = e1 + e2 - e3;
              return {
                q: '$\\log_{' + base + '} ' + x + ' + \\log_{' + base + '} ' + y + ' - \\log_{' + base + '} ' + z + '$ 의 값을 구하시오.',
                type: 'num',
                ans: ans,
                sol: '<p>$' + x + ' = ' + base + '^{' + e1 + '}$, $' + y + ' = ' + base + '^{' + e2 + '}$, $' + z + ' = ' + base + '^{' + e3 + '}$ 이므로</p>' +
                  '<p>각 로그의 값은 $' + e1 + ', ' + e2 + ', ' + e3 + '$ 이고, $' + e1 + ' + ' + e2 + ' - ' + e3 + ' = ' + ans + '$ 입니다.</p>'
              };
            }
          },
          {
            id: 'exp-log-eq',
            name: '지수·로그 방정식',
            desc: '밑을 같게 만들어 풀기',
            concept: '<p>지수방정식은 <strong>양변의 밑을 같게</strong> 만든 뒤 지수를 비교합니다. 로그방정식 $\\log_a f(x) = k$ 는 $f(x) = a^k$ 로 고쳐 풀고, 마지막에 <strong>진수가 양수인지</strong> 반드시 확인합니다.</p>',
            gen: function () {
              var base = M.pick([2, 3, 5]);
              if (Math.random() < 0.5) {
                var x = M.i(1, 5), b = M.i(-3, 3);
                var rhs = Math.pow(base, x + b);
                return {
                  q: '방정식 $' + base + '^{x ' + (b >= 0 ? '+ ' + b : '- ' + (-b)) + '} = ' + rhs + '$ 을 푸시오.',
                  type: 'num',
                  ans: x,
                  hint: 'x의 값을 입력하세요.',
                  sol: '<p>$' + rhs + ' = ' + base + '^{' + (x + b) + '}$ 이므로 $x ' + (b >= 0 ? '+ ' + b : '- ' + (-b)) + ' = ' + (x + b) + '$</p>' +
                    '<p>$x = ' + x + '$</p>'
                };
              }
              var k = M.i(1, 3), c = M.i(1, 6);
              var val = Math.pow(base, k);
              return {
                q: '방정식 $\\log_{' + base + '} (x - ' + c + ') = ' + k + '$ 을 푸시오.',
                type: 'num',
                ans: val + c,
                hint: 'x의 값을 입력하세요.',
                sol: '<p>$x - ' + c + ' = ' + base + '^{' + k + '} = ' + val + '$ 이므로 $x = ' + (val + c) + '$</p>' +
                  '<p>진수 조건 $x - ' + c + ' > 0$ 도 만족합니다.</p>'
              };
            }
          }
        ]
      },
      {
        name: '삼각함수',
        topics: [
          {
            id: 'radian',
            name: '호도법',
            desc: '도(°)와 라디안 바꾸기',
            concept: '<p>$180^\\circ = \\pi$ 라디안입니다. 따라서 $x^\\circ = \\dfrac{x}{180}\\pi$ 라디안이고, 반대로 $\\theta$ 라디안 $= \\theta \\times \\dfrac{180^\\circ}{\\pi}$ 입니다.</p>',
            gen: function () {
              var deg = M.pick([15, 30, 36, 45, 60, 72, 90, 120, 135, 144, 150, 210, 225, 240, 270, 300, 330]);
              return {
                q: '$' + deg + '^\\circ$ 를 호도법으로 나타내면 $k\\pi$ 라디안이다. $k$ 의 값을 구하시오.',
                type: 'num',
                ans: deg / 180,
                ansText: '$' + M.fracTex(deg, 180) + '$',
                hint: '분수는 1/6 처럼 입력하세요.',
                sol: '<p>$' + deg + '^\\circ = ' + deg + ' \\times \\dfrac{\\pi}{180} = ' + M.fracTex(deg, 180) + '\\pi$ (라디안)</p>'
              };
            }
          },
          {
            id: 'trig-value',
            name: '삼각함수의 값',
            desc: '특수각의 삼각함수',
            concept: '<p>$\\sin 30^\\circ = \\dfrac{1}{2}$, $\\cos 60^\\circ = \\dfrac{1}{2}$, $\\tan 45^\\circ = 1$ 이고, 제2·3·4 사분면의 각은 <strong>기준각의 삼각함수 값에 부호만 붙여</strong> 구합니다. 부호는 1사분면에서 모두 양수, 2사분면에서 사인만, 3사분면에서 탄젠트만, 4사분면에서 코사인만 양수입니다.</p>',
            gen: function () {
              var bank = [
                ['\\sin', 0, 0], ['\\sin', 30, 0.5], ['\\sin', 90, 1], ['\\sin', 150, 0.5], ['\\sin', 180, 0],
                ['\\sin', 210, -0.5], ['\\sin', 270, -1], ['\\sin', 330, -0.5],
                ['\\cos', 0, 1], ['\\cos', 60, 0.5], ['\\cos', 90, 0], ['\\cos', 120, -0.5], ['\\cos', 180, -1],
                ['\\cos', 240, -0.5], ['\\cos', 270, 0], ['\\cos', 300, 0.5],
                ['\\tan', 0, 0], ['\\tan', 45, 1], ['\\tan', 135, -1], ['\\tan', 180, 0], ['\\tan', 225, 1], ['\\tan', 315, -1]
              ];
              var b = M.pick(bank);
              var name = b[0], deg = b[1], v = b[2];
              return {
                q: '$' + name + ' ' + deg + '^\\circ$ 의 값을 구하시오.',
                type: 'num',
                ans: v,
                ansText: v === 0.5 ? '$\\frac{1}{2}$' : (v === -0.5 ? '$-\\frac{1}{2}$' : String(v)),
                hint: '분수는 1/2, 음수는 -1/2 처럼 입력하세요.',
                sol: '<p>$' + name + ' ' + deg + '^\\circ = ' + (v === 0.5 ? '\\frac{1}{2}' : (v === -0.5 ? '-\\frac{1}{2}' : v)) + '$ 입니다.</p>' +
                  '<p>단위원에서 각 $' + deg + '^\\circ$ 인 점의 좌표를 떠올리면 부호를 쉽게 확인할 수 있습니다.</p>'
              };
            }
          },
          {
            id: 'trig-graph',
            name: '삼각함수의 그래프',
            desc: '주기와 최대·최소',
            concept: '<p>$y = a\\sin bx + c$ 의 주기는 $\\dfrac{2\\pi}{|b|}$, 최댓값은 $|a|+c$, 최솟값은 $-|a|+c$ 입니다. $y = a\\tan bx$ 의 주기는 $\\dfrac{\\pi}{|b|}$ 입니다.</p>',
            gen: function () {
              var a = M.nz(-4, 4), b = M.i(2, 6), c = M.i(-5, 5);
              var fn = M.pick(['\\sin', '\\cos']);
              var ask = M.pick(['period', 'max', 'min']);
              var body = '$y = ' + M.term(a, fn + ' ' + b + 'x') + (c === 0 ? '' : (c > 0 ? ' + ' + c : ' - ' + (-c))) + '$';
              if (ask === 'period') {
                return {
                  q: '함수 ' + body + ' 의 주기가 $k\\pi$ 일 때 $k$ 의 값을 구하시오.',
                  type: 'num',
                  ans: 2 / b,
                  ansText: '$' + M.fracTex(2, b) + '$',
                  hint: '분수는 2/3 처럼 입력하세요.',
                  sol: '<p>주기는 $\\dfrac{2\\pi}{|b|} = \\dfrac{2\\pi}{' + b + '} = ' + M.fracTex(2, b) + '\\pi$ 입니다.</p>'
                };
              }
              var max = Math.abs(a) + c, min = -Math.abs(a) + c;
              return {
                q: '함수 ' + body + ' 의 ' + (ask === 'max' ? '최댓값' : '최솟값') + '을 구하시오.',
                type: 'num',
                ans: ask === 'max' ? max : min,
                sol: '<p>$' + fn + ' ' + b + 'x$ 의 값은 $-1$ 이상 $1$ 이하이므로 $y$ 의 값은 $' + min + '$ 이상 $' + max + '$ 이하입니다.</p>' +
                  '<p>따라서 ' + (ask === 'max' ? '최댓값' : '최솟값') + '은 $' + (ask === 'max' ? max : min) + '$ 입니다.</p>'
              };
            }
          },
          {
            id: 'cosine-law',
            name: '사인법칙과 코사인법칙',
            desc: '삼각형의 변과 각 구하기',
            concept: '<p>사인법칙: $\\dfrac{a}{\\sin A} = \\dfrac{b}{\\sin B} = \\dfrac{c}{\\sin C} = 2R$. 코사인법칙: $a^2 = b^2 + c^2 - 2bc\\cos A$. 두 변과 낀 각을 알면 코사인법칙, 한 변과 마주 보는 각을 알면 사인법칙을 씁니다.</p>',
            gen: function () {
              if (Math.random() < 0.65) {
                var bank60 = [[3, 8, 7], [5, 8, 7], [7, 15, 13], [8, 15, 13], [5, 21, 19]];
                var bank120 = [[3, 5, 7], [5, 16, 19], [7, 8, 13], [7, 33, 37]];
                var deg = M.pick([60, 120]);
                var t = deg === 60 ? M.pick(bank60) : M.pick(bank120);
                var b = t[0], c = t[1], a = t[2];
                var cosv = deg === 60 ? '\\frac{1}{2}' : '\\left(-\\frac{1}{2}\\right)';
                var signTxt = deg === 60 ? '-' : '+';
                return {
                  q: '삼각형 $ABC$ 에서 $b = ' + b + '$, $c = ' + c + '$, $A = ' + deg + '^\\circ$ 일 때 변 $a$ 의 길이를 구하시오.',
                  type: 'num',
                  ans: a,
                  sol: '<p>$a^2 = b^2 + c^2 - 2bc\\cos A = ' + (b * b) + ' + ' + (c * c) + ' - 2 \\times ' + b + ' \\times ' + c + ' \\times ' + cosv + '$</p>' +
                    '<p>$= ' + (b * b) + ' + ' + (c * c) + ' ' + signTxt + ' ' + (b * c) + ' = ' + (a * a) + '$ 이므로 $a = ' + a + '$ 입니다.</p>'
                };
              }
              var side = M.i(3, 12);
              return {
                q: '삼각형 $ABC$ 에서 $a = ' + side + '$, $A = 30^\\circ$ 일 때 외접원의 반지름 $R$ 를 구하시오.',
                type: 'num',
                ans: side,
                sol: '<p>사인법칙에서 $\\dfrac{a}{\\sin A} = 2R$ 이므로 $2R = \\dfrac{' + side + '}{\\sin 30^\\circ} = \\dfrac{' + side + '}{\\frac{1}{2}} = ' + (2 * side) + '$</p>' +
                  '<p>$R = ' + side + '$</p>'
              };
            }
          }
        ]
      },
      {
        name: '수열',
        topics: [
          {
            id: 'arith',
            name: '등차수열',
            desc: '일반항과 합',
            concept: '<p>첫째항 $a$, 공차 $d$ 인 등차수열의 일반항은 $a_n = a + (n-1)d$ 이고, 첫째항부터 제$n$항까지의 합은 $S_n = \\dfrac{n\\{2a + (n-1)d\\}}{2}$ 입니다.</p>',
            gen: function () {
              var a = M.i(-9, 9), d = M.nz(-6, 6), n = M.i(5, 20);
              if (Math.random() < 0.5) {
                return {
                  q: '첫째항이 $' + a + '$, 공차가 $' + d + '$ 인 등차수열의 제' + n + '항을 구하시오.',
                  type: 'num',
                  ans: a + (n - 1) * d,
                  sol: '<p>$a_{' + n + '} = ' + a + ' + (' + n + ' - 1) \\times (' + d + ') = ' + a + ' + ' + ((n - 1) * d) + ' = ' + (a + (n - 1) * d) + '$</p>'
                };
              }
              var S = n * (2 * a + (n - 1) * d) / 2;
              return {
                q: '첫째항이 $' + a + '$, 공차가 $' + d + '$ 인 등차수열의 첫째항부터 제' + n + '항까지의 합을 구하시오.',
                type: 'num',
                ans: S,
                sol: '<p>$S_{' + n + '} = \\dfrac{' + n + '\\{2 \\times (' + a + ') + (' + n + '-1)(' + d + ')\\}}{2} = \\dfrac{' + n + ' \\times ' + (2 * a + (n - 1) * d) + '}{2} = ' + S + '$</p>'
                };
            }
          },
          {
            id: 'geo',
            name: '등비수열',
            desc: '일반항과 합',
            concept: '<p>첫째항 $a$, 공비 $r$ 인 등비수열의 일반항은 $a_n = ar^{n-1}$ 이고, $r \\ne 1$ 일 때 합은 $S_n = \\dfrac{a(r^n - 1)}{r - 1}$ 입니다.</p>',
            gen: function () {
              var a = M.pick([1, 2, 3, 5, -2, -3]);
              var r = M.pick([2, 3, -2]);
              var n = M.i(4, 8);
              if (Math.random() < 0.5) {
                return {
                  q: '첫째항이 $' + a + '$, 공비가 $' + r + '$ 인 등비수열의 제' + n + '항을 구하시오.',
                  type: 'num',
                  ans: a * Math.pow(r, n - 1),
                  sol: '<p>$a_{' + n + '} = ' + a + ' \\times (' + r + ')^{' + (n - 1) + '} = ' + a + ' \\times ' + Math.pow(r, n - 1) + ' = ' + (a * Math.pow(r, n - 1)) + '$</p>'
                };
              }
              var S = a * (Math.pow(r, n) - 1) / (r - 1);
              return {
                q: '첫째항이 $' + a + '$, 공비가 $' + r + '$ 인 등비수열의 첫째항부터 제' + n + '항까지의 합을 구하시오.',
                type: 'num',
                ans: S,
                sol: '<p>$S_{' + n + '} = \\dfrac{' + a + '\\{(' + r + ')^{' + n + '} - 1\\}}{' + r + ' - 1} = \\dfrac{' + a + ' \\times ' + (Math.pow(r, n) - 1) + '}{' + (r - 1) + '} = ' + S + '$</p>'
              };
            }
          },
          {
            id: 'sigma',
            name: '수열의 합 (시그마)',
            desc: '$\\sum$ 의 성질 이용하기',
            concept: '<p>$\\displaystyle\\sum_{k=1}^{n} k = \\dfrac{n(n+1)}{2}$, $\\displaystyle\\sum_{k=1}^{n} k^2 = \\dfrac{n(n+1)(2n+1)}{6}$, $\\displaystyle\\sum_{k=1}^{n} c = cn$ 입니다.</p>',
            gen: function () {
              var n = M.i(4, 12);
              if (Math.random() < 0.5) {
                var a = M.nz(-4, 5), b = M.i(-5, 5);
                var ans = a * n * (n + 1) / 2 + b * n;
                return {
                  q: '$\\displaystyle\\sum_{k=1}^{' + n + '} (' + M.poly([[a, 'k'], [b, '']]) + ')$ 의 값을 구하시오.',
                  type: 'num',
                  ans: ans,
                  sol: '<p>$\\sum_{k=1}^{' + n + '} k = \\dfrac{' + n + ' \\times ' + (n + 1) + '}{2} = ' + (n * (n + 1) / 2) + '$ 이므로</p>' +
                    '<p>$(' + a + ') \\times ' + (n * (n + 1) / 2) + ' + (' + b + ') \\times ' + n + ' = ' + ans + '$</p>'
                };
              }
              var sq = n * (n + 1) * (2 * n + 1) / 6;
              return {
                q: '$\\displaystyle\\sum_{k=1}^{' + n + '} k^2$ 의 값을 구하시오.',
                type: 'num',
                ans: sq,
                sol: '<p>$\\sum_{k=1}^{' + n + '} k^2 = \\dfrac{' + n + ' \\times ' + (n + 1) + ' \\times ' + (2 * n + 1) + '}{6} = ' + sq + '$</p>'
              };
            }
          }
        ]
      }
    ]
  };
})();
