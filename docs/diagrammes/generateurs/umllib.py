"""Petite bibliothèque de tracé SVG respectant la notation UML 2.5.

Toutes les formes produites ici suivent l'OMG UML 2.5.1 (formal/17-12-05) :
- noeud : parallélépipède (§19.3)
- composant : rectangle portant le mot-clé «component» et l'icône de composant (§11.6)
- interface fournie / requise : boule et douille (§11.4.4)
- artefact : rectangle avec le mot-clé «artifact» et l'icône document (§19.2)
- dépendance : trait discontinu, pointe ouverte (§7.7)
- cadre de diagramme : rectangle + pentagone d'en-tête (Annexe A)
"""

SANS = "'Liberation Sans','Arial','Helvetica',sans-serif"
MONO = "'DejaVu Sans Mono','Liberation Mono',monospace"

# Palette : reprise du design system validé du projet.
BRAND = "#003087"
DEEP = "#001f57"
ACCENT = "#e01e37"
INK = "#101828"
INK2 = "#475467"
INK3 = "#6b7688"
LINE = "#98a2b3"
PAPER = "#ffffff"
TINT = "#f4f7fc"
TINT2 = "#e8eef8"
NODE_TOP = "#dbe5f5"

_NARROW = set("iljItf.,:;'|!()[]{}/\\ ")
_WIDE = set("mwMW@%")


def tw(s, size=13.0, bold=False):
    """Largeur approchée d'une chaîne (métriques Arial/Liberation Sans)."""
    u = 0.0
    for ch in s:
        if ch in _NARROW:
            u += 0.30
        elif ch in _WIDE:
            u += 0.85
        elif ch.isupper():
            u += 0.68
        elif ch.isdigit():
            u += 0.556
        elif ch in "«»—–":
            u += 0.60
        else:
            u += 0.535
    if bold:
        u *= 1.055
    return u * size


def esc(s):
    return (s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))


class Svg:
    def __init__(self, w, h, title, desc):
        self.w, self.h = w, h
        self.parts = []
        self.title = title
        self.desc = desc

    def add(self, s):
        self.parts.append(s)

    # ---------- primitives ----------
    def text(self, x, y, s, size=13, bold=False, italic=False, anchor="start",
             fill=INK, family=None, ls=0, opacity=None):
        family = family or SANS
        a = ""
        if anchor != "start":
            a = f' text-anchor="{anchor}"'
        st = ' font-style="italic"' if italic else ""
        w = ' font-weight="600"' if bold else ""
        l = f' letter-spacing="{ls}"' if ls else ""
        o = f' opacity="{opacity}"' if opacity is not None else ""
        self.add(f'<text x="{x:.1f}" y="{y:.1f}" font-family="{family}" '
                 f'font-size="{size}" fill="{fill}"{w}{st}{a}{l}{o}>{esc(s)}</text>')

    def rect(self, x, y, w, h, fill=PAPER, stroke=INK, sw=1.4, rx=0, dash=None):
        d = f' stroke-dasharray="{dash}"' if dash else ""
        self.add(f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" '
                 f'rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"{d}/>')

    def line(self, x1, y1, x2, y2, stroke=INK, sw=1.4, dash=None, marker=None, cap="butt"):
        d = f' stroke-dasharray="{dash}"' if dash else ""
        m = f' marker-end="url(#{marker})"' if marker else ""
        self.add(f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" '
                 f'stroke="{stroke}" stroke-width="{sw}" stroke-linecap="{cap}"{d}{m}/>')

    def path(self, d, fill="none", stroke=INK, sw=1.4, dash=None, marker=None,
             marker_start=None, cap="butt", join="miter"):
        da = f' stroke-dasharray="{dash}"' if dash else ""
        m = f' marker-end="url(#{marker})"' if marker else ""
        ms = f' marker-start="url(#{marker_start})"' if marker_start else ""
        self.add(f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" '
                 f'stroke-linecap="{cap}" stroke-linejoin="{join}"{da}{m}{ms}/>')

    def circle(self, cx, cy, r, fill=PAPER, stroke=INK, sw=1.4):
        self.add(f'<circle cx="{cx:.1f}" cy="{cy:.1f}" r="{r:.1f}" fill="{fill}" '
                 f'stroke="{stroke}" stroke-width="{sw}"/>')

    def poly(self, pts, fill=PAPER, stroke=INK, sw=1.4):
        p = " ".join(f"{a:.1f},{b:.1f}" for a, b in pts)
        self.add(f'<polygon points="{p}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>')

    # ---------- formes UML ----------
    def frame(self, x, y, w, h, kind, name):
        """Cadre de diagramme UML : rectangle + pentagone d'en-tête (Annexe A)."""
        self.rect(x, y, w, h, fill=PAPER, stroke=INK2, sw=1.6)
        label = f"{kind}  {name}"
        tabw = tw(kind, 15, True) + tw("  " + name, 15) + 34
        tabh = 30
        self.path(f"M{x} {y} L{x + tabw} {y} L{x + tabw} {y + tabh - 11} "
                  f"L{x + tabw - 13} {y + tabh} L{x} {y + tabh} Z",
                  fill=TINT2, stroke=INK2, sw=1.6)
        self.text(x + 12, y + 20, kind, 15, bold=True, fill=DEEP)
        self.text(x + 12 + tw(kind, 15, True) + 10, y + 20, name, 15, fill=INK)
        return label

    def node3d(self, x, y, w, h, depth=15, fill=PAPER, stroke=INK, sw=1.6):
        """Noeud UML : parallélépipède."""
        self.poly([(x, y), (x + depth, y - depth), (x + w + depth, y - depth), (x + w, y)],
                  fill=NODE_TOP, stroke=stroke, sw=sw)
        self.poly([(x + w, y), (x + w + depth, y - depth), (x + w + depth, y + h - depth),
                   (x + w, y + h)], fill=TINT2, stroke=stroke, sw=sw)
        self.rect(x, y, w, h, fill=fill, stroke=stroke, sw=sw)

    def comp_icon(self, x, y, s=1.0):
        """Icône de composant UML (rectangle + deux ergots)."""
        w, h = 17 * s, 14 * s
        self.rect(x, y, w, h, fill=TINT2, stroke=INK2, sw=1.1)
        for dy in (3 * s, 8 * s):
            self.rect(x - 4 * s, y + dy, 8 * s, 3.4 * s, fill=PAPER, stroke=INK2, sw=1.1)

    def artifact_icon(self, x, y, s=1.0):
        """Icône d'artefact UML (document à coin replié)."""
        w, h, f = 13 * s, 16 * s, 5 * s
        self.path(f"M{x} {y} L{x + w - f} {y} L{x + w} {y + f} L{x + w} {y + h} "
                  f"L{x} {y + h} Z", fill=PAPER, stroke=INK2, sw=1.1)
        self.path(f"M{x + w - f} {y} L{x + w - f} {y + f} L{x + w} {y + f}",
                  fill="none", stroke=INK2, sw=1.1)

    def ball(self, cx, cy, ax, ay, r=8, label=None, lx=0, ly=0, stroke=INK):
        """Interface fournie : trait + boule."""
        self.line(ax, ay, cx, cy, stroke=stroke, sw=1.4)
        self.circle(cx, cy, r, fill=PAPER, stroke=stroke, sw=1.6)
        if label:
            self.text(cx + lx, cy + ly, label, 12, fill=INK2)

    def socket(self, cx, cy, ax, ay, r=13, start=90, extent=180, label=None, lx=0, ly=0,
               stroke=INK):
        """Interface requise : trait + douille (demi-cercle ouvert)."""
        import math
        a0 = math.radians(start)
        a1 = math.radians(start + extent)
        x0, y0 = cx + r * math.cos(a0), cy - r * math.sin(a0)
        x1, y1 = cx + r * math.cos(a1), cy - r * math.sin(a1)
        self.line(ax, ay, cx, cy, stroke=stroke, sw=1.4)
        self.path(f"M{x0:.1f} {y0:.1f} A{r} {r} 0 0 0 {x1:.1f} {y1:.1f}",
                  fill="none", stroke=stroke, sw=1.6)
        if label:
            self.text(cx + lx, cy + ly, label, 12, fill=INK2)

    def note(self, x, y, w, lines, size=12, fold=14, fill="#fffdf2", stroke="#b9a765"):
        h = 12 + len(lines) * (size + 5)
        self.path(f"M{x} {y} L{x + w - fold} {y} L{x + w} {y + fold} L{x + w} {y + h} "
                  f"L{x} {y + h} Z", fill=fill, stroke=stroke, sw=1.3)
        self.path(f"M{x + w - fold} {y} L{x + w - fold} {y + fold} L{x + w} {y + fold}",
                  fill="none", stroke=stroke, sw=1.3)
        for i, l in enumerate(lines):
            self.text(x + 9, y + 18 + i * (size + 5), l, size, fill=INK2)
        return h

    def defs(self):
        return f'''<defs>
  <marker id="open" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="12"
          markerHeight="12" orient="auto-start-reverse">
    <path d="M1 1 L11 6 L1 11" fill="none" stroke="{INK}" stroke-width="1.5"/>
  </marker>
  <marker id="openA" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="12"
          markerHeight="12" orient="auto-start-reverse">
    <path d="M1 1 L11 6 L1 11" fill="none" stroke="{ACCENT}" stroke-width="1.6"/>
  </marker>
  <marker id="tri" viewBox="0 0 14 14" refX="13" refY="7" markerWidth="14"
          markerHeight="14" orient="auto-start-reverse">
    <path d="M1 1 L13 7 L1 13 Z" fill="{PAPER}" stroke="{INK}" stroke-width="1.4"/>
  </marker>
  <marker id="diamondF" viewBox="0 0 18 12" refX="1" refY="6" markerWidth="18"
          markerHeight="12" orient="auto-start-reverse">
    <path d="M1 6 L8 1 L16 6 L8 11 Z" fill="{INK}" stroke="{INK}" stroke-width="1.2"/>
  </marker>
  <marker id="diamondO" viewBox="0 0 18 12" refX="1" refY="6" markerWidth="18"
          markerHeight="12" orient="auto-start-reverse">
    <path d="M1 6 L8 1 L16 6 L8 11 Z" fill="{PAPER}" stroke="{INK}" stroke-width="1.2"/>
  </marker>
  <marker id="arrowFull" viewBox="0 0 12 12" refX="11" refY="6" markerWidth="11"
          markerHeight="11" orient="auto-start-reverse">
    <path d="M1 1 L11 6 L1 11 Z" fill="{INK}" stroke="{INK}" stroke-width="1"/>
  </marker>
</defs>'''

    def render(self):
        return (f'<svg xmlns="http://www.w3.org/2000/svg" '
                f'xmlns:xlink="http://www.w3.org/1999/xlink" '
                f'width="{self.w}" height="{self.h}" viewBox="0 0 {self.w} {self.h}">'
                f'<title>{esc(self.title)}</title><desc>{esc(self.desc)}</desc>'
                f'{self.defs()}'
                f'<rect width="{self.w}" height="{self.h}" fill="{PAPER}"/>'
                + "".join(self.parts) + '</svg>')
