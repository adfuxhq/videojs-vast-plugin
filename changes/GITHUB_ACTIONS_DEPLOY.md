# GitHub Actions Deploy Pipeline

## Описание
Создан автоматический пайплайн для деплоя в Cloudflare Pages при пуше в ветку `main`.

## Файлы
- `.github/workflows/deploy.yml` - основной workflow файл

## Настройка

### 1. Секреты GitHub
Необходимо добавить следующие секреты в настройках репозитория (Settings → Secrets and variables → Actions):

- `CLOUDFLARE_API_TOKEN` - API токен Cloudflare
- `CLOUDFLARE_ACCOUNT_ID` - ID аккаунта Cloudflare

### 2. Получение токенов

#### Cloudflare API Token:
1. Зайти в Cloudflare Dashboard
2. My Profile → API Tokens
3. Create Token → Custom token
4. Permissions: Zone:Zone:Read, Zone:Zone Settings:Edit
5. Zone Resources: Include - All zones

#### Cloudflare Account ID:
1. В Cloudflare Dashboard
2. Справа в боковой панели найти "Account ID"

## Особенности пайплайна

### Кеширование
- Используется встроенное кеширование npm через `actions/setup-node@v4`
- Кеширование node_modules для ускорения последующих сборок

### Сборка
- Используется Node.js 22
- Команда `npm ci` для быстрой установки зависимостей
- Команда `npm run build` для сборки проекта

### Деплой
- Создается временная папка `deploy` с только нужными файлами
- Копируются только `dist/videojsx.vast.js` и `dist/videojsx.vast.css`
- Файлы попадают в корень Cloudflare Pages
- Используется официальный action `cloudflare/pages-action@v1`

## Триггеры
- Запускается при push в ветку `main`
- Запускается в любом случае (без условий)

## Результат
После успешного деплоя файлы будут доступны по адресу:
`https://videojs-vast-plugin.pages.dev/videojsx.vast.js`
`https://videojs-vast-plugin.pages.dev/videojsx.vast.css`
