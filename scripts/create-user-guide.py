from datetime import date
from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Mm, Pt, RGBColor


ROOT = Path(r"C:\Projet\Projets- ING")
# The desktop artifact directory is writable in this session; the source project
# remains read-only for binary artifact output while text changes stay in-repo.
OUT = Path(r"C:\Projet\Projet -ING\guide-utilisateur-africa-ingenierie.docx")

IMAGES = {
    "contact": Path(r"C:\Users\pc\AppData\Local\Temp\codex-clipboard-34a13248-6397-4c76-a644-7f208adc892d.png"),
    "footer": Path(r"C:\Users\pc\AppData\Local\Temp\codex-clipboard-ad20888e-88f4-4ac7-9e82-46ae0add5ba3.png"),
    "figures": Path(r"C:\Users\pc\AppData\Local\Temp\codex-clipboard-08a9007b-c434-45d6-acfd-c56c325059cd.png"),
    "trust": Path(r"C:\Users\pc\AppData\Local\Temp\codex-clipboard-549f393f-c774-4eeb-978e-8dffd0915c52.png"),
    "testimonials": Path(r"C:\Users\pc\AppData\Local\Temp\codex-clipboard-b4e9be64-d170-4e16-8d96-44722bb36215.png"),
    "training": Path(r"C:\Users\pc\AppData\Local\Temp\codex-clipboard-43959013-959f-42d3-8a21-ff860da04689.png"),
    "navigation": Path(r"C:\Users\pc\AppData\Local\Temp\codex-clipboard-455d370b-0b8f-4cbc-a945-f4c57f964a5f.png"),
    "partner_media": Path(r"C:\Users\pc\AppData\Local\Temp\codex-clipboard-a787e154-646b-4a9a-9b16-8a91fbadfe89.png"),
}

NAVY = "0B2E6D"
BLUE = "1E5BD7"
CORAL = "E9344B"
PALE = "F3F6FB"
INK = "111827"
MUTED = "5B677A"
WHITE = "FFFFFF"


def shade(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def cell_border(cell, color="D5DEEA", size="8"):
    tc_pr = cell._tc.get_or_add_tcPr()
    borders = tc_pr.first_child_found_in("w:tcBorders")
    if borders is None:
        borders = OxmlElement("w:tcBorders")
        tc_pr.append(borders)
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        tag = "w:" + edge
        element = borders.find(qn(tag))
        if element is None:
            element = OxmlElement(tag)
            borders.append(element)
        element.set(qn("w:val"), "single")
        element.set(qn("w:sz"), size)
        element.set(qn("w:space"), "0")
        element.set(qn("w:color"), color)


def set_cell_text(cell, text, bold=False, color=INK, size=9.2):
    cell.text = ""
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(2)
    run = p.add_run(text)
    run.bold = bold
    run.font.name = "Arial"
    run.font.size = Pt(size)
    run.font.color.rgb = RGBColor.from_string(color)
    cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER


def set_repeat_table_header(row):
    tr_pr = row._tr.get_or_add_trPr()
    tbl_header = OxmlElement("w:tblHeader")
    tbl_header.set(qn("w:val"), "true")
    tr_pr.append(tbl_header)


def add_table(doc, headers, rows, widths=None):
    table = doc.add_table(rows=1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.style = "Table Grid"
    header = table.rows[0]
    set_repeat_table_header(header)
    for i, text in enumerate(headers):
        set_cell_text(header.cells[i], text, bold=True, color=WHITE, size=8.8)
        shade(header.cells[i], NAVY)
    for row_values in rows:
        row = table.add_row()
        for i, value in enumerate(row_values):
            set_cell_text(row.cells[i], str(value), size=8.7)
            shade(row.cells[i], "FFFFFF" if len(table.rows) % 2 else PALE)
    for row in table.rows:
        tr_pr = row._tr.get_or_add_trPr()
        tr_pr.append(OxmlElement("w:cantSplit"))
        for cell in row.cells:
            cell_border(cell)
    if widths:
        for row in table.rows:
            for idx, width in enumerate(widths):
                row.cells[idx].width = Inches(width)
    doc.add_paragraph().paragraph_format.space_after = Pt(1)
    return table


def add_rule(doc, color=CORAL, width=1.2):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(1)
    p.paragraph_format.space_after = Pt(7)
    pPr = p._p.get_or_add_pPr()
    pBdr = OxmlElement("w:pBdr")
    bottom = OxmlElement("w:bottom")
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), str(int(width * 8)))
    bottom.set(qn("w:space"), "1")
    bottom.set(qn("w:color"), color)
    pBdr.append(bottom)
    pPr.append(pBdr)
    return p


def add_caption(doc, text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(9)
    run = p.add_run(text)
    run.italic = True
    run.font.name = "Arial"
    run.font.size = Pt(8.5)
    run.font.color.rgb = RGBColor.from_string(MUTED)


def add_screenshot(doc, key, caption, width=6.35):
    image = IMAGES[key]
    if not image.exists():
        return
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(3)
    p.paragraph_format.space_after = Pt(2)
    p.add_run().add_picture(str(image), width=Inches(width))
    add_caption(doc, caption)


def add_bullet(doc, text, level=0):
    p = doc.add_paragraph(style="List Bullet" if level == 0 else "List Bullet 2")
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.left_indent = Inches(0.22 + level * 0.18)
    run = p.add_run(text)
    run.font.name = "Arial"
    run.font.size = Pt(10)
    run.font.color.rgb = RGBColor.from_string(INK)
    return p


def add_number(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.left_indent = Inches(0.24)
    p.paragraph_format.first_line_indent = Inches(-0.18)
    run = p.add_run("→  " + text)
    run.font.name = "Arial"
    run.font.size = Pt(10)
    run.font.color.rgb = RGBColor.from_string(INK)
    return p


def add_body(doc, text, bold_prefix=None):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.line_spacing = 1.12
    if bold_prefix and text.startswith(bold_prefix):
        r1 = p.add_run(bold_prefix)
        r1.bold = True
        r1.font.name = "Arial"
        r1.font.size = Pt(10.2)
        r1.font.color.rgb = RGBColor.from_string(INK)
        r2 = p.add_run(text[len(bold_prefix):])
        r2.font.name = "Arial"
        r2.font.size = Pt(10.2)
        r2.font.color.rgb = RGBColor.from_string(INK)
    else:
        r = p.add_run(text)
        r.font.name = "Arial"
        r.font.size = Pt(10.2)
        r.font.color.rgb = RGBColor.from_string(INK)
    return p


def add_heading(doc, text, level=1):
    p = doc.add_paragraph()
    p.style = f"Heading {level}"
    p.paragraph_format.keep_with_next = True
    p.paragraph_format.space_before = Pt(13 if level == 1 else 8)
    p.paragraph_format.space_after = Pt(5)
    r = p.add_run(text)
    r.font.name = "Georgia" if level == 1 else "Arial"
    r.bold = True
    r.font.size = Pt(19 if level == 1 else 12.5)
    r.font.color.rgb = RGBColor.from_string(INK)
    return p


def add_callout_table(doc, label, text, fill=PALE):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.rows[0]._tr.get_or_add_trPr().append(OxmlElement("w:cantSplit"))
    cell = table.cell(0, 0)
    shade(cell, fill)
    cell_border(cell, color="D5DEEA", size="10")
    cell.text = ""
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(3)
    r = p.add_run(label)
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(9.5)
    r.font.color.rgb = RGBColor.from_string(NAVY)
    p2 = cell.add_paragraph()
    p2.paragraph_format.space_after = Pt(2)
    r2 = p2.add_run(text)
    r2.font.name = "Arial"
    r2.font.size = Pt(9.5)
    r2.font.color.rgb = RGBColor.from_string(INK)
    doc.add_paragraph().paragraph_format.space_after = Pt(1)


def add_page_number(paragraph):
    paragraph.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    run = paragraph.add_run("Africa Ingénierie  •  Guide utilisateur  |  ")
    run.font.name = "Arial"
    run.font.size = Pt(8)
    run.font.color.rgb = RGBColor.from_string(MUTED)
    field = OxmlElement("w:fldSimple")
    field.set(qn("w:instr"), "PAGE")
    paragraph._p.append(field)


def setup(doc):
    section = doc.sections[0]
    section.top_margin = Mm(17)
    section.bottom_margin = Mm(16)
    section.left_margin = Mm(18)
    section.right_margin = Mm(18)
    section.header_distance = Mm(8)
    section.footer_distance = Mm(8)
    styles = doc.styles
    normal = styles["Normal"]
    normal.font.name = "Arial"
    normal.font.size = Pt(10.2)
    normal.font.color.rgb = RGBColor.from_string(INK)
    normal.paragraph_format.space_after = Pt(6)
    for name, size in (("Heading 1", 19), ("Heading 2", 13), ("Heading 3", 11)):
        style = styles[name]
        style.font.name = "Georgia" if name == "Heading 1" else "Arial"
        style.font.size = Pt(size)
        style.font.bold = True
        style.font.color.rgb = RGBColor.from_string(INK)
    header = section.header.paragraphs[0]
    header.alignment = WD_ALIGN_PARAGRAPH.LEFT
    r = header.add_run("AFRICA INGÉNIERIE  /  MODE D’EMPLOI")
    r.font.name = "Arial"
    r.bold = True
    r.font.size = Pt(8)
    r.font.color.rgb = RGBColor.from_string(NAVY)
    add_page_number(section.footer.paragraphs[0])


def page_break(doc):
    doc.add_paragraph().add_run().add_break(WD_BREAK.PAGE)


def main():
    doc = Document()
    setup(doc)

    # Cover
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(38)
    r = p.add_run("GUIDE UTILISATEUR")
    r.font.name = "Arial"
    r.bold = True
    r.font.size = Pt(11)
    r.font.color.rgb = RGBColor.from_string(CORAL)
    add_rule(doc, CORAL, 1.4)
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(3)
    r = p.add_run("Piloter le site\nAfrica Ingénierie")
    r.font.name = "Georgia"
    r.bold = True
    r.font.size = Pt(33)
    r.font.color.rgb = RGBColor.from_string(INK)
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(22)
    r = p.add_run("Gestion éditoriale, médias, traductions, formulaires et publication")
    r.font.name = "Arial"
    r.font.size = Pt(14)
    r.font.color.rgb = RGBColor.from_string(MUTED)
    add_callout_table(
        doc,
        "À qui s’adresse ce guide ?",
        "Aux administrateurs, éditeurs et responsables de publication qui gèrent le site public et l’espace d’administration.",
        fill="EAF1FF",
    )
    add_body(doc, f"Version de référence : {date(2026, 9, 5).strftime('%d/%m/%Y')} • environnement local.")
    add_body(doc, "Ce document décrit les parcours recommandés pour maintenir un site cohérent, bilingue, responsive et facile à vérifier.")
    page_break(doc)

    # Contents and principles
    add_heading(doc, "Sommaire", 1)
    for item in [
        "1. Comprendre l’architecture du site",
        "2. Se connecter et choisir son rôle",
        "3. Parcours de publication recommandé",
        "4. Réglages généraux, coordonnées et réseaux sociaux",
        "5. Navigation et page d’accueil",
        "6. Partenaires, visuels et section « Ils nous font confiance »",
        "7. Témoignages clients et modération",
        "8. Chiffres clés",
        "9. Formations, produits, expertises et réalisations",
        "10. Formulaires de contact et export des messages",
        "11. Traductions français / anglais",
        "12. Responsive, accessibilité et contrôle qualité",
        "13. Historique, sécurité et sauvegardes",
        "14. Dépannage rapide et check-lists",
    ]:
        add_bullet(doc, item)
    add_heading(doc, "Principes de gestion", 2)
    add_body(doc, "Chaque contenu suit le même cycle : préparer → enregistrer en brouillon → contrôler le visuel et les deux langues → publier → vérifier le rendu public.")
    add_body(doc, "Une image n’est pas seulement un fichier : elle doit avoir un texte alternatif, un cadrage adapté au composant et des droits d’utilisation vérifiés.")
    add_body(doc, "Les captures insérées dans ce guide sont des captures réelles des interfaces fournies pour le projet. Elles servent de repères visuels ; les libellés peuvent évoluer avec les versions.")

    # 1
    add_heading(doc, "1. Comprendre l’architecture du site", 1)
    add_body(doc, "Le site comporte deux espaces complémentaires : le site public, consulté par les visiteurs, et l’administration, qui centralise les contenus, la modération, les réglages et la traçabilité.")
    add_table(doc, ["Espace", "Adresse locale", "Usage"], [
        ("Site public FR", "http://localhost:8080/fr", "Consulter et vérifier la version française."),
        ("Site public EN", "http://localhost:8080/en", "Consulter et vérifier la version anglaise."),
        ("Administration", "http://admin.localhost:8080/admin", "Créer, traduire, prévisualiser et publier."),
    ], widths=[1.2, 2.2, 3.0])
    add_body(doc, "Les pages publiques reprennent notamment l’accueil, les expertises, les réalisations, les formations et événements, les produits, la page À propos et la page Contact.")

    # 2
    add_heading(doc, "2. Se connecter et choisir son rôle", 1)
    add_body(doc, "L’accès d’administration est protégé par authentification. Utilisez uniquement votre compte nominatif et ne partagez jamais votre mot de passe.")
    add_table(doc, ["Rôle", "Peut faire", "Ne doit pas faire"], [
        ("Administrateur", "Réglages globaux, utilisateurs, médias, contenus, publication et historique.", "Modifier les secrets techniques hors procédure."),
        ("Éditeur", "Créer et modifier des brouillons, compléter les contenus et les traductions.", "Publier ou modifier les réglages sensibles."),
        ("Responsable publication", "Relire, modérer et publier les contenus validés.", "Changer les droits et la configuration technique."),
    ], widths=[1.3, 3.0, 2.1])
    add_callout_table(doc, "Règle pratique", "Si un bouton de publication, un réglage ou une collection n’apparaît pas, vérifiez d’abord votre rôle. C’est un contrôle RBAC attendu, pas une panne de l’interface.")

    # 3
    add_heading(doc, "3. Parcours de publication recommandé", 1)
    for step in [
        "Ouvrir la collection ou le réglage concerné depuis le menu latéral.",
        "Renseigner les champs français et anglais lorsque le contenu doit être visible dans les deux langues.",
        "Ajouter ou sélectionner les médias depuis la Médiathèque ; compléter le texte alternatif.",
        "Enregistrer le brouillon et relire la page dans sa prévisualisation.",
        "Vérifier les liens, les boutons, les images et la mise en page sur mobile.",
        "Publier uniquement après validation ; ouvrir ensuite la page publique dans les deux langues.",
    ]:
        add_number(doc, step)
    add_callout_table(doc, "Contrôle immédiat après publication", "Actualisez la page publique, contrôlez le menu actif, le pied de page, les traductions, les visuels, les formulaires et les éventuels liens externes.", fill="FFF5F5")

    # 4
    add_heading(doc, "4. Réglages généraux, coordonnées et réseaux sociaux", 1)
    add_body(doc, "Les réglages généraux alimentent plusieurs emplacements du site. Faites une seule modification dans l’administration, puis vérifiez le pied de page et la page Contact.")
    add_heading(doc, "Coordonnées et carte", 2)
    for item in [
        "Renseigner le nom, l’adresse, l’e-mail, les numéros de téléphone et les horaires.",
        "Saisir la latitude, la longitude et le niveau de zoom de la carte.",
        "Enregistrer puis vérifier la petite carte du pied de page et la carte plus grande de la page Contact.",
        "Si les coordonnées sont absentes ou invalides, la carte est volontairement masquée pour éviter un emplacement trompeur.",
    ]:
        add_bullet(doc, item)
    add_heading(doc, "WhatsApp, Facebook et LinkedIn", 2)
    add_body(doc, "Le numéro WhatsApp doit être saisi au format international, chiffres uniquement de préférence. Le site génère alors un lien wa.me permettant au visiteur d’ouvrir une conversation.")
    add_body(doc, "Facebook et LinkedIn doivent être enregistrés avec une URL HTTPS complète. Les liens invalides ou vides ne sont pas affichés publiquement afin d’éviter les icônes sans destination.")
    add_body(doc, "Après sauvegarde, contrôlez les icônes dans le pied de page : WhatsApp, Facebook et LinkedIn ne sont visibles que si une valeur valide est effectivement renseignée dans les réglages.")
    add_screenshot(doc, "footer", "Capture 1 — Pied de page public : navigation, bouton de témoignage et zone coordonnées.")

    # 5
    add_heading(doc, "5. Navigation et page d’accueil", 1)
    add_heading(doc, "Ajouter un élément de menu", 2)
    for item in [
        "Ouvrir Configuration → Navigation.",
        "Ajouter un item, renseigner son libellé FR et EN, puis choisir une destination existante.",
        "Activer Visible, enregistrer et utiliser la prévisualisation du menu.",
        "Tester le lien sur desktop et mobile ; la barre d’état rouge doit signaler uniquement la page active.",
    ]:
        add_number(doc, item)
    add_screenshot(doc, "navigation", "Capture 2 — Administration de la navigation : libellé, destination et visibilité.")
    add_heading(doc, "Sections d’accueil", 2)
    add_body(doc, "La page d’accueil rassemble notamment les sections « Ils nous font confiance », « Qui sommes-nous », « Chiffres clés », expertises, produits, réalisations, formations, mot du directeur et témoignages. Les contenus se gèrent depuis les collections ou globals correspondants.")
    add_body(doc, "Après une modification, vérifier l’ordre visuel : aucune image ne doit déborder sur le texte et les colonnes doivent se réorganiser correctement en dessous de 768 px.")

    # 6
    add_heading(doc, "6. Partenaires, visuels et section « Ils nous font confiance »", 1)
    add_body(doc, "Un partenaire peut être publié avec une image ou uniquement avec son nom. Les champs d’identité ne doivent pas empêcher un partenaire sans logo de rester publiable.")
    for item in [
        "Ouvrir Preuves & médias → Partenaires et créer ou modifier le partenaire.",
        "Dans Visuels, sélectionner un logo existant ou ouvrir la Médiathèque pour en ajouter un.",
        "Privilégier un fichier recadré sur le logo, avec un fond transparent lorsque cela est possible.",
        "Conserver le logo entièrement visible dans son cadre rond ; éviter les images qui contiennent beaucoup de marge ou un arrière-plan opaque.",
        "Si aucune image n’est fournie, laisser le nom s’afficher seul ; ne pas créer une pastille vide.",
    ]:
        add_bullet(doc, item)
    add_screenshot(doc, "partner_media", "Capture 3 — Administration d’un partenaire : onglet Visuels et sélection du logo.")
    add_screenshot(doc, "trust", "Capture 4 — Section publique en anglais : logos et noms partenaires dans un alignement centré.")
    add_callout_table(doc, "Conseil de cadrage", "Pour un logo avec transparence, le cercle doit utiliser un fond cohérent avec la section. Si le fichier possède un fond noir ou blanc intégré, il faut corriger le fichier source dans la Médiathèque plutôt que compenser avec du CSS.")

    # 7
    add_heading(doc, "7. Témoignages clients et modération", 1)
    add_body(doc, "Le bouton « Laisser un témoignage » ouvre un formulaire distinct du formulaire Contact. Les réponses arrivent dans l’administration pour décision éditoriale.")
    add_heading(doc, "Cycle d’un témoignage", 2)
    for item in [
        "Le visiteur soumet son nom, son rôle éventuel et son commentaire depuis le formulaire dédié.",
        "L’administrateur ouvre Preuves & médias → Témoignages, relit le contenu et choisit : publier, rejeter ou laisser en attente.",
        "Après publication, vérifier la version FR et EN si une traduction existe, puis actualiser la page publique.",
        "Le site public affiche au maximum cinq témoignages publiés. Lorsqu’un nouveau témoignage est publié au-delà de cette limite, le plus ancien est retiré de la sélection publique.",
        "Le carrousel affiche un témoignage à la fois ; les boutons précédent, suivant et les indicateurs permettent une navigation manuelle. La rotation automatique est temporisée.",
    ]:
        add_number(doc, item)
    add_screenshot(doc, "testimonials", "Capture 5 — Section publique « Ce que disent nos clients » : carte de témoignage et commandes du carrousel.")
    add_callout_table(doc, "Si un témoignage publié n’apparaît pas", "Contrôler le statut éditorial, la langue, le champ de contenu, la date de mise à jour et la revalidation de la page. Ouvrir ensuite la page avec un rechargement complet.", fill="FFF5F5")

    # 8
    add_heading(doc, "8. Chiffres clés", 1)
    add_body(doc, "Les chiffres clés sont pilotés depuis l’administration : valeur, suffixe, libellé, ordre, visibilité et traductions. La page publique ne doit pas contenir de valeurs codées en dur lorsque le réglage CMS est disponible.")
    for item in [
        "Ouvrir le global ou la collection dédiée aux chiffres clés depuis Contenus publics → Page de garde / Chiffres clés.",
        "Renseigner chaque indicateur : par exemple valeur 28, suffixe ans, libellé d’expérience industrielle.",
        "Renseigner le libellé anglais ; conserver une unité courte et cohérente.",
        "Définir l’ordre et la visibilité, enregistrer en brouillon, puis publier.",
        "Vérifier le centrage du titre et des indicateurs à 1440 px, 768 px et 390 px.",
    ]:
        add_number(doc, item)
    add_screenshot(doc, "figures", "Capture 6 — Exemple de rendu public de la section « Chiffres clés ».")

    # 9
    add_heading(doc, "9. Formations, produits, expertises et réalisations", 1)
    add_body(doc, "Les collections de contenu suivent une logique commune : Contenu, Détails, Visuels et Référencement. Utilisez les onglets dans cet ordre pour réduire les oublis.")
    add_heading(doc, "Formations : objectifs et visuels", 2)
    for item in [
        "Créer ou modifier la formation, puis ouvrir Détails.",
        "Ajouter un objectif pédagogique par ligne ; formuler chaque objectif avec un verbe d’action.",
        "Compléter les prérequis, le thème, la durée et le format.",
        "Ouvrir Visuels et sélectionner une image de la Médiathèque ; ne pas fermer le panneau pendant le chargement.",
        "En cas de chargement bloqué, vérifier le statut de la Médiathèque, le format et la taille du fichier, puis réessayer avec un média déjà importé.",
    ]:
        add_bullet(doc, item)
    add_screenshot(doc, "training", "Capture 7 — Administration d’une formation : objectifs pédagogiques, prérequis et onglet Visuels.")
    add_body(doc, "Le même contrôle s’applique aux produits, expertises et réalisations : chaque visuel doit être sélectionnable, prévisualisable et associé à un texte alternatif avant publication.")

    # 10
    add_heading(doc, "10. Formulaires de contact et export des messages", 1)
    add_body(doc, "Le formulaire Contact collecte le nom, l’e-mail, l’entreprise, le téléphone et la demande. Le téléphone est utile pour rappeler un prospect ; il reste distinct du numéro WhatsApp de l’entreprise.")
    add_heading(doc, "Traiter les messages reçus", 2)
    for item in [
        "Ouvrir la collection des messages dans l’administration.",
        "Trier les demandes par état : nouveau, en cours, répondu ou clôturé.",
        "Relire la demande, affecter le suivi à la bonne personne et ajouter une note interne si nécessaire.",
        "Utiliser l’export CSV avec les filtres utiles pour transmettre un lot de suivi ; vérifier le périmètre avant téléchargement.",
        "Clôturer le message uniquement après traitement et conserver la trace de l’action dans l’historique.",
    ]:
        add_number(doc, item)
    add_screenshot(doc, "contact", "Capture 8 — Page Contact publique : formulaire et panneau coordonnées / horaires.")
    add_callout_table(doc, "Bon réflexe de confidentialité", "Ne pas copier dans un export les mots de passe, secrets, données inutiles ou informations techniques. Les exports doivent rester dans les espaces autorisés.")

    # 11
    add_heading(doc, "11. Traductions français / anglais", 1)
    add_body(doc, "La traduction est éditoriale : le sélecteur de langue change la page, mais il ne traduit pas automatiquement un contenu absent. Chaque champ localisé important doit donc être complété dans les deux langues.")
    add_table(doc, ["Zone", "FR", "EN"], [
        ("Navigation", "Accueil, Expertises, Contact…", "Home, Expertise, Contact…"),
        ("Bouton témoignage", "Laisser un témoignage", "Leave a testimonial"),
        ("Pied de page", "Coordonnées, Mentions légales…", "Contact details, Legal notice…"),
        ("Sections", "Ils nous font confiance, Chiffres clés…", "They work with us, Key figures…"),
        ("Contenus", "Titre, résumé, CTA, alt text", "Title, summary, CTA, alt text"),
    ], widths=[1.6, 2.2, 2.6])
    for item in [
        "Après chaque publication, ouvrir /fr puis /en ; ne pas se limiter au menu.",
        "Contrôler l’en-tête, le pied de page, les boutons, les titres de sections, les cartes et les textes alternatifs.",
        "Repérer les mots français restés dans la version anglaise, puis compléter le champ anglais dans l’administration.",
        "Vérifier que les URL, canonical, hreflang et sitemap correspondent à la langue de la page.",
    ]:
        add_bullet(doc, item)

    # 12
    add_heading(doc, "12. Responsive, accessibilité et contrôle qualité", 1)
    add_body(doc, "Avant une publication importante, faites une courte recette aux largeurs 320, 390, 768 et 1440 px. La mise en page doit rester lisible sans zoom horizontal.")
    add_table(doc, ["Contrôle", "Attendu"], [
        ("Responsive", "Pas de débordement, boutons accessibles au doigt, cartes empilées proprement."),
        ("Clavier", "Ordre de tabulation logique, focus visible, carrousel utilisable sans souris."),
        ("Images", "Alt text descriptif, cadrage entier du logo, pas de contenu important uniquement dans l’image."),
        ("Contraste", "Texte lisible sur les fonds bleu, clair et coloré."),
        ("Liens", "Destination correcte, ouverture externe annoncée si nécessaire, aucun lien mort."),
        ("Performance", "Images optimisées, chargement raisonnable, pas de composant bloqué par un service tiers."),
    ], widths=[1.4, 5.0])
    add_body(doc, "Pour une recette technique complète, lancer les contrôles Playwright et axe-core du projet, puis conserver la preuve de la commande et du résultat dans le rapport d’audit.")

    # 13
    add_heading(doc, "13. Historique, sécurité et sauvegardes", 1)
    add_heading(doc, "Historique", 2)
    add_body(doc, "L’historique sert à savoir qui a créé, modifié, publié, rejeté ou exporté une donnée. Utilisez les filtres par utilisateur, action et date pour retrouver une opération.")
    add_heading(doc, "Sécurité", 2)
    for item in [
        "Conserver des comptes nominatifs et le principe du moindre privilège.",
        "Utiliser HTTPS pour les liens sociaux ; ne jamais placer un secret dans un champ de contenu.",
        "Limiter les imports médias aux formats attendus et vérifier l’origine des fichiers.",
        "Traiter les données des formulaires selon la politique de conservation du projet.",
    ]:
        add_bullet(doc, item)
    add_heading(doc, "Sauvegardes", 2)
    add_body(doc, "La restauration d’un dump PostgreSQL et des objets SeaweedFS/S3 est une opération d’exploitation. Elle doit être faite dans un environnement de test, documentée, puis vérifiée par une recette des pages, des médias et des réglages.")

    # 14
    add_heading(doc, "14. Dépannage rapide et check-lists", 1)
    add_table(doc, ["Symptôme", "Vérifications recommandées"], [
        ("Icônes sociales absentes", "Renseigner les URLs HTTPS et le numéro WhatsApp dans Réglages généraux, sauvegarder puis recharger le pied de page."),
        ("Carte absente", "Contrôler latitude, longitude, zoom et la sauvegarde du global."),
        ("Image qui ne charge pas", "Vérifier la Médiathèque, le format / poids, le média sélectionné et le service de stockage."),
        ("Témoignage publié invisible", "Contrôler statut, langue, contenu, limite de cinq et revalidation / cache."),
        ("Texte français en anglais", "Compléter le champ EN dans la collection concernée et tester la page /en complète."),
        ("Débordement sur mobile", "Reproduire à 320/390 px, vérifier conteneur, image, bouton et texte long."),
        ("Erreur de clé React", "Identifier la liste concernée et garantir une clé unique et stable basée sur l’identifiant du document."),
    ], widths=[1.8, 4.6])
    add_heading(doc, "Check-list avant publication", 2)
    for item in [
        "Statut correct et rôle autorisé",
        "FR et EN complétés",
        "Visuels chargés, alt text renseigné, recadrage vérifié",
        "SEO : titre, description, slug, canonical et partage",
        "Liens et boutons testés",
        "Contrôle 390 px puis desktop",
        "Page publique vérifiée dans les deux langues",
        "Action visible dans l’historique",
    ]:
        add_bullet(doc, "☐ " + item)
    add_heading(doc, "Check-list mensuelle", 2)
    for item in [
        "Revoir les contenus obsolètes et les redirections",
        "Vérifier les formulaires et les exports",
        "Tester les liens sociaux et la carte",
        "Contrôler les traductions nouvellement ajoutées",
        "Vérifier une sauvegarde et documenter un test de restauration",
        "Relire les erreurs de revalidation et l’historique des actions",
    ]:
        add_bullet(doc, "☐ " + item)
    add_body(doc, "Ce guide peut être complété par vos procédures internes : responsables de validation, délais de réponse, règles d’image, politique de conservation et calendrier de publication.")

    # Closing page
    page_break(doc)
    add_heading(doc, "Référence visuelle — parcours public", 1)
    add_body(doc, "Les captures ci-dessous illustrent les points qui doivent être vérifiés à chaque recette : accueil / sections, pied de page, coordonnées, partenaires, chiffres clés et témoignages.")
    add_screenshot(doc, "trust", "Repère — section partenaires en anglais.", width=6.25)
    add_screenshot(doc, "figures", "Repère — section chiffres clés.", width=6.25)
    add_screenshot(doc, "testimonials", "Repère — section témoignages et navigation.", width=6.25)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    doc.save(OUT)
    print(OUT)


if __name__ == "__main__":
    main()
