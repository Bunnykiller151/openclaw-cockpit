#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const WORKSPACE = '/data/workspace';
const CONSOLIDATED = path.join(WORKSPACE, 'memory_consolidated.json');
const OUTPUT = path.join(WORKSPACE, 'memory/consolidated.md');
const TIMESTAMP_FILE = path.join(WORKSPACE, '.last_sync_memory');

// If consolidated.json doesn't exist, exit
if (!fs.existsSync(CONSOLIDATED)) {
    console.error('memory_consolidated.json not found.');
    process.exit(0);
}

// Read last sync timestamp
let lastSync = 0;
if (fs.existsSync(TIMESTAMP_FILE)) {
    try {
        lastSync = parseInt(fs.readFileSync(TIMESTAMP_FILE, 'utf8').trim()) || 0;
    } catch (e) {
        lastSync = 0;
    }
}

const consolidatedMtime = Math.floor(fs.statSync(CONSOLIDATED).mtimeMs / 1000);
if (consolidatedMtime <= lastSync) {
    console.log('No changes detected since last sync.');
    process.exit(0);
}

// Read and parse JSON
let data;
try {
    data = JSON.parse(fs.readFileSync(CONSOLIDATED, 'utf8'));
} catch (e) {
    console.error('Failed to parse memory_consolidated.json:', e.message);
    process.exit(1);
}

// Ensure memory directory exists
const memoryDir = path.dirname(OUTPUT);
if (!fs.existsSync(memoryDir)) {
    fs.mkdirSync(memoryDir, { recursive: true });
}

// Append to consolidated.md
const now = new Date();
const header = `\n## Consolidated Memory Sync – ${now.toISOString().slice(0, 19).replace('T', ' ')} UTC\n\n`;
let content = header;

// Extract recent entries (last 5) from the "entries" array if exists
if (data.entries && Array.isArray(data.entries)) {
    const recent = data.entries.slice(-5);
    recent.forEach((entry, idx) => {
        content += `### ${idx + 1}. ${entry.topic || 'Untitled'}\n`;
        content += `Date: ${entry.date || 'unknown'}\n\n`;
        if (entry.key_points && Array.isArray(entry.key_points)) {
            entry.key_points.forEach(point => {
                content += `- ${point}\n`;
            });
        }
        content += '\n';
    });
}

fs.appendFileSync(OUTPUT, content);

// Update timestamp
fs.writeFileSync(TIMESTAMP_FILE, consolidatedMtime.toString());
console.log(`Synced new entries to ${OUTPUT}`);

// Ensure MEMORY.md exists
const memoryFile = path.join(WORKSPACE, 'MEMORY.md');
if (!fs.existsSync(memoryFile)) {
    const initial = `# MEMORY.md – Curated Long‑Term Memory

*Created: ${now.toISOString().slice(0, 10)}*

This file is the curated single point of truth. Raw consolidated data is synchronized to \`memory/consolidated.md\`.

`;
    fs.writeFileSync(memoryFile, initial);
}