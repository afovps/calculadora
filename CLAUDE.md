# CLAUDE.md — Calculadora de Piezas para Conductos Rectangulares

## Propósito del proyecto

Herramienta web interna para **Airkon Cloud** que permite calcular los metros cuadrados de chapa galvanizada necesarios para fabricar piezas de conductos rectangulares, según la norma **UNE 100716**.

El objetivo es que el operario seleccione el tipo de pieza, introduzca sus dimensiones, y obtenga el m² de material necesario. Las piezas se acumulan en una tabla de pedido que se puede exportar a PDF.

---

## Stack

- HTML5 + CSS3 + JavaScript vanilla (sin frameworks JS)
- Bootstrap 5.3 (CDN)
- SVG inline para los esquemáticos de piezas
- Un único archivo `index.html` — sin build, sin dependencias locales

---

## Archivo principal

**`index.html`** — contiene toda la aplicación: estilos, lógica y SVGs en un solo archivo.

Estructura interna del JS:
- `PIECES` — objeto con la definición de cada pieza: campos requeridos, fórmula de cálculo, SVG esquemático
- `renderFields()` — genera dinámicamente los inputs al seleccionar una pieza
- `calcM2()` — aplica la fórmula correspondiente en tiempo real
- `addToTable()` — añade la línea a la tabla acumulativa
- `printPDF()` — oculta el formulario y lanza `window.print()`

---

## Piezas disponibles (19)

| # | Pieza | Campos requeridos |
|---|---|---|
| 1 | Conducto | A, B, L, espesor, unión |
| 2 | Codo | A, B, L, espesor, unión |
| 3 | Codo recto | A, B, C, D, espesor, unión |
| 4 | Codo reducido | A1, B1, A2, B2, L, espesor, unión |
| 5 | Reducción | A1, B1, A2, B2, L, espesor, unión |
| 6 | Tolva | A, B, L, espesor, unión |
| 7 | Tolva excéntrica | A, B, L, espesor, unión |
| 8 | Tolva con desvío | A, B, L, espesor, unión |
| 9 | Zapato | A, B, L, espesor, unión |
| 10 | Cuello | A, B, L, espesor, unión |
| 11 | Cuello telescópico | A, B, L, espesor, unión |
| 12 | Vierteaguas | A, B, espesor |
| 13 | Desvío | A, B, L, espesor, unión |
| 14 | Pantalón | A, B, L, espesor, unión |
| 15 | Tapa | A, B, espesor |
| 16 | Deflector | A, L, espesor |
| 17 | Bifurcación | A, B, L (rama principal + ramal), espesor, unión |
| 18 | Bifurcación doble | A, B, L (principal + 2 ramales), espesor, unión |
| 19 | Bifurcación triple | A, B, L (principal + 3 ramales), espesor, unión |

---

## Fórmulas de cálculo (UNE 100716)

| Pieza | Fórmula |
|---|---|
| Conducto / Codo / Zapato / Cuello / Pantalón / Desvío | `m² = (2(A+B)) × (L + UT)` |
| Codo recto | `m² = (2(A+B)) × (C + D + UT)` |
| Codo reducido / Reducción | `m² = (A1+A2+B1+B2) × (L + UT)` |
| Tolva (y variantes) | `m² = (C×2) × 2 × L` donde `C = max(A, B, 0.25)` en metros |
| Vierteaguas | `m² = (A + B) × 3` |
| Tapa | `m² = (A + B) × 0.8` |
| Deflector | `m² = A × L` |
| Bifurcación | `m² = Σ (2(Aᵢ+Bᵢ)) × (Lᵢ + UT)` para cada ramal |

### Valores UT (tipo de unión)

| Tipo | UT (m) |
|---|---|
| Perfil integral 20 | 0.040 |
| Perfil integral 30 | 0.060 |
| Vaina | 0.100 |
| Otro | 0.000 |

---

## Despliegue

- **Producción:** https://tools.airkon.cloud
- **Hosting:** Hostinger (`public_html/tools/index.html`)
- **CI/CD:** GitHub Actions FTP deploy — **pendiente de configurar**
  - Secretos necesarios en el repo: `FTP_HOST`, `FTP_USER`, `FTP_PASS`
  - Workflow: `.github/workflows/deploy.yml` — **pendiente de crear** (token necesita scope `workflow`)

## Estado actual del proyecto

- La aplicación está funcional y desplegada manualmente en Hostinger
- El repo GitHub actúa como control de versiones
- El auto-deploy (GitHub Actions → FTP → Hostinger) está pendiente de configurar

---

## Convenciones

- Todas las dimensiones se introducen en **milímetros** y se convierten a metros internamente para el cálculo
- Los m² se muestran con 4 decimales
- El espesor no afecta al cálculo de m² (solo se registra en el pedido)
