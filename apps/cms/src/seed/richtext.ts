/**
 * Construction de contenu Lexical à partir de paragraphes en texte brut.
 *
 * Les champs `richText` de Payload attendent un arbre Lexical sérialisé. Écrire
 * cet arbre à la main dans chaque fiche de données rendrait le jeu de
 * démonstration illisible et fragile ; cette fabrique concentre le format en un
 * seul endroit.
 */

interface LexicalNode {
  [key: string]: unknown
}

function textNode(text: string): LexicalNode {
  return {
    type: 'text',
    text,
    detail: 0,
    format: 0,
    mode: 'normal',
    style: '',
    version: 1,
  }
}

function paragraphNode(text: string): LexicalNode {
  return {
    type: 'paragraph',
    children: [textNode(text)],
    direction: 'ltr',
    format: '',
    indent: 0,
    textFormat: 0,
    textStyle: '',
    version: 1,
  }
}

function headingNode(text: string): LexicalNode {
  return {
    type: 'heading',
    tag: 'h2',
    children: [textNode(text)],
    direction: 'ltr',
    format: '',
    indent: 0,
    version: 1,
  }
}

/** Bloc de paragraphes. Une entrée `{ h: '…' }` produit un titre de niveau 2. */
export function richText(blocks: Array<string | { h: string }>): Record<string, unknown> {
  return {
    root: {
      type: 'root',
      children: blocks.map((block) =>
        typeof block === 'string' ? paragraphNode(block) : headingNode(block.h),
      ),
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}
