#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Diagramme de déploiement UML 2.5 — Africa Ingénierie."""
import math
from umllib import (Svg, tw, SANS, MONO, BRAND, DEEP, ACCENT, INK, INK2, INK3,
                    LINE, PAPER, TINT, TINT2, NODE_TOP)

W, H = 2680, 1500
s = Svg(W, H,
        "Africa Ingénierie — diagramme de déploiement UML 2.5",
        "Noeuds, environnements d'exécution Docker, composants, artefacts, "
        "interfaces fournies et requises, chemins de communication.")

CFILL = "#f8fafd"
NFILL = "#ffffff"
AFILL = "#f2f5fa"
HOSTF = "#fbfcfe"

# ───────────────────────── titre ─────────────────────────
s.text(48, 46, "Africa Ingénierie — Architecture de déploiement", 30, bold=True, fill=DEEP)
s.text(48, 76, "Diagramme de déploiement UML 2.5.1 (OMG formal/17-12-05, §19) — noeuds, "
               "composants, artefacts, interfaces et chemins de communication",
       15, fill=INK2)
s.text(W - 48, 46, "Version 0.1 — environnement de développement", 14, anchor="end", fill=INK2)
s.text(W - 48, 70, "Monorepo pnpm · Next.js 16.3 · Payload CMS 3.88 · PostgreSQL 17 · MinIO",
       13, anchor="end", fill=INK3, family=MONO)
s.line(48, 92, W - 48, 92, stroke=ACCENT, sw=2.5)

s.frame(40, 110, 2600, 1330, "dep",
        "Plateforme Africa Ingénierie :: déploiement local (docker compose)")


# ───────────────────── primitives locales ─────────────────────
def node_header(x, y, w, stereo, name, tags=(), fill=NODE_TOP):
    s.text(x + w / 2, y + 22, f"«{stereo}»", 13, anchor="middle", fill=INK2)
    s.text(x + w / 2, y + 43, name, 16, bold=True, anchor="middle", fill=DEEP)
    nw = tw(name, 16, True)
    s.line(x + w / 2 - nw / 2, y + 47, x + w / 2 + nw / 2, y + 47, stroke=DEEP, sw=1.3)
    yy = y + 64
    for t in tags:
        s.text(x + w / 2, yy, t, 12, anchor="middle", fill=INK3, family=MONO)
        yy += 16
    return yy


def component(x, y, w, h, name, lines, fill=CFILL, stroke=INK2):
    s.rect(x, y, w, h, fill=fill, stroke=stroke, sw=1.3, rx=2)
    s.text(x + 12, y + 19, "«component»", 11, fill=INK3)
    s.text(x + 12, y + 36, name, 13.5, bold=True, fill=INK)
    s.comp_icon(x + w - 26, y + 8)
    yy = y + 52
    for l in lines:
        s.text(x + 12, yy, l, 11.5, fill=INK2)
        yy += 15
    return y + h


def artifact(x, y, w, h, name, lines=(), fill=AFILL):
    s.rect(x, y, w, h, fill=fill, stroke=INK2, sw=1.2, rx=2)
    s.text(x + 12, y + 19, "«artifact»", 11, fill=INK3)
    s.text(x + 12, y + 36, name, 13, bold=True, fill=INK)
    s.artifact_icon(x + w - 24, y + 9)
    yy = y + 51
    for l in lines:
        s.text(x + 12, yy, l, 11.5, fill=INK2)
        yy += 15
    return y + h


def assembly(px, py, cx, cy, label, lab_dx=0, lab_dy=0, anchor="middle"):
    """Connecteur d'assemblage UML : boule (interface fournie) + douille (requise)."""
    dx, dy = cx - px, cy - py
    L = math.hypot(dx, dy)
    ux, uy = dx / L, dy / L
    bx, by = px + ux * L * 0.5, py + uy * L * 0.5
    s.line(px, py, bx - ux * 8, by - uy * 8, stroke=INK, sw=1.4)
    s.circle(bx, by, 8, fill=PAPER, stroke=INK, sw=1.7)
    r = 15
    a = math.atan2(uy, ux)
    p0 = (bx + r * math.cos(a - math.pi / 2), by + r * math.sin(a - math.pi / 2))
    p1 = (bx + r * math.cos(a + math.pi / 2), by + r * math.sin(a + math.pi / 2))
    s.path(f"M{p0[0]:.1f} {p0[1]:.1f} A{r} {r} 0 0 1 {p1[0]:.1f} {p1[1]:.1f}",
           fill="none", stroke=INK, sw=1.7)
    s.line(cx, cy, bx + ux * r, by + uy * r, stroke=INK, sw=1.4)
    s.text(bx + lab_dx, by + lab_dy, label, 12, bold=True, anchor=anchor, fill=BRAND)


def link(pts, stroke=INK, sw=1.6, dash=None, marker=None):
    d = "M" + " L".join(f"{a:.1f} {b:.1f}" for a, b in pts)
    s.path(d, fill="none", stroke=stroke, sw=sw, dash=dash, marker=marker, join="round")


# ═════════════════ noeud : poste client ═════════════════
CX, CY, CW, CH = 80, 300, 370, 330
s.node3d(CX, CY, CW, CH, fill=NFILL)
node_header(CX, CY, CW, "device", ":PosteClient", ("{OS = Windows 11}",))
s.rect(CX + 16, CY + 92, CW - 32, CH - 108, fill=TINT, stroke=INK2, sw=1.3, rx=2)
s.text(CX + CW / 2, CY + 112, "«executionEnvironment»", 11.5, anchor="middle", fill=INK3)
s.text(CX + CW / 2, CY + 131, ":Navigateur", 14, bold=True, anchor="middle", fill=DEEP)
artifact(CX + 30, CY + 146, CW - 60, 68, "site-public",
         ("HTML + flux RSC · français / anglais",))
artifact(CX + 30, CY + 224, CW - 60, 68, "admin-payload",
         ("Interface d'administration React 19",))

# ═════════════════ noeud : hôte Docker ═════════════════
HX, HY, HW, HH = 490, 190, 2110, 1190
s.node3d(HX, HY, HW, HH, depth=17, fill=HOSTF)
s.text(HX + 24, HY + 30, "«device»", 13.5, fill=INK2)
s.text(HX + 24, HY + 56, ":HôteDocker", 19, bold=True, fill=DEEP)
s.line(HX + 24, HY + 61, HX + 24 + tw(":HôteDocker", 19, True), HY + 61, stroke=DEEP, sw=1.4)
s.text(HX + 24, HY + 82, "{moteur = Docker Compose}   {réseau = bridge interne}   "
                         "{profil = dev}", 12.5, fill=INK3, family=MONO)
s.text(HX + HW - 24, HY + 56, "Chaque conteneur est modélisé comme un "
                              "«executionEnvironment»", 12.5, anchor="end",
       fill=INK3, italic=True)

# ───────── nginx ─────────
NX, NY, NW, NH = 525, 300, 360, 760
s.node3d(NX, NY, NW, NH, fill=NFILL)
node_header(NX, NY, NW, "executionEnvironment", ":nginx",
            ("{image = nginx:stable-alpine}", "{ports = 8080, 8443}"))
cy = NY + 100
cy = component(NX + 16, cy, NW - 32, 136, "VHostPublic",
               ("server_name = localhost", "location /             → web:3000",
                "location /api/contact  → 5 req./min",
                "location /admin        → 404 (cloisonné)")) + 14
cy = component(NX + 16, cy, NW - 32, 136, "VHostAdmin",
               ("server_name = admin.localhost",
                "location /api/users/login → 10 req./min",
                "location /api/            → 60 req./min",
                "location /                → cms:3001")) + 14
cy = artifact(NX + 16, cy, NW - 32, 100, "nginx.conf",
              ("3 zones limit_req : contact, login, admin",
               "Journal enrichi de l'upstream servi",
               "Compression et mise en cache statique")) + 14
cy = artifact(NX + 16, cy, NW - 32, 90, "security-headers.conf",
              ("HSTS · X-Frame-Options · Referrer-Policy",
               "Permissions-Policy (caméra, micro, GPS)")) + 14
cy = artifact(NX + 16, cy, NW - 32, 84, "00-upstreams.conf",
              ("Résolution des upstreams applicatifs",))

# ───────── mailpit ─────────
MX, MY, MW, MH = 525, 1100, 360, 200
s.node3d(MX, MY, MW, MH, fill=NFILL)
node_header(MX, MY, MW, "executionEnvironment", ":mailpit",
            ("{ports = 1025 SMTP, 8025 UI}",))
artifact(MX + 16, MY + 100, MW - 32, 84, "boîte de réception de test",
         ("Aucun courriel ne quitte le poste", "de développement"))

# ───────── web ─────────
WX, WY, WW, WH = 945, 300, 560, 350
s.node3d(WX, WY, WW, WH, fill=NFILL)
node_header(WX, WY, WW, "executionEnvironment", ":web",
            ("{image = node:22-alpine}   {port = 3000}",))
cy = WY + 80
for nm, ln in [
    ("proxy.ts", ["Redirection « / → /fr » · préfixe de langue · en-tête x-pathname"]),
    ("AppRouter", ["17 routes françaises + 13 alias anglais · SSG puis ISR 300 s"]),
    ("lib/cms.ts", ["Client REST du CMS · mémoïsation par React cache()"]),
    ("RouteHandlers", ["/api/contact · /api/events · /api/preview · /api/revalidate · /healthz"]),
]:
    cy = component(WX + 16, cy, WW - 32, 58, nm, ln) + 6

# ───────── cms ─────────
MCX, MCY, MCW, MCH = 945, 740, 560, 560
s.node3d(MCX, MCY, MCW, MCH, fill=NFILL)
node_header(MCX, MCY, MCW, "executionEnvironment", ":cms",
            ("{image = node:22-alpine}   {port = 3001}",))
cy = MCY + 80
for nm, ln in [
    ("AdminUI", ["React 19 · français et anglais · onglets Contenu / Détails / Visuels / SEO"]),
    ("APIRest+GraphQL", ["Lecture filtrée par le contrôle d'accès · brouillons et prévisualisation"]),
    ("ContrôleAccèsRBAC", ["administrateur · publicateur · éditeur — règles dépendantes de la valeur"]),
    ("HooksMétier", ["Audit · transitions d'état · garde de traduction · auteurs · redirections"]),
    ("AdaptateurPostgres", ["Drizzle ORM · push = false · schéma issu des seules migrations"]),
    ("AdaptateurS3", ["storage-s3 · 4 dérivés par visuel : thumbnail, card, hero, og"]),
    ("TransportSMTP", ["Notifications éditoriales et accusés de réception du formulaire"]),
]:
    cy = component(MCX + 16, cy, MCW - 32, 62, nm, ln) + 6

# ───────── artefacts montés ─────────
AX, AY, AW, AH = 1615, 300, 950, 350
s.rect(AX, AY, AW, AH, fill=TINT, stroke=INK2, sw=1.4, rx=3)
s.text(AX + 18, AY + 26, "Sources du monorepo pnpm — montées en volume dans :web et :cms",
       14, bold=True, fill=DEEP)
s.line(AX, AY + 40, AX + AW, AY + 40, stroke=INK2, sw=1.2)
aw = (AW - 54) / 3
r1, r2 = AY + 56, AY + 194
artifact(AX + 18, r1, aw, 128, "@africa-ingenierie/ui",
         ("En-tête, pied de page, cartes,", "jetons CSS du design system validé",
          "Étiquettes surchargeables FR / EN"))
artifact(AX + 18 + aw + 9, r1, aw, 128, "@africa-ingenierie/validation",
         ("Schémas Zod des variables", "d'environnement",
          "Table des segments d'URL traduits"))
artifact(AX + 18 + 2 * (aw + 9), r1, aw, 128, "infra/nginx + compose",
         ("docker-compose.yml", "nginx.conf, conf.d/, snippets/",
          ".env.local (jamais versionné)"))
artifact(AX + 18, r2, aw, 138, "apps/cms/src/migrations",
         ("4 migrations SQL versionnées :", "initial_schema · demo_flag",
          "media_demo_key · admin_form_cleanup"))
artifact(AX + 18 + aw + 9, r2, aw, 138, "apps/cms/src/seed",
         ("Jeu de démonstration idempotent", "Clé demoKey unique par média",
          "Marqueur isDemo sur chaque contenu"))
artifact(AX + 18 + 2 * (aw + 9), r2, aw, 138, "docs/",
         ("13 documents de cadrage", "28 décisions d'architecture (ADR)",
          "Plan de tests et de recette"))

# ───────── postgres ─────────
PX, PY, PW, PH = 1615, 720, 390, 290
s.node3d(PX, PY, PW, PH, fill=NFILL)
node_header(PX, PY, PW, "executionEnvironment", ":postgres",
            ("{image = postgres:17-alpine}", "{port = 5432}"))
artifact(PX + 16, PY + 106, PW - 32, 84, "base africa_ingenierie",
         ("102 tables · 76 types énumérés", "Localisation native fr / en"))
artifact(PX + 16, PY + 200, PW - 32, 76, "payload_migrations",
         ("Journal des migrations appliquées",))

# ───────── minio ─────────
IX, IY, IW, IH = 1615, 1040, 390, 260
s.node3d(IX, IY, IW, IH, fill=NFILL)
node_header(IX, IY, IW, "executionEnvironment", ":minio",
            ("{image = minio/minio}", "{ports = 9000 S3, 9001 console}"))
artifact(IX + 16, IY + 106, IW - 32, 84, "bucket africa-media",
         ("Original + 4 dérivés par visuel", "Compatible S3, signature v4"))
artifact(IX + 16, IY + 200, IW - 32, 46, "politique de lecture publique")

# ───────── volumes ─────────
VX, VY, VW, VH = 2065, 720, 500, 580
s.node3d(VX, VY, VW, VH, fill=NFILL)
node_header(VX, VY, VW, "device", "VolumesDocker",
            ("{persistance = volumes nommés}",))
vy = VY + 96
for nm, ln in [("pgdata", ["Données de PostgreSQL"]),
               ("minio-data", ["Objets binaires des médias"]),
               ("pnpm-store", ["Cache d'installation partagé (:deps)"]),
               ("node_modules-web / -cms", ["Dépendances propres à chaque application"]),
               ("mailpit-data", ["Courriels capturés en développement"])]:
    vy = artifact(VX + 16, vy, VW - 32, 86, nm, ln) + 8

# ═════════════════ chemins de communication ═════════════════
link([(465, 430), (525, 430)])
s.text(495, 418, "«HTTP»", 12, anchor="middle", fill=INK2)
s.text(495, 449, ":8080", 11, anchor="middle", fill=INK3, family=MONO)

link([(900, 400), (945, 400)])
s.text(922, 386, "«HTTP»", 12, anchor="middle", fill=INK2)
s.text(922, 419, "web:3000", 11, anchor="middle", fill=INK3, family=MONO)

link([(900, 880), (945, 880)])
s.text(922, 866, "«HTTP»", 12, anchor="middle", fill=INK2)
s.text(922, 899, "cms:3001", 11, anchor="middle", fill=INK3, family=MONO)

link([(945, 1200), (900, 1200)])
s.text(922, 1186, "«SMTP»", 12, anchor="middle", fill=INK2)
s.text(922, 1219, "1025", 11, anchor="middle", fill=INK3, family=MONO)

assembly(1150, 726, 1150, 650, "IContenuREST", lab_dx=-27, lab_dy=4, anchor="end")
s.text(1131, 714, "CMS_INTERNAL_URL = http://cms:3001", 11, anchor="end",
       fill=INK3, family=MONO)
assembly(1615, 850, 1520, 850, "ISQL", lab_dy=-17)
assembly(1615, 1150, 1520, 1150, "IStockageS3", lab_dy=-17)

link([(1440, 726), (1440, 650)], dash="7 5", marker="openA", stroke=ACCENT)
s.text(1456, 666, "«HTTP» POST /api/revalidate", 11.5, fill=ACCENT)
s.text(1456, 681, "déclenché à chaque publication", 10.5, fill=ACCENT, italic=True)

link([(1520, 470), (1615, 470)], dash="6 5", marker="open")
s.text(1567, 456, "«deploy»", 11.5, anchor="middle", fill=INK2)
link([(1280, 726), (1280, 705), (1700, 705), (1700, 650)], dash="6 5", marker="open")
s.text(1218, 709, "«deploy»", 11.5, anchor="middle", fill=INK2)

link([(2020, 900), (2065, 900)], dash="6 5", marker="open")
s.text(2042, 886, "«deploy»", 11, anchor="middle", fill=INK3)
link([(2020, 1180), (2065, 1180)], dash="6 5", marker="open")
s.text(2042, 1166, "«deploy»", 11, anchor="middle", fill=INK3)

# ═════════════════ légende ═════════════════
LX, LY, LW, LH = 80, 690, 370, 430
s.rect(LX, LY, LW, LH, fill=TINT, stroke=INK2, sw=1.3, rx=3)
s.text(LX + 16, LY + 28, "Légende — notation UML 2.5", 15, bold=True, fill=DEEP)
s.line(LX + 16, LY + 38, LX + LW - 16, LY + 38, stroke=INK2, sw=1.1)

ly = LY + 50
s.node3d(LX + 26, ly + 14, 44, 24, depth=8, fill=NFILL)
s.text(LX + 92, ly + 22, "Noeud", 12.5, bold=True, fill=INK)
s.text(LX + 92, ly + 38, "machine ou environnement d'exécution", 11, fill=INK2)
ly += 54
s.rect(LX + 26, ly + 14, 44, 24, fill=CFILL, stroke=INK2, sw=1.2)
s.comp_icon(LX + 50, ly + 17, 0.8)
s.text(LX + 92, ly + 22, "Composant", 12.5, bold=True, fill=INK)
s.text(LX + 92, ly + 38, "unité logicielle remplaçable", 11, fill=INK2)
ly += 54
s.rect(LX + 26, ly + 14, 44, 24, fill=AFILL, stroke=INK2, sw=1.2)
s.artifact_icon(LX + 52, ly + 16, 0.8)
s.text(LX + 92, ly + 22, "Artefact", 12.5, bold=True, fill=INK)
s.text(LX + 92, ly + 38, "fichier ou donnée déployée sur un noeud", 11, fill=INK2)
ly += 54
s.line(LX + 26, ly + 26, LX + 40, ly + 26, stroke=INK, sw=1.4)
s.circle(LX + 46, ly + 26, 6, fill=PAPER, stroke=INK, sw=1.5)
s.path(f"M{LX + 46} {ly + 14} A12 12 0 0 1 {LX + 46} {ly + 38}", fill="none",
       stroke=INK, sw=1.5)
s.line(LX + 58, ly + 26, LX + 70, ly + 26, stroke=INK, sw=1.4)
s.text(LX + 92, ly + 22, "Interface fournie / requise", 12.5, bold=True, fill=INK)
s.text(LX + 92, ly + 38, "connecteur d'assemblage boule et douille", 11, fill=INK2)
ly += 54
s.line(LX + 26, ly + 26, LX + 70, ly + 26, stroke=INK, sw=1.6)
s.text(LX + 92, ly + 22, "Chemin de communication", 12.5, bold=True, fill=INK)
s.text(LX + 92, ly + 38, "protocole porté par un stéréotype «…»", 11, fill=INK2)
ly += 54
s.path(f"M{LX + 26} {ly + 26} L{LX + 70} {ly + 26}", stroke=INK, sw=1.5,
       dash="6 5", marker="open")
s.text(LX + 92, ly + 22, "Dépendance", 12.5, bold=True, fill=INK)
s.text(LX + 92, ly + 38, "«deploy» : du noeud vers l'artefact déployé", 11, fill=INK2)
ly += 52
s.text(LX + 26, ly + 24, "{…} valeurs marquées    «…» stéréotype", 11.5,
       fill=INK3, family=MONO)

# ═════════════════ note ═════════════════
s.note(80, 1150, 370, [
    "Périmètre : environnement de développement local.",
    "Aucun serveur distant n'est représenté ; la mise en",
    "production ajoutera la terminaison TLS, un stockage",
    "objet géré et la sauvegarde de PostgreSQL.",
    "",
    "Le site public ne se connecte jamais à PostgreSQL :",
    "toute lecture traverse l'API du CMS, donc son",
    "contrôle d'accès. Un contenu non publié reste",
    "invisible même s'il est appelé par son identifiant.",
], size=11.5)

s.text(48, 1478, "Africa Ingénierie · diagramme conforme à UML 2.5.1 — les mots-clés entre "
                 "guillemets français sont des stéréotypes normalisés "
                 "(device, executionEnvironment, component, artifact, deploy).",
       12, fill=INK3)

open("architecture-deploiement.svg", "w", encoding="utf-8").write(s.render())
print("ok")
