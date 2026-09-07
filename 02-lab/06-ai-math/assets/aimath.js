// 무게중심 탐구 자료 공용 스크립트

function toggleReveal(btn) {
  const box = btn.nextElementSibling;
  const isHidden = box.classList.contains('hidden');
  box.classList.toggle('hidden');
  btn.dataset.openLabel = btn.dataset.openLabel || btn.textContent;
  if (isHidden) {
    btn.textContent = btn.textContent.replace('보기', '숨기기');
  } else {
    btn.textContent = btn.dataset.openLabel;
  }
}

// 캔버스를 컨테이너 폭에 맞추고 devicePixelRatio를 반영해 선명하게 그린다.
function fitCanvas(canvas, cssHeight) {
  const dpr = window.devicePixelRatio || 1;
  const cssWidth = canvas.parentElement.clientWidth - 2;
  canvas.style.width = cssWidth + 'px';
  canvas.style.height = cssHeight + 'px';
  canvas.width = Math.round(cssWidth * dpr);
  canvas.height = Math.round(cssHeight * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w: cssWidth, h: cssHeight };
}

function fmt(n, d = 2) {
  if (!isFinite(n)) return '—';
  return n.toFixed(d);
}
