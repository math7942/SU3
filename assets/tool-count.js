// 실험실 목록 페이지(.subgroups > .subcard)의 "도구 N개" / "준비 중" 표시를
// 실제 하위 페이지를 읽어 자동으로 계산한다. 새 도구를 추가한 폴더의
// index.html만 갱신하면, 이 카드들은 다음 방문 때 저절로 맞는 숫자로 바뀐다.
(function () {
  const countCache = new Map();

  async function countTools(url) {
    if (countCache.has(url)) return countCache.get(url);
    const promise = (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) return 0;
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');

        // 이 페이지가 직접 도구 목록(.tools)을 가지고 있다면, 첫 번째 목록
        // (차시별 학습 등 핵심 자료)의 개수를 센다. 심화 실습용 "공학 도구"
        // 목록이 별도로 더 있어도 대표 개수에는 포함하지 않는다.
        const firstTools = doc.querySelector('.tools');
        if (firstTools) {
          return firstTools.querySelectorAll(':scope > a.tool').length;
        }

        // 도구 목록이 없고 하위 실험실(.subgroups)만 있다면, 링크가 있는
        // (= 준비된) 하위 카드들을 재귀적으로 합산한다.
        const subcards = doc.querySelectorAll('.subgroups > a.subcard[href]');
        if (subcards.length) {
          let total = 0;
          for (const sc of subcards) {
            const childUrl = new URL(sc.getAttribute('href'), url).href;
            total += await countTools(childUrl);
          }
          return total;
        }
        return 0;
      } catch (e) {
        return 0;
      }
    })();
    countCache.set(url, promise);
    return promise;
  }

  async function initSubcardCounts() {
    const cards = document.querySelectorAll('.subgroups > a.subcard[href]');
    await Promise.all(Array.from(cards).map(async (card) => {
      const url = new URL(card.getAttribute('href'), document.baseURI).href;
      const n = await countTools(url);
      const countEl = card.querySelector('.count');
      if (!countEl) return;
      if (n > 0) {
        card.classList.add('filled');
        card.classList.remove('vacant');
        countEl.textContent = `도구 ${n}개`;
      } else {
        card.classList.add('vacant');
        card.classList.remove('filled');
        countEl.textContent = '준비 중';
      }
    }));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSubcardCounts);
  } else {
    initSubcardCounts();
  }
})();
