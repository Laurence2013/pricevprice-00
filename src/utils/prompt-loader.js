import fs from 'fs';
import path from 'path';

/**
 * Loads a prompt template from the prompts/ directory and replaces variables.
 * Handles both {{var}} and {{json var}} placeholders.
 * @param {string} filename - Name of prompt file in prompts/ (e.g., 'summarizeMarketTrends.prompt')
 * @param {Object} replacements - Object mapping key names to replacement values
 * @returns {string} Processed prompt string
 */
export const loadPromptTemplate = (filename, replacements = {}) => {
  const filePath = path.resolve(process.cwd(), 'prompts', filename);
  let template = fs.readFileSync(filePath, 'utf-8');

  // Strip YAML frontmatter if present
  if (template.startsWith('---')) {
    const endFrontmatter = template.indexOf('---', 3);
    if (endFrontmatter !== -1) {
      template = template.slice(endFrontmatter + 3).trim();
    }
  }

  // Perform replacements for {{json key}} and {{key}}
  Object.keys(replacements).forEach((key) => {
    const rawVal = replacements[key];
    const jsonVal = typeof rawVal === 'object' ? JSON.stringify(rawVal, null, 2) : String(rawVal);
    const strVal = typeof rawVal === 'object' ? JSON.stringify(rawVal) : String(rawVal);

    template = template.replaceAll(`{{json ${key}}}`, jsonVal);
    template = template.replaceAll(`{{${key}}}`, strVal);
  });

  return template;
};
