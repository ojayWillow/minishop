# Mini Me — e-veikals

Rokām adītu cepuru un aksesuāru e-veikals priekš **minimeshop.lv**.
Statisks sākums (HTML/CSS/JS, bez build soļa), kas hostējams uz Vercel.

## Lapas

| URL          | Fails         | Saturs                                            |
|--------------|---------------|---------------------------------------------------|
| `/`          | `index.html`  | Sākumlapa — hero, kategorijas, populārākie, komplekti, atsauksmes |
| `/store`     | `store.html`  | Veikals — filtri, sezonas, meklēšana, kārtošana   |
| `/admin`     | `admin.html`  | Administrācija — produktu pārvaldība (prototips)   |

(`/store` un `/admin` strādā, pateicoties `cleanUrls` iestatījumam `vercel.json`.)

## Failu struktūra

```
index.html            – sākumlapa
store.html            – veikals
admin.html            – administrācija
css/
  base.css            – tokens, fonti, header/footer/pogas (kopīgs)
  landing.css         – sākumlapas stili
  store.css           – veikala stili
  admin.css           – administrācijas stili
js/
  products.js         – PRODUKTU KATALOGS + datu slānis (viens patiesības avots)
  icons.js            – adījumu SVG zīmējumi
  site.js             – kopīgais (grozs, gads)
  landing.js          – sākumlapas "populārākie" bloks
  store.js            – veikala filtri/kārtošana/meklēšana
  admin.js            – administrācijas login + CRUD + augšupielāde
assets/
  fonts/              – Baloo 2 (self-hosted .woff2)
  media/              – vieta produktu attēliem
vercel.json
```

## Lokāli apskatīt

```bash
npx serve .
# vai
python -m http.server 8000
```
Tad atver <http://localhost:8000/>.

## Administrācija (svarīgi — izlasi)

`/admin` ļauj pievienot, rediģēt un dzēst produktus un augšupielādēt attēlus.
Demo pieslēgšanās: **admin / admin** (mainīt `js/admin.js` → `CREDENTIALS`).

**Šis ir prototips, ne reāls aizmugursistēmas risinājums:**

- Izmaiņas glabājas **tikai tajā pārlūkā** (`localStorage`) — tās **neredz klienti**.
- Pieslēgšanās parole ir redzama koda avotā, tāpēc tā **nav droša aizsardzība**.
- Augšupielādētie attēli tiek samazināti un glabāti pārlūkā, ne serverī.

### Kā publicēt izmaiņas visiem

1. `/admin` → rediģē produktus → **Eksportēt JSON** (lejupielādē `minime-products.json`).
2. Pārkopē tā saturu `js/products.js` masīvā `DEFAULT_PRODUCTS`.
3. Commit + push → Vercel pārpublicē, un izmaiņas redz visi.

### Reāls veikals (nākamais solis)

Lai iegūtu drošu pieslēgšanos, kopīgus datus, mediju hostingu un pasūtījumus,
vajadzīga aizmugursistēma. Divi ieteicamie ceļi:

- **Git-based CMS (Decap CMS)** — `/admin` ar login, kas izmaiņas commit repozitorijā.
  Saglabā statisko hostingu, bet pievieno reālu satura pārvaldību.
- **E-komercijas platforma (Shopify u.c.)** — pilns veikals ar pasūtījumiem un
  maksājumiem; šo dizainu pārtaisa par tēmu.

## Publicēšana Vercel

```bash
npx vercel login     # vienreiz
npx vercel --prod
```
Vai savieno GitHub repozitoriju ar Vercel projektu automātiskai publicēšanai.
