let tasks = JSON.parse(localStorage.getItem('devstack_tasks')) || [];
let filterType = 'all';
let searchQuery = '';
let editId = null;

// Theme init
if (localStorage.getItem('devstack_theme') === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    document.getElementById('themeBtn').textContent = '🌙';
} else {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.getElementById('themeBtn').textContent = '☀️';
}

function theme() {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (isLight) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('devstack_theme', 'dark');
        document.getElementById('themeBtn').textContent = '☀️';
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('devstack_theme', 'light');
        document.getElementById('themeBtn').textContent = '🌙';
    }
}

function add() {
    const input = document.getElementById('in');
    const value = input.value.trim();
    if (!value) return;
    
    tasks.unshift({
        id: Date.now(),
        text: value,
        done: false
    });
    
    save();
    input.value = '';
    input.focus();
}

function toggle(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.done = !task.done;
        save();
    }
}

function del(id) {
    tasks = tasks.filter(t => t.id !== id);
    save();
}

function edit(id) {
    editId = id;
    const task = tasks.find(t => t.id === id);
    const modal = document.getElementById('mod');
    const input = document.getElementById('ed');
    
    input.value = task.text;
    modal.classList.add('v');
    
    // Focus with delay for mobile
    setTimeout(() => {
        input.focus();
        input.select();
    }, 100);
}

function saveEdit() {
    const input = document.getElementById('ed');
    const value = input.value.trim();
    
    if (value && editId) {
        const task = tasks.find(t => t.id === editId);
        task.text = value;
        save();
    }
    
    closeEdit();
}

function closeEdit(e) {
    if (e && e.target !== e.currentTarget && !e.target.closest('.box')) return;
    
    editId = null;
    document.getElementById('mod').classList.remove('v');
}

function filter(type) {
    filterType = type;
    
    document.querySelectorAll('.filters button').forEach((btn, i) => {
        const types = ['all', 'done', 'undone'];
        btn.className = types[i] === type ? 'a' : '';
    });
    
    render();
}

function search(query) {
    searchQuery = query.toLowerCase().trim();
    render();
}

function save() {
    localStorage.setItem('devstack_tasks', JSON.stringify(tasks));
    render();
}

function render() {
    const list = document.getElementById('list');
    
    let filtered = tasks.filter(t => {
        if (filterType === 'done' && !t.done) return false;
        if (filterType === 'undone' && t.done) return false;
        if (searchQuery && !t.text.toLowerCase().includes(searchQuery)) return false;
        return true;
    });
    
    if (filtered.length === 0) {
        list.innerHTML = '<div class="empty">tasks not found</div>';
        return;
    }
    
    list.innerHTML = filtered.map(t => `
        <div class="item ${t.done ? 'done' : ''}">
            <div class="chk ${t.done ? 'x' : ''}" onclick="toggle(${t.id})">
                ${t.done ? '✓' : ''}
            </div>
            <span>${escapeHtml(t.text)}</span>
            <button onclick="edit(${t.id})">✏️</button>
            <button onclick="del(${t.id})">🗑️</button>
        </div>
    `).join('');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Event listeners - properly attached
document.getElementById('in').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        add();
    }
});

document.getElementById('ed').addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        saveEdit();
    }
    if (e.key === 'Escape') {
        closeEdit();
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeEdit();
    }
});

// Initialize
render();