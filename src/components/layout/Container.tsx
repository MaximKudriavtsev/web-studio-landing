import type { ElementType, ReactNode } from 'react'

type ContainerProps = {
  children: ReactNode
  className?: string
  as?: ElementType
}

export const Container = ({
  children,
  className = '',
  as: Tag = 'div',
}: ContainerProps) => {
  return <Tag className={['page-shell', className].filter(Boolean).join(' ')}>{children}</Tag>
}
