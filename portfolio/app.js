/* Portfólio · filtro por categoria.
   Sem JavaScript, todos os projetos aparecem e os filtros ficam escondidos.
   Dá para abrir já filtrado: #landing-pages, #e-commerce ou #outros. */
(function () {
  var NOMES = { landing: 'projetos de landing page', ecommerce: 'projetos de e-commerce', outros: 'outros projetos' };
  var HASH = { 'landing-pages': 'landing', 'e-commerce': 'ecommerce', 'outros': 'outros' };
  var box = document.querySelector('[data-filters]');
  var works = [].slice.call(document.querySelectorAll('[data-works] > .work'));
  var empty = document.querySelector('[data-empty]');
  var live = document.querySelector('[data-live]');
  if (!box) return;
  var buttons = [].slice.call(box.querySelectorAll('[data-filter]'));

  [].forEach.call(document.querySelectorAll('[data-ano]'), function (el) { el.textContent = new Date().getFullYear(); });

  function count(cat) {
    return cat === 'todos' ? works.length : works.filter(function (w) { return w.getAttribute('data-cat') === cat; }).length;
  }
  buttons.forEach(function (b) {
    var c = b.getAttribute('data-filter');
    b.querySelector('[data-count]').textContent = count(c);
  });

  function apply(cat, announce) {
    var n = 0;
    works.forEach(function (w) {
      var on = cat === 'todos' || w.getAttribute('data-cat') === cat;
      w.hidden = !on; if (on) n++;
    });
    buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-filter') === cat)); });
    empty.hidden = n > 0;
    if (!n) empty.textContent = 'Ainda não há ' + NOMES[cat] + ' por aqui. Em breve.';
    if (announce) live.textContent = n === 1 ? '1 projeto' : n + ' projetos';
  }

  buttons.forEach(function (b) {
    b.addEventListener('click', function () {
      var cat = b.getAttribute('data-filter');
      apply(cat, true);
      var h = Object.keys(HASH).filter(function (k) { return HASH[k] === cat; })[0];
      try { history.replaceState(null, '', h ? '#' + h : location.pathname); } catch (e) {}
    });
  });

  box.hidden = false;
  apply(HASH[location.hash.slice(1)] || 'todos', false);
  window.addEventListener('hashchange', function () {
    var cat = HASH[location.hash.slice(1)];
    if (cat) apply(cat, true);
  });
})();
