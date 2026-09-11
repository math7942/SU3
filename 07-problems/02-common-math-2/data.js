/* 공통수학2 — 주제별 문제 생성기 */
(function () {
  var M = window.SU3M;
  var TRIPLES = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25]];

  function pt(x, y) { return '(' + x + ',\\ ' + y + ')'; }

  window.SU3_SUBJECT = {
    id: 'common-math-2',
    name: '공통수학2',
    areas: [
      {
        name: '도형의 방정식',
        topics: [
          {
            id: 'distance',
            name: '두 점 사이의 거리',
            desc: '좌표평면 위 선분의 길이',
            concept: '<p>두 점 $A(x_1,y_1)$, $B(x_2,y_2)$ 사이의 거리는 $\\overline{AB} = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$ 입니다. 가로 차이와 세로 차이를 두 변으로 하는 직각삼각형의 빗변으로 생각하면 됩니다.</p>',
            gen: function () {
              var t = M.pick(TRIPLES);
              var sx = M.pick([1, -1]), sy = M.pick([1, -1]);
              var x1 = M.i(-6, 6), y1 = M.i(-6, 6);
              var x2 = x1 + sx * t[0], y2 = y1 + sy * t[1];
              return {
                q: '두 점 $A' + pt(x1, y1) + '$, $B' + pt(x2, y2) + '$ 사이의 거리를 구하시오.',
                type: 'num',
                ans: t[2],
                sol: '<p>$\\overline{AB} = \\sqrt{(' + x2 + ' - (' + x1 + '))^2 + (' + y2 + ' - (' + y1 + '))^2}' +
                  ' = \\sqrt{' + (t[0] * t[0]) + ' + ' + (t[1] * t[1]) + '} = \\sqrt{' + (t[2] * t[2]) + '} = ' + t[2] + '$</p>'
              };
            }
          },
          {
            id: 'section',
            name: '내분점과 중점',
            desc: '선분을 m:n으로 나눈 점',
            concept: '<p>$A(x_1,y_1)$, $B(x_2,y_2)$ 에 대하여 선분 $AB$ 를 $m:n$ 으로 내분하는 점은 $\\left(\\dfrac{mx_2+nx_1}{m+n},\\ \\dfrac{my_2+ny_1}{m+n}\\right)$ 입니다. 중점은 $m=n=1$ 인 경우입니다.</p>',
            gen: function () {
              var m = M.i(1, 3), n = M.i(1, 3);
              var x1 = M.i(-8, 8), y1 = M.i(-8, 8), x2 = M.i(-8, 8), y2 = M.i(-8, 8);
              var askX = Math.random() < 0.5;
              var num = askX ? m * x2 + n * x1 : m * y2 + n * y1;
              var den = m + n;
              return {
                q: '두 점 $A' + pt(x1, y1) + '$, $B' + pt(x2, y2) + '$ 에 대하여 선분 $AB$ 를 $' + m + ':' + n + '$ 으로 ' +
                  '내분하는 점의 <strong>' + (askX ? 'x' : 'y') + '좌표</strong>를 구하시오.',
                type: 'num',
                ans: num / den,
                ansText: '$' + M.fracTex(num, den) + '$',
                hint: '답이 분수이면 3/4 처럼 입력하세요.',
                sol: '<p>$\\dfrac{' + m + ' \\times ' + (askX ? x2 : y2) + ' + ' + n + ' \\times ' + (askX ? x1 : y1) + '}{' + m + ' + ' + n + '}' +
                  ' = \\dfrac{' + num + '}{' + den + '} = ' + M.fracTex(num, den) + '$</p>'
              };
            }
          },
          {
            id: 'line',
            name: '직선의 방정식',
            desc: '기울기·평행·수직 조건',
            concept: '<p>두 점을 지나는 직선의 기울기는 $\\dfrac{y_2-y_1}{x_2-x_1}$ 입니다. 두 직선이 <strong>평행하면 기울기가 같고</strong>, <strong>수직이면 기울기의 곱이 $-1$</strong> 입니다.</p>',
            gen: function () {
              var kind = M.pick(['slope', 'perp']);
              if (kind === 'slope') {
                var x1 = M.i(-6, 6), y1 = M.i(-8, 8);
                var dx = M.nz(-5, 5), dy = M.i(-8, 8);
                var x2 = x1 + dx, y2 = y1 + dy;
                return {
                  q: '두 점 $' + pt(x1, y1) + '$, $' + pt(x2, y2) + '$ 을 지나는 직선의 기울기를 구하시오.',
                  type: 'num',
                  ans: dy / dx,
                  ansText: '$' + M.fracTex(dy, dx) + '$',
                  hint: '답이 분수이면 3/4 처럼 입력하세요.',
                  sol: '<p>$\\dfrac{' + y2 + ' - (' + y1 + ')}{' + x2 + ' - (' + x1 + ')} = \\dfrac{' + dy + '}{' + dx + '} = ' + M.fracTex(dy, dx) + '$</p>'
                };
              }
              var a = M.nz(-5, 5), b = M.i(-6, 6);
              return {
                q: '직선 $y = ' + M.poly([[a, 'x'], [b, '']]) + '$ 에 수직인 직선의 기울기를 구하시오.',
                type: 'num',
                ans: -1 / a,
                ansText: '$' + M.fracTex(-1, a) + '$',
                hint: '답이 분수이면 3/4 처럼 입력하세요.',
                sol: '<p>수직인 두 직선은 기울기의 곱이 $-1$ 이므로 구하는 기울기를 $m$ 이라 하면 $' + a + 'm = -1$ 입니다.</p>' +
                  '<p>$m = ' + M.fracTex(-1, a) + '$</p>'
              };
            }
          },
          {
            id: 'point-line',
            name: '점과 직선 사이의 거리',
            desc: '거리 공식 적용하기',
            concept: '<p>점 $(x_1,y_1)$ 과 직선 $ax+by+c=0$ 사이의 거리는 $\\dfrac{|ax_1+by_1+c|}{\\sqrt{a^2+b^2}}$ 입니다. 직선의 식을 반드시 $=0$ 꼴로 정리한 뒤 대입합니다.</p>',
            gen: function () {
              var t = M.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17]]);
              var a = t[0] * M.pick([1, -1]), b = t[1] * M.pick([1, -1]), c = M.i(-9, 9);
              var x1 = M.i(-6, 6), y1 = M.i(-6, 6);
              var val = Math.abs(a * x1 + b * y1 + c);
              return {
                q: '점 $' + pt(x1, y1) + '$ 과 직선 $' + M.poly([[a, 'x'], [b, 'y'], [c, '']]) + ' = 0$ 사이의 거리를 구하시오.',
                type: 'num',
                ans: val / t[2],
                ansText: '$' + M.fracTex(val, t[2]) + '$',
                hint: '답이 분수이면 3/4 처럼 입력하세요.',
                sol: '<p>$\\dfrac{|' + a + ' \\times (' + x1 + ') + (' + b + ') \\times (' + y1 + ') + (' + c + ')|}{\\sqrt{' + (a * a) + ' + ' + (b * b) + '}}' +
                  ' = \\dfrac{' + val + '}{' + t[2] + '} = ' + M.fracTex(val, t[2]) + '$</p>'
              };
            }
          },
          {
            id: 'circle',
            name: '원의 방정식',
            desc: '중심과 반지름 찾기',
            concept: '<p>$x^2+y^2+Ax+By+C=0$ 은 완전제곱꼴로 고치면 $(x+\\frac{A}{2})^2+(y+\\frac{B}{2})^2 = \\frac{A^2+B^2-4C}{4}$ 입니다. 중심은 $\\left(-\\frac{A}{2}, -\\frac{B}{2}\\right)$, 반지름은 그 값의 제곱근입니다.</p>',
            gen: function () {
              var a = M.i(-5, 5), b = M.i(-5, 5), r = M.i(2, 7);
              var A = -2 * a, B = -2 * b, C = a * a + b * b - r * r;
              var eq = M.poly([[1, 'x^2'], [1, 'y^2'], [A, 'x'], [B, 'y'], [C, '']]) + ' = 0';
              var askR = Math.random() < 0.5;
              return {
                q: '원 $' + eq + '$ 의 ' + (askR ? '<strong>반지름</strong>을' : '<strong>중심의 $x$ 좌표</strong>를') + ' 구하시오.',
                type: 'num',
                ans: askR ? r : a,
                sol: '<p>$' + eq + '$ 을 완전제곱꼴로 고치면</p>' +
                  '<p>$(x ' + (a >= 0 ? '- ' + a : '+ ' + (-a)) + ')^2 + (y ' + (b >= 0 ? '- ' + b : '+ ' + (-b)) + ')^2 = ' + (r * r) + '$</p>' +
                  '<p>중심은 $' + pt(a, b) + '$, 반지름은 $' + r + '$ 입니다.</p>'
              };
            }
          },
          {
            id: 'move',
            name: '도형의 이동',
            desc: '평행이동과 대칭이동',
            concept: '<p>점 $(a,b)$ 를 $x$ 축에 대하여 대칭이동하면 $(a,-b)$, $y$ 축이면 $(-a,b)$, 원점이면 $(-a,-b)$, 직선 $y=x$ 면 $(b,a)$ 입니다. $x$ 축 방향 $m$, $y$ 축 방향 $n$ 만큼 평행이동하면 $(a+m,\\ b+n)$ 입니다.</p>',
            hint: '예: (3,-2) 처럼 입력하세요.',
            gen: function () {
              var a = M.nz(-7, 7), b = M.nz(-7, 7);
              var kind = M.pick(['x', 'y', 'o', 'yx', 'move']);
              var res, label;
              if (kind === 'x') { res = [a, -b]; label = '$x$ 축에 대하여 대칭이동'; }
              else if (kind === 'y') { res = [-a, b]; label = '$y$ 축에 대하여 대칭이동'; }
              else if (kind === 'o') { res = [-a, -b]; label = '원점에 대하여 대칭이동'; }
              else if (kind === 'yx') { res = [b, a]; label = '직선 $y = x$ 에 대하여 대칭이동'; }
              else {
                var m = M.nz(-5, 5), n = M.nz(-5, 5);
                res = [a + m, b + n];
                label = '$x$ 축 방향으로 ' + m + ', $y$ 축 방향으로 ' + n + ' 만큼 평행이동';
              }
              return {
                q: '점 $P' + pt(a, b) + '$ 를 ' + label + '한 점의 좌표를 구하시오.',
                type: 'text',
                ans: '(' + res[0] + ',' + res[1] + ')',
                alt: [res[0] + ',' + res[1]],
                ansText: '$' + pt(res[0], res[1]) + '$',
                hint: '예: (3,-2) 처럼 입력하세요.',
                sol: '<p>' + label + '하면 좌표는 $' + pt(res[0], res[1]) + '$ 가 됩니다.</p>'
              };
            }
          }
        ]
      },
      {
        name: '집합과 명제',
        topics: [
          {
            id: 'set-count',
            name: '집합의 원소의 개수',
            desc: '합집합·교집합의 개수 세기',
            concept: '<p>$n(A \\cup B) = n(A) + n(B) - n(A \\cap B)$ 입니다. 두 번 센 교집합을 한 번 빼 준다고 생각하면 됩니다.</p>',
            gen: function () {
              var inter = M.i(2, 8), onlyA = M.i(3, 12), onlyB = M.i(3, 12);
              var nA = inter + onlyA, nB = inter + onlyB, nU = inter + onlyA + onlyB;
              var ask = M.pick(['union', 'inter', 'onlyA']);
              if (ask === 'union') {
                return {
                  q: '전체 학생 중 국어를 좋아하는 학생이 ' + nA + '명, 수학을 좋아하는 학생이 ' + nB + '명, ' +
                    '둘 다 좋아하는 학생이 ' + inter + '명이다. 국어 또는 수학을 좋아하는 학생 수를 구하시오.',
                  type: 'num',
                  ans: nU,
                  unit: '명',
                  sol: '<p>$n(A \\cup B) = ' + nA + ' + ' + nB + ' - ' + inter + ' = ' + nU + '$</p>'
                };
              }
              if (ask === 'inter') {
                return {
                  q: '$n(A) = ' + nA + '$, $n(B) = ' + nB + '$, $n(A \\cup B) = ' + nU + '$ 일 때 $n(A \\cap B)$ 를 구하시오.',
                  type: 'num',
                  ans: inter,
                  sol: '<p>$n(A \\cap B) = n(A) + n(B) - n(A \\cup B) = ' + nA + ' + ' + nB + ' - ' + nU + ' = ' + inter + '$</p>'
                };
              }
              return {
                q: '$n(A) = ' + nA + '$, $n(A \\cap B) = ' + inter + '$ 일 때, $A$ 에는 속하지만 $B$ 에는 속하지 않는 원소의 개수를 구하시오.',
                type: 'num',
                ans: onlyA,
                sol: '<p>$n(A - B) = n(A) - n(A \\cap B) = ' + nA + ' - ' + inter + ' = ' + onlyA + '$</p>'
              };
            }
          },
          {
            id: 'proposition',
            name: '명제의 역과 대우',
            desc: '역·이·대우 구별하기',
            concept: '<p>명제 "$p$ 이면 $q$" 에 대하여 <strong>역</strong>은 "$q$ 이면 $p$", <strong>이</strong>는 "$\\sim p$ 이면 $\\sim q$", <strong>대우</strong>는 "$\\sim q$ 이면 $\\sim p$" 입니다. 원래 명제와 대우의 참·거짓은 항상 일치합니다.</p>',
            gen: function () {
              var k = M.i(2, 6);
              var p = '$x = ' + k + '$', q = '$x^2 = ' + (k * k) + '$';
              var np = '$x \\ne ' + k + '$', nq = '$x^2 \\ne ' + (k * k) + '$';
              var kind = M.pick(['역', '이', '대우']);
              var map = {
                '역': q + ' 이면 ' + p + ' 이다.',
                '이': np + ' 이면 ' + nq + ' 이다.',
                '대우': nq + ' 이면 ' + np + ' 이다.'
              };
              var choices = M.shuffle([
                map['역'], map['이'], map['대우'], p + ' 이면 ' + q + ' 이다.'
              ]);
              return {
                q: '명제 "' + p + ' 이면 ' + q + ' 이다." 의 <strong>' + kind + '</strong>' + (kind === '역' ? '을' : '를') + ' 고르시오.',
                type: 'choice',
                choices: choices,
                ans: choices.indexOf(map[kind]),
                sol: '<p>$p$: ' + p + ', $q$: ' + q + ' 입니다.</p>' +
                  '<ul><li>역: ' + map['역'] + '</li><li>이: ' + map['이'] + '</li><li>대우: ' + map['대우'] + '</li></ul>'
              };
            }
          }
        ]
      },
      {
        name: '함수와 그래프',
        topics: [
          {
            id: 'composite',
            name: '합성함수와 역함수',
            desc: '$(f \\circ g)(a)$ 와 $f^{-1}(a)$',
            concept: '<p>$(f \\circ g)(x) = f(g(x))$ 이므로 <strong>안쪽 함수부터</strong> 계산합니다. 역함수는 $y=f(x)$ 를 $x$ 에 대하여 푼 것이므로, $f^{-1}(a) = b \\iff f(b) = a$ 입니다.</p>',
            gen: function () {
              var a = M.nz(-4, 4), b = M.i(-6, 6), c = M.nz(-4, 4), d = M.i(-6, 6);
              var f = M.poly([[a, 'x'], [b, '']]);
              var g = M.poly([[c, 'x'], [d, '']]);
              if (Math.random() < 0.5) {
                var k = M.i(-4, 4);
                var inner = c * k + d;
                var ans = a * inner + b;
                return {
                  q: '$f(x) = ' + f + '$, $g(x) = ' + g + '$ 일 때 $(f \\circ g)(' + k + ')$ 의 값을 구하시오.',
                  type: 'num',
                  ans: ans,
                  sol: '<p>$g(' + k + ') = ' + c + ' \\times (' + k + ') + (' + d + ') = ' + inner + '$</p>' +
                    '<p>$f(' + inner + ') = ' + a + ' \\times (' + inner + ') + (' + b + ') = ' + ans + '$</p>'
                };
              }
              var t = M.i(-4, 4);
              var val = a * t + b;
              return {
                q: '$f(x) = ' + f + '$ 일 때 $f^{-1}(' + val + ')$ 의 값을 구하시오.',
                type: 'num',
                ans: t,
                sol: '<p>$f^{-1}(' + val + ') = t$ 라 하면 $f(t) = ' + val + '$ 이므로 $' + M.poly([[a, 't'], [b, '']]) + ' = ' + val + '$</p>' +
                  '<p>$t = ' + t + '$</p>'
              };
            }
          },
          {
            id: 'rational',
            name: '유리함수의 점근선',
            desc: '분수 꼴 함수의 그래프',
            concept: '<p>$y = \\dfrac{ax+b}{x-p}$ 는 $y = \\dfrac{k}{x-p} + a$ 꼴로 고칠 수 있고, 점근선은 <strong>$x = p$, $y = a$</strong> 입니다. 분모가 0이 되는 값이 세로 점근선입니다.</p>',
            gen: function () {
              var p = M.nz(-5, 5), a = M.nz(-5, 5), k = M.nz(-6, 6);
              /* y = a + k/(x-p) = (a(x-p)+k)/(x-p) = (ax - ap + k)/(x-p) */
              var num = M.poly([[a, 'x'], [-a * p + k, '']]);
              var den = p > 0 ? 'x-' + p : 'x+' + (-p);
              var askY = Math.random() < 0.5;
              return {
                q: '유리함수 $y = \\dfrac{' + num + '}{' + den + '}$ 의 점근선 중 ' +
                  (askY ? '$y = k$ 꼴인 것의 $k$' : '$x = k$ 꼴인 것의 $k$') + ' 값을 구하시오.',
                type: 'num',
                ans: askY ? a : p,
                sol: '<p>$y = \\dfrac{' + num + '}{' + den + '} = ' + a + ' + \\dfrac{' + k + '}{' + den + '}$ 이므로</p>' +
                  '<p>점근선은 $x = ' + p + '$, $y = ' + a + '$ 입니다.</p>'
              };
            }
          },
          {
            id: 'irrational',
            name: '무리함수의 정의역',
            desc: '근호 안의 조건 찾기',
            concept: '<p>$y = \\sqrt{ax+b}$ 는 근호 안이 0 이상이어야 하므로 $ax+b \\ge 0$ 을 풉니다. $a<0$ 이면 부등호의 방향이 바뀌는 것에 주의하세요.</p>',
            gen: function () {
              var a = M.nz(-4, 4), b = M.i(-9, 9), c = M.i(-5, 5);
              var bound = -b / a;
              return {
                q: '무리함수 $y = \\sqrt{' + M.poly([[a, 'x'], [b, '']]) + '}' + (c === 0 ? '' : (c > 0 ? ' + ' + c : ' - ' + (-c))) + '$ 의 ' +
                  '정의역이 $x \\ ' + (a > 0 ? '\\ge' : '\\le') + ' \\ k$ 일 때 $k$ 의 값을 구하시오.',
                type: 'num',
                ans: bound,
                ansText: '$' + M.fracTex(-b, a) + '$',
                hint: '답이 분수이면 3/4 처럼 입력하세요.',
                sol: '<p>근호 안이 0 이상이어야 하므로 $' + M.poly([[a, 'x'], [b, '']]) + ' \\ge 0$</p>' +
                  '<p>$' + M.term(a, 'x') + ' \\ge ' + (-b) + '$ 이고 $a = ' + a + '$ 이므로 $x \\ ' + (a > 0 ? '\\ge' : '\\le') + '\\ ' + M.fracTex(-b, a) + '$ 입니다.</p>'
              };
            }
          }
        ]
      }
    ]
  };
})();
