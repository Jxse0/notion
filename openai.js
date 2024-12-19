import { writeFileSync } from "node:fs";
import OpenAI from "openai";
import { readFileSync } from "node:fs";

const openai = new OpenAI({ apiKey: process.env["OPENAI_API_KEY"] });

const textContent = readFileSync("structured_text.txt", "utf-8");

const response = await openai.chat.completions.create({
  model: "gpt-4o-audio-preview",
  modalities: ["text", "audio"],
  audio: { voice: "alloy", format: "wav" },
  messages: [
    {
      role: "user",
      content:
        "Fasse zusammen ohne dein eigenes wissen zu verwenden:" + textContent,
    },
  ],
});

console.log(response.choices[0]);

writeFileSync(
  "notion.wav",
  Buffer.from(response.choices[0].message.audio.data, "base64"),
  { encoding: "utf-8" }
);
