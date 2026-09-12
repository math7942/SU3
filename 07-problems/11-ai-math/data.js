/* 인공지능 수학 — 주제별 문제 생성기 */
(function () {
  var M = window.SU3M;

  window.SU3_SUBJECT = {
    id: 'ai-math',
    name: '인공지능 수학',
    areas: [
      {
        name: '텍스트와 이미지 자료의 표현',
        topics: [
          {
            id: 'jaccard',
            name: '문서의 유사도',
            desc: '자카드 유사도 구하기',
            concept: '<p>두 집합 $A, B$ 의 자카드 유사도는 $J(A,B) = \\dfrac{n(A \\cap B)}{n(A \\cup B)}$ 입니다. 문서를 단어의 집합으로 보고, <strong>공통 단어의 비율</strong>로 닮은 정도를 잽니다.</p>',
            gen: function () {
              var both = M.i(1, 5), onlyA = M.i(1, 6), onlyB = M.i(1, 6);
              var union = both + onlyA + onlyB;
              return {
                q: '문서 $A$ 에 쓰인 단어의 집합과 문서 $B$ 에 쓰인 단어의 집합에 대하여, ' +
                  '두 문서에 공통으로 나온 단어가 ' + both + '개, $A$ 에만 나온 단어가 ' + onlyA + '개, $B$ 에만 나온 단어가 ' + onlyB + '개이다. ' +
                  '두 문서의 자카드 유사도를 구하시오.',
                type: 'num',
                ans: both / union,
                ansText: '$' + M.fracTex(both, union) + '$',
                hint: '분수는 2/7 처럼 입력하세요.',
                sol: '<p>$n(A \\cap B) = ' + both + '$, $n(A \\cup B) = ' + both + ' + ' + onlyA + ' + ' + onlyB + ' = ' + union + '$</p>' +
                  '<p>$J(A,B) = \\dfrac{' + both + '}{' + union + '} = ' + M.fracTex(both, union) + '$</p>'
              };
            }
          },
          {
            id: 'image-matrix',
            name: '이미지와 행렬',
            desc: '픽셀값 계산하기',
            concept: '<p>흑백 이미지는 픽셀의 밝기(0~255)를 성분으로 하는 행렬로 나타냅니다. 밝기를 $k$ 만큼 올리면 각 성분에 $k$ 를 더하고, 255를 넘으면 255로 맞춥니다. 컬러를 흑백으로 바꿀 때는 $R, G, B$ 의 평균을 쓰기도 합니다.</p>',
            gen: function () {
              if (Math.random() < 0.5) {
                var v = M.i(150, 250), k = M.i(20, 80);
                var ans = Math.min(255, v + k);
                return {
                  q: '어떤 픽셀의 밝기가 ' + v + '이다. 이미지 전체의 밝기를 ' + k + '만큼 올릴 때 이 픽셀의 밝기를 구하시오. ' +
                    '(밝기는 0 이상 255 이하이며, 255를 넘으면 255로 한다.)',
                  type: 'num',
                  ans: ans,
                  sol: '<p>$' + v + ' + ' + k + ' = ' + (v + k) + '$ 이고, ' +
                    (v + k > 255 ? '255를 넘으므로 밝기는 255가 됩니다.' : '255 이하이므로 밝기는 ' + (v + k) + ' 입니다.') + '</p>'
                };
              }
              var r = M.i(0, 255), g = M.i(0, 255), b = M.i(0, 255);
              var mean = (r + g + b) / 3;
              return {
                q: '색이 $(R, G, B) = (' + r + ',\\ ' + g + ',\\ ' + b + ')$ 인 픽셀을 세 값의 평균으로 흑백으로 바꿀 때의 밝기를 구하시오. ' +
                  '(소수 둘째 자리까지)',
                type: 'num',
                ans: Number(mean.toFixed(2)),
                tol: 0.02,
                sol: '<p>$\\dfrac{' + r + ' + ' + g + ' + ' + b + '}{3} = \\dfrac{' + (r + g + b) + '}{3} \\approx ' + Number(mean.toFixed(2)) + '$</p>'
              };
            }
          }
        ]
      },
      {
        name: '분류와 예측',
        topics: [
          {
            id: 'perceptron',
            name: '퍼셉트론의 출력',
            desc: '가중치와 임곗값으로 판단하기',
            concept: '<p>입력 $x_1, x_2, \\dots$ 에 가중치 $w_1, w_2, \\dots$ 를 곱해 더한 값 $x = \\sum x_i w_i$ 가 임곗값 $c$ 이상이면 1, 아니면 0 을 출력합니다.</p>',
            gen: function () {
              var x = [M.i(0, 1), M.i(0, 1), M.i(0, 1)];
              var w = [M.i(-3, 4), M.i(-3, 4), M.i(-3, 4)];
              var c = M.i(-2, 4);
              var s = x[0] * w[0] + x[1] * w[1] + x[2] * w[2];
              var askSum = Math.random() < 0.5;
              return {
                q: '퍼셉트론의 입력이 $(x_1, x_2, x_3) = (' + x.join(',\\ ') + ')$, 가중치가 $(w_1, w_2, w_3) = (' + w.join(',\\ ') + ')$, ' +
                  '임곗값이 $c = ' + c + '$ 이다. ' + (askSum ? '가중합 $x_1w_1 + x_2w_2 + x_3w_3$ 의 값을 구하시오.' : '출력값 $y$ 를 구하시오. (0 또는 1)'),
                type: 'num',
                ans: askSum ? s : (s >= c ? 1 : 0),
                sol: '<p>가중합 $= ' + x[0] + ' \\times (' + w[0] + ') + ' + x[1] + ' \\times (' + w[1] + ') + ' + x[2] + ' \\times (' + w[2] + ') = ' + s + '$</p>' +
                  '<p>$' + s + (s >= c ? ' \\ge ' : ' < ') + c + '$ 이므로 출력은 $' + (s >= c ? 1 : 0) + '$ 입니다.</p>'
              };
            }
          },
          {
            id: 'confusion',
            name: '분류의 정확도',
            desc: '혼동행렬 읽기',
            concept: '<p>정확도 $= \\dfrac{\\text{맞게 분류한 개수}}{\\text{전체 개수}}$, 정밀도 $= \\dfrac{TP}{TP + FP}$, 재현율 $= \\dfrac{TP}{TP + FN}$ 입니다.</p>',
            gen: function () {
              var tp = M.i(10, 60), fp = M.i(2, 20), fn = M.i(2, 20), tn = M.i(10, 60);
              var total = tp + fp + fn + tn;
              var kind = M.pick(['acc', 'prec', 'rec']);
              var table = '<table class="q-table"><tr><th></th><th>예측: 참</th><th>예측: 거짓</th></tr>' +
                '<tr><th>실제: 참</th><td>' + tp + '</td><td>' + fn + '</td></tr>' +
                '<tr><th>실제: 거짓</th><td>' + fp + '</td><td>' + tn + '</td></tr></table>';
              var num = kind === 'acc' ? tp + tn : tp;
              var den = kind === 'acc' ? total : (kind === 'prec' ? tp + fp : tp + fn);
              var label = kind === 'acc' ? '정확도' : (kind === 'prec' ? '정밀도' : '재현율');
              return {
                q: '어떤 분류 모델의 결과가 다음과 같다.' + table + '이 모델의 <strong>' + label + '</strong>' +
                  (label === '재현율' ? '을' : '를') + ' 구하시오. (소수 넷째 자리까지)',
                type: 'num',
                ans: num / den,
                ansText: '$' + M.fracTex(num, den) + '$ $\\approx$ ' + M.num(num / den, 4),
                hint: '분수 또는 소수로 입력하세요.',
                tol: 5e-4,
                sol: '<p>' + label + ' $= \\dfrac{' + num + '}{' + den + '} = ' + M.fracTex(num, den) + ' \\approx ' + M.num(num / den, 4) + '$</p>'
              };
            }
          }
        ]
      },
      {
        name: '최적화',
        topics: [
          {
            id: 'mse',
            name: '손실함수(MSE)',
            desc: '예측값과 실제값의 차이',
            concept: '<p>평균제곱오차 $MSE = \\dfrac{1}{n}\\sum (y_i - \\hat{y_i})^2$ 입니다. 오차를 제곱해 더하므로 큰 오차에 더 민감합니다.</p>',
            gen: function () {
              var n = 4, y = [], p = [], i, sum = 0;
              for (i = 0; i < n; i++) {
                var yi = M.i(1, 20);
                var e = M.i(-3, 3);
                y.push(yi); p.push(yi + e); sum += e * e;
              }
              return {
                q: '실제값이 $(' + y.join(',\\ ') + ')$ 이고 예측값이 $(' + p.join(',\\ ') + ')$ 일 때 평균제곱오차(MSE)를 구하시오.',
                type: 'num',
                ans: sum / n,
                ansText: '$' + M.fracTex(sum, n) + '$',
                hint: '분수 또는 소수로 입력하세요.',
                tol: 5e-4,
                sol: '<p>각 오차의 제곱의 합은 $' + sum + '$ 이고 자료는 ' + n + '개이므로</p>' +
                  '<p>$MSE = \\dfrac{' + sum + '}{' + n + '} = ' + M.fracTex(sum, n) + '$</p>'
              };
            }
          },
          {
            id: 'gradient',
            name: '경사하강법',
            desc: '한 단계 이동한 위치 구하기',
            concept: '<p>함수 $f(x)$ 를 최소로 만들기 위해 $x_{\\text{new}} = x - \\alpha f\'(x)$ 로 조금씩 움직입니다. $\\alpha$ 는 학습률이고, 기울기의 <strong>반대 방향</strong>으로 이동합니다.</p>',
            gen: function () {
              var a = M.pick([1, 2]);
              var p = M.i(-5, 5);
              var x0 = M.i(-8, 8);
              while (x0 === p) { x0 = M.i(-8, 8); }
              var alpha = M.pick([0.1, 0.2, 0.5]);
              /* f(x) = a(x-p)^2, f'(x) = 2a(x-p) */
              var grad = 2 * a * (x0 - p);
              var next = x0 - alpha * grad;
              return {
                q: '$f(x) = ' + (a === 1 ? '' : a) + '(x ' + (p >= 0 ? '- ' + p : '+ ' + (-p)) + ')^2$ 에 대하여 경사하강법을 적용한다. ' +
                  '현재 위치가 $x = ' + x0 + '$ 이고 학습률이 $\\alpha = ' + alpha + '$ 일 때, 한 단계 이동한 뒤의 $x$ 값을 구하시오.',
                type: 'num',
                ans: Number(next.toFixed(6)),
                tol: 5e-4,
                hint: '소수로 입력하세요.',
                sol: '<p>$f\'(x) = ' + (2 * a) + '(x ' + (p >= 0 ? '- ' + p : '+ ' + (-p)) + ')$ 이므로 $f\'(' + x0 + ') = ' + grad + '$ 입니다.</p>' +
                  '<p>$x_{\\text{new}} = ' + x0 + ' - ' + alpha + ' \\times (' + grad + ') = ' + Number(next.toFixed(6)) + '$</p>'
              };
            }
          }
        ]
      }
    ]
  };
})();
