import 'dotenv/config';
import fs from 'fs';

const FORMS_PUBLIC_API = process.env.FORMS_PUBLIC_API
const FORMS_OAUTH_TOKEN = process.argv[2] ? process.argv[2] : process.env.FORMS_OAUTH_TOKEN
const SURVEY_ID = process.argv[3] ? process.argv[3] : process.env.SURVEY_ID    

const config = {
    format : 'csv', // csv or xlsx
    upload: "default",  // Where to download. default or disk
    upload_files: false, // Download to disk? false or true
}

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
            console.log(data)
            console.log(data.status)
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

function downloadResult(config, taskID) {
    const {
    format
    } = config
    console.log(`Downloading results for ${taskID}`)
    const url = `${FORMS_PUBLIC_API}/surveys/${SURVEY_ID}/answers/export-results?`+ new URLSearchParams({
        task_id: taskID
    }).toString()
    const filepath = `./output/${taskID}.${format}`

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
            console.log(`Content successfully written to filepath`);

        })
        .catch(error => {
            console.error('Error:', error);
        });
    
}

async function getForms(config) {
    const {
    format,
    upload,
    upload_files
    } = config

    if (format != "csv" && format != 'xlsx') {
        console.error('File format must be either csv or xlsx!')
        throw new Error('File format must be either csv or xlsx!')
    }
    if (upload != "default" && upload != "disk") {
        console.error('Upload must be eithr default or disk!')
        throw new Error('Upload must be either default or disk!')
    }
    // upload can be either default or disk
    const url = `${FORMS_PUBLIC_API}/surveys/${SURVEY_ID}/answers/export`
    return fetch(url, {
        method: 'POST', // Specify the method
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `OAuth ${FORMS_OAUTH_TOKEN}`
        },
        body: JSON.stringify({
            "format": format, 
            "upload": upload,
            "upload_files": upload_files

        })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`${response.status}. Could not process the response`)
            }
            console.log(response)
            return response.json()
        })
        .then(data => {
            console.log(data)
            if (!data?.id) {
                throw new Error('Could not get process ID')
            }
            return data.id
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

async function main(config) {
    console.log('\n\nRunning the process with the following vars...\n Config:')
    console.log(config)
    console.log(`FORMS_PUBLIC_API: ${FORMS_PUBLIC_API}`)
    console.log(`FORMS_OAUTH_TOKEN: ${FORMS_OAUTH_TOKEN}`)
    console.log(`SURVEY_ID: ${SURVEY_ID}\n`)
    const dataID = await getForms(config)
    if (dataID) {
        while (!await checkFinished(dataID)) {
            console.log('...')
            await sleep(7000)
        } 
        console.log('Success!')
        downloadResult(config, dataID)
    }    
}

main(config)