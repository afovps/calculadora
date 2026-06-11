# Calculadora de Piezas para Conductos Rectangulares

Herramienta web para calcular m² de material (chapa galvanizada) en piezas de conductos rectangulares, según norma **UNE 100716**.

## Características

- 19 tipos de piezas: Conducto, Codo, Codo recto, Codo reducido, Reducción, Tolva, Tolva excéntrica, Tolva con desvío, Zapato, Cuello, Cuello telescópico, Vierteaguas, Desvío, Pantalón, Tapa, Deflector, Bifurcación, Bifurcación doble y Bifurcación triple.
- Imagen esquemática de cada pieza al seleccionarla.
- Campos dinámicos según el tipo de pieza elegida.
- Cálculo de m² en tiempo real.
- Tabla acumulativa de pedido (añadir / eliminar líneas).
- Campo de cantidad por línea.
- Exportación a PDF mediante impresión del navegador.
- 100% estático — funciona sin servidor, sin base de datos.

## Uso

Abrir `index.html` directamente en cualquier navegador moderno, o acceder desde la URL configurada con GitHub Pages.

## Fórmulas (UNE 100716)

| Pieza | Fórmula |
|---|---|
| Conducto / Codo / Zapato / Cuello / Pantalón | `m² = (2(A+B)) × (L + UT)` |
| Codo recto | `m² = (2(A+B)) × (C + D + UT)` |
| Codo reducido / Reducción | `m² = (A1+A2+B1+B2) × (L + UT)` |
| Tolva (y variantes) | `m² = (C×2) × 2 × L` donde `C = max(A, B, Ø, 250mm)` |
| Vierteaguas | `m² = (A + B) × 3` |
| Tapa | `m² = (A + B) × 0.8` |
| Deflector | `m² = A × L` |
| Bifurcación (y variantes) | `m² = Σ (2(Aᵢ+Bᵢ)) × (Lᵢ + UT)` |

### Valores UT (tipo de unión)

| Tipo | UT (m) |
|---|---|
| Perfil integral 20 | 0.040 |
| Perfil integral 30 | 0.060 |
| Vaina | 0.100 |
| Otro | 0.000 |

## Espesores disponibles

0.6 mm · 0.8 mm · 1.0 mm · 1.2 mm

## Despliegue

La herramienta está publicada en GitHub Pages y accesible en:

**https://tools.airkon.cloud**

Para configurar el DNS en Hostinger, añade un registro **CNAME**:
- **Nombre / Host:** `tools`
- **Valor / Apunta a:** `afovps.github.io`
- **TTL:** 3600

## Tecnologías

- HTML5 / CSS3 / JavaScript vanilla
- [Bootstrap 5.3](https://getbootstrap.com/)
- SVG inline para los esquemáticos de piezas

## Licencia

Uso interno — Airkon Cloud
