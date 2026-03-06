[**🇺🇸 English**](README.md)
# YaForms Answers Archiver
Приложение для получения результатов Яндекс Форм 
и\или их загрузка на диск


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
- Запустить приложение

```
node app.js
```

### Использование Аргументов 

Аргументы используятся для перезаписи переменных .env.
```
node app.js --file_format=xlsx // Saves file as output/*.xlsx. Перезаписывает значение переменной FILE_FORMAT из файла .env
```

Список аргументов:
- --oauth=some_token - Позволяет использовать токен OAuth. Перезаписывает значение переменной FORMS_OAUTH_TOKEN из файла .env
- --surveyID=some_id - Позволяет передать ID формы. Перезаписывает значение переменной SURVEY_ID
- --upload_files=true - Позволяет сохранить файлы загруженные на форму. Может быть true или false. Перезаписывает значение переменной UPLOAD_FILES
- --upload=default - Позволяет загрузить файлы локально (default) или на Яндекс Диск. Может быть default или disk. Перезаписывает значение переменной UPLOAD
- --file_format=csv - Позволяет изменить формат выходного файла. Может быть xlsx или csv. Перезаписывает значение переменной FILE_FORMAT
- --schedule=once = Позволяет изменить частоту запросов к форме. Может быть once, minutely, hourly, daily, weekly. Перезаписывает значение переменной SCHEDULE.


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