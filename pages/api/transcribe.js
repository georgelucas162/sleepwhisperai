// /api/transcribe.js
import { Readable } from "stream";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST supported" });
  }

  const { IncomingForm } = await import("formidable");
  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: "File parsing failed" });
    }

    const file = files.audio;
    if (!file) return res.status(400).json({ error: "No file uploaded" });

    const fs = await import("fs/promises");
    const path = await import("path");
    const buffer = await fs.readFile(file.filepath);

    try {
      const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: (() => {
          const formData = new FormData();
          formData.append("file", new Blob([buffer]), "audio.mp3");
          formData.append("model", "whisper-1");
          return formData;
        })()
      });

      const data = await response.json();
      return res.status(200).json({ transcription: data.text });
    } catch (error) {
      return res.status(500).json({ error: "Transcription failed", details: error.message });
    }
  });
}
