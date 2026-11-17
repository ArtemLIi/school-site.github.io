// ===== СИСТЕМА АВТОРИЗАЦИИ =====
var TEACHER_PASSWORD = 'teacher123';

function checkAuth() {
    return localStorage.getItem('teacherAuth') === 'true';
}

function showLogin() {
    document.getElementById('login-modal').classList.add('active');
    document.getElementById('teacher-password').value = '';
    document.getElementById('login-error').style.display = 'none';
    document.getElementById('teacher-password').focus();
}

function closeLogin() {
    document.getElementById('login-modal').classList.remove('active');
}

function doLogin() {
    var pass = document.getElementById('teacher-password').value;
    if (pass === TEACHER_PASSWORD) {
        localStorage.setItem('teacherAuth', 'true');
        closeLogin();
        renderAll();
    } else {
        document.getElementById('login-error').style.display = 'block';
    }
}
function logout() {
    localStorage.setItem('teacherAuth', 'false');
    renderAll();
}

function isAdmin() {
    return checkAuth();
}

// Закрытие модалки по клику вне окна
document.addEventListener('click', function(e) {
    if (e.target.id === 'login-modal') closeLogin();
});

// Enter в поле пароля
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && document.getElementById('login-modal').classList.contains('active')) {
        doLogin();
    }
});

// ===== НАВИГАЦИЯ =====
function toggleMenu() {
    document.querySelector('.nav-links').classList.toggle('active');
}

document.querySelectorAll('.nav-links a').forEach(function(link) {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        var target = this.getAttribute('href').substring(1);
        document.querySelectorAll('.section').forEach(function(s) { s.classList.remove('active'); });
        document.getElementById(target).classList.add('active');
        document.querySelector('.nav-links').classList.remove('active');
    });
});

// ===== ТЁМНАЯ ТЕМА =====
function toggleTheme() {
    var body = document.body;
    var btn = document.querySelector('.theme-toggle');
    if (body.getAttribute('data-theme') === 'dark') {
        body.removeAttribute('data-theme');
        btn.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        btn.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    }
}

if (localStorage.getItem('theme') === 'dark') {
    document.body.setAttribute('data-theme', 'dark');
    document.querySelector('.theme-toggle').textContent = '☀️';
}

// ===== ОБЩИЕ ФУНКЦИИ =====
function getData(key) {
    return JSON.parse(localStorage.getItem(key) || '[]');
}

function setData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('ru-RU');
}

function deleteItem(key, index) {
    if (!isAdmin()) return;
    var data = getData(key);
    data.splice(index, 1);
    setData(key, data);
    renderAll();
}

function closePoll(key, index) {
    if (!isAdmin()) return;
    var data = getData(key);
    data[index].closed = !data[index].closed;
    setData(key, data);
    renderAll();
}

// ===== ДОСКА ОБЪЯВЛЕНИЙ =====
function addAnnouncement() {
    var text = document.getElementById('announcement-text').value.trim();
    if (!text) return;
    var data = getData('announcements');
    data.unshift({ text: text, date: new Date().toISOString() });
    setData('announcements', data);
    document.getElementById('announcement-text').value = '';
    renderAnnouncements();
}

function renderAnnouncements() {
    var data = getData('announcements');
    var container = document.getElementById('announcements');
    container.innerHTML = '';
    data.forEach(function(item, i) {
        var div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = '<div class="card-header"><span class="card-date">' + formatDate(item.date) + '</span>' + (isAdmin() ? '<button class="delete-btn" onclick="deleteItem(\'announcements\', ' + i + ')">✕</button>' : '') + '</div><p class="card-text">' + item.text + '</p>';
        container.appendChild(div);
    });
}

// ===== КАЛЕНДАРЬ =====
function addEvent() {
    var date = document.getElementById('event-date').value;
    var title = document.getElementById('event-title').value.trim();
    var type = document.getElementById('event-type').value;
    if (!date || !title) return;
    var data = getData('events');
    data.push({ date: date, title: title, type: type });
    setData('events', data);
    document.getElementById('event-date').value = '';
    document.getElementById('event-title').value = '';
    renderEvents();
}

function renderEvents() {
    var data = getData('events').sort(function(a, b) { return new Date(a.date) - new Date(b.date); });
    var container = document.getElementById('calendar-events');
    var typeLabels = { control: '📝 Контрольная', project: '📁 Проект', holiday: '🎉 Праздник', vacation: '🏖 Каникулы' };
    container.innerHTML = '';
    data.forEach(function(item, i) {
        var div = document.createElement('div');
        div.className = 'card event-' + item.type;
        div.innerHTML = '<div class="card-header"><span class="card-date">' + formatDate(item.date) + ' — ' + (typeLabels[item.type] || '') + '</span>' + (isAdmin() ? '<button class="delete-btn" onclick="deleteItem(\'events\', ' + i + ')">✕</button>' : '') + '</div><p class="card-text">' + item.title + '</p>';
        container.appendChild(div);
    });
}

// ===== ДОМАШНЕЕ ЗАДАНИЕ =====
function addHomework() {
    var subject = document.getElementById('hw-subject').value.trim();
    var date = document.getElementById('hw-date').value;
    var text = document.getElementById('hw-text').value.trim();
    if (!subject || !text) return;
    var data = getData('homework');
    data.unshift({ subject: subject, date: date, text: text });
    setData('homework', data);
    document.getElementById('hw-subject').value = '';
    document.getElementById('hw-date').value = '';
    document.getElementById('hw-text').value = '';
    renderHomework();
}

function renderHomework() {
    var data = getData('homework');
    var container = document.getElementById('homework-list');
    container.innerHTML = '';
    data.forEach(function(item, i) {
        var div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = '<div class="card-header"><strong>' + item.subject + '</strong><span class="card-date">' + (item.date ? formatDate(item.date) : 'Без срока') + '</span>' + (isAdmin() ? '<button class="delete-btn" onclick="deleteItem(\'homework\', ' + i + ')">✕</button>' : '') + '</div><p class="card-text">' + item.text + '</p>';
        container.appendChild(div);
    });
}

// ===== ОПРОСЫ =====
function addPollOption() {
    var container = document.getElementById('poll-options');
    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'poll-option';
    input.placeholder = 'Вариант ' + (container.children.length + 1);
    container.appendChild(input);
}

function createPoll() {
    var question = document.getElementById('poll-question').value.trim();
    var optionInputs = document.querySelectorAll('.poll-option');
    var options = [];
    for (var i = 0; i < optionInputs.length; i++) {
        if (optionInputs[i].value.trim()) options.push(optionInputs[i].value.trim());
    }
    if (!question || options.length < 2) return;
    var data = getData('polls');
    var votes = [];
    for (var i = 0; i < options.length; i++) votes.push(0);
    data.unshift({ question: question, options: options, votes: votes, closed: false });
    setData('polls', data);
    document.getElementById('poll-question').value = '';
    for (var i = 0; i < optionInputs.length; i++) optionInputs[i].value = '';
    renderPolls();
}

function renderPolls() {
    var data = getData('polls');
    var container = document.getElementById('polls-container');
    container.innerHTML = '';
    data.forEach(function(poll, pi) {
        var total = poll.votes.reduce(function(a, b) { return a + b; }, 0) || 1;
        var div = document.createElement('div');
        div.className = 'card';
        var html = '<p><strong>' + poll.question + '</strong> ' + (poll.closed ? '<em>(Опрос закрыт)</em>' : '') + '</p>';
        for (var i = 0; i < poll.options.length; i++) {
            var pct = Math.round((poll.votes[i] || 0) / total * 100);
            var clickHandler = poll.closed ? '' : 'onclick="votePoll(' + pi + ', ' + i + ')"';
            html += '<div class="poll-option" ' + clickHandler + ' style="' + (poll.closed ? 'cursor:default;opacity:0.7' : 'cursor:pointer') + '">';
            html += '<span>' + poll.options[i] + '</span><span>' + pct + '%</span>';
            html += '<div class="poll-progress"><div class="poll-progress-bar" style="width:' + pct + '%"></div></div>';
            html += '</div>';
        }
        if (isAdmin()) {
            html += '<div style="margin-top:0.5rem">' +
                '<button class="delete-btn" onclick="closePoll(\'polls\', ' + pi + ')">' + (poll.closed ? 'Открыть' : 'Закрыть') + '</button> ' +
                '<button class="delete-btn" onclick="deleteItem(\'polls\', ' + pi + ')">Удалить</button>' +
                '</div>';
        }
        div.innerHTML = html;
        container.appendChild(div);
    });
}

function votePoll(pi, oi) {
    var data = getData('polls');
    if (data[pi].closed) return;
    data[pi].votes[oi]++;
    setData('polls', data);
    renderPolls();
}

// ===== БИБЛИОТЕКА =====
function addResource() {
    var title = document.getElementById('resource-title').value.trim();
    var url = document.getElementById('resource-url').value.trim();
    var type = document.getElementById('resource-type').value;
    if (!title || !url) return;
    var data = getData('resources');
    data.push({ title: title, url: url, type: type });
    setData('resources', data);
    document.getElementById('resource-title').value = '';
    document.getElementById('resource-url').value = '';
    renderResources();
}

function renderResources() {
    var data = getData('resources');
    var container = document.getElementById('resources-container');
    var typeLabels = { site: '🌐 Сайт', video: '🎬 Видео', notes: '📝 Конспект', prep: '📖 Подготовка' };
    container.innerHTML = '';
    data.forEach(function(item, i) {
        var div = document.createElement('div');
        div.className = 'card resource-card';
        div.innerHTML = '<div><a href="' + item.url + '" target="_blank" class="resource-link">' + item.title + '</a> <span class="resource-type">' + (typeLabels[item.type] || '') + '</span></div>' + (isAdmin() ? '<button class="delete-btn" onclick="deleteItem(\'resources\', ' + i + ')">✕</button>' : '');
        container.appendChild(div);
    });
}

// ===== ДОСТИЖЕНИЯ =====
function addAchievement() {
    var title = document.getElementById('achievement-title').value.trim();
    var desc = document.getElementById('achievement-desc').value.trim();
    if (!title) return;
    var data = getData('achievements');
    data.unshift({ title: title, desc: desc });
    setData('achievements', data);
    document.getElementById('achievement-title').value = '';
    document.getElementById('achievement-desc').value = '';
    renderAchievements();
}

function renderAchievements() {
    var data = getData('achievements');
    var container = document.getElementById('achievements-list');
    container.innerHTML = '';
    data.forEach(function(item, i) {
        var div = document.createElement('div');
        div.className = 'card achievement-card';
        div.innerHTML = '<div class="card-header"><strong>🏅 ' + item.title + '</strong>' + (isAdmin() ? '<button class="delete-btn" onclick="deleteItem(\'achievements\', ' + i + ')">✕</button>' : '') + '</div>' + (item.desc ? '<p class="card-text">' + item.desc + '</p>' : '');
        container.appendChild(div);
    });
}

// ===== КОНКУРСЫ =====
function addCompetition() {
    var title = document.getElementById('competition-title').value.trim();
    var points = parseInt(document.getElementById('competition-points').value) || 0;
    if (!title) return;
    var data = getData('competitions');
    data.push({ title: title, points: points });
    setData('competitions', data);
    document.getElementById('competition-title').value = '';
    document.getElementById('competition-points').value = '';
    renderCompetitions();
}

function renderCompetitions() {
    var data = getData('competitions').sort(function(a, b) { return b.points - a.points; });
    var container = document.getElementById('competitions-list');
    container.innerHTML = '';
    data.forEach(function(item, i) {
        var div = document.createElement('div');
        div.className = 'card competition-card';
        div.innerHTML = '<div class="card-header"><strong>' + item.title + '</strong><span class="competition-points">' + item.points + ' баллов</span>' + (isAdmin() ? '<button class="delete-btn" onclick="deleteItem(\'competitions\', ' + i + ')">✕</button>' : '') + '</div>';
        container.appendChild(div);
    });
}

// ===== РАСПИСАНИЕ =====
function addSchedule() {
    var day = document.getElementById('schedule-day').value;
    var lesson = parseInt(document.getElementById('schedule-lesson').value);
    var subject = document.getElementById('schedule-subject').value;
    
    if (!day || !lesson || !subject) {
        alert('Заполните все поля!');
        return;
    }
    
    var data = getData('schedule');
    data.push({ day: day, lesson: lesson, subject: subject });
    setData('schedule', data);
    
    document.getElementById('schedule-lesson').value = '';
    document.getElementById('schedule-subject').value = '';
    renderSchedule();
}

function renderSchedule() {
    var data = getData('schedule');
    var container = document.getElementById('schedule-container');
    var days = {};
    
    data.forEach(function(item) {
        if (!days[item.day]) days[item.day] = [];
        days[item.day].push(item);
    });
    
    var dayOrder = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
    
    container.innerHTML = '';
    
    dayOrder.forEach(function(day) {
        if (days[day]) {
            days[day].sort(function(a, b) { return a.lesson - b.lesson; });
            
            var div = document.createElement('div');
            div.className = 'schedule-day-card';
            
            var lessonsHtml = '';
            days[day].forEach(function(item, i) {
                lessonsHtml += '<div class="schedule-lesson">';
                lessonsHtml += '<span class="lesson-number">' + item.lesson + '</span>';
                lessonsHtml += '<span class="lesson-subject">' + item.subject + '</span>';
                lessonsHtml += ' <button class="schedule-delete-btn" onclick="deleteSchedule(' + i + ')">✕</button>';
                lessonsHtml += '</div>';
            });
            
            div.innerHTML = '<div class="schedule-day-header"><strong>' + day + '</strong></div>' + lessonsHtml;
            container.appendChild(div);
        }
    });
}

function deleteSchedule(index) {
    var data = getData('schedule');
    data.splice(index, 1);
    setData('schedule', data);
    renderSchedule();
}
// ===== КОШЕЛЁК =====
function addTransaction() {
    var type = document.getElementById('transaction-type').value;
    var amount = parseFloat(document.getElementById('transaction-amount').value) || 0;
    var desc = document.getElementById('transaction-desc').value.trim();
    if (amount <= 0) return;
    var data = getData('transactions');
    data.unshift({ type: type, amount: amount, desc: desc, date: new Date().toISOString() });
    setData('transactions', data);
    document.getElementById('transaction-amount').value = '';
    document.getElementById('transaction-desc').value = '';
    renderWallet();
}

function renderWallet() {
    var data = getData('transactions');
    var balance = data.reduce(function(sum, t) { return sum + (t.type === 'income' ? t.amount : -t.amount); }, 0);
    document.getElementById('wallet-balance').textContent = balance;
    var container = document.getElementById('transactions-container');
    container.innerHTML = '';
    data.forEach(function(item, i) {
        var div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = '<div class="card-header"><span class="card-date">' + formatDate(item.date) + '</span>' + (isAdmin() ? '<button class="delete-btn" onclick="deleteItem(\'transactions\', ' + i + ')">✕</button>' : '') + '</div><p class="card-text"><span class="' + (item.type === 'income' ? 'transaction-income' : 'transaction-expense') + '">' + (item.type === 'income' ? '+' : '-') + item.amount + ' ₽</span>' + (item.desc ? ' — ' + item.desc : '') + '</p>';
        container.appendChild(div);
    });
}

// ===== ИМЕНИННИКИ =====
function addBirthday() {
    var name = document.getElementById('birthday-name').value.trim();
    var date = document.getElementById('birthday-date').value;
    if (!name || !date) return;
    var data = getData('birthdays');
    data.push({ name: name, date: date });
    setData('birthdays', data);
    document.getElementById('birthday-name').value = '';
    document.getElementById('birthday-date').value = '';
    renderBirthdays();
}

function renderBirthdays() {
    var data = getData('birthdays');
    var today = new Date();
    var container = document.getElementById('birthdays-container');
    data.sort(function(a, b) {
        var da = new Date(today.getFullYear(), new Date(a.date).getMonth(), new Date(a.date).getDate());
        var db = new Date(today.getFullYear(), new Date(b.date).getMonth(), new Date(b.date).getDate());
        if (da < today) da.setFullYear(today.getFullYear() + 1);
        if (db < today) db.setFullYear(today.getFullYear() + 1);
        return da - db;
    });
    container.innerHTML = '';
    data.forEach(function(item, i) {
        var div = document.createElement('div');
        div.className = 'card birthday-card';
        div.innerHTML = '<p class="card-text">🎂 ' + item.name + '</p><p class="birthday-date">' + formatDate(item.date) + '</p>' + (isAdmin() ? '<button class="delete-btn" onclick="deleteItem(\'birthdays\', ' + i + ')" style="margin-top:0.5rem;background:rgba(0,0,0,0.2)">✕</button>' : '');
        container.appendChild(div);
    });
}

// ===== РЕЙТИНГ =====
function addRating() {
    var name = document.getElementById('rating-name').value.trim();
    var subject = document.getElementById('rating-subject').value.trim();
    var score = parseInt(document.getElementById('rating-score').value) || 0;
    if (!name || !subject) return;
    var data = getData('ratings');
    data.push({ name: name, subject: subject, score: score });
    setData('ratings', data);
    document.getElementById('rating-name').value = '';
    document.getElementById('rating-subject').value = '';
    document.getElementById('rating-score').value = '';
    renderRatings();
}

function renderRatings() {
    var data = getData('ratings');
    var container = document.getElementById('rating-container');
    var subjects = {};
    data.forEach(function(item) {
        if (!subjects[item.subject]) subjects[item.subject] = [];
        subjects[item.subject].push(item.score);
    });
    var results = [];
    for (var subject in subjects) {
        var scores = subjects[subject];
        var avg = (scores.reduce(function(a, b) { return a + b; }, 0) / scores.length).toFixed(1);
        results.push({ subject: subject, avg: avg, count: scores.length });
    }
    results.sort(function(a, b) { return b.avg - a.avg; });
    container.innerHTML = '';
    results.forEach(function(item, i) {
        var div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = '<div class="card-header"><strong>' + (i + 1) + '. ' + item.subject + '</strong><span class="card-date">Средний балл: ' + item.avg + ' (' + item.count + ' оценок)</span></div>';
        container.appendChild(div);
    });
}

// ===== ТАЙМЕР =====
function updateCountdown() {
    var events = getData('events');
    var controls = events.filter(function(e) { return e.type === 'control'; });
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var nearest = null;
    controls.forEach(function(event) {
        var eventDate = new Date(event.date);
        eventDate.setHours(0, 0, 0, 0);
        if (eventDate > today) {
            if (!nearest || eventDate < nearest.date) {
                nearest = { title: event.title, date: eventDate };
            }
        }
    });
    var container = document.getElementById('countdown');
    if (!nearest) {
        container.innerHTML = '<p>Нет ближайших контрольных 🎉</p>';
        return;
    }
    var diff = Math.ceil((nearest.date - today) / (1000 * 60 * 60 * 24));
    if (diff === 0) {
        container.innerHTML = '<p>Сегодня контрольная: ' + nearest.title + '! Удачи! 🍀</p>';
    } else if (diff === 1) {
        container.innerHTML = '<p>Завтра контрольная: ' + nearest.title + '! Учи! 📚</p>';
    } else {
        container.innerHTML = '<div class="countdown"><div class="countdown-item"><span>' + diff + '</span><small>дней</small></div><div class="countdown-item"><span>' + nearest.title + '</span><small>осталось</small></div></div>';
    }
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
function renderAll() {
    renderAnnouncements();
    renderEvents();
    renderHomework();
    renderPolls();
    renderResources();
    renderAchievements();
    renderCompetitions();
    renderWallet();
    renderBirthdays();
    renderRatings();
    renderCalculator();
    renderSchedule();
    updateCountdown();
    updateAuthButtons();
}

function updateAuthButtons() {
    var loginBtn = document.getElementById('teacher-login-btn');
    var logoutBtn = document.getElementById('teacher-logout-btn');
    if (isAdmin()) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        document.body.classList.add('authenticated');
    } else {
        loginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
        document.body.classList.remove('authenticated');
    }
}

// ===== КАЛЬКУЛЯТОР ОЦЕНОК =====
function addGrade() {
    var subject = document.getElementById('calc-subject').value.trim();
    var grade = parseInt(document.getElementById('calc-grade').value);
    if (!subject || !grade || grade < 2 || grade > 5) {
        alert('Введите предмет и оценку (2-5)!');
        return;
    }
    var data = getData('grades');
    data.push({ subject: subject, grade: grade, date: new Date().toISOString() });
    setData('grades', data);
    document.getElementById('calc-subject').value = '';
    document.getElementById('calc-grade').value = '';
    renderCalculator();
}

function renderCalculator() {
    var data = getData('grades');
    var container = document.getElementById('calc-results');
    var subjects = {};
    
    data.forEach(function(item) {
        if (!subjects[item.subject]) subjects[item.subject] = [];
        subjects[item.subject].push(item);
    });
    
    container.innerHTML = '';
    
    for (var subject in subjects) {
        var grades = subjects[subject];
        var sum = 0;
        grades.forEach(function(g) { sum += g.grade; });
        var avg = (sum / grades.length).toFixed(2);
        
        var div = document.createElement('div');
        div.className = 'calc-subject-card';
        
        var gradesHtml = '<div class="calc-grade-list">';
        grades.forEach(function(g, i) {
            var gradeClass = 'calc-grade-' + g.grade;
            gradesHtml += '<span class="calc-grade ' + gradeClass + '">' + g.grade + '</span>';
            gradesHtml += ' <button class="calc-delete-btn" onclick="deleteGrade(' + i + ')">✕</button>';
        });
        gradesHtml += '</div>';
        
        div.innerHTML = '<div class="calc-subject-header"><strong>' + subject + '</strong><span class="calc-average">Средний: ' + avg + '</span></div>' + gradesHtml;
        container.appendChild(div);
    }
}

function deleteGrade(index) {
    var data = getData('grades');
    data.splice(index, 1);
    setData('grades', data);
    renderCalculator();
}

function togglePassword() {
    var passInput = document.getElementById('teacher-password');
    var toggleBtn = document.querySelector('.toggle-password');
    if (passInput.type === 'password') {
        passInput.type = 'text';
        toggleBtn.textContent = '✕';
    } else {
        passInput.type = 'password';
        toggleBtn.textContent = '👁';
    }
}

renderAll();
setInterval(updateCountdown, 60000);

