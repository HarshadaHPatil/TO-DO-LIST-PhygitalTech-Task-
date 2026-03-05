// Get elements
const taskInput = document.getElementById("taskInput");
const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const taskMessage = document.getElementById("taskMessage");

// Load tasks
document.addEventListener("DOMContentLoaded", loadTasks);

// Add task
addTaskBtn.addEventListener("click", addTask);

// Enter key
taskInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    addTask();
  }
});

function addTask() {
  const taskText = taskInput.value.trim();

  if (taskText === "") {
    alert("Please enter a task");
    return;
  }

  const task = {
    text: taskText,
    completed: false,
  };

  createTaskElement(task);
  saveTask(task);

  updateMessage();

  taskInput.value = "";
}

// Create task UI
function createTaskElement(task) {
  const taskItem = document.createElement("div");
  taskItem.classList.add("task-item");
  taskItem.setAttribute("draggable", true);

  const dragHandle = document.createElement("span");
  dragHandle.classList.add("drag-handle");
  dragHandle.innerHTML = "⋮⋮";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = task.completed;

  const taskSpan = document.createElement("span");
  taskSpan.textContent = task.text;
  taskSpan.classList.add("task-text");

  if (task.completed) {
    taskSpan.style.textDecoration = "line-through";
    taskSpan.style.opacity = "0.6";
  }

  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";
  editBtn.classList.add("edit-btn");

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.classList.add("delete-btn");

  taskItem.appendChild(dragHandle);
  taskItem.appendChild(checkbox);
  taskItem.appendChild(taskSpan);
  taskItem.appendChild(editBtn);
  taskItem.appendChild(deleteBtn);

  taskList.appendChild(taskItem);

  // EDIT TASK
  editBtn.addEventListener("click", function () {
    const newTaskText = prompt("Edit your task:", taskSpan.textContent);

    if (newTaskText !== null && newTaskText.trim() !== "") {
      updateTaskText(taskSpan.textContent, newTaskText);
      taskSpan.textContent = newTaskText;
      updateTaskOrder();
    }
  });

  // DELETE TASK
  deleteBtn.addEventListener("click", function () {
    taskItem.remove();
    updateTaskOrder();
    updateMessage();
  });

  // COMPLETE TASK
  checkbox.addEventListener("change", function () {
    if (checkbox.checked) {
      taskSpan.style.textDecoration = "line-through";
      taskSpan.style.opacity = "0.6";
      updateTaskStatus(task.text, true);
    } else {
      taskSpan.style.textDecoration = "none";
      taskSpan.style.opacity = "1";
      updateTaskStatus(task.text, false);
    }
  });

  // DRAG START
  taskItem.addEventListener("dragstart", function () {
    taskItem.classList.add("dragging");
  });

  // DRAG END
  taskItem.addEventListener("dragend", function () {
    taskItem.classList.remove("dragging");
    updateTaskOrder();
  });
}

// SAVE TASK
function saveTask(task) {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  tasks.push(task);
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// LOAD TASKS
function loadTasks() {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  tasks.forEach(function (task) {
    createTaskElement(task);
  });

  updateMessage();
}

function updateMessage(filter = "all") {
  const tasks = document.querySelectorAll(".task-item");
  const completed = [...tasks].filter((t) => t.querySelector("input").checked);
  const pending = [...tasks].filter((t) => !t.querySelector("input").checked);

  if (tasks.length === 0) {
    taskMessage.textContent = "Enter your tasks";
    taskMessage.style.display = "block";
  } else if (filter === "completed" && completed.length === 0) {
    taskMessage.textContent = "No tasks are completed";
    taskMessage.style.display = "block";
  } else if (filter === "pending" && pending.length === 0) {
    taskMessage.textContent = "No tasks are pending";
    taskMessage.style.display = "block";
  } else {
    taskMessage.style.display = "none";
  }
}

// REMOVE TASK
function removeTask(taskText) {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  tasks = tasks.filter(function (task) {
    return task.text !== taskText;
  });

  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// UPDATE COMPLETED STATUS
function updateTaskStatus(taskText, status) {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  tasks.forEach(function (task) {
    if (task.text === taskText) {
      task.completed = status;
    }
  });

  localStorage.setItem("tasks", JSON.stringify(tasks));
}

// THEME TOGGLE
const themeToggle = document.getElementById("themeToggle");

themeToggle.addEventListener("click", function () {
  document.body.classList.toggle("dark-mode");

  if (document.body.classList.contains("dark-mode")) {
    localStorage.setItem("theme", "dark");
  } else {
    localStorage.setItem("theme", "light");
  }
});

// LOAD THEME
window.addEventListener("load", function () {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
  }
});

// FILTER TASKS
const filterButtons = document.querySelectorAll(".filter-btn");

filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    const filter = button.getAttribute("data-filter");
    const tasks = document.querySelectorAll(".task-item");

    tasks.forEach(function (task) {
      const checkbox = task.querySelector("input");

      if (filter === "all") {
        task.style.display = "flex";
      } else if (filter === "completed") {
        task.style.display = checkbox.checked ? "flex" : "none";
      } else if (filter === "pending") {
        task.style.display = !checkbox.checked ? "flex" : "none";
      }
    });

    updateMessage(filter);
  });
});

// DRAG REORDER
taskList.addEventListener("dragover", function (e) {
  e.preventDefault();

  const draggingTask = document.querySelector(".dragging");

  const tasks = [...taskList.querySelectorAll(".task-item:not(.dragging)")];

  let nextTask = tasks.find((task) => {
    return e.clientY <= task.offsetTop + task.offsetHeight / 2;
  });

  taskList.insertBefore(draggingTask, nextTask);
});

function updateTaskOrder() {
  const tasks = [];
  const taskElements = document.querySelectorAll(".task-item");

  taskElements.forEach(function (task) {
    const text = task.querySelector(".task-text").textContent;
    const completed = task.querySelector("input").checked;

    tasks.push({
      text: text,
      completed: completed,
    });
  });

  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function updateTaskText(oldText, newText) {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

  tasks.forEach(function (task) {
    if (task.text === oldText) {
      task.text = newText;
    }
  });

  localStorage.setItem("tasks", JSON.stringify(tasks));
}
