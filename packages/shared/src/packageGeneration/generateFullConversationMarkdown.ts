import type { ChatGPTMessage } from "../types/payload.js";

export function generateFullConversationMarkdown(messages: ChatGPTMessage[]): string {
  const sections = messages.map((message) => {
    const roleLabel = roleToHeading(message.role);
    const parts = [`## ${message.index}. ${roleLabel}`, "", message.content];

    if (message.links && message.links.length > 0) {
      parts.push("", "### Links", "");
      for (const link of message.links) {
        parts.push(`- ${link.text ? `${link.text}: ` : ""}${link.url}`);
      }
    }

    if (message.codeBlocks && message.codeBlocks.length > 0) {
      parts.push("", "### Code Blocks", "");
      for (const block of message.codeBlocks) {
        const language = block.language ?? "";
        parts.push(`\`\`\`${language}`, block.content, "```", "");
      }
    }

    return parts.join("\n").trimEnd();
  });

  return `# Full Conversation\n\n${sections.join("\n\n---\n\n")}\n`;
}

function roleToHeading(role: ChatGPTMessage["role"]): string {
  if (role === "user") {
    return "User";
  }

  if (role === "assistant") {
    return "Assistant";
  }

  return "Unknown";
}
