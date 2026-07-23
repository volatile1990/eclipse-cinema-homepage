#!/usr/bin/env node

/**
 * Convert a private Zappiti inventory export into the deliberately small,
 * location-free data contract used by the public website.
 *
 * Usage:
 *   node tools/sanitize-zappiti-catalog.mjs --input D:\private\catalog.json
 *   private-export-command | node tools/sanitize-zappiti-catalog.mjs --input -
 *   node tools/sanitize-zappiti-catalog.mjs --check
 *
 * Keep the private input outside the website repository. The generated files
 * contain presentation metadata only; file names, paths, shares, source names,
 * exact sizes and modification timestamps are intentionally discarded.
 */

import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { BlockList, isIP } from "node:net";
import { resolve } from "node:path";

const DEFAULT_OUTPUT_DIR = resolve("assets");
const OUTPUT_NAMES = {
  pretty: "zappiti-catalog.json",
  minified: "zappiti-catalog.min.json",
  summary: "zappiti-catalog-summary.json",
};

const PRIVATE_KEY_PATTERN = /(^|_)(?:display_?path|relative_?path|path|file(?:_?name|s)?|source(?:_?quality)?|library|mount|share|size_?bytes|modified_?at)(_|$)/i;
const PRIVATE_VALUE_PATTERNS = [
  /(?:^|[^\d])(?:10(?:\.\d{1,3}){3}|127(?:\.\d{1,3}){3}|169\.254(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2}|192\.168(?:\.\d{1,3}){2})(?:$|[^\d])/,
  /(?:^|[\s"'])(?:[a-z]:\\|\\\\)/i,
  /(?:^|[\s"'])(?:\/mnt\/|\/home\/|\/users\/|\/srv\/|\/volume(?:s)?\/)/i,
  /\bsmb:\/\//i,
  /\bzappiti\s*\d*\b/i,
  /\.(?:mkv|mp4|avi|m2ts|mov|iso)(?:$|[?#])/i,
  /\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})\b/i,
];

const MOVIE_METADATA_KEYS = [
  "backdrop_url",
  "genres",
  "homepage",
  "imdb_id",
  "imdb_rating",
  "imdb_votes",
  "number_of_episodes",
  "number_of_seasons",
  "original_title",
  "overview",
  "poster_url",
  "provider",
  "release_date",
  "runtime_minutes",
  "title",
  "tmdb_id",
  "vote_average",
  "vote_count",
  "year",
];

const EPISODE_METADATA_KEYS = [
  "air_date",
  "episode",
  "imdb_id",
  "overview",
  "provider",
  "runtime_minutes",
  "season",
  "still_url",
  "title",
  "tmdb_id",
  "vote_average",
  "vote_count",
  "year",
];

const TITLE_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "das",
  "den",
  "der",
  "des",
  "die",
  "ein",
  "eine",
  "einer",
  "eines",
  "im",
  "in",
  "of",
  "the",
  "und",
  "von",
]);

// The legacy exporter replaced a subset of non-ASCII characters with `?`.
// Repair the finite set that occurs in public-facing titles; optional prose
// with irreversible damage is discarded below instead of being published.
const PUBLIC_TEXT_REPAIRS = new Map([
  ["J?ger", "Jäger"],
  ["Verm?chtnis", "Vermächtnis"],
  ["Gef?hrten", "Gefährten"],
  ["R?ckkehr", "Rückkehr"],
  ["K?nigs", "Königs"],
  ["T?rme", "Türme"],
  ["f?nf", "fünf"],
  ["Ein?de", "Einöde"],
  ["Identit?t", "Identität"],
  ["Verschw?rung", "Verschwörung"],
  ["Ph?nix", "Phönix"],
  ["Heiligt?mer", "Heiligtümer"],
  ["H?nsel", "Hänsel"],
  ["Hexenj?ger", "Hexenjäger"],
  ["zur?ck", "zurück"],
  ["H?ndler", "Händler"],
  ["Auserw?hlten", "Auserwählten"],
  ["Brandw?ste", "Brandwüste"],
  ["St?dte", "Städte"],
  ["?lter", "Älter"],
  ["H?rter", "Härter"],
  ["Gef?hrliche", "Gefährliche"],
  ["S?uberung", "Säuberung"],
  ["h?lt", "hält"],
  ["?ffne", "Öffne"],
  ["Gl?ck", "Glück"],
  ["tr?gt", "trägt"],
  ["gro?es", "großes"],
  ["s?t", "sät"],
  ["Pr?nom", "Prénom"],
  ["Kom?die", "Komödie"],
]);

const hasDamagedText = (value) => /\p{L}\?\p{L}|\?{2,}/u.test(String(value || ""));

const repairPublicText = (value) => {
  let output = String(value || "").trim();
  PUBLIC_TEXT_REPAIRS.forEach((replacement, damaged) => {
    output = output.replaceAll(damaged, replacement);
  });
  return output;
};

const parseArgs = (argv) => {
  const args = { check: false, input: "", outputDir: DEFAULT_OUTPUT_DIR };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--check") {
      args.check = true;
    } else if (arg === "--input") {
      args.input = argv[index + 1] || "";
      index += 1;
    } else if (arg === "--output-dir") {
      args.outputDir = resolve(argv[index + 1] || "");
      index += 1;
    } else if (arg === "--help" || arg === "-h") {
      console.log("Usage: node tools/sanitize-zappiti-catalog.mjs --input <private-export.json> [--output-dir assets]\n       node tools/sanitize-zappiti-catalog.mjs --check [--output-dir assets]");
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
};

const normalizeTitle = (value) =>
  String(value || "")
    .normalize("NFKD")
    .replace(/\p{Mark}/gu, "")
    .toLocaleLowerCase("de-DE")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const titleStem = (item) =>
  String(item.file_name || "")
    .replace(/\.[^.]+$/, "")
    .replace(/[._]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const titleSimilarity = (left, right) => {
  const a = normalizeTitle(left);
  const b = normalizeTitle(right);
  if (!a || !b) return 0;

  const compactA = a.replaceAll(" ", "");
  const compactB = b.replaceAll(" ", "");
  if (compactA === compactB) return 1;

  if (
    Math.min(compactA.length, compactB.length) >= 4 &&
    (compactA.includes(compactB) || compactB.includes(compactA))
  ) {
    return (Math.min(compactA.length, compactB.length) / Math.max(compactA.length, compactB.length)) * 0.95;
  }

  const tokensA = a.split(" ").filter((token) => !TITLE_STOP_WORDS.has(token));
  const remainingB = b.split(" ").filter((token) => !TITLE_STOP_WORDS.has(token));
  let intersection = 0;

  tokensA.forEach((token) => {
    const matchIndex = remainingB.indexOf(token);
    if (matchIndex >= 0) {
      intersection += 1;
      remainingB.splice(matchIndex, 1);
    }
  });

  return (2 * intersection) / Math.max(1, tokensA.length + b.split(" ").filter((token) => !TITLE_STOP_WORDS.has(token)).length);
};

const sourceTitleCandidates = (item) => {
  const parsedTitle = item.parsed?.title;
  const alternativeTitle = item.parsed?.alternative_title;
  return [
    titleStem(item),
    item.title,
    parsedTitle,
    alternativeTitle,
    parsedTitle && alternativeTitle ? `${parsedTitle} ${alternativeTitle}` : "",
  ].filter(Boolean);
};

const metadataTitleCandidates = (item) =>
  [item.metadata?.title, item.metadata?.original_title].filter(Boolean);

const bestMetadataTitleScore = (item) => {
  let best = 0;
  sourceTitleCandidates(item).forEach((sourceTitle) => {
    metadataTitleCandidates(item).forEach((metadataTitle) => {
      best = Math.max(best, titleSimilarity(sourceTitle, metadataTitle));
    });
  });
  return best;
};

const numberConflict = (item) => {
  const source = normalizeTitle(titleStem(item));
  const metadataTitles = metadataTitleCandidates(item).map(normalizeTitle);

  const sourceYear = [...source.matchAll(/\b(?:19|20)\d{2}\b/g)].map((match) => Number(match[0]));
  if (
    sourceYear.some(
      (year) =>
        !metadataTitles.some((title) => title.includes(String(year))) &&
        Number(item.metadata?.year) !== year,
    )
  ) {
    return true;
  }

  const partNumber = (value) => {
    const match = value.match(/\b(?:part|teil|chapter|kapitel)\s*(\d{1,2})\b/);
    return match ? Number(match[1]) : null;
  };
  const sourcePart = partNumber(source);
  const metadataParts = metadataTitles.map(partNumber).filter(Number.isFinite);
  return sourcePart !== null && metadataParts.length > 0 && !metadataParts.includes(sourcePart);
};

const buildTrustMap = (items) => {
  const duplicateMovieMetadata = new Map();

  items.forEach((item) => {
    const metadataId = item.kind === "movie" ? item.metadata?.tmdb_id : null;
    if (!metadataId) return;
    const group = duplicateMovieMetadata.get(metadataId) || [];
    group.push(item);
    duplicateMovieMetadata.set(metadataId, group);
  });

  const trust = new Map();
  const dropped = [];

  items.forEach((item) => {
    if (!item.metadata) {
      trust.set(item, false);
      return;
    }

    const score = bestMetadataTitleScore(item);
    const group = duplicateMovieMetadata.get(item.metadata.tmdb_id) || [];
    const groupBest = group.reduce((best, candidate) => Math.max(best, bestMetadataTitleScore(candidate)), 0);
    const duplicateMismatch = group.length > 1 && score < groupBest - 0.12;
    const trusted = score >= 0.25 && !duplicateMismatch && !numberConflict(item);

    trust.set(item, trusted);
    if (!trusted) {
      dropped.push({
        file: item.file_name || "(unknown)",
        metadataTitle: item.metadata.title || item.metadata.original_title || "(unknown)",
        score,
      });
    }
  });

  return { trust, dropped };
};

const privateAddresses = new BlockList();
privateAddresses.addSubnet("10.0.0.0", 8, "ipv4");
privateAddresses.addSubnet("127.0.0.0", 8, "ipv4");
privateAddresses.addSubnet("169.254.0.0", 16, "ipv4");
privateAddresses.addSubnet("172.16.0.0", 12, "ipv4");
privateAddresses.addSubnet("192.168.0.0", 16, "ipv4");
privateAddresses.addAddress("::1", "ipv6");
privateAddresses.addSubnet("fc00::", 7, "ipv6");
privateAddresses.addSubnet("fe80::", 10, "ipv6");
privateAddresses.addSubnet("::ffff:0:0", 96, "ipv6");

const isPrivateHostname = (hostname) => {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) return true;
  const family = isIP(host);
  return family ? privateAddresses.check(host, family === 6 ? "ipv6" : "ipv4") : false;
};

const safeExternalUrl = (value, { tmdbImage = false } = {}) => {
  if (!value) return "";
  try {
    const url = new URL(String(value));
    if (url.protocol !== "https:" || url.username || url.password || isPrivateHostname(url.hostname)) return "";
    if (tmdbImage && (url.protocol !== "https:" || url.hostname !== "image.tmdb.org")) return "";
    return url.href;
  } catch {
    return "";
  }
};

const assertSafeUrlPolicy = () => {
  const blocked = [
    "http://example.com/path",
    "https://user:password@example.com/path",
    "https://localhost/path",
    "https://preview.localhost/path",
    "https://192.168.1.10/path",
    "https://[::1]/path",
    "https://[fd00::1]/path",
    "https://[fe80::1]/path",
    "https://[::ffff:192.168.1.10]/path",
  ];
  if (blocked.some((url) => safeExternalUrl(url))) {
    throw new Error("External URL policy accepted a blocked protocol, credential or private host.");
  }
  if (safeExternalUrl("https://example.com/path") !== "https://example.com/path") {
    throw new Error("External URL policy rejected a normal HTTPS URL.");
  }
};

const copyMetadata = (metadata, keys, { episode = false } = {}) => {
  if (!metadata || typeof metadata !== "object") return undefined;
  const output = {};

  keys.forEach((key) => {
    const value = metadata[key];
    if (value === undefined || value === null || value === "") return;

    if (["backdrop_url", "poster_url", "still_url"].includes(key)) {
      const url = safeExternalUrl(value, { tmdbImage: true });
      if (url) output[key] = url;
      return;
    }

    if (key === "homepage") {
      const url = safeExternalUrl(value);
      if (url) output[key] = url;
      return;
    }

    if (key === "genres") {
      const genres = Array.isArray(value)
        ? [
            ...new Set(
              value
                .map(repairPublicText)
                .filter((genre) => genre && !hasDamagedText(genre)),
            ),
          ]
        : [];
      if (genres.length) output.genres = genres;
      return;
    }

    if (typeof value === "string") {
      const text = repairPublicText(value);
      if (text && !hasDamagedText(text)) output[key] = text;
      return;
    }

    output[key] = value;
  });

  if (Object.keys(output).length === 0) return undefined;
  if (!episode && output.provider && output.provider !== "tmdb") delete output.provider;
  return output;
};

const cleanMediaInfo = (mediaInfo) => {
  if (!mediaInfo || typeof mediaInfo !== "object") return undefined;
  const output = {};

  const duration = Number(mediaInfo.duration_seconds);
  if (Number.isFinite(duration) && duration > 0) {
    output.duration_seconds = Math.max(60, Math.round(duration / 60) * 60);
  }

  if (mediaInfo.video && typeof mediaInfo.video === "object") {
    const video = {};
    ["codec", "profile"].forEach((key) => {
      if (mediaInfo.video[key]) video[key] = String(mediaInfo.video[key]);
    });
    ["width", "height"].forEach((key) => {
      const value = Number(mediaInfo.video[key]);
      if (Number.isFinite(value) && value > 0) video[key] = value;
    });
    if (Object.keys(video).length) output.video = video;
  }

  if (Array.isArray(mediaInfo.audio)) {
    const uniqueStreams = new Map();
    mediaInfo.audio.forEach((stream) => {
      if (!stream || typeof stream !== "object" || !stream.codec) return;
      const clean = { codec: String(stream.codec) };
      const channels = Number(stream.channels);
      if (Number.isFinite(channels) && channels > 0) clean.channels = channels;
      if (stream.language && !["und", "unknown"].includes(String(stream.language).toLowerCase())) {
        clean.language = String(stream.language);
      }
      uniqueStreams.set(JSON.stringify(clean), clean);
    });
    if (uniqueStreams.size) output.audio = [...uniqueStreams.values()];
  }

  return Object.keys(output).length ? output : undefined;
};

const isTrailer = (item) =>
  /\btrailer\b/i.test(String(item.parsed?.other || "")) &&
  (!item.media_info?.duration_seconds || Number(item.media_info.duration_seconds) < 20 * 60);

const cleanDisplayTitle = (item, kind, trustedMetadata) => {
  const fallback = kind === "tv" ? "Unbekannte Serie" : kind === "demo" ? "Unbekannte Demo" : "Unbekannter Titel";
  const candidates =
    kind === "movie"
      ? [trustedMetadata?.title, trustedMetadata?.original_title, titleStem(item), item.title, item.parsed?.title]
      : [trustedMetadata?.title, item.title, item.parsed?.title, titleStem(item)];

  const title =
    candidates
      .map(repairPublicText)
      .find((candidate) => candidate && !hasDamagedText(candidate)) || fallback;

  return title.replace(/\s+-\s+/g, " – ").replace(/\s+/g, " ").trim();
};

const stablePublicId = (item, occurrence) => {
  const identity = JSON.stringify([
    item.kind,
    normalizeTitle(item.title),
    item.year || null,
    item.season || null,
    item.episode || null,
    item.metadata?.tmdb_id || null,
    occurrence,
  ]);
  return `pub_${createHash("sha256").update(identity).digest("hex").slice(0, 16)}`;
};

const sanitizeItem = (item, trusted) => {
  const kind = isTrailer(item) ? "demo" : ["movie", "demo", "tv"].includes(item.kind) ? item.kind : "movie";
  const metadata = trusted
    ? copyMetadata(item.metadata, MOVIE_METADATA_KEYS)
    : undefined;
  const output = {
    kind,
    title: cleanDisplayTitle(item, kind, metadata),
  };

  const untrustedNumericTitle = !trusted && item.metadata && numberConflict(item);
  const year = Number(metadata?.year || (!untrustedNumericTitle ? item.year : 0));
  if (Number.isInteger(year) && year >= 1888 && year <= 2200) output.year = year;

  if (metadata) output.metadata = metadata;

  const mediaInfo = cleanMediaInfo(item.media_info);
  if (mediaInfo) output.media_info = mediaInfo;

  ["audio_codec", "screen_size", "video_codec"].forEach((key) => {
    if (item[key]) output[key] = String(item[key]);
  });

  if (kind === "tv") {
    ["season", "episode"].forEach((key) => {
      const value = Number(item[key] ?? item.parsed?.[key]);
      if (Number.isInteger(value) && value > 0) output[key] = value;
    });
    const episodeMetadata = copyMetadata(item.episode_metadata, EPISODE_METADATA_KEYS, { episode: true });
    if (episodeMetadata) output.episode_metadata = episodeMetadata;
    const episodeTitle = repairPublicText(item.episode_title || episodeMetadata?.title);
    if (episodeTitle && !hasDamagedText(episodeTitle)) output.episode_title = episodeTitle;
  }

  return output;
};

const statsFor = (items) => {
  const mediaByKind = { movie: 0, demo: 0, tv: 0 };
  const series = new Set();

  items.forEach((item) => {
    mediaByKind[item.kind] += 1;
    if (item.kind === "tv") series.add(normalizeTitle(item.title));
  });

  const byKind = {
    movie: mediaByKind.movie,
    demo: mediaByKind.demo,
    tv: series.size,
  };

  return {
    total: byKind.movie + byKind.demo + byKind.tv,
    by_kind: byKind,
    media_items: items.length,
    tv_episodes: mediaByKind.tv,
  };
};

const normalizedGeneratedAt = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error("The private catalog has an invalid generated_at value.");
  return date.toISOString().slice(0, 10);
};

const findPrivacyViolations = (value, pointer = "$", violations = []) => {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => findPrivacyViolations(entry, `${pointer}[${index}]`, violations));
    return violations;
  }

  if (value && typeof value === "object") {
    Object.entries(value).forEach(([key, entry]) => {
      if (PRIVATE_KEY_PATTERN.test(key)) violations.push(`${pointer}.${key}: private key`);
      findPrivacyViolations(entry, `${pointer}.${key}`, violations);
    });
    return violations;
  }

  if (typeof value === "string") {
    PRIVATE_VALUE_PATTERNS.forEach((pattern) => {
      if (pattern.test(value)) violations.push(`${pointer}: private value (${pattern})`);
    });
    if (hasDamagedText(value)) violations.push(`${pointer}: damaged legacy text`);
  }

  return violations;
};

const assertPublicCatalog = (catalog) => {
  if (catalog.schema_version !== 2) throw new Error("Public catalog schema_version must be 2.");
  if (!Array.isArray(catalog.items)) throw new Error("Public catalog items must be an array.");
  if ("sources" in catalog) throw new Error("Public catalog must not contain a sources section.");

  const expectedStats = statsFor(catalog.items);
  if (JSON.stringify(expectedStats) !== JSON.stringify(catalog.stats)) {
    throw new Error(`Public stats are inconsistent. Expected ${JSON.stringify(expectedStats)}.`);
  }

  const ids = new Set();
  catalog.items.forEach((item, index) => {
    if (!item.id || ids.has(item.id)) throw new Error(`Missing or duplicate public item id at index ${index}.`);
    ids.add(item.id);
  });

  const violations = findPrivacyViolations(catalog);
  if (violations.length) {
    throw new Error(`Privacy validation failed:\n${violations.slice(0, 20).join("\n")}`);
  }
};

const generateCatalog = (privateCatalog) => {
  if (privateCatalog.schema_version !== 1 || !Array.isArray(privateCatalog.items)) {
    throw new Error("Expected an unsanitized schema_version 1 catalog as input.");
  }

  const { trust, dropped } = buildTrustMap(privateCatalog.items);
  const occurrences = new Map();
  const items = privateCatalog.items.map((item) => {
    const clean = sanitizeItem(item, trust.get(item));
    const occurrenceKey = JSON.stringify([
      clean.kind,
      normalizeTitle(clean.title),
      clean.year || null,
      clean.season || null,
      clean.episode || null,
      clean.metadata?.tmdb_id || null,
    ]);
    const occurrence = (occurrences.get(occurrenceKey) || 0) + 1;
    occurrences.set(occurrenceKey, occurrence);
    return { id: stablePublicId(clean, occurrence), ...clean };
  });

  const catalog = {
    schema_version: 2,
    generated_at: normalizedGeneratedAt(privateCatalog.generated_at),
    items,
    stats: statsFor(items),
  };

  assertPublicCatalog(catalog);
  return { catalog, dropped };
};

const readStdin = async () => {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
};

const readJson = async (path) => JSON.parse(await readFile(path, "utf8"));

const checkOutputs = async (outputDir) => {
  const prettyPath = resolve(outputDir, OUTPUT_NAMES.pretty);
  const minifiedPath = resolve(outputDir, OUTPUT_NAMES.minified);
  const summaryPath = resolve(outputDir, OUTPUT_NAMES.summary);
  const [pretty, minified, summary] = await Promise.all([
    readJson(prettyPath),
    readJson(minifiedPath),
    readJson(summaryPath),
  ]);

  assertPublicCatalog(pretty);
  assertPublicCatalog(minified);
  if (JSON.stringify(pretty) !== JSON.stringify(minified)) {
    throw new Error("Pretty and minified public catalogs contain different data.");
  }
  if (JSON.stringify(summary.stats) !== JSON.stringify(pretty.stats)) {
    throw new Error("Catalog summary stats differ from the public catalog.");
  }
  if (summary.schema_version !== pretty.schema_version || summary.generated_at !== pretty.generated_at) {
    throw new Error("Catalog summary metadata differs from the public catalog.");
  }
  const summaryViolations = findPrivacyViolations(summary);
  if (summaryViolations.length) throw new Error(`Summary privacy validation failed:\n${summaryViolations.join("\n")}`);

  return { catalog: pretty, prettyPath, minifiedPath, summaryPath };
};

const writeOutputs = async (catalog, outputDir) => {
  const prettyPath = resolve(outputDir, OUTPUT_NAMES.pretty);
  const minifiedPath = resolve(outputDir, OUTPUT_NAMES.minified);
  const summaryPath = resolve(outputDir, OUTPUT_NAMES.summary);
  const summary = {
    schema_version: catalog.schema_version,
    generated_at: catalog.generated_at,
    stats: catalog.stats,
  };

  await Promise.all([
    writeFile(prettyPath, `${JSON.stringify(catalog, null, 2)}\n`, "utf8"),
    writeFile(minifiedPath, JSON.stringify(catalog), "utf8"),
    writeFile(summaryPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8"),
  ]);
};

const main = async () => {
  assertSafeUrlPolicy();
  const args = parseArgs(process.argv.slice(2));
  if (args.check) {
    const checked = await checkOutputs(args.outputDir);
    console.log(`Validated ${checked.catalog.items.length} public media records (${checked.catalog.stats.total} catalog entries).`);
    return;
  }
  if (!args.input) throw new Error("Missing --input <private-export.json>. Use --help for usage.");

  const inputPath = args.input === "-" ? "-" : resolve(args.input);
  const privateText = inputPath === "-" ? await readStdin() : await readFile(inputPath, "utf8");
  const privateCatalog = JSON.parse(privateText);
  const inputBytes = Buffer.byteLength(privateText);
  const { catalog, dropped } = generateCatalog(privateCatalog);
  await writeOutputs(catalog, args.outputDir);
  const checked = await checkOutputs(args.outputDir);
  const minifiedBytes = (await readFile(checked.minifiedPath)).byteLength;

  console.log(`Generated ${catalog.items.length} public media records (${catalog.stats.total} catalog entries).`);
  console.log(`Removed untrusted metadata mappings: ${dropped.length}.`);
  dropped.forEach(({ file, metadataTitle, score }) => {
    console.log(`  - ${file} -> ${metadataTitle} (title score ${score.toFixed(2)})`);
  });
  console.log(`Minified size: ${inputBytes} -> ${minifiedBytes} bytes (${Math.round((1 - minifiedBytes / inputBytes) * 100)}% smaller).`);
};

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
