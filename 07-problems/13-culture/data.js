/* 수학과 문화 — 주제별 문제 생성기 */
(function () {
  var M = window.SU3M;
  var WEEK = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  var ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  window.SU3_SUBJECT = {
    id: 'culture',
    name: '수학과 문화',
    areas: [
      {
        name: '수학과 예술',
        topics: [
          {
            id: 'music',
            name: '음악 속의 수학',
            desc: '음정과 진동수의 비',
            concept: '<p>한 옥타브 위의 음은 진동수가 <strong>2배</strong>, 완전5도 위의 음은 <strong>$\\frac{3}{2}$ 배</strong>, 완전4도 위는 $\\frac{4}{3}$ 배입니다. 음정은 진동수의 <strong>비</strong>로 정해집니다.</p>',
            gen: function () {
              var base = M.pick([264, 288, 396, 480, 528, 660, 720]);
              var kind = M.pick([['한 옥타브 위', 2, 1], ['완전5도 위', 3, 2], ['완전4도 위', 4, 3], ['한 옥타브 아래', 1, 2]]);
              var ans = base * kind[1] / kind[2];
              return {
                q: '진동수가 ' + base + ' Hz 인 음의 <strong>' + kind[0] + '</strong> 음의 진동수를 구하시오.',
                type: 'num',
                ans: ans,
                ansText: M.num(ans, 4),
                unit: 'Hz',
                tol: 5e-4,
                sol: '<p>' + kind[0] + ' 음은 진동수가 $' + M.fracTex(kind[1], kind[2]) + '$ 배이므로</p>' +
                  '<p>$' + base + ' \\times ' + M.fracTex(kind[1], kind[2]) + ' = ' + M.num(ans, 4) + '$ (Hz)</p>'
              };
            }
          },
          {
            id: 'golden',
            name: '황금비',
            desc: '$\\phi = 1.618\\dots$ 의 활용',
            concept: '<p>황금비 $\\phi = \\dfrac{1+\\sqrt{5}}{2} \\approx 1.618$ 입니다. 짧은 변이 $a$ 인 황금사각형의 긴 변은 $1.618a$ 이고, 피보나치 수열에서 이웃한 두 항의 비는 황금비에 가까워집니다.</p>',
            gen: function () {
              if (Math.random() < 0.6) {
                var a = M.i(5, 60);
                var ans = Number((a * 1.618).toFixed(2));
                return {
                  q: '짧은 변의 길이가 ' + a + ' cm 인 황금사각형의 긴 변의 길이를 구하시오. ($\\phi = 1.618$, 소수 둘째 자리까지)',
                  type: 'num',
                  ans: ans,
                  unit: 'cm',
                  tol: 0.02,
                  sol: '<p>$' + a + ' \\times 1.618 = ' + ans + '$ (cm)</p>'
                };
              }
              var fib = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233];
              var i = M.i(6, 10);
              var ans2 = Number((fib[i + 1] / fib[i]).toFixed(4));
              return {
                q: '피보나치 수열 $1, 1, 2, 3, 5, 8, 13, \\dots$ 에서 제' + (i + 2) + '항을 제' + (i + 1) + '항으로 나눈 값을 구하시오. ' +
                  '(소수 넷째 자리까지) 이 값이 황금비에 가까워지는 것을 확인해 보세요.',
                type: 'num',
                ans: ans2,
                tol: 5e-4,
                sol: '<p>제' + (i + 1) + '항은 $' + fib[i] + '$, 제' + (i + 2) + '항은 $' + fib[i + 1] + '$ 이므로</p>' +
                  '<p>$\\dfrac{' + fib[i + 1] + '}{' + fib[i] + '} = ' + ans2 + '$ 이고, 황금비 $1.618\\dots$ 에 가깝습니다.</p>'
              };
            }
          },
          {
            id: 'tessellation',
            name: '테셀레이션',
            desc: '정다각형으로 평면 채우기',
            concept: '<p>정$n$각형의 한 내각의 크기는 $\\dfrac{180(n-2)}{n}$ 도입니다. 한 꼭짓점에 모인 각의 합이 정확히 $360^\\circ$ 가 되어야 빈틈없이 평면을 채울 수 있습니다.</p>',
            gen: function () {
              if (Math.random() < 0.6) {
                var n = M.pick([3, 4, 5, 6, 8, 9, 10, 12]);
                var ang = 180 * (n - 2) / n;
                return {
                  q: '정' + n + '각형의 한 내각의 크기를 구하시오. (단위: 도)',
                  type: 'num',
                  ans: ang,
                  ansText: M.num(ang, 4),
                  unit: '도',
                  tol: 5e-4,
                  sol: '<p>$\\dfrac{180 \\times (' + n + ' - 2)}{' + n + '} = \\dfrac{' + (180 * (n - 2)) + '}{' + n + '} = ' + M.num(ang, 4) + '$ (도)</p>'
                };
              }
              var m = M.pick([3, 4, 6]);
              var ang2 = 180 * (m - 2) / m;
              return {
                q: '정' + m + '각형만으로 평면을 빈틈없이 채울 때, 한 꼭짓점에 모이는 정' + m + '각형의 개수를 구하시오.',
                type: 'num',
                ans: 360 / ang2,
                sol: '<p>정' + m + '각형의 한 내각은 $' + ang2 + '^\\circ$ 이므로 한 꼭짓점에 $\\dfrac{360}{' + ang2 + '} = ' + (360 / ang2) + '$ 개가 모입니다.</p>'
              };
            }
          }
        ]
      },
      {
        name: '수학과 생활',
        topics: [
          {
            id: 'cipher',
            name: '암호와 수학',
            desc: '시저 암호와 나머지',
            concept: '<p>시저 암호는 알파벳을 일정한 수만큼 밀어 바꿉니다. $A$ 를 0, $B$ 를 1, $\\dots$, $Z$ 를 25 로 두면 $k$ 칸 민 문자는 $(\\text{원래 번호} + k) \\bmod 26$ 번째 문자입니다.</p>',
            hint: '알파벳 한 글자를 입력하세요.',
            gen: function () {
              var idx = M.i(0, 25), k = M.i(1, 20);
              var res = ALPHA[(idx + k) % 26];
              return {
                q: '시저 암호로 알파벳을 ' + k + '칸 뒤로 미는 방식을 쓴다. 문자 <strong>' + ALPHA[idx] + '</strong> 는 어떤 문자로 바뀌는지 구하시오.',
                type: 'text',
                ans: res,
                ansText: res,
                hint: '알파벳 한 글자를 입력하세요.',
                sol: '<p>$' + ALPHA[idx] + '$ 는 ' + idx + '번이고, $' + idx + ' + ' + k + ' = ' + (idx + k) + '$ 입니다.</p>' +
                  '<p>$' + (idx + k) + ' \\bmod 26 = ' + ((idx + k) % 26) + '$ 이므로 답은 <strong>' + res + '</strong> 입니다.</p>'
              };
            }
          },
          {
            id: 'calendar',
            name: '달력과 나머지',
            desc: '요일 계산하기',
            concept: '<p>요일은 7일마다 반복되므로 <strong>7로 나눈 나머지</strong>로 알 수 있습니다. 오늘로부터 $d$ 일 뒤의 요일은 오늘 요일에서 $d \\bmod 7$ 만큼 뒤로 간 요일입니다.</p>',
            hint: '예: 금요일',
            gen: function () {
              var start = M.i(0, 6), d = M.i(15, 400);
              var res = WEEK[(start + d) % 7];
              return {
                q: '오늘이 ' + WEEK[start] + '일 때, 오늘부터 ' + d + '일 뒤는 무슨 요일인지 구하시오.',
                type: 'text',
                ans: res,
                alt: [res.replace('요일', '')],
                ansText: res,
                hint: '예: 금요일',
                sol: '<p>$' + d + ' \\div 7 = ' + Math.floor(d / 7) + ' \\cdots ' + (d % 7) + '$ 이므로 ' + (d % 7) + '일만 더 가면 됩니다.</p>' +
                  '<p>' + WEEK[start] + '에서 ' + (d % 7) + '일 뒤는 <strong>' + res + '</strong> 입니다.</p>'
              };
            }
          }
        ]
      }
    ]
  };
})();
