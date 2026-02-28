require('dotenv').config();
fs = require('fs');

const FORMS_PUBLIC_API = process.env.FORMS_PUBLIC_API
const FORMS_OAUTH_TOKEN = process.env.FORMS_OAUTH_TOKEN
const SURVEY_ID = process.env.SURVEY_ID

// DotEnv debugging
// console.log(`FORMS_PUBLIC_API: ${FORMS_PUBLIC_API}`)
// console.log(`FORMS_OAUTH_TOKEN: ${FORMS_OAUTH_TOKEN}`)
// console.log(`SURVEY_ID: ${SURVEY_ID}`)

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

function downloadResult(taskID) {
    console.log(`Downloading results for ${taskID}`)
    const url = `${FORMS_PUBLIC_API}/surveys/${SURVEY_ID}/answers/export-results?`+ new URLSearchParams({
        task_id: taskID
    }).toString()
    const filepath = `./output/${taskID}.csv`

    fetch(url, {
        method: 'GET', // Specify the method
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `OAuth ${FORMS_OAUTH_TOKEN}`
        }
        })
        .then(async response => {  
            console.log(response)  
            const responeArray = await response.arrayBuffer()
            fs.writeFileSync(filepath, Buffer.from(responeArray));
            console.log(`Content successfully written to filepath`);

        })
        .catch(error => {
            console.error('Error:', error);
            console.error('Error:', error.errors);
        });
    
}

function getForms() {
    const url = `${FORMS_PUBLIC_API}/surveys/${SURVEY_ID}/answers/export`
    fetch(url, {
        method: 'POST', // Specify the method
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `OAuth ${FORMS_OAUTH_TOKEN}`
        },
        body: JSON.stringify({
            "format": "csv", 
            "upload": "disk",
            "upload_files": true

        })
        })
        .then(response => response.json())
        .then(async data => {
            if (data.id) {
                console.log(data);
                while (!await checkFinished(data.id)) {
                    console.log('...')
                    await sleep(7000)
                }
                console.log('Success!')
                
                downloadResult(data.id)
            }
        })
        .catch(error => {
            console.error('Error:', error);
            console.error('Error:', error.errors);
        });
}


getForms()