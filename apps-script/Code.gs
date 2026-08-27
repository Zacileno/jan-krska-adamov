/**
 * KRŠKA NEMOVITOSTI — příjem poptávek z webu
 * ==========================================
 *
 * Co to dělá: přijme odeslaný formulář z webu, zapíše ho jako řádek do téhle
 * tabulky a pošle e-mail s upozorněním.
 *
 * JAK TO ZPROVOZNIT (celé se to dělá v Googlu, ne v kódu webu):
 *
 *  1. Založ novou Google tabulku a pojmenuj ji „Krška — poptávky".
 *  2. V ní jdi na  Rozšíření → Apps Script.  Otevře se editor kódu.
 *  3. Smaž, co tam je, a vlož celý tenhle soubor.
 *  4. Níže v NASTAVENÍ přepiš e-mail, na který mají poptávky chodit.
 *  5. Klikni na  Nasadit → Nové nasazení.
 *       Typ:                Webová aplikace
 *       Spustit jako:       Já
 *       Kdo má přístup:     Kdokoli          ← musí být, jinak web nic neodešle
 *  6. Google si vyžádá povolení (posílat e-maily, upravovat tabulku) — potvrď je.
 *     U hlášky „Google tuto aplikaci neověřil" klikni na Rozšířené → Přejít na…
 *  7. Zkopíruj vzniklou adresu (končí na /exec) a vlož ji do souboru
 *     data/nemovitost.js na řádek  adresaSkriptu: ''
 *
 *  Když později kód změníš, musíš znovu  Nasadit → Spravovat nasazení → upravit
 *  a zvolit novou verzi. Jinak poběží pořád ta stará.
 */

/* ============ NASTAVENÍ ============ */

var NASTAVENI = {
  // Kam mají chodit e-maily s poptávkami. Víc adres odděl čárkou.
  prijemce: 'jan-krska@seznam.cz',

  // Název listu v tabulce, kam se zapisuje.
  list: 'Poptávky',

  // Předmět e-mailu.
  predmet: 'Nová poptávka z webu — Adamov 5+kk',
};

/* ============ PŘÍJEM POPTÁVKY ============ */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    // Zahodit zjevný spam: prázdné jméno nebo chybějící kontakt.
    if (!data.jmeno || (!data.telefon && !data.email)) {
      return odpoved({ ok: false, duvod: 'chybí povinné údaje' });
    }

    zapisDoTabulky(data);
    posliEmail(data);

    return odpoved({ ok: true });
  } catch (chyba) {
    // Chyba se propíše do Apps Script → Spuštění, ať je vidět, co se stalo.
    console.error(chyba);
    return odpoved({ ok: false, duvod: String(chyba) });
  }
}

/** Kontrola v prohlížeči, že je skript nasazený a odpovídá. */
function doGet() {
  return odpoved({ ok: true, zprava: 'Skript běží. Poptávky posílejte metodou POST.' });
}

/* ============ ZÁPIS DO TABULKY ============ */

function zapisDoTabulky(data) {
  var sesit = SpreadsheetApp.getActiveSpreadsheet();
  var list = sesit.getSheetByName(NASTAVENI.list);

  // Když list ještě neexistuje, založíme ho i s hlavičkou.
  if (!list) {
    list = sesit.insertSheet(NASTAVENI.list);
    list.appendRow([
      'Datum a čas', 'Jméno', 'Telefon', 'E-mail',
      'Zpráva', 'Nemovitost', 'Odkud přišel', 'Adresa stránky',
    ]);
    list.getRange(1, 1, 1, 8).setFontWeight('bold');
    list.setFrozenRows(1);
  }

  list.appendRow([
    new Date(),
    data.jmeno || '',
    data.telefon || '',
    data.email || '',
    data.zprava || '',
    data.nemovitost || '',
    data.zdroj || '',
    data.adresa || '',
  ]);
}

/* ============ E-MAIL ============ */

function posliEmail(data) {
  var telo =
    'Právě přišla nová poptávka z webu.\n\n' +
    'Jméno:      ' + (data.jmeno || '—') + '\n' +
    'Telefon:    ' + (data.telefon || '—') + '\n' +
    'E-mail:     ' + (data.email || '—') + '\n' +
    'Zpráva:     ' + (data.zprava || '—') + '\n\n' +
    'Nemovitost: ' + (data.nemovitost || '—') + '\n' +
    'Odkud:      ' + (data.zdroj || '—') + '\n' +
    'Stránka:    ' + (data.adresa || '—') + '\n\n' +
    'Celý přehled poptávek je v tabulce:\n' +
    SpreadsheetApp.getActiveSpreadsheet().getUrl();

  MailApp.sendEmail({
    to: NASTAVENI.prijemce,
    subject: NASTAVENI.predmet + ' — ' + (data.jmeno || 'bez jména'),
    body: telo,
    replyTo: data.email || undefined,   // odpověď půjde rovnou zájemci
  });
}

/* ============ POMOCNÉ ============ */

function odpoved(obsah) {
  return ContentService
    .createTextOutput(JSON.stringify(obsah))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Zkušební spuštění přímo z editoru (tlačítko Spustit).
 * Ověří, že zápis do tabulky i odesílání e-mailu fungují,
 * aniž bys musela vyplňovat formulář na webu.
 */
function test() {
  var zkusebni = {
    jmeno: 'Zkušební poptávka',
    telefon: '+420 000 000 000',
    email: 'test@example.com',
    zprava: 'Tohle je jen test, můžeš řádek v tabulce smazat.',
    nemovitost: '5+kk, K Rybníku, Adamov u Českých Budějovic',
    zdroj: 'test z editoru',
    adresa: '—',
  };
  zapisDoTabulky(zkusebni);
  posliEmail(zkusebni);
}
