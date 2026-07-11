/**
 * Shared weather + location strip for Synth Desk and PBC Shift.
 * Fetches GET /pbc/weather from the local bridge (wttr.in → COGOBJ cache).
 */
(function (global) {
  const BRIDGE = global.PBC_BRIDGE_URL || 'http://127.0.0.1:7878';

  const CSS = `
  .pbc-wx-strip {
    display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
    border: 1px solid #2a2d31; background: #15171a;
    padding: 10px 14px; margin-bottom: 12px;
    font-size: 12px; color: #8a8e94;
  }
  .pbc-wx-emoji {
    font-size: 28px; line-height: 1; width: 36px; text-align: center;
    filter: drop-shadow(0 0 6px rgba(122, 174, 200, 0.25));
  }
  .pbc-wx-main { flex: 1; min-width: 160px; }
  .pbc-wx-loc {
    font-size: 13px; font-weight: 600; color: #e4e6ea; letter-spacing: 0.02em;
  }
  .pbc-wx-cond { margin-top: 2px; color: #7AAEC8; }
  .pbc-wx-meta { font-size: 11px; color: #5a5e64; margin-top: 2px; }
  .pbc-wx-clock {
    font-family: "Cascadia Code", Consolas, monospace;
    font-size: 12px; color: #d4a87e; text-align: right;
  }
  .pbc-wx-clock .date { color: #5a5e64; font-size: 10px; margin-top: 2px; }
  .pbc-wx-badge {
    font-size: 9px; letter-spacing: 0.08em; text-transform: uppercase;
    border: 1px solid #2a2d31; padding: 2px 6px; color: #5a5e64;
  }
  .pbc-wx-badge.live { color: #8ec3a0; border-color: #8ec3a0; }
  .pbc-wx-badge.cache { color: #7AAEC8; border-color: #4a6e80; }
  .pbc-wx-badge.err { color: #c87a7a; border-color: #c87a7a; }
  .pbc-wx-actions { display: flex; gap: 6px; }
  .pbc-wx-actions button {
    background: #1d2024; border: 1px solid #2a2d31; color: #8a8e94;
    font-size: 10px; padding: 4px 8px; cursor: pointer; letter-spacing: 0.04em;
  }
  .pbc-wx-actions button:hover { border-color: #7AAEC8; color: #7AAEC8; }
  `;

  function injectCss() {
    if (document.getElementById('pbc-wx-css')) return;
    const s = document.createElement('style');
    s.id = 'pbc-wx-css';
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function formatClock() {
    const d = new Date();
    return {
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      date: d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    };
  }

  function mount(container, opts) {
    injectCss();
    opts = opts || {};
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) return null;

    el.innerHTML = `
      <div class="pbc-wx-strip" id="pbc-wx-root">
        <div class="pbc-wx-emoji" id="pbc-wx-emoji">🌡️</div>
        <div class="pbc-wx-main">
          <div class="pbc-wx-loc" id="pbc-wx-loc">Local weather…</div>
          <div class="pbc-wx-cond" id="pbc-wx-cond">Listening for broadcast</div>
          <div class="pbc-wx-meta" id="pbc-wx-meta">source: wttr.in · COGOBJ cache via bridge</div>
        </div>
        <div class="pbc-wx-clock">
          <div id="pbc-wx-time">--:--:--</div>
          <div class="date" id="pbc-wx-date">—</div>
        </div>
        <span class="pbc-wx-badge" id="pbc-wx-badge">…</span>
        <div class="pbc-wx-actions">
          <button type="button" id="pbc-wx-refresh" title="Force refresh broadcast">↻</button>
        </div>
      </div>
    `;

    let location = opts.location || localStorage.getItem('pbc_weather_location') || '';
    let clockTimer = null;
    let pollTimer = null;

    function tickClock() {
      const c = formatClock();
      const t = el.querySelector('#pbc-wx-time');
      const d = el.querySelector('#pbc-wx-date');
      if (t) t.textContent = c.time;
      if (d) d.textContent = c.date;
    }

    async function refresh(force) {
      const badge = el.querySelector('#pbc-wx-badge');
      const locEl = el.querySelector('#pbc-wx-loc');
      const condEl = el.querySelector('#pbc-wx-cond');
      const metaEl = el.querySelector('#pbc-wx-meta');
      const emojiEl = el.querySelector('#pbc-wx-emoji');
      try {
        let url = BRIDGE + '/pbc/weather';
        const q = [];
        if (location) q.push('location=' + encodeURIComponent(location));
        if (force) q.push('force=1');
        if (q.length) url += '?' + q.join('&');
        const res = await fetch(url);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'HTTP ' + res.status);
        const w = data.weather || (data.cogobj && data.cogobj.weather) || {};
        emojiEl.textContent = w.emoji || '🌡️';
        locEl.textContent = w.location_label || [w.city, w.region].filter(Boolean).join(', ') || 'Local';
        const temp = w.temp_f != null ? w.temp_f + '°F' : '—';
        condEl.textContent = (w.condition || '—') + ' · ' + temp +
          (w.feels_like_f && w.feels_like_f !== w.temp_f ? ' (feels ' + w.feels_like_f + '°F)' : '');
        metaEl.textContent =
          'COGOBJ ' + ((data.cogobj && data.cogobj.id) || '—').toString().slice(0, 12) +
          '… · humidity ' + (w.humidity != null ? w.humidity + '%' : '—') +
          (data.cached ? ' · cache' : ' · live broadcast');
        badge.textContent = data.cached ? 'CACHE' : 'LIVE';
        badge.className = 'pbc-wx-badge ' + (data.cached ? 'cache' : 'live');
        if (typeof opts.onUpdate === 'function') opts.onUpdate(data);
        return data;
      } catch (e) {
        locEl.textContent = location || 'Local';
        condEl.textContent = 'Weather offline';
        metaEl.textContent = e.message || String(e);
        badge.textContent = 'OFF';
        badge.className = 'pbc-wx-badge err';
        emojiEl.textContent = '📡';
        return null;
      }
    }

    el.querySelector('#pbc-wx-refresh').addEventListener('click', () => refresh(true));

    // Optional: double-click location to set city
    el.querySelector('#pbc-wx-loc').addEventListener('dblclick', () => {
      const next = prompt('Weather location (city or city,ST — blank = auto IP)', location || '');
      if (next === null) return;
      location = next.trim();
      if (location) localStorage.setItem('pbc_weather_location', location);
      else localStorage.removeItem('pbc_weather_location');
      refresh(true);
    });

    tickClock();
    clockTimer = setInterval(tickClock, 1000);
    refresh(false);
    pollTimer = setInterval(() => refresh(false), opts.pollMs || 5 * 60 * 1000);

    return {
      refresh,
      setLocation(loc) {
        location = (loc || '').trim();
        if (location) localStorage.setItem('pbc_weather_location', location);
        else localStorage.removeItem('pbc_weather_location');
        return refresh(true);
      },
      destroy() {
        if (clockTimer) clearInterval(clockTimer);
        if (pollTimer) clearInterval(pollTimer);
      }
    };
  }

  global.PbcWeatherStrip = { mount };
})(typeof window !== 'undefined' ? window : globalThis);
