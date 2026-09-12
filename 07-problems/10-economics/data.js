/* 경제 수학 — 주제별 문제 생성기 */
(function () {
  var M = window.SU3M;

  function won(n) { return Math.round(n).toLocaleString('ko-KR'); }

  window.SU3_SUBJECT = {
    id: 'economics',
    name: '경제 수학',
    areas: [
      {
        name: '수와 생활경제',
        topics: [
          {
            id: 'tax-discount',
            name: '할인율과 부가가치세',
            desc: '생활 속 비율 계산',
            concept: '<p>$p\\%$ 할인가는 $\\text{정가} \\times \\left(1 - \\dfrac{p}{100}\\right)$ 입니다. 부가가치세 10%가 붙은 가격은 $\\text{공급가} \\times 1.1$ 이므로, 반대로 공급가는 $\\dfrac{\\text{판매가}}{1.1}$ 입니다.</p>',
            gen: function () {
              if (Math.random() < 0.5) {
                var price = M.i(10, 90) * 1000;
                var p1 = M.pick([10, 20, 25, 30]);
                var p2 = M.pick([10, 20]);
                var ans = price * (1 - p1 / 100) * (1 - p2 / 100);
                return {
                  q: '정가 ' + won(price) + '원인 상품을 ' + p1 + '% 할인한 뒤, 그 가격에서 다시 ' + p2 + '% 할인하여 팔았다. 최종 판매 가격을 구하시오.',
                  type: 'num',
                  ans: ans,
                  unit: '원',
                  tol: 0.5,
                  sol: '<p>' + won(price) + ' $\\times$ ' + (1 - p1 / 100) + ' $=$ ' + won(price * (1 - p1 / 100)) + '원</p>' +
                    '<p>' + won(price * (1 - p1 / 100)) + ' $\\times$ ' + (1 - p2 / 100) + ' $=$ ' + won(ans) + '원</p>' +
                    '<p>연속 할인은 두 할인율을 더한 것과 같지 않다는 점에 주의하세요.</p>'
                };
              }
              var supply = M.i(5, 50) * 10000;
              return {
                q: '부가가치세 10%가 포함된 판매 가격이 ' + won(supply * 1.1) + '원이다. 부가가치세를 뺀 공급가액을 구하시오.',
                type: 'num',
                ans: supply,
                unit: '원',
                tol: 0.5,
                sol: '<p>공급가액을 $x$ 라 하면 $1.1x = ' + won(supply * 1.1) + '$ 이므로</p>' +
                  '<p>$x = \\dfrac{' + Math.round(supply * 1.1) + '}{1.1} = ' + won(supply) + '$ (원)</p>'
              };
            }
          },
          {
            id: 'interest',
            name: '단리와 복리',
            desc: '원리합계 계산하기',
            concept: '<p>단리의 원리합계는 $a(1 + rn)$, 복리의 원리합계는 $a(1+r)^n$ 입니다. 기간이 길수록 복리의 이자가 훨씬 커집니다.</p>',
            gen: function () {
              var a = M.i(10, 100) * 10000;
              var r = M.pick([0.02, 0.03, 0.04, 0.05, 0.1]);
              var n = M.i(2, 5);
              var compound = Math.random() < 0.5;
              var ans = compound ? a * Math.pow(1 + r, n) : a * (1 + r * n);
              return {
                q: won(a) + '원을 연이율 ' + (r * 100) + '%의 ' + (compound ? '<strong>복리</strong>' : '<strong>단리</strong>') +
                  '로 ' + n + '년 동안 예금할 때의 원리합계를 구하시오. (원 단위 반올림)',
                type: 'num',
                ans: Math.round(ans),
                unit: '원',
                tol: 1.5,
                sol: compound
                  ? '<p>$' + a + ' \\times (1 + ' + r + ')^{' + n + '} = ' + a + ' \\times ' + Number(Math.pow(1 + r, n).toFixed(6)) + ' \\approx ' + won(ans) + '$ (원)</p>'
                  : '<p>$' + a + ' \\times (1 + ' + r + ' \\times ' + n + ') = ' + a + ' \\times ' + Number((1 + r * n).toFixed(6)) + ' = ' + won(ans) + '$ (원)</p>'
              };
            }
          },
          {
            id: 'annuity',
            name: '적금과 연금',
            desc: '등비수열의 합 활용',
            concept: '<p>매년 초 $a$ 원씩 연이율 $r$ 의 복리로 $n$ 년간 적립하면, $n$ 년 말의 원리합계는 $\\dfrac{a(1+r)\\{(1+r)^n - 1\\}}{r}$ 입니다. 각 납입액이 남은 기간만큼 이자가 붙는 등비수열의 합입니다.</p>',
            gen: function () {
              var a = M.i(10, 60) * 10000;
              var r = M.pick([0.02, 0.05, 0.1]);
              var n = M.i(3, 6);
              var ans = a * (1 + r) * (Math.pow(1 + r, n) - 1) / r;
              return {
                q: '매년 초에 ' + won(a) + '원씩 연이율 ' + (r * 100) + '%의 복리로 ' + n + '년 동안 적립할 때, ' +
                  n + '년 말의 적립금의 원리합계를 구하시오. (원 단위 반올림)',
                type: 'num',
                ans: Math.round(ans),
                unit: '원',
                tol: 1.5,
                sol: '<p>첫째항이 $' + a + '(1+' + r + ')$, 공비가 $1+' + r + '$ 인 등비수열의 합이므로</p>' +
                  '<p>$\\dfrac{' + a + ' \\times ' + (1 + r) + ' \\times \\{' + (1 + r) + '^{' + n + '} - 1\\}}{' + r + '} \\approx ' + won(ans) + '$ (원)</p>'
              };
            }
          }
        ]
      },
      {
        name: '함수와 경제',
        topics: [
          {
            id: 'equilibrium',
            name: '수요·공급과 균형가격',
            desc: '두 그래프의 교점 찾기',
            concept: '<p>수요함수와 공급함수가 만나는 점이 시장의 균형입니다. 두 식을 연립하여 <strong>균형거래량</strong>을 구하고, 그 값을 대입해 <strong>균형가격</strong>을 얻습니다.</p>',
            gen: function () {
              var b = M.i(1, 5), d = M.i(1, 5);
              var Q = M.i(2, 12);
              var c = M.i(1, 10);
              var a = c + (b + d) * Q;  /* a - bQ = c + dQ */
              var price = c + d * Q;
              var askPrice = Math.random() < 0.5;
              return {
                q: '어떤 상품의 수요함수가 $P = ' + M.poly([[a, ''], [-b, 'Q']]) + '$, 공급함수가 $P = ' + M.poly([[c, ''], [d, 'Q']]) + '$ 이다. ' +
                  '($P$: 가격, $Q$: 수량) ' + (askPrice ? '균형가격' : '균형거래량') + '을 구하시오.',
                type: 'num',
                ans: askPrice ? price : Q,
                sol: '<p>$' + M.poly([[a, ''], [-b, 'Q']]) + ' = ' + M.poly([[c, ''], [d, 'Q']]) + '$ 에서 $' + (b + d) + 'Q = ' + (a - c) + '$, 즉 $Q = ' + Q + '$ 입니다.</p>' +
                  '<p>이를 대입하면 $P = ' + c + ' + ' + d + ' \\times ' + Q + ' = ' + price + '$ 입니다.</p>'
              };
            }
          },
          {
            id: 'profit-max',
            name: '이윤이 최대가 되는 생산량',
            desc: '이차함수의 최댓값',
            concept: '<p>이윤 $= $ 수입 $-$ 비용 입니다. 이윤이 이차함수 $-ax^2+bx+c$ 꼴이면 꼭짓점 $x = \\dfrac{b}{2a}$ 에서 최대가 됩니다.</p>',
            gen: function () {
              var a = M.pick([1, 2]);
              var x0 = M.i(3, 15);
              var b = 2 * a * x0;
              var c = M.i(0, 40);
              var maxProfit = -a * x0 * x0 + b * x0 + c;
              var askX = Math.random() < 0.5;
              return {
                q: '어떤 상품을 $x$ 개 생산하여 팔 때의 이윤이 $P(x) = ' + M.poly([[-a, 'x^2'], [b, 'x'], [c, '']]) + '$ (만 원) 이다. ' +
                  (askX ? '이윤이 최대가 되는 생산량' : '이윤의 최댓값') + '을 구하시오.',
                type: 'num',
                ans: askX ? x0 : maxProfit,
                unit: askX ? '개' : '만 원',
                sol: '<p>$P(x) = ' + (-a) + '(x - ' + x0 + ')^2 + ' + maxProfit + '$ 이므로</p>' +
                  '<p>$x = ' + x0 + '$ 개를 생산할 때 최대 이윤 ' + maxProfit + '만 원을 얻습니다.</p>'
              };
            }
          },
          {
            id: 'marginal',
            name: '한계비용과 한계수입',
            desc: '미분으로 변화율 구하기',
            concept: '<p>비용함수 $C(x)$ 에 대하여 한계비용은 $C\'(x)$, 수입함수 $R(x)$ 에 대하여 한계수입은 $R\'(x)$ 입니다. 생산량을 1단위 늘릴 때의 추가 비용·수입을 뜻합니다.</p>',
            gen: function () {
              var a = M.i(1, 3), b = M.i(2, 12), c = M.i(5, 40), k = M.i(2, 10);
              var ans = 3 * a * k * k - 2 * b * k + c;
              return {
                q: '어떤 상품을 $x$ 개 생산할 때의 총비용이 $C(x) = ' + M.poly([[a, 'x^3'], [-b, 'x^2'], [c, 'x']]) + '$ (만 원) 이다. ' +
                  '생산량이 ' + k + '개일 때의 한계비용을 구하시오.',
                type: 'num',
                ans: ans,
                unit: '만 원',
                sol: '<p>$C\'(x) = ' + M.poly([[3 * a, 'x^2'], [-2 * b, 'x'], [c, '']]) + '$</p>' +
                  '<p>$C\'(' + k + ') = ' + (3 * a) + ' \\times ' + (k * k) + ' - ' + (2 * b) + ' \\times ' + k + ' + ' + c + ' = ' + ans + '$ (만 원)</p>'
              };
            }
          }
        ]
      }
    ]
  };
})();
