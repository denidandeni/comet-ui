/*! Comet UI behaviour. No dependencies, no build step.
 *
 *   <script src="comet.js" defer></script>
 *
 * Everything works from data attributes and class names, so plain HTML pages need no code.
 * Content added later: call CometUI.init(container). Toasts: CometUI.toast({...}).
 *
 * Covers: dialog + drawer (open/close), dropdown, accordion, combobox, password toggle,
 * topbar menu, app shell sidebar, dismissible alerts, searchbar, quantity input, file upload,
 * datepicker, toast, tabs, OTP input and data table (sort, filter, paginate).
 */
(function () {
  'use strict';

  var VERSION = '1.2.0';

  // Server-side rendering (Next.js, Node): export no-ops so importing the package never throws.
  if (typeof document === 'undefined') {
    var noop = function () {};
    var stub = { version: VERSION, init: noop, toast: Object.assign(function () { return { dismiss: noop }; }, { position: noop, clear: noop }) };
    if (typeof module !== 'undefined' && module.exports) module.exports = stub;
    return;
  }

  var doc = document;

  // ---------- helpers ----------
  function q(sel, root) { return (root || doc).querySelector(sel); }
  function qa(sel, root) { return Array.prototype.slice.call((root || doc).querySelectorAll(sel)); }
  function num(v, fallback) { var n = parseFloat(v); return isNaN(n) ? fallback : n; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function emit(el, name, detail) { el.dispatchEvent(new CustomEvent(name, { bubbles: true, detail: detail })); }
  function el(tag, cls, text) {
    var n = doc.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function reducedMotion() { return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }

  var ICONS = {
    close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    left: '<path d="m15 18-6-6 6-6"/>',
    right: '<path d="m9 18 6-6-6-6"/>',
    file: '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><path d="M14 2v6h6"/>',
    success: '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>',
    warning: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/>',
    destructive: '<circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>'
  };
  function icon(name, cls) {
    return '<svg class="cu-icon ' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[name] + '</svg>';
  }
  // Small glyphs drawn inside the filled toast badge.
  var TOAST_GLYPHS = {
    default: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    success: '<path d="M20 6 9 17l-5-5"/>',
    warning: '<path d="M12 8v5M12 17h.01"/>',
    destructive: '<path d="M18 6 6 18M6 6l12 12"/>',
    info: '<path d="M12 16v-5M12 8h.01"/>'
  };
  function toastGlyph(name) {
    return '<svg class="cu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (TOAST_GLYPHS[name] || TOAST_GLYPHS.default) + '</svg>';
  }

  // ---------- dialog + drawer ----------
  function resolveTarget(v) { return v ? doc.getElementById(v.replace(/^#/, '')) : null; }

  function onDialogClick(e) {
    var opener = e.target.closest('[data-cu-open]');
    if (opener) {
      var d = resolveTarget(opener.getAttribute('data-cu-open'));
      if (d && typeof d.showModal === 'function' && !d.open) d.showModal();
      return true;
    }
    var closer = e.target.closest('[data-cu-close]');
    if (closer) {
      var host = closer.closest('dialog');
      if (host) host.close();
      return true;
    }
    // Click on the backdrop (outside the box) closes. Add data-cu-static to opt out.
    var t = e.target;
    if (t.tagName === 'DIALOG' && t.open && !t.hasAttribute('data-cu-static')) {
      var r = t.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) t.close();
    }
    return false;
  }

  // ---------- dropdown ----------
  function closeDropdowns(except) {
    qa('.cu-dropdown.is-open').forEach(function (dd) {
      if (dd !== except) setDropdown(dd, false);
    });
  }
  function dropdownTrigger(dd) {
    var kids = Array.prototype.slice.call(dd.children);
    return kids.filter(function (k) { return !k.classList.contains('cu-dropdown-menu'); })[0];
  }
  function setDropdown(dd, open) {
    dd.classList.toggle('is-open', open);
    var t = dropdownTrigger(dd);
    if (t) t.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  function onDropdownClick(e) {
    var dd = e.target.closest('.cu-dropdown');
    closeDropdowns(dd);
    if (!dd || dd.classList.contains('cu-dropdown-hover')) return;
    var menu = q('.cu-dropdown-menu', dd);
    if (!menu) return;
    if (!menu.contains(e.target)) {
      var open = !dd.classList.contains('is-open');
      setDropdown(dd, open);
      if (open) { var first = q('[role^="menuitem"]:not(:disabled)', menu); if (first && e.detail === 0) first.focus(); }
    } else if (e.target.closest('.cu-dropdown-item')) {
      setDropdown(dd, false);
    }
  }
  function onDropdownKey(e) {
    var dd = e.target.closest && e.target.closest('.cu-dropdown');
    if (e.key === 'Escape') {
      var openDd = dd && dd.classList.contains('is-open') ? dd : q('.cu-dropdown.is-open');
      if (openDd) { setDropdown(openDd, false); var t = dropdownTrigger(openDd); if (t) t.focus(); }
      return;
    }
    if (!dd || (e.key !== 'ArrowDown' && e.key !== 'ArrowUp')) return;
    var items = qa('[role^="menuitem"]:not(:disabled)', dd);
    if (!items.length) return;
    if (!dd.classList.contains('is-open') && !dd.classList.contains('cu-dropdown-hover')) { setDropdown(dd, true); }
    e.preventDefault();
    var i = items.indexOf(doc.activeElement);
    i = e.key === 'ArrowDown' ? (i + 1) % items.length : (i <= 0 ? items.length - 1 : i - 1);
    items[i].focus();
  }

  // ---------- accordion ----------
  function onAccordionClick(e) {
    var h = e.target.closest('.cu-accordion-header');
    if (!h) return false;
    var open = h.parentElement.classList.toggle('is-open');
    h.setAttribute('aria-expanded', open ? 'true' : 'false');
    return true;
  }

  // ---------- combobox ----------
  function onComboboxClick(e) {
    var trigger = e.target.closest('.cu-combobox-trigger');
    if (trigger) { trigger.parentElement.classList.toggle('is-open'); }
    if (!e.target.closest('.cu-combobox')) {
      qa('.cu-combobox.is-open').forEach(function (c) { c.classList.remove('is-open'); });
    }
    var item = e.target.closest('.cu-combobox-item');
    if (!item) return;
    var box = item.closest('.cu-combobox');
    if (q('.cu-combobox-tag', box)) {
      item.classList.toggle('is-selected');
      return;
    }
    qa('.cu-combobox-item', box).forEach(function (i) { i.classList.remove('is-selected'); });
    item.classList.add('is-selected');
    var trig = q('.cu-combobox-trigger', box);
    var content = q('.cu-flex', item) || q('span:not(.check-icon)', item);
    if (trig && content) {
      trig.innerHTML = '';
      trig.appendChild(content.cloneNode(true));
      var unfold = el('span', 'material-symbols-outlined', 'unfold_more');
      trig.appendChild(unfold);
    }
    box.classList.remove('is-open');
  }
  function onComboboxInput(e) {
    if (!e.target.matches('.cu-combobox-search input')) return false;
    var term = e.target.value.toLowerCase().trim();
    var list = q('.cu-combobox-list', e.target.closest('.cu-combobox-popover'));
    if (!list) return true;
    qa('.cu-combobox-item', list).forEach(function (item) {
      var clone = item.cloneNode(true);
      var chk = q('.check-icon', clone);
      if (chk) chk.remove();
      item.style.display = clone.textContent.toLowerCase().indexOf(term) > -1 ? 'flex' : 'none';
    });
    qa('.cu-combobox-group', list).forEach(function (group) {
      var sib = group.nextElementSibling, any = false;
      while (sib && !sib.classList.contains('cu-combobox-group')) {
        if (sib.style.display !== 'none') { any = true; break; }
        sib = sib.nextElementSibling;
      }
      group.style.display = any ? 'block' : 'none';
    });
    return true;
  }

  // ---------- small controls ----------
  function onPasswordToggle(e) {
    var t = e.target.closest('.cu-password-toggle');
    if (!t) return false;
    var input = q('input', t.parentElement);
    var glyph = q('.material-symbols-outlined', t);
    if (!input) return true;
    var show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    if (glyph) glyph.textContent = show ? 'visibility_off' : 'visibility';
    return true;
  }
  function onTopbarToggle(e) {
    var t = e.target.closest('.cu-topbar-toggle');
    if (!t) return false;
    var bar = t.closest('.cu-topbar');
    var open = bar.classList.toggle('is-open');
    t.setAttribute('aria-expanded', open ? 'true' : 'false');
    return true;
  }
  function removeAnimated(node) {
    if (reducedMotion()) { node.remove(); return; }
    node.classList.add('is-leaving');
    setTimeout(function () { node.remove(); }, 220);
  }
  function onDismiss(e) {
    var b = e.target.closest('[data-cu-dismiss]');
    if (!b) return false;
    var target = b.closest('.cu-alert, .cu-toast');
    if (target) { removeAnimated(target); emit(target, 'cu:dismiss'); }
    return true;
  }

  // ---------- searchbar ----------
  function syncSearchbar(bar) {
    var input = q('.cu-searchbar-input', bar);
    if (input) bar.classList.toggle('has-value', input.value.length > 0);
  }
  function onSearchbarInput(e) {
    var bar = e.target.closest && e.target.closest('.cu-searchbar');
    if (bar && e.target.matches('.cu-searchbar-input')) syncSearchbar(bar);
  }
  function onSearchbarClick(e) {
    var clear = e.target.closest('.cu-searchbar-clear');
    if (!clear) return false;
    var bar = clear.closest('.cu-searchbar');
    var input = q('.cu-searchbar-input', bar);
    input.value = '';
    syncSearchbar(bar);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    emit(bar, 'cu:search', { value: '' });
    input.focus();
    return true;
  }
  function onSearchbarKey(e) {
    if (e.key === 'Enter' && e.target.matches('.cu-searchbar-input')) {
      emit(e.target.closest('.cu-searchbar'), 'cu:search', { value: e.target.value });
    }
  }

  // ---------- quantity input ----------
  function decimals(n) { var s = String(n); var i = s.indexOf('.'); return i < 0 ? 0 : s.length - i - 1; }
  function syncQuantity(wrap) {
    var input = q('.cu-quantity-input', wrap);
    var min = num(input.min, -Infinity), max = num(input.max, Infinity);
    var v = num(input.value, isFinite(min) ? min : 0);
    v = Math.min(max, Math.max(min, v));
    input.value = v;
    var dec = q('[data-cu-quantity="dec"]', wrap), inc = q('[data-cu-quantity="inc"]', wrap);
    if (dec) dec.disabled = input.disabled || v <= min;
    if (inc) inc.disabled = input.disabled || v >= max;
  }
  function onQuantityClick(e) {
    var b = e.target.closest('[data-cu-quantity]');
    if (!b) return false;
    var wrap = b.closest('.cu-quantity');
    var input = q('.cu-quantity-input', wrap);
    var step = num(input.step, 1) || 1;
    var cur = num(input.value, 0);
    var next = cur + (b.getAttribute('data-cu-quantity') === 'inc' ? step : -step);
    input.value = Number(next.toFixed(Math.max(decimals(step), decimals(cur))));
    syncQuantity(wrap);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }
  function onQuantityChange(e) {
    if (e.target.matches('.cu-quantity-input')) syncQuantity(e.target.closest('.cu-quantity'));
  }

  // ---------- file upload ----------
  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(bytes < 10240 ? 1 : 0) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }
  function acceptsFile(file, accept) {
    if (!accept) return true;
    var name = file.name.toLowerCase(), type = (file.type || '').toLowerCase();
    return accept.split(',').some(function (raw) {
      var a = raw.trim().toLowerCase();
      if (!a) return false;
      if (a.charAt(0) === '.') return name.slice(-a.length) === a;
      if (a.slice(-2) === '/*') return type.indexOf(a.slice(0, -1)) === 0;
      return type === a;
    });
  }
  function fuState(wrap) {
    if (!wrap._cuFiles) wrap._cuFiles = { files: [], errors: [] };
    return wrap._cuFiles;
  }
  function fuRender(wrap) {
    var st = fuState(wrap), list = q('.cu-file-list', wrap);
    if (!list) return;
    list.innerHTML = '';
    st.errors.forEach(function (er) {
      var li = el('li', 'cu-file-item is-error');
      li.innerHTML = icon('file');
      var info = el('div', 'cu-file-info');
      info.appendChild(el('span', 'cu-file-name', er.name));
      info.appendChild(el('span', 'cu-file-meta', er.message));
      li.appendChild(info);
      list.appendChild(li);
    });
    st.files.forEach(function (f, i) {
      var li = el('li', 'cu-file-item');
      li.innerHTML = icon('file');
      var info = el('div', 'cu-file-info');
      info.appendChild(el('span', 'cu-file-name', f.name));
      info.appendChild(el('span', 'cu-file-meta', formatSize(f.size)));
      li.appendChild(info);
      var rm = el('button', 'cu-file-remove');
      rm.type = 'button';
      rm.setAttribute('data-cu-file-remove', String(i));
      rm.setAttribute('aria-label', 'Remove ' + f.name);
      rm.innerHTML = icon('close', 'cu-icon-xs');
      li.appendChild(rm);
      list.appendChild(li);
    });
  }
  function fuSync(wrap) {
    var input = q('input[type="file"]', wrap), st = fuState(wrap);
    try {
      var dt = new DataTransfer();
      st.files.forEach(function (f) { dt.items.add(f); });
      input.files = dt.files;
    } catch (err) { /* older browsers: the list still works, the input keeps its own files */ }
    fuRender(wrap);
    emit(wrap, 'cu:files', { files: st.files.slice(), errors: st.errors.slice() });
  }
  function fuAdd(wrap, fileList) {
    var input = q('input[type="file"]', wrap), st = fuState(wrap);
    var accept = input.getAttribute('accept');
    var maxSize = num(wrap.getAttribute('data-cu-max-size'), Infinity);
    var maxFiles = input.multiple ? num(wrap.getAttribute('data-cu-max-files'), Infinity) : 1;
    st.errors = [];
    if (!input.multiple) st.files = [];
    Array.prototype.slice.call(fileList).forEach(function (f) {
      if (!acceptsFile(f, accept)) st.errors.push({ name: f.name, message: 'File type is not allowed' });
      else if (f.size > maxSize) st.errors.push({ name: f.name, message: 'Larger than ' + formatSize(maxSize) });
      else if (st.files.length >= maxFiles) st.errors.push({ name: f.name, message: 'Limit of ' + maxFiles + ' files reached' });
      else st.files.push(f);
    });
    fuSync(wrap);
  }
  function onFileChange(e) {
    if (!e.target.matches('[data-cu-file-upload] input[type="file"]')) return;
    var wrap = e.target.closest('[data-cu-file-upload]');
    // The input already holds the chosen files; rebuild our list from them.
    var chosen = Array.prototype.slice.call(e.target.files);
    var st = fuState(wrap);
    var keep = e.target.multiple ? st.files.slice() : [];
    // Browsers replace input.files on every pick, so merge with what we already kept.
    var seen = {};
    keep.forEach(function (f) { seen[f.name + f.size + f.lastModified] = true; });
    var fresh = chosen.filter(function (f) { return !seen[f.name + f.size + f.lastModified]; });
    st.files = keep;
    fuAdd(wrap, fresh);
  }
  function onFileDrag(e) {
    var zone = e.target.closest && e.target.closest('.cu-file-dropzone');
    if (!zone || !zone.closest('[data-cu-file-upload]')) return;
    if (e.type === 'dragover' || e.type === 'dragenter') { e.preventDefault(); zone.classList.add('is-dragover'); }
    else if (e.type === 'dragleave') { zone.classList.remove('is-dragover'); }
    else if (e.type === 'drop') {
      e.preventDefault();
      zone.classList.remove('is-dragover');
      fuAdd(zone.closest('[data-cu-file-upload]'), e.dataTransfer.files);
    }
  }
  function onFileRemove(e) {
    var b = e.target.closest('[data-cu-file-remove]');
    if (!b) return false;
    var wrap = b.closest('[data-cu-file-upload]');
    var st = fuState(wrap);
    st.files.splice(num(b.getAttribute('data-cu-file-remove'), -1), 1);
    st.errors = [];
    fuSync(wrap);
    return true;
  }

  // ---------- datepicker ----------
  function toISO(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function parseISO(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((s || '').trim());
    if (!m) return null;
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    return d.getFullYear() === +m[1] && d.getMonth() === +m[2] - 1 && d.getDate() === +m[3] ? d : null;
  }
  function addDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
  function addMonths(d, n) {
    var t = new Date(d.getFullYear(), d.getMonth() + n, 1);
    var last = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate();
    return new Date(t.getFullYear(), t.getMonth(), Math.min(d.getDate(), last));
  }
  function sameDay(a, b) { return !!a && !!b && toISO(a) === toISO(b); }

  function dpInit(root) {
    qa('[data-cu-datepicker]', root).forEach(function (host) {
      if (host._cuDp) return;
      var input = q('input', host);
      if (!input) return;
      var locale = doc.documentElement.lang || undefined;
      var weekStart = num(host.getAttribute('data-cu-week-start'), 1);
      var min = parseISO(host.getAttribute('data-cu-min'));
      var max = parseISO(host.getAttribute('data-cu-max'));
      var st = { selected: parseISO(input.value), view: null, focus: null };
      host._cuDp = st;

      var toggle = q('.cu-datepicker-toggle', host);
      if (!toggle) {
        toggle = el('button', 'cu-datepicker-toggle');
        toggle.type = 'button';
        toggle.setAttribute('aria-label', 'Choose date');
        toggle.innerHTML = '<svg class="cu-icon cu-icon-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>';
        host.appendChild(toggle);
      }
      toggle.setAttribute('aria-haspopup', 'dialog');
      toggle.setAttribute('aria-expanded', 'false');

      var pop = el('div', 'cu-datepicker-popover');
      pop.setAttribute('role', 'dialog');
      pop.setAttribute('aria-label', 'Choose date');
      host.appendChild(pop);

      var monthFmt = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' });
      var dayFmt = new Intl.DateTimeFormat(locale, { dateStyle: 'full' });
      var wdFmt = new Intl.DateTimeFormat(locale, { weekday: 'short' });
      function inRange(d) { return (!min || d >= min) && (!max || d <= max); }

      function render(focusAfter) {
        var view = st.view, today = new Date();
        pop.innerHTML = '';
        var head = el('div', 'cu-datepicker-header');
        var prev = el('button', 'cu-datepicker-nav'); prev.type = 'button'; prev.setAttribute('data-dp', 'prev'); prev.setAttribute('aria-label', 'Previous month'); prev.innerHTML = icon('left', 'cu-icon-xs');
        var next = el('button', 'cu-datepicker-nav'); next.type = 'button'; next.setAttribute('data-dp', 'next'); next.setAttribute('aria-label', 'Next month'); next.innerHTML = icon('right', 'cu-icon-xs');
        var title = el('div', 'cu-datepicker-title', monthFmt.format(view)); title.setAttribute('aria-live', 'polite');
        head.appendChild(prev); head.appendChild(title); head.appendChild(next);
        pop.appendChild(head);

        var grid = el('div', 'cu-datepicker-grid'); grid.setAttribute('role', 'grid');
        for (var w = 0; w < 7; w++) {
          var wd = new Date(2023, 0, 1 + ((weekStart + w) % 7)); // 2023-01-01 is a Sunday
          grid.appendChild(el('div', 'cu-datepicker-weekday', wdFmt.format(wd)));
        }
        var first = new Date(view.getFullYear(), view.getMonth(), 1);
        var lead = (first.getDay() - weekStart + 7) % 7;
        var cursor = addDays(first, -lead);
        for (var i = 0; i < 42; i++) {
          var day = cursor;
          var b = el('button', 'cu-datepicker-day', String(day.getDate()));
          b.type = 'button';
          b.setAttribute('data-date', toISO(day));
          b.setAttribute('aria-label', dayFmt.format(day));
          if (day.getMonth() !== view.getMonth()) b.classList.add('is-outside');
          if (sameDay(day, today)) b.setAttribute('aria-current', 'date');
          if (sameDay(day, st.selected)) b.setAttribute('aria-selected', 'true');
          if (!inRange(day)) b.disabled = true;
          b.tabIndex = sameDay(day, st.focus) ? 0 : -1;
          grid.appendChild(b);
          cursor = addDays(cursor, 1);
        }
        pop.appendChild(grid);

        var foot = el('div', 'cu-datepicker-footer');
        var todayBtn = el('button', 'cu-btn cu-btn-ghost cu-btn-sm', 'Today'); todayBtn.type = 'button'; todayBtn.setAttribute('data-dp', 'today');
        if (!inRange(today)) todayBtn.disabled = true;
        var clearBtn = el('button', 'cu-btn cu-btn-ghost cu-btn-sm', 'Clear'); clearBtn.type = 'button'; clearBtn.setAttribute('data-dp', 'clear');
        foot.appendChild(todayBtn); foot.appendChild(clearBtn);
        pop.appendChild(foot);
        if (focusAfter) { var f = q('.cu-datepicker-day[tabindex="0"]', pop); if (f) f.focus(); }
      }
      function open() {
        closeDatepickers(host);
        var start = st.selected || new Date();
        if (min && start < min) start = min;
        if (max && start > max) start = max;
        st.view = new Date(start.getFullYear(), start.getMonth(), 1);
        st.focus = start;
        host.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
        render(true);
      }
      function close(returnFocus) {
        host.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        if (returnFocus) input.focus();
      }
      function choose(d) {
        if (!inRange(d)) return;
        st.selected = d;
        input.value = toISO(d);
        input.removeAttribute('aria-invalid');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        emit(host, 'cu:date', { value: toISO(d), date: d });
        close(true);
      }
      function moveFocus(d) {
        st.focus = d;
        if (d.getMonth() !== st.view.getMonth() || d.getFullYear() !== st.view.getFullYear()) st.view = new Date(d.getFullYear(), d.getMonth(), 1);
        render(true);
      }

      toggle.addEventListener('click', function () { host.classList.contains('is-open') ? close(false) : open(); });
      input.addEventListener('change', function () {
        var v = input.value.trim();
        if (!v) { st.selected = null; input.removeAttribute('aria-invalid'); return; }
        var d = parseISO(v);
        if (d && inRange(d)) { st.selected = d; input.removeAttribute('aria-invalid'); }
        else input.setAttribute('aria-invalid', 'true');
      });
      pop.addEventListener('click', function (e) {
        var nav = e.target.closest('[data-dp]');
        if (nav) {
          var a = nav.getAttribute('data-dp');
          if (a === 'prev') { st.view = addMonths(st.view, -1); st.focus = new Date(st.view.getFullYear(), st.view.getMonth(), 1); render(false); }
          else if (a === 'next') { st.view = addMonths(st.view, 1); st.focus = new Date(st.view.getFullYear(), st.view.getMonth(), 1); render(false); }
          else if (a === 'today') choose(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()));
          else if (a === 'clear') { st.selected = null; input.value = ''; input.dispatchEvent(new Event('change', { bubbles: true })); emit(host, 'cu:date', { value: '', date: null }); close(true); }
          // keep focus on the control that was used
          var again = q('[data-dp="' + a + '"]', pop); if (again && (a === 'prev' || a === 'next')) again.focus();
          return;
        }
        var day = e.target.closest('.cu-datepicker-day');
        if (day && !day.disabled) choose(parseISO(day.getAttribute('data-date')));
      });
      pop.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { e.stopPropagation(); close(true); return; }
        var day = e.target.closest && e.target.closest('.cu-datepicker-day');
        if (!day) return;
        var d = parseISO(day.getAttribute('data-date')), n = null;
        if (e.key === 'ArrowLeft') n = addDays(d, -1);
        else if (e.key === 'ArrowRight') n = addDays(d, 1);
        else if (e.key === 'ArrowUp') n = addDays(d, -7);
        else if (e.key === 'ArrowDown') n = addDays(d, 7);
        else if (e.key === 'PageUp') n = addMonths(d, -1);
        else if (e.key === 'PageDown') n = addMonths(d, 1);
        else if (e.key === 'Home') n = addDays(d, -((d.getDay() - weekStart + 7) % 7));
        else if (e.key === 'End') n = addDays(d, 6 - ((d.getDay() - weekStart + 7) % 7));
        if (n) { e.preventDefault(); if (min && n < min) n = min; if (max && n > max) n = max; moveFocus(n); }
      });
      input.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown' && e.altKey) { e.preventDefault(); open(); }
        if (e.key === 'Escape' && host.classList.contains('is-open')) close(false);
      });
    });
  }
  function closeDatepickers(except) {
    qa('[data-cu-datepicker].is-open').forEach(function (h) {
      if (h !== except) { h.classList.remove('is-open'); var t = q('.cu-datepicker-toggle', h); if (t) t.setAttribute('aria-expanded', 'false'); }
    });
  }

  // ---------- toast ----------
  var toastRegion = null;
  var toastPosition = 'bottom-right';

  function getRegion() {
    if (toastRegion && doc.body.contains(toastRegion)) return toastRegion;
    toastRegion = el('div', 'cu-toast-region');
    toastRegion.setAttribute('popover', 'manual');
    toastRegion.setAttribute('aria-live', 'polite');
    toastRegion.setAttribute('aria-relevant', 'additions');
    toastRegion.setAttribute('data-position', toastPosition);
    doc.body.appendChild(toastRegion);
    if (typeof toastRegion.showPopover !== 'function') toastRegion.classList.add('is-fallback');
    return toastRegion;
  }
  // Re-show the popover so the region lands on top of any dialog opened after it.
  function bringToFront(region) {
    if (typeof region.showPopover !== 'function') return;
    try { if (region.matches(':popover-open')) region.hidePopover(); region.showPopover(); } catch (err) { region.classList.add('is-fallback'); }
  }

  function toast(opts) {
    opts = opts || {};
    var variant = opts.variant || 'default';
    var region = getRegion();
    var node = el('div', 'cu-toast' + (variant !== 'default' ? ' cu-toast-' + variant : ''));
    node.setAttribute('role', variant === 'destructive' ? 'alert' : 'status');
    if (opts.icon !== false) {
      var ic = el('span', 'cu-toast-icon');
      ic.innerHTML = toastGlyph(variant);
      node.appendChild(ic);
    }
    var body = el('div', 'cu-toast-body');
    if (opts.title) body.appendChild(el('p', 'cu-toast-title', opts.title));
    if (opts.description) body.appendChild(el('p', 'cu-toast-description', opts.description));
    node.appendChild(body);
    if (opts.action && opts.action.label) {
      var act = el('button', 'cu-toast-action', opts.action.label);
      act.type = 'button';
      act.addEventListener('click', function () { if (opts.action.onClick) opts.action.onClick(); api.dismiss(); });
      node.appendChild(act);
    }
    if (opts.dismissible !== false) {
      var x = el('button', 'cu-toast-close');
      x.type = 'button';
      x.setAttribute('aria-label', 'Dismiss notification');
      x.innerHTML = icon('close', 'cu-icon-xs');
      x.addEventListener('click', function () { api.dismiss(); });
      node.appendChild(x);
    }

    var duration = opts.duration == null ? 5000 : opts.duration;
    var timer = null, remaining = duration, startedAt = 0, gone = false;
    function start() { if (!isFinite(duration) || duration <= 0 || gone) return; startedAt = Date.now(); timer = setTimeout(function () { api.dismiss(); }, remaining); }
    function pause() { if (timer) { clearTimeout(timer); timer = null; remaining -= Date.now() - startedAt; } }
    var api = {
      el: node,
      dismiss: function () {
        if (gone) return; gone = true; pause();
        removeAnimated(node);
        setTimeout(function () {
          if (!region.children.length && typeof region.hidePopover === 'function') { try { region.hidePopover(); } catch (err) { /* already hidden */ } }
          if (opts.onDismiss) opts.onDismiss();
        }, 240);
      }
    };
    node.addEventListener('mouseenter', pause);
    node.addEventListener('mouseleave', start);
    node.addEventListener('focusin', pause);
    node.addEventListener('focusout', start);

    region.appendChild(node);
    bringToFront(region);
    start();
    return api;
  }
  toast.position = function (pos) {
    toastPosition = pos;
    if (toastRegion) toastRegion.setAttribute('data-position', pos);
  };
  toast.clear = function () {
    if (!toastRegion) return;
    qa('.cu-toast', toastRegion).forEach(function (t) { removeAnimated(t); });
  };

  // ---------- data table ----------
  function tableInit(root) {
    qa('[data-cu-table]', root).forEach(function (wrap) {
      if (wrap._cuTable) return;
      var tbody = q('tbody', wrap);
      if (!tbody) return;
      var rows = qa('tr', tbody);
      var st = { col: -1, dir: 'none', query: '', filter: '', page: 1, size: num(wrap.getAttribute('data-cu-page-size'), 10) };
      wrap._cuTable = st;
      var heads = qa('thead th', wrap);
      var summary = q('[data-cu-table-summary]', wrap);
      var pager = q('[data-cu-table-pagination]', wrap);
      var cols = heads.length || (rows[0] ? rows[0].cells.length : 1);
      var emptyRow = el('tr', 'cu-table-empty');
      var emptyCell = el('td', '', wrap.getAttribute('data-cu-empty') || 'No results found');
      emptyCell.colSpan = cols;
      emptyRow.appendChild(emptyCell);
      emptyRow.hidden = true;
      tbody.appendChild(emptyRow);

      function cellText(r, i) { var c = r.cells[i]; return c ? (c.getAttribute('data-sort') != null ? c.getAttribute('data-sort') : c.textContent.trim()) : ''; }
      function compare(type, a, b) {
        if (type === 'number') return (num(String(a).replace(/[^0-9.\-]/g, ''), 0)) - (num(String(b).replace(/[^0-9.\-]/g, ''), 0));
        if (type === 'date') return (Date.parse(a) || 0) - (Date.parse(b) || 0);
        return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
      }
      function apply() {
        var q1 = st.query.toLowerCase();
        var matched = rows.filter(function (r) {
          if (q1 && r.textContent.toLowerCase().indexOf(q1) < 0) return false;
          if (st.filter !== '' && st.filterCol > -1 && cellText(r, st.filterCol).toLowerCase() !== st.filter.toLowerCase()) return false;
          return true;
        });
        if (st.dir !== 'none' && st.col > -1) {
          var type = heads[st.col].getAttribute('data-cu-sort') || 'text';
          var sign = st.dir === 'ascending' ? 1 : -1;
          matched = matched.slice().sort(function (a, b) { return sign * compare(type, cellText(a, st.col), cellText(b, st.col)); });
        }
        var total = matched.length;
        var pages = Math.max(1, Math.ceil(total / st.size));
        st.page = Math.min(Math.max(1, st.page), pages);
        var from = (st.page - 1) * st.size, to = Math.min(total, from + st.size);
        var visible = matched.slice(from, to);
        rows.forEach(function (r) { r.hidden = visible.indexOf(r) < 0; });
        matched.forEach(function (r) { tbody.insertBefore(r, emptyRow); });
        emptyRow.hidden = total > 0;
        if (summary) {
          summary.textContent = total === 0 ? '0 results' :
            'Showing ' + (from + 1) + '-' + to + ' of ' + total + (total !== rows.length ? ' (filtered from ' + rows.length + ')' : '');
        }
        renderPager(pages);
        emit(wrap, 'cu:table', { page: st.page, pages: pages, total: total });
      }
      function renderPager(pages) {
        if (!pager) return;
        pager.innerHTML = '';
        pager.hidden = pages <= 1;
        if (pages <= 1) return;
        function btn(label, page, opts) {
          var b = el('button', 'cu-pagination-item' + (opts.active ? ' cu-pagination-item-active' : ''), label);
          b.type = 'button';
          b.setAttribute('data-page', String(page));
          if (opts.aria) b.setAttribute('aria-label', opts.aria);
          if (opts.active) b.setAttribute('aria-current', 'page');
          if (opts.disabled) b.disabled = true;
          pager.appendChild(b);
        }
        btn('‹', st.page - 1, { aria: 'Previous page', disabled: st.page === 1 });
        var shown = [];
        for (var p = 1; p <= pages; p++) if (p === 1 || p === pages || Math.abs(p - st.page) <= 1) shown.push(p);
        var prev = 0;
        shown.forEach(function (p2) {
          if (p2 - prev > 1) { var gap = el('span', 'cu-pagination-item', '…'); gap.setAttribute('aria-hidden', 'true'); pager.appendChild(gap); }
          btn(String(p2), p2, { active: p2 === st.page, aria: 'Page ' + p2 });
          prev = p2;
        });
        btn('›', st.page + 1, { aria: 'Next page', disabled: st.page === pages });
      }

      wrap.addEventListener('click', function (e) {
        var sortBtn = e.target.closest('.cu-table-sort');
        if (sortBtn) {
          var th = sortBtn.closest('th');
          var idx = heads.indexOf(th);
          if (idx < 0 || !th.hasAttribute('data-cu-sort')) return;
          var cur = st.col === idx ? st.dir : 'none';
          st.dir = cur === 'none' ? 'ascending' : cur === 'ascending' ? 'descending' : 'none';
          st.col = st.dir === 'none' ? -1 : idx;
          heads.forEach(function (h) { if (h.hasAttribute('data-cu-sort')) h.setAttribute('aria-sort', 'none'); });
          if (st.dir !== 'none') th.setAttribute('aria-sort', st.dir);
          st.page = 1;
          apply();
          return;
        }
        var pg = e.target.closest('[data-page]');
        if (pg && pager && pager.contains(pg) && !pg.disabled) { st.page = num(pg.getAttribute('data-page'), 1); apply(); }
      });
      var filterInput = q('[data-cu-table-filter]', wrap);
      if (filterInput) filterInput.addEventListener('input', function () { st.query = filterInput.value.trim(); st.page = 1; apply(); });
      var colSelect = q('[data-cu-table-column]', wrap);
      if (colSelect && colSelect.classList.contains('cu-dropdown')) {
        // Dropdown component: items carry data-value, the trigger shows the chosen label.
        st.filterCol = num(colSelect.getAttribute('data-cu-table-column'), -1);
        colSelect.addEventListener('click', function (e) {
          var item = e.target.closest('.cu-dropdown-item[data-value]');
          if (!item || !colSelect.contains(item)) return;
          qa('.cu-dropdown-item[data-value]', colSelect).forEach(function (i) { i.setAttribute('aria-checked', i === item ? 'true' : 'false'); });
          var label = q('[data-cu-dropdown-label]', colSelect);
          if (label) label.textContent = item.textContent.trim();
          st.filter = item.getAttribute('data-value'); st.page = 1; apply();
        });
      } else if (colSelect) {
        st.filterCol = num(colSelect.getAttribute('data-cu-table-column'), -1);
        colSelect.addEventListener('change', function () { st.filter = colSelect.value; st.page = 1; apply(); });
      }
      var sizeSelect = q('[data-cu-table-page-size]', wrap);
      if (sizeSelect) sizeSelect.addEventListener('change', function () { st.size = num(sizeSelect.value, 10); st.page = 1; apply(); });
      heads.forEach(function (h) { if (h.hasAttribute('data-cu-sort') && !h.hasAttribute('aria-sort')) h.setAttribute('aria-sort', 'none'); });
      apply();
    });
  }

  // ---------- tabs ----------
  function tabsInit(root) {
    qa('[data-cu-tabs]', root).forEach(function (wrap) {
      var tabs = qa('[role="tab"]', wrap);
      var sel = tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0];
      if (sel) tabSelect(wrap, sel, false);
    });
  }
  function tabSelect(wrap, tab, focus) {
    qa('[role="tab"]', wrap).forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      var panel = resolveTarget(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
    });
    if (focus) tab.focus();
    emit(wrap, 'cu:tab', { id: tab.id });
  }
  function onTabClick(e) {
    var tab = e.target.closest('[data-cu-tabs] [role="tab"]');
    if (!tab || tab.disabled) return false;
    tabSelect(tab.closest('[data-cu-tabs]'), tab, false);
    return true;
  }
  function onTabKey(e) {
    var tab = e.target.closest && e.target.closest('[data-cu-tabs] [role="tab"]');
    if (!tab) return;
    var wrap = tab.closest('[data-cu-tabs]');
    var tabs = qa('[role="tab"]:not(:disabled)', wrap), i = tabs.indexOf(tab), n = null;
    if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
    else if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
    else if (e.key === 'Home') n = tabs[0];
    else if (e.key === 'End') n = tabs[tabs.length - 1];
    if (n) { e.preventDefault(); tabSelect(wrap, n, true); }
  }

  // ---------- OTP input ----------
  function otpBoxes(e) { return qa('.cu-otp-input', e.target.closest('.cu-otp-container')); }
  function otpDone(box) {
    var boxes = qa('.cu-otp-input', box.closest('.cu-otp-container'));
    var value = boxes.map(function (b) { return b.value; }).join('');
    if (value.length === boxes.length) emit(box.closest('.cu-otp-container'), 'cu:otp', { value: value });
  }
  function onOtpInput(e) {
    if (!e.target.matches || !e.target.matches('.cu-otp-input')) return;
    var boxes = otpBoxes(e), i = boxes.indexOf(e.target);
    var v = e.target.value.replace(/\s/g, '');
    if (v.length > 1) { // paste or autofill into one box: spread it
      v.split('').slice(0, boxes.length - i).forEach(function (ch, k) { boxes[i + k].value = ch; });
      i = Math.min(boxes.length - 1, i + v.length - 1);
      boxes[i].focus();
    } else {
      e.target.value = v;
      if (v && boxes[i + 1]) boxes[i + 1].focus();
    }
    otpDone(e.target);
  }
  function onOtpPaste(e) {
    if (!e.target.matches || !e.target.matches('.cu-otp-input')) return;
    var text = ((e.clipboardData || window.clipboardData).getData('text') || '').replace(/\s/g, '');
    if (!text) return;
    e.preventDefault(); // maxlength="1" would otherwise cut the pasted code to one digit
    var boxes = otpBoxes(e), i = boxes.indexOf(e.target);
    text.split('').slice(0, boxes.length - i).forEach(function (ch, k) { boxes[i + k].value = ch; });
    boxes[Math.min(boxes.length - 1, i + text.length - 1)].focus();
    otpDone(e.target);
  }
  function onOtpKey(e) {
    if (!e.target.matches || !e.target.matches('.cu-otp-input')) return;
    var boxes = otpBoxes(e), i = boxes.indexOf(e.target);
    if (e.key === 'Backspace' && !e.target.value && boxes[i - 1]) { e.preventDefault(); boxes[i - 1].value = ''; boxes[i - 1].focus(); }
    else if (e.key === 'ArrowLeft' && boxes[i - 1]) { e.preventDefault(); boxes[i - 1].focus(); }
    else if (e.key === 'ArrowRight' && boxes[i + 1]) { e.preventDefault(); boxes[i + 1].focus(); }
  }

  // ---------- app shell ----------
  function setShell(shell, open) {
    shell.classList.toggle('is-open', open);
    var t = q('[data-cu-shell-toggle]', shell);
    if (t) t.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  function onShellClick(e) {
    var t = e.target.closest('[data-cu-shell-toggle]');
    if (t) { var shell = t.closest('[data-cu-shell]'); setShell(shell, !shell.classList.contains('is-open')); return true; }
    qa('[data-cu-shell].is-open').forEach(function (s) { if (!e.target.closest('.cu-sidebar')) setShell(s, false); });
    return false;
  }

  // ---------- init + event wiring ----------
  function init(root) {
    root = root || doc;
    qa('.cu-searchbar', root).forEach(syncSearchbar);
    qa('.cu-quantity', root).forEach(syncQuantity);
    qa('.cu-dropdown:not(.cu-dropdown-hover)', root).forEach(function (dd) {
      var t = dropdownTrigger(dd);
      if (t && !t.hasAttribute('aria-expanded')) { t.setAttribute('aria-haspopup', 'menu'); t.setAttribute('aria-expanded', dd.classList.contains('is-open') ? 'true' : 'false'); }
    });
    qa('.cu-accordion-header', root).forEach(function (h) {
      if (!h.hasAttribute('aria-expanded')) h.setAttribute('aria-expanded', h.parentElement.classList.contains('is-open') ? 'true' : 'false');
    });
    dpInit(root);
    tableInit(root);
    tabsInit(root);
  }

  doc.addEventListener('click', function (e) {
    if (onDialogClick(e)) return;
    if (onDismiss(e)) return;
    if (onSearchbarClick(e)) return;
    if (onQuantityClick(e)) return;
    if (onFileRemove(e)) return;
    if (onPasswordToggle(e)) return;
    if (onTopbarToggle(e)) return;
    if (onTabClick(e)) return;
    if (onShellClick(e)) return;
    onAccordionClick(e);
    onDropdownClick(e);
    onComboboxClick(e);
    if (!e.target.closest('[data-cu-datepicker]')) closeDatepickers(null);
  });
  doc.addEventListener('input', function (e) { onSearchbarInput(e); onComboboxInput(e); onOtpInput(e); });
  doc.addEventListener('change', function (e) { onQuantityChange(e); onFileChange(e); });
  doc.addEventListener('keydown', function (e) {
    onDropdownKey(e); onSearchbarKey(e); onTabKey(e); onOtpKey(e);
    if (e.key === 'Escape') qa('[data-cu-shell].is-open').forEach(function (s) { setShell(s, false); });
  });
  doc.addEventListener('paste', onOtpPaste);
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(function (t) { doc.addEventListener(t, onFileDrag); });

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', function () { init(doc); });
  else init(doc);

  var api = { version: VERSION, init: init, toast: toast };
  window.CometUI = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
