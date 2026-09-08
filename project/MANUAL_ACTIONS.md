# Ручные действия

Для первого реального Wordstat-запроса владельцу нужно:

1. Подготовить Yandex Cloud folder.
2. Создать service account.
3. Назначить роль `search-api.webSearch.user`.
4. Создать API key со scope `yc.search-api.execute`.
5. Получить Folder ID.
6. Сохранить API key и Folder ID только локально в `backend/.env` как `AI_WORDSTAT_API_KEY` и `AI_YANDEX_FOLDER_ID`.

После этого вручную запустить backend и проверить подключение на `/ai`. Не помещать значения credentials в Git, документацию или frontend.

Для локального запуска следуйте `backend/README.md`. Реальные credentials добавляйте только в локальный `backend/.env`, никогда не коммитьте их.
