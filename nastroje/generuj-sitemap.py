#!/usr/bin/env python3
"""
Vygeneruje sitemap.xml ze všech HTML souborů v kořeni projektu.

Spusť po každé změně obsahu:   python3 nastroje/generuj-sitemap.py

Stránky s "noindex" se do sitemapy nedávají — nemá smysl posílat vyhledávač
na stránku, kterou mu zároveň zakazujeme indexovat.
"""
import glob, os, datetime, re, sys
import xml.sax.saxutils as x

KOREN = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(KOREN)

# Adresa se bere z datového souboru, ať není na dvou místech.
data = open('data/nemovitost.js', encoding='utf-8').read()
shoda = re.search(r"adresa:\s*'([^']+)'", data)
if not shoda:
    sys.exit('V data/nemovitost.js chybí web.adresa — sitemapu nelze vygenerovat.')
ADRESA = shoda.group(1).rstrip('/')

PRIORITY = {'index.html': ('1.0', 'weekly')}
VYCHOZI = ('0.5', 'monthly')

radky = []
for soubor in sorted(glob.glob('*.html')):
    obsah = open(soubor, encoding='utf-8').read()
    if re.search(r'name="robots"\s+content="[^"]*noindex', obsah):
        print(f'  přeskočeno (noindex): {soubor}')
        continue
    cesta = '' if soubor == 'index.html' else soubor
    datum = datetime.date.fromtimestamp(os.path.getmtime(soubor)).isoformat()
    priorita, frekvence = PRIORITY.get(soubor, VYCHOZI)
    radky.append(
        '  <url>\n'
        f'    <loc>{x.escape(ADRESA + "/" + cesta)}</loc>\n'
        f'    <lastmod>{datum}</lastmod>\n'
        f'    <changefreq>{frekvence}</changefreq>\n'
        f'    <priority>{priorita}</priority>\n'
        '  </url>'
    )

with open('sitemap.xml', 'w', encoding='utf-8') as f:
    f.write('<?xml version="1.0" encoding="UTF-8"?>\n'
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
            + '\n'.join(radky) + '\n</urlset>\n')

print(f'sitemap.xml — {len(radky)} adres, základ {ADRESA}')
