/* Muscle Strong · Landing page de orçamentos
   Sem dependências. Funciona também sem JavaScript (formulário envia direto para enviar.php). */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var WA_NUMBER = '5511959695458';
  var reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CFG = window.MS_TRACKING || {};

  var liveEl = $('[data-live]');
  function say(t) { if (!liveEl) return; liveEl.textContent = ''; setTimeout(function () { liveEl.textContent = t; }, 60); }

  var store = {
    get: function (k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* modo privado */ } }
  };

  /* ===================================================================
     1. CONSENTIMENTO DE COOKIES + TAGS DO GOOGLE (LGPD)
     Nada do Google é carregado antes do visitante aceitar.
     =================================================================== */
  var CONSENT_KEY = 'ms_consent';
  var CONSENT_VERSION = 1;
  var consent = store.get(CONSENT_KEY);
  if (!consent || consent.v !== CONSENT_VERSION) consent = null;

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('consent', 'default', {
    ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied',
    analytics_storage: 'denied', functionality_storage: 'denied', personalization_storage: 'denied',
    security_storage: 'granted'
  });
  gtag('set', 'ads_data_redaction', true);

  var tagScript = false, configured = {};
  function loadGoogleTag() {
    if (tagScript) return;
    var id = CFG.ga4 || CFG.googleAds;
    if (!id) return;
    tagScript = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    document.head.appendChild(s);
    gtag('js', new Date());
  }
  function applyConsent(c) {
    gtag('consent', 'update', {
      analytics_storage: c.analytics ? 'granted' : 'denied',
      ad_storage: c.marketing ? 'granted' : 'denied',
      ad_user_data: c.marketing ? 'granted' : 'denied',
      ad_personalization: c.marketing ? 'granted' : 'denied'
    });
    if (c.marketing) gtag('set', 'ads_data_redaction', false);
    if ((c.analytics && CFG.ga4) || (c.marketing && CFG.googleAds)) loadGoogleTag();
    if (c.analytics && CFG.ga4 && !configured.ga4) { gtag('config', CFG.ga4); configured.ga4 = true; }
    if (c.marketing && CFG.googleAds && !configured.ads) { gtag('config', CFG.googleAds); configured.ads = true; }
    if (!c.analytics) clearCookies(/^_ga/);
    if (!c.marketing) clearCookies(/^(_gcl|_gac|IDE|test_cookie)/);
  }
  function clearCookies(re) {
    document.cookie.split(';').forEach(function (part) {
      var name = part.split('=')[0].trim();
      if (!re.test(name)) return;
      var host = location.hostname.replace(/^www\./, '');
      ['', '; domain=' + host, '; domain=.' + host].forEach(function (d) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + d;
      });
    });
  }
  function track(name, params) {
    if (!tagScript) return;
    gtag('event', name, params || {});
  }
  function trackLead(proto, done) {
    var finished = false;
    function finish() { if (!finished) { finished = true; done(); } }
    if (!tagScript) { finish(); return; }
    if (consent && consent.analytics && CFG.ga4) gtag('event', 'generate_lead', { lead_source: 'formulario_orcamento' });
    if (consent && consent.marketing && CFG.googleAds && CFG.googleAdsLeadLabel) {
      gtag('event', 'conversion', { send_to: CFG.googleAds + '/' + CFG.googleAdsLeadLabel, transaction_id: proto, event_callback: finish });
      setTimeout(finish, 1200);
    } else {
      setTimeout(finish, 300);
    }
  }
  function trackWhatsClick() {
    if (consent && consent.marketing && CFG.googleAds && CFG.googleAdsWhatsLabel) {
      gtag('event', 'conversion', { send_to: CFG.googleAds + '/' + CFG.googleAdsWhatsLabel });
    }
    track('whatsapp_click', {});
  }

  var banner = $('[data-cookie]');
  var dlg = $('[data-cdlg]');
  function saveConsent(analytics, marketing) {
    consent = { v: CONSENT_VERSION, analytics: !!analytics, marketing: !!marketing, ts: new Date().toISOString() };
    store.set(CONSENT_KEY, consent);
    applyConsent(consent);
    if (banner) banner.hidden = true;
  }
  if (consent) applyConsent(consent); else if (banner) banner.hidden = false;

  function openPrefs() {
    if (!dlg) return;
    var a = $('input[name="analytics"]', dlg), m = $('input[name="marketing"]', dlg);
    a.checked = !!(consent && consent.analytics);
    m.checked = !!(consent && consent.marketing);
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
  }
  if (banner) {
    banner.addEventListener('click', function (e) {
      var b = e.target.closest('[data-ck]');
      if (!b) return;
      var act = b.getAttribute('data-ck');
      if (act === 'accept') saveConsent(true, true);
      else if (act === 'reject') saveConsent(false, false);
      else openPrefs();
    });
  }
  if (dlg) {
    dlg.addEventListener('close', function () {
      var v = dlg.returnValue;
      if (v === 'save') saveConsent($('input[name="analytics"]', dlg).checked, $('input[name="marketing"]', dlg).checked);
      else if (v === 'reject') saveConsent(false, false);
      dlg.returnValue = '';
    });
  }
  $$('[data-cookie-prefs]').forEach(function (b) { b.addEventListener('click', openPrefs); });

  /* Daqui para baixo: só na página principal */
  var form = $('#qform');

  /* ===================================================================
     2. TOPO, ANIMAÇÕES E REVELAÇÃO
     =================================================================== */
  var topbar = $('.topbar');
  function onScroll() { if (topbar) topbar.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var paused = reduceMotion;
  var pauseBtn = $('[data-pause]');
  if (pauseBtn) {
    if (reduceMotion) pauseBtn.hidden = true;
    pauseBtn.addEventListener('click', function () {
      paused = !paused;
      document.body.classList.toggle('is-paused', paused);
      pauseBtn.setAttribute('aria-pressed', String(paused));
      $('span', pauseBtn).textContent = paused ? 'Retomar animações' : 'Pausar animações';
    });
  }

  var words = $$('.rot__w');
  if (words.length > 1 && !reduceMotion) {
    var wi = 0;
    setInterval(function () {
      if (paused || document.hidden) return;
      var cur = words[wi];
      cur.classList.add('is-out');
      cur.classList.remove('is-on');
      wi = (wi + 1) % words.length;
      words[wi].classList.remove('is-out');
      words[wi].classList.add('is-on');
      setTimeout(function () { cur.classList.remove('is-out'); }, 400);
    }, 2400);
  }

  if ('IntersectionObserver' in window && !reduceMotion) {
    var rvs = $$('.rv').filter(function (el) { return el.getBoundingClientRect().top > window.innerHeight; });
    rvs.forEach(function (el) { el.classList.add('is-pre'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.remove('is-pre'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    rvs.forEach(function (el) { io.observe(el); });
  }

  /* ===================================================================
     3. ABAS ACESSÍVEIS (modelos e técnicas)
     =================================================================== */
  function setupTabs(list, onChange) {
    if (!list) return;
    var tabs = $$('[role="tab"]', list);
    function select(tab, focus, user) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        var p = document.getElementById(t.getAttribute('aria-controls'));
        if (p) p.hidden = !on;
      });
      if (focus) tab.focus();
      if (user) revealTab(tab);
      if (onChange) onChange(tab);
    }
    /* No celular as abas rolam de lado: traz a aba escolhida para dentro da tela */
    function revealTab(tab) {
      if (list.scrollWidth <= list.clientWidth + 1) return;
      var lr = list.getBoundingClientRect(), tr = tab.getBoundingClientRect();
      if (tr.left < lr.left + 12 || tr.right > lr.right - 44) {
        list.scrollTo({ left: list.scrollLeft + (tr.left - lr.left) - 20, behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t, false, true); });
      t.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') n = tabs[0];
        else if (e.key === 'End') n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n, true, true); }
      });
    });
    var start = tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0];
    select(start, false);
  }
  $$('.cat[data-hide]').forEach(function (p) { p.removeAttribute('data-hide'); });
  setupTabs($('.tabs[role="tablist"]'), function () { updateRailNav(); });
  setupTabs($('.tec__tabs'));

  function activeRail() {
    var p = $$('.cat').filter(function (c) { return !c.hidden; })[0];
    return p ? $('.rail', p) : null;
  }
  function updateRailNav() {
    var r = activeRail();
    if (!r) return;
    var max = r.scrollWidth - r.clientWidth - 4;
    var prev = $('[data-rail="-1"]'), next = $('[data-rail="1"]');
    if (prev) prev.disabled = r.scrollLeft <= 4;
    if (next) next.disabled = r.scrollLeft >= max;
  }
  $$('[data-rail]').forEach(function (b) {
    b.addEventListener('click', function () {
      var r = activeRail();
      if (!r) return;
      r.scrollBy({ left: Number(b.getAttribute('data-rail')) * r.clientWidth * 0.9, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });
  $$('.rail').forEach(function (r) { r.addEventListener('scroll', function () { updateRailNav(); }, { passive: true }); });
  window.addEventListener('resize', updateRailNav);
  updateRailNav();

  if (!form) return;

  /* ===================================================================
     4. ESTADO DO ORÇAMENTO (modelos, posições, formulário)
     =================================================================== */
  var models = [];            // [{name, peca}]
  var positions = [];         // ['peito', ...]

  function labelOf(input) {
    var lab = form.querySelector('label[for="' + input.id + '"]');
    if (!lab) return input.value;
    var span = lab.querySelector('span:last-child');
    var txt = span && span.firstChild ? span.firstChild.textContent : lab.textContent;
    return txt.trim();
  }
  function checkedLabels(name) {
    return $$('input[name="' + name + '"]:checked', form).map(labelOf);
  }
  var POS_LABEL = {};
  $$('[data-pos]').forEach(function (b) { POS_LABEL[b.getAttribute('data-pos')] = b.textContent.trim(); });

  /* ---- adicionar modelos do catálogo */
  var modelsBox = $('[data-models]', form);
  function renderModels() {
    $$('.mchip', modelsBox).forEach(function (c) { c.remove(); });
    var empty = $('[data-models-empty]', modelsBox);
    empty.hidden = models.length > 0;
    models.forEach(function (m) {
      var chip = document.createElement('span');
      chip.className = 'mchip';
      chip.appendChild(document.createTextNode(m.name));
      var x = document.createElement('button');
      x.type = 'button';
      x.setAttribute('aria-label', 'Remover ' + m.name + ' do orçamento');
      x.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';
      x.addEventListener('click', function () { toggleModel(m.name, m.peca, false); });
      chip.appendChild(x);
      modelsBox.appendChild(chip);
    });
    form.elements.modelos.value = models.map(function (m) { return m.name; }).join('|');
    updateDock();
    updatePreview();
  }
  function toggleModel(name, peca, force) {
    var idx = -1;
    models.forEach(function (m, i) { if (m.name === name) idx = i; });
    var add = typeof force === 'boolean' ? force : idx < 0;
    if (add && idx < 0) {
      models.push({ name: name, peca: peca });
      var cb = $('input[name="pecas[]"][value="' + peca + '"]', form);
      if (cb) cb.checked = true;
      say(name + ' adicionado ao orçamento. ' + models.length + (models.length === 1 ? ' modelo' : ' modelos') + ' no total.');
    } else if (!add && idx >= 0) {
      models.splice(idx, 1);
      say(name + ' removido do orçamento.');
    }
    $$('.add[data-model]').forEach(function (b) {
      if (b.getAttribute('data-model') === name) b.setAttribute('aria-pressed', String(add));
    });
    renderModels();
  }
  $$('.add[data-model]').forEach(function (b) {
    b.addEventListener('click', function () {
      toggleModel(b.getAttribute('data-model'), b.getAttribute('data-peca'));
      track('add_to_quote', { item_name: b.getAttribute('data-model') });
    });
  });

  /* ---- posições da logo */
  $$('[data-pos]').forEach(function (b) {
    b.addEventListener('click', function () {
      var k = b.getAttribute('data-pos');
      var on = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', String(on));
      if (on && positions.indexOf(k) < 0) positions.push(k);
      if (!on) positions = positions.filter(function (p) { return p !== k; });
      $$('.zone[data-zone="' + k + '"]').forEach(function (z) { z.classList.toggle('is-on', on); });
      form.elements.posicoes.value = positions.join('|');
      updatePreview();
    });
  });

  /* ---- atalhos de segmento */
  $$('[data-seg]').forEach(function (b) {
    b.addEventListener('click', function () {
      var r = $('input[name="segmento"][value="' + b.getAttribute('data-seg') + '"]', form);
      if (r) r.checked = true;
      updatePreview();
      document.getElementById('orcamento').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      setTimeout(function () { focusStep(); }, reduceMotion ? 0 : 500);
      say('Segmento ' + labelOf(r) + ' selecionado. Continue o pedido de orçamento.');
      track('cta_click', { cta_location: 'segmento_' + b.getAttribute('data-seg') });
    });
  });

  /* ===================================================================
     5. PRÉVIA DA MENSAGEM NO CELULAR
     =================================================================== */
  var preview = $('[data-preview]');
  function lines() {
    var L = [];
    L.push(['', 'Olá! Vim pelo site e quero um orçamento.']);
    L.push(['', '']);
    L.push(['Finalidade', checkedLabels('finalidade').join(', ')]);
    L.push(['Segmento', checkedLabels('segmento').join(', ')]);
    L.push(['Peças', checkedLabels('pecas[]').join(', ')]);
    if (models.length) L.push(['Modelos', models.map(function (m) { return m.name; }).join(', ')]);
    if (positions.length) L.push(['Logo em', positions.map(function (p) { return POS_LABEL[p]; }).join(', ')]);
    L.push(['Quantidade', checkedLabels('quantidade').join(', ')]);
    L.push(['Nome', form.elements.nome.value.trim()]);
    var emp = form.elements.empresa.value.trim();
    if (emp) L.push(['Empresa', emp]);
    return L;
  }
  function messageText(proto) {
    var t = lines().map(function (l) { return l[0] ? '*' + l[0] + ':* ' + l[1] : l[1]; }).join('\n');
    if (proto) t += '\n\n*Protocolo:* ' + proto;
    return t;
  }
  function updatePreview() {
    if (!preview) return;
    preview.textContent = '';
    lines().forEach(function (l, i) {
      if (i) preview.appendChild(document.createTextNode('\n'));
      if (!l[0]) { preview.appendChild(document.createTextNode(l[1])); return; }
      var b = document.createElement('b');
      b.textContent = l[0] + ': ';
      preview.appendChild(b);
      if (l[1]) preview.appendChild(document.createTextNode(l[1]));
      else { var ph = document.createElement('span'); ph.className = 'ph'; ph.textContent = '…'; preview.appendChild(ph); }
    });
    var caret = document.createElement('span'); caret.className = 'caret'; preview.appendChild(caret);
    var meta = document.createElement('span'); meta.className = 'bubble__meta';
    var d = new Date(); meta.textContent = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
    preview.appendChild(meta);
  }
  form.addEventListener('input', updatePreview);
  form.addEventListener('change', updatePreview);

  /* ===================================================================
     6. FORMULÁRIO EM ETAPAS
     =================================================================== */
  var steps = $$('.qstep', form);
  var cur = 0;
  var btnPrev = $('[data-prev]', form), btnNext = $('[data-next]', form), btnSend = $('[type="submit"]', form);
  var fill = $('.prog__fill', form), stepN = $('[data-stepn]', form), stepName = $('[data-stepname]', form);
  var stepLive = $('[data-steplive]', form);
  var formErr = $('[data-form-err]', form);

  function focusStep() {
    var lg = $('legend', steps[cur]);
    if (lg) lg.focus({ preventScroll: false });
  }
  function show(i, focus) {
    cur = Math.max(0, Math.min(steps.length - 1, i));
    steps.forEach(function (s, k) { s.classList.toggle('is-current', k === cur); });
    fill.style.width = ((cur + 1) / steps.length * 100) + '%';
    stepN.textContent = String(cur + 1);
    stepName.textContent = steps[cur].getAttribute('data-name');
    btnPrev.hidden = cur === 0;
    btnNext.hidden = cur === steps.length - 1;
    btnSend.classList.toggle('is-on', cur === steps.length - 1);
    if (focus) {
      stepLive.textContent = 'Etapa ' + (cur + 1) + ' de ' + steps.length + ': ' + steps[cur].getAttribute('data-name');
      focusStep();
      var top = form.getBoundingClientRect().top;
      if (top < 0) form.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }
  }

  function setErr(el, input, msg) {
    if (!el) return;
    el.textContent = msg || '';
    el.hidden = !msg;
    if (input) input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }
  var DDD = '11 12 13 14 15 16 17 18 19 21 22 24 27 28 31 32 33 34 35 37 38 41 42 43 44 45 46 47 48 49 51 53 54 55 61 62 63 64 65 66 67 68 69 71 73 74 75 77 79 81 82 83 84 85 86 87 88 89 91 92 93 94 95 96 97 98 99'.split(' ');
  function phoneOk(v) {
    var d = v.replace(/\D/g, '');
    if (d.length === 13 && d.indexOf('55') === 0) d = d.slice(2);
    if (d.length !== 10 && d.length !== 11) return false;
    if (DDD.indexOf(d.slice(0, 2)) < 0) return false;
    if (d.length === 11 && d[2] !== '9') return false;
    return true;
  }
  function validate(i) {
    var s = steps[i], n = i + 1, err = $('#err-' + n, form);
    if (n === 1 || n === 2 || n === 4) {
      var name = n === 1 ? 'finalidade' : n === 2 ? 'segmento' : 'quantidade';
      var ok = !!$('input[name="' + name + '"]:checked', form);
      setErr(err, null, ok ? '' : 'Escolha uma das opções para continuar.');
      if (!ok) $('input[name="' + name + '"]', s).focus();
      return ok;
    }
    if (n === 3) {
      var ok3 = $$('input[name="pecas[]"]:checked', form).length > 0;
      setErr(err, null, ok3 ? '' : 'Marque pelo menos um tipo de peça (ou “Ainda não sei”).');
      if (!ok3) $('input[name="pecas[]"]', s).focus();
      return ok3;
    }
    var first = null;
    var nome = form.elements.nome, wh = form.elements.whatsapp, ci = form.elements.ciente;
    var nv = nome.value.trim();
    var nmsg = nv.length < 2 ? 'Informe seu nome.' : '';
    setErr($('#e-nome', form), nome, nmsg); if (nmsg && !first) first = nome;
    var wmsg = !wh.value.trim() ? 'Informe seu WhatsApp com DDD.' : (!phoneOk(wh.value) ? 'Confira o número: DDD + número, ex.: (11) 91234-5678.' : '');
    setErr($('#e-whats', form), wh, wmsg); if (wmsg && !first) first = wh;
    var cmsg = ci.checked ? '' : 'Confirme que leu a Política de Privacidade.';
    setErr($('#e-ciente', form), ci, cmsg); if (cmsg && !first) first = ci;
    if (first) first.focus();
    return !first;
  }

  btnNext.addEventListener('click', function () { if (validate(cur)) show(cur + 1, true); });
  btnPrev.addEventListener('click', function () { show(cur - 1, true); });

  /* Avança sozinho ao tocar numa opção (só com mouse/toque; teclado continua manual) */
  var pointerAt = 0;
  form.addEventListener('pointerdown', function (e) { pointerAt = e.target.closest('.opt') ? Date.now() : 0; });
  form.addEventListener('change', function (e) {
    var t = e.target;
    if (t.type !== 'radio') return;
    var err = $('#err-' + (cur + 1), form); setErr(err, null, '');
    if (t.name === 'quantidade') $('[data-min-note]', form).hidden = t.value !== 'ate29';
    if (Date.now() - pointerAt < 800 && cur < steps.length - 1 && t.value !== 'ate29') {
      setTimeout(function () { if (validate(cur)) show(cur + 1, true); }, 280);
    }
  });
  form.addEventListener('change', function (e) {
    if (e.target.name === 'pecas[]') setErr($('#err-3', form), null, '');
  });

  /* Máscara do WhatsApp */
  var wh = form.elements.whatsapp;
  wh.addEventListener('input', function () {
    var d = wh.value.replace(/\D/g, '');
    if (d.length > 11 && d.indexOf('55') === 0) d = d.slice(2);
    d = d.slice(0, 11);
    var o = d;
    if (d.length > 2) o = '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length > 6) o = '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length === 11 ? 7 : 6) + '-' + d.slice(d.length === 11 ? 7 : 6);
    wh.value = o;
  });
  [form.elements.nome, wh, form.elements.ciente].forEach(function (el) {
    el.addEventListener(el.type === 'checkbox' ? 'change' : 'blur', function () {
      if (el.getAttribute('aria-invalid') === 'true') validate(steps.length - 1);
    });
  });

  /* UTM e tempo na página */
  var qs = new URLSearchParams(location.search);
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(function (k) {
    var v = qs.get(k);
    if (v) form.elements[k].value = v.slice(0, 100);
  });
  var t0 = Date.now();

  /* Envio */
  function waUrl(text) { return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(text); }
  function showFormError(msg, withFallback) {
    formErr.textContent = msg + ' ';
    if (withFallback) {
      var a = document.createElement('a');
      a.href = waUrl(messageText(''));
      a.rel = 'noopener';
      a.textContent = 'Enviar o pedido direto pelo WhatsApp';
      a.addEventListener('click', trackWhatsClick);
      formErr.appendChild(a);
    }
    formErr.hidden = false;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    formErr.hidden = true;
    if (cur < steps.length - 1) { if (validate(cur)) show(cur + 1, true); return; }
    for (var i = 0; i < steps.length; i++) {
      if (!validate(i)) { if (i !== cur) { show(i, true); validate(i); } return; }
    }
    form.elements.tempo.value = String(Math.round((Date.now() - t0) / 1000));
    form.elements.gclid.value = (consent && consent.marketing) ? (qs.get('gclid') || '').slice(0, 150) : '';

    var label = btnSend.innerHTML;
    btnSend.disabled = true;
    form.setAttribute('aria-busy', 'true');
    btnSend.textContent = 'Enviando…';

    fetch(form.getAttribute('action'), {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json', 'X-Requested-With': 'fetch' },
      credentials: 'same-origin'
    }).then(function (r) {
      return r.json().catch(function () { return { ok: false, erro: 'Não conseguimos registrar o pedido agora.' }; });
    }).then(function (res) {
      btnSend.disabled = false; btnSend.innerHTML = label; form.removeAttribute('aria-busy');
      if (!res || !res.ok) {
        if (res && res.campos) {
          show(steps.length - 1, false);
          if (res.campos.nome) setErr($('#e-nome', form), form.elements.nome, res.campos.nome);
          if (res.campos.whatsapp) setErr($('#e-whats', form), wh, res.campos.whatsapp);
        }
        showFormError((res && res.erro) || 'Não conseguimos enviar agora.', true);
        return;
      }
      var done = $('[data-done]', form);
      $('[data-proto]', done).textContent = res.protocolo;
      var link = $('[data-wa]', done);
      link.href = res.whatsapp;
      link.addEventListener('click', trackWhatsClick);
      form.classList.add('is-done');
      done.hidden = false;
      done.focus();
      say('Pedido recebido. Protocolo ' + res.protocolo + '. Abrindo o WhatsApp.');
      trackLead(res.protocolo, function () {
        setTimeout(function () { window.location.href = res.whatsapp; }, 900);
      });
    }).catch(function () {
      btnSend.disabled = false; btnSend.innerHTML = label; form.removeAttribute('aria-busy');
      showFormError('Sem conexão com o servidor.', true);
    });
  });

  /* ===================================================================
     7. BARRA FLUTUANTE
     =================================================================== */
  var dock = $('[data-dock]');
  var heroGone = false, formSeen = false, endSeen = false;
  function updateDock() {
    if (!dock) return;
    var on = heroGone && !formSeen && !endSeen;
    dock.classList.toggle('is-on', on);
    dock.setAttribute('aria-hidden', String(!on));
    $('a', dock).tabIndex = on ? 0 : -1;
    var c = $('[data-dock-count]', dock), l = $('[data-dock-label]', dock);
    c.hidden = models.length === 0;
    c.textContent = String(models.length);
    l.textContent = models.length === 0 ? 'Orçamento pelo WhatsApp' : (models.length === 1 ? 'modelo no orçamento' : 'modelos no orçamento');
  }
  if ('IntersectionObserver' in window && dock) {
    var hero = $('.hero'), quote = $('#orcamento'), fin = $('.final'), foot = $('.foot');
    var endVis = [false, false];   /* chamada final e rodapé: lá o botão flutuante some */
    new IntersectionObserver(function (en) { heroGone = !en[0].isIntersecting; updateDock(); }).observe(hero);
    new IntersectionObserver(function (en) { formSeen = en[0].isIntersecting; updateDock(); }, { threshold: 0.05 }).observe(quote);
    var endIO = new IntersectionObserver(function (en) {
      en.forEach(function (e) { endVis[e.target === fin ? 0 : 1] = e.isIntersecting; });
      endSeen = endVis[0] || endVis[1]; updateDock();
    });
    endIO.observe(fin); if (foot) endIO.observe(foot);
  }

  /* Cliques nos botões de chamada */
  $$('[data-cta]').forEach(function (a) {
    a.addEventListener('click', function () { track('cta_click', { cta_location: a.getAttribute('data-cta') }); });
  });

  show(0, false);
  updatePreview();
  updateDock();
})();
