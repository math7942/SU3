/* 수학과제 탐구 — 주제별 문제 생성기 */
(function () {
  var M = window.SU3M;

  window.SU3_SUBJECT = {
    id: 'inquiry',
    name: '수학과제 탐구',
    areas: [
      {
        name: '과제 탐구의 이해',
        topics: [
          {
            id: 'topic-select',
            name: '탐구 주제 정하기',
            desc: '좋은 주제의 조건 판단하기',
            concept: '<p>좋은 탐구 주제는 <strong>구체적이고, 자료를 실제로 모을 수 있으며, 수학적으로 다룰 수 있고, 주어진 기간 안에 끝낼 수 있어야</strong> 합니다. 너무 넓거나 이미 답이 정해진 주제는 탐구가 되기 어렵습니다.</p>',
            gen: function () {
              var good = M.pick([
                '우리 학교 매점의 요일별 판매량을 조사해 재고량을 예측하는 모델 만들기',
                '우리 반 학생들의 등교 시간과 수면 시간 사이의 상관관계 분석하기',
                '학교 급식 잔반량 자료를 이용해 요일별 변화 추세 살펴보기',
                '버스 도착 간격 자료를 모아 대기 시간의 분포 알아보기'
              ]);
              var bad = M.sample([
                '수학은 왜 어려운가?',
                '세상의 모든 도형의 성질 정리하기',
                '피타고라스 정리가 참인지 증명되었는지 알아보기',
                '수학의 역사 전체를 조사하기'
              ], 3);
              var choices = M.shuffle([good].concat(bad));
              return {
                q: '다음 중 <strong>과제 탐구의 주제로 가장 알맞은 것</strong>을 고르시오.',
                type: 'choice',
                choices: choices,
                ans: choices.indexOf(good),
                sol: '<p>정답인 주제는 <strong>조사할 자료가 분명하고, 수학적으로 분석할 수 있으며, 기간 안에 끝낼 수 있습니다.</strong></p>' +
                  '<p>나머지는 범위가 너무 넓거나, 이미 알려진 사실을 확인하는 데 그쳐 탐구 주제로 알맞지 않습니다.</p>'
              };
            }
          },
          {
            id: 'method',
            name: '자료 수집 방법',
            desc: '목적에 맞는 방법 고르기',
            concept: '<p>직접 만들어 모으는 자료가 <strong>1차 자료</strong>(설문, 실험, 관찰), 이미 만들어진 자료가 <strong>2차 자료</strong>(통계청·공공데이터·논문)입니다. 목적에 따라 알맞은 방법을 고르고, 출처를 반드시 밝혀야 합니다.</p>',
            gen: function () {
              var bank = [
                { s: '우리 반 학생들의 하루 스마트폰 사용 시간을 알아보려 한다.', a: '설문 조사 (1차 자료)' },
                { s: '최근 10년간 우리나라 출생아 수의 변화를 알아보려 한다.', a: '공공 통계 자료 활용 (2차 자료)' },
                { s: '주사위를 여러 번 던져 눈이 나오는 비율을 확인하려 한다.', a: '실험 (1차 자료)' },
                { s: '학교 앞 횡단보도를 건너는 사람 수를 시간대별로 알아보려 한다.', a: '관찰 (1차 자료)' }
              ];
              var b = M.pick(bank);
              var choices = M.shuffle([
                '설문 조사 (1차 자료)',
                '공공 통계 자료 활용 (2차 자료)',
                '실험 (1차 자료)',
                '관찰 (1차 자료)'
              ]);
              return {
                q: '다음 탐구에 가장 알맞은 자료 수집 방법을 고르시오.<p>' + b.s + '</p>',
                type: 'choice',
                choices: choices,
                ans: choices.indexOf(b.a),
                sol: '<p>' + b.s + '</p><p>이 경우에는 <strong>' + b.a + '</strong> 이 가장 알맞습니다.</p>'
              };
            }
          }
        ]
      },
      {
        name: '과제 탐구의 실행',
        topics: [
          {
            id: 'modeling',
            name: '수학적 모델링',
            desc: '식을 세워 예측하기',
            concept: '<p>자료의 변화가 <strong>일정한 양</strong>씩이면 일차식 $y = ax + b$, <strong>일정한 배율</strong>이면 지수식 $y = a \\cdot r^x$ 로 모델을 세웁니다. 모델은 근사이므로 예측값과 실제값의 차이를 함께 살펴야 합니다.</p>',
            gen: function () {
              if (Math.random() < 0.5) {
                var a = M.i(2, 15), b = M.i(5, 60), x = M.i(3, 20);
                return {
                  q: '어떤 식물의 키가 처음 ' + b + ' cm 였고 매주 ' + a + ' cm 씩 일정하게 자란다. ' +
                    '이 관계를 $y = ' + M.poly([[a, 'x'], [b, '']]) + '$ ($x$: 주, $y$: 키) 로 모델링할 때, ' + x + '주 뒤의 키를 예측하시오.',
                  type: 'num',
                  ans: a * x + b,
                  unit: 'cm',
                  sol: '<p>$y = ' + a + ' \\times ' + x + ' + ' + b + ' = ' + (a * x + b) + '$ (cm)</p>' +
                    '<p>실제로는 성장이 계속 일정하지는 않으므로, 예측 범위를 벗어나면 모델을 다시 검토해야 합니다.</p>'
                };
              }
              var a2 = M.pick([100, 200, 500, 1000]);
              var r = M.pick([2, 3]);
              var n = M.i(2, 6);
              return {
                q: '어떤 박테리아의 수가 ' + a2 + '마리에서 시작하여 1시간마다 ' + r + '배씩 늘어난다. ' + n + '시간 뒤의 박테리아 수를 구하시오.',
                type: 'num',
                ans: a2 * Math.pow(r, n),
                unit: '마리',
                sol: '<p>$y = ' + a2 + ' \\times ' + r + '^x$ 이므로 $x = ' + n + '$ 일 때</p>' +
                  '<p>$' + a2 + ' \\times ' + r + '^{' + n + '} = ' + a2 + ' \\times ' + Math.pow(r, n) + ' = ' + (a2 * Math.pow(r, n)) + '$ (마리)</p>'
              };
            }
          },
          {
            id: 'error',
            name: '예측값과 오차',
            desc: '상대오차 계산하기',
            concept: '<p>절대오차 $= |\\text{예측값} - \\text{실제값}|$, 상대오차 $= \\dfrac{\\text{절대오차}}{|\\text{실제값}|}$ 입니다. 상대오차를 백분율로 나타내면 모델이 얼마나 정확한지 비교하기 쉽습니다.</p>',
            gen: function () {
              var real = M.i(20, 300);
              var diff = M.i(1, Math.max(2, Math.round(real * 0.3)));
              var pred = real + M.pick([1, -1]) * diff;
              var rel = diff / real * 100;
              return {
                q: '모델이 예측한 값은 ' + pred + ' 이고 실제로 측정한 값은 ' + real + ' 이었다. ' +
                  '상대오차를 백분율로 구하시오. (소수 둘째 자리까지)',
                type: 'num',
                ans: Number(rel.toFixed(2)),
                unit: '%',
                tol: 0.02,
                sol: '<p>절대오차 $= |' + pred + ' - ' + real + '| = ' + diff + '$</p>' +
                  '<p>상대오차 $= \\dfrac{' + diff + '}{' + real + '} \\times 100 = ' + Number(rel.toFixed(2)) + '$ (%)</p>'
              };
            }
          }
        ]
      },
      {
        name: '탐구 결과의 정리',
        topics: [
          {
            id: 'report',
            name: '보고서 작성과 인용',
            desc: '결과를 정직하게 정리하기',
            concept: '<p>보고서에는 <strong>탐구 동기와 문제, 자료 수집 방법, 분석 과정, 결과와 해석, 한계점, 참고 자료</strong>가 들어갑니다. 남의 자료를 쓸 때는 출처를 밝히고, 결과가 예상과 달라도 그대로 적어야 합니다.</p>',
            gen: function () {
              var bank = [
                {
                  q: '탐구 결과가 처음 세운 가설과 다르게 나왔다. 가장 알맞은 태도를 고르시오.',
                  a: '결과를 그대로 쓰고, 가설과 다른 이유를 분석해 한계점으로 밝힌다.',
                  w: ['가설에 맞도록 자료 몇 개를 빼고 다시 계산한다.', '결과를 쓰지 않고 가설만 결론으로 적는다.', '자료를 더 모으지 않고 결론을 반대로 바꾼다.']
                },
                {
                  q: '다른 사람의 통계 자료를 보고서에 사용할 때 가장 알맞은 방법을 고르시오.',
                  a: '자료의 출처(기관, 발행 연도, 주소)를 밝히고 인용한다.',
                  w: ['내가 직접 조사한 것처럼 쓴다.', '숫자만 조금 바꾸어 쓴다.', '출처는 굳이 밝히지 않아도 된다.']
                },
                {
                  q: '설문 조사 결과를 정리할 때 가장 알맞은 것을 고르시오.',
                  a: '응답자 수와 조사 대상, 조사 시기를 함께 밝힌다.',
                  w: ['비율만 쓰고 응답자 수는 밝히지 않는다.', '원하는 결론에 맞는 문항만 골라 싣는다.', '무응답은 임의로 채워 넣는다.']
                }
              ];
              var b = M.pick(bank);
              var choices = M.shuffle([b.a].concat(b.w));
              return {
                q: b.q,
                type: 'choice',
                choices: choices,
                ans: choices.indexOf(b.a),
                sol: '<p>탐구 보고서의 가치는 <strong>과정을 정직하게 드러내는 데</strong> 있습니다. 자료를 고르거나 바꾸어 결론에 맞추면 탐구가 아니라 꾸며 낸 이야기가 됩니다.</p>' +
                  '<p>따라서 "' + b.a + '" 가 알맞습니다.</p>'
              };
            }
          }
        ]
      }
    ]
  };
})();
