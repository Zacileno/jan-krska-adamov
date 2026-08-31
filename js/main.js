/* =========================================================
   Krška nemovitosti — vykreslení stránky a chování
   Všechna data se berou z data/nemovitost.js.
   ========================================================= */
(function () {
  'use strict';

  const D = window.NEMOVITOST || NEMOVITOST;
  const $  = (s, k = document) => k.querySelector(s);
  const $$ = (s, k = document) => Array.from(k.querySelectorAll(s));

  /** Doplní obrázku rozměry ze souboru data/rozmery.js.
   *  Prohlížeč tak ví, kolik místa mu nechat, ještě než ho stáhne — stránka
   *  při načítání neposkakuje. */
  function rozmery(img, cesta) {
    const r = (typeof ROZMERY !== 'undefined') && ROZMERY[cesta];
    if (r) { img.width = r[0]; img.height = r[1]; }
    return img;
  }

  /** Bezpečně vloží text (ne HTML) do všech prvků odpovídajících selektoru. */
  function text(sel, hodnota) {
    $$(sel).forEach(el => { el.textContent = hodnota; });
  }

  /* ============ ZNAČKA A KONTAKT ============ */

  /** Logo = zelené kolečko s monogramem a zbytek názvu vedle něj.
   *  Když název začíná monogramem, písmena se vedle kolečka
   *  neopakují — v textu zůstane jen „nemovitosti". Celé jméno značky si
   *  odnesou čtečky pro nevidomé. */
  function logo() {
    const { nazev, monogram } = D.znacka;
    const zbytek = nazev.startsWith(monogram + ' ')
      ? nazev.slice(monogram.length + 1)
      : nazev;

    const obal = document.createElement('span');
    obal.className = 'logo';
    obal.setAttribute('aria-label', nazev);

    const znak = document.createElement('span');
    znak.className = 'logo__znak';
    znak.textContent = monogram;
    znak.setAttribute('aria-hidden', 'true');

    const text = document.createElement('span');
    text.className = 'logo__nazev';
    text.textContent = zbytek;
    text.setAttribute('aria-hidden', 'true');

    obal.append(znak, text);
    return obal;
  }

  $$('[data-znacka]').forEach(el => el.replaceChildren(logo()));
  text('[data-tel-text]', D.kontakt.telefon);
  $$('[data-tel-href]').forEach(el => { el.href = 'tel:' + D.kontakt.telefonLink; });

  /* ============ ÚVODNÍ BLOK ============ */
  const H = D.hlavicka;
  text('[data-hero-typ]', H.typ);
  text('[data-hero-nadpis]', `${H.dispozice}, ${H.plocha}`);
  text('[data-hero-lokalita]', H.lokalita);
  text('[data-hero-cena]', H.cena);
  text('[data-hero-cena-pozn]', H.cenaPoznamka);
  $('.hero__foto').alt = `${H.typ} ${H.dispozice} — ${H.lokalita}`;

  $('[data-hero-zvyrazneni]').append(...H.zvyrazneni.map(z => {
    const li = document.createElement('li');
    const s = document.createElement('strong'); s.textContent = z.hodnota;
    const p = document.createElement('span');   p.textContent = z.popis;
    li.append(s, p);
    return li;
  }));

  /* ============ ÚVODNÍ TEXT ============ */
  text('[data-uvod-nadpis]', D.uvod.nadpis);
  // Odstavec je buď obyčejný text, nebo { nadpis, text } s vlastním mezinadpisem.
  D.uvod.odstavce.forEach(polozka => {
    const cil = $('[data-uvod-text]');
    if (typeof polozka === 'string') {
      const p = document.createElement('p');
      p.textContent = polozka;
      cil.append(p);
      return;
    }
    const h = document.createElement('h3');
    h.className = 'text__mezinadpis';
    h.textContent = polozka.nadpis;
    const p = document.createElement('p');
    p.textContent = polozka.text;
    cil.append(h, p);
  });

  /* ============ VIDEO ============
     Video se do stránky vloží až po kliknutí — do té doby se stahuje
     jen náhledový obrázek, ne desítky megabajtů. */
  text('[data-video-nadpis]', D.video.nadpis);
  text('[data-video-popis]', D.video.popis);
  // Když popis není vyplněný, ať po něm nezůstane mezera.
  $('[data-video-popis]').hidden = !D.video.popis;

  const obalVidea = $('[data-video]');
  const nahled = document.createElement('img');
  nahled.src = D.video.nahled;
  rozmery(nahled, D.video.nahled);
  nahled.alt = '';
  nahled.loading = 'lazy';

  const spustit = document.createElement('button');
  spustit.className = 'video__spustit';
  spustit.type = 'button';
  spustit.setAttribute('aria-label', 'Přehrát video prohlídky domu');
  const sipka = document.createElement('span');
  sipka.className = 'video__sipka'; sipka.textContent = '▶'; sipka.setAttribute('aria-hidden', 'true');
  const vaha = document.createElement('span');
  vaha.className = 'video__vaha'; vaha.textContent = 'Přehrát prohlídku (2 minuty)';
  spustit.append(sipka, vaha);

  obalVidea.append(nahled, spustit);

  spustit.addEventListener('click', () => {
    const v = document.createElement('video');
    v.src = D.video.soubor;
    v.poster = D.video.nahled;
    v.controls = true;
    v.autoplay = true;
    v.playsInline = true;
    v.preload = 'auto';
    obalVidea.replaceChildren(v);
    v.play().catch(() => { /* prohlížeč přehrání odmítl — ovládání zůstává */ });
  });

  /* ============ GALERIE ============ */
  const zalozkyEl   = $('[data-zalozky]');
  const mrizkaEl    = $('[data-mrizka]');
  const upozorneni  = $('[data-galerie-upozorneni]');
  let aktualni = null;   // pole { velky, nahled, popis } pro zvětšení

  function cestaK(skupina, i, nahledova) {
    const predpona = D.web.predponaSouboru;
    const cislo = String(i).padStart(2, '0');
    return `assets/fotky/${skupina.id}/${predpona}-${skupina.id}-${cislo}${nahledova ? '-nahled' : ''}.webp`;
  }

  function vykresliSkupinu(skupina) {
    aktualni = [];
    for (let i = 1; i <= skupina.pocet; i++) {
      aktualni.push({
        velky:  cestaK(skupina, i, false),
        nahled: cestaK(skupina, i, true),
        popis:  (skupina.popisky && skupina.popisky[i - 1]) || `${skupina.nazev} — fotografie ${i}`,
      });
    }

    if (skupina.upozorneni) {
      upozorneni.textContent = skupina.upozorneni;
      upozorneni.hidden = false;
    } else {
      upozorneni.hidden = true;
    }

    mrizkaEl.replaceChildren(...aktualni.map((f, i) => {
      const b = document.createElement('button');
      b.className = 'dlazdice' + (i === 0 ? ' dlazdice--vysoka' : '');
      b.type = 'button';
      b.setAttribute('aria-label', 'Zvětšit: ' + f.popis);
      const img = document.createElement('img');
      img.src = f.nahled;
      img.alt = f.popis;
      img.loading = i < 4 ? 'eager' : 'lazy';
      img.decoding = 'async';
      rozmery(img, f.nahled);
      b.append(img);
      b.addEventListener('click', () => otevriLupu(i));
      return b;
    }));
  }

  zalozkyEl.append(...D.galerie.map((skupina, i) => {
    const b = document.createElement('button');
    b.className = 'zalozka';
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', String(i === 0));
    b.textContent = skupina.nazev;
    b.addEventListener('click', () => {
      $$('.zalozka', zalozkyEl).forEach(x => x.setAttribute('aria-selected', 'false'));
      b.setAttribute('aria-selected', 'true');
      vykresliSkupinu(skupina);
    });
    return b;
  }));
  vykresliSkupinu(D.galerie[0]);

  /* ============ PARAMETRY ============ */
  function kartaSeznamu(nadpis, radky, tridaNavic) {
    const div = document.createElement('div');
    div.className = 'karta' + (tridaNavic ? ' ' + tridaNavic : '');
    const h = document.createElement('h3');
    h.className = 'karta__nadpis';
    h.textContent = nadpis;
    const ul = document.createElement('ul');
    ul.className = 'seznam';
    radky.forEach(([klic, hodnota]) => {
      const li = document.createElement('li');
      const a = document.createElement('span'); a.className = 'klic';    a.textContent = klic;
      const b = document.createElement('span'); b.className = 'hodnota'; b.textContent = hodnota;
      li.append(a, b);
      ul.append(li);
    });
    div.append(h, ul);
    return div;
  }

  $('[data-parametry]').append(...D.parametry.map(s => kartaSeznamu(s.skupina, s.polozky)));

  /* ============ PŮDORYS ============ */
  text('[data-pudorys-popis]', D.pudorys.popis);
  const pudorysBtn = document.createElement('button');
  pudorysBtn.className = 'pudorys-ram';
  pudorysBtn.type = 'button';
  pudorysBtn.setAttribute('aria-label', 'Zvětšit půdorys');
  const pudorysImg = document.createElement('img');
  pudorysImg.src = D.pudorys.nahled;
  pudorysImg.alt = 'Půdorys přízemního rodinného domu 5+kk v Adamově';
  pudorysImg.loading = 'lazy';
  rozmery(pudorysImg, D.pudorys.nahled);
  pudorysBtn.append(pudorysImg);
  pudorysBtn.addEventListener('click', () => {
    aktualni = [{ velky: D.pudorys.obrazek, popis: 'Půdorys domu' }];
    otevriLupu(0);
  });
  $('[data-pudorys]').append(pudorysBtn);

  /* ============ LOKALITA ============ */
  const L = D.lokalita;
  text('[data-lokalita-nadpis]', L.nadpis);
  text('[data-lokalita-uvod]', L.uvod);

  const mapaImg = document.createElement('img');
  mapaImg.src = L.mapaObrazek;
  mapaImg.alt = 'Letecký pohled na Adamov s vyznačenou polohou nabízeného domu';
  mapaImg.loading = 'lazy';
  rozmery(mapaImg, L.mapaObrazek);
  // Velký snímek je letecká fotka, ne mapa — odkaz do map patří k malé mapce níž.
  $('[data-lokalita-mapa]').append(mapaImg);

  $('[data-lokalita-doprava]').append(...L.doprava.map(([klic, hodnota]) => {
    const li = document.createElement('li');
    const a = document.createElement('span'); a.className = 'klic';    a.textContent = klic;
    const b = document.createElement('span'); b.className = 'hodnota'; b.textContent = hodnota;
    li.append(a, b);
    return li;
  }));

  const vybavenostEl = $('[data-lokalita-vybavenost]');
  vybavenostEl.append(...L.vybavenost.map(s => kartaSeznamu(s.skupina, s.polozky)));

  // Poslední dlaždice v mřížce je malá mapa s proklikem do Mapy.cz.
  if (L.mapaVyrez) {
    const dlazdiceMapy = document.createElement('a');
    dlazdiceMapy.className = 'mapka';
    dlazdiceMapy.href = L.mapaOdkaz;
    dlazdiceMapy.target = '_blank';
    dlazdiceMapy.rel = 'noopener';

    const obr = document.createElement('img');
    obr.src = L.mapaVyrez;
    obr.alt = 'Mapa Adamova u Českých Budějovic s vyznačenou polohou domu';
    obr.loading = 'lazy';
    rozmery(obr, L.mapaVyrez);

    const popis = document.createElement('span');
    popis.className = 'mapka__popis';
    popis.textContent = 'Otevřít v mapách →';

    dlazdiceMapy.append(obr, popis);
    vybavenostEl.append(dlazdiceMapy);
  }

  /* ============ KONTAKT NA MAKLÉŘE ============ */
  const K = D.kontakt;
  const maklerEl = $('[data-makler]');

  const portret = document.createElement('div');
  portret.className = 'makler__portret';
  if (K.foto) {
    portret.classList.add('makler__portret--foto');
    const img = document.createElement('img');
    img.src = K.foto; img.alt = K.jmeno; img.loading = 'lazy';
    rozmery(img, K.foto);
    portret.append(img);
  } else {
    // Bez fotky zobrazíme iniciály — místo pro fotku zůstává připravené.
    portret.textContent = K.jmeno.split(' ').map(s => s[0]).join('');
    portret.setAttribute('aria-hidden', 'true');
  }

  const blok = document.createElement('div');
  blok.className = 'makler__text';
  const jmeno = document.createElement('h2'); jmeno.className = 'makler__jmeno'; jmeno.textContent = K.jmeno;
  const role  = document.createElement('p');  role.className  = 'makler__role';  role.textContent  = K.role;
  const popis = document.createElement('p');  popis.className = 'makler__popis'; popis.textContent = K.predstaveni;

  const IKONY = {
    telefon: 'M6.6 10.8a15.1 15.1 0 006.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.2.4 2.4.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 013 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.4 0 .8-.2 1l-2.3 2.2z',
    email:   'M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z',
  };

  /** Jeden řádek kontaktu: ikonka + klikací údaj. */
  function radekKontaktu(typ, href, popisek) {
    const a = document.createElement('a');
    a.className = 'makler__kontakt';
    a.href = href;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.classList.add('makler__ikona');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', IKONY[typ]);
    path.setAttribute('fill', 'currentColor');
    svg.append(path);

    const text = document.createElement('span');
    text.textContent = popisek;

    a.append(svg, text);
    return a;
  }

  const kontakty = document.createElement('div');
  kontakty.className = 'makler__kontakty';
  kontakty.append(
    radekKontaktu('telefon', 'tel:' + K.telefonLink, K.telefon),
    radekKontaktu('email', 'mailto:' + K.email, K.email),
  );

  blok.append(jmeno, role, popis, kontakty);
  maklerEl.append(portret, blok);

  /* ============ FORMULÁŘ ============ */
  const F = D.formular;
  text('[data-form-nadpis]', F.nadpis);
  text('[data-form-podnadpis]', F.podnadpis);
  text('[data-form-souhlas]', F.souhlasText);

  const formular = $('[data-formular]');
  const hlaska   = $('[data-hlaska]');
  const odeslat  = $('[data-odeslat]');

  function zprava(text, druh) {
    hlaska.textContent = text;
    hlaska.className = 'hlaska hlaska--' + druh;
    hlaska.hidden = false;
  }

  /** Číslo tohoto odeslání. Drží se, dokud se poptávka nepodaří odeslat. */
  let idOdeslani = null;
  function cisloOdeslani() {
    if (!idOdeslani) {
      idOdeslani = (crypto.randomUUID && crypto.randomUUID()) ||
                   ('ID' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8));
    }
    return idOdeslani;
  }

  /** Jednoduchá kontrola, aby se neposílaly zjevně nesmyslné údaje. */
  function zkontroluj(data) {
    const chyby = [];
    if (!data.jmeno || data.jmeno.trim().length < 3) chyby.push('jmeno');
    if (!data.telefon || data.telefon.replace(/\D/g, '').length < 9) chyby.push('telefon');
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) chyby.push('email');
    return chyby;
  }

  formular.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(formular);
    const data = Object.fromEntries(fd.entries());

    // Past na roboty: člověk tohle pole nevidí, takže ho nevyplní.
    if (data.web) return;

    // Nová poptávka nejdřív než za 30 vteřin nedává smysl.
    const posledni = Number(localStorage.getItem('krska-odeslano') || 0);
    if (Date.now() - posledni < 30000) {
      zprava('Poptávku už jsem přijal. Ozvu se vám co nejdřív.', 'ok');
      return;
    }

    const chyby = zkontroluj(data);
    $$('.pole input, .pole textarea', formular).forEach(el => el.removeAttribute('aria-invalid'));
    if (chyby.length) {
      chyby.forEach(n => formular.elements[n]?.setAttribute('aria-invalid', 'true'));
      zprava('Zkontrolujte prosím vyznačená pole.', 'chyba');
      formular.elements[chyby[0]]?.focus();
      return;
    }
    if (!fd.get('souhlas')) {
      $('.souhlas').classList.add('souhlas--chyba');
      zprava('Bez souhlasu se zpracováním údajů poptávku bohužel odeslat nemůžu.', 'chyba');
      return;
    }
    $('.souhlas').classList.remove('souhlas--chyba');

    if (!F.adresaSkriptu) {
      zprava('Formulář zatím není napojený na odesílání. Zavolejte prosím na ' + K.telefon + '.', 'chyba');
      return;
    }

    odeslat.disabled = true;
    odeslat.textContent = 'Odesílám…';

    try {
      // Apps Script neumí odpovědět s CORS hlavičkami, proto text/plain a no-cors.
      await fetch(F.adresaSkriptu, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          // Číslo odeslání: kdyby se stejná poptávka odeslala dvakrát
          // (nepovedený pokus, druhé kliknutí), skript druhý řádek nezaloží.
          requestId:  cisloOdeslani(),
          jmeno:      data.jmeno,
          telefon:    data.telefon,
          email:      data.email,
          zprava:     data.zprava || '',
          nemovitost: H.dispozice + ', ' + H.lokalita,
          zdroj:      document.referrer || 'přímý vstup',
          adresa:     location.href,
        }),
      });

      localStorage.setItem('krska-odeslano', String(Date.now()));
      idOdeslani = null;
      formular.reset();
      zprava(F.dekujeme, 'ok');
      hlaska.scrollIntoView({ block: 'center', behavior: 'smooth' });

      // Konverze do měřicích nástrojů
      if (window.gtag) window.gtag('event', 'generate_lead', { value: 1 });
      if (window.fbq)  window.fbq('track', 'Lead');
    } catch (err) {
      zprava(F.chyba, 'chyba');
    } finally {
      odeslat.disabled = false;
      odeslat.textContent = 'Odeslat poptávku';
    }
  });

  /* ============ PATIČKA ============ */
  const P = D.paticka;
  const patickaEl = $('[data-paticka]');
  const pZnacka = logo();
  pZnacka.classList.add('logo--svetle');

  const pRadek = document.createElement('div');
  pRadek.className = 'paticka__radek';
  if (P.adresa) {
    const pAdresa = document.createElement('span');
    pAdresa.textContent = P.adresa;
    pRadek.append(pAdresa);
  }
  const pTel = document.createElement('a'); pTel.href = 'tel:' + K.telefonLink; pTel.textContent = K.telefon;
  const pMail = document.createElement('a'); pMail.href = 'mailto:' + K.email; pMail.textContent = K.email;
  pRadek.append(pTel, pMail);
  if (P.ico) {
    const pIco = document.createElement('span');
    pIco.textContent = 'IČO ' + P.ico;
    pRadek.append(pIco);
  }
  if (P.zasadyOdkaz) {
    const pZas = document.createElement('a');
    pZas.href = P.zasadyOdkaz;
    pZas.textContent = 'Ochrana osobních údajů';
    pRadek.append(pZas);
  }
  patickaEl.append(pZnacka, pRadek);

  /* ============ ZVĚTŠENÍ OBRÁZKU ============ */
  const lupa    = $('[data-lupa]');
  const lupaImg = $('[data-lupa-obrazek]');
  const lupaPop = $('[data-lupa-popis]');
  let index = 0;
  let vratitFokus = null;

  function ukaz(i) {
    index = (i + aktualni.length) % aktualni.length;
    const f = aktualni[index];
    lupaImg.src = f.velky;
    lupaImg.alt = f.popis;
    lupaPop.textContent = f.popis + (aktualni.length > 1 ? `  (${index + 1}/${aktualni.length})` : '');
  }

  function otevriLupu(i) {
    vratitFokus = document.activeElement;
    ukaz(i);
    lupa.hidden = false;
    document.body.style.overflow = 'hidden';
    $('[data-lupa-zavrit]').focus();
    const vic = aktualni.length > 1;
    $('[data-lupa-vlevo]').hidden  = !vic;
    $('[data-lupa-vpravo]').hidden = !vic;
  }

  function zavriLupu() {
    lupa.hidden = true;
    document.body.style.overflow = '';
    lupaImg.removeAttribute('src');
    if (vratitFokus) vratitFokus.focus();
  }

  $('[data-lupa-zavrit]').addEventListener('click', zavriLupu);
  $('[data-lupa-vlevo]').addEventListener('click',  () => ukaz(index - 1));
  $('[data-lupa-vpravo]').addEventListener('click', () => ukaz(index + 1));
  lupa.addEventListener('click', (e) => { if (e.target === lupa) zavriLupu(); });
  document.addEventListener('keydown', (e) => {
    if (lupa.hidden) return;
    if (e.key === 'Escape')     zavriLupu();
    if (e.key === 'ArrowLeft')  ukaz(index - 1);
    if (e.key === 'ArrowRight') ukaz(index + 1);
  });

  /* ============ ROLOVÁNÍ NA FORMULÁŘ ============
     Obyčejný odkaz na #poptavka se občas nespustí — když se během rolování
     doloží obrázek, prohlížeč animaci přeruší. Proto rolujeme sami a bereme
     v úvahu výšku lepící hlavičky. */
  const plynule = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Odroluje na prvek. Cílovou pozici počítá znovu v každém snímku, takže
   *  obrázek, který se doloží uprostřed animace, rolování nerozhodí. */
  function odrolujNa(cil) {
    const odsazeni = () => $('#hlavicka').offsetHeight + 12;
    const zacatekY = window.scrollY;
    const cilovaY  = () => Math.min(
      cil.getBoundingClientRect().top + window.scrollY - odsazeni(),
      document.documentElement.scrollHeight - window.innerHeight
    );

    if (!plynule) { window.scrollTo(0, cilovaY()); return; }

    const trvani = 500;
    const start = performance.now();
    (function krok(ted) {
      const t = Math.min(1, (ted - start) / trvani);
      const zpomaleni = 1 - Math.pow(1 - t, 3);   // ke konci zpomalí
      window.scrollTo(0, zacatekY + (cilovaY() - zacatekY) * zpomaleni);
      if (t < 1) requestAnimationFrame(krok);
    })(start);
  }

  document.addEventListener('click', (e) => {
    const odkaz = e.target.closest('a[href^="#"]');
    if (!odkaz) return;
    const cil = document.getElementById(odkaz.getAttribute('href').slice(1));
    if (!cil) return;
    e.preventDefault();
    odrolujNa(cil);
    history.replaceState(null, '', odkaz.getAttribute('href'));
  });

  // Když někdo přijde rovnou na adresu s #poptavka, obrázky se teprve načítají
  // a prohlížeč skočí špatně. Doskočíme sami, až se stránka ustálí.
  if (location.hash) {
    const cil = document.getElementById(location.hash.slice(1));
    if (cil) window.addEventListener('load', () => {
      requestAnimationFrame(() => window.scrollTo(0, cil.getBoundingClientRect().top + window.scrollY - $('#hlavicka').offsetHeight - 12));
    });
  }

  /* ============ HLAVIČKA PŘI ROLOVÁNÍ ============ */
  const hlavicka = $('#hlavicka');
  const prepni = () => hlavicka.classList.toggle('hlavicka--posunuta', window.scrollY > 20);
  prepni();
  window.addEventListener('scroll', prepni, { passive: true });

  /* ============ MĚŘENÍ A SOUHLAS S COOKIES ============
     GA4 i Meta pixel se vloží teprve po souhlasu. Bez souhlasu se
     na stránce nespustí žádný cizí skript. */
  const KLIC_SOUHLAS = 'krska-souhlas';
  const cookies = $('[data-cookies]');

  function nactiMereni() {
    if (D.mereni.ga4) {
      const s = document.createElement('script');
      s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + D.mereni.ga4;
      document.head.append(s);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', D.mereni.ga4, { anonymize_ip: true });
    }
    if (D.mereni.metaPixel) {
      /* eslint-disable */
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
      (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
      /* eslint-enable */
      window.fbq('init', D.mereni.metaPixel);
      window.fbq('track', 'PageView');
    }
  }

  const ulozeno = localStorage.getItem(KLIC_SOUHLAS);
  const jeCoMerit = Boolean(D.mereni.ga4 || D.mereni.metaPixel);

  if (jeCoMerit) {
    if (ulozeno === 'ano') {
      nactiMereni();
    } else if (ulozeno !== 'ne') {
      cookies.hidden = false;
    }
  }

  $('[data-cookies-prijmout]').addEventListener('click', () => {
    localStorage.setItem(KLIC_SOUHLAS, 'ano');
    cookies.hidden = true;
    nactiMereni();
  });
  $('[data-cookies-odmitnout]').addEventListener('click', () => {
    localStorage.setItem(KLIC_SOUHLAS, 'ne');
    cookies.hidden = true;
  });

})();
