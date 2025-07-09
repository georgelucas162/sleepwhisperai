import { Readable } from "stream";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  const formidable = (await import("formidable")).default;
  const form = new formidable.IncomingForm();

  return new Promise((resolve) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return resolve(
          new Response(JSON.stringify({ error: "File parsing failed" }), { status: 500 })
        );
      }

      const file = files.audio;
      if (!file) {
        return resolve(
          new Response(JSON.stringify({ error: "No file uploaded" }), { status: 400 })
        );
      }

      const fs = await import("fs/promises");
      const path = await import("path");
      const buffer = await fs.readFile(file[0].filepath);

      // Optional: log or handle the buffer before Whisper
      return resolve(
        new Response(JSON.stringify({ message: "File received", size: buffer.length }), {
          status: 200,
        })
      );
    });
  });
}
