#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Diagramme de classes UML 2.5 — modèle de données persistant Africa Ingénierie."""
import math
from umllib import (Svg, tw, SANS, MONO, BRAND, DEEP, ACCENT, INK, INK2, INK3,
                    LINE, PAPER, TINT, TINT2, NODE_TOP)

W, H = 4400, 2180
s = Svg(W, H,
        "Africa Ingénierie — diagramme de classes du modèle de données",
        "Classes persistantes, types de données composés, énumérations, "
        "généralisations, compositions et associations.")

CLS_HEAD = "#dce6f6"
CLS_BODY = "#ffffff"
ENUM_HEAD = "#e7e2f4"
DT_HEAD = "#dff0e8"
ABS_HEAD = "#cbd9f0"
PKG = "#f6f8fc"

AT = 15.5          # interligne d'un attribut
FS = 12.5          # taille de police d'un attribut


# ───────────────────────── formes de classe ─────────────────────────
def classbox(x, y, w, name, attrs, stereo=None, abstract=False,
             head=CLS_HEAD, body=CLS_BODY, constraints=(), namesize=15.5):
    hh = 34 + (18 if stereo else 0)
    h = hh + len(attrs) * AT + 10 + len(constraints) * 14
    s.rect(x, y, w, h, fill=body, stroke=INK, sw=1.5, rx=2)
    s.rect(x, y, w, hh, fill=head, stroke=INK, sw=1.5, rx=2)
    s.rect(x, y + hh - 2, w, 2, fill=head, stroke="none", sw=0)
    s.line(x, y + hh, x + w, y + hh, stroke=INK, sw=1.5)
    yy = y + 20
    if stereo:
        s.text(x + w / 2, yy, f"«{stereo}»", 12, anchor="middle", fill=INK2)
        yy += 19
    s.text(x + w / 2, yy + 4, name, namesize, bold=True, anchor="middle",
           italic=abstract, fill=DEEP)
    yy = y + hh + 18
    for a in attrs:
        col = INK3 if a.startswith("-") else INK
        s.text(x + 11, yy, a, FS, fill=col, family=MONO if False else SANS)
        yy += AT
    for c in constraints:
        s.text(x + 11, yy + 2, c, 11, italic=True, fill=BRAND)
        yy += 14
    return h


def enumbox(x, y, w, name, literals):
    return classbox(x, y, w, name, literals, stereo="enumeration", head=ENUM_HEAD,
                    namesize=14)


def dtbox(x, y, w, name, attrs):
    return classbox(x, y, w, name, attrs, stereo="dataType", head=DT_HEAD,
                    namesize=14)


def package(x, y, w, h, title, tabw=None, fill=PKG):
    tabw = tabw or tw(title, 14.5, True) + 40
    s.path(f"M{x} {y + 28} L{x} {y} L{x + tabw} {y} L{x + tabw} {y + 28} "
           f"L{x + w} {y + 28} L{x + w} {y + h} L{x} {y + h} Z",
           fill=fill, stroke=INK2, sw=1.6, join="round")
    s.line(x, y + 28, x + tabw, y + 28, stroke=INK2, sw=1.6)
    s.text(x + 16, y + 20, title, 14.5, bold=True, fill=DEEP)


def link(pts, stroke=INK, sw=1.5, dash=None, marker=None, marker_start=None):
    d = "M" + " L".join(f"{a:.1f} {b:.1f}" for a, b in pts)
    s.path(d, fill="none", stroke=stroke, sw=sw, dash=dash, marker=marker,
           marker_start=marker_start, join="round")


# ───────────────────────── titre ─────────────────────────
s.text(56, 50, "Africa Ingénierie — Architecture de la base de données", 32,
       bold=True, fill=DEEP)
s.text(56, 82, "Diagramme de classes UML 2.5.1 (OMG formal/17-12-05, §11) — modèle "
               "persistant PostgreSQL 17 exposé par Payload CMS", 16, fill=INK2)
s.text(W - 56, 50, "Version 0.1 — 22 entités persistantes · 102 tables physiques",
       14.5, anchor="end", fill=INK2)
s.text(W - 56, 76, "17 collections · 5 réglages globaux · 76 types énumérés · "
                   "localisation native fr / en", 13, anchor="end", fill=INK3,
       family=MONO)
s.line(56, 98, W - 56, 98, stroke=ACCENT, sw=2.5)

s.frame(48, 118, W - 96, H - 178, "class",
        "Modèle de données persistant de la plateforme Africa Ingénierie")

# ═══════════════════════ BANDE 1 ═══════════════════════
# ---- légende ----
LX, LY, LW, LH = 80, 200, 520, 620
s.rect(LX, LY, LW, LH, fill=TINT, stroke=INK2, sw=1.4, rx=3)
s.text(LX + 18, LY + 30, "Légende — notation UML 2.5", 16, bold=True, fill=DEEP)
s.line(LX + 18, LY + 40, LX + LW - 18, LY + 40, stroke=INK2, sw=1.1)
ly = LY + 58
rows = [
    ("Classe persistante", "en-tête bleu : une table principale"),
    ("Classe abstraite", "nom en italique : aucune table propre"),
    ("«dataType»", "type composé : table fille dédiée"),
    ("«enumeration»", "type énuméré PostgreSQL"),
]
for i, (a, b) in enumerate(rows):
    fillc = [CLS_HEAD, CLS_HEAD, DT_HEAD, ENUM_HEAD][i]
    s.rect(LX + 24, ly, 52, 30, fill=fillc, stroke=INK, sw=1.3)
    s.text(LX + 92, ly + 14, a, 13, bold=True, fill=INK, italic=(i == 1))
    s.text(LX + 92, ly + 29, b, 11.5, fill=INK2)
    ly += 42
ly += 6
s.path(f"M{LX + 24} {ly + 14} L{LX + 76} {ly + 14}", stroke=INK, sw=1.5, marker="tri")
s.text(LX + 92, ly + 10, "Généralisation", 13, bold=True, fill=INK)
s.text(LX + 92, ly + 25, "la sous-classe hérite de tous les attributs", 11.5, fill=INK2)
ly += 42
s.path(f"M{LX + 24} {ly + 14} L{LX + 76} {ly + 14}", stroke=INK, sw=1.5,
       marker_start="diamondF")
s.text(LX + 92, ly + 10, "Composition", 13, bold=True, fill=INK)
s.text(LX + 92, ly + 25, "la partie n'existe pas sans le tout (cascade)", 11.5, fill=INK2)
ly += 42
s.path(f"M{LX + 24} {ly + 14} L{LX + 76} {ly + 14}", stroke=INK, sw=1.5, marker="arrowFull")
s.text(LX + 92, ly + 10, "Association navigable", 13, bold=True, fill=INK)
s.text(LX + 92, ly + 25, "clé étrangère ou table de relations", 11.5, fill=INK2)
ly += 42
s.text(LX + 24, ly + 12, "+ public      - privé (jamais exposé par l'API)", 12,
       fill=INK2, family=MONO)
ly += 22
s.text(LX + 24, ly + 12, "[0..1] [0..*] [4]   multiplicités", 12, fill=INK2, family=MONO)
ly += 22
s.text(LX + 24, ly + 12, "{localized}  champ traduit fr / en", 12, fill=INK2, family=MONO)
ly += 22
s.text(LX + 24, ly + 12, "{unique} {id} {readOnly}  contraintes", 12, fill=INK2,
       family=MONO)

# ---- User / AuditLog ----
classbox(640, 200, 480, "User", [
    "+id : Serial {id}",
    "+email : Email {unique}",
    "+firstName : String",
    "+lastName : String",
    "+role : UserRole",
    "+isActive : Boolean = true",
    "+mustChangePassword : Boolean = false",
    "+locale : Locale = fr",
    "+lastLoginAt : DateTime [0..1]",
    "+sessions : Session [0..*] {composite}",
    "-hash : String   -salt : String",
    "-loginAttempts : Integer = 0",
    "-lockUntil : DateTime [0..1]",
    "-resetPasswordToken : String [0..1]",
    "+createdAt : DateTime {readOnly}",
    "+updatedAt : DateTime {readOnly}",
])
classbox(640, 540, 480, "AuditLog", [
    "+id : Serial {id}",
    "+action : AuditAction",
    "+entityType : String   +entityId : String [0..1]",
    "+actor : User [0..1]",
    "+summary : String [0..1]",
    "+note : Text [0..1]",
    "+before : JSON [0..1]   +after : JSON [0..1]",
    "-ipHash : Hash [0..1]",
    "+createdAt : DateTime {readOnly}",
], constraints=("{écrit dans la transaction de l'appelant}",
                "{aucune suppression : journal en ajout seul}"))

# ---- classe abstraite ----
ABS_H = classbox(1160, 200, 540, "ContenuÉditorial", [
    "+id : Serial {id}",
    "+slug : Slug [0..1] {unique, index}",
    "+editorialStatus : EditorialStatus = draft",
    "+archiveReason : String [0..1]",
    "+publishedAt : DateTime [0..1]",
    "+isDemo : Boolean = false",
    "+seo : SeoBlock [0..1] {composite}",
    "+createdBy : User [0..1]",
    "+updatedBy : User [0..1]",
    "+createdAt : DateTime {readOnly}",
    "+updatedAt : DateTime {readOnly}",
    "-_status : DraftStatus {versionnement Payload}",
], abstract=True, head=ABS_HEAD, namesize=17, constraints=(
    "{Page et LegalDocument n'ont pas de slug : leur clé",
    "  fonctionnelle est pageKey / documentKey}",
    "{editorialStatus = published implique les deux langues",
    "  complètes et un alt text sur chaque visuel}",
    "{editorialStatus = archived implique archiveReason}",
    "{toute transition d'état est journalisée dans AuditLog}",
))
ABS_BOTTOM = 200 + ABS_H

s.note(1250, ABS_BOTTOM + 40, 450, [
    "CIRCUIT ÉDITORIAL ET RÔLES",
    "",
    "brouillon → relecture → publié → archivé",
    "",
    "administrateur : tout, suppression comprise",
    "publicateur    : crée, modifie et publie",
    "éditeur        : crée et modifie, ne publie jamais",
    "",
    "Les règles dépendantes de la valeur sont",
    "portées par des hooks beforeValidate, non",
    "par le contrôle d'accès au niveau du champ.",
], size=12)

# ---- SeoBlock / MediaSize / Redirect ----
dtbox(1740, 200, 400, "SeoBlock", [
    "+title : String [0..1] {localized}",
    "+description : Text [0..1] {localized}",
    "+ogImage : MediaAsset [0..1]",
    "+noIndex : Boolean = false",
])
dtbox(1740, 350, 400, "MediaSize", [
    "+name : {thumbnail, card, hero, og}",
    "+url : URL   +filename : String",
    "+width : Integer   +height : Integer",
    "+mimeType : String   +filesize : Integer",
])
classbox(1740, 500, 400, "Redirect", [
    "+id : Serial {id}",
    "+from : Path {unique}",
    "+to : Path",
    "+statusCode : RedirectStatus = 301",
    "+reason : String [0..1]",
    "+isActive : Boolean = true",
])
s.note(1740, 670, 400, [
    "Alimenté automatiquement",
    "lorsqu'un slug publié change,",
    "afin qu'aucune URL déjà",
    "diffusée ne renvoie 404.",
], size=12)

# ---- MediaAsset ----
classbox(2180, 200, 480, "MediaAsset", [
    "+id : Serial {id}",
    "+filename : String {unique}",
    "+mimeType : String   +filesize : Integer",
    "+width : Integer   +height : Integer",
    "+url : URL {readOnly, dérivé}",
    "+altFr : String {obligatoire}",
    "+altEn : String {obligatoire}",
    "+caption : String [0..1] {localized}",
    "+rightsNote : String [0..1]",
    "+demoKey : String [0..1] {unique, index}",
    "+isDemo : Boolean = false",
    "+focalX : Number   +focalY : Number",
    "+sizes : MediaSize [4] {composite}",
    "+createdAt : DateTime {readOnly}",
], constraints=("{binaire stocké dans MinIO, jamais en base}",
                "{publication interdite sans altFr et altEn}"))

# ---- ContactMessage ----
classbox(2700, 200, 480, "ContactMessage", [
    "+id : Serial {id}",
    "+fullName : String   +email : Email",
    "+company : String [0..1]",
    "+subject : String [0..1]",
    "+need : String",
    "+message : Text",
    "+consentAt : DateTime",
    "+state : ContactState = new",
    "+assignedTo : User [0..1]",
    "-ipHash : Hash [0..1]",
    "-userAgentHash : Hash [0..1]",
    "+retentionUntil : Date [0..1]",
    "+createdAt : DateTime {readOnly}",
], constraints=("{données personnelles : purge à retentionUntil}",
                "{l'adresse IP n'est stockée que hachée}"))

s.note(2700, 500, 480, [
    "ContactMessage et Redirect n'héritent",
    "pas de ContenuÉditorial : ils ne sont ni",
    "traduits, ni versionnés, ni publiables,",
    "et échappent donc au circuit éditorial.",
], size=12)

s.note(2700, 625, 480, [
    "MediaAsset non plus n'hérite pas : un",
    "visuel n'est pas publié, il est référencé.",
    "C'est le contenu qui le porte qui décide",
    "de sa visibilité. En revanche altFr et",
    "altEn sont exigés dès le téléversement.",
], size=12)

# ---- notes de mappage ----
s.note(3220, 200, 1100, [
    "MAPPAGE PHYSIQUE — comment une classe devient des tables",
    "",
    "Payload éclate chaque classe en plusieurs tables PostgreSQL. Exemple de Realisation :",
    "",
    "   realisations                     colonnes non traduites (slug, year, clientName, …)",
    "   realisations_locales             une ligne par langue : _locale = 'fr' | 'en'",
    "   realisations_metrics             table fille du type composé Metric",
    "   _realisations_v                  versions successives du document",
    "   _realisations_v_locales          versions traduites",
    "   _realisations_v_version_metrics  parties composées de chaque version",
    "",
    "Une classe traduite et versionnée pèse donc de 4 à 6 tables. C'est ce qui explique",
    "les 102 tables physiques pour 22 entités logiques.",
], size=12.5)

s.note(3220, 560, 1100, [
    "BILINGUISME — un seul document, deux traductions",
    "",
    "La localisation est native : le français est la langue par défaut, l'anglais la seconde,",
    "avec repli automatique sur le français. Un attribut marqué {localized} n'existe pas en",
    "double dans la table principale — il vit dans la table _locales, une ligne par langue.",
    "",
    "Conséquence de conception : l'identifiant, le slug et l'état éditorial sont communs aux",
    "deux langues. Publier un contenu le publie donc dans les deux langues à la fois, ce qui",
    "impose la garde de traduction : la publication est refusée tant que la seconde langue",
    "n'est pas complète.",
], size=12.5)

# ═══════════════════════ BANDE 2 — sous-classes ═══════════════════════
BY = 900
BW, BG = 330, 16
order = [
    ("Page", [
        "+pageKey : PageKey {unique}",
        "+eyebrow : String {localized}",
        "+title : String {localized}",
        "+intro : Text [0..1] {localized}",
        "+emptyStateTitle : String [0..1] {loc.}",
        "+emptyStateText : Text [0..1] {loc.}",
    ], ("{8 pages de section, non créables}",)),
    ("Expertise", [
        "+title : String {localized}",
        "+summary : Text {localized}",
        "+body : RichText {localized}",
        "+iconKey : IconKey [0..1]",
        "+position : Integer [0..1]",
        "+servicePoints : ServicePoint [0..*]",
        "        {composite, localized}",
        "+media : MediaAsset [0..1]",
    ], ()),
    ("Realisation", [
        "+title : String {localized}",
        "+summary : Text {localized}",
        "+context : RichText {localized}",
        "+solution : RichText {localized}",
        "+results : RichText {localized}",
        "+clientName : String [0..1]",
        "+year : Integer [0..1]",
        "+sector : String [0..1] {localized}",
        "+country : String [0..1]",
        "+isFeatured : Boolean = false",
        "+expertise : Expertise [0..1]",
        "+metrics : Metric [0..*]",
        "        {composite, localized}",
        "+media : MediaAsset [0..1]",
        "+beforeMedia : MediaAsset [0..1]",
        "+afterMedia : MediaAsset [0..1]",
    ], ()),
    ("Project", [
        "+title : String {localized}",
        "+summary : Text {localized}",
        "+body : RichText {localized}",
        "+projectState : ProjectState",
        "+clientName : String [0..1]",
        "+country : String [0..1]",
        "+startDate : Date [0..1]",
        "+expertise : Expertise [0..1]",
        "+media : MediaAsset [0..1]",
    ], ()),
    ("Event", [
        "+title : String {localized}",
        "+eventType : String {localized}",
        "+summary : Text {localized}",
        "+body : RichText {localized}",
        "+startsAt : DateTime",
        "+endsAt : DateTime [0..1]",
        "+locationName : String {localized}",
        "+city : String   +country : String",
        "+media : MediaAsset [0..1]",
    ], ("{aucune billetterie,}", "{aucun paiement, aucune commande}")),
    ("Product", [
        "+reference : String {unique}",
        "+title : String {localized}",
        "+category : String {localized}",
        "+summary : Text {localized}",
        "+description : RichText {localized}",
        "+availability : String {localized}",
        "+leadTime : String [0..1] {localized}",
        "+specs : Spec [0..*]",
        "        {composite, localized}",
        "+ctaLabel : String [0..1] {localized}",
        "+isFeatured : Boolean = false",
        "+media : MediaAsset [0..1]",
    ], ()),
    ("TeamMember", [
        "+name : String",
        "+role : String {localized}",
        "+bio : RichText {localized}",
        "+linkedinUrl : URL [0..1]",
        "+position : Integer [0..1]",
        "+portrait : MediaAsset [0..1]",
    ], ()),
    ("Partner", [
        "+name : String",
        "+externalUrl : URL [0..1]",
        "+position : Integer [0..1]",
        "+logo : MediaAsset [0..1]",
    ], ()),
    ("Testimonial", [
        "+quote : Text {localized}",
        "+personName : String",
        "+role : String [0..1] {localized}",
        "+company : String [0..1]",
        "+consentReceivedAt : DateTime",
        "+portrait : MediaAsset [0..1]",
    ], ("{publication refusée sans}", "{consentement daté}")),
    ("LegalDocument", [
        "+documentKey : DocumentKey {unique}",
        "+title : String {localized}",
        "+body : RichText {localized}",
    ], ("{2 documents : mentions légales,}",
        "{politique de confidentialité}")),
    ("Formation", [
        "+title : String {localized}",
        "+summary : Text {localized}",
        "+audience : String {localized}",
        "+duration : String {localized}",
        "+format : String {localized}",
        "+theme : FormationTheme",
        "+objectives : Objective [0..*]",
        "        {composite, localized}",
        "+prerequisites : Text [0..1] {loc.}",
        "+media : MediaAsset [0..1]",
    ], ()),
]
pos = {}
x = 80
for nm, attrs, cons in order:
    h = classbox(x, BY, BW, nm, attrs, constraints=cons)
    pos[nm] = (x, BY, BW, h)
    x += BW + BG

# FormationSession : classe à part, composée par Formation
FSX = x + 62
h = classbox(FSX, BY, BW, "FormationSession", [
    "+id : Serial {id}",
    "+formation : Formation",
    "+label : String [0..1]",
    "+startsAt : DateTime",
    "+endsAt : DateTime [0..1]",
    "+locationName : String",
    "+city : String   +country : String",
    "+seats : Integer [0..1]",
    "+editorialStatus : EditorialStatus",
    "+isDemo : Boolean = false",
    "+createdAt : DateTime {readOnly}",
    "+updatedAt : DateTime {readOnly}",
], constraints=("{ni traduite, ni versionnée :}",
                "{elle suit sa formation}"))
pos["FormationSession"] = (FSX, BY, BW, h)

# ---- arbre de généralisation ----
BUS = 860
first = pos["Page"][0] + BW / 2
last = pos["Formation"][0] + BW / 2
s.line(first, BUS, last, BUS, stroke=INK, sw=1.5)
for nm, _, _ in order:
    cx = pos[nm][0] + BW / 2
    s.line(cx, BUS, cx, BY, stroke=INK, sw=1.5)
s.path(f"M1200 {BUS} L1200 {ABS_BOTTOM + 4}", stroke=INK, sw=1.5, marker="tri")

# ---- composition Formation ◆— FormationSession ----
fx = pos["Formation"][0] + BW
s.path(f"M{fx} 1010 L{FSX} 1010", stroke=INK, sw=1.5, marker_start="diamondF")
s.text((fx + FSX) / 2, 1000, "1", 12, anchor="middle", fill=INK2)
s.text((fx + FSX) / 2, 1032, "0..*", 12, anchor="middle", fill=INK2)
s.text((fx + FSX) / 2, 984, "planifie", 11.5, anchor="middle", fill=INK2, italic=True)

# ---- associations vers Expertise ----
ex, ey, ew, eh = pos["Expertise"]
rx0 = pos["Realisation"][0]
s.path(f"M{rx0} 960 L{ex + ew} 960", stroke=INK, sw=1.5, marker="arrowFull")
s.text((rx0 + ex + ew) / 2, 950, "0..1", 11.5, anchor="middle", fill=INK2)

px0, py0, pw0, ph0 = pos["Project"]
s.path(f"M{px0 + pw0 / 2} {py0 + ph0} L{px0 + pw0 / 2} 1252 "
       f"L{ex + ew / 2} 1252 L{ex + ew / 2} {ey + eh}",
       stroke=INK, sw=1.5, marker="arrowFull")
s.text((px0 + pw0 / 2 + ex + ew / 2) / 2, 1244, "relève de   0..1", 11.5,
       anchor="middle", fill=INK2)

# ---- association ContenuÉditorial → User ----
s.path("M1160 300 L1120 300", stroke=INK, sw=1.5, marker="arrowFull")
s.text(1140, 290, "0..1", 11, anchor="middle", fill=INK2)
s.text(1140, 327, "auteur", 11, anchor="middle", fill=INK2, italic=True)
# ---- composition ContenuÉditorial ◆— SeoBlock ----
s.path("M1700 260 L1740 260", stroke=INK, sw=1.5, marker_start="diamondF")
s.text(1720, 250, "0..1", 11, anchor="middle", fill=INK2)
# ---- SeoBlock → MediaAsset ----
s.path("M2140 285 L2180 285", stroke=INK, sw=1.5, marker="arrowFull")
s.text(2160, 275, "0..1", 11, anchor="middle", fill=INK2)
# ---- MediaAsset ◆— MediaSize ----
s.path("M2180 420 L2140 420", stroke=INK, sw=1.5, marker_start="diamondF")
s.text(2160, 410, "4", 11, anchor="middle", fill=INK2)
# ---- AuditLog → User ----
s.path("M880 540 L880 508", stroke=INK, sw=1.5, marker="arrowFull")
s.text(898, 528, "0..1", 11, fill=INK2)

# ═══════════════════════ BANDE 3 ═══════════════════════
P3Y, P3H = 1300, 780

# ---- réglages globaux ----
package(80, P3Y, 1820, P3H, "«package» Réglages globaux — une seule instance par site")
classbox(104, P3Y + 44, 520, "SiteSettings", [
    "+siteName : String {localized}",
    "+tagline : String [0..1] {localized}",
    "+baseline : String {localized}",
    "+logo : MediaAsset [0..1]",
    "+favicon : MediaAsset [0..1]",
    "+addressLine1 : String [0..1]",
    "+addressLine2 : String [0..1]",
    "+city : String [0..1]   +country : String [0..1]",
    "+phone : String [0..1]   +phoneRaw : String [0..1]",
    "+whatsapp : String [0..1]   +email : Email [0..1]",
    "+openingHours : OpeningHour [0..*] {comp., loc.}",
    "+replyDelay : String [0..1] {localized}",
    "+socialLinks : SocialLink [0..*] {composite}",
    "+englishEnabled : Boolean = true",
    "+cookieTitle : String {localized}",
    "+cookieText : Text {localized}",
    "+defaultSeoTitle : String {localized}",
    "+defaultSeoDescription : Text {localized}",
], stereo="singleton")
classbox(648, P3Y + 44, 520, "Homepage", [
    "+heroEyebrow : String [0..1] {localized}",
    "+heroTitle : String {localized}",
    "+heroHighlight : String [0..1] {localized}",
    "+heroLead : Text [0..1] {localized}",
    "+heroMedia : MediaAsset [0..1]",
    "+sections : HomeSection [0..*] {comp., loc.}",
    "+keyFigures : KeyFigure [0..*] {comp., loc.}",
    "+featuredProducts : Product [0..*]",
    "+featuredRealisations : Realisation [0..*]",
    "+featuredFormations : Formation [0..*]",
    "+featuredEvents : Event [0..*]",
], stereo="singleton",
    constraints=("{les 4 relations « featured » sont stockées}",
                 "{dans la table de relations homepage_rels}"))
classbox(1192, P3Y + 44, 360, "Navigation", [
    "+mainMenu : MenuEntry [0..*]",
    "        {composite, localized}",
    "+contactLabel : String [0..1] {loc.}",
], stereo="singleton")
classbox(1192, P3Y + 214, 360, "CeoMessage", [
    "+personName : String",
    "+personRole : String {localized}",
    "+messageTitle : String {localized}",
    "+lead : Text {localized}",
    "+body : RichText {localized}",
    "+portrait : MediaAsset [0..1]",
    "+videoUrl : URL [0..1]",
], stereo="singleton")
classbox(1192, P3Y + 424, 360, "AboutPage", [
    "+presentation : RichText {localized}",
    "+vision : RichText {localized}",
    "+pillars : Pillar [0..*] {comp., loc.}",
    "+media : MediaAsset [0..1]",
], stereo="singleton")
s.note(1576, P3Y + 44, 300, [
    "Un réglage global n'a",
    "ni slug, ni état éditorial,",
    "ni version : il est créé",
    "une fois et seulement",
    "modifié ensuite.",
    "",
    "Il est néanmoins traduit :",
    "table <global>_locales.",
], size=12)

# ---- types composés ----
package(1960, P3Y, 1020, P3H, "«package» Types composés — chacun devient une table fille")
dts = [
    ("Session", ["+id : UUID", "+createdAt : DateTime", "+expiresAt : DateTime"]),
    ("ServicePoint", ["+label : String {localized}", "+text : Text {localized}"]),
    ("Metric", ["+value : String {localized}", "+label : String {localized}"]),
    ("Objective", ["+text : String {localized}"]),
    ("Spec", ["+label : String {localized}", "+value : String {localized}"]),
    ("KeyFigure", ["+value : Integer", "+suffix : String [0..1] {loc.}",
                   "+label : String {localized}"]),
    ("HomeSection", ["+key : HomeSectionKey", "+eyebrow : String [0..1] {loc.}",
                     "+title : String [0..1] {loc.}", "+intro : Text [0..1] {loc.}",
                     "+ctaLabel : String [0..1] {loc.}", "+isVisible : Boolean = true"]),
    ("MenuEntry", ["+label : String {localized}", "+section : NavSection",
                   "+isVisible : Boolean = true"]),
    ("OpeningHour", ["+days : String {localized}", "+hours : String {localized}"]),
    ("SocialLink", ["+network : SocialNetwork", "+url : URL [0..1]"]),
    ("Pillar", ["+icon : PillarIcon [0..1]", "+title : String {localized}",
                "+text : Text {localized}"]),
]
cols = [1980, 2320, 2660]
colw = 300
coly = [P3Y + 44] * 3
for nm, attrs in dts:
    i = coly.index(min(coly))
    h = dtbox(cols[i], coly[i], colw, nm, attrs)
    coly[i] += h + 14

# ---- énumérations ----
package(3040, P3Y, 1280, P3H, "«package» Types énumérés métier (16 des 76 types "
                              "présents en base)")
enums = [
    ("EditorialStatus", ["draft", "review", "published", "archived"]),
    ("DraftStatus", ["draft", "published"]),
    ("UserRole", ["administrator", "publisher", "editor"]),
    ("Locale", ["fr", "en"]),
    ("ProjectState", ["planned", "ongoing", "done"]),
    ("FormationTheme", ["maintenance", "securite", "leadership", "innovation"]),
    ("PageKey", ["expertises", "realisations", "projets", "formations-evenements",
                 "evenements", "produits", "a-propos", "contact"]),
    ("DocumentKey", ["legal_notice", "privacy_policy"]),
    ("IconKey", ["wrench", "install", "grad", "box", "weld", "bolt", "target",
                 "globe", "layers"]),
    ("AuditAction", ["create", "update", "publish", "unpublish", "archive",
                     "delete", "login", "logout", "settings_change"]),
    ("ContactState", ["new", "in_progress", "replied", "closed", "redacted"]),
    ("HomeSectionKey", ["trust", "about", "expertises", "products", "figures",
                        "realisations", "trainingEvents", "leadership",
                        "testimonials", "cta"]),
    ("NavSection", ["home", "expertises", "realisations", "projets",
                    "formationsEvenements", "evenements", "produits", "aPropos",
                    "contact"]),
    ("SocialNetwork", ["li", "fb", "yt"]),
    ("RedirectStatus", ["301", "308"]),
    ("PillarIcon", ["target", "globe", "layers", "shield", "grad", "bolt"]),
]
ecols = [3050, 3305, 3560, 3815, 4070]
ecolw = 243
ecoly = [P3Y + 44] * 5
for nm, lits in enums:
    i = ecoly.index(min(ecoly))
    h = enumbox(ecols[i], ecoly[i], ecolw, nm, lits)
    ecoly[i] += h + 12

s.note(104, P3Y + 404, 520, [
    "TABLES PHYSIQUES DES RÉGLAGES GLOBAUX",
    "",
    "site_settings · site_settings_locales",
    "site_settings_opening_hours · site_settings_social_links",
    "navigation · navigation_locales",
    "navigation_main_menu · navigation_main_menu_locales",
    "homepage · homepage_locales · homepage_rels",
    "homepage_sections · homepage_sections_locales",
    "homepage_key_figures · homepage_key_figures_locales",
    "ceo_message · ceo_message_locales",
    "about_page · about_page_locales",
    "about_page_pillars · about_page_pillars_locales",
    "",
    "Soit 19 tables pour 5 réglages globaux.",
], size=11.5)

s.note(1192, P3Y + 596, 360, [
    "Un réglage global est versionné",
    "lui aussi : Payload maintient les",
    "tables miroir _<global>_v.",
], size=12)

s.note(1980, max(coly) + 8, 980, [
    "POURQUOI UN TYPE COMPOSÉ DEVIENT UNE TABLE",
    "",
    "PostgreSQL ne stocke pas de liste imbriquée. Chaque attribut de multiplicité [0..*]",
    "devient donc une table fille portant une clé étrangère vers son propriétaire, un",
    "rang d'ordre (_order) et, si le type est traduit, la colonne _locale.",
    "",
    "Exemple :  Product.specs [0..*]  →  products_specs (product_id, _order, _locale, label, value)",
    "",
    "La composition (losange plein) traduit la suppression en cascade : supprimer le produit",
    "supprime ses spécifications. Aucune de ces parties n'a d'existence autonome.",
], size=12.5)

s.text(56, H - 30, "Africa Ingénierie · diagramme conforme à UML 2.5.1 — visibilités, "
                   "multiplicités, chaînes de propriétés {…}, généralisation, "
                   "composition et association navigable selon la norme.",
       12.5, fill=INK3)

open("architecture-base-de-donnees.svg", "w", encoding="utf-8").write(s.render())
print("colonnes types composés:", [round(c) for c in coly])
print("colonnes enums:", [round(c) for c in ecoly], "limite:", P3Y + P3H)
print("ok")
