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
- If you want to save the files to disk, update config variable in app.js
- Run the app
```
node app.js
```
OR you can provide your OAUTH token and survey id
```
node app.js forms_oauth_token survey_id
```
