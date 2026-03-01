[**🇺🇸 English**](README.md)

# YaForms Answers Archiver

Приложение для получения результатов Яндекс Форм 
и\или их скачка на диск


## Применение 
- Склонировать репозиторий
- Установить пакеты 
```
npm install
```
- Сделать копию .env
```
cp .env.example .env
```
- Заполнить необходимые переменные в .env
- Заупустить приложение

```
node app.js
```

### Использование различных переменных окружения

Можно заменить переменные в файле .env file и выполнить программу

```
node app.js
```

Другой способ это добавить дополнительный файл .env в node:
Скопировать файл .env.example в файл с другим названием, например .env.some_example:

```
cp .env.example .env.some_example
```
Заменить данные в .env.some_exmple.
Выполнить их с флагом для подмены переменных окружения:

```
node --env-file=.env.some_example app.js
```

### Полезные ссылки

Получение OAuth токена : 
https://yandex.ru/support/forms/ru/api-ref/access#about_OAuth 

Примеры использования API: 
https://yandex.ru/support/forms/ru/api-ref/