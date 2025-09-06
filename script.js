(function () {
  const resultEl = document.getElementById('result');
  const historyEl = document.getElementById('history');
  const grid = document.querySelector('.grid');
  const modeToggle = document.getElementById('modeToggle');

  let expr = '';
  let lastResult = null;

  const THEME_KEY = 'calc-theme';
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark') document.documentElement.classList.add('dark');
  if (saved === 'light') document.documentElement.classList.add('light');
  updateModeButton();

  modeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    document.documentElement.classList.remove(isDark ? 'light' : 'dark');
    localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
    updateModeButton();
  });

  function updateModeButton() {
    const dark = document.documentElement.classList.contains('dark');
    modeToggle.textContent = dark ? '☀️ Light' : '🌙 Dark';
    modeToggle.setAttribute('aria-pressed', String(dark));
  }

  grid.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const { value } = btn.dataset;
    const action = btn.dataset.action;

    if (action === 'clear') return clearAll();
    if (action === 'backspace') return backspace();
    if (action === 'equals') return evaluate();
    if (value) return append(value);
  });

  window.addEventListener('keydown', (e) => {
    const k = e.key;
    if (/^[0-9]$/.test(k)) return append(k);
    if (k === '.') return append('.');
    if (k === '+') return append('+');
    if (k === '-') return append('-');
    if (k === '*') return append('*');
    if (k === '/') return append('/');
    if (k === 'Enter' || k === '=') { e.preventDefault(); return evaluate(); }
    if (k === 'Backspace') return backspace();
    if (k.toLowerCase() === 'c') return clearAll();
  });

  function append(ch) {
    if (ch === '.') {
      const lastNum = expr.split(/[+\-*/]/).pop();
      if (lastNum.includes('.')) return;
      if (lastNum === '') expr += '0';
    }

    if (/^[+\-*/]$/.test(ch)) {
      if (expr === '' && (ch === '*' || ch === '/')) return;
      if (/([+\-*/])$/.test(expr)) expr = expr.slice(0, -1);
    }

    expr += ch;
    render();
  }

  function backspace() {
    expr = expr.slice(0, -1);
    render();
  }

  function clearAll() {
    expr = '';
    lastResult = null;
    historyEl.textContent = '\u00A0';
    render();
  }

  function evaluate() {
    if (!expr) return;
    if (!/^[0-9+\-*/().\s]+$/.test(expr)) {
      return showError('Invalid input');
    }
    try {
      const safeExpr = expr.replace(/\u00F7/g, '/').replace(/\u00D7/g, '*');
      const value = Function(`"use strict"; return (${safeExpr})`)();
      if (!isFinite(value)) throw new Error('Math error');
      lastResult = value;
      historyEl.textContent = expr + ' =';
      expr = formatNumber(value);
      render();
    } catch (err) {
      showError('Math error');
    }
  }

  function formatNumber(num) {
    if (Number.isInteger(num)) return String(num);
    return Number(num.toPrecision(12)).toString();
  }

  function showError(msg) {
    resultEl.textContent = msg;
    resultEl.style.color = getComputedStyle(document.documentElement).getPropertyValue('--danger');
    resultEl.animate(
      [{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }],
      { duration: 180, iterations: 1 }
    );
    setTimeout(() => {
      resultEl.style.color = '';
      render();
    }, 700);
  }

  function render() {
    resultEl.textContent = expr || (lastResult != null ? formatNumber(lastResult) : '0');
  }

  render();
})();