# Krška nemovitosti — prodejní stránka nemovitosti

Jednostránkový web pro **jednu konkrétní nemovitost**, na který vedou placené reklamy.
Cílem stránky je z návštěvníka udělat poptávku na prohlídku — proto se tlačítko
„Rezervovat prohlídku" opakuje po každé velké sekci a na mobilu je u spodního okraje
stále viditelná lišta se dvěma tlačítky.

Čisté HTML, CSS a JavaScript. Žádný build, žádné knihovny zvenčí.
Nasazuje se z GitHubu na Vercel.

---

## Aktuální nemovitost

Novostavba rodinného domu 5+kk, 193 m², pozemek 815 m²,
K Rybníku, Adamov u Českých Budějovic. Cena 17 499 000 Kč.

---

## Jak to spustit u sebe

```bash
python3 -m http.server 8777
```

Pak otevři <http://localhost:8777>. Otevřít `index.html` dvojklikem nestačí —
prohlížeč by zablokoval načtení dat.

---

## Kde se co mění

| Chci změnit | Soubor |
|---|---|
| Cenu, parametry, texty, kontakt, popisky fotek | `data/nemovitost.js` |
| Barvy, písmo, rozestupy | `css/style.css` (proměnné hned nahoře) |
| Pořadí sekcí, jejich nadpisy | `index.html` |
| Chování galerie, formuláře, lišty se souhlasem | `js/main.js` |

**`data/nemovitost.js` je jediný soubor, který se pro další nemovitost mění.**

---

## Předělání na další nemovitost

1. Zkopíruj celou složku projektu pod novým názvem.
2. Smaž obsah `assets/fotky/`, `assets/video/` a `assets/pudorys/`.
3. Nachystej nové fotky (postup níže) a vlož je do stejné struktury složek.
4. Přepiš `data/nemovitost.js` — cenu, parametry, texty, počty fotek, popisky.
5. Vyměň `assets/og-image.jpg` (náhled při sdílení odkazu na Facebooku).
6. Uprav `<title>` a `<meta name="description">` v `index.html`.

Do `index.html` ani `js/main.js` se jinak nesahá.

### Příprava fotek

Fotky musí být ve WebP a v každé skupině pojmenované po pořadí, plus zmenšený
náhled pro mřížku:

```
assets/fotky/exterier/exterier-01.webp          ← pro zvětšení, delší strana 1600 px
assets/fotky/exterier/exterier-01-nahled.webp   ← do mřížky, delší strana 800 px
```

Převod z JPEG (potřebuje Python s knihovnou Pillow):

```python
from PIL import Image
im = Image.open('original.jpg').convert('RGB')
velky = im.copy();  velky.thumbnail((1600, 1600), Image.LANCZOS)
velky.save('exterier-01.webp', 'WEBP', quality=80, method=6)
nahled = im.copy(); nahled.thumbnail((800, 800), Image.LANCZOS)
nahled.save('exterier-01-nahled.webp', 'WEBP', quality=76, method=6)
```

V `data/nemovitost.js` pak jen uprav `pocet` a seznam `popisky`.

### Příprava videa

Web nesmí dostat surové 4K — to má stovky megabajtů. Na tomhle Macu je
samostatná binárka `ffmpeg` v `~/.local/bin/`:

```bash
~/.local/bin/ffmpeg -i original.mov \
  -vf "scale=1920:-2" -c:v libx264 -crf 24 -preset slow \
  -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart \
  assets/video/nazev.mp4
```

Pokud má video vypálené černé pruhy, nejdřív je najdi a ořízni:

```bash
~/.local/bin/ffmpeg -ss 30 -i original.mov -t 5 -vf cropdetect -f null - 2>&1 | grep crop=
# a výsledek přidej do -vf, např.: -vf "crop=3840:1640:0:260,scale=1920:-2"
```

Náhledový obrázek videa (`assets/video/poster.webp`) je ořezaná fotka domu ve
stejném poměru stran jako video.

---

## Formulář

Poptávky přijímá Google Apps Script, který je zapíše do Google tabulky a pošle
e-mailem. Návod na zprovoznění je v komentáři na začátku `apps-script/Code.gs`.

Výslednou adresu skriptu (končí na `/exec`) vlož do `data/nemovitost.js`
do pole `formular.adresaSkriptu`. **Dokud je prázdná, formulář nic neodešle**
a návštěvníkovi napíše, ať zavolá.

Proti robotům je ve formuláři skryté pole, které člověk nevidí. Když ho někdo
vyplní, odeslání se tiše zahodí. Z jednoho prohlížeče navíc nejde odeslat víc
poptávek během 30 vteřin.

---

## Měření

ID se vyplňují v `data/nemovitost.js` v části `mereni`:

```js
mereni: {
  ga4: 'G-XXXXXXXXXX',
  metaPixel: '123456789012345',
},
```

Dokud jsou prázdná, žádný měřicí kód se do stránky nevloží a lišta se souhlasem
se nezobrazí. Meta pixel i Google Analytics se spustí **až po souhlasu**
v cookie liště. Po odeslání formuláře se odešle konverze `Lead` (Meta)
a `generate_lead` (GA4).

Mapa je záměrně jen obrázek s odkazem na Mapy.cz — vložená Google mapa by
nastavovala cookies ještě před souhlasem.

---

## SEO

Hotové: `robots.txt`, generovaná `sitemap.xml`, meta tagy s `canonical`, Open Graph
a Twitter cards na obou stránkách, náhled sdílení 1200 × 630, favicon i apple-touch-icon,
obrázky ve WebP s lazy loadingem a rozměry, mluvící názvy souborů, alt texty,
prolinkování v patičce a strukturovaná data JSON-LD
(Organization + WebSite + RealEstateListing na hlavní stránce, BreadcrumbList v zásadách).

**Adresa webu je na jednom místě** — `data/nemovitost.js` → `web.adresa`. Po nasazení
na Vercel ji přepiš na skutečnou doménu a znovu pusť generátor sitemapy, jinak
`canonical` i sitemapa míří jinam, než web doopravdy běží.

### Dva skripty, které se pouštějí ručně

```bash
python3 nastroje/generuj-sitemap.py    # po každé změně obsahu nebo přidání stránky
python3 nastroje/generuj-rozmery.py    # po každé výměně fotek
```

`generuj-rozmery.py` zapisuje `data/rozmery.js` — z něj se obrázkům doplňují rozměry,
aby stránka při načítání neposkakovala. Ten soubor se nikdy needituje ručně.

### Co se záměrně nedělá

`SearchAction` ve strukturovaných datech chybí, protože web nemá vyhledávání.
Označit ho, když neexistuje, je nepravdivé a Google to ignoruje nebo penalizuje.
Až by na webu vyhledávání bylo, doplní se.

---

## Nasazení

```
lokálně → GitHub → Vercel (automaticky při každém pushnutí)
```

Ve Vercelu se projekt zakládá jako **statický web bez build příkazu**
(framework preset: Other, output directory: kořen repozitáře).

Složka `podklady/` je v `.gitignore` — obsahuje skoro 900 MB originálních
fotek a videí, které na GitHub nepatří.

---

## Co ještě chybí

- [ ] Fotka Jana Kršky do kontaktního bloku (`kontakt.foto` v datovém souboru)
- [ ] IČO a adresa do patičky a do zásad ochrany osobních údajů
- [ ] ID pro GA4 a Meta pixel
- [ ] Adresa Apps Scriptu pro formulář
- [ ] Půdorys bez cizího vodoznaku
- [ ] Po nasazení přepsat `web.adresa` na skutečnou doménu a pustit generátor sitemapy
- [ ] Vložit sitemapu do Google Search Console
