/**
 * Common instructions for AI models to handle technical content
 */
export const AI_TECHNICAL_PROTECTION = `
CRITICAL: Do not translate programming reserved words, technical terms, or code snippets. 
Keep terms like 'if', 'while', 'null', 'undefined', 'React', 'TypeScript', 'Node.js', 'API', 'JSON', 'Markdown', etc., in their original English technical form.
If the content is Markdown, ensure code blocks and inline code remain untouched.
`.trim();
