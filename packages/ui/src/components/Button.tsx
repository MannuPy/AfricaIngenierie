import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { cx } from '../cx'
import { Link } from './Link'

export type ButtonVariant = 'primary' | 'brand' | 'outline' | 'ghost-light'
export type ButtonSize = 'md' | 'sm'

type CommonProps = {
  children: ReactNode
  /** `primary` est le rouge d'action : un seul visible par écran. */
  variant?: ButtonVariant
  size?: ButtonSize
  block?: boolean
  iconLeft?: ReactNode
  iconRight?: ReactNode
  className?: string
}

export type ButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'> & { href?: undefined }

export type ButtonLinkProps = CommonProps & { href: string; target?: string; rel?: string }

function classes({ variant = 'brand', size = 'md', block, className }: CommonProps) {
  return cx('btn', `btn-${variant}`, size === 'sm' && 'btn-sm', block && 'btn-block', className)
}

export function Button(props: ButtonProps | ButtonLinkProps) {
  const { children, iconLeft, iconRight } = props
  const content = (
    <>
      {iconLeft}
      {children}
      {iconRight}
    </>
  )

  if (typeof (props as ButtonLinkProps).href === 'string') {
    const { href, target, rel } = props as ButtonLinkProps
    return (
      <Link className={classes(props)} href={href} target={target} rel={rel}>
        {content}
      </Link>
    )
  }

  const { variant, size, block, className, iconLeft: _l, iconRight: _r, ...rest } =
    props as ButtonProps
  void variant
  void size
  void block
  void className
  void _l
  void _r

  return (
    <button className={classes(props)} type={rest.type ?? 'button'} {...rest}>
      {content}
    </button>
  )
}

export type TextLinkProps = {
  href: string
  children: ReactNode
  /** Variante sur fond bleu. */
  onBrand?: boolean
  className?: string
  /** Flèche animée au survol, comme dans le prototype. */
  arrow?: ReactNode
}

/** Lien texte fléché (`.tlink`)  -  l'appel à l'action secondaire du système. */
export function TextLink({ href, children, onBrand, className, arrow }: TextLinkProps) {
  return (
    <Link className={cx('tlink', onBrand && 'on-brand', className)} href={href}>
      {children}
      {arrow}
    </Link>
  )
}
