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
- Run the app in node 

```
node app.js
```

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