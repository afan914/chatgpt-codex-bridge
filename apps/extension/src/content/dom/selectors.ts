export const MESSAGE_CONTAINER_SELECTORS = [
  "[data-message-author-role]",
  '[data-testid^="conversation-turn-"]',
  "article"
];

export const UI_TEXT_TO_REMOVE = new Set([
  "Copy",
  "复制",
  "Regenerate",
  "重新生成",
  "Share",
  "分享",
  "Thumbs up",
  "Thumbs down",
  "Like",
  "Dislike"
]);
