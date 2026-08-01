type IllustrationProps = {
  className?: string
}

const COVER_SRC = 'https://storage.yandexcloud.net/digital-landing/svet-71-landing.webp'

/** Screenshot cover for the Свет Интерьера case */
export const StorePreview = ({ className = '' }: IllustrationProps) => {
  return (
    <div
      className={['aspect-[16/10] w-full overflow-hidden rounded-card-sm bg-surface', className]
        .filter(Boolean)
        .join(' ')}
    >
      <img
        src={COVER_SRC}
        alt="Превью сайта Свет Интерьера"
        className="h-full w-full object-cover object-top"
        loading="lazy"
        decoding="async"
      />
    </div>
  )
}
