import 'dotenv/config';
import fs from 'fs';
import { fileURLToPath } from 'url';
import {dirname, join} from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url))

// All configurations are done in .env file
const FORMS_PUBLIC_API = process.env.FORMS_PUBLIC_API
const FORMS_OAUTH_TOKEN = process.env.FORMS_OAUTH_TOKEN
const SURVEY_ID = process.env.SURVEY_ID    
const SAVE_LOCALLY = process.env.SAVE_LOCALLY
const FILE_FORMAT = process.env.FILE_FORMAT
const UPLOAD = process.env.UPLOAD
const UPLOAD_FILES = process.env.UPLOAD_FILES

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
            // console.log(data)
            // console.log(data.status)
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

async function main() {
    console.log('\nStarting...\n')
    // console.log('\n\nRunning the process with the following vars...')
    // console.log(`FORMS_PUBLIC_API: ${FORMS_PUBLIC_API}`)
    // console.log(`FORMS_OAUTH_TOKEN: ${FORMS_OAUTH_TOKEN}`)
    // console.log(`SURVEY_ID: ${SURVEY_ID}\n`)
    // console.log(`SAVE_LOCALLY: ${SAVE_LOCALLY}\n`)
    const dataID = await getForms()
    if (dataID) {
        while (!await checkFinished(dataID)) {
            console.log('...')
            await sleep(7000)
        } 
        console.log('Success. File is ready to be downloaded!')
        if (SAVE_LOCALLY) {
            downloadResult(dataID)
            console.log('File is downloaded!')
        }
        console.log(`\nJob's done!`)
    }    
}

main()