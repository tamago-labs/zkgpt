
import * as fastq from "fastq";
import express from "express";
import cors from "cors"

import 'dotenv/config'

// API

export const app = express();

app.use(express.json());
app.use(cors())

app.listen(8000, () => {
    console.log(`Server Started at ${8000}`)
})

app.get('/', async (req, res) => {
    return res.status(200).json({ status: "ok" });
});