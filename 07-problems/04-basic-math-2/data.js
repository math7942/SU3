/* 기본수학2 — 주제별 문제 생성기 */
(function () {
  var M = window.SU3M;
  var TRIPLES = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [7, 24, 25], [20, 21, 29]];

  window.SU3_SUBJECT = {
    id: 'basic-math-2',
    name: '기본수학2',
    areas: [
      {
        name: '도형의 측정',
        topics: [
          {
            id: 'pythagoras',
            name: '피타고라스 정리',
            desc: '직각삼각형의 변의 길이',
            concept: '<p>직각삼각형에서 빗변의 길이를 $c$, 나머지 두 변을 $a, b$ 라 하면 $a^2 + b^2 = c^2$ 입니다. 구하려는 변이 빗변인지 아닌지를 먼저 확인하세요.</p>',
            gen: function () {
              var t = M.pick(TRIPLES);
              var askHyp = Math.random() < 0.5;
              if (askHyp) {
                return {
                  q: '직각을 낀 두 변의 길이가 각각 ' + t[0] + ', ' + t[1] + ' 인 직각삼각형의 빗변의 길이를 구하시오.',
                  type: 'num',
                  ans: t[2],
                  sol: '<p>$' + t[0] + '^2 + ' + t[1] + '^2 = ' + (t[0] * t[0]) + ' + ' + (t[1] * t[1]) + ' = ' + (t[2] * t[2]) + '$</p>' +
                    '<p>빗변의 길이는 $\\sqrt{' + (t[2] * t[2]) + '} = ' + t[2] + '$ 입니다.</p>'
                };
              }
              return {
                q: '빗변의 길이가 ' + t[2] + ' 이고 다른 한 변의 길이가 ' + t[0] + ' 인 직각삼각형에서 나머지 한 변의 길이를 구하시오.',
                type: 'num',
                ans: t[1],
                sol: '<p>$' + t[2] + '^2 - ' + t[0] + '^2 = ' + (t[2] * t[2]) + ' - ' + (t[0] * t[0]) + ' = ' + (t[1] * t[1]) + '$</p>' +
                  '<p>나머지 한 변은 $\\sqrt{' + (t[1] * t[1]) + '} = ' + t[1] + '$ 입니다.</p>'
              };
            }
          },
          {
            id: 'trig-ratio',
            name: '삼각비',
            desc: '직각삼각형에서 sin·cos·tan',
            concept: '<p>직각삼각형에서 $\\sin A = \\dfrac{\\text{높이}}{\\text{빗변}}$, $\\cos A = \\dfrac{\\text{밑변}}{\\text{빗변}}$, $\\tan A = \\dfrac{\\text{높이}}{\\text{밑변}}$ 입니다. 각 $A$ 를 기준으로 마주 보는 변이 높이입니다.</p>',
            gen: function () {
              var t = M.pick(TRIPLES);
              var kind = M.pick(['sin', 'cos', 'tan']);
              var n, d, expl;
              if (kind === 'sin') { n = t[1]; d = t[2]; expl = '높이 ÷ 빗변'; }
              else if (kind === 'cos') { n = t[0]; d = t[2]; expl = '밑변 ÷ 빗변'; }
              else { n = t[1]; d = t[0]; expl = '높이 ÷ 밑변'; }
              return {
                q: '$\\angle C = 90^\\circ$ 인 직각삼각형 $ABC$ 에서 밑변 $\\overline{AC} = ' + t[0] + '$, 높이 $\\overline{BC} = ' + t[1] +
                  '$, 빗변 $\\overline{AB} = ' + t[2] + '$ 이다. $\\' + kind + ' A$ 의 값을 구하시오.',
                type: 'num',
                ans: n / d,
                ansText: '$' + M.fracTex(n, d) + '$',
                hint: '분수로 답하려면 3/5 처럼 입력하세요.',
                sol: '<p>$\\' + kind + ' A = $ ' + expl + ' $= \\dfrac{' + n + '}{' + d + '} = ' + M.fracTex(n, d) + '$</p>'
              };
            }
          },
          {
            id: 'circle-measure',
            name: '원의 둘레와 넓이',
            desc: '$\\pi = 3.14$ 로 계산하기',
            concept: '<p>반지름이 $r$ 인 원의 둘레는 $2\\pi r$, 넓이는 $\\pi r^2$ 입니다. 여기서는 $\\pi = 3.14$ 로 계산합니다.</p>',
            gen: function () {
              var r = M.i(2, 15);
              var askArea = Math.random() < 0.5;
              var ans = askArea ? 3.14 * r * r : 2 * 3.14 * r;
              return {
                q: '반지름이 ' + r + ' cm 인 원의 ' + (askArea ? '넓이' : '둘레의 길이') + '를 구하시오. ($\\pi = 3.14$)',
                type: 'num',
                ans: Number(ans.toFixed(2)),
                unit: askArea ? 'cm²' : 'cm',
                tol: 0.02,
                sol: askArea
                  ? '<p>$\\pi r^2 = 3.14 \\times ' + r + '^2 = 3.14 \\times ' + (r * r) + ' = ' + Number(ans.toFixed(2)) + '$ (cm²)</p>'
                  : '<p>$2\\pi r = 2 \\times 3.14 \\times ' + r + ' = ' + Number(ans.toFixed(2)) + '$ (cm)</p>'
              };
            }
          }
        ]
      },
      {
        name: '자료와 가능성',
        topics: [
          {
            id: 'average',
            name: '평균과 중앙값',
            desc: '대푯값 구하기',
            concept: '<p>평균은 <strong>자료의 총합 ÷ 자료의 개수</strong>, 중앙값은 <strong>크기순으로 늘어놓았을 때 한가운데 값</strong>입니다. 자료가 짝수 개이면 가운데 두 값의 평균이 중앙값입니다.</p>',
            gen: function () {
              var n = M.pick([5, 5, 7]);
              var data = [];
              var i;
              for (i = 0; i < n; i++) { data.push(M.i(60, 100)); }
              var askMedian = Math.random() < 0.5;
              var sum = data.reduce(function (a, b) { return a + b; }, 0);
              var sorted = data.slice().sort(function (a, b) { return a - b; });
              var median = sorted[(n - 1) / 2];
              return {
                q: '어느 모둠 ' + n + '명의 수학 점수가 다음과 같다.<p>$' + data.join(',\\ ') + '$</p>' +
                  '이 자료의 <strong>' + (askMedian ? '중앙값' : '평균') + '</strong>을 구하시오.',
                type: 'num',
                ans: askMedian ? median : sum / n,
                ansText: askMedian ? String(median) : '$' + M.fracTex(sum, n) + '$',
                unit: '점',
                hint: '평균이 나누어떨어지지 않으면 분수(3/2)나 소수로 입력하세요.',
                tol: 0.005,
                sol: askMedian
                  ? '<p>크기순으로 나열하면 $' + sorted.join(',\\ ') + '$ 이고, 가운데 값은 $' + median + '$ 입니다.</p>'
                  : '<p>합이 $' + sum + '$ 이고 자료가 ' + n + '개이므로 평균은 $\\dfrac{' + sum + '}{' + n + '} = ' + M.fracTex(sum, n) + '$ 입니다.</p>'
              };
            }
          },
          {
            id: 'probability',
            name: '확률의 기초',
            desc: '주사위와 동전의 확률',
            concept: '<p>모든 경우가 똑같이 일어날 때 $(\\text{사건의 확률}) = \\dfrac{(\\text{사건이 일어나는 경우의 수})}{(\\text{모든 경우의 수})}$ 입니다.</p>',
            gen: function () {
              var kind = M.pick(['dice-sum', 'coin', 'dice-one']);
              if (kind === 'dice-sum') {
                var s = M.i(4, 10);
                var cnt = 0, a, b;
                for (a = 1; a <= 6; a++) { for (b = 1; b <= 6; b++) { if (a + b === s) { cnt++; } } }
                return {
                  q: '두 개의 주사위를 동시에 던질 때 나온 두 눈의 수의 합이 ' + s + ' 일 확률을 구하시오.',
                  type: 'num',
                  ans: cnt / 36,
                  ansText: '$' + M.fracTex(cnt, 36) + '$',
                  hint: '분수는 5/36 처럼 입력하세요.',
                  sol: '<p>모든 경우의 수는 $6 \\times 6 = 36$ 이고, 합이 ' + s + ' 인 경우는 ' + cnt + '가지입니다.</p>' +
                    '<p>확률은 $\\dfrac{' + cnt + '}{36} = ' + M.fracTex(cnt, 36) + '$ 입니다.</p>'
                };
              }
              if (kind === 'coin') {
                var n = M.i(3, 5), k = M.i(1, 3);
                var ways = M.nCr(n, k), tot = Math.pow(2, n);
                return {
                  q: '동전 ' + n + '개를 동시에 던질 때 앞면이 정확히 ' + k + '개 나올 확률을 구하시오.',
                  type: 'num',
                  ans: ways / tot,
                  ansText: '$' + M.fracTex(ways, tot) + '$',
                  hint: '분수는 3/8 처럼 입력하세요.',
                  sol: '<p>모든 경우의 수는 $2^{' + n + '} = ' + tot + '$, 앞면이 ' + k + '개인 경우는 $_{' + n + '}C_{' + k + '} = ' + ways + '$ 가지입니다.</p>' +
                    '<p>확률은 $\\dfrac{' + ways + '}{' + tot + '} = ' + M.fracTex(ways, tot) + '$ 입니다.</p>'
                };
              }
              var target = M.pick(['짝수', '3의 배수', '4 이상인 수']);
              var count = target === '짝수' ? 3 : (target === '3의 배수' ? 2 : 3);
              return {
                q: '주사위 한 개를 던질 때 나온 눈의 수가 ' + target + '일 확률을 구하시오.',
                type: 'num',
                ans: count / 6,
                ansText: '$' + M.fracTex(count, 6) + '$',
                hint: '분수는 1/2 처럼 입력하세요.',
                sol: '<p>' + target + '인 눈은 ' + count + '가지이고 모든 경우는 6가지이므로 확률은 $' + M.fracTex(count, 6) + '$ 입니다.</p>'
              };
            }
          }
        ]
      }
    ]
  };
})();
