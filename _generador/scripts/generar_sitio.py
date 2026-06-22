#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Generador del sitio STRAVEN
============================
Lee img/PAQUETES/PAQUETES.csv, escanea las carpetas de cada paquete
(imágenes y video reales) y genera el sitio estático:
  - index.html
  - productos/<slug>.html  (uno por cada fila del CSV)

Cómo usar (después de agregar paquetes nuevos):
    cd "STRAVEN/_generador/scripts"
    python3 generar_sitio.py

Requiere: pip install jinja2 --break-system-packages
"""
import csv
import json
import os
import re
import unicodedata
from datetime import datetime

from jinja2 import Environment, FileSystemLoader

# ---------------------------------------------------------------------------
# Rutas
# ---------------------------------------------------------------------------
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))          # carpeta STRAVEN
TEMPLATES_DIR = os.path.abspath(os.path.join(HERE, "..", "templates"))
CSV_PATH = os.path.join(ROOT, "img", "PAQUETES", "PAQUETES.csv")
PAQUETES_DIR = os.path.join(ROOT, "img", "PAQUETES")
PRODUCTOS_OUT_DIR = os.path.join(ROOT, "productos")
PLACEHOLDER_IMG = "img/placeholder.svg"

IMG_EXTS = (".jpg", ".jpeg", ".png", ".webp")
VIDEO_EXTS = (".mp4", ".mov", ".webm")

# Orden y copy persuasivo de las secciones de "landing page" en la página
# de producto. Cada tupla: (eyebrow, título, subtítulo). Solo se renderiza
# la sección si el paquete tiene fotos/video reales en esa carpeta.
SECTION_ORDER_KEYS = ["detalles", "individuales", "video", "grupales"]
SECTION_META = {
    "detalles": (
        "CALIDAD VERIFICABLE",
        "Cada detalle, a la vista",
        "Acércate y revisa el material, las costuras y el acabado real de las piezas — sin filtros.",
    ),
    "individuales": (
        "CONTENIDO DEL PAQUETE",
        "Esto es exactamente lo que recibes",
        "Cada pieza fotografiada por separado, para que sepas con certeza qué estás comprando.",
    ),
    "video": (
        "PRUEBA EN VIDEO",
        "Míralo en movimiento",
        "Video real del paquete completo, grabado tal como se entrega.",
    ),
    "grupales": (
        "VOLUMEN REAL",
        "Así de grande es tu inventario",
        "El paquete completo, listo para empacar y revender.",
    ),
}


# ---------------------------------------------------------------------------
# Utilidades
# ---------------------------------------------------------------------------
def slugify(text):
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return re.sub(r"-+", "-", text).strip("-")


def natural_key(filename):
    name = os.path.splitext(os.path.basename(filename))[0]
    parts = re.split(r"(\d+)", name)
    return [int(p) if p.isdigit() else p for p in parts]


def list_assets(folder, exts):
    """Lista archivos válidos (sin .DS_Store ni vacíos) ordenados naturalmente."""
    if not os.path.isdir(folder):
        return []
    out = []
    for f in os.listdir(folder):
        full = os.path.join(folder, f)
        if f.startswith("."):
            continue
        if not f.lower().endswith(exts):
            continue
        try:
            if os.path.getsize(full) <= 0:
                continue
        except OSError:
            continue
        out.append(f)
    out.sort(key=natural_key)
    return out


def url_path(*parts):
    """Construye una ruta relativa (desde la raíz del sitio) URL-encodeada."""
    from urllib.parse import quote
    return "/".join(quote(p) for p in parts)


def parse_money(s):
    if not s:
        return 0.0
    clean = re.sub(r"[^\d.]", "", s)
    try:
        return float(clean)
    except ValueError:
        return 0.0


def format_medidas(s):
    if not s:
        return s
    nums = re.findall(r"[\d.]+", s)
    if len(nums) >= 3:
        return f"{nums[0]} x {nums[1]} x {nums[2]} cm"
    return s.strip()


def split_list(s):
    if not s:
        return []
    return [x.strip().replace("`", "'") for x in s.split(",") if x.strip()]


def split_lines(s):
    if not s:
        return []
    return [x.strip() for x in s.replace("\r", "").split("\n") if x.strip()]


# ---------------------------------------------------------------------------
# Carga de datos
# ---------------------------------------------------------------------------
def load_products():
    products = []
    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            nombre = row["Nombre"].strip()
            carpeta = row["CARPETA"].strip()
            categoria = row["Categoría"].strip()
            pzas = row["Pzas"].strip()
            precio_unitario = row["Precio Unitario"].strip()
            precio_total = row["Precio Total"].strip()
            slug = carpeta.lower()

            base_dir = os.path.join(PAQUETES_DIR, carpeta)

            principal_files = list_assets(base_dir, IMG_EXTS)
            principal_file = next((f for f in principal_files if f.lower().startswith("principal")), None)
            principal_url = url_path("img", "PAQUETES", carpeta, principal_file) if principal_file else PLACEHOLDER_IMG

            logos = [url_path("img", "PAQUETES", carpeta, "logos", f)
                     for f in list_assets(os.path.join(base_dir, "logos"), IMG_EXTS)]
            detalles = [url_path("img", "PAQUETES", carpeta, "detalles", f)
                        for f in list_assets(os.path.join(base_dir, "detalles"), IMG_EXTS)]
            individuales = [url_path("img", "PAQUETES", carpeta, "fotos individuales", f)
                            for f in list_assets(os.path.join(base_dir, "fotos individuales"), IMG_EXTS)]
            grupales = [url_path("img", "PAQUETES", carpeta, "foto grupal", f)
                        for f in list_assets(os.path.join(base_dir, "foto grupal"), IMG_EXTS)]
            videos = [url_path("img", "PAQUETES", carpeta, "video", f)
                      for f in list_assets(os.path.join(base_dir, "video"), VIDEO_EXTS)]

            gallery = {}
            if principal_file:
                gallery["principal"] = {"label": "Principal", "items": [{"type": "image", "src": principal_url}]}
            if detalles:
                gallery["detalles"] = {"label": "Detalles", "items": [{"type": "image", "src": u} for u in detalles]}
            if individuales:
                gallery["individuales"] = {"label": "Piezas individuales", "items": [{"type": "image", "src": u} for u in individuales]}
            if grupales:
                gallery["grupales"] = {"label": "Foto grupal", "items": [{"type": "image", "src": u} for u in grupales]}
            if videos:
                gallery["video"] = {
                    "label": "Video",
                    "items": [{"type": "video", "src": u, "poster": principal_url} for u in videos],
                }
            if not gallery:
                gallery["principal"] = {"label": "Principal", "items": [{"type": "image", "src": PLACEHOLDER_IMG}]}

            marcas = split_list(row.get("Marcas", ""))
            presentaciones = split_list(row.get("Presentaciones", ""))
            tallas = split_list(row.get("Tallas", ""))
            extras = split_lines(row.get("Extras", ""))
            medidas_fmt = format_medidas(row.get("Medidas", ""))

            primer_parrafo = row.get("Descripción", "").strip().split("\n\n")[0]
            primer_parrafo = re.sub(r"\s+", " ", primer_parrafo).strip()
            meta_desc = (primer_parrafo[:157] + "...") if len(primer_parrafo) > 160 else primer_parrafo

            specs = [
                ("Categoría", categoria),
                ("Piezas por paquete", pzas),
                ("Precio unitario", precio_unitario),
                ("Precio total del paquete", precio_total),
                ("Marcas incluidas", ", ".join(marcas) if marcas else "—"),
                ("Presentaciones", ", ".join(presentaciones) if presentaciones else "—"),
                ("Tallas / variantes", ", ".join(tallas) if tallas else "—"),
                ("Peso del paquete", row.get("Peso", "").strip() or "—"),
                ("Medidas (largo x ancho x alto)", medidas_fmt or "—"),
                ("Extras incluidos", " · ".join(extras) if extras else "—"),
            ]

            products.append({
                "slug": slug,
                "carpeta": carpeta,
                "nombre": nombre,
                "categoria": categoria,
                "categoria_slug": slugify(categoria),
                "pzas": pzas,
                "precio_unitario": precio_unitario,
                "precio_unitario_num": parse_money(precio_unitario),
                "precio_total": precio_total,
                "precio_total_num": parse_money(precio_total),
                "descripcion": row.get("Descripción", "").strip(),
                "meta_desc": meta_desc,
                "marcas": marcas,
                "presentaciones": presentaciones,
                "tallas": tallas,
                "peso": row.get("Peso", "").strip(),
                "medidas": medidas_fmt,
                "extras": extras,
                "principal": principal_url,
                "logos": logos,
                "gallery": gallery,
                "specs": specs,
                "has_real_photos": bool(principal_file),
            })
    return products


def group_by_category(products):
    order = []
    by_slug = {}
    for p in products:
        cs = p["categoria_slug"]
        if cs not in by_slug:
            by_slug[cs] = {"slug": cs, "nombre": p["categoria"], "productos": []}
            order.append(cs)
        by_slug[cs]["productos"].append(p)
    return [by_slug[s] for s in order]


def prefix_paths(value, prefix):
    """Antepone 'prefix' a rutas relativas (recursivo en listas/dicts) sin tocar texto normal."""
    if isinstance(value, str):
        return prefix + value
    if isinstance(value, list):
        return [prefix_paths(v, prefix) for v in value]
    if isinstance(value, dict):
        return {k: prefix_paths(v, prefix) for k, v in value.items()}
    return value


def _prefix_item(it, prefix):
    out = {"type": it["type"], "src": prefix + it["src"]}
    if it.get("poster"):
        out["poster"] = prefix + it["poster"]
    return out


def make_view(p, prefix):
    """Devuelve una copia del producto con TODAS las rutas de imagen/video
    ya resueltas con el prefijo relativo correcto para la página donde se use."""
    v = dict(p)
    v["principal"] = prefix + p["principal"]
    v["logos"] = [prefix + u for u in p["logos"]]
    v["gallery"] = {
        key: {
            "label": tab["label"],
            "items": [_prefix_item(it, prefix) for it in tab["items"]],
        }
        for key, tab in p["gallery"].items()
    }
    # Secciones de "landing page" en el orden narrativo definido arriba;
    # solo se incluyen las que el paquete realmente tiene.
    # Nota: la clave se llama "fotos" (no "items") a propósito — en Jinja2,
    # "items" choca con el método dict.items() y rompe el acceso sec.items.
    v["gallery_sections"] = [
        {
            "key": key,
            "eyebrow": SECTION_META[key][0],
            "title": SECTION_META[key][1],
            "subtitle": SECTION_META[key][2],
            "fotos": v["gallery"][key]["items"],
        }
        for key in SECTION_ORDER_KEYS
        if key in v["gallery"]
    ]
    v["url"] = f"{prefix}productos/{p['slug']}.html"
    return v


# ---------------------------------------------------------------------------
# Render
# ---------------------------------------------------------------------------
def main():
    products = load_products()
    categories_raw = group_by_category(products)
    year = datetime.now().year

    env = Environment(loader=FileSystemLoader(TEMPLATES_DIR), autoescape=True, trim_blocks=True, lstrip_blocks=True)

    # ---- index.html (prefix "" : está en la raíz) ----
    # Grilla única (sin separar por categoría); los filtros solo
    # muestran/ocultan tarjetas individuales vía data-cat en el cliente.
    index_categories = [{"slug": c["slug"], "nombre": c["nombre"]} for c in categories_raw]
    index_products = [make_view(p, "") for p in products]

    index_tpl = env.get_template("index.html.j2")
    index_html = index_tpl.render(
        asset_prefix="",
        categories=index_categories,
        products=index_products,
        year=year,
        page_title="STRAVEN — Catálogo Mayorista | Paquetes 100% originales",
    )
    with open(os.path.join(ROOT, "index.html"), "w", encoding="utf-8") as f:
        f.write(index_html)

    # ---- productos/<slug>.html (prefix "../") ----
    os.makedirs(PRODUCTOS_OUT_DIR, exist_ok=True)
    producto_tpl = env.get_template("producto.html.j2")

    for p in products:
        view = make_view(p, "../")
        others = [make_view(o, "../") for o in products if o["slug"] != p["slug"]][:4]

        product_json = json.dumps({
            "slug": p["slug"],
            "nombre": p["nombre"],
            "imagen": view["principal"],
            "precio": p["precio_total_num"],
            "precioStr": p["precio_total"],
            "categoria": p["categoria"],
            "pzas": p["pzas"],
        }, ensure_ascii=False)

        html = producto_tpl.render(
            asset_prefix="../",
            p=view,
            others=others,
            product_json=product_json,
            year=year,
            page_title=f"{p['nombre']} — STRAVEN Mayoreo",
        )
        out_path = os.path.join(PRODUCTOS_OUT_DIR, f"{p['slug']}.html")
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(html)

    print(f"OK: generados index.html + {len(products)} páginas de producto.")
    for c in categories_raw:
        print(f"  - {c['nombre']}: {len(c['productos'])} paquete(s)")


if __name__ == "__main__":
    main()
