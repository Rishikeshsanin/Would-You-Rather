(() => {
  const app = document.querySelector('#app');
  const questions = [...window.WYR_QUESTIONS];
  const API = (window.WYR_API_BASE || '').replace(/\/$/, '');
  let order = [];
  let cursor = 0;
  let answered = false;
  let currentStats = null;

  const esc = (v) => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const shuffle = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  function voterToken() {
    const key = 'wyr-voter-token';
    try {
      let token = localStorage.getItem(key);
      if (!token) {
        token = crypto.randomUUID();
        localStorage.setItem(key, token);
      }
      return token;
    } catch {
      return crypto.randomUUID();
    }
  }

  function home() {
    app.innerHTML = `
      <main class="home">
        <div class="home-grid"></div>
        <section class="home-card">
          <div class="logo"><i class="logo-dot"></i> one impossible choice</div>
          <h1><span>Would you</span>Rather?</h1>
          <p>Two options. No essays. Pick a side, then see how everyone else voted.</p>
          <button class="start-btn" id="start">Start choosing →</button>
          <small>${questions.length} questions · no login · just play</small>
        </section>
      </main>`;
    document.querySelector('#start').onclick = start;
  }

  function start() {
    order = shuffle(questions.map((_, i) => i));
    cursor = 0;
    renderQuestion();
  }

  function q() { return questions[order[cursor % order.length]]; }

  function localVote(questionId, side) {
    const key = `wyr-votes-${questionId}`;
    let stats = { red: 0, blue: 0 };
    try { stats = { ...stats, ...JSON.parse(localStorage.getItem(key) || '{}') }; } catch {}
    stats[side] += 1;
    try { localStorage.setItem(key, JSON.stringify(stats)); } catch {}
    return stats;
  }

  async function castVote(questionId, side) {
    if (API) {
      const response = await fetch(`${API}/vote`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ questionId, choice: side, voterToken: voterToken() })
      });
      if (!response.ok) throw new Error('Vote service unavailable');
      return response.json();
    }
    const stats = localVote(questionId, side);
    return { ...stats, mode: 'device' };
  }

  function percentages(stats) {
    const red = Number(stats.red || 0), blue = Number(stats.blue || 0), total = red + blue;
    if (!total) return { red: 50, blue: 50, total: 0 };
    const rp = Math.round((red / total) * 100);
    return { red: rp, blue: 100 - rp, total };
  }

  function renderQuestion() {
    answered = false;
    currentStats = null;
    const item = q();
    app.innerHTML = `
      <main class="game" id="game">
        <div class="game-top">
          <span class="counter">${String(cursor + 1).padStart(2,'0')} / ${questions.length}</span>
          <span class="mode">${API ? 'live crowd' : 'preview mode'}</span>
        </div>
        <div class="choice-wrap">
          <button class="choice red" data-side="red">
            <span class="option-text">${esc(item.red)}</span>
            <div class="result"><strong id="redPct">—</strong><span id="redVotes">votes hidden</span></div>
          </button>
          <button class="choice blue" data-side="blue">
            <span class="option-text">${esc(item.blue)}</span>
            <div class="result"><strong id="bluePct">—</strong><span id="blueVotes">votes hidden</span></div>
          </button>
        </div>
        <div class="or">OR</div>
        <div class="next-area"><button class="next-btn" id="next">Next question →</button></div>
        <div class="source-note" id="sourceNote">Choose first. Results appear after your vote.</div>
        <div class="toast" id="toast"></div>
      </main>`;
    document.querySelectorAll('.choice').forEach(b => b.onclick = () => choose(b.dataset.side));
    document.querySelector('#next').onclick = next;
  }

  async function choose(side) {
    if (answered) return;
    answered = true;
    const game = document.querySelector('#game');
    game.classList.add('answered');
    document.querySelector(`.choice.${side}`).classList.add('picked');
    try {
      currentStats = await castVote(q().id, side);
      const p = percentages(currentStats);
      animateNumber('#redPct', p.red);
      animateNumber('#bluePct', p.blue);
      document.querySelector('#redVotes').textContent = `${Number(currentStats.red || 0).toLocaleString()} votes`;
      document.querySelector('#blueVotes').textContent = `${Number(currentStats.blue || 0).toLocaleString()} votes`;
      document.querySelector('#sourceNote').textContent = currentStats.mode === 'device'
        ? 'Preview mode · these are real votes saved on this device only'
        : `${p.total.toLocaleString()} verified game votes · anonymous aggregate`;
    } catch (err) {
      answered = false;
      game.classList.remove('answered');
      document.querySelector(`.choice.${side}`).classList.remove('picked');
      toast('Could not record that vote. Try again.');
    }
  }

  function animateNumber(selector, target) {
    const el = document.querySelector(selector);
    const started = performance.now();
    const duration = 480;
    function tick(now) {
      const t = Math.min(1, (now - started) / duration);
      el.textContent = `${Math.round(target * (1 - Math.pow(1 - t, 3)))}%`;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function next() {
    cursor += 1;
    if (cursor >= order.length) order = shuffle(questions.map((_, i) => i)), cursor = 0;
    renderQuestion();
  }

  function toast(message) {
    const el = document.querySelector('#toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 1800);
  }

  home();
})();
