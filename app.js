import 'dotenv/config';
import cron from 'node-cron';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join} from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url))

const args = process.argv.slice(2);

// All configurations are done in .env file but can be overriten by cli args
const FORMS_PUBLIC_API = process.env.FORMS_PUBLIC_API ? process.env.FORMS_PUBLIC_API : "https://api.forms.yandex.net/v1"

function makeArg(args, flag, alternative, values) {
    if (args && args.length > 0) {
        for (const arg of args) {
            if (arg.includes(`--${flag}=`)) {
                const value = arg.split('=')[1]

                if (!value) {
                    console.error(`Empty value for flag ${flag}`)
                    throw new Error(`Empty value for flag ${flag}`)
                }

                if (values && values[value]) {
                    return values[value]
                } else if (values && !values[value]) {
                    const keys = Object.keys(values)
                    // console.error(`Incorrect value for flag ${flag}`)
                    // console.error(`Possible values are: ${keys}`)
                    throw new Error(`Incorrect value for flag ${flag}\nPossible values are: ${keys}`)
                } else {
                    return value
                }
            }
        }
    } 
    return alternative
}

const configOptions = {
    "SCHEDULE" : {
        'once': 'once',
        'minutely' : '* * * * *',
        'hourly' : '0 * * * *',
        'daily' : '0 12 * * *',
        'weekly' : '0 12 1 * *'
    },
    "UPLOAD": {
        "disk": "disk",
        "default": "default"
    },
    "FILE_FORMAT" : {
        "xlsx": "xlsx",
        "csv": "csv",
    },
    "UPLOAD_FILES" : {
        "true": "true",
        "false": "false"
    },
}

const FORMS_OAUTH_TOKEN = makeArg(args, "oauth", process.env.FORMS_OAUTH_TOKEN)
const SURVEY_ID = makeArg(args, "surveyID", process.env.SURVEY_ID)
const UPLOAD_FILES = makeArg(args, "upload_files", process.env.UPLOAD_FILES, configOptions.UPLOAD_FILES)
const UPLOAD = makeArg(args, 'upload', process.env.UPLOAD, configOptions.UPLOAD)
const FILE_FORMAT = makeArg(args, 'file_format', process.env.FILE_FORMAT, configOptions.FILE_FORMAT)
const SCHEDULE = makeArg(args, 'schedule', process.env.SCHEDULE, configOptions.SCHEDULE )



function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkFinished(taskID) {
    console.log(`Await for the results for ${taskID}`)
    const url = `${FORMS_PUBLIC_API}/operations/${taskID}`

    const isFinished = await fetch(url, {
        method: 'GET', // Specify the method
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `OAuth ${FORMS_OAUTH_TOKEN}`
        }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status != 'ok') {
                return false
            } else {
                return true
            }             
        })
        .catch(error => {
            console.error('Error:', error);
            return false
        })

    return isFinished

}

function downloadResult(taskID) {
    console.log(`Downloading results for ${taskID}`)
    const url = `${FORMS_PUBLIC_API}/surveys/${SURVEY_ID}/answers/export-results?`+ new URLSearchParams({
        task_id: taskID
    }).toString()
    const filepath = join(__dirname, `output/${taskID}.${FILE_FORMAT}`)

    fetch(url, {
        method: 'GET', // Specify the method
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `OAuth ${FORMS_OAUTH_TOKEN}`
        }
        })
        .then(async response => {  
            const responeArray = await response.arrayBuffer()
            fs.writeFileSync(filepath, Buffer.from(responeArray));
            // console.log(`Content successfully written to filepath`);

        })
        .catch(error => {
            console.error('Error:', error);
        });
    
}

async function getForms() {
    if (FILE_FORMAT != "csv" && FILE_FORMAT != 'xlsx') {
        console.error('File format must be either csv or xlsx!')
        throw new Error('File format must be either csv or xlsx!')
    }
    if (UPLOAD != "default" && UPLOAD != "disk") {
        console.error('Upload must be eithr default or disk!')
        throw new Error('Upload must be either default or disk!')
    }

    const url = `${FORMS_PUBLIC_API}/surveys/${SURVEY_ID}/answers/export`
    return fetch(url, {
        method: 'POST', // Specify the method
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `OAuth ${FORMS_OAUTH_TOKEN}`
        },
        body: JSON.stringify({
            "format": FILE_FORMAT, 
            "upload": UPLOAD,
            "upload_files": UPLOAD_FILES,

        })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`${response.status}. Could not process the response`)
            }
            return response.json()
        })
        .then(data => {
            if (!data?.id) {
                throw new Error('Could not get process ID')
            }
            return data.id
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function getAnswers() {
    const url = `${FORMS_PUBLIC_API}/surveys/${SURVEY_ID}/answers`
    console.log(`Checking for upadtes...`)

    return fetch(url, {
        method: 'GET', // Specify the method
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `OAuth ${FORMS_OAUTH_TOKEN}`
        }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`${response.status}. Could not process the response`)
            }
            
            return response.json()
        })
        .then( data => {
            // console.log(data)
            return data.answers
        })
        .catch(error => {
            console.error('Error:', error);
        });        
}

async function startLoading() {
    const dataID = await getForms()
    if (dataID) {
        while (!await checkFinished(dataID)) {
            console.log('...')
            await sleep(7000)
        } 
        console.log('Success. File is ready to be downloaded!')
        if (UPLOAD == "default") {
            downloadResult(dataID)
            console.log('File is downloaded!')
        }
        console.log(`\nJob's done!`)
    }    
}


function main() {
    console.log('Running the process with the following settings:')
    console.log(`FORMS_PUBLIC_API: ${FORMS_PUBLIC_API}`)
    console.log(`FORMS_OAUTH_TOKEN: ${FORMS_OAUTH_TOKEN}`)
    console.log(`SURVEY_ID: ${SURVEY_ID}`)
    // console.log(`SAVE_LOCALLY: ${SAVE_LOCALLY}`)
    console.log(`FILE_FORMAT: ${FILE_FORMAT}`)
    console.log(`UPLOAD_FILES: ${UPLOAD_FILES}`)
    console.log(`UPLOAD: ${UPLOAD}`)
    console.log(`SCHEDULE: ${SCHEDULE}`)
    console.log('\n')
    console.log('Starting in 10 seconds..')
    sleep(10000)

    let date = new Date()
    if (SCHEDULE == "once") {
        console.log('Running once...')
        startLoading()
    } else {
        console.log('Running on a schedule...')
        console.log(SCHEDULE)
        cron.schedule(SCHEDULE, async function() {
            const answers = await getAnswers()
            if (answers.length > 1) {
                answers.sort((a, b) => new Date(b.created) - new Date(a.created))
            }
            const latestAnswersDate = new Date(answers[0].created)
            if (latestAnswersDate > new Date(date)) {
                console.log('Something changed!')
                console.log(`Latest answer: ${answers[0].created}`)
                console.log(`Previous date value: ${latestAnswersDate}`)
                date = new Date(answers[0].created)
                console.log(`New date value: ${date}`)
                startLoading()
            }
            console.log(`Latest answer: ${latestAnswersDate}`)
            console.log(`Current date value: ${date}`)
        });
    }
}

main()