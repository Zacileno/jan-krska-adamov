# Zadání projektu — prodejní stránka Krška nemovitosti

Zapsáno 27. srpna 2026 podle rozhovoru s Michaelou.

## K čemu stránka je

Jan Krška prodává nemovitosti, ale **nemá realitní kancelář**. Potřebuje jednostránkový
web pro jednu konkrétní nemovitost, na který povedou placené reklamy na Facebooku
a Instagramu.

Stránka **neinformuje, ale prodává schůzku**. Návštěvník přichází z reklamy, dá stránce
pár vteřin a buď zavolá / vyplní formulář, nebo odejde. Všechno ostatní je tomu podřízené.

Nevzniká z toho web realitní kanceláře. Pro každou další nemovitost se stránka předělá.

## Rozhodnutí, která padla

| Věc | Rozhodnutí | Proč |
|---|---|---|
| Značka | Pracovně **Krška nemovitosti** | Jan své jméno v názvu nechce; v kódu je na jednom místě, aby šlo vyměnit |
| Technologie | Statické HTML/CSS/JS | Na Vercelu zdarma, načte se okamžitě — u placené návštěvnosti rozhoduje každá vteřina |
| Formulář | Google Apps Script → tabulka + e-mail | Zdarma, bez další služby, poptávky vidí Michaela hned v tabulce |
| Měření | Meta pixel + GA4 | Kampaně poběží na Metě; pixel se spustí až po souhlasu s cookies |
| Fotka Jana | Nemáme, nečekáme na ni | Kontaktní blok stojí na velkém telefonním čísle; místo pro fotku je připravené |
| Role Jana | Zprostředkovatel bez kanceláře | Texty vedou k „jednáte přímo se mnou"; nikde netvrdíme, že je majitel nebo stavitel |

## Vizuální styl

Paleta je vzatá z fotek samotného domu — bílé stěny, dubová podlaha, béžové textilie,
tmavé dřevo, zeleň. Luxus nese teplo a klid, ne černá se zlatou. Přátelskost nesou
zaoblené rohy a béžová.

Krémová `#FAF7F2` · greige `#F1EBE2` · espresso `#2E2823` · šalvěj `#5F6F55` · dub `#B08D6A`
Nadpisy serifem Fraunces, text Inter.

## Struktura stránky

Hlavička → úvodní blok s cenou → prodejní text → video → galerie → parametry v bodech
→ půdorys → lokalita → kontakt na Jana → formulář → patička.

Tlačítko „Rezervovat prohlídku" se opakuje po každé velké sekci. Na mobilu je u spodního
okraje trvale viditelná lišta *Zavolat / Prohlídka* — z Mety chodí většina lidí z mobilu.

## Podklady

Zdroj údajů: [inzerát na Sreality](https://www.sreality.cz/detail/prodej/dum/rodinny/adamov-adamov-k-rybniku/3345797196)

Fotky, video a půdorys dodala Michaela; originály jsou ve složce `podklady/`
(nejsou v gitu, mají skoro 900 MB).

## Na co si dát pozor

**Fotky chodí v párech.** Většina záběrů existuje dvakrát: jednou bez popisku a jednou
s popiskem „VIZUALIZACE / NAVRHOVANÝ STAV". Týká se to zeleného trávníku, zařízeného
interiéru i noční fotky s osvětlenou terasou. Na stránce používáme **výhradně verze
s popiskem** a galerie má vlastní záložku Vizualizace s vysvětlením. U nemovitosti
za 17,5 milionu si zájemce rozdíl při prohlídce vybaví.

**Popisky interiéru jsou úmyslně obecné.** Dům je nezařízený a v prázdném pokoji nejde
poznat ložnice od pracovny. Píšeme „Pokoj", ne odhad. Až Jan řekne, který je který,
doplní se to v `data/nemovitost.js`.

**Půdorys má vodoznak REALITY.CZ** a uvádí celkem 190,98 m², zatímco inzerát mluví
o 193 m². Stálo by za to sehnat od Jana původní půdorys bez cizí značky a rozdíl
si u něj ověřit.

**Video má vypálené titulky** skoro v každém záběru, takže náhledový obrázek nejde vzít
z videa — použili jsme ořezanou fotku domu.

## Co ještě chybí

- Fotka Jana Kršky
- IČO a adresa do patičky a zásad ochrany osobních údajů
- ID pro GA4 a Meta pixel
- Adresa Apps Scriptu (Michaela ji vytvoří ve svém Google účtu)
- Půdorys bez vodoznaku
