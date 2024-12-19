import { Client } from "@notionhq/client";
import fs from "fs";
import path from "path";

const notion = new Client({ auth: process.env.NOTION_API_KEY });

const getDatabasePages = async () => {
  const databaseId = "6226b2542e9e44d5adf59e95492fd4cf";
  const response = await notion.databases.query({
    database_id: databaseId,
  });
  return response.results;
};

const getPageBlocks = async (blockId) => {
  const blocks = [];
  let cursor;

  do {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
    });
    blocks.push(...response.results);
    cursor = response.next_cursor;
  } while (cursor);

  return blocks;
};

const extractText = (block) => {
  if (block.type === "heading_1") {
    return `# ${block.heading_1.rich_text
      .map((rt) => rt.text.content)
      .join("")}`;
  } else if (block.type === "heading_2") {
    return `## ${block.heading_2.rich_text
      .map((rt) => rt.text.content)
      .join("")}`;
  } else if (block.type === "heading_3") {
    return `### ${block.heading_3.rich_text
      .map((rt) => rt.text.content)
      .join("")}`;
  } else if (block.type === "bulleted_list_item") {
    return `- ${block.bulleted_list_item.rich_text
      .map((rt) => rt.text.content)
      .join("")}`;
  } else if (block.type === "numbered_list_item") {
    return `1. ${block.numbered_list_item.rich_text
      .map((rt) => rt.text.content)
      .join("")}`;
  } else if (block.type === "paragraph") {
    return block.paragraph.rich_text.map((rt) => rt.text.content).join("");
  }
  return "";
};

const processBlocks = async (blocks, depth = 0) => {
  const result = [];
  for (const block of blocks) {
    const text = extractText(block);
    if (text) {
      result.push("    ".repeat(depth) + text);
    }
    if (block.has_children) {
      const children = await getPageBlocks(block.id);
      const childTexts = await processBlocks(children, depth + 1);
      result.push(...childTexts);
    }
  }
  return result;
};

(async () => {
  try {
    const pages = await getDatabasePages();
    const firstPageId = pages[0].id;

    const blocks = await getPageBlocks(firstPageId);
    const structuredText = await processBlocks(blocks);

    const outputPath = path.join("structured_text.txt");
    fs.writeFileSync(outputPath, structuredText.join("\n"), "utf-8");

    console.log(
      `Strukturierter Text wurde erfolgreich in ${outputPath} gespeichert.`
    );
  } catch (error) {
    console.error("Fehler:", error);
  }
})();
