// Walks ../agents/*/grok-install.yaml at build time, transforms each
// manifest into the marketplace Agent shape, and writes a deterministic
// JSON index that the runtime imports. Re-run by `prebuild` / `predev`
// / `pretest` so local dev and CI stay in sync without manual steps.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AGENTS_ROOT = path.resolve(__dirname, '..', '..', 'agents');
const OUTPUT = path.resolve(__dirname, '..', 'src', 'data', 'agents-index.generated.json');

// Stable date placeholder — YAMLs do not carry created_at. Using a fixed
// value keeps the generated index reproducible across machines and CI runs.
const STABLE_DATE = '2026-05-11T00:00:00.000Z';

const CATEGORY_MAP = {
  'super-agent': 'developer',
  'x-money-tool': 'analytics',
  'creator-template': 'content',
};

function slugify(s) {
  return String(s)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function firstSentence(text, fallback) {
  if (!text || typeof text !== 'string') return fallback;
  const trimmed = text.trim().replace(/\s+/g, ' ');
  const m = trimmed.match(/^[^.!?\n]+[.!?]/);
  const candidate = (m ? m[0] : trimmed).trim();
  if (candidate.length > 240) return candidate.slice(0, 237).trimEnd() + '…';
  return candidate || fallback;
}

function deriveCertifications(yamlData) {
  const certs = new Set();
  if (yamlData.runtime?.engine === 'grok') certs.add('grok-native');
  if (yamlData.extensions?.safety_v215) certs.add('safety-max');
  const targets = Array.isArray(yamlData.deploy?.targets) ? yamlData.deploy.targets : [];
  if (targets.includes('action')) certs.add('action-certified');
  if (targets.includes('ide')) certs.add('vscode-verified');
  return Array.from(certs);
}

// Honest status: an agent is 'available' only if a real implementation is
// present — a non-empty impl/ directory (Heavy) or a Light prompt the agent
// actually IS. Manifest-only specifications are 'spec'. Certifications are
// suppressed for 'spec' so the marketplace never asserts capabilities that
// have no code behind them.
function deriveStatus(agentAbsDir) {
  try {
    const implDir = path.join(agentAbsDir, 'impl');
    if (fs.existsSync(implDir) && fs.statSync(implDir).isDirectory()) {
      const hasCode = fs
        .readdirSync(implDir)
        .some((f) => f.endsWith('.py') || fs.statSync(path.join(implDir, f)).isDirectory());
      if (hasCode) return 'available';
    }
    if (fs.existsSync(path.join(agentAbsDir, 'light', 'prompt.md'))) return 'available';
  } catch {
    /* fall through to spec */
  }
  return 'spec';
}

function deriveTags(yamlData) {
  const tags = new Set();
  if (Array.isArray(yamlData.tools)) {
    for (const t of yamlData.tools) {
      const tname = typeof t === 'string' ? t : t?.name || t?.id;
      if (tname && typeof tname === 'string') tags.add(tname);
    }
  }
  if (yamlData.extensions?.original_kind) tags.add(yamlData.extensions.original_kind);
  return Array.from(tags).slice(0, 12);
}

function transform(yamlData, categoryDir, agentDirName, agentAbsDir) {
  const id = slugify(yamlData.name || agentDirName);
  const desc = (yamlData.description || '').trim();
  const sourceCategory = yamlData.category;
  const category = CATEGORY_MAP[sourceCategory] || 'developer';
  const status = deriveStatus(agentAbsDir);
  return {
    id,
    name: yamlData.name || agentDirName,
    tagline: firstSentence(desc, yamlData.name || agentDirName),
    description: desc || `${agentDirName} (no description in manifest).`,
    category,
    status,
    tags: deriveTags(yamlData),
    // Honesty gate: only an agent with a real implementation may carry
    // certification badges. Specifications carry none.
    certifications: status === 'available' ? deriveCertifications(yamlData) : [],
    creator: {
      handle: '@AgentMindCloud',
      github: 'AgentMindCloud',
      avatar: 'https://avatars.githubusercontent.com/AgentMindCloud',
    },
    repo: 'AgentMindCloud/xlOS',
    homepage: `https://github.com/AgentMindCloud/xlOS/tree/main/agents/${categoryDir}/${agentDirName}`,
    created_at: STABLE_DATE,
    updated_at: STABLE_DATE,
    installs: 0,
    featured: false,
  };
}

function listSubdirs(parent) {
  if (!fs.existsSync(parent)) return [];
  return fs
    .readdirSync(parent)
    .filter((d) => !d.startsWith('.'))
    .filter((d) => {
      try {
        return fs.statSync(path.join(parent, d)).isDirectory();
      } catch {
        return false;
      }
    })
    .sort();
}

function main() {
  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });

  if (!fs.existsSync(AGENTS_ROOT)) {
    console.warn(`[build-agents-index] agents dir not found at ${AGENTS_ROOT} — writing empty index`);
    fs.writeFileSync(OUTPUT, '[]\n');
    return;
  }

  const agents = [];
  for (const cat of listSubdirs(AGENTS_ROOT)) {
    for (const agentDir of listSubdirs(path.join(AGENTS_ROOT, cat))) {
      const agentAbsDir = path.join(AGENTS_ROOT, cat, agentDir);
      const yamlPath = path.join(agentAbsDir, 'grok-install.yaml');
      if (!fs.existsSync(yamlPath)) continue;
      try {
        const data = yaml.parse(fs.readFileSync(yamlPath, 'utf-8'));
        if (!data || typeof data !== 'object') continue;
        agents.push(transform(data, cat, agentDir, agentAbsDir));
      } catch (err) {
        console.warn(`[build-agents-index] failed to parse ${yamlPath}: ${err.message}`);
      }
    }
  }

  agents.sort((a, b) => a.id.localeCompare(b.id));
  fs.writeFileSync(OUTPUT, JSON.stringify(agents, null, 2) + '\n');
  console.log(`[build-agents-index] Wrote ${agents.length} agents to ${path.relative(process.cwd(), OUTPUT)}`);
}

main();
