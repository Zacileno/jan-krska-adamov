#!/usr/bin/env python3
"""
Zapíše rozměry všech obrázků do data/rozmery.js.

Spusť po každé výměně fotek:   python3 nastroje/generuj-rozmery.py

K čemu to je: prohlížeč díky rozměrům ví, kolik místa obrázku nechat, ještě než
ho stáhne. Bez toho stránka při načítání poskakuje — a poskakování je jeden ze
signálů, podle kterých Google hodnotí kvalitu stránky.

Soubor se generuje, needituj ho ručně.
"""
import glob, os, json
from PIL import Image

KOREN = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(KOREN)

rozmery = {}
for cesta in sorted(glob.glob('assets/**/*.webp', recursive=True) +
                    glob.glob('assets/**/*.jpg', recursive=True) +
                    glob.glob('assets/**/*.png', recursive=True)):
    with Image.open(cesta) as im:
        rozmery[cesta] = list(im.size)

with open('data/rozmery.js', 'w', encoding='utf-8') as f:
    f.write('/* Generováno skriptem nastroje/generuj-rozmery.py — needituj ručně. */\n')
    f.write('const ROZMERY = ')
    f.write(json.dumps(rozmery, ensure_ascii=False, indent=0).replace('\n', ''))
    f.write(';\n')

print(f'data/rozmery.js — {len(rozmery)} obrázků, {os.path.getsize("data/rozmery.js")//1024} kB')
