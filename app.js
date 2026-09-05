(() => {
  const app = document.querySelector('#app');
  const questions = [...window.WYR_QUESTIONS];
  let order = [];
  let cursor = 0;
  let answered = false;

  const esc = (v) => String(v).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));

  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  function home() {
    app.innerHTML = `
      <main class="home">
        <div class="home-grid"></div>
        <section class="home-card">
          <div class="logo"><i class="logo-dot"></i> one impossible choice</div>
          <h1><span>Would you</span>Rather?</h1>
          <p>Two options. No essays. Pick a side, then see how historical voters split.</p>
          <button class="start-btn" id="start">Start choosing →</button>
          <small>${questions.length} questions · no login · nothing is recorded</small>
        </section>
      </main>`;
    document.querySelector('#start').onclick = start;
  }

  function start() {
    order = shuffle(questions.map((_, i) => i));
    cursor = 0;
    renderQuestion();
  }

  function q() {
    return questions[order[cursor % order.length]];
  }

  function stats(item) {
    const redVotes = Number(item.redVotes);
    const blueVotes = Number(item.blueVotes);
    const total = redVotes + blueVotes;
    const redPct = total ? Math.round((redVotes / total) * 100) : 50;
    return { redVotes, blueVotes, total, redPct, bluePct: 100 - redPct };
  }

  function renderQuestion() {
    answered = false;
    const item = q();

    app.innerHTML = `
      <main class="game" id="game">
        <div class="game-top">
          <span class="counter">${String(cursor + 1).padStart(2,'0')} / ${questions.length}</span>
          <span class="mode">historical crowd data</span>
        </div>

        <div class="choice-wrap">
          <button class="choice red" data-side="red" aria-label="${esc(item.red)}">
            <span class="option-text">${esc(item.red)}</span>
            <div class="result">
              <strong id="redPct">—</strong>
              <span id="redVotes">votes hidden</span>
            </div>
          </button>

          <button class="choice blue" data-side="blue" aria-label="${esc(item.blue)}">
            <span class="option-text">${esc(item.blue)}</span>
            <div class="result">
              <strong id="bluePct">—</strong>
              <span id="blueVotes">votes hidden</span>
            </div>
          </button>
        </div>

        <div class="or">OR</div>
        <div class="next-area"><button class="next-btn" id="next">Next question →</button></div>
        <div class="source-note" id="sourceNote">Choose first. Historical results appear after your pick.</div>
      </main>`;

    document.querySelectorAll('.choice').forEach(button => {
      button.onclick = () => choose(button.dataset.side);
    });
    document.querySelector('#next').onclick = next;
  }

  function choose(side) {
    if (answered) return;
    answered = true;

    const item = q();
    const result = stats(item);
    const game = document.querySelector('#game');

    game.classList.add('answered');
    document.querySelector(`.choice.${side}`).classList.add('picked');

    animateNumber('#redPct', result.redPct);
    animateNumber('#bluePct', result.bluePct);

    document.querySelector('#redVotes').textContent =
      `${result.redVotes.toLocaleString()} historical votes`;
    document.querySelector('#blueVotes').textContent =
      `${result.blueVotes.toLocaleString()} historical votes`;
    document.querySelector('#sourceNote').textContent =
      `${result.total.toLocaleString()} recorded human votes · historical snapshot · your choice is not recorded`;
  }

  function animateNumber(selector, target) {
    const el = document.querySelector(selector);
    const started = performance.now();
    const duration = 480;

    function tick(now) {
      const t = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = `${Math.round(target * eased)}%`;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function next() {
    cursor += 1;
    if (cursor >= order.length) {
      order = shuffle(questions.map((_, i) => i));
      cursor = 0;
    }
    renderQuestion();
  }

  home();
})();
