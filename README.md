[**🇷🇺 Русский**](README_ru.md)
# YaForms Answers Archiver
An app to get the results from YaForms 
and\or save them to the disk


## Usage 
- Clone the repo
- Run 
```
npm install
```
- Copy .env
```
cp .env.example .env
```
- Fill in the required vars in .env
- Run the app in node 

```
node app.js
```

### Using arguments 

Arguments are used to overwrite .env variables.
```
node app.js --file_format=xlsx // Saves file as output/*.xlsx. Overwrites .env value of FILE_FORMAT
```

here is a list of arguments:
- --oauth=some_token - Allows to provide OAuth token. Overwrites .env value of FORMS_OAUTH_TOKEN
- --surveyID=some_id - Allows to provide some other form ID. Overwrites .env value of SURVEY_ID
- --upload_files=true - Allows to upload files attached to the form to disk. Can be true or false. Overwrites .env value of UPLOAD_FILES
- --upload=default - Allows to upload files to disk. Can be default or disk. Overwrites .env value of UPLOAD
- --file_format=csv - Allows to change the file format of the output. Can be either xlsx or csv. Overwrites .env value of FILE_FORMAT
- --schedule=once = Allows to change how often the program will make request to the form. Can be once, minutely, hourly, daily, weekly. Overwrites .env value of SCHEDULE.



### Using different environment variables

You can chage the variable in .env file and run it as usual.

```
node app.js
```

Another way to use it is to provide extra .env file to node:
Copy .env.example to something else:

```
cp .env.example .env.some_example
```
Change the data in the .env.some_exmple.
Run it like this:

```
node --env-file=.env.some_example app.js
```

### Useful links 

Getting Yandex OAuth token: 
https://yandex.ru/support/forms/en/api-ref/access#about_OAuth 

API reference: 
https://yandex.ru/support/forms/en/api-ref/