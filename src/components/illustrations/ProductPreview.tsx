type IllustrationProps = {
  className?: string
}

const COVER_SRC = 'https://storage.yandexcloud.net/digital-landing/pervylepet-landing.webp'

/** Screenshot cover for the Первый лепет case */
export const ProductPreview = ({ className = '' }: IllustrationProps) => {
  return (
    <div
      className={['aspect-[16/10] w-full overflow-hidden rounded-card-sm bg-surface', className]
        .filter(Boolean)
        .join(' ')}
    >
      <img
        src={COVER_SRC}
        alt="Превью проекта Первый лепет"
        className="h-full w-full object-cover object-top"
        loading="lazy"
        decoding="async"
      />
    </div>
  )
}
