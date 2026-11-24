/* Director's Studio: independent enhancements; main portfolio scripts remain unchanged. */
(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const originalCards = Array.from(document.querySelectorAll('#worksGrid .project'));
  const selectedTitles = ['바다에서 온 초대장', '영도 봉산마을 관광 콘텐츠', '부산 서구 홍보영상'];
  const cards = selectedTitles.map(title => originalCards.find(card =>
    card.querySelector('.project-content h3')?.textContent.trim() === title));
  const reelButtons = [...document.querySelectorAll('.studio-filmstrip-item')];
  const stageImage = $('#studioStageImage');
  const stageTitle = $('#studioStageTitle');
  const stageType = $('#studioStageType');
  const stageDesc = $('#studioStageDesc');
  const stageRole = $('#studioStageRole');
  const stageIndex = $('#studioStageIndex');
  const stageAction = $('#studioStageAction');
  let currentIndex = 0;

  function setStage(index) {
    const card = cards[index];
    if (!card) return;
    currentIndex = index;
    reelButtons.forEach((button, i) => {
      button.classList.toggle('is-active', i === index);
      button.setAttribute('aria-pressed', String(i === index));
    });
    const title = card.querySelector('.project-content h3')?.textContent.trim() || '';
    const type = card.querySelector('.project-meta span:first-child')?.textContent.trim() || '';
    const desc = card.querySelector('.project-content > p')?.textContent.trim() || '';
    const role = (card.querySelector('.project-foot small')?.textContent.trim() || '').replace(/^MY ROLE\s*·\s*/, '');
    stageTitle.textContent = title;
    stageType.textContent = type;
    stageDesc.textContent = desc;
    stageRole.textContent = role;
    stageIndex.textContent = `FRAME 0${index + 1} / 03`;
    const originalImage = card.querySelector('.project-media img');
    if (originalImage) {
      const fallbacks = (originalImage.dataset.fallbacks || '').split('|').filter(Boolean);
      // Resolve from the same base as existing portfolio cards, no generated paths.
      stageImage.src = originalImage.currentSrc || originalImage.src;
      stageImage.alt = title + ' 대표 장면';
      stageImage.dataset.fallbacks = fallbacks.join('|');
      stageImage.hidden = false;
    } else {
      stageImage.removeAttribute('src');
      stageImage.hidden = true;
    }
    const action = card.querySelector('.project-cta:is(button,a)');
    if (!action) {
      stageAction.textContent = card.querySelector('.project-cta-status')?.textContent.trim() || '영상 제작 중';
      stageAction.disabled = true;
    } else {
      stageAction.textContent = action.matches('a') ? '프로젝트 영상 보기 ↗' : '영상 재생하기 ▶';
      stageAction.disabled = false;
    }
  }
  if (stageImage) {
    stageImage.addEventListener('error', () => {
      const fallbacks = (stageImage.dataset.fallbacks || '').split('|').filter(Boolean);
      if (fallbacks.length) {
        stageImage.src = fallbacks.shift();
        stageImage.dataset.fallbacks = fallbacks.join('|');
      } else stageImage.hidden = true;
    });
    reelButtons.forEach((button, i) => button.addEventListener('click', () => setStage(i)));
    stageAction.addEventListener('click', () => {
      const action = cards[currentIndex]?.querySelector('.project-cta:is(button,a)');
      if (action) action.click(); // Reuse the original project's actual player/link behavior.
    });
    setStage(0);
  }

  // Decorative focus-frame overlay on video thumbnails (does not obscure links).
  originalCards.forEach((card, i) => {
    const media = card.querySelector('.project-media');
    if (!media) return;
    const finder = document.createElement('span');
    finder.className = 'studio-viewfinder';
    finder.setAttribute('aria-hidden', 'true');
    finder.innerHTML = '<i class="studio-corner"></i><i class="studio-corner"></i><i class="studio-corner"></i><i class="studio-corner"></i><b>REC</b><span class="studio-finder-text">FRAME ' + String(i + 1).padStart(2, '0') + '</span>';
    media.append(finder);
  });
})();
