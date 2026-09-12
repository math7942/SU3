/* 기본수학1 — 주제별 문제 생성기 */
(function () {
  var M = window.SU3M;

  window.SU3_SUBJECT = {
    id: 'basic-math-1',
    name: '기본수학1',
    areas: [
      {
        name: '수와 연산',
        topics: [
          {
            id: 'int-calc',
            name: '정수와 유리수의 계산',
            desc: '괄호와 거듭제곱이 섞인 계산',
            concept: '<p>계산 순서는 <strong>거듭제곱 → 괄호 안 → 곱셈·나눗셈 → 덧셈·뺄셈</strong> 입니다. $(-2)^2 = 4$, $-2^2 = -4$ 처럼 괄호의 위치에 따라 값이 달라지는 것에 주의하세요.</p>',
            gen: function () {
              var a = M.nz(-6, 6), b = M.nz(-6, 6), c = M.nz(-5, 5), n = M.pick([2, 3]);
              var ans = Math.pow(a, n) + b * c;
              return {
                q: '$(' + a + ')^{' + n + '} + (' + b + ') \\times (' + c + ')$ 을 계산하시오.',
                type: 'num',
                ans: ans,
                sol: '<p>$(' + a + ')^{' + n + '} = ' + Math.pow(a, n) + '$, $(' + b + ') \\times (' + c + ') = ' + (b * c) + '$</p>' +
                  '<p>$' + Math.pow(a, n) + ' + (' + (b * c) + ') = ' + ans + '$</p>'
              };
            }
          },
          {
            id: 'percent',
            name: '비율과 백분율',
            desc: '할인·증가율 계산',
            concept: '<p>$a$ 의 $p\\%$ 는 $a \\times \\dfrac{p}{100}$ 입니다. $p\\%$ 할인한 가격은 $a \\times \\left(1 - \\dfrac{p}{100}\\right)$, $p\\%$ 오른 값은 $a \\times \\left(1 + \\dfrac{p}{100}\\right)$ 입니다.</p>',
            gen: function () {
              var price = M.i(2, 40) * 1000;
              var p = M.pick([5, 10, 15, 20, 25, 30, 40]);
              var up = Math.random() < 0.4;
              var ans = up ? price * (1 + p / 100) : price * (1 - p / 100);
              return {
                q: '정가가 ' + price.toLocaleString() + '원인 물건의 가격이 ' + p + '% ' + (up ? '올랐다' : '할인되었다') + '. 이때의 가격을 구하시오.',
                type: 'num',
                ans: ans,
                unit: '원',
                tol: 0.5,
                sol: '<p>' + price.toLocaleString() + ' $\\times$ ' + (up ? '(1 + ' : '(1 - ') + p + '/100) $=$ ' +
                  price.toLocaleString() + ' $\\times$ ' + (up ? (1 + p / 100) : (1 - p / 100)) + ' $=$ ' + ans.toLocaleString() + '원</p>'
              };
            }
          }
        ]
      },
      {
        name: '문자와 식',
        topics: [
          {
            id: 'linear-eq',
            name: '일차방정식',
            desc: '$ax+b = cx+d$ 풀기',
            concept: '<p>문자항은 좌변으로, 숫자항은 우변으로 <strong>이항</strong>한 뒤 양변을 문자의 계수로 나눕니다. 이항할 때 부호가 바뀌는 것을 잊지 마세요.</p>',
            gen: function () {
              var x = M.i(-6, 6);
              var a = M.nz(-6, 6), c = M.nz(-6, 6);
              while (c === a) { c = M.nz(-6, 6); }
              var b = M.i(-9, 9);
              var d = (a - c) * x + b;
              return {
                q: '일차방정식 $' + M.poly([[a, 'x'], [b, '']]) + ' = ' + M.poly([[c, 'x'], [d, '']]) + '$ 을 푸시오.',
                type: 'num',
                ans: x,
                hint: 'x의 값을 입력하세요.',
                sol: '<p>$' + M.term(a, 'x') + ' - ' + M.term(c, 'x') + ' = ' + d + ' - (' + b + ')$</p>' +
                  '<p>$' + M.term(a - c, 'x') + ' = ' + (d - b) + '$ 이므로 $x = ' + x + '$</p>'
              };
            }
          },
          {
            id: 'expand',
            name: '곱셈 공식',
            desc: '$(a+b)^2$ 꼴 전개하기',
            concept: '<p>$(x+a)^2 = x^2 + 2ax + a^2$, $(x+a)(x-a) = x^2 - a^2$, $(x+a)(x+b) = x^2 + (a+b)x + ab$ 입니다.</p>',
            gen: function () {
              var a = M.nz(-7, 7);
              var kind = M.pick(['square', 'diff']);
              if (kind === 'square') {
                return {
                  q: '$(x ' + (a > 0 ? '+ ' + a : '- ' + (-a)) + ')^2$ 을 전개했을 때 $x$ 의 계수를 구하시오.',
                  type: 'num',
                  ans: 2 * a,
                  sol: '<p>$(x ' + (a > 0 ? '+ ' + a : '- ' + (-a)) + ')^2 = ' + M.poly([[1, 'x^2'], [2 * a, 'x'], [a * a, '']]) + '$</p>' +
                    '<p>따라서 $x$ 의 계수는 $' + (2 * a) + '$ 입니다.</p>'
                };
              }
              return {
                q: '$(x ' + (a > 0 ? '+ ' + a : '- ' + (-a)) + ')(x ' + (a > 0 ? '- ' + a : '+ ' + (-a)) + ')$ 을 전개했을 때 상수항을 구하시오.',
                type: 'num',
                ans: -a * a,
                sol: '<p>$(x+a)(x-a) = x^2 - a^2$ 이므로 상수항은 $-(' + a + ')^2 = ' + (-a * a) + '$ 입니다.</p>'
              };
            }
          },
          {
            id: 'quad-solve',
            name: '이차방정식 풀기',
            desc: '인수분해와 근의 공식',
            concept: '<p>$x^2+bx+c=0$ 은 곱이 $c$, 합이 $b$ 인 두 수를 찾아 인수분해합니다. 인수분해가 어려우면 근의 공식 $x = \\dfrac{-b \\pm \\sqrt{b^2-4ac}}{2a}$ 를 씁니다.</p>',
            gen: function () {
              var p = M.nz(-8, 8), q = M.nz(-8, 8);
              while (q === p) { q = M.nz(-8, 8); }
              var big = Math.max(p, q), small = Math.min(p, q);
              var askBig = Math.random() < 0.5;
              return {
                q: '이차방정식 $' + M.poly([[1, 'x^2'], [-(p + q), 'x'], [p * q, '']]) + ' = 0$ 의 두 근 중 ' +
                  (askBig ? '<strong>큰 근</strong>' : '<strong>작은 근</strong>') + '을 구하시오.',
                type: 'num',
                ans: askBig ? big : small,
                sol: '<p>곱이 $' + (p * q) + '$, 합이 $' + (p + q) + '$ 인 두 수는 $' + p + '$ 와 $' + q + '$ 이므로</p>' +
                  '<p>$(x ' + (p >= 0 ? '- ' + p : '+ ' + (-p)) + ')(x ' + (q >= 0 ? '- ' + q : '+ ' + (-q)) + ') = 0$, 즉 $x = ' + small + '$ 또는 $x = ' + big + '$ 입니다.</p>'
              };
            }
          }
        ]
      },
      {
        name: '함수',
        topics: [
          {
            id: 'linear-fn',
            name: '일차함수의 그래프',
            desc: '기울기·절편 구하기',
            concept: '<p>$y = ax+b$ 에서 $a$ 는 기울기, $b$ 는 $y$ 절편입니다. $x$ 절편은 $y=0$ 을 대입해 얻은 $x = -\\dfrac{b}{a}$ 입니다.</p>',
            gen: function () {
              var a = M.nz(-5, 5), b = M.nz(-9, 9);
              var kind = M.pick(['xint', 'value']);
              if (kind === 'xint') {
                return {
                  q: '일차함수 $y = ' + M.poly([[a, 'x'], [b, '']]) + '$ 의 $x$ 절편을 구하시오.',
                  type: 'num',
                  ans: -b / a,
                  ansText: '$' + M.fracTex(-b, a) + '$',
                  hint: '답이 분수이면 3/4 처럼 입력하세요.',
                  sol: '<p>$y = 0$ 을 대입하면 $' + M.term(a, 'x') + ' ' + (b > 0 ? '+ ' + b : '- ' + (-b)) + ' = 0$</p>' +
                    '<p>$x = ' + M.fracTex(-b, a) + '$</p>'
                };
              }
              var k = M.i(-5, 5);
              return {
                q: '일차함수 $f(x) = ' + M.poly([[a, 'x'], [b, '']]) + '$ 에 대하여 $f(' + k + ')$ 의 값을 구하시오.',
                type: 'num',
                ans: a * k + b,
                sol: '<p>$f(' + k + ') = ' + a + ' \\times (' + k + ') ' + (b > 0 ? '+ ' + b : '- ' + (-b)) + ' = ' + (a * k + b) + '$</p>'
              };
            }
          }
        ]
      }
    ]
  };
})();
