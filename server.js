const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4 } = require('uuid');

const PORT = 3332;

const app = express();

app.use(express.json());

app.use(express.static('./public'));

async function getNotes() {
    try {
        const notesArr = await fs.promises.readFile('./db/db.json', 'utf8')
        return JSON.parse(notesArr);
    } catch (err) {
        console.log(err)
    }
    
}

async function saveNotes(notesArr) {
    try {
        await fs.promises.writeFile('./db/db.json', JSON.stringify(notesArr, null, 2));
        console.log('Notes saved successfully!');
    } catch (err) {
        console.log(err)
    }
}

app.get('/notes', (requestObj, responseObj) => {
    responseObj.sendFile(path.join(__dirname, './public/notes.html'))
});

app.get('/api/notes', async (requestObj, responseObj) => {
    const notesArr = await getNotes()
    console.log(notesArr)
    responseObj.send(notesArr)
});

app.post('/api/notes', async (requestObj, responseObj) => {
    try {
        const newNote = {
            id: v4(),
            title: requestObj.body.title,
            text: requestObj.body.text,
        };

        const notesArr = await getNotes();
        notesArr.push(newNote);

        await saveNotes(notesArr);

        responseObj.json(newNote);
    } catch (err) {
        console.log(err)
        // responseObj.status(500).send('Internal Server Error');
    }
});

app.delete('/api/notes/:id', async (requestObj, responseObj) => {
 const newNote_id = requestObj.params.id;

 try {
    const notesArr = await getNotes();

    const noteIndexToDelete = notesArr.findIndex((note) =>
    note.id === newNote_id);

    if (noteIndexToDelete !== -1) {

        notesArr.splice(noteIndexToDelete, 1);

        await saveNotes(notesArr);

        responseObj.json ({
            message: 'Note deleted successfully!'
        })
    } else {
        responseObj.status(404).json({
            error: 'Note not found',
        });
    }
 } catch (err) {
    console.log(err)
 }
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)
})