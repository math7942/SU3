/* 실용 통계 — 주제별 문제 생성기 */
(function () {
  var M = window.SU3M;

  window.SU3_SUBJECT = {
    id: 'practical-statistics',
    name: '실용 통계',
    areas: [
      {
        name: '자료의 수집',
        topics: [
          {
            id: 'sampling',
            name: '표본 추출 방법',
            desc: '상황에 맞는 추출법 고르기',
            concept: '<p><strong>단순임의추출</strong>은 모든 대상이 뽑힐 확률이 같게 뽑는 방법, <strong>층화추출</strong>은 집단을 특성별로 나눈 뒤 각 층에서 비례해 뽑는 방법, <strong>계통추출</strong>은 일정한 간격으로 뽑는 방법, <strong>군집추출</strong>은 몇 개의 집단(군집)을 통째로 뽑는 방법입니다.</p>',
            gen: function () {
              var bank = [
                { s: '전교생에게 번호를 부여하고 난수표로 50명을 뽑았다.', a: '단순임의추출' },
                { s: '남학생과 여학생의 비율에 맞추어 각각 30명, 20명을 뽑았다.', a: '층화추출' },
                { s: '명렬표에서 10번째마다 한 명씩 뽑았다.', a: '계통추출' },
                { s: '전체 20개 학급 중 3개 학급을 뽑아 그 학급 학생 전원을 조사했다.', a: '군집추출' },
                { s: '학년별 학생 수의 비율대로 표본 수를 정해 각 학년에서 뽑았다.', a: '층화추출' },
                { s: '상자에서 제품을 무작위로 하나씩 20개 꺼내 검사했다.', a: '단순임의추출' }
              ];
              var b = M.pick(bank);
              var choices = M.shuffle(['단순임의추출', '층화추출', '계통추출', '군집추출']);
              return {
                q: '다음 조사에서 사용한 표본 추출 방법을 고르시오.<p>' + b.s + '</p>',
                type: 'choice',
                choices: choices,
                ans: choices.indexOf(b.a),
                sol: '<p>' + b.s + '</p><p>이 방법은 <strong>' + b.a + '</strong> 입니다.</p>'
              };
            }
          }
        ]
      },
      {
        name: '자료의 정리와 요약',
        topics: [
          {
            id: 'center',
            name: '대푯값',
            desc: '평균·중앙값·최빈값',
            concept: '<p>평균은 자료의 합을 개수로 나눈 값, 중앙값은 크기순으로 놓았을 때 가운데 값, 최빈값은 가장 자주 나온 값입니다. <strong>극단적인 값이 있으면 평균이 크게 흔들리므로</strong> 중앙값이 더 대표성이 있을 수 있습니다.</p>',
            gen: function () {
              var n = 7;
              var data = [];
              var mode = M.i(3, 9);
              data.push(mode, mode, mode);
              var used = [mode];
              var i;
              for (i = 0; i < n - 3; i++) {
                var v = M.i(1, 15);
                while (used.indexOf(v) !== -1) { v = M.i(1, 15); }
                used.push(v);
                data.push(v);
              }
              data = M.shuffle(data);
              var sorted = data.slice().sort(function (a, b) { return a - b; });
              var sum = data.reduce(function (a, b) { return a + b; }, 0);
              var kind = M.pick(['mean', 'median', 'mode']);
              var ans = kind === 'mean' ? sum / n : (kind === 'median' ? sorted[3] : mode);
              var label = kind === 'mean' ? '평균' : (kind === 'median' ? '중앙값' : '최빈값');
              return {
                q: '다음 자료의 <strong>' + label + '</strong>을 구하시오.<p>$' + data.join(',\\ ') + '$</p>',
                type: 'num',
                ans: ans,
                ansText: kind === 'mean' ? '$' + M.fracTex(sum, n) + '$' : String(ans),
                hint: '분수 또는 소수로 입력하세요.',
                tol: 5e-4,
                sol: kind === 'mean'
                  ? '<p>합이 $' + sum + '$, 자료가 ' + n + '개이므로 평균은 $\\dfrac{' + sum + '}{' + n + '} = ' + M.fracTex(sum, n) + '$ 입니다.</p>'
                  : (kind === 'median'
                    ? '<p>크기순으로 나열하면 $' + sorted.join(',\\ ') + '$ 이고 가운데 값은 $' + sorted[3] + '$ 입니다.</p>'
                    : '<p>가장 많이 나온 값은 $' + mode + '$ 입니다. (3번)</p>')
              };
            }
          },
          {
            id: 'spread',
            name: '분산과 표준편차',
            desc: '자료가 흩어진 정도',
            concept: '<p>편차 $=$ (변량) $-$ (평균) 이고, 분산 $=$ 편차의 제곱의 평균, 표준편차 $= \\sqrt{\\text{분산}}$ 입니다. 편차의 합은 항상 0 입니다.</p>',
            gen: function () {
              var data = [], i;
              for (i = 0; i < 4; i++) { data.push(M.i(2, 18)); }
              var partial = data.reduce(function (a, b) { return a + b; }, 0);
              var last = M.i(2, 18);
              while ((partial + last) % 5 !== 0) { last = M.i(2, 18); }
              data.push(last);
              var mean = (partial + last) / 5;
              var devs = data.map(function (v) { return v - mean; });
              var varsum = devs.reduce(function (a, d) { return a + d * d; }, 0);
              var variance = varsum / 5;
              var askSd = Math.random() < 0.35;
              return {
                q: '다음 자료의 <strong>' + (askSd ? '표준편차' : '분산') + '</strong>' + (askSd ? '를' : '을') + ' 구하시오. ' +
                  (askSd ? '(소수 넷째 자리까지)' : '') + '<p>$' + data.join(',\\ ') + '$</p>',
                type: 'num',
                ans: askSd ? Number(Math.sqrt(variance).toFixed(4)) : variance,
                ansText: askSd ? String(Number(Math.sqrt(variance).toFixed(4))) : M.num(variance, 4),
                hint: '분수 또는 소수로 입력하세요.',
                tol: 5e-4,
                sol: '<p>평균은 $' + mean + '$ 이고 편차는 $' + devs.slice().sort(function (a, b) { return a - b; }).join(',\\ ') + '$ 입니다.</p>' +
                  '<p>분산 $= \\dfrac{' + varsum + '}{5} = ' + M.num(variance, 4) + '$, 표준편차 $= \\sqrt{' + M.num(variance, 4) + '} \\approx ' +
                  Number(Math.sqrt(variance).toFixed(4)) + '$</p>'
              };
            }
          }
        ]
      },
      {
        name: '통계적 추정과 해석',
        topics: [
          {
            id: 'regression',
            name: '회귀직선과 예측',
            desc: '추세식으로 값 예측하기',
            concept: '<p>두 변량 사이의 관계를 직선 $y = ax + b$ 로 나타낸 것이 회귀직선입니다. $x$ 값을 대입하면 $y$ 를 예측할 수 있지만, <strong>자료의 범위를 크게 벗어난 예측은 신뢰하기 어렵습니다.</strong></p>',
            gen: function () {
              var a = M.pick([0.5, 1.5, 2, 2.5, 3, -1.5, -2]);
              var b = M.i(5, 40);
              var x = M.i(2, 20);
              var ans = Number((a * x + b).toFixed(4));
              return {
                q: '어떤 자료에서 공부 시간 $x$ (시간)와 점수 $y$ (점) 사이의 회귀직선이 $y = ' + M.poly([[a, 'x'], [b, '']]) + '$ 로 구해졌다. ' +
                  '공부 시간이 ' + x + '시간일 때 예측되는 점수를 구하시오.',
                type: 'num',
                ans: ans,
                unit: '점',
                tol: 5e-4,
                sol: '<p>$y = ' + a + ' \\times ' + x + ' + ' + b + ' = ' + ans + '$ (점)</p>'
              };
            }
          },
          {
            id: 'correlation',
            name: '상관관계의 해석',
            desc: '산점도와 상관계수 읽기',
            concept: '<p>상관계수 $r$ 는 $-1 \\le r \\le 1$ 이고, 1 에 가까울수록 강한 양의 상관, $-1$ 에 가까울수록 강한 음의 상관, 0 에 가까우면 상관관계가 거의 없습니다. <strong>상관관계가 인과관계를 뜻하지는 않습니다.</strong></p>',
            gen: function () {
              var bank = [
                { r: 0.92, a: '강한 양의 상관관계가 있다.' },
                { r: 0.35, a: '약한 양의 상관관계가 있다.' },
                { r: -0.88, a: '강한 음의 상관관계가 있다.' },
                { r: -0.28, a: '약한 음의 상관관계가 있다.' },
                { r: 0.03, a: '상관관계가 거의 없다.' }
              ];
              var b = M.pick(bank);
              var choices = M.shuffle([
                '강한 양의 상관관계가 있다.',
                '약한 양의 상관관계가 있다.',
                '강한 음의 상관관계가 있다.',
                '약한 음의 상관관계가 있다.',
                '상관관계가 거의 없다.'
              ]).slice(0, 4);
              if (choices.indexOf(b.a) === -1) { choices[0] = b.a; choices = M.shuffle(choices); }
              return {
                q: '두 변량 사이의 상관계수가 $r = ' + b.r + '$ 로 구해졌다. 이 자료에 대한 해석으로 가장 알맞은 것을 고르시오.',
                type: 'choice',
                choices: choices,
                ans: choices.indexOf(b.a),
                sol: '<p>$r = ' + b.r + '$ 이므로 ' + b.a + '</p>' +
                  '<p>상관계수의 부호는 방향을, 절댓값의 크기는 관계의 강도를 나타냅니다. 보통 절댓값이 0.7 이상이면 강한 상관으로 봅니다.</p>'
              };
            }
          },
          {
            id: 'proportion',
            name: '표본비율과 모비율 추정',
            desc: '비율의 추정과 오차',
            concept: '<p>표본비율 $\\hat{p} = \\dfrac{X}{n}$ 이고, 모비율 $p$ 에 대한 신뢰도 95% 신뢰구간은 $\\hat{p} \\pm 1.96\\sqrt{\\dfrac{\\hat{p}(1-\\hat{p})}{n}}$ 입니다.</p>',
            gen: function () {
              var n = M.pick([100, 200, 400, 500, 1000]);
              var X = M.i(Math.round(n * 0.2), Math.round(n * 0.8));
              var p = X / n;
              if (Math.random() < 0.5) {
                return {
                  q: '어떤 조사에서 ' + n + '명을 뽑아 물었더니 ' + X + '명이 찬성하였다. 표본비율을 구하시오.',
                  type: 'num',
                  ans: p,
                  ansText: '$' + M.fracTex(X, n) + '$ $=$ ' + M.num(p, 4),
                  hint: '분수 또는 소수로 입력하세요.',
                  tol: 5e-4,
                  sol: '<p>$\\hat{p} = \\dfrac{' + X + '}{' + n + '} = ' + M.num(p, 4) + '$</p>'
                };
              }
              var err = 1.96 * Math.sqrt(p * (1 - p) / n);
              return {
                q: '어떤 조사에서 ' + n + '명을 뽑아 물었더니 ' + X + '명이 찬성하였다. ' +
                  '모비율에 대한 신뢰도 95% 신뢰구간의 <strong>오차의 한계</strong> $1.96\\sqrt{\\dfrac{\\hat{p}(1-\\hat{p})}{n}}$ 를 구하시오. (소수 넷째 자리까지)',
                type: 'num',
                ans: Number(err.toFixed(4)),
                tol: 5e-4,
                hint: '소수로 입력하세요.',
                sol: '<p>$\\hat{p} = ' + M.num(p, 4) + '$ 이므로</p>' +
                  '<p>$1.96\\sqrt{\\dfrac{' + M.num(p, 4) + ' \\times ' + M.num(1 - p, 4) + '}{' + n + '}} \\approx ' + Number(err.toFixed(4)) + '$</p>'
              };
            }
          }
        ]
      }
    ]
  };
})();
