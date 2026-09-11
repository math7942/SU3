/* 공통수학1 — 주제별 문제 생성기 */
(function () {
  var M = window.SU3M;

  function lin(r) { return r >= 0 ? '(x+' + r + ')' : '(x-' + (-r) + ')'; }
  function linTex(r) { return r >= 0 ? '(x+' + r + ')' : '(x-' + (-r) + ')'; }
  function mat(a, b, c, d) {
    return '\\begin{pmatrix} ' + a + ' & ' + b + ' \\\\ ' + c + ' & ' + d + ' \\end{pmatrix}';
  }

  window.SU3_SUBJECT = {
    id: 'common-math-1',
    name: '공통수학1',
    areas: [
      {
        name: '다항식',
        topics: [
          {
            id: 'poly-mul',
            name: '다항식의 곱셈',
            desc: '전개했을 때 특정 항의 계수 구하기',
            concept: '<p>다항식의 곱은 분배법칙으로 모든 항끼리 곱한 뒤 <strong>차수가 같은 항끼리 모아서</strong> 정리합니다. 전개식 전체를 구하지 않아도, 필요한 차수가 되는 짝만 찾아 곱해 더하면 그 항의 계수를 바로 얻습니다.</p>',
            gen: function () {
              var a = M.nz(-4, 5), b = M.nz(-5, 5), c = M.nz(-5, 5);
              var d = M.nz(-4, 5), e = M.nz(-5, 5);
              var ans = a * e + b * d;
              var A = M.poly([[a, 'x^2'], [b, 'x'], [c, '']]);
              var B = M.poly([[d, 'x'], [e, '']]);
              return {
                q: '다항식 $(' + A + ')(' + B + ')$ 를 전개했을 때 $x^2$ 의 계수를 구하시오.',
                type: 'num',
                ans: ans,
                sol: '<p>$x^2$ 항이 되는 곱은 두 가지입니다.</p><ul>' +
                  '<li>$' + M.term(a, 'x^2') + ' \\times ' + e + ' = ' + M.term(a * e, 'x^2') + '$</li>' +
                  '<li>$' + M.term(b, 'x') + ' \\times ' + M.term(d, 'x') + ' = ' + M.term(b * d, 'x^2') + '$</li>' +
                  '</ul><p>두 계수를 더하면 $(' + a + ') \\times (' + e + ') + (' + b + ') \\times (' + d + ') = ' + ans + '$ 입니다.</p>'
              };
            }
          },
          {
            id: 'remainder',
            name: '나머지정리',
            desc: '일차식으로 나눈 나머지 구하기',
            concept: '<p>다항식 $f(x)$ 를 $x-\\alpha$ 로 나눈 나머지는 <strong>$f(\\alpha)$</strong> 입니다(나머지정리). 특히 $f(\\alpha)=0$ 이면 $x-\\alpha$ 가 $f(x)$ 의 인수입니다(인수정리).</p>',
            gen: function () {
              var a = M.nz(-4, 4), b = M.nz(-6, 6), c = M.nz(-6, 6), k = M.nz(-3, 3);
              var f = function (x) { return x * x * x + a * x * x + b * x + c; };
              var ans = f(k);
              var poly = M.poly([[1, 'x^3'], [a, 'x^2'], [b, 'x'], [c, '']]);
              var div = k > 0 ? 'x-' + k : 'x+' + (-k);
              return {
                q: '다항식 $f(x) = ' + poly + '$ 을 $' + div + '$ 으로 나눈 나머지를 구하시오.',
                type: 'num',
                ans: ans,
                sol: '<p>나머지정리에 의해 나머지는 $f(' + k + ')$ 입니다.</p>' +
                  '<p>$f(' + k + ') = ' + M.poly([[1, '(' + k + ')^3'], [a, '(' + k + ')^2'], [b, '(' + k + ')'], [c, '']]) +
                  ' = ' + M.poly([[k * k * k, ''], [a * k * k, ''], [b * k, ''], [c, '']]) + ' = ' + ans + '$</p>'
              };
            }
          },
          {
            id: 'factorize',
            name: '인수분해',
            desc: '이차식을 두 일차식의 곱으로',
            concept: '<p>$x^2 + (p+q)x + pq = (x+p)(x+q)$ 입니다. <strong>곱하면 상수항, 더하면 일차항의 계수</strong>가 되는 두 수를 찾는 것이 핵심입니다.</p>',
            hint: '예: (x+2)(x-3) 처럼 입력하세요. 순서는 바뀌어도 됩니다.',
            gen: function () {
              var p = M.nz(-7, 7), q = M.nz(-7, 7);
              while (q === p) { q = M.nz(-7, 7); }
              var poly = M.poly([[1, 'x^2'], [p + q, 'x'], [p * q, '']]);
              return {
                q: '$' + poly + '$ 을 인수분해하시오.',
                type: 'text',
                ans: lin(p) + lin(q),
                alt: [lin(q) + lin(p)],
                ansText: '$' + linTex(p) + linTex(q) + '$',
                hint: '예: (x+2)(x-3) 처럼 입력하세요. 순서는 바뀌어도 됩니다.',
                sol: '<p>곱이 $' + (p * q) + '$, 합이 $' + (p + q) + '$ 인 두 수는 $' + p + '$ 와 $' + q + '$ 입니다.</p>' +
                  '<p>따라서 $' + poly + ' = ' + linTex(p) + linTex(q) + '$ 입니다.</p>'
              };
            }
          }
        ]
      },
      {
        name: '방정식과 부등식',
        topics: [
          {
            id: 'complex',
            name: '복소수의 계산',
            desc: '곱셈의 실수부와 허수부',
            concept: '<p>$i^2 = -1$ 이므로 $(a+bi)(c+di) = (ac-bd) + (ad+bc)i$ 입니다. 실수부와 허수부를 각각 모아 정리합니다.</p>',
            gen: function () {
              var a = M.nz(-5, 5), b = M.nz(-5, 5), c = M.nz(-5, 5), d = M.nz(-5, 5);
              var re = a * c - b * d, im = a * d + b * c;
              var askRe = Math.random() < 0.5;
              var z1 = M.poly([[a, ''], [b, 'i']]);
              var z2 = M.poly([[c, ''], [d, 'i']]);
              return {
                q: '$(' + z1 + ')(' + z2 + ')$ 를 계산했을 때 ' + (askRe ? '<strong>실수부</strong>' : '<strong>허수부</strong>') + '를 구하시오.',
                type: 'num',
                ans: askRe ? re : im,
                sol: '<p>$(' + z1 + ')(' + z2 + ') = ' + M.poly([[re, ''], [im, 'i']]) + '$</p>' +
                  '<p>실수부 $= (' + a + ') \\times (' + c + ') - (' + b + ') \\times (' + d + ') = ' + re + '$, ' +
                  '허수부 $= (' + a + ') \\times (' + d + ') + (' + b + ') \\times (' + c + ') = ' + im + '$ 입니다.</p>'
              };
            }
          },
          {
            id: 'quad-roots',
            name: '근과 계수의 관계',
            desc: '두 근의 합·곱으로 식의 값 구하기',
            concept: '<p>$x^2 + bx + c = 0$ 의 두 근을 $\\alpha, \\beta$ 라 하면 $\\alpha + \\beta = -b$, $\\alpha\\beta = c$ 입니다. 이를 이용하면 $\\alpha^2+\\beta^2 = (\\alpha+\\beta)^2 - 2\\alpha\\beta$ 처럼 대칭식의 값을 근을 구하지 않고도 계산할 수 있습니다.</p>',
            gen: function () {
              var b = M.nz(-8, 8), c = M.nz(-8, 8);
              var kind = M.pick(['sum', 'prod', 'sq', 'inv']);
              var eq = M.poly([[1, 'x^2'], [b, 'x'], [c, '']]) + ' = 0';
              var q, ans, ansText, sol;
              if (kind === 'sum') {
                q = '$\\alpha + \\beta$';
                ans = -b;
                sol = '<p>$\\alpha+\\beta = -(' + b + ') = ' + (-b) + '$</p>';
              } else if (kind === 'prod') {
                q = '$\\alpha\\beta$';
                ans = c;
                sol = '<p>$\\alpha\\beta = ' + c + '$</p>';
              } else if (kind === 'sq') {
                q = '$\\alpha^2 + \\beta^2$';
                ans = b * b - 2 * c;
                sol = '<p>$\\alpha^2+\\beta^2 = (\\alpha+\\beta)^2 - 2\\alpha\\beta = (' + (-b) + ')^2 - 2 \\times (' + c + ') = ' + ans + '$</p>';
              } else {
                q = '$\\dfrac{1}{\\alpha} + \\dfrac{1}{\\beta}$';
                ans = -b / c;
                ansText = '$' + M.fracTex(-b, c) + '$';
                sol = '<p>$\\dfrac{1}{\\alpha}+\\dfrac{1}{\\beta} = \\dfrac{\\alpha+\\beta}{\\alpha\\beta} = \\dfrac{' + (-b) + '}{' + c + '} = ' + M.fracTex(-b, c) + '$</p>';
              }
              return {
                q: '이차방정식 $' + eq + '$ 의 두 근을 $\\alpha, \\beta$ 라 할 때 ' + q + ' 의 값을 구하시오.',
                type: 'num',
                ans: ans,
                ansText: ansText,
                hint: '답이 분수이면 3/4 처럼 입력하세요.',
                sol: '<p>근과 계수의 관계에서 $\\alpha+\\beta = ' + (-b) + '$, $\\alpha\\beta = ' + c + '$ 입니다.</p>' + sol
              };
            }
          },
          {
            id: 'quad-minmax',
            name: '이차함수의 최대·최소',
            desc: '완전제곱꼴로 고쳐 꼭짓점 찾기',
            concept: '<p>$y = a(x-p)^2 + q$ 로 고치면 꼭짓점은 $(p,\\ q)$ 입니다. $a>0$ 이면 $x=p$ 에서 <strong>최솟값 $q$</strong>, $a<0$ 이면 $x=p$ 에서 <strong>최댓값 $q$</strong> 를 가집니다.</p>',
            gen: function () {
              var a = M.pick([1, 2, 3, -1, -2]);
              var p = M.i(-4, 4), qv = M.i(-9, 9);
              var b = -2 * a * p, c = a * p * p + qv;
              var poly = M.poly([[a, 'x^2'], [b, 'x'], [c, '']]);
              var word = a > 0 ? '최솟값' : '최댓값';
              return {
                q: '이차함수 $y = ' + poly + '$ 의 ' + word + '을 구하시오.',
                type: 'num',
                ans: qv,
                sol: '<p>$y = ' + poly + ' = ' + M.term(a, '') + '(x ' + (p >= 0 ? '- ' + p : '+ ' + (-p)) + ')^2 ' +
                  (qv >= 0 ? '+ ' + qv : '- ' + (-qv)) + '$</p>' +
                  '<p>꼭짓점이 $(' + p + ',\\ ' + qv + ')$ 이고 $a = ' + a + '$ 이므로 $x = ' + p + '$ 일 때 ' + word + ' $' + qv + '$ 입니다.</p>'
              };
            }
          },
          {
            id: 'quad-ineq',
            name: '이차부등식',
            desc: '해의 범위 고르기',
            concept: '<p>$(x-\\alpha)(x-\\beta) < 0\\ (\\alpha<\\beta)$ 의 해는 $\\alpha < x < \\beta$, $(x-\\alpha)(x-\\beta) > 0$ 의 해는 $x<\\alpha$ 또는 $x>\\beta$ 입니다. 그래프가 $x$ 축 아래에 있는 구간인지 위에 있는 구간인지로 판단합니다.</p>',
            gen: function () {
              var r = M.two(-6, 6);
              var p = Math.min(r[0], r[1]), q = Math.max(r[0], r[1]);
              var less = Math.random() < 0.5;
              var poly = M.poly([[1, 'x^2'], [-(p + q), 'x'], [p * q, '']]);
              var right = less ? '$' + p + ' < x < ' + q + '$' : '$x < ' + p + '$ 또는 $x > ' + q + '$';
              var wrong = less ? '$x < ' + p + '$ 또는 $x > ' + q + '$' : '$' + p + ' < x < ' + q + '$';
              var choices = M.shuffle([
                right,
                wrong,
                '$x < ' + q + '$',
                '$x > ' + p + '$'
              ]);
              return {
                q: '부등식 $' + poly + (less ? ' < 0' : ' > 0') + '$ 의 해를 고르시오.',
                type: 'choice',
                choices: choices,
                ans: choices.indexOf(right),
                sol: '<p>좌변을 인수분해하면 $' + linTex(-p) + linTex(-q) + (less ? ' < 0' : ' > 0') + '$ 입니다.</p>' +
                  '<p>두 근이 $' + p + ', ' + q + '$ 이고 아래로 볼록한 그래프이므로 해는 ' + right + ' 입니다.</p>'
              };
            }
          }
        ]
      },
      {
        name: '경우의 수',
        topics: [
          {
            id: 'count',
            name: '순열과 조합',
            desc: '뽑는 방법·줄 세우는 방법의 수',
            concept: '<p>순서를 <strong>따지면 순열</strong> $_nP_r = n(n-1)\\cdots(n-r+1)$, 순서를 <strong>따지지 않으면 조합</strong> $_nC_r = \\dfrac{_nP_r}{r!}$ 입니다. 대표를 그냥 뽑으면 조합, 회장·부회장처럼 자리가 다르면 순열입니다.</p>',
            gen: function () {
              var kind = M.pick(['perm', 'comb', 'role']);
              var n = M.i(5, 9), r = M.i(2, 3);
              if (kind === 'perm') {
                return {
                  q: '서로 다른 책 ' + n + '권 중에서 ' + r + '권을 골라 책꽂이에 나란히 꽂는 방법의 수를 구하시오.',
                  type: 'num',
                  ans: M.nPr(n, r),
                  sol: '<p>순서를 생각하므로 순열입니다.</p><p>$_{' + n + '}P_{' + r + '} = ' + M.nPr(n, r) + '$</p>'
                };
              }
              if (kind === 'comb') {
                return {
                  q: '학생 ' + n + '명 중에서 청소 당번 ' + r + '명을 뽑는 방법의 수를 구하시오.',
                  type: 'num',
                  ans: M.nCr(n, r),
                  sol: '<p>뽑힌 사람들 사이에 순서가 없으므로 조합입니다.</p><p>$_{' + n + '}C_{' + r + '} = ' + M.nCr(n, r) + '$</p>'
                };
              }
              return {
                q: '학생 ' + n + '명 중에서 회장 1명과 부회장 1명을 뽑는 방법의 수를 구하시오.',
                type: 'num',
                ans: n * (n - 1),
                sol: '<p>회장을 뽑는 경우 ' + n + '가지, 남은 ' + (n - 1) + '명 중 부회장을 뽑는 경우 ' + (n - 1) + '가지이므로</p>' +
                  '<p>$' + n + ' \\times ' + (n - 1) + ' = ' + (n * (n - 1)) + '$</p>'
              };
            }
          }
        ]
      },
      {
        name: '행렬',
        topics: [
          {
            id: 'matrix',
            name: '행렬의 연산',
            desc: '합·실수배·곱의 성분 구하기',
            concept: '<p>덧셈과 실수배는 같은 자리끼리 계산합니다. 곱셈에서 $AB$ 의 $(i,j)$ 성분은 <strong>$A$ 의 $i$ 행과 $B$ 의 $j$ 열을 각각 곱해 더한 값</strong>입니다.</p>',
            gen: function () {
              var a = M.i(-4, 5), b = M.i(-4, 5), c = M.i(-4, 5), d = M.i(-4, 5);
              var e = M.i(-4, 5), f = M.i(-4, 5), g = M.i(-4, 5), h = M.i(-4, 5);
              var A = [[a, b], [c, d]], B = [[e, f], [g, h]];
              var i = M.i(0, 1), j = M.i(0, 1);
              var ans = A[i][0] * B[0][j] + A[i][1] * B[1][j];
              return {
                q: '두 행렬 $A = ' + mat(a, b, c, d) + '$, $B = ' + mat(e, f, g, h) + '$ 에 대하여 ' +
                  '$AB$ 의 $(' + (i + 1) + ',\\ ' + (j + 1) + ')$ 성분을 구하시오.',
                type: 'num',
                ans: ans,
                sol: '<p>$A$ 의 ' + (i + 1) + '행은 $(' + A[i][0] + ',\\ ' + A[i][1] + ')$, $B$ 의 ' + (j + 1) + '열은 $(' + B[0][j] + ',\\ ' + B[1][j] + ')$ 입니다.</p>' +
                  '<p>$(' + A[i][0] + ') \\times (' + B[0][j] + ') + (' + A[i][1] + ') \\times (' + B[1][j] + ') = ' + ans + '$</p>'
              };
            }
          }
        ]
      }
    ]
  };
})();
