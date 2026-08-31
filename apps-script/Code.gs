/**
 * KRŠKA NEMOVITOSTI — evidence poptávek z webu
 * ============================================
 *
 * Co to dělá:
 *   • Web odešle formulář  →  skript hned zapíše nový řádek nahoru do tabulky.
 *   • Každých 15 minut projde nové řádky a na každý pošle e-mail s obsahem
 *     poptávky a zeleným tlačítkem „Označit jako vyřešeno".
 *   • Kliknutí na tlačítko zaškrtne v tabulce políčko ve sloupci Vyřešeno.
 *     Zaškrtnout jde samozřejmě i ručně přímo v tabulce.
 *   • Každé pondělí v 8:00 přijde přehled nevyřešených poptávek. Přijde
 *     i když není nic nevyřešeného — je to zároveň důkaz, že skript běží.
 *
 * ---------------------------------------------------------------------------
 * ZPROVOZNĚNÍ (všechno se dělá v Googlu, na webu se pak mění jediný řádek)
 * ---------------------------------------------------------------------------
 *
 *  1. Otevři svoji tabulku → Rozšíření → Apps Script. Smaž, co tam je,
 *     a vlož celý tenhle soubor. Ulož (ikona diskety).
 *
 *  2. Nahoře v liště vyber funkci  setup  a klikni ▶ Spustit.
 *     Google si vyžádá oprávnění (číst a psát do tabulky, posílat e-maily) —
 *     potvrď je. U hlášky „Google tuto aplikaci neověřil" klikni na
 *     Rozšířené → Přejít na… Vznikne záložka „Poptávky" s hlavičkou.
 *
 *  3. Implementovat → Nová implementace → ozubené kolo → Webová aplikace
 *        Spustit jako:     Já
 *        Kdo má přístup:   Kdokoli        ← musí být, jinak web nic neodešle
 *     Implementovat a zkopírovat adresu, která končí na /exec.
 *
 *  4. Tu adresu vlož NÍŽE do  WEBAPP_URL  (kvůli tlačítku Vyřešeno)
 *     a zároveň na webu do  data/nemovitost.js → formular.adresaSkriptu.
 *
 *  5. Protože jsi změnila kód, musíš implementaci povýšit:
 *     Implementovat → Spravovat implementace → tužka → Verze: Nová →
 *     Implementovat.
 *     ⚠️ NIKDY nevolit znovu „Nová implementace" — ta vyrobí jinou /exec
 *     adresu a web by pak posílal poptávky do prázdna.
 *
 *  6. Vyber funkci  installTriggers  a klikni ▶ Spustit. Tím se zapne
 *     kontrola každých 15 minut a pondělní přehled. Ověřit si to můžeš
 *     vlevo v editoru pod ikonou hodin (Triggery).
 *
 *  7. Test: vyber funkci  zkusebniPoptavka  a spusť ji. Do tabulky přibude
 *     zkušební řádek. Pak spusť  checkNovePozadavky  a do minuty ti přijde
 *     e-mail s tlačítkem. Klikni na něj a zkontroluj, že se v tabulce
 *     zaškrtlo Vyřešeno. Zkušební řádek pak smaž.
 *
 * ---------------------------------------------------------------------------
 * NA CO SI DÁT POZOR (poučeno z projektu Optivio)
 * ---------------------------------------------------------------------------
 *
 *  • Zaškrtávátka se vkládají VŽDY jen k řádku, který má vyplněný čas.
 *    Kdyby se vložila dopředu do stovek prázdných řádků, Google si do nich
 *    zapíše hodnotu „nezaškrtnuto" — tabulka pak vypadá jako plná záznamů
 *    a kontrolní funkce na každý prázdný řádek pošle e-mail. Přesně tohle
 *    tehdy způsobilo záplavu e-mailů.
 *  • Každá funkce, která tabulku prochází, proto navíc přeskakuje řádky
 *    bez vyplněného času. Druhá pojistka proti témuž.
 *  • Zápis běží pod zámkem a poptávka má svoje číslo (requestId), takže
 *    dvě odeslání ve stejnou chvíli ani opakované kliknutí nevyrobí dva řádky.
 *  • Po každé změně kódu je potřeba povýšit verzi implementace (bod 5 výše).
 *    Samotné uložení kódu se na webu neprojeví.
 *  • Google pošle z běžného účtu 100 e-mailů denně. Bohatá rezerva.
 */

/* ================= NASTAVENÍ ================= */

// Kam chodí upozornění. Víc adres se odděluje čárkou.
const NOTIFY_EMAIL = 'michaela@zacileno.cz';

// Adresa webové aplikace, končí na /exec. Doplň po první implementaci (bod 4).
// Bez ní tlačítko „Vyřešeno" v e-mailu nemusí fungovat.
const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbyReQo5a4TEgwBLzmME0yCoqcEtJ_x4dDk0jwkKG-zS5YvlNFlY3LXQVldDn5UowpaM/exec';

// Název záložky v tabulce. Skript si ji vytvoří sám.
const LIST = 'Poptávky';

// Kolik nejnovějších řádků se prohledává při kontrole opakovaného odeslání.
// Nové poptávky chodí nahoru, hlouběji se hledat nikdy nemusí.
const DEDUP_RADKU = 200;

// Jak dlouho čekat na uvolnění zámku zápisu (v milisekundách).
const ZAMEK_MS = 20000;

// Pořadí sloupců. Musí sedět s hlavičkou v HLAVICKA.
const SLOUPEC = {
  cas: 1, jmeno: 2, telefon: 3, email: 4, zprava: 5,
  nemovitost: 6, zdroj: 7, stranka: 8,
  vyreseno: 9, upozorneno: 10, id: 11,
};

const HLAVICKA = [
  'Čas', 'Jméno', 'Telefon', 'E-mail', 'Zpráva',
  'Nemovitost', 'Odkud přišel', 'Stránka',
  'Vyřešeno', 'Upozorněno', 'ID',
];

// Co se vypisuje v e-mailu a v jakém pořadí.
const POLE_DO_EMAILU = [
  { popisek: 'Jméno', sloupec: SLOUPEC.jmeno },
  { popisek: 'Telefon', sloupec: SLOUPEC.telefon },
  { popisek: 'E-mail', sloupec: SLOUPEC.email },
  { popisek: 'Zpráva', sloupec: SLOUPEC.zprava },
  { popisek: 'Nemovitost', sloupec: SLOUPEC.nemovitost },
  { popisek: 'Odkud přišel', sloupec: SLOUPEC.zdroj },
];

/* ================= PRVNÍ NASTAVENÍ ================= */

/** Založí (nebo srovná) záložku Poptávky. Pouštíš ručně, jednou. */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(LIST);

  // Když záložka není a v tabulce je jen jeden prázdný list (typicky
  // „List 1" z čerstvě založené tabulky), přejmenujeme ho místo zakládání
  // dalšího — ať v sešitu nezůstane viset prázdná záložka navíc.
  if (!sh) {
    const listy = ss.getSheets();
    sh = (listy.length === 1 && listy[0].getLastRow() === 0)
      ? listy[0].setName(LIST)
      : ss.insertSheet(LIST);
  }

  if (sh.getLastRow() === 0) {
    sh.appendRow(HLAVICKA);
    sh.getRange(1, 1, 1, HLAVICKA.length).setFontWeight('bold');
    sh.setFrozenRows(1);
    sh.setColumnWidth(SLOUPEC.zprava, 320);
  }

  // Zaškrtávátka POUZE k řádkům, které opravdu obsahují data.
  const posledni = posledniDatovyRadek(sh);
  if (posledni >= 2) {
    sh.getRange(2, SLOUPEC.vyreseno, posledni - 1, 1).insertCheckboxes();
  }

  // Pomocné sloupce schováme, ať tabulka zůstane přehledná.
  sh.hideColumns(SLOUPEC.upozorneno);
  sh.hideColumns(SLOUPEC.id);

  return 'Hotovo. Záložka „' + LIST + '" je připravená.';
}

/** Zapne automatické spouštění: každých 15 min + pondělí 8:00. */
function installTriggers() {
  // Staré triggery smažeme, aby se po opakovaném spuštění nezdvojovaly.
  ScriptApp.getProjectTriggers().forEach((t) => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('checkNovePozadavky').timeBased().everyMinutes(15).create();
  ScriptApp.newTrigger('tydenniPrehled').timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(8).create();
  return 'Triggery nastavené: kontrola po 15 minutách, přehled v pondělí v 8:00.';
}

/** Vypne všechno automatické spouštění (kdyby bylo potřeba to zastavit). */
function smazTriggery() {
  ScriptApp.getProjectTriggers().forEach((t) => ScriptApp.deleteTrigger(t));
  return 'Automatické spouštění vypnuté.';
}

/* ================= PŘÍJEM POPTÁVKY Z WEBU ================= */

function doPost(e) {
  const zamek = LockService.getScriptLock();

  // Bez zámku by dvě odeslání ve stejnou vteřinu mohla obě projít kontrolou
  // duplicit dřív, než ta první stihne řádek zapsat.
  try {
    zamek.waitLock(ZAMEK_MS);
  } catch (err) {
    return json({ ok: false, retry: true, duvod: 'Zápis je právě obsazený.' });
  }

  try {
    if (!e || !e.postData || !e.postData.contents) {
      return json({ ok: false, duvod: 'Prázdný požadavek.' });
    }

    const d = JSON.parse(e.postData.contents);

    // Past na roboty — tohle pole člověk na webu nevidí a nevyplní.
    if (d.web) return json({ ok: true, ignorovano: true });

    // Povinné údaje. Web je hlídá taky, tady je to druhá pojistka —
    // do formuláře se dá poslat i mimo něj.
    const jmeno = String(d.jmeno || '').trim();
    const telefon = String(d.telefon || '').trim();
    const email = String(d.email || '').trim();
    if (!jmeno || !telefon || !email) {
      return json({ ok: false, duvod: 'Chybí povinné údaje.' });
    }

    const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LIST);
    if (!sh) return json({ ok: false, duvod: 'Záložka ' + LIST + ' neexistuje — spusť setup().' });

    // Číslo odeslání posílá web. Vlastní vyrobíme, jen kdyby dorazil
    // požadavek ze starší, zakešované verze stránky.
    const id = String(d.requestId || noveId());

    // Tohle odeslání už v tabulce je — nejde o novou poptávku, ale o druhý
    // pokus téže. Potvrdíme ho, ale druhý řádek nezakládáme.
    if (najdiRadekPodleId(sh, id) > 0) {
      return json({ ok: true, duplicita: true });
    }

    const radek = [
      Utilities.formatDate(new Date(), 'Europe/Prague', 'd.M.yyyy HH:mm'),
      jmeno, telefon, email,
      String(d.zprava || '').trim(),
      String(d.nemovitost || '').trim(),
      String(d.zdroj || '').trim(),
      String(d.adresa || '').trim(),
      false,  // Vyřešeno
      false,  // Upozorněno
      id,
    ];

    // Nová poptávka patří nahoru, hned pod hlavičku — ať je ta nejnovější
    // vidět první a nemusíš scrollovat na konec tabulky.
    sh.insertRowBefore(2);
    // Vložený řádek zdědí formát hlavičky (tučné písmo), tak ho srovnáme.
    sh.getRange(2, 1, 1, HLAVICKA.length).clearFormat();
    sh.getRange(2, 1, 1, radek.length).setValues([radek]);
    sh.getRange(2, SLOUPEC.vyreseno).insertCheckboxes();

    // Odpověď „ok" smí odejít, až je řádek opravdu uložený.
    SpreadsheetApp.flush();

    return json({ ok: true });
  } catch (err) {
    console.error(err);
    return json({ ok: false, duvod: String(err) });
  } finally {
    zamek.releaseLock();
  }
}

/* ============ DOTAZY Z WEBU A TLAČÍTKO „VYŘEŠENO" ============ */

function doGet(e) {
  const p = (e && e.parameter) || {};

  // Kliknutí na tlačítko v e-mailu.
  if (p.action === 'resolve' && p.id) {
    const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LIST);
    const radek = najdiRadekPodleId(sh, String(p.id), true);
    if (radek > 0) {
      sh.getRange(radek, SLOUPEC.vyreseno).setValue(true);
      SpreadsheetApp.flush();
      return stranka('Označeno jako vyřešeno ✓', '#1a7f37');
    }
    return stranka('Záznam nenalezen — možná už byl smazaný.', '#b3261e');
  }

  // Kontrolní dotaz: dorazila poptávka s tímhle číslem do tabulky?
  if (p.action === 'check' && p.id) {
    const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LIST);
    return json({ ok: true, nalezeno: najdiRadekPodleId(sh, String(p.id), true) > 0 });
  }

  return stranka('Krška nemovitosti — evidence poptávek běží.', '#333');
}

/* ============ KONTROLA NOVÝCH POPTÁVEK (každých 15 minut) ============ */

function checkNovePozadavky() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LIST);
  if (!sh || sh.getLastRow() < 2) return;

  const radky = sh.getDataRange().getValues();

  for (let r = 1; r < radky.length; r++) {
    // Řádek bez vyplněného času není poptávka — přeskoč.
    // (Pojistka proti tomu, aby prázdné řádky vyvolaly e-maily.)
    if (String(radky[r][SLOUPEC.cas - 1]).trim() === '') continue;
    if (radky[r][SLOUPEC.upozorneno - 1] === true) continue;   // už odesláno

    let id = radky[r][SLOUPEC.id - 1];
    if (!id) {
      id = noveId();
      sh.getRange(r + 1, SLOUPEC.id).setValue(id);
    }

    try {
      posliUpozorneni(radky[r], id);
      // Označíme až po úspěšném odeslání. Kdyby e-mail selhal, zkusí se to
      // za dalších 15 minut znovu, místo aby poptávka zapadla.
      sh.getRange(r + 1, SLOUPEC.upozorneno).setValue(true);
    } catch (err) {
      console.error('Poptávka ' + id + ': e-mail se nepodařilo odeslat — ' + err);
    }
  }
}

function posliUpozorneni(radek, id) {
  const odkaz = odkazVyreseno(id);

  let bunky = '';
  POLE_DO_EMAILU.forEach((f) => {
    bunky += '<tr>' +
      '<td style="padding:4px 14px 4px 0;color:#666;vertical-align:top">' + esc(f.popisek) + '</td>' +
      '<td style="padding:4px 0"><b>' + esc(radek[f.sloupec - 1] || '—') + '</b></td></tr>';
  });

  const html =
    '<div style="font-family:Arial,sans-serif;font-size:14px;color:#222">' +
    '<p>Nová poptávka z webu:</p>' +
    '<table style="border-collapse:collapse">' + bunky +
    '<tr><td style="padding:4px 14px 4px 0;color:#666">Přijato</td>' +
    '<td style="padding:4px 0">' + esc(radek[SLOUPEC.cas - 1]) + '</td></tr>' +
    '</table>' +
    '<p style="margin-top:18px">' +
    '<a href="' + odkaz + '" style="background:#5F6F55;color:#fff;text-decoration:none;' +
    'padding:11px 20px;border-radius:6px;font-weight:bold">✓ Označit jako vyřešeno</a></p>' +
    '<p style="color:#888;font-size:12px">Záznam je v tabulce ' +
    esc(SpreadsheetApp.getActiveSpreadsheet().getUrl()) + '</p></div>';

  const text = 'Nová poptávka z webu:\n\n' +
    POLE_DO_EMAILU.map((f) => f.popisek + ': ' + (radek[f.sloupec - 1] || '—')).join('\n') +
    '\n\nPřijato: ' + radek[SLOUPEC.cas - 1] +
    '\n\nOznačit jako vyřešeno: ' + odkaz;

  const email = String(radek[SLOUPEC.email - 1] || '').trim();
  const zprava = {
    to: NOTIFY_EMAIL,
    subject: 'Nová poptávka — Adamov 5+kk (' + (radek[SLOUPEC.jmeno - 1] || 'bez jména') + ')',
    body: text,
    htmlBody: html,
  };
  // Odpověď na e-mail půjde rovnou zájemci.
  if (email) zprava.replyTo = email;

  MailApp.sendEmail(zprava);
}

/* ============ PONDĚLNÍ PŘEHLED NEVYŘEŠENÝCH ============ */

function tydenniPrehled() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LIST);
  const radky = (sh && sh.getLastRow() >= 2) ? sh.getDataRange().getValues() : [];

  let polozky = '';
  let pocet = 0;

  for (let r = 1; r < radky.length; r++) {
    if (String(radky[r][SLOUPEC.cas - 1]).trim() === '') continue;   // prázdný řádek
    if (radky[r][SLOUPEC.vyreseno - 1] === true) continue;           // vyřešené
    pocet++;

    const shrnuti = [
      radky[r][SLOUPEC.jmeno - 1],
      radky[r][SLOUPEC.telefon - 1],
      radky[r][SLOUPEC.email - 1],
    ].map((h) => esc(h || '—')).join(' · ');

    polozky += '<li style="margin:7px 0">' + esc(radky[r][SLOUPEC.cas - 1]) + ' — ' + shrnuti +
      ' &nbsp;<a href="' + odkazVyreseno(radky[r][SLOUPEC.id - 1]) + '">vyřešit</a></li>';
  }

  const html = pocet === 0
    ? '<div style="font-family:Arial,sans-serif;font-size:14px;color:#222">' +
      '<p><b>Žádné nevyřešené poptávky.</b></p>' +
      '<p style="color:#888">Tahle zpráva je zároveň kontrola, že skript běží.</p></div>'
    : '<div style="font-family:Arial,sans-serif;font-size:14px;color:#222">' +
      '<p>Nevyřešené poptávky (' + pocet + '):</p><ul>' + polozky + '</ul></div>';

  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: 'Krška nemovitosti — nevyřešené poptávky (' + pocet + ')',
    body: 'Nevyřešených poptávek: ' + pocet + '. Detail je v HTML verzi e-mailu.',
    htmlBody: html,
  });
}

/* ================= POMOCNÉ ================= */

/**
 * Číslo řádku se zadaným ID, jinak 0.
 * Ve výchozím stavu prohledá jen nejnovější záznamy — opakované odeslání
 * přichází v řádu vteřin. Tlačítko „Vyřešeno" se ale může proklikat
 * i po měsících, proto si umí říct o celou tabulku (cela = true).
 */
function najdiRadekPodleId(sh, id, cela) {
  if (!sh) return 0;
  const posledni = cela ? sh.getLastRow() : Math.min(sh.getLastRow(), DEDUP_RADKU + 1);
  if (posledni < 2) return 0;

  const hodnoty = sh.getRange(2, SLOUPEC.id, posledni - 1, 1).getValues();
  for (let r = 0; r < hodnoty.length; r++) {
    if (String(hodnoty[r][0]) === String(id)) return r + 2;
  }
  return 0;
}

/** Číslo posledního řádku, který má vyplněný čas. Prázdné se nepočítají. */
function posledniDatovyRadek(sh) {
  const cas = sh.getRange(1, SLOUPEC.cas, sh.getMaxRows(), 1).getValues();
  for (let r = cas.length - 1; r >= 0; r--) {
    if (String(cas[r][0]).trim() !== '') return r + 1;
  }
  return 1;
}

function noveId() {
  return 'ID' + Date.now().toString(36) + Math.floor(Math.random() * 100000).toString(36);
}

function odkazVyreseno(id) {
  const zaklad = WEBAPP_URL || ScriptApp.getService().getUrl();
  return zaklad + '?action=resolve&id=' + encodeURIComponent(id);
}

function stranka(zprava, barva) {
  return HtmlService.createHtmlOutput(
    '<div style="font-family:Arial,sans-serif;text-align:center;margin-top:60px">' +
    '<p style="font-size:20px;color:' + barva + '">' + esc(zprava) + '</p>' +
    '<p style="color:#888">Okno můžete zavřít.</p></div>');
}

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function json(obsah) {
  return ContentService.createTextOutput(JSON.stringify(obsah))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ================= TESTOVÁNÍ ================= */

/**
 * Zapíše do tabulky zkušební poptávku — jako by přišla z webu.
 * Pak spusť checkNovePozadavky a přijde e-mail s tlačítkem.
 * Zkušební řádek potom smaž.
 */
function zkusebniPoptavka() {
  return doPost({ postData: { contents: JSON.stringify({
    requestId: 'TEST-' + Date.now(),
    jmeno: 'Zkušební poptávka',
    telefon: '+420 000 000 000',
    email: NOTIFY_EMAIL,
    zprava: 'Tohle je jen test, řádek můžeš smazat.',
    nemovitost: '5+kk, K Rybníku, Adamov u Českých Budějovic',
    zdroj: 'test z editoru',
    adresa: '—',
  }) } }).getContent();
}

/** Vypíše, co je nastavené — rychlá kontrola, že nic nechybí. */
function kontrolaNastaveni() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(LIST);
  const triggery = ScriptApp.getProjectTriggers()
    .map((t) => t.getHandlerFunction()).join(', ') || 'žádné';

  const zprava =
    'E-maily chodí na: ' + NOTIFY_EMAIL + '\n' +
    'Záložka „' + LIST + '": ' + (sh ? 'existuje' : 'CHYBÍ — spusť setup()') + '\n' +
    'Poptávek v tabulce: ' + (sh ? Math.max(0, posledniDatovyRadek(sh) - 1) : 0) + '\n' +
    'WEBAPP_URL: ' + (WEBAPP_URL || 'NEVYPLNĚNO — doplň adresu končící na /exec') + '\n' +
    'Triggery: ' + triggery;

  console.log(zprava);
  return zprava;
}
