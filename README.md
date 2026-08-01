# NOVA — digital agency landing

Статический продающий сайт на **Vite + React + TypeScript**. Без сервера: после сборки — набор HTML/CSS/JS в `dist/`.

> **NOVA** — временное демонстрационное название. Замените его перед публикацией (см. ниже).

## Стек

- Vite 8 + React 19 + TypeScript
- React Router 7
- Tailwind CSS 4
- Motion (анимации)
- lucide-react (иконки)

## Быстрый старт

```bash
npm install
npm run dev
```

Откроется локальный сервер (обычно http://localhost:5173). Из-за `base` для GitHub Pages путь будет `/web-studio-landing/`.

Скопируйте `.env.example` → `.env.local` и при необходимости заполните переменные.

## Где менять контент

Все тексты, услуги, кейсы и контакты — в одном файле:

[`src/content/site.ts`](src/content/site.ts)

Типы — в [`src/content/types.ts`](src/content/types.ts).

| Что | Где |
|-----|-----|
| Название бренда | `site.brand` (`name`, `descriptor`, `shortName`) |
| Контакты | `site.contacts` (пустые строки скрывают карточки в UI) |
| Услуги | `site.services` |
| Кейсы | `site.cases` (+ `workPage.additionalCases`, если появятся) |
| SEO title/description | `site.seo` |
| Юридические тексты | `site.legal` |

### Изображения

Обложки кейсов сейчас — нативные React/SVG-иллюстрации в `src/components/illustrations/`. Когда появятся реальные фото:

1. Положите файлы в `public/` (или подключите через Vite `import`).
2. Обновите соответствующие компоненты/поля в контенте.
3. Не коммитьте тяжёлые исходники без оптимизации.

Favicon: [`public/favicon.svg`](public/favicon.svg) — буква бренда, легко заменить.

## Переменные окружения

См. [`.env.example`](.env.example). Все `VITE_*` попадают в клиентский бандл — **не храните секреты** (API keys, токены с правами записи, пароли). Для формы используйте публичный endpoint без секрета или прокси/serverless с секретом на сервере.

| Переменная | Назначение |
|------------|------------|
| `VITE_FORM_ENDPOINT` | URL для JSON POST формы. Пусто = demo-режим (успех без отправки) |
| `VITE_YANDEX_METRICA_ID` | ID счётчика Метрики. Пока пусто — cookie-баннер **не показывается** |
| `VITE_SITE_URL` | Абсолютный origin для canonical/OG/sitemap (без trailing slash), напр. `https://example.com` |
| `VITE_BASE` | Base path сборки (обычно задаётся скриптами, не руками) |

### Подключение формы

1. Укажите `VITE_FORM_ENDPOINT` (endpoint принимает JSON: имя, контакт, тип проекта, сообщение).
2. Пересоберите сайт.
3. Проверьте отправку на `/contact` и prefill через `?service=` / `?intent=`.

### Аналитика и cookie

1. Задайте `VITE_YANDEX_METRICA_ID`.
2. После этого появится cookie-баннер (Принять / Отклонить / Настроить).
3. Метрика загружается **только после согласия** на аналитические cookie. Вебвизор по умолчанию выключен.
4. Повторно открыть настройки можно из футера («Настройки cookie»).

## Скрипты

| Команда | Назначение |
|---------|------------|
| `npm run dev` | Разработка |
| `npm run build` | Сборка под GitHub Pages (`base: /web-studio-landing/`) + `404.html` + `robots.txt`/`sitemap.xml` |
| `npm run build:s3` | Сборка с `base: /` для Яндекс Object Storage / своего домена |
| `npm run preview` | Превью `dist/` локально |
| `npm run lint` | Проверка oxlint |
| `npm run deploy` | Деплой на GitHub Pages (`gh-pages`) |

Для корректных absolute URL в sitemap задайте `VITE_SITE_URL` при сборке:

```bash
VITE_SITE_URL=https://example.com npm run build:s3
```

## Деплой: GitHub Pages

1. Создайте репозиторий `web-studio-landing` (или поменяйте `base` в [`vite.config.ts`](vite.config.ts) под имя репо).
2. Запушьте код в `main`.
3. Выполните:

```bash
npm run deploy
```

4. В Settings → Pages выберите ветку `gh-pages`.

Сайт будет доступен по адресу:

`https://<username>.github.io/web-studio-landing/`

`dist/404.html` копируется из `index.html` после сборки — deep-link (`/services`, `/work`, …) работает на Pages.

Чтобы сменить base без правки конфига:

```bash
VITE_BASE=/my-repo/ npm run build
```

## Деплой: Яндекс Object Storage / свой домен

1. Соберите статику с корневым base:

```bash
VITE_SITE_URL=https://your-domain.com npm run build:s3
```

2. Создайте бакет в [Object Storage](https://yandex.cloud/ru/services/storage), включите **статический хостинг**.
3. Загрузите **содержимое** папки `dist/` в бакет (в корне бакета должны быть `index.html`, `assets/`, `404.html`, `favicon.svg`, `robots.txt`, `sitemap.xml`).
4. Для SPA укажите страницу ошибки / fallback на `index.html` или `404.html`, чтобы прямые ссылки на `/services` открывались.

## Структура

```
src/
  content/site.ts      # тексты и бренд
  content/types.ts     # типы контента
  components/          # Header, Footer, Layout, UI, illustrations
  hooks/usePageSeo.ts  # title + meta/OG
  lib/analytics.ts     # cookie prefs + Метрика
  pages/               # Home, Services, Work, Contact, legal
  styles/globals.css   # токены
```

## Страницы

- `/` — главная
- `/services` — услуги
- `/work` — кейсы
- `/contact` — контакты + форма
- `/privacy` — политика конфиденциальности (placeholder)
- `/personal-data` — согласие на обработку ПД (placeholder)
- `/#process` — якорь «Процесс» на главной

## Перед публикацией

- [ ] заменить временное название NOVA;
- [ ] указать реальные контакты;
- [ ] указать данные оператора персональных данных;
- [ ] проверить юридические документы (`/privacy`, `/personal-data`);
- [ ] подключить endpoint формы (`VITE_FORM_ENDPOINT`);
- [ ] добавить реальные изображения кейсов;
- [ ] подтвердить все ссылки;
- [ ] проверить возможности и формулировки по Яндекс КИТ;
- [ ] подключить домен и `VITE_SITE_URL` (canonical / sitemap);
- [ ] провести финальную проверку на мобильных устройствах.
