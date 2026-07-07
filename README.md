# Mini Me — e-veikala koncepts

Statisks e-veikala prototips priekš **minimeshop.lv** — rokām adītas cepures un aksesuāri.
Viss ir vienā failā (`index.html`) — fonti, stili un JavaScript ir iekļauti, nekādu ārējo atkarību.

## Funkcijas
- Kataloga lapa ar 28 demo produktiem (6 kategorijas)
- Filtri: kategorija, sezona, izmērs, krāsa, cena, akcijas/jaunumi
- Sezonu kolekcijas (Ziema / Pavasaris-Rudens / Vasara)
- Meklēšana un kārtošana
- Gaišā un tumšā tēma, responsīvs (mobilais + dators)

## Lokāli apskatīt
Vienkārši atver `index.html` pārlūkā, vai palaid lokālu serveri:

```bash
npx serve .
# vai
python -m http.server 8000
```

## Publicēšana Vercel

1. Pieslēdzies (vienreiz):
   ```bash
   npx vercel login
   ```
2. Publicē:
   ```bash
   npx vercel --prod
   ```

Pirmajā reizē Vercel pajautās projekta nosaukumu un mapi — apstiprini noklusējuma vērtības.
