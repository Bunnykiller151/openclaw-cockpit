#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const WORKSPACE = '/data/workspace';
const CONSOLIDATED = path.join(WORKSPACE, 'memory_consolidated.json');
const OUTPUT = path.join(WORKSPACE, 'memory/consolidated_full.md');
const TIMESTAMP_FILE = path.join(WORKSPACE, '.last_sync_memory_full');

if (!fs.existsSync(CONSOLIDATED)) {
    console.error('memory_consolidated.json not found.');
    process.exit(0);
}

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

let data;
try {
    data = JSON.parse(fs.readFileSync(CONSOLIDATED, 'utf8'));
} catch (e) {
    console.error('Failed to parse memory_consolidated.json:', e.message);
    process.exit(1);
}

const memoryDir = path.dirname(OUTPUT);
if (!fs.existsSync(memoryDir)) {
    fs.mkdirSync(memoryDir, { recursive: true });
}

const now = new Date();
let output = `# Consolidated Memory – Full Export\n\n*Generated: ${now.toISOString().slice(0, 19).replace('T', ' ')} UTC*\n\n`;

// Metadata
if (data.metadata) {
    output += `## Metadata\n`;
    output += `- **Version:** ${data.metadata.version || 'unknown'}\n`;
    output += `- **Created:** ${data.metadata.created_at || 'unknown'}\n`;
    output += `- **Purpose:** ${data.metadata.purpose || ''}\n`;
    output += `- **Sources:** ${(data.metadata.sources || []).join(', ')}\n\n`;
}

// Architecture
if (data.architecture) {
    output += `## Architecture\n`;
    if (data.architecture.deployment) {
        output += `### Deployment\n`;
        const d = data.architecture.deployment;
        output += `- **Platform:** ${d.platform || ''}\n`;
        output += `- **Environment:** ${d.environment || ''}\n`;
        output += `- **Exposure:** ${d.exposure || ''}\n`;
        if (d.containers && Array.isArray(d.containers)) {
            d.containers.forEach(c => {
                output += `- **${c.name}:** ${c.url || ''} (${c.purpose || ''})\n`;
            });
        }
        output += `- **Persistent storage:** ${d.persistent_storage ? 'Yes' : 'No'}\n`;
        output += `- **Note:** ${d.note || ''}\n`;
    }
    if (data.architecture.github) {
        output += `### GitHub\n`;
        const g = data.architecture.github;
        output += `- **Repository:** [${g.repository}](${g.url || ''})\n`;
        output += `- **Deployment flow:** ${g.deployment_flow || ''}\n`;
        output += `- **Current state:** ${g.current_state || ''}\n`;
        if (g.last_commits && Array.isArray(g.last_commits)) {
            output += `- **Last commits:**\n`;
            g.last_commits.forEach(commit => output += `  - ${commit}\n`);
        }
    }
    if (data.architecture.data_flow) {
        output += `### Data Flow\n`;
        output += `${data.architecture.data_flow}\n`;
    }
    output += `\n`;
}

// Security audit findings
if (data.security_audit_findings && Array.isArray(data.security_audit_findings)) {
    output += `## Security Audit Findings\n`;
    data.security_audit_findings.forEach(f => {
        output += `### ${f.issue}\n`;
        output += `- **Details:** ${f.details}\n`;
        output += `- **Severity:** ${f.severity}\n`;
    });
    output += `\n`;
}

// Update status
if (data.update_status) {
    output += `## Update Status\n`;
    output += `- **Current:** ${data.update_status.current}\n`;
    output += `- **Available:** ${data.update_status.available}\n`;
    output += `- **Recommendation:** ${data.update_status.recommendation}\n\n`;
}

// Missing measures
if (data.missing_measures && Array.isArray(data.missing_measures)) {
    output += `## Missing Security Measures\n`;
    data.missing_measures.forEach(m => output += `- ${m}\n`);
    output += `\n`;
}

// Risk profile
if (data.risk_profile) {
    output += `## Risk Profile\n${data.risk_profile}\n\n`;
}

// Conversations
if (data.conversations && Array.isArray(data.conversations)) {
    output += `## Conversations\n`;
    data.conversations.forEach((conv, idx) => {
        output += `### ${idx + 1}. ${conv.topic || 'Untitled'} (${conv.date || 'unknown date'})\n`;
        if (conv.video_url) output += `- **Video:** ${conv.video_url}\n`;
        if (conv.source) output += `- **Source:** ${conv.source}\n`;
        if (conv.key_insights && Array.isArray(conv.key_insights)) {
            output += `- **Key insights:**\n`;
            conv.key_insights.forEach(insight => output += `  - ${insight}\n`);
        }
        if (conv.technical_implications && Array.isArray(conv.technical_implications)) {
            output += `- **Technical implications:**\n`;
            conv.technical_implications.forEach(imp => output += `  - ${imp}\n`);
        }
        if (conv.relevance_to_our_discussion) {
            output += `- **Relevance:** ${conv.relevance_to_our_discussion}\n`;
        }
        if (conv.action_items && Array.isArray(conv.action_items)) {
            output += `- **Action items:**\n`;
            conv.action_items.forEach(item => output += `  - ${item}\n`);
        }
        output += `\n`;
    });
}

// Rules and principles
if (data.rules_and_principles) {
    output += `## Rules & Principles\n`;
    Object.keys(data.rules_and_principles).forEach(category => {
        output += `### ${category.replace('_', ' ')}\n`;
        const items = data.rules_and_principles[category];
        if (Array.isArray(items)) {
            items.forEach(item => output += `- ${item}\n`);
        }
        output += `\n`;
    });
}

// Agent configuration
if (data.agent_configuration && Array.isArray(data.agent_configuration)) {
    output += `## Agent Configuration\n`;
    output += `| ID | Name | Role | Model | Status |\n`;
    output += `|----|------|------|-------|--------|\n`;
    data.agent_configuration.forEach(agent => {
        output += `| ${agent.id || ''} | ${agent.name || ''} | ${agent.role || ''} | ${agent.model || ''} | ${agent.status || ''} |\n`;
    });
    output += `\n`;
}

// Cron jobs
if (data.cron_jobs && Array.isArray(data.cron_jobs)) {
    output += `## Cron Jobs\n`;
    data.cron_jobs.forEach(job => {
        output += `- **${job.name}** – ${job.schedule || ''} (next: ${job.next_run || ''}, last: ${job.last_run || ''}, status: ${job.status || ''})\n`;
    });
    output += `\n`;
}

// Memory architecture
if (data.memory_architecture) {
    output += `## Memory Architecture\n`;
    output += `${data.memory_architecture}\n\n`;
}

// Current priorities
if (data.current_priorities && Array.isArray(data.current_priorities)) {
    output += `## Current Priorities\n`;
    data.current_priorities.forEach(p => output += `- ${p}\n`);
    output += `\n`;
}

// Compaction status
if (data.compaction_status) {
    output += `## Compaction Status\n`;
    output += `${data.compaction_status}\n\n`;
}

// Write full file (replace)
fs.writeFileSync(OUTPUT, output);

// Update timestamp
fs.writeFileSync(TIMESTAMP_FILE, consolidatedMtime.toString());
console.log(`Full memory sync written to ${OUTPUT}`);

// Ensure MEMORY.md exists
const memoryFile = path.join(WORKSPACE, 'MEMORY.md');
if (!fs.existsSync(memoryFile)) {
    const initial = `# MEMORY.md – Curated Long‑Term Memory

*Created: ${now.toISOString().slice(0, 10)}*

This file is the curated single point of truth. Raw consolidated data is synchronized to \`memory/consolidated_full.md\`.

`;
    fs.writeFileSync(memoryFile, initial);
}