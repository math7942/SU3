/* 확률과 통계 — 주제별 문제 생성기 */
(function () {
  var M = window.SU3M;

  window.SU3_SUBJECT = {
    id: 'statistics',
    name: '확률과 통계',
    areas: [
      {
        name: '경우의 수',
        topics: [
          {
            id: 'advanced-count',
            name: '중복순열과 중복조합',
            desc: '중복을 허락해 뽑고 나열하기',
            concept: '<p>중복순열 $_n\\Pi_r = n^r$, 중복조합 $_n H_r = {}_{n+r-1}C_r$, 같은 것이 $p$ 개, $q$ 개 있는 $n$ 개의 순열은 $\\dfrac{n!}{p!\\,q!}$ 입니다.</p>',
            gen: function () {
              var kind = M.pick(['pi', 'h', 'same']);
              if (kind === 'pi') {
                var n = M.i(2, 5), r = M.i(2, 4);
                return {
                  q: '서로 다른 ' + n + '개의 숫자 중에서 중복을 허락하여 ' + r + '개를 뽑아 일렬로 나열하는 방법의 수를 구하시오.',
                  type: 'num',
                  ans: Math.pow(n, r),
                  sol: '<p>중복순열이므로 $_{' + n + '}\\Pi_{' + r + '} = ' + n + '^{' + r + '} = ' + Math.pow(n, r) + '$ 입니다.</p>'
                };
              }
              if (kind === 'h') {
                var n2 = M.i(3, 5), r2 = M.i(2, 4);
                var ans = M.nCr(n2 + r2 - 1, r2);
                return {
                  q: '서로 다른 종류의 사탕 ' + n2 + '가지 중에서 중복을 허락하여 ' + r2 + '개를 고르는 방법의 수를 구하시오.',
                  type: 'num',
                  ans: ans,
                  sol: '<p>중복조합이므로 $_{' + n2 + '}H_{' + r2 + '} = {}_{' + (n2 + r2 - 1) + '}C_{' + r2 + '} = ' + ans + '$ 입니다.</p>'
                };
              }
              var p = M.i(2, 4), q = M.i(1, 3), rest = M.i(1, 2);
              var total = p + q + rest;
              var ans2 = M.fact(total) / (M.fact(p) * M.fact(q) * M.fact(rest));
              return {
                q: 'a가 ' + p + '개, b가 ' + q + '개, c가 ' + rest + '개 있다. 이 ' + total + '개의 문자를 일렬로 나열하는 방법의 수를 구하시오.',
                type: 'num',
                ans: ans2,
                sol: '<p>같은 것이 있는 순열이므로 $\\dfrac{' + total + '!}{' + p + '!\\,' + q + '!\\,' + rest + '!} = ' + ans2 + '$ 입니다.</p>'
              };
            }
          },
          {
            id: 'binomial-thm',
            name: '이항정리',
            desc: '전개식의 특정 항의 계수',
            concept: '<p>$(x+a)^n$ 의 전개식에서 $x^r$ 의 계수는 $_nC_{n-r}\\,a^{n-r}$ 입니다. 일반항은 $_nC_k\\,x^{n-k}a^k$ 로 두고 $x$ 의 차수를 맞추면 됩니다.</p>',
            gen: function () {
              var n = M.i(4, 7), a = M.nz(-3, 3), r = M.i(1, n - 1);
              var k = n - r;
              var ans = M.nCr(n, k) * Math.pow(a, k);
              return {
                q: '$(x ' + (a > 0 ? '+ ' + a : '- ' + (-a)) + ')^{' + n + '}$ 의 전개식에서 $x^{' + r + '}$ 의 계수를 구하시오.',
                type: 'num',
                ans: ans,
                sol: '<p>일반항은 $_{' + n + '}C_k\\,x^{' + n + '-k}(' + a + ')^k$ 이고, $x^{' + r + '}$ 이 되려면 $k = ' + k + '$ 입니다.</p>' +
                  '<p>$_{' + n + '}C_{' + k + '} \\times (' + a + ')^{' + k + '} = ' + M.nCr(n, k) + ' \\times ' + Math.pow(a, k) + ' = ' + ans + '$</p>'
              };
            }
          }
        ]
      },
      {
        name: '확률',
        topics: [
          {
            id: 'prob-add',
            name: '확률의 덧셈정리',
            desc: '합사건의 확률 구하기',
            concept: '<p>$P(A \\cup B) = P(A) + P(B) - P(A \\cap B)$ 입니다. 두 사건이 배반사건이면 $P(A \\cap B) = 0$ 이므로 단순히 더하면 됩니다.</p>',
            gen: function () {
              var total = M.pick([20, 25, 30, 40, 50]);
              var both = M.i(2, 6), onlyA = M.i(3, 10), onlyB = M.i(3, 10);
              while (both + onlyA + onlyB > total) { onlyA = M.i(2, 6); onlyB = M.i(2, 6); }
              var union = both + onlyA + onlyB;
              return {
                q: '전체 ' + total + '명의 학생 중 축구를 좋아하는 학생이 ' + (both + onlyA) + '명, 농구를 좋아하는 학생이 ' +
                  (both + onlyB) + '명, 두 종목을 모두 좋아하는 학생이 ' + both + '명이다. ' +
                  '이 중 한 명을 뽑을 때 축구 또는 농구를 좋아하는 학생일 확률을 구하시오.',
                type: 'num',
                ans: union / total,
                ansText: '$' + M.fracTex(union, total) + '$',
                hint: '분수는 3/5 처럼 입력하세요.',
                sol: '<p>$P(A \\cup B) = \\dfrac{' + (both + onlyA) + '}{' + total + '} + \\dfrac{' + (both + onlyB) + '}{' + total + '} - \\dfrac{' + both + '}{' + total + '}' +
                  ' = \\dfrac{' + union + '}{' + total + '} = ' + M.fracTex(union, total) + '$</p>'
              };
            }
          },
          {
            id: 'conditional',
            name: '조건부확률',
            desc: '조건이 주어졌을 때의 확률',
            concept: '<p>$P(B|A) = \\dfrac{P(A \\cap B)}{P(A)}$ 입니다. 표에서는 <strong>조건이 되는 줄만 따로 떼어</strong> 그 안에서의 비율을 구한다고 생각하면 쉽습니다.</p>',
            gen: function () {
              var a = M.i(5, 20), b = M.i(5, 20), c = M.i(5, 20), d = M.i(5, 20);
              var table = '<table class="q-table"><tr><th></th><th>찬성</th><th>반대</th></tr>' +
                '<tr><th>남학생</th><td>' + a + '</td><td>' + b + '</td></tr>' +
                '<tr><th>여학생</th><td>' + c + '</td><td>' + d + '</td></tr></table>';
              var askMale = Math.random() < 0.5;
              var num = askMale ? a : a + c;
              var den = askMale ? a + b : a + b + c + d;
              var qtext = askMale
                ? '임의로 뽑은 한 명이 남학생일 때, 그 학생이 찬성했을 확률을 구하시오.'
                : '임의로 뽑은 한 명이 찬성했을 확률을 구하시오.';
              return {
                q: '어느 학급 학생들의 의견을 조사한 결과가 다음과 같다.' + table + qtext,
                type: 'num',
                ans: num / den,
                ansText: '$' + M.fracTex(num, den) + '$',
                hint: '분수는 3/5 처럼 입력하세요.',
                sol: '<p>구하는 확률은 $\\dfrac{' + num + '}{' + den + '} = ' + M.fracTex(num, den) + '$ 입니다.</p>' +
                  (askMale ? '<p>남학생 ' + (a + b) + '명 중 찬성한 ' + a + '명의 비율입니다.</p>' : '<p>전체 ' + den + '명 중 찬성한 ' + num + '명의 비율입니다.</p>')
              };
            }
          },
          {
            id: 'independent-trial',
            name: '독립시행의 확률',
            desc: '같은 시행을 반복할 때',
            concept: '<p>한 번의 시행에서 사건 $A$ 가 일어날 확률이 $p$ 일 때, $n$ 번의 독립시행에서 $A$ 가 $k$ 번 일어날 확률은 $_nC_k\\,p^k(1-p)^{n-k}$ 입니다.</p>',
            gen: function () {
              var setting = M.pick([
                { txt: '동전을 던져 앞면이 나올', pn: 1, pd: 2 },
                { txt: '주사위를 던져 3의 배수의 눈이 나올', pn: 1, pd: 3 },
                { txt: '주사위를 던져 6의 눈이 나올', pn: 1, pd: 6 },
                { txt: '주사위를 던져 짝수의 눈이 나올', pn: 1, pd: 2 }
              ]);
              var n = M.i(3, 5), k = M.i(1, 3);
              if (k > n) { k = n; }
              var num = M.nCr(n, k) * Math.pow(setting.pn, k) * Math.pow(setting.pd - setting.pn, n - k);
              var den = Math.pow(setting.pd, n);
              return {
                q: '한 번의 시행에서 ' + setting.txt + ' 확률이 $' + M.fracTex(setting.pn, setting.pd) + '$ 이다. ' +
                  '이 시행을 ' + n + '번 반복할 때 그 사건이 정확히 ' + k + '번 일어날 확률을 구하시오.',
                type: 'num',
                ans: num / den,
                ansText: '$' + M.fracTex(num, den) + '$',
                hint: '분수는 5/16 처럼 입력하세요.',
                sol: '<p>$_{' + n + '}C_{' + k + '}\\left(' + M.fracTex(setting.pn, setting.pd) + '\\right)^{' + k + '}' +
                  '\\left(' + M.fracTex(setting.pd - setting.pn, setting.pd) + '\\right)^{' + (n - k) + '}' +
                  ' = \\dfrac{' + num + '}{' + den + '} = ' + M.fracTex(num, den) + '$</p>'
              };
            }
          }
        ]
      },
      {
        name: '통계',
        topics: [
          {
            id: 'random-var',
            name: '이산확률변수의 평균과 분산',
            desc: '확률분포표에서 $E(X)$, $V(X)$',
            concept: '<p>$E(X) = \\sum x_i p_i$, $V(X) = E(X^2) - \\{E(X)\\}^2$ 입니다. 확률의 합이 1 이라는 조건을 먼저 확인하세요.</p>',
            gen: function () {
              var den = M.pick([8, 10, 12, 16, 20]);
              var xs = [M.i(0, 2), M.i(3, 5), M.i(6, 9)];
              var p1 = M.i(1, den - 2);
              var p2 = M.i(1, den - p1 - 1);
              var p3 = den - p1 - p2;
              var ps = [p1, p2, p3];
              var E = 0, E2 = 0, i;
              for (i = 0; i < 3; i++) { E += xs[i] * ps[i] / den; E2 += xs[i] * xs[i] * ps[i] / den; }
              var V = E2 - E * E;
              var askE = Math.random() < 0.6;
              var table = '<table class="q-table"><tr><th>$X$</th><td>' + xs.join('</td><td>') + '</td><th>합계</th></tr>' +
                '<tr><th>$P(X=x)$</th><td>$' + M.fracTex(ps[0], den) + '$</td><td>$' + M.fracTex(ps[1], den) + '$</td><td>$' + M.fracTex(ps[2], den) + '$</td><td>1</td></tr></table>';
              return {
                q: '확률변수 $X$ 의 확률분포가 다음과 같다.' + table +
                  (askE ? '$E(X)$ 의 값을 구하시오.' : '$V(X)$ 의 값을 구하시오.'),
                type: 'num',
                ans: askE ? E : V,
                ansText: askE ? '$' + M.fracTex(xs[0] * ps[0] + xs[1] * ps[1] + xs[2] * ps[2], den) + '$' : M.num(V, 4),
                hint: '분수 또는 소수로 입력하세요. 소수는 넷째 자리까지 맞으면 정답으로 봅니다.',
                tol: 5e-4,
                sol: '<p>$E(X) = ' + xs[0] + ' \\times ' + M.fracTex(ps[0], den) + ' + ' + xs[1] + ' \\times ' + M.fracTex(ps[1], den) +
                  ' + ' + xs[2] + ' \\times ' + M.fracTex(ps[2], den) + ' = ' + M.fracTex(xs[0] * ps[0] + xs[1] * ps[1] + xs[2] * ps[2], den) + '$</p>' +
                  '<p>$E(X^2) = ' + M.fracTex(xs[0] * xs[0] * ps[0] + xs[1] * xs[1] * ps[1] + xs[2] * xs[2] * ps[2], den) + '$ 이므로 ' +
                  '$V(X) = E(X^2) - \\{E(X)\\}^2 = ' + M.num(V, 4) + '$ 입니다.</p>'
              };
            }
          },
          {
            id: 'binom-dist',
            name: '이항분포',
            desc: '$B(n, p)$ 의 평균과 분산',
            concept: '<p>$X \\sim B(n, p)$ 이면 $E(X) = np$, $V(X) = np(1-p)$, $\\sigma(X) = \\sqrt{np(1-p)}$ 입니다.</p>',
            gen: function () {
              var n = M.pick([20, 30, 36, 48, 60, 100]);
              var pr = M.pick([[1, 2], [1, 3], [1, 4], [1, 5], [2, 3], [3, 4]]);
              var p = pr[0] / pr[1];
              var E = n * p, V = n * p * (1 - p);
              var askE = Math.random() < 0.5;
              return {
                q: '확률변수 $X$ 가 이항분포 $B\\left(' + n + ',\\ ' + M.fracTex(pr[0], pr[1]) + '\\right)$ 를 따를 때 ' +
                  (askE ? '$E(X)$' : '$V(X)$') + ' 의 값을 구하시오.',
                type: 'num',
                ans: askE ? E : V,
                ansText: askE ? M.num(E, 4) : M.num(V, 4),
                hint: '분수 또는 소수로 입력하세요.',
                tol: 5e-4,
                sol: '<p>$E(X) = np = ' + n + ' \\times ' + M.fracTex(pr[0], pr[1]) + ' = ' + M.num(E, 4) + '$</p>' +
                  '<p>$V(X) = np(1-p) = ' + n + ' \\times ' + M.fracTex(pr[0], pr[1]) + ' \\times ' + M.fracTex(pr[1] - pr[0], pr[1]) + ' = ' + M.num(V, 4) + '$</p>'
              };
            }
          },
          {
            id: 'normal',
            name: '정규분포의 표준화',
            desc: '$Z = \\frac{X-m}{\\sigma}$ 계산하기',
            concept: '<p>$X \\sim N(m, \\sigma^2)$ 일 때 $Z = \\dfrac{X-m}{\\sigma}$ 는 표준정규분포 $N(0,1)$ 을 따릅니다. 표준정규분포표를 쓰려면 먼저 $Z$ 값으로 바꿔야 합니다.</p>',
            gen: function () {
              var m = M.pick([50, 60, 65, 70, 75, 80]);
              var sd = M.pick([4, 5, 8, 10]);
              var z = M.pick([-2, -1.5, -1, 0.5, 1, 1.5, 2, 2.5]);
              var x = m + z * sd;
              return {
                q: '어떤 시험의 점수 $X$ 가 정규분포 $N(' + m + ',\\ ' + sd + '^2)$ 를 따른다. ' +
                  '점수가 ' + x + '점인 학생의 $Z$ 값(표준화 점수)을 구하시오.',
                type: 'num',
                ans: z,
                tol: 1e-6,
                hint: '소수로 입력하세요. 예: 1.5',
                sol: '<p>$Z = \\dfrac{X - m}{\\sigma} = \\dfrac{' + x + ' - ' + m + '}{' + sd + '} = ' + z + '$</p>'
              };
            }
          },
          {
            id: 'sample-mean',
            name: '표본평균과 신뢰구간',
            desc: '표본분포와 모평균 추정',
            concept: '<p>모평균 $m$, 모표준편차 $\\sigma$ 인 모집단에서 크기 $n$ 인 표본을 뽑으면 $E(\\overline{X}) = m$, $\\sigma(\\overline{X}) = \\dfrac{\\sigma}{\\sqrt{n}}$ 입니다. 신뢰도 95%의 신뢰구간은 $\\overline{X} \\pm 1.96\\dfrac{\\sigma}{\\sqrt{n}}$ 이므로 그 길이는 $2 \\times 1.96 \\times \\dfrac{\\sigma}{\\sqrt{n}}$ 입니다.</p>',
            gen: function () {
              var sd = M.pick([4, 5, 6, 8, 10, 12]);
              var n = M.pick([4, 9, 16, 25, 36, 100]);
              var root = Math.sqrt(n);
              if (Math.random() < 0.5) {
                return {
                  q: '모표준편차가 ' + sd + ' 인 모집단에서 크기 ' + n + ' 인 표본을 임의추출할 때, 표본평균 $\\overline{X}$ 의 표준편차를 구하시오.',
                  type: 'num',
                  ans: sd / root,
                  ansText: '$' + M.fracTex(sd, root) + '$',
                  hint: '분수 또는 소수로 입력하세요.',
                  tol: 5e-4,
                  sol: '<p>$\\sigma(\\overline{X}) = \\dfrac{\\sigma}{\\sqrt{n}} = \\dfrac{' + sd + '}{\\sqrt{' + n + '}} = \\dfrac{' + sd + '}{' + root + '} = ' + M.num(sd / root, 4) + '$</p>'
                };
              }
              var len = 2 * 1.96 * sd / root;
              return {
                q: '모표준편차가 ' + sd + ' 인 모집단에서 크기 ' + n + ' 인 표본을 뽑아 모평균을 신뢰도 95%로 추정할 때, ' +
                  '신뢰구간의 길이를 구하시오. (소수 넷째 자리까지)',
                type: 'num',
                ans: Number(len.toFixed(4)),
                tol: 5e-4,
                hint: '소수로 입력하세요. $1.96$ 을 사용합니다.',
                sol: '<p>신뢰구간의 길이 $= 2 \\times 1.96 \\times \\dfrac{' + sd + '}{\\sqrt{' + n + '}} = 2 \\times 1.96 \\times \\dfrac{' + sd + '}{' + root + '} = ' + Number(len.toFixed(4)) + '$</p>'
              };
            }
          }
        ]
      }
    ]
  };
})();
