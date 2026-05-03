/**
 * parse-places.ts
 *
 * Reads all the place-file markdown files in a directory (or set of
 * directories) and converts them to structured JSON the app can use.
 *
 * Usage:
 *   ts-node scripts/parse-places.ts <input-dir-or-dirs> <output-json>
 *
 * Or via the npm script:
 *   npm run build-places
 *
 * Each input file must have YAML frontmatter at the top (between --- markers)
 * followed by markdown body. The parser extracts the frontmatter as the
 * structured data and keeps the body as `narrative` for richer display.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

interface PlaceFrontmatter {
  id: string;
  name: string;
  type: string;
  category?: string;
  coordinates?: [number, number]; // [lng, lat]
  address?: string;
  region?: string;
  'sub-region'?: string;
  'nearest-town'?: string;
  country?: string;
  'proposed-by'?: string;
  status?: string;
  tags?: string[];
  vibe?: string;
  phone?: string;
  website?: string;
  booking?: string;
  practical?: Record<string, any>;
  recommendations?: Array<{
    source: string;
    date: string;
    context?: string;
    note?: string;
  }>;
  'last-edited'?: string;
}

interface ParsedPlace {
  id: string;
  name: string;
  type: string;
  category?: string;
  coordinates?: [number, number];
  address?: string;
  region?: string;
  subRegion?: string;
  nearestTown?: string;
  country?: string;
  proposedBy?: string;
  status?: string;
  tags?: string[];
  vibe?: string;
  phone?: string;
  website?: string;
  booking?: string;
  practical?: Record<string, any>;
  recommendations?: Array<{
    source: string;
    date: string;
    context?: string;
    note?: string;
  }>;
  narrative?: string;
  lastEdited?: string;
  sourceFile: string;
}

function parseFrontmatter(fileContent: string): {
  frontmatter: PlaceFrontmatter | null;
  body: string;
} {
  const match = fileContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return { frontmatter: null, body: fileContent };
  }
  try {
    const frontmatter = yaml.load(match[1], {
      schema: yaml.CORE_SCHEMA, // Don't auto-convert dates - keep as strings
    }) as PlaceFrontmatter;
    return { frontmatter, body: match[2].trim() };
  } catch (err) {
    console.error('  YAML parse error:', err);
    return { frontmatter: null, body: fileContent };
  }
}

function parseFile(filePath: string): ParsedPlace | null {
  const content = fs.readFileSync(filePath, 'utf-8');
  const { frontmatter, body } = parseFrontmatter(content);

  if (!frontmatter) {
    console.warn(`  Skipping ${filePath} — no valid frontmatter`);
    return null;
  }

  if (!frontmatter.id || !frontmatter.name) {
    console.warn(`  Skipping ${filePath} — missing required id/name`);
    return null;
  }

  // Normalize the data structure (kebab-case → camelCase for app use)
  const place: ParsedPlace = {
    id: frontmatter.id,
    name: frontmatter.name,
    type: frontmatter.type || 'place',
    category: frontmatter.category,
    coordinates: frontmatter.coordinates,
    address: frontmatter.address,
    region: frontmatter.region,
    subRegion: frontmatter['sub-region'],
    nearestTown: frontmatter['nearest-town'],
    country: frontmatter.country,
    proposedBy: frontmatter['proposed-by'],
    status: frontmatter.status,
    tags: frontmatter.tags,
    vibe: frontmatter.vibe,
    phone: frontmatter.phone,
    website: frontmatter.website,
    booking: frontmatter.booking,
    practical: frontmatter.practical,
    recommendations: frontmatter.recommendations,
    narrative: body,
    lastEdited: frontmatter['last-edited'],
    sourceFile: path.basename(filePath),
  };

  return place;
}

function findMarkdownFiles(dir: string): string[] {
  const files: string[] = [];
  if (!fs.existsSync(dir)) {
    console.warn(`Directory does not exist: ${dir}`);
    return files;
  }
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findMarkdownFiles(fullPath));
    } else if (
      entry.isFile() &&
      entry.name.endsWith('.md') &&
      entry.name.toUpperCase() !== 'README.MD'
    ) {
      files.push(fullPath);
    }
  }
  return files;
}

function main() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error(
      'Usage: ts-node scripts/parse-places.ts <input-dir> [<input-dir2> ...] <output-json>'
    );
    process.exit(1);
  }

  const outputPath = args[args.length - 1];
  const inputDirs = args.slice(0, -1);

  const allFiles: string[] = [];
  for (const dir of inputDirs) {
    const files = findMarkdownFiles(dir);
    allFiles.push(...files);
    console.log(`Found ${files.length} files in ${dir}`);
  }

  console.log(`\nParsing ${allFiles.length} files total...\n`);

  const places: ParsedPlace[] = [];
  for (const filePath of allFiles) {
    const place = parseFile(filePath);
    if (place) {
      places.push(place);
      console.log(`  ✓ ${place.id} — ${place.name}`);
    }
  }

  // Sort by region, then name, for stable output
  places.sort((a, b) => {
    const regionCompare = (a.region || '').localeCompare(b.region || '');
    if (regionCompare !== 0) return regionCompare;
    return a.name.localeCompare(b.name);
  });

  const output = {
    generatedAt: new Date().toISOString(),
    count: places.length,
    places,
  };

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\n✓ Wrote ${places.length} places to ${outputPath}`);
}

main();
