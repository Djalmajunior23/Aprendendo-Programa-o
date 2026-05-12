    if (nb) nb.disabled = false;
    saveProgress();
  }
}

/* ── LocalStorage ─────────────────────────── */
function saveProgress() {
  try {
    localStorage.setItem('prog_pseudo_v1', JSON.stringify({
      xp:         xpTotal,
      mods:       [...doneMods],
      challenges: [...doneChallenges],
    }));
  } catch(e) {}
}

function loadProgress() {
  try {
    const raw  = localStorage.getItem('prog_pseudo_v1');
    if (!raw) return;
    const data = JSON.parse(raw);

    if (data.xp) {
      xpTotal = data.xp;
      const el = document.getElementById('xp');
      if (el) el.textContent = '⭐ ' + xpTotal + ' XP';
    }

    if (Array.isArray(data.mods)) {
      data.mods.forEach(i => {
        doneMods.add(i);
        const b = document.getElementById('nav-' + i);
        if (b) b.classList.add('done');
      });
    }

    if (Array.isArray(data.challenges)) {
      data.challenges.forEach(i => {
        doneChallenges.add(i);
        const nb = document.getElementById('next-' + i);
        if (nb) nb.disabled = false;
      });
    }

    updateProgress();
  } catch(e) {}
}

/* ── Inicialização ─────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  loadProgress();

  // Suporte a Tab nos editores
  document.querySelectorAll('textarea.editor').forEach(ta => {
    ta.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      e.preventDefault();
      const s = ta.selectionStart;
      ta.value = ta.value.slice(0, s) + '   ' + ta.value.slice(ta.selectionEnd);
      ta.selectionStart = ta.selectionEnd = s + 3;
    });
  });
});