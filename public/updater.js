const STORAGE_KEY = 'myTasks';
const user=localStorage.getItem('currentUserEmail') || null;
let tasks = JSON.parse(localStorage.getItem(user)) || [];

function saveTasks() {
    localStorage.setItem(user, JSON.stringify(tasks));
}

function createNewTask(title) {
    if (title && title.trim()) {
        const task = {
            id: crypto.randomUUID(),
            name: title.trim(),
            sessions: [],
            startedAt: null,
        };
        tasks.push(task);
        saveTasks();
        renderTask(task);
        updateStatistics();
        return task;
    }
}

function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasks();
    element = document.getElementById(`task-${taskId}`);
    if (element) {
        element.remove();
    }
    updateStatistics();
}

function stopTimer(taskId) {
    const task = tasks.find(task => task.id === taskId);
    if (!task) {
        throw new Error("Task not found");
    }
    if (!task || task.startedAt === null) {
        return;
    }
    endedAt = Date.now()
    task.sessions.push({
        startedAt: task.startedAt,
        endedAt: endedAt
    });
    task.startedAt = null;
    saveTasks();
    updateTaskControls(task);
    updateStatistics();
}

function startTimer(taskId) {
    const task = tasks.find(task => task.id === taskId);
    if (!task) {
        throw new Error("Task not found");
    }
    if (!task || task.startedAt !== null) {
        return;
    }
    task.startedAt = Date.now();
    saveTasks();
    updateTaskControls(task);
}

function getElapsedTime(task) {
    let total = 0;
    task.sessions.forEach(session => {
        total += session.endedAt -
            session.startedAt;
    });
    if (task.startedAt !== null) {
        total += Date.now() - task.startedAt;
    }
    return total;
}

function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor(
        (totalSeconds % 3600) / 60
    );
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds]
        .map(value => String(value).padStart(2, '0'))
        .join(':');
}

function renderTask(task) {
    const container = document.getElementById('tasks-container');

    const div = document.createElement('div');
    div.className = 'task';
    div.id = `task-${task.id}`;

    const title = document.createElement('h3');
    title.textContent = task.name;

    const timer = document.createElement('p');
    timer.className = 'timer';
    timer.id = `timer-${task.id}`;

    const controls = document.createElement('div');
    controls.className = 'controls';

    const startButton = document.createElement('button');
    startButton.textContent = 'Start';
    startButton.className = 'start';
    startButton.addEventListener('click', () => {
        startTimer(task.id);
    });

    const stopButton = document.createElement('button');
    stopButton.textContent = 'Stop';
    stopButton.className = 'stop';
    stopButton.addEventListener('click', () => {
        stopTimer(task.id);
    });

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'delete';
    deleteButton.addEventListener('click', () => {
        deleteTask(task.id);
    });

    controls.append(startButton, stopButton, deleteButton);
    div.append(title, timer, controls);
    container.appendChild(div);

    updateTaskControls(task);
    updateTimer(task);
}
function updateTaskControls(task) {
    const startButton = document.querySelector(`#task-${task.id} .start`);
    const stopButton = document.querySelector(`#task-${task.id} .stop`);

    if (task.startedAt !== null) {
        startButton.disabled = true;
        stopButton.disabled = false;
    } else {
        startButton.disabled = false;
        stopButton.disabled = true;
    }
}

function updateTimer(task) {
    const timerElement = document.getElementById(`timer-${task.id}`);
    if (!timerElement) return;
    if (timerElement) {
        timerElement.textContent = formatTime(getElapsedTime(task));
    }
}
function updateAllTimers() {
    tasks.forEach(task => {
        updateTimer(task);
    });
}

function getTimeInRange(startDate, endDate) {
    let total = 0;
    tasks.forEach(task => {
        const sessions = [...task.sessions];
        if (task.startedAt !== null) {
            sessions.push({
                startedAt: task.startedAt,
                endedAt: Date.now()
            });
        }
        sessions.forEach(session => {
            // Find the overlapping part of the session
            const overlapStart = Math.max(
                session.startedAt,
                startDate
            );
            const overlapEnd = Math.min(
                session.endedAt,
                endDate
            );
            if (overlapEnd > overlapStart) {
                total += overlapEnd - overlapStart;
            }
        });
    });
    return total;
}

function updateStatistics() {
    const now = Date.now();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekStart = new Date(today);
    weekStart.setDate(
        weekStart.getDate() - 6
    );
    const monthStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
    );
    const dailyTime = getTimeInRange(
        today.getTime(),
        now
    );
    const weeklyTime = getTimeInRange(
        weekStart.getTime(),
        now
    );
    const monthlyTime = getTimeInRange(
        monthStart.getTime(),
        now
    );
    const totalTime = tasks.reduce(
        (sum, task) => sum + getElapsedTime(task),
        0
    );
    const averageTime = tasks.length > 0
        ? totalTime / tasks.length
        : 0;
    document.getElementById('daily-time').textContent =
        formatTime(dailyTime);
    document.getElementById('weekly-time').textContent =
        formatTime(weeklyTime);
    document.getElementById('monthly-time').textContent =
        formatTime(monthlyTime);
    document.getElementById('average-time').textContent =
        formatTime(averageTime);
}

setInterval(() => {
    updateAllTimers();
    updateStatistics();
}, 1000);

taskForm=document.getElementById('task-form');
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('task-name');
    const name = input.value;
    if (name && name.trim()) {
        createNewTask(name);
        input.value = '';
    }
});

tasks.forEach(task => {
    renderTask(task);
});
updateStatistics();
updateAllTimers();











