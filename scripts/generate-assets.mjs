#!/usr/bin/env node

/**
 * Generate empty state illustrations using Gemini (Nano Banana 2).
 *
 * Usage:
 *   node scripts/generate-assets.mjs
 *   GEMINI_API_KEY=... node scripts/generate-assets.mjs
 *
 * Requires: Node 18+ (uses native fetch)
 * Output: assets/empty-states/*.png
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, '..', 'assets', 'empty-states');

// Resolve API key from env or known .env files
function getApiKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) return process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  // Try reading from .env files
  const envPaths = [
    join(__dirname, '..', '..', 'Gundo_Engine', 'backend', '.env'),
    join(__dirname, '..', '..', 'Gundo_Finance', 'backend', '.env'),
  ];

  for (const envPath of envPaths) {
    try {
      const { readFileSync } = await import('node:fs');
      const content = readFileSync(envPath, 'utf-8');
      const match = content.match(/(?:GOOGLE_GENERATIVE_AI_API_KEY|GEMINI_API_KEY)=(.+)/);
      if (match) return match[1].trim();
    } catch {
      // continue
    }
  }

  return null;
}

const MODEL = 'gemini-2.0-flash-exp';
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

const ILLUSTRATIONS = [
  {
    name: 'no-data',
    prompt: `Create a minimal flat illustration for a "No Data" empty state in a web dashboard.
Show an empty bar chart or line graph with no data points.
Use #10b981 (emerald green) as the primary accent color.
Style: minimal, flat design, dark theme friendly with transparent background.
The illustration should be clean, modern, and look good at small sizes (120-200px).
No text in the image.`,
  },
  {
    name: 'no-results',
    prompt: `Create a minimal flat illustration for a "No Results Found" empty state.
Show a magnifying glass with nothing found — perhaps searching over empty space.
Use #10b981 (emerald green) as the primary accent color.
Style: minimal, flat design, dark theme friendly with transparent background.
Clean, modern look at small sizes (120-200px). No text.`,
  },
  {
    name: 'welcome',
    prompt: `Create a minimal flat illustration for a "Welcome / Getting Started" empty state.
Show a rocket launching with sparkles and stars around it.
Use #10b981 (emerald green) as the primary accent color.
Style: minimal, flat design, dark theme friendly with transparent background.
Clean, modern look at small sizes (120-200px). No text.`,
  },
  {
    name: 'error',
    prompt: `Create a minimal flat illustration for an "Error Occurred" state.
Show a warning triangle with an exclamation mark.
Use #ef4444 (red) as the primary color with #10b981 (emerald green) as secondary accent.
Style: minimal, flat design, dark theme friendly with transparent background.
Clean, modern look at small sizes (120-200px). No text.`,
  },
  {
    name: 'offline',
    prompt: `Create a minimal flat illustration for an "Offline / Disconnected" state.
Show a broken or disconnected cable/plug with signal waves crossed out.
Use #10b981 (emerald green) as the primary accent color, #6b7280 (gray) for the cable.
Style: minimal, flat design, dark theme friendly with transparent background.
Clean, modern look at small sizes (120-200px). No text.`,
  },
  {
    name: 'upload',
    prompt: `Create a minimal flat illustration for an "Upload Needed" empty state.
Show a cloud with an upward arrow, suggesting file upload.
Use #10b981 (emerald green) as the primary accent color.
Style: minimal, flat design, dark theme friendly with transparent background.
Clean, modern look at small sizes (120-200px). No text.`,
  },
];

async function generateImage(apiKey, prompt) {
  const url = `${API_BASE}/models/${MODEL}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseModalities: ['IMAGE', 'TEXT'],
        responseMimeType: 'image/png',
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();

  // Extract image from response
  const candidates = data.candidates || [];
  for (const candidate of candidates) {
    const parts = candidate.content?.parts || [];
    for (const part of parts) {
      if (part.inlineData) {
        return Buffer.from(part.inlineData.data, 'base64');
      }
    }
  }

  throw new Error('No image data found in response');
}

async function main() {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error('ERROR: No Gemini API key found.');
    console.error('Set GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY env var,');
    console.error('or ensure ~/projects/Gundo_Engine/backend/.env exists.');
    process.exit(1);
  }

  await mkdir(OUTPUT_DIR, { recursive: true });

  console.log(`Generating ${ILLUSTRATIONS.length} empty state illustrations...`);
  console.log(`Model: ${MODEL}`);
  console.log(`Output: ${OUTPUT_DIR}\n`);

  let success = 0;
  let failed = 0;

  for (const illust of ILLUSTRATIONS) {
    const filename = `${illust.name}.png`;
    const filepath = join(OUTPUT_DIR, filename);

    try {
      process.stdout.write(`  [${illust.name}] Generating... `);
      const imageData = await generateImage(apiKey, illust.prompt);
      await writeFile(filepath, imageData);
      console.log(`OK (${(imageData.length / 1024).toFixed(1)} KB) -> ${filename}`);
      success++;
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
      failed++;
    }

    // Rate limit: ~1 second between requests
    if (ILLUSTRATIONS.indexOf(illust) < ILLUSTRATIONS.length - 1) {
      await new Promise((r) => setTimeout(r, 1200));
    }
  }

  console.log(`\nDone. ${success} succeeded, ${failed} failed.`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
