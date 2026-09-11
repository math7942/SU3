/* 기하 — 주제별 문제 생성기 */
(function () {
  var M = window.SU3M;
  var QUADS = [[1, 2, 2, 3], [2, 3, 6, 7], [1, 4, 8, 9], [2, 6, 9, 11], [6, 6, 7, 11], [3, 4, 12, 13], [4, 4, 2, 6]];

  window.SU3_SUBJECT = {
    id: 'geometry',
    name: '기하',
    areas: [
      {
        name: '이차곡선',
        topics: [
          {
            id: 'parabola',
            name: '포물선',
            desc: '초점과 준선 찾기',
            concept: '<p>포물선 $y^2 = 4px$ 의 초점은 $(p, 0)$, 준선은 $x = -p$ 입니다. $x^2 = 4py$ 이면 초점은 $(0, p)$, 준선은 $y = -p$ 입니다.</p>',
            gen: function () {
              var p = M.nz(-5, 5);
              var vertical = Math.random() < 0.4;
              var eq = vertical ? 'x^2 = ' + (4 * p) + 'y' : 'y^2 = ' + (4 * p) + 'x';
              var askFocus = Math.random() < 0.5;
              return {
                q: '포물선 $' + eq + '$ 의 ' +
                  (askFocus
                    ? '초점의 좌표가 $' + (vertical ? '(0,\\ k)' : '(k,\\ 0)') + '$ 일 때 $k$'
                    : '준선이 $' + (vertical ? 'y = k' : 'x = k') + '$ 일 때 $k$') + ' 의 값을 구하시오.',
                type: 'num',
                ans: askFocus ? p : -p,
                sol: '<p>$' + eq + '$ 에서 $4p = ' + (4 * p) + '$ 이므로 $p = ' + p + '$ 입니다.</p>' +
                  '<p>초점은 $' + (vertical ? '(0,\\ ' + p + ')' : '(' + p + ',\\ 0)') + '$, 준선은 $' + (vertical ? 'y' : 'x') + ' = ' + (-p) + '$ 입니다.</p>'
              };
            }
          },
          {
            id: 'ellipse',
            name: '타원',
            desc: '초점과 축의 길이',
            concept: '<p>$\\dfrac{x^2}{a^2} + \\dfrac{y^2}{b^2} = 1\\ (a>b>0)$ 의 초점은 $(\\pm c, 0)$, $c = \\sqrt{a^2-b^2}$ 입니다. 장축의 길이는 $2a$, 단축의 길이는 $2b$ 입니다.</p>',
            gen: function () {
              var t = M.pick([[5, 3, 4], [13, 5, 12], [10, 6, 8], [17, 15, 8], [25, 24, 7], [5, 4, 3]]);
              var a = t[0], b = t[1], c = t[2];
              var ask = M.pick(['focus', 'major', 'minor']);
              return {
                q: '타원 $\\dfrac{x^2}{' + (a * a) + '} + \\dfrac{y^2}{' + (b * b) + '} = 1$ 의 ' +
                  (ask === 'focus' ? '초점의 좌표가 $(\\pm c,\\ 0)$ 일 때 $c$' : (ask === 'major' ? '장축의 길이' : '단축의 길이')) + '를 구하시오.',
                type: 'num',
                ans: ask === 'focus' ? c : (ask === 'major' ? 2 * a : 2 * b),
                sol: '<p>$a = ' + a + '$, $b = ' + b + '$ 이고 $c = \\sqrt{' + (a * a) + ' - ' + (b * b) + '} = \\sqrt{' + (c * c) + '} = ' + c + '$ 입니다.</p>' +
                  '<p>장축의 길이는 $2a = ' + (2 * a) + '$, 단축의 길이는 $2b = ' + (2 * b) + '$ 입니다.</p>'
              };
            }
          },
          {
            id: 'hyperbola',
            name: '쌍곡선',
            desc: '초점과 점근선',
            concept: '<p>$\\dfrac{x^2}{a^2} - \\dfrac{y^2}{b^2} = 1$ 의 초점은 $(\\pm c, 0)$, $c = \\sqrt{a^2+b^2}$ 이고 점근선은 $y = \\pm\\dfrac{b}{a}x$ 입니다.</p>',
            gen: function () {
              var t = M.pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [7, 24, 25]]);
              var a = t[0], b = t[1], c = t[2];
              var askFocus = Math.random() < 0.5;
              return {
                q: '쌍곡선 $\\dfrac{x^2}{' + (a * a) + '} - \\dfrac{y^2}{' + (b * b) + '} = 1$ 의 ' +
                  (askFocus ? '초점의 좌표가 $(\\pm c,\\ 0)$ 일 때 $c$' : '점근선 중 기울기가 양수인 것의 기울기') + '를 구하시오.',
                type: 'num',
                ans: askFocus ? c : b / a,
                ansText: askFocus ? String(c) : '$' + M.fracTex(b, a) + '$',
                hint: '분수는 4/3 처럼 입력하세요.',
                sol: '<p>$a = ' + a + '$, $b = ' + b + '$ 이므로 $c = \\sqrt{' + (a * a) + ' + ' + (b * b) + '} = ' + c + '$ 이고, ' +
                  '점근선은 $y = \\pm ' + M.fracTex(b, a) + 'x$ 입니다.</p>'
              };
            }
          }
        ]
      },
      {
        name: '평면벡터',
        topics: [
          {
            id: 'vector-op',
            name: '벡터의 연산',
            desc: '성분으로 계산하기',
            concept: '<p>$\\vec{a} = (a_1, a_2)$, $\\vec{b} = (b_1, b_2)$ 일 때 $m\\vec{a} + n\\vec{b} = (ma_1+nb_1,\\ ma_2+nb_2)$ 이고, $|\\vec{a}| = \\sqrt{a_1^2 + a_2^2}$ 입니다.</p>',
            gen: function () {
              var a1 = M.i(-5, 5), a2 = M.i(-5, 5), b1 = M.i(-5, 5), b2 = M.i(-5, 5);
              var m = M.nz(-3, 3), n = M.nz(-3, 3);
              var askX = Math.random() < 0.5;
              var ans = askX ? m * a1 + n * b1 : m * a2 + n * b2;
              return {
                q: '$\\vec{a} = (' + a1 + ',\\ ' + a2 + ')$, $\\vec{b} = (' + b1 + ',\\ ' + b2 + ')$ 일 때 ' +
                  '$' + M.term(m, '\\vec{a}') + ' ' + (n > 0 ? '+ ' + M.term(n, '\\vec{b}') : '- ' + M.term(-n, '\\vec{b}')) + '$ 의 ' +
                  (askX ? '$x$ 성분' : '$y$ 성분') + '을 구하시오.',
                type: 'num',
                ans: ans,
                sol: '<p>$' + m + '(' + a1 + ',\\ ' + a2 + ') + (' + n + ')(' + b1 + ',\\ ' + b2 + ') = (' +
                  (m * a1 + n * b1) + ',\\ ' + (m * a2 + n * b2) + ')$</p>'
              };
            }
          },
          {
            id: 'dot-product',
            name: '벡터의 내적',
            desc: '내적과 수직 조건',
            concept: '<p>$\\vec{a} \\cdot \\vec{b} = a_1b_1 + a_2b_2 = |\\vec{a}||\\vec{b}|\\cos\\theta$ 입니다. 두 벡터가 <strong>수직이면 내적이 0</strong> 입니다.</p>',
            gen: function () {
              if (Math.random() < 0.55) {
                var a1 = M.i(-6, 6), a2 = M.i(-6, 6), b1 = M.i(-6, 6), b2 = M.i(-6, 6);
                return {
                  q: '$\\vec{a} = (' + a1 + ',\\ ' + a2 + ')$, $\\vec{b} = (' + b1 + ',\\ ' + b2 + ')$ 일 때 $\\vec{a} \\cdot \\vec{b}$ 의 값을 구하시오.',
                  type: 'num',
                  ans: a1 * b1 + a2 * b2,
                  sol: '<p>$\\vec{a} \\cdot \\vec{b} = (' + a1 + ') \\times (' + b1 + ') + (' + a2 + ') \\times (' + b2 + ') = ' + (a1 * b1 + a2 * b2) + '$</p>'
                };
              }
              var c1 = M.nz(-5, 5), c2 = M.nz(-5, 5), d1 = M.nz(-5, 5);
              /* (c1, c2) . (d1, k) = 0  ->  k = -c1 d1 / c2 */
              return {
                q: '두 벡터 $\\vec{a} = (' + c1 + ',\\ ' + c2 + ')$ 와 $\\vec{b} = (' + d1 + ',\\ k)$ 가 서로 수직일 때 $k$ 의 값을 구하시오.',
                type: 'num',
                ans: -c1 * d1 / c2,
                ansText: '$' + M.fracTex(-c1 * d1, c2) + '$',
                hint: '분수는 3/4 처럼 입력하세요.',
                sol: '<p>수직이면 내적이 0 이므로 $(' + c1 + ') \\times (' + d1 + ') + (' + c2 + ')k = 0$</p>' +
                  '<p>$k = ' + M.fracTex(-c1 * d1, c2) + '$</p>'
              };
            }
          }
        ]
      },
      {
        name: '공간도형과 공간좌표',
        topics: [
          {
            id: 'space-distance',
            name: '공간에서 두 점 사이의 거리',
            desc: '3차원 좌표의 거리 공식',
            concept: '<p>두 점 $A(x_1,y_1,z_1)$, $B(x_2,y_2,z_2)$ 사이의 거리는 $\\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2 + (z_2-z_1)^2}$ 입니다.</p>',
            gen: function () {
              var t = M.pick(QUADS);
              var sx = M.pick([1, -1]), sy = M.pick([1, -1]), sz = M.pick([1, -1]);
              var x1 = M.i(-5, 5), y1 = M.i(-5, 5), z1 = M.i(-5, 5);
              var x2 = x1 + sx * t[0], y2 = y1 + sy * t[1], z2 = z1 + sz * t[2];
              return {
                q: '두 점 $A(' + x1 + ',\\ ' + y1 + ',\\ ' + z1 + ')$, $B(' + x2 + ',\\ ' + y2 + ',\\ ' + z2 + ')$ 사이의 거리를 구하시오.',
                type: 'num',
                ans: t[3],
                sol: '<p>$\\overline{AB} = \\sqrt{' + (t[0] * t[0]) + ' + ' + (t[1] * t[1]) + ' + ' + (t[2] * t[2]) + '} = \\sqrt{' + (t[3] * t[3]) + '} = ' + t[3] + '$</p>'
              };
            }
          },
          {
            id: 'sphere',
            name: '구의 방정식',
            desc: '중심과 반지름 찾기',
            concept: '<p>중심이 $(a,b,c)$, 반지름이 $r$ 인 구의 방정식은 $(x-a)^2 + (y-b)^2 + (z-c)^2 = r^2$ 입니다. 전개형은 완전제곱꼴로 고쳐 중심과 반지름을 읽습니다.</p>',
            gen: function () {
              var a = M.i(-4, 4), b = M.i(-4, 4), c = M.i(-4, 4), r = M.i(2, 6);
              var C = a * a + b * b + c * c - r * r;
              var eq = M.poly([[1, 'x^2'], [1, 'y^2'], [1, 'z^2'], [-2 * a, 'x'], [-2 * b, 'y'], [-2 * c, 'z'], [C, '']]) + ' = 0';
              var askR = Math.random() < 0.6;
              return {
                q: '구 $' + eq + '$ 의 ' + (askR ? '반지름을' : '중심의 $z$ 좌표를') + ' 구하시오.',
                type: 'num',
                ans: askR ? r : c,
                sol: '<p>완전제곱꼴로 고치면 $(x ' + (a >= 0 ? '- ' + a : '+ ' + (-a)) + ')^2 + (y ' + (b >= 0 ? '- ' + b : '+ ' + (-b)) +
                  ')^2 + (z ' + (c >= 0 ? '- ' + c : '+ ' + (-c)) + ')^2 = ' + (r * r) + '$</p>' +
                  '<p>중심은 $(' + a + ',\\ ' + b + ',\\ ' + c + ')$, 반지름은 $' + r + '$ 입니다.</p>'
              };
            }
          }
        ]
      }
    ]
  };
})();
