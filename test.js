import { Client } from "@notionhq/client";

// Initialisierung des Notion-Clients
const notion = new Client({ auth: process.env.NOTION_API_KEY });

(async () => {
  const pageId = "35437e0f5d7c46b7839909e768460f9c"; // Ersetzen Sie dies durch die ID Ihrer Seite
  try {
    // Abrufen der Seiteninformationen
    const response = await notion.pages.retrieve({
      page_id: pageId,
    });
    console.log("Seiteninformationen:", response);
  } catch (error) {
    console.error("Fehler beim Abrufen der Seite:", error);
  }
})();
