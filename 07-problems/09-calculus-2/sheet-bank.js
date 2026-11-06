/* 미적분Ⅱ 공식 쪽지시험 (랜덤 30문항) — 공식 암기 PDF 문제은행에서 무작위로 뽑습니다.
 *
 * 문제은행 BANK 는 "미적분Ⅱ 공식 암기" PDF(3쪽)의 항목을 그대로 옮긴 것입니다.
 * (PDF 안에서 같은 문제가 되풀이된 항목은 한 번만 넣었습니다.)
 *
 * 항목 모양
 *   { pre: '앞에 붙는 글(HTML, 수식은 \\( \\))', q: '문제 TeX(=앞까지)', a: '정답 TeX' }
 *   { pre: '...', at: '글로 된 정답(HTML)' }          ← 정의·정리처럼 글로 답하는 문제
 * q 가 없고 at 만 있으면 pre 만 묻는 문제입니다.
 */
(function () {
  'use strict';

  var M = window.SU3M;

  function f(q, a) { return { q: q, a: a }; }
  function p(pre, q, a) { return { pre: pre, q: q, a: a }; }
  function w(pre, at) { return { pre: pre, at: at }; }

  var BANK = [
    /* ---- 수열·급수의 수렴, 극한 ---- */
    w('등비수열 \\(\\{ar^{n-1}\\}\\)이 수렴 \\(\\Leftrightarrow\\)', '\\(a=0\\) 또는 \\(-1<r\\le 1\\)'),
    w('등비급수 \\(\\displaystyle\\sum_{n=1}^{\\infty}ar^{n-1}\\)이 수렴 \\(\\Leftrightarrow\\)', '\\(a=0\\) 또는 \\(|r|<1\\)'),
    p('급수 \\(\\displaystyle\\sum_{n=1}^{\\infty}a_n\\)이 수렴하면', '\\lim_{n\\to\\infty}a_n', '0'),
    f('e', '\\lim_{x\\to 0}(1+x)^{\\frac{1}{x}}=\\lim_{x\\to\\infty}\\left(1+\\frac{1}{x}\\right)^{x}'),
    f('\\lim_{x\\to 0}\\frac{\\ln(1+x)}{x}', '1'),
    f('\\lim_{x\\to 0}\\frac{e^{x}-1}{x}', '1'),
    f('\\lim_{x\\to 0}\\frac{\\log_a(1+x)}{x}', '\\frac{1}{\\ln a}'),
    f('\\lim_{x\\to 0}\\frac{a^{x}-1}{x}', '\\ln a'),
    f('\\lim_{x\\to 0}\\frac{\\sin x}{x}', '1'),
    f('\\lim_{x\\to 0}\\frac{\\tan x}{x}', '1'),
    f('\\lim_{x\\to 0}\\frac{1-\\cos x}{x^2}', '\\frac{1}{2}'),

    /* ---- 지수·로그·삼각함수의 미분 ---- */
    f('(e^x)\'', 'e^x'),
    f('(a^x)\'', 'a^x\\ln a'),
    f('(\\ln x)\'', '\\frac{1}{x}'),
    f('(\\log_a x)\'', '\\frac{1}{x\\ln a}'),
    f('(\\ln|x|)\'', '\\frac{1}{x}'),
    f('(\\log_a|x|)\'', '\\frac{1}{x\\ln a}'),
    f('(\\ln|f(x)|)\'', '\\frac{f\'(x)}{f(x)}'),
    f('(\\log_a|f(x)|)\'', '\\frac{f\'(x)}{f(x)\\ln a}'),
    f('(\\sin x)\'', '\\cos x'),
    f('(\\cos x)\'', '-\\sin x'),
    f('(\\tan\\theta)\'', '\\sec^2\\theta'),
    f('(\\csc\\theta)\'', '-\\csc\\theta\\cot\\theta'),
    f('(\\sec\\theta)\'', '\\sec\\theta\\tan\\theta'),
    f('(\\cot\\theta)\'', '-\\csc^2\\theta'),
    f('\\{f(g(x))\\}\'', 'f\'(g(x))\\,g\'(x)'),
    p('\\(n\\)이 실수일 때,', '(x^{n})\'', 'nx^{n-1}'),

    /* ---- 삼각함수 덧셈정리·배각·반각 ---- */
    f('\\sin(\\alpha+\\beta)', '\\sin\\alpha\\cos\\beta+\\cos\\alpha\\sin\\beta'),
    f('\\sin(\\alpha-\\beta)', '\\sin\\alpha\\cos\\beta-\\cos\\alpha\\sin\\beta'),
    f('\\cos(\\alpha+\\beta)', '\\cos\\alpha\\cos\\beta-\\sin\\alpha\\sin\\beta'),
    f('\\cos(\\alpha-\\beta)', '\\cos\\alpha\\cos\\beta+\\sin\\alpha\\sin\\beta'),
    f('\\tan(\\alpha+\\beta)', '\\frac{\\tan\\alpha+\\tan\\beta}{1-\\tan\\alpha\\tan\\beta}'),
    f('\\tan(\\alpha-\\beta)', '\\frac{\\tan\\alpha-\\tan\\beta}{1+\\tan\\alpha\\tan\\beta}'),
    f('\\sin 2x', '2\\sin x\\cos x'),
    f('\\cos 2x', '\\cos^2 x-\\sin^2 x=2\\cos^2 x-1=1-2\\sin^2 x'),
    f('\\tan 2x', '\\frac{2\\tan x}{1-\\tan^2 x}'),
    f('\\sin^2\\frac{x}{2}', '\\frac{1-\\cos x}{2}'),
    f('\\cos^2\\frac{x}{2}', '\\frac{1+\\cos x}{2}'),
    f('\\tan^2\\frac{x}{2}', '\\frac{1-\\cos x}{1+\\cos x}'),

    /* ---- 매개변수·역함수·접선 ---- */
    p('두 함수 \\(x=f(t),\\ y=g(t)\\)가 \\(t\\)에 대하여 미분가능하고 \\(f\'(t)\\ne 0\\)이면', '\\frac{dy}{dx}', '\\frac{g\'(t)}{f\'(t)}'),
    p('미분가능한 함수 \\(f\\)의 역함수 \\(f^{-1}\\)가 존재하고 미분가능할 때, 함수 \\(y=f^{-1}(x)\\)를 미분하면', '\\frac{dy}{dx}', '\\frac{1}{\\frac{dx}{dy}}\\ \\left(\\frac{dx}{dy}\\ne 0\\right)'),
    f('(f^{-1})\'(x)', '\\frac{1}{f\'(f^{-1}(x))}\\ \\left(f\'(f^{-1}(x))\\ne 0\\right)'),
    p('미분가능한 함수 \\(f(x)\\)에 대해 점 \\((a,f(a))\\)에서의 접선은', 'y', 'f\'(a)(x-a)+f(a)'),

    /* ---- 극값·곡선의 모양 ---- */
    w('극대 정의와 정리',
      '\\(x=a\\)를 포함하는 어떤 열린구간에서 \\(f(x)\\le f(a)\\)이면 \\(f(x)\\)는 \\(x=a\\)에서 극대, \\(f(a)\\)는 극댓값.<br>' +
      '정리: \\(f\'(a)=0\\)이고 \\(x=a\\)의 좌우에서 \\(f\'(x)\\)의 부호가 +에서 −로 바뀌면 \\(x=a\\)에서 극대.'),
    w('극소 정의와 정리',
      '\\(x=a\\)를 포함하는 어떤 열린구간에서 \\(f(x)\\ge f(a)\\)이면 \\(f(x)\\)는 \\(x=a\\)에서 극소, \\(f(a)\\)는 극솟값.<br>' +
      '정리: \\(f\'(a)=0\\)이고 \\(x=a\\)의 좌우에서 \\(f\'(x)\\)의 부호가 −에서 +로 바뀌면 \\(x=a\\)에서 극소.'),
    w('오목 정의와 정리',
      '구간에서 \\(f\'(x)\\)가 증가하면 곡선은 아래로 볼록(오목).<br>' +
      '정리: 구간에서 \\(f\'\'(x)>0\\)이면 \\(y=f(x)\\)는 그 구간에서 아래로 볼록(오목).'),
    w('볼록 정의와 정리',
      '구간에서 \\(f\'(x)\\)가 감소하면 곡선은 위로 볼록(볼록).<br>' +
      '정리: 구간에서 \\(f\'\'(x)<0\\)이면 \\(y=f(x)\\)는 그 구간에서 위로 볼록(볼록).'),
    w('변곡점 정의와 정리',
      '곡선 \\(y=f(x)\\) 위의 점 중에서 오목·볼록(아래로 볼록↔위로 볼록)이 바뀌는 점.<br>' +
      '정리: \\(f\'\'(a)=0\\)이고 \\(x=a\\)의 좌우에서 \\(f\'\'(x)\\)의 부호가 바뀌면 \\((a,f(a))\\)는 변곡점.'),

    /* ---- 부정적분 ---- */
    p('\\(n\\ne -1\\)인 실수일 때,', '\\int x^{n}dx', '\\frac{x^{n+1}}{n+1}+C'),
    f('\\int x^{-1}dx', '\\ln|x|+C'),
    f('\\int e^{x}dx', 'e^{x}+C'),
    f('\\int a^{x}dx', '\\frac{a^{x}}{\\ln a}+C'),
    f('\\int \\sin x\\,dx', '-\\cos x+C'),
    f('\\int \\cos x\\,dx', '\\sin x+C'),
    f('\\int \\sec^2 x\\,dx', '\\tan x+C'),
    f('\\int \\csc^2 x\\,dx', '-\\cot x+C'),
    f('\\int \\sec x\\tan x\\,dx', '\\sec x+C'),
    f('\\int \\csc x\\cot x\\,dx', '-\\csc x+C'),
    f('\\int \\frac{f\'(x)}{f(x)}dx', '\\ln|f(x)|+C'),
    f('\\int \\tan x\\,dx', '-\\ln|\\cos x|+C'),
    f('\\int \\sec x\\,dx', '\\ln|\\sec x+\\tan x|+C'),
    f('\\int \\frac{-f(x)\'}{\\{f(x)\\}^2}dx', '\\frac{1}{f(x)}+C'),
    f('\\int \\ln x\\,dx', 'x\\ln x-x+C'),
    p('치환적분', '\\int f(g(x))\\times g\'(x)\\,dx', '\\int f(t)\\,dt\\quad(g(x)=t)'),
    p('부분적분', '\\int f(x)\\times g\'(x)\\,dx', 'f(x)g(x)-\\int f\'(x)g(x)\\,dx'),

    /* ---- 정적분으로 정의된 함수의 미분·극한 ---- */
    f('\\frac{d}{dx}\\int_a^x f(t)\\,dt', 'f(x)'),
    f('\\frac{d}{dx}\\int_x^{x+a} f(t)\\,dt', 'f(x+a)-f(x)'),
    f('\\frac{d}{dx}\\int_a^x xf(t)\\,dt', '\\int_a^x f(t)\\,dt+xf(x)'),
    f('\\frac{d}{dx}\\int_a^x (x-t)f(t)\\,dt', '\\int_a^x f(t)\\,dt'),
    f('\\frac{d}{dx}\\int_{h(x)}^{g(x)} f(t)\\,dt', 'f(g(x))\\,g\'(x)-f(h(x))\\,h\'(x)'),
    f('\\lim_{x\\to 0}\\frac{1}{x}\\int_a^{x+a} f(t)\\,dt', 'f(a)'),
    f('\\lim_{x\\to a}\\frac{1}{x-a}\\int_a^x f(t)\\,dt', 'f(a)'),

    /* ---- 급수의 합과 정적분 ---- */
    f('\\lim_{n\\to\\infty}\\sum_{k=1}^{n}f\\left(\\frac{k}{n}\\right)\\frac{1}{n}', '\\int_0^1 f(x)\\,dx'),
    f('\\lim_{n\\to\\infty}\\sum_{k=1}^{n}f\\left(\\frac{pk}{n}\\right)\\frac{p}{n}', '\\int_0^p f(x)\\,dx'),
    f('\\lim_{n\\to\\infty}\\sum_{k=1}^{n}f\\left(a+\\frac{pk}{n}\\right)\\frac{p}{n}', '\\int_a^{a+p} f(x)\\,dx'),

    /* ---- 넓이·부피·길이 ---- */
    p('\\(y=f(x),\\ x=a,\\ x=b,\\ x\\)축으로 둘러싸인 도형의 넓이', 'S', '\\int_a^b |f(x)|\\,dx'),
    p('\\(x=g(y),\\ y=c,\\ y=d,\\ y\\)축으로 둘러싸인 도형의 넓이', 'S', '\\int_c^d |g(y)|\\,dy'),
    p('두 곡선 \\(y=f(x),\\ y=g(x)\\)로 둘러싸인 도형의 넓이', 'S', '\\int_a^b |f(x)-g(x)|\\,dx'),
    p('\\(a\\le x\\le b\\)이고 단면적이 \\(S(x)\\)인 입체의 부피', 'V', '\\int_a^b S(x)\\,dx'),
    p('좌표평면 위를 움직이는 점 P의 시각 \\(t\\)에서의 위치 \\((x,y)\\)가 \\(x=f(t),\\ y=g(t)\\)일 때, \\(t=a\\)에서 \\(t=b\\)까지 점 P가 움직인 거리',
      's', '\\int_a^b\\sqrt{\\left(\\frac{dx}{dt}\\right)^2+\\left(\\frac{dy}{dt}\\right)^2}\\,dt'),
    p('매개변수(\\(x=f(t),\\ y=g(t)\\ (a\\le t\\le b)\\))로 나타낸 곡선의 길이',
      'l', '\\int_a^b\\sqrt{\\{f\'(t)\\}^2+\\{g\'(t)\\}^2}\\,dt'),
    p('\\(y=f(x)\\ (a\\le x\\le b)\\)에서 곡선의 길이', 'l', '\\int_a^b\\sqrt{1+\\{f\'(x)\\}^2}\\,dx'),
    p('함수 \\(f(x)\\)와 그 역함수 \\(g(x)\\)에 대해 (단, \\(f(a)=\\alpha,\\ f(b)=\\beta\\))',
      '\\int_{\\alpha}^{\\beta}g(x)\\,dx', 'b\\beta-a\\alpha-\\int_a^b f(x)\\,dx')
  ];

  var PER_SET = 30;

  /* 문제은행에서 세트마다 30문항을 무작위로 뽑습니다.
   * 은행을 섞은 한 벌(deck)에서 차례로 뽑으므로 세트끼리 되도록 겹치지 않고,
   * 한 벌이 모자라면 (같은 세트에 이미 든 문항을 뺀) 새 한 벌을 섞어 이어서 뽑습니다.
   * 한 세트 안에서는 같은 문항이 두 번 나오지 않습니다. */
  function build() {
    var labels = ['A', 'B', 'C', 'D'];
    var deck = [];
    return labels.map(function (label) {
      var picked = [], has = {};
      while (picked.length < PER_SET) {
        if (deck.length === 0) {
          deck = M.shuffle(BANK.map(function (_, i) { return i; }).filter(function (i) { return !has[i]; }));
        }
        var i = deck.pop();
        if (has[i]) { continue; }
        has[i] = true;
        picked.push(i);
      }
      return { label: label, items: M.shuffle(picked).map(function (i) { return BANK[i]; }) };
    });
  }

  window.SU3_SHEETS.bank = {
    id: 'bank',
    layout: 'bank',
    title: '미적분Ⅱ 공식 쪽지시험',
    total: PER_SET,
    bankSize: BANK.length,
    modes: [{ id: 'all', label: '전체 범위', sub: '(랜덤 30문항)' }],
    note: '',
    build: build
  };
})();
