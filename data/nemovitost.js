/**
 * VŠECHNA DATA STRÁNKY NA JEDNOM MÍSTĚ
 * ------------------------------------
 * Pro další nemovitost stačí zkopírovat celou složku projektu, přepsat tenhle soubor
 * a vyměnit obrázky ve složce assets/. Do index.html ani main.js se nesahá.
 */

const NEMOVITOST = {

  /* --- Adresa webu ----------------------------------------------------------
   * POZOR: po nasazení na Vercel sem patří skutečná adresa, bez lomítka na konci.
   * Používá se pro canonical, sitemapu, Open Graph a strukturovaná data — dokud
   * nesedí, vyhledávače i Facebook míří na neexistující stránku.
   * ------------------------------------------------------------------------ */
  web: {
    adresa: 'https://jan-krska-adamov.vercel.app',
    // Předpona názvů obrázků. Kvůli vyhledávání obrázků má soubor říkat,
    // co je na něm — ne IMG_2841.webp.
    predponaSouboru: 'dum-adamov-5kk',
  },

  /* --- Značka a hlavička --------------------------------------------------- */
  znacka: {
    nazev: 'JK nemovitosti',
    monogram: 'JK',        // písmena v zeleném kolečku loga
    // Až se značka změní, stačí přepsat tyhle dva řádky.
  },

  /* --- Kontakt ------------------------------------------------------------- */
  kontakt: {
    jmeno: 'Jan Krška',
    role: 'Prodej nemovitosti',
    telefon: '+420 606 489 134',
    telefonLink: '+420606489134',   // bez mezer, pro klikání na mobilu
    email: 'jan-krska@seznam.cz',
    // Fotku doplníš tak, že sem napíšeš cestu, např. 'assets/makler/jan-krska.webp'.
    // Když je prázdné, zobrazí se místo fotky iniciály.
    foto: '',
    predstaveni: 'Jednáte přímo se mnou, bez realitní kanceláře mezi námi. ' +
                 'Na prohlídku se domluvíme podle vás, klidně i večer nebo o víkendu.',
  },

  /* --- Hlavička nemovitosti ------------------------------------------------ */
  hlavicka: {
    typ: 'Novostavba rodinného domu',
    dispozice: '5+kk',
    plocha: '193 m²',
    lokalita: 'K Rybníku, Adamov u Českých Budějovic',
    cena: '17 499 000 Kč',
    cenaPoznamka: 'včetně pozemku 815 m²',
    // Čtyři nejsilnější údaje do úvodního bloku
    zvyrazneni: [
      { hodnota: '5+kk',    popis: 'dispozice' },
      { hodnota: '193 m²',  popis: 'užitná plocha' },
      { hodnota: '815 m²',  popis: 'pozemek' },
      { hodnota: 'B',       popis: 'energetická třída' },
    ],
  },

  /* --- Úvodní prodejní text ------------------------------------------------ */
  uvod: {
    nadpis: 'Postaveno pro každodenní život rodiny',
    odstavce: [
      'Dovolujeme si Vám nabídnout výjimečnou novostavbu zděného přízemního rodinného domu ' +
      'v žádané lokalitě o dispozici 5+kk, která je postavena s důrazem na kvalitní materiál, ' +
      'moderní technologie a maximální prostorný komfort. Dům je navržen a uspořádán tak, ' +
      'aby poskytl maximální praktičnost, úsporu a komfort pro každodenní život celé rodiny.',

      { nadpis: 'Dispozice domu', text:
        'Velkorysý obývací pokoj s kuchyňským koutem a přípravou na krbová kamna se vstupem ' +
        'na jižní slunnou terasu a zahradu, ložnice se vstupem na terasu, pracovna, dva pokoje, ' +
        'šatna, prostorná vstupní hala a chodba, dvě koupelny se sprchou a vanou, tři WC + pisoár, ' +
        'technická místnost, garáž a parkovací venkovní stání na pozemku pro 3 auta. ' +
        'Pro lepší komfort je možno vstoupit ze zahrady do technické místnosti, kde je umístěné ' +
        'WC, pisoár a umyvadlo.' },

      { nadpis: 'Technická část domu', text:
        'Dům je postaven z cihel Heluz 50 2v1, okna plastová trojsklo, nadstandardní interiérové ' +
        'dveře se světlou výškou 2,10 m, světlovody pro přívod světla v chodbě a koupelně, ' +
        'podlahové topení napojené na tepelné čerpadlo voda-vzduch se zásobníkem na ohřev teplé ' +
        'vody 300 l Viessmann, použity byly italské dlažby a sanita, retenční nádrž na dešťovou ' +
        'vodu 6 m³ s propojením na WC a zahradu, venkovní elektrické rolety, vrata a branky ' +
        'budou součástí dodávky domu.' },
    ],
  },

  /* --- Video --------------------------------------------------------------- */
  video: {
    soubor: 'assets/video/dum-adamov-5kk-prohlidka.mp4',
    nahled: 'assets/video/dum-adamov-5kk-video-nahled.webp',
    nadpis: 'Podívejte se na váš nový rodinný dům ve 2 minutách',
    popis: '',
  },

  /* --- Galerie -------------------------------------------------------------
   * Pořadí záložek určuje pořadí v tomhle poli.
   * "upozorneni" se vypíše nad galerií — používej u vizualizací.
   * ------------------------------------------------------------------------ */
  galerie: [
    {
      id: 'exterier',
      nazev: 'Dům zvenku',
      pocet: 9,
      popisky: [
        'Dům z jižní zahrady', 'Jižní strana s terasou', 'Terasa a pozemek',
        'Pohled od zahrady', 'Dům z ulice', 'Příjezd ke garáži',
        'Vjezd a zádlažba', 'Dům za soumraku', 'Osvětlený dům z výšky',
      ],
    },
    {
      id: 'interier',
      nazev: 'Interiér',
      pocet: 33,
      popisky: [
        'Obývací pokoj s kuchyňským koutem', 'Obývací pokoj — výhled na terasu',
        'Obývací pokoj', 'Obývací pokoj — kuchyňská část', 'Obývací pokoj od vstupu',
        'Obývací pokoj', 'Obývací pokoj — otevřený prostor', 'Místo pro jídelní stůl',
        'Obývací pokoj — celkový pohled', 'Chodba k pokojům', 'Pokoj',
        'Pokoj', 'Pokoj', 'Pokoj se vstupem do šatny',
        'Koupelna s vanou a sprchou', 'Koupelna — sprchový kout',
        'Pokoj s oknem do zahrady', 'Pokoj', 'Vstupní hala',
        'Šatna', 'Pokoj', 'Pokoj', 'Druhá koupelna',
        'Koupelna — umyvadlo a WC', 'Sprchový kout', 'Vstup z terasy',
        'Chodba', 'Technická místnost — zásobník teplé vody',
        'Technická místnost s umyvadlem a WC', 'Chodba do garáže',
        'Garáž', 'Garáž se vstupem do domu', 'Garáž — schody do domu',
      ],
    },
    {
      id: 'zvysky',
      nazev: 'Pozemek a okolí',
      pocet: 9,
      popisky: [
        'Pozemek s vyznačenou hranicí', 'Výměra pozemku 815 m²',
        'Poloha domu v ulici', 'Dům a sousedství',
        'Zahrada z výšky', 'Celý pozemek', 'Adamov a okolní krajina',
        'Obec za soumraku', 'Poloha domu v obci',
      ],
    },
    {
      id: 'vizualizace',
      nazev: 'Vizualizace',
      pocet: 7,
      upozorneni: 'Následující obrázky jsou vizualizace navrhovaného stavu, ' +
                  'ne fotografie. Dům se prodává nezařízený.',
      popisky: [
        'Zahrada a terasa — návrh', 'Dětský pokoj — návrh',
        'Obývací pokoj — návrh', 'Jídelna a kuchyně — návrh',
        'Pracovna — návrh', 'Ložnice — návrh', 'Dům večer — návrh',
      ],
    },
  ],

  /* --- Parametry v bodech -------------------------------------------------- */
  parametry: [
    { skupina: 'Dispozice a plochy', polozky: [
      ['Dispozice', '5+kk'],
      ['Užitná plocha', '193 m²'],
      ['Zastavěná plocha', '235 m²'],
      ['Plocha pozemku', '815 m²'],
      ['Z toho zahrada', '500 m²'],
      ['Podlaží', 'přízemní, bez schodů'],
    ]},
    { skupina: 'Stav a konstrukce', polozky: [
      ['Stav', 'novostavba, nezařízená'],
      ['Kolaudace', '2026'],
      ['Konstrukce', 'cihla Heluz 50 2v1'],
      ['Okna', 'plastová, trojsklo'],
      ['Interiérové dveře', 'výška 2,10 m'],
      ['Světlovody', 'chodba a koupelna'],
    ]},
    { skupina: 'Technologie a energie', polozky: [
      ['Energetická třída', 'B — velmi úsporná'],
      ['Spotřeba', '115 kWh/m²·rok'],
      ['Vytápění', 'podlahové, tepelné čerpadlo'],
      ['Ohřev vody', 'zásobník Viessmann 300 l'],
      ['Dešťová voda', 'retenční nádrž 6 m³'],
      ['Elektřina', '230/380 V, jistič 25 A'],
      ['Odpad', 'veřejná kanalizace'],
    ]},
    { skupina: 'Vybavení a zázemí', polozky: [
      ['Garáž', 'ano + 3 venkovní stání'],
      ['Terasa', 'jižní, z obýváku i ložnice'],
      ['Koupelny', '2 — sprcha i vana'],
      ['Toalety', '3 + pisoár'],
      ['Povrchy', 'italské dlažby a sanita'],
      ['Stínění', 'venkovní elektrické rolety'],
      ['Vrata a branky', 'součástí dodávky'],
    ]},
  ],

  /* --- Půdorys ------------------------------------------------------------- */
  pudorys: {
    obrazek: 'assets/pudorys/dum-adamov-5kk-pudorys.webp',
    nahled: 'assets/pudorys/dum-adamov-5kk-pudorys-nahled.webp',
    popis: 'Celý dům v jedné rovině. Kliknutím si půdorys zvětšíte.',
  },

  /* --- Lokalita ------------------------------------------------------------
   * Vzdálenosti pocházejí z inzerátu na Sreality.
   * ------------------------------------------------------------------------ */
  lokalita: {
    nadpis: 'Adamov u Českých Budějovic',
    uvod: 'Lokalita Adamov–Hůry nabízí ideální kombinaci klidného rodinného bydlení ' +
          's občanskou vybaveností. Do centra Českých Budějovic to trvá přibližně 9 minut, ' +
          'dálnice D3 je vzdálena pouhých 6 minut jízdy autem a v blízkosti je hlavní tah ' +
          'na Třeboň. V obci je mateřská škola i autobusové spojení pro školáky.',
    mapaObrazek: 'assets/fotky/zvysky/dum-adamov-5kk-zvysky-09.webp',
    // Malá mapa v mřížce vybavenosti. Je to obrázek stažený předem,
    // takže se za návštěvníka nic nenačítá z cizího serveru.
    mapaVyrez: 'assets/mapa/dum-adamov-5kk-mapa.webp',
    mapaOdkaz: 'https://mapy.cz/zakladni?q=K%20Rybn%C3%ADku%2C%20Adamov%20u%20%C4%8Cesk%C3%BDch%20Bud%C4%9Bjovic',
    doprava: [
      ['Autobusová zastávka Adamov, Na Lukách', '85 m'],
      ['Centrum Českých Budějovic', '9 minut autem'],
      ['Nájezd na dálnici D3', '6 minut autem'],
    ],
    vybavenost: [
      { skupina: 'Škola a školka', polozky: [
        ['MŠ Hůry', '1 000 m'],
        ['ZŠ a MŠ Rudolfov', '1 700 m'],
      ]},
      { skupina: 'Nákupy a jídlo', polozky: [
        ['Motorest Florida', '275 m'],
        ['Hospoda Pod kaštanem', '1 780 m'],
        ['Večerka Libnič', '1 740 m'],
        ['Pekařství Na Borku', '4 370 m'],
        ['Nákupní centrum Kruh', '4 430 m'],
      ]},
      { skupina: 'Zdraví', polozky: [
        ['Praktická lékařka', '4 210 m'],
        ['Lékárna Lišov', '4 240 m'],
        ['Veterinář', '2 210 m'],
      ]},
      { skupina: 'Volný čas', polozky: [
        ['Dětské hřiště', '299 m'],
        ['Sokol Rudolfov', '1 450 m'],
        ['Kino Svět', '4 270 m'],
      ]},
      { skupina: 'Úřady a služby', polozky: [
        ['Pošta Rudolfov', '1 675 m'],
        ['Bankomat', '4 230 m'],
      ]},
    ],
  },

  /* --- Formulář ------------------------------------------------------------
   * ADRESA SKRIPTU: sem přijde adresa z Google Apps Script (končí na /exec).
   * Dokud je prázdná, formulář se neodešle a napíše to na obrazovku.
   * ------------------------------------------------------------------------ */
  formular: {
    adresaSkriptu: '',
    nadpis: 'Domluvte si prohlídku',
    podnadpis: 'Ozvu se vám do 24 hodin. V případě, že si chcete domluvit termín ' +
               'okamžitě, jsem k dispozici na telefonu.',
    souhlasText: 'Souhlasím se zpracováním údajů za účelem vyřízení mojí poptávky.',
    dekujeme: 'Děkuji, poptávka dorazila. Ozvu se vám do 24 hodin.',
    chyba: 'Odeslání se nepovedlo. Zkuste to prosím znovu, nebo mi rovnou zavolejte.',
  },

  /* --- Měření --------------------------------------------------------------
   * Nech prázdné, dokud nemáš skutečná ID. Prázdná hodnota = kód se nevloží.
   * Meta pixel se spustí až po souhlasu s cookies.
   * ------------------------------------------------------------------------ */
  mereni: {
    ga4: '',        // např. 'G-XXXXXXXXXX'
    metaPixel: '',  // např. '123456789012345'
  },

  /* --- Patička ------------------------------------------------------------- */
  paticka: {
    adresa: 'Růžová 282, 373 65 Dolní Bukovsko',
    ico: '72131667',   // ověřeno v ARESu
    zasadyOdkaz: 'zasady-ochrany-osobnich-udaju.html',
  },
};
