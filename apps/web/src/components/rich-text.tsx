import type { ReactNode } from 'react'

/**
 * Rendu d'un champ `richText` Lexical.
 *
 * L'arbre est parcouru et transformé en éléments React. Volontairement PAS de
 * `dangerouslySetInnerHTML` : le contenu vient du CMS, donc d'un humain de
 * confiance, mais un éditeur compromis ou une copie-colle depuis un site tiers
 * suffirait à injecter du script dans toutes les pages. Le coût de ce
 * parcours est nul comparé à celui d'une injection.
 *
 * Les types de nœuds non reconnus sont ignorés plutôt que rendus bruts : une
 * page amputée d'un bloc se voit et se corrige, du balisage affiché en clair
 * passe inaperçu jusqu'à ce qu'un client le signale.
 */

interface LexicalNode {
  type?: string
  tag?: string | number
  text?: string
  format?: number | string
  listType?: string
  url?: string
  fields?: { url?: string; newTab?: boolean }
  children?: LexicalNode[]
}

const BOLD = 1
const ITALIC = 1 << 1
const UNDERLINE = 1 << 3

function renderText(node: LexicalNode, key: string): ReactNode {
  let content: ReactNode = node.text ?? ''
  const format = typeof node.format === 'number' ? node.format : 0

  if (format & BOLD) content = <strong>{content}</strong>
  if (format & ITALIC) content = <em>{content}</em>
  if (format & UNDERLINE) content = <u>{content}</u>

  return <span key={key}>{content}</span>
}

function renderChildren(nodes: LexicalNode[] | undefined, prefix: string): ReactNode[] {
  return (nodes ?? []).map((node, index) => renderNode(node, `${prefix}-${index}`))
}

function renderNode(node: LexicalNode, key: string): ReactNode {
  switch (node.type) {
    case 'text':
      return renderText(node, key)

    case 'linebreak':
      return <br key={key} />

    case 'paragraph':
      return (
        <p className="body" key={key}>
          {renderChildren(node.children, key)}
        </p>
      )

    case 'heading': {
      const level = String(node.tag ?? 'h2')
      const className = level === 'h1' ? 'h2' : level === 'h2' ? 'h3' : 'h4'
      const Tag = (['h2', 'h3', 'h4', 'h5', 'h6'].includes(level) ? level : 'h3') as 'h2'
      return (
        <Tag className={className} key={key}>
          {renderChildren(node.children, key)}
        </Tag>
      )
    }

    case 'list': {
      const Tag = node.listType === 'number' ? 'ol' : 'ul'
      return (
        <Tag className="list" key={key}>
          {renderChildren(node.children, key)}
        </Tag>
      )
    }

    case 'listitem':
      return <li key={key}>{renderChildren(node.children, key)}</li>

    case 'quote':
      return (
        <blockquote className="body" key={key}>
          {renderChildren(node.children, key)}
        </blockquote>
      )

    case 'link':
    case 'autolink': {
      const href = node.fields?.url ?? node.url
      if (!href) return <span key={key}>{renderChildren(node.children, key)}</span>
      const external = /^https?:\/\//.test(href)
      return (
        <a
          className="tlink"
          href={href}
          key={key}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {renderChildren(node.children, key)}
        </a>
      )
    }

    default:
      // Conteneur inconnu : on descend quand même dans ses enfants, sinon un
      // simple changement de version de l'éditeur viderait la page.
      if (node.children?.length) return <div key={key}>{renderChildren(node.children, key)}</div>
      return null
  }
}

export function RichText({ value }: { value: unknown }) {
  const root = (value as { root?: LexicalNode } | null | undefined)?.root
  if (!root) return null
  return <div className="stack g16">{renderChildren(root.children, 'rt')}</div>
}
