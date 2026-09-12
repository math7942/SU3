/* 직무 수학 — 주제별 문제 생성기 */
(function () {
  var M = window.SU3M;

  function won(n) { return Math.round(n).toLocaleString('ko-KR'); }

  window.SU3_SUBJECT = {
    id: 'vocational',
    name: '직무 수학',
    areas: [
      {
        name: '수와 연산',
        topics: [
          {
            id: 'rate',
            name: '비율과 할인·부가세',
            desc: '현장에서 쓰는 비율 계산',
            concept: '<p>$p\\%$ 는 $\\dfrac{p}{100}$ 입니다. 할인가는 $\\text{정가} \\times (1 - \\frac{p}{100})$, 부가세 포함가는 $\\text{공급가} \\times 1.1$ 로 계산합니다.</p>',
            gen: function () {
              var kind = M.pick(['discount', 'vat', 'rate']);
              if (kind === 'discount') {
                var price = M.i(3, 60) * 1000, p = M.pick([5, 10, 15, 20, 25, 30]);
                return {
                  q: '정가 ' + won(price) + '원인 부품을 ' + p + '% 할인하여 판매할 때의 가격을 구하시오.',
                  type: 'num',
                  ans: price * (1 - p / 100),
                  unit: '원',
                  tol: 0.5,
                  sol: '<p>' + won(price) + ' $\\times$ ' + (1 - p / 100) + ' $=$ ' + won(price * (1 - p / 100)) + '원</p>'
                };
              }
              if (kind === 'vat') {
                var supply = M.i(2, 80) * 5000;
                return {
                  q: '공급가액이 ' + won(supply) + '원인 물품에 부가가치세 10%를 더한 최종 금액을 구하시오.',
                  type: 'num',
                  ans: supply * 1.1,
                  unit: '원',
                  tol: 0.5,
                  sol: '<p>' + won(supply) + ' $\\times$ 1.1 $=$ ' + won(supply * 1.1) + '원</p>'
                };
              }
              var total = M.i(20, 60) * 5, bad = M.i(1, 12);
              return {
                q: '제품 ' + total + '개 중 불량품이 ' + bad + '개 나왔다. 불량률을 백분율로 구하시오. (소수 둘째 자리까지)',
                type: 'num',
                ans: Number((bad / total * 100).toFixed(2)),
                unit: '%',
                tol: 0.02,
                sol: '<p>$\\dfrac{' + bad + '}{' + total + '} \\times 100 = ' + Number((bad / total * 100).toFixed(2)) + '$ (%)</p>'
              };
            }
          },
          {
            id: 'unit',
            name: '단위 환산',
            desc: '길이·넓이·속력 바꾸기',
            concept: '<p>$1\\,\\text{m} = 100\\,\\text{cm}$, $1\\,\\text{m}^2 = 10000\\,\\text{cm}^2$, $1\\,\\text{km/h} = \\dfrac{1000}{3600}\\,\\text{m/s}$ 입니다. 넓이는 길이 비의 <strong>제곱</strong>만큼 바뀝니다.</p>',
            gen: function () {
              var kind = M.pick(['area', 'speed', 'volume']);
              if (kind === 'area') {
                var m = M.i(2, 30);
                return {
                  q: '넓이가 ' + m + ' m² 인 바닥을 cm² 단위로 나타내시오.',
                  type: 'num',
                  ans: m * 10000,
                  unit: 'cm²',
                  sol: '<p>$1\\,\\text{m}^2 = 10000\\,\\text{cm}^2$ 이므로 $' + m + ' \\times 10000 = ' + (m * 10000) + '$ (cm²)</p>'
                };
              }
              if (kind === 'speed') {
                var kmh = M.pick([18, 36, 54, 72, 90, 108]);
                return {
                  q: '시속 ' + kmh + ' km 로 움직이는 컨베이어의 속력을 초속 몇 m 인지 구하시오.',
                  type: 'num',
                  ans: kmh / 3.6,
                  ansText: M.num(kmh / 3.6, 4),
                  unit: 'm/s',
                  tol: 5e-4,
                  sol: '<p>$' + kmh + '\\,\\text{km/h} = ' + kmh + ' \\times \\dfrac{1000}{3600} = ' + M.num(kmh / 3.6, 4) + '\\,\\text{m/s}$</p>'
                };
              }
              var L = M.i(2, 40);
              return {
                q: '물 ' + L + ' L 는 몇 cm³ 인지 구하시오.',
                type: 'num',
                ans: L * 1000,
                unit: 'cm³',
                sol: '<p>$1\\,\\text{L} = 1000\\,\\text{cm}^3$ 이므로 $' + L + ' \\times 1000 = ' + (L * 1000) + '$ (cm³)</p>'
              };
            }
          }
        ]
      },
      {
        name: '도형과 측정',
        topics: [
          {
            id: 'material',
            name: '재료의 양 계산',
            desc: '넓이·부피로 필요한 양 구하기',
            concept: '<p>직육면체의 부피는 $(\\text{가로}) \\times (\\text{세로}) \\times (\\text{높이})$, 겉넓이는 여섯 면의 넓이의 합입니다. 필요한 재료의 양은 $(\\text{전체 넓이}) \\div (\\text{단위 넓이당 사용량})$ 으로 구합니다.</p>',
            gen: function () {
              if (Math.random() < 0.5) {
                var w = M.i(2, 12), d = M.i(2, 12), h = M.i(1, 6);
                return {
                  q: '가로 ' + w + ' m, 세로 ' + d + ' m, 높이 ' + h + ' m 인 직육면체 모양 창고의 부피를 구하시오.',
                  type: 'num',
                  ans: w * d * h,
                  unit: 'm³',
                  sol: '<p>$' + w + ' \\times ' + d + ' \\times ' + h + ' = ' + (w * d * h) + '$ (m³)</p>'
                };
              }
              var area = M.i(20, 120);
              var per = M.pick([4, 5, 8, 10]);
              return {
                q: '페인트 1통으로 ' + per + ' m² 를 칠할 수 있다. 넓이가 ' + area + ' m² 인 벽을 모두 칠하려면 최소 몇 통이 필요한지 구하시오.',
                type: 'num',
                ans: Math.ceil(area / per),
                unit: '통',
                sol: '<p>$\\dfrac{' + area + '}{' + per + '} = ' + M.num(area / per, 3) + '$ 이므로, 남는 부분까지 칠하려면 ' +
                  Math.ceil(area / per) + '통이 필요합니다. (소수는 올림)</p>'
              };
            }
          }
        ]
      },
      {
        name: '변화와 관계 · 자료와 가능성',
        topics: [
          {
            id: 'wage',
            name: '임금과 근무 시간',
            desc: '시급·수당 계산하기',
            concept: '<p>기본 임금은 $(\\text{시급}) \\times (\\text{근무 시간})$ 입니다. 연장근로 수당은 보통 통상임금의 1.5배로 계산합니다.</p>',
            gen: function () {
              var wage = M.pick([9860, 10030, 11000, 12000, 13000]);
              var hours = M.i(20, 40);
              var over = M.i(0, 8);
              var ans = wage * hours + wage * 1.5 * over;
              return {
                q: '시급이 ' + won(wage) + '원인 근로자가 기본 근무 ' + hours + '시간, 연장 근무 ' + over + '시간을 하였다. ' +
                  '연장 근무 수당을 시급의 1.5배로 계산할 때 받을 임금의 총액을 구하시오.',
                type: 'num',
                ans: ans,
                unit: '원',
                tol: 0.5,
                sol: '<p>기본: ' + won(wage) + ' $\\times$ ' + hours + ' $=$ ' + won(wage * hours) + '원</p>' +
                  '<p>연장: ' + won(wage) + ' $\\times$ 1.5 $\\times$ ' + over + ' $=$ ' + won(wage * 1.5 * over) + '원</p>' +
                  '<p>총액: ' + won(ans) + '원</p>'
              };
            }
          },
          {
            id: 'table-read',
            name: '표와 그래프 읽기',
            desc: '자료에서 값 구하기',
            concept: '<p>표에서 <strong>합계와 비율</strong>을 먼저 확인합니다. 상대도수 $= \\dfrac{(\\text{그 계급의 도수})}{(\\text{전체 도수})}$ 이고, 백분율은 여기에 100을 곱합니다.</p>',
            gen: function () {
              var days = ['월', '화', '수', '목', '금'];
              var v = [], i, sum = 0;
              for (i = 0; i < 5; i++) { var x = M.i(20, 90); v.push(x); sum += x; }
              var idx = M.i(0, 4);
              var kind = M.pick(['sum', 'mean', 'ratio']);
              var table = '<table class="q-table"><tr><th>요일</th><th>' + days.join('</th><th>') + '</th></tr>' +
                '<tr><th>생산량(개)</th><td>' + v.join('</td><td>') + '</td></tr></table>';
              if (kind === 'sum') {
                return {
                  q: '어느 공장의 요일별 생산량이 다음과 같다.' + table + '이번 주 전체 생산량을 구하시오.',
                  type: 'num', ans: sum, unit: '개',
                  sol: '<p>$' + v.join(' + ') + ' = ' + sum + '$ (개)</p>'
                };
              }
              if (kind === 'mean') {
                return {
                  q: '어느 공장의 요일별 생산량이 다음과 같다.' + table + '하루 평균 생산량을 구하시오. (소수 둘째 자리까지)',
                  type: 'num', ans: Number((sum / 5).toFixed(2)), unit: '개', tol: 0.02,
                  sol: '<p>$\\dfrac{' + sum + '}{5} = ' + Number((sum / 5).toFixed(2)) + '$ (개)</p>'
                };
              }
              return {
                q: '어느 공장의 요일별 생산량이 다음과 같다.' + table + days[idx] + '요일의 생산량은 전체의 몇 %인지 구하시오. (소수 둘째 자리까지)',
                type: 'num', ans: Number((v[idx] / sum * 100).toFixed(2)), unit: '%', tol: 0.02,
                sol: '<p>전체 생산량은 $' + sum + '$ 개이므로 $\\dfrac{' + v[idx] + '}{' + sum + '} \\times 100 = ' +
                  Number((v[idx] / sum * 100).toFixed(2)) + '$ (%)</p>'
              };
            }
          }
        ]
      }
    ]
  };
})();
