const track = document.querySelector('#poemTrack');
const rows = [...document.querySelectorAll('.poem-row')];

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

rows.forEach((row) => {
  const trail = row.querySelector('.trail');
  trail.dataset.fullText = trail.textContent;
  trail.textContent = '';
});

function render() {
  const rect = track.getBoundingClientRect();
  const scrollable = Math.max(1, track.offsetHeight - window.innerHeight);
  const progress = clamp(-rect.top / scrollable);
  const count = Math.max(1, rows.length - 1);

  rows.forEach((row, index) => {
    const trail = row.querySelector('.trail');
    const fullText = trail.dataset.fullText || '';
    const rowPoint = index / count;

    const local = clamp((progress - (rowPoint * 0.82 - 0.034)) / 0.105);
    const chars = Math.floor(local * (fullText.length + 1));
    trail.textContent = fullText.slice(0, chars);

    let maxDrag = 4 + Math.pow(index / count, 1.5) * 148;
    if (row.dataset.final === 'true') maxDrag *= 0.72;

    const dragSteps = row.dataset.final === 'true' ? 10 : 12;
    const steppedLocal = Math.floor(local * dragSteps) / dragSteps;
    let drag = maxDrag * steppedLocal;

    if (row.dataset.reset === 'true') drag *= 0.14;

    if (row.dataset.return === 'true') {
      const returnProgress = clamp((progress - 0.84) / 0.10);
      const returnSteps = Math.floor(returnProgress * 8) / 8;
      drag *= 1 - returnSteps;
    }

    row.style.setProperty('--x', `${Math.round(drag)}px`);
    row.style.setProperty('--alpha', local > 0 ? '1' : '0.17');
    row.classList.toggle('is-typing', local > 0 && local < 0.995);
    row.classList.toggle('is-typed', local >= 0.995);
  });

// Keep the first half nearly colourless. Memory blooms only as the poem deepens.
  const memory = clamp((progress - 0.42) / 0.50);
  const easedMemory = memory * memory * (3 - 2 * memory);
  const finalLift = clamp((progress - 0.82) / 0.16);
  const opacity = Math.min(0.46, easedMemory * 0.30 + finalLift * 0.16);
  const scale = 0.9 + easedMemory * 0.12 + finalLift * 0.04;

  document.documentElement.style.setProperty('--memory-opacity', opacity.toFixed(3));
  document.documentElement.style.setProperty('--memory-scale', scale.toFixed(3));
}

render();
window.addEventListener('scroll', render, { passive: true });
window.addEventListener('resize', render);
