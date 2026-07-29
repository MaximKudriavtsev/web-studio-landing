# Север — лендинг веб-студии

Статический продающий сайт на **Vite + React + TypeScript**. Без сервера: после сборки — набор HTML/CSS/JS в `dist/`.

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

## Контент и бренд

Все тексты, услуги, кейсы и контакты — в одном файле:

[`src/content/site.ts`](src/content/site.ts)

Смените `brand`, email, копирайт и плейсхолдеры там.

## Скрипты

| Команда | Назначение |
|---------|------------|
| `npm run dev` | Разработка |
| `npm run build` | Сборка под GitHub Pages (`base: /web-studio-landing/`) + `404.html` |
| `npm run build:s3` | Сборка с `base: /` для Яндекс Object Storage / своего домена |
| `npm run preview` | Превью `dist/` локально |
| `npm run deploy` | Деплой на GitHub Pages (`gh-pages`) |

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

## Деплой: Яндекс Object Storage

1. Соберите статику с корневым base:

```bash
npm run build:s3
```

2. Создайте бакет в [Object Storage](https://yandex.cloud/ru/services/storage), включите **статический хостинг**.
3. Загрузите **содержимое** папки `dist/` в бакет (в корне бакета должны быть `index.html`, `assets/`, `404.html`, `favicon.svg`).
4. Для SPA укажите страницу ошибки / fallback на `index.html` или `404.html` (в настройках сайта бакета), чтобы прямые ссылки на `/services` открывались.

При своём домене через CDN можно оставить `base: '/'` (скрипт `build:s3`).

## Структура

```
src/
  content/site.ts      # тексты и бренд
  components/          # Header, Footer, Layout, Button…
  pages/               # Home, Services, Work, Contact
  styles/globals.css   # токены и атмосфера
```

## Страницы

- `/` — главная
- `/services` — услуги
- `/work` — кейсы
- `/contact` — контакты + форма (`mailto:`)
