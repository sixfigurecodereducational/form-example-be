import { createApplication, deleteApplication, getAllApplications, getApplication, updateApplication } from './database.js';
import createAPI from 'lambda-api';

const app = createAPI();

app.use((req, res, next) => {
    res.cors({
      headers:
        "Content-Type, Authorization, Content-Length, X-Requested-With, X-Api-Key",
    });
    next();
});

app.get('/applications', async (req, res) => {
    const jobApplications = await getAllApplications();

    return res.json(jobApplications);
});

app.post('/applications', async (req, res) => {
    const name = req.body.name;
    const age = req.body.age;
    const message = req.body.message;
    const email = req.body.email;

    if (!name || !email || !age || !message) {
        return res.status(400).send('All fields are required');
    }

    await createApplication(name, email, age, message);

    return res.status(201).send('Job application submitted successfully');

});

app.get('/applications/:id', async (req, res) => {
    const jobApplication = await getApplication(req.params.id);

    if (jobApplication == null) {
        return res.status(404).send('Job application not found');
    }

    return res.json(jobApplication);
});

app.put('/applications/:id', async (req, res) => {
    const name = req.body.name;
    const age = req.body.age;
    const message = req.body.message;
    const email = req.body.email;

    if (!name || !email || !age || !message) {
        return res.status(400).send('All fields are required');
    }

    await updateApplication(req.params.id, name, email, age, message);

    return res.status(200).send('Job application updated successfully');
});


app.delete('/applications/:id', async (req, res) => {
    await deleteApplication(req.params.id);

    return res.status(200).send('Job appliction deleted successfully.')
});

export default app;
