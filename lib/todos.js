// Simple TODO API for Cockpit
const fs = require('fs');
const path = require('path');

const TODO_FILE = path.join(__dirname, 'data', 'todos.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(TODO_FILE))) {
  fs.mkdirSync(path.dirname(TODO_FILE), { recursive: true });
}

// Load todos
function loadTodos() {
  try {
    if (fs.existsSync(TODO_FILE)) {
      return JSON.parse(fs.readFileSync(TODO_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error loading todos:', e);
  }
  return { todos: [], lastUpdated: new Date().toISOString() };
}

// Save todos
function saveTodos(data) {
  data.lastUpdated = new Date().toISOString();
  fs.writeFileSync(TODO_FILE, JSON.stringify(data, null, 2));
}

module.exports = { loadTodos, saveTodos, TODO_FILE };
