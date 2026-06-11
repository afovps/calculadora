# Calculadora de Piezas para Conductos Rectangulares

Herramienta web para calcular m² de material (chapa galvanizada) en piezas de conductos rectangulares, según norma **UNE 100716**.

**URL de producción:** [https://tools.airkon.cloud](https://tools.airkon.cloud)

---

## Características

- 19 tipos de piezas: Conducto, Codo, Codo recto, Codo reducido, Reducción, Tolva, Tolva excéntrica, Tolva con desvío, Zapato, Cuello, Cuello telescópico, Vierteaguas, Desvío, Pantalón, Tapa, Deflector, Bifurcación, Bifurcación doble y Bifurcación triple.
- Imagen esquemática SVG de cada pieza al seleccionarla.
- Campos dinámicos según el tipo de pieza elegida.
- Cálculo de m² en tiempo real.
- Tabla acumulativa de pedido (añadir / eliminar líneas).
- Campo de cantidad por línea.
- Exportación a PDF mediante impresión del navegador.
- 100% estático — funciona sin servidor, sin base de datos.

---

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

### Espesores disponibles

0.6 mm · 0.8 mm · 1.0 mm · 1.2 mm

---

## Estructura del repositorio

```
calculadora/
├── index.html          # Aplicación completa (HTML + CSS + JS en un solo archivo)
├── CNAME               # Dominio personalizado: tools.airkon.cloud
└── README.md           # Esta documentación
```

---

## Tecnologías

- HTML5 / CSS3 / JavaScript vanilla
- [Bootstrap 5.3](https://getbootstrap.com/)
- SVG inline para los esquemáticos de piezas

---

## Despliegue

La herramienta está alojada en **Hostinger** y accesible en [https://tools.airkon.cloud](https://tools.airkon.cloud).

### Infraestructura

| Componente | Detalle |
|---|---|
| Hosting | Hostinger (ruta: `public_html/tools/`) |
| Dominio | airkon.cloud registrado en Hostinger |
| Subdominio | `tools` → apunta a `public_html/tools` |
| CI/CD | GitHub Actions → FTP deploy a Hostinger *(pendiente de configurar)* |

### Configurar CI/CD (FTP auto-deploy)

Para que cada push a `main` se publique automáticamente en Hostinger, añade estos secretos en el repo:

**GitHub → Settings → Secrets and variables → Actions → New repository secret**

| Secreto | Descripción |
|---|---|
| `FTP_HOST` | Host FTP de Hostinger (ej. `ftp.airkon.cloud`) |
| `FTP_USER` | Usuario FTP |
| `FTP_PASS` | Contraseña FTP |

Una vez configurados los secretos, el workflow `.github/workflows/deploy.yml` se encargará del despliegue automático.

### Flujo de trabajo (una vez configurado CI/CD)

```
Modificar index.html con Claude Code
        ↓
Push automático a GitHub (rama main)
        ↓
GitHub Actions detecta el cambio
        ↓
FTP deploy a Hostinger
        ↓
tools.airkon.cloud actualizado ✓
```

---

## Uso local

Abrir `index.html` directamente en cualquier navegador moderno (Chrome, Firefox, Edge). No requiere servidor ni instalación.

---

## Licencia

Uso interno — Airkon Cloud
