# Site Design Contract

Источник истины для машинной проверки — `project/design/SITE_DESIGN_CONTRACT.json`. Контракт извлечён из текущих `globals.css`, `kotdela.css`, React-компонентов и главной страницы; он не меняет внешний вид сайта.

## Foundations

- Шрифты: Manrope для интерфейса, Playfair Display для display-акцентов; системные fallback обязательны.
- Палитра ограничена существующими ink, paper, paper-2, lime, coral, blue, violet, sand, white и muted.
- Основной контейнер: максимум 1340px с боковыми полями 64px; используются существующие tablet/mobile варианты.
- Радиусы: 12px, 28px, 38px и pill 999px. Тени — только существующие small/medium и уже определённые component-specific варианты.
- Адаптивные точки: 1120px, 860px, 560px. Уважать `prefers-reduced-motion`.

## Components and layouts

Новые страницы собираются из существующих Layout, Header, Footer, BrandMark, кнопок, shell/section, section-heading, service-card, case, process-board, contact-form и contact-card. Существующие hero/grid/section patterns являются разрешёнными композициями.

## Generation guardrail

Будущий Engine не вправе без approval добавлять шрифты или brand colors, менять глобальную типографику, Header/Footer, навигацию, container width, spacing/radius/shadow systems или создавать новый стиль кнопки. Если задачу нельзя корректно собрать из разрешённых primitives, результат — `DESIGN_EXTENSION_REQUIRED` с названием недостающего компонента и обоснованием; компонент автоматически не создаётся.

## Approval pipeline

`PROPOSED → CONTENT_APPROVED → GENERATED_PREVIEW → VISUAL_REVIEW → SEO_REVIEW → APPROVED_FOR_MERGE`.

Перед merge обязательны frontend build, desktop/mobile screenshots, visual consistency, SEO metadata, internal linking, sitemap и human approval. Production publish в этот pipeline не входит.
