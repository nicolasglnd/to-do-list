class Task {
    static numberOfTaskCreated = 0;

    constructor(title, description, expirationTime, expirationDate) {
        this._title = title;
        this._description = description;
        this._expirationTime = expirationTime;
        this._expirationDate = expirationDate;
        Task.numberOfTaskCreated += 1;              //it adds 1 whenever a new object Task is created
        this._id = Task.numberOfTaskCreated;        //when new task created id will be that num.
    }

    get title() {
        return this._title;
    }
    set title(updatedTitle) {
        this._title = updatedTitle;
    }

    get description() {
        return this._description;
    }
    set description(updatedDescription) {
        this._description = updatedDescription;
    }

    get expirationDate() {
        return this._expirationDate;
    }
    set expirationDate(updatedExpirationDate) {
        this._expirationDate = updatedExpirationDate;
    }

    get expirationTime() {
        return this._expirationTime;
    }
    set expirationTime(updatedExpirationTime) {
        this._expirationTime = updatedExpirationTime;
    }

    get id() {              //will only have a getter not any setter.
        return this._id;
    }
}

const openAddTaskButton = document.querySelectorAll("[data-add-target]");
const closeAddTaskButton = document.querySelectorAll("[data-close-button]");
const overlay = document.getElementById("new-task-overlay");
const inputsNewTaskPopup = document.querySelectorAll(".inputs-new-task");
const buttonNewTaskPopup = document.getElementById("submit-new-task");
const tasksCollection = [];
const tasksContainer = document.getElementById("tasks-list");

//tasksDisplayed is a live NodeList that will get updated everytime a new element in tasksContainer gets added
let tasksDisplayed = tasksContainer.childNodes;
const taskOptions = document.querySelector("#task-options");
const editingInputs = document.querySelectorAll(".inputs-editing-task");
const confirmChanges = document.getElementById("confirm-changes");
let currentTaskIndex = null;
let lastTaskIndex = null;
const deleteClickedTask = document.getElementById("delete-task");
const closeButtons = document.querySelectorAll(".close-button");
const closeTaskOptions = closeButtons[0];
const searchInput = document.querySelector("#text-to-search");
const restartSearchButton = document.querySelector("#restart-search-button");
const PBORDER = "2px solid var(--dark-green-alpha)";


//button add and close the popup:
openAddTaskButton.forEach(btn => {
    btn.addEventListener('click', () => {
        const addTask = document.querySelector(btn.dataset.addTarget);
        openAddPopup(addTask);
    })
});

closeAddTaskButton.forEach(btn => {
    btn.addEventListener('click', () => {
        const addTask = btn.closest('.adding-task');          //looks for the closest parent class
        closeAddPopup(addTask);
    })
});

overlay.addEventListener('click', () => {
    const addingTasks = document.querySelectorAll(".adding-task.active");
    addingTasks.forEach(task => {
        closeAddPopup(task)
    })
});

function openAddPopup(addingTask) {
    if (addingTask == null) return
        addingTask.classList.add("active");
        overlay.classList.add("active");
}

function closeAddPopup(addingTask) {
    if (addingTask == null) return
        addingTask.classList.remove("active");
        overlay.classList.remove("active");
}

function submitNewDate(time, date) {
	let dateCopy = date.slice();
	let timeCopy = time.slice();
	if (time === "" && date !== "") timeCopy = "00:00";
	if (date === "" && time !== "") {
		let dateNow = new Date();
		dateCopy = `${dateNow.getFullYear()}-${dateNow.getMonth() + 1}-${dateNow.getDate()}`;
	}
	return timeCopy + "," + dateCopy;
}

//localStorage Logic
const _localTasks = JSON.parse(localStorage.getItem("tasks") || "[]");

for (let i = 0; i < _localTasks.length; i++) {
	let localTitle = _localTasks[i]._title;
	let localDescription = _localTasks[i]._description;
	let localTime = _localTasks[i]._expirationTime;
	let localDate = _localTasks[i]._expirationDate;

	tasksCollection.push(new Task(localTitle, localDescription, localTime, localDate));
	displayNewTask();
}

function updateLocalTasks() {	//it works to create, update and delete cause it replaces it
	localStorage.setItem("tasks", JSON.stringify(tasksCollection));
}

//expiration check logic
makeExpirationComplete();

//every 1 minute, checks if task has expired
let expireInterval;
expireInterval = setInterval(makeExpirationComplete, 60000);

function makeExpiration(taskIndex) {
	const ID = "task-" + tasksCollection[taskIndex].id;
	const DATE = tasksCollection[taskIndex].expirationDate;
	const TIME = tasksCollection[taskIndex].expirationTime;
	const task = document.getElementById(ID);

	if (DATE === "" || TIME === "") return;

	if (isExpired(DATE, TIME) && !task.children[2].classList.contains("expired")) {
		task.children[2].classList.add("expired");
		task.children[3].classList.add("expired");
	}
	else if (!isExpired(DATE, TIME) && task.children[2].classList.contains("expired")) {
		task.children[2].classList.remove("expired");
		task.children[3].classList.remove("expired");
	}
}

function makeExpirationComplete() {
	for (let i = 0; i < tasksCollection.length; i++) {
		makeExpiration(i);
	}
}

function stopExpireTimer() {
	clearInterval(expireInterval);
}

//button to submit the new task and getting the data from inputs
buttonNewTaskPopup.addEventListener('click', () => {
    const title = inputsNewTaskPopup[0].value;

	if (!title) return null;

    const description = inputsNewTaskPopup[1].value;
	let [expirationTime, expirationDate] = submitNewDate(inputsNewTaskPopup[2].value, inputsNewTaskPopup[3].value).split(",");

    tasksCollection.push(new Task(title, description, expirationTime, expirationDate));
    displayNewTask();

	updateLocalTasks();
	makeExpiration(tasksCollection.length - 1);		//checks expiration after adding the new task on screen and array

    inputsNewTaskPopup[0].value = null;
    inputsNewTaskPopup[1].value = null;
    inputsNewTaskPopup[2].value = null;
    inputsNewTaskPopup[3].value = null;
});

function displayNewTask() {
    const newTaskDisplayed = document.createElement("div");
    const taskTitle = document.createElement("h2");
    const taskDescription = document.createElement("p");
    const taskTime = document.createElement("p");
    const taskDate = document.createElement("p");
    const newIndex = tasksCollection.length - 1;
    const taskId = tasksCollection[newIndex].id;

    //getting the data to the new children elements
    const titleContent = document.createTextNode(tasksCollection[newIndex].title);
    const descriptionContent = document.createTextNode(tasksCollection[newIndex].description);
    const timeContent = document.createTextNode(formatTimeTo12(tasksCollection[newIndex].expirationTime));
    const dateContent = document.createTextNode(formatDate(tasksCollection[newIndex].expirationDate));

    //giving the expirations its own class:
    taskTime.classList.add("expirations");
    taskDate.classList.add("expirations", "date");

    // adding the children and its content to everything
    taskTitle.appendChild(titleContent);
    taskDescription.appendChild(descriptionContent);
    taskTime.appendChild(timeContent);
    taskDate.appendChild(dateContent);

    newTaskDisplayed.append(taskTitle, taskDescription, taskTime, taskDate);

    //add the parent element
    newTaskDisplayed.setAttribute("id", "task-" + taskId);      //adds same id of the tasksCollection to the newTaskDisplayed plus the task-
    newTaskDisplayed.classList.add("task");
    tasksContainer.appendChild(newTaskDisplayed);

    //checks if description is empty to add or not add a style.
    areEmpty(newIndex);

    //onclick the task will display its option to the right side:
    tasksDisplayed[tasksDisplayed.length - 1].addEventListener('click', (event) => {
        targetClicked = event.target;       //need to access the div
        if (event.target.nodeName != "DIV") {
            targetClicked = event.target.parentElement;
        }

        //takes only the digits in global and then join that array with no spaces.
        targetId = parseInt(targetClicked.id.match(/\d/g).join(""));

        currentTaskIndex = tasksCollection.findIndex(task => task.id === targetId);

        taskClicked(currentTaskIndex);
        lastTaskIndex = currentTaskIndex.valueOf();
    });
}

//opens and closes the task's options
function taskClicked(indexTask) {
    const currentTask = tasksCollection[indexTask];

    if (taskOptions.classList.contains("hide") || taskOptions.classList.length === 0) {
        //display the values from object to task-options
        editingInputs[0].value = currentTask.title;
        editingInputs[1].value = currentTask.description;
        editingInputs[2].value = currentTask.expirationTime;
        editingInputs[3].value = currentTask.expirationDate;

        taskOptions.classList.add("show");
        taskOptions.classList.remove("hide");
    }
    else if (taskOptions.classList.contains("show") && indexTask != lastTaskIndex) {
        editingInputs[0].value = currentTask.title;
        editingInputs[1].value = currentTask.description;
        editingInputs[2].value = currentTask.expirationTime;
        editingInputs[3].value = currentTask.expirationDate;
    }
    else {
		taskOptions.classList.remove("show");
        taskOptions.classList.add("hide");
    }
}

//confirm changes
confirmChanges.addEventListener('click', () => changeTask(currentTaskIndex));

function changeTask(indexTask) {
	if (!editingInputs[0].value) return null;

    //change tasksCollection
    tasksCollection[indexTask].title = editingInputs[0].value;
    tasksCollection[indexTask].description = editingInputs[1].value;
	let [expirationTime, expirationDate] = submitNewDate(editingInputs[2].value, editingInputs[3].value).split(",");
    tasksCollection[indexTask].expirationTime = expirationTime;
    tasksCollection[indexTask].expirationDate = expirationDate;

	//change in localStorage
	updateLocalTasks();

    //checks if description is empty to add or not add a style.
    areEmpty(indexTask);

    //change tasksDisplayed (the tasks displayed on screen)
    tasksDisplayed[indexTask].firstChild.textContent = tasksCollection[indexTask].title;
    tasksDisplayed[indexTask].children[1].textContent = tasksCollection[indexTask].description;
    tasksDisplayed[indexTask].children[2].textContent = formatTimeTo12(tasksCollection[indexTask].expirationTime);
    tasksDisplayed[indexTask].lastChild.textContent = formatDate(tasksCollection[indexTask].expirationDate);

	makeExpiration(currentTaskIndex);
}

// delete task button
deleteClickedTask.addEventListener('click', () => deleteTask(currentTaskIndex));

function deleteTask(indexTask) {
	tasksDisplayed[indexTask].classList.add("deleting");

	setTimeout(() => {
		tasksCollection.splice(indexTask, 1);		//delete in the array
		updateLocalTasks(); 						//delete in localStorage
		tasksDisplayed[indexTask].remove(); 		//delete on screen
	}, 500);

	taskOptions.classList.remove("show");
	taskOptions.classList.add("hide");
}

//close task's options with button
closeTaskOptions.addEventListener('click', () => {
	taskOptions.classList.remove("show");
	taskOptions.classList.add("hide");
});

//search task
searchInput.addEventListener('input', searchTask);

function searchTask() {
    const text = searchInput.value;
	
	tasksDisplayed.forEach(task => {
		if (task.firstElementChild.textContent.includes(text)) {
			task.style.display = "block";
		}
		else {
			task.style.display = "none";
		}
	});
}

//restart search button
restartSearchButton.addEventListener('click', () => {
    searchInput.value = null;
	searchTask();
});

//function that will track of the state of the description and time-date to add the lines.
//this function will be in the changeTask function and displayNewTask function.
function areEmpty(indexTask) {
    const task = tasksCollection[indexTask];
    if (task.description == "" && task.expirationTime == "" && task.expirationDate == "") {
        tasksDisplayed[indexTask].children[1].style.borderBottom = "none";
        tasksDisplayed[indexTask].children[1].style.borderTop = "none";
    }
    else if (task.description == "") {
        //delete one line
        tasksDisplayed[indexTask].children[1].style.borderBottom = PBORDER;
    }
    else {
        tasksDisplayed[indexTask].children[1].style.borderBottom = PBORDER;
        tasksDisplayed[indexTask].children[1].style.borderTop = PBORDER;
    }
}

function formatTimeTo12(timeAt24) {
    if (timeAt24 === "") return "";

	let [hours, minutes] = timeAt24.split(":");
    let meridiem = hours >= 12 ? "PM" : "AM";
    hours = (hours % 12) || 12;

    return `${hours.toString()}:${minutes} ${meridiem}`;
}

function formatDate(taskDate) {         //formats to month/day/year
    if (taskDate === "") return "";

    const dateSplitted = taskDate.split("-");
    return `${dateSplitted[1]}/${dateSplitted[2]}/${dateSplitted[0]}`;
}

function isExpired(date, time) {	//accepts only 24 time
	let dateNow = new Date();
	let [hours, minutes] = time.split(":");
	let [year, month, day] = date.split("-");
	let taskDate = new Date(year, month - 1, day, hours, minutes);

	epochNow = dateNow.getTime();
	epochTask = taskDate.getTime();

	return  (epochTask - epochNow < 0);
}

