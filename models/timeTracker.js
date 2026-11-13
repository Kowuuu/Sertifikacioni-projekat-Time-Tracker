

const tasks = [];

// Create a new task
function createNewTask (req,res,next) {
    const name = req.body.taskName;

    if (name && name.trim()) {
        const task = {
            id: crypto.randomUUID(),
            name: name.trim(),
            elapsedTime: 0,  // Total time in milliseconds
            startedAt: null, // Timestamp when timer started
            isRunning: false
        };

        tasks.push(task);
        next();
    }
}

// Start a specific task's timer
function startTimer(req,res,next) {
    const task = tasks.find(task => task.id === req.params.id);
    if (!task) {
        throw new Error("Task not found");
    }
    if (task.isRunning) {
        return; // Already running
    }
    task.startedAt = Date.now();
    task.isRunning = true;
    next();
}

// Stop a specific task's timer
function stopTimer(req,res,next) {
    const task = tasks.find(task => task.id === req.params.id);
    if (!task) {
        throw new Error("Task not found");
    }
    if (!task.isRunning) {
        return; // Already stopped
    }
    task.elapsedTime += Date.now() - task.startedAt;
    task.startedAt = null;
    task.isRunning = false;
    next();
}

// Delete a task
function deleteTask(req,res,next) {
    const index = tasks.findIndex(task => task.id === req.params.id);

    if (index === -1) {
        throw new Error("Task not found");
    }

    tasks.splice(index, 1);
    next();
}

// Get total elapsed time, including a running timer
function getElapsedTime(taskId) {
    const task = tasks.find(task => task.id === taskId);

    if (!task) {
        throw new Error("Task not found");
    }

    if (task.isRunning) {
        return task.elapsedTime + (Date.now() - task.startedAt);
    }

    return task.elapsedTime;
}

// Format milliseconds as HH:MM:SS
function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [
        hours,
        minutes,
        seconds
    ].map(value => String(value).padStart(2, "0")).join(":");
}

module.exports = {formatTime,getElapsedTime,startTimer,stopTimer, deleteTask, createNewTask, tasks };