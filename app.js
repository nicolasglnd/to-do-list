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
const tasksContainer = document.getElementById("tasks-list");           //is the parent

//tasksDisplayed is a live NodeList that will get updated everytime a new element in tasksContainer gets added
let tasksDisplayed = tasksContainer.childNodes;                     //are the children
const taskOptions = document.querySelector("#task-options");
const editingInputs = document.querySelectorAll(".inputs-editing-task");
const confirmChanges = document.getElementById("confirm-changes");
let currentTaskIndex = null;
let lastTaskIndex = null;
const deleteClickedTask = document.getElementById("delete-task");
const closeButtons = document.querySelectorAll(".close-button");
const closeTaskOptions = closeButtons[0];
const searchInput = document.querySelector("#text-to-search");
const searchButton = document.querySelector("#search-button");
const restartSearchButton = document.querySelector("#restart-search-button");
const PBORDER = "2px solid var(--dark-green-alpha)";


//button add and close the popup:
// forEach bcz if there are more buttons that activate it
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
        addingTask.classList.add("active");             //will add a new class to the html element
        overlay.classList.add("active");
}

function closeAddPopup(addingTask) {
    if (addingTask == null) return
        addingTask.classList.remove("active");             //will remove class from the html element
        overlay.classList.remove("active");
}


//button to submit the new task and getting the data from inputs
buttonNewTaskPopup.addEventListener('click', () => {
    const title = inputsNewTaskPopup[0].value;
    const description = inputsNewTaskPopup[1].value;
    const expirationTime = inputsNewTaskPopup[2].value;
    const expirationDate = inputsNewTaskPopup[3].value;

    tasksCollection.push(new Task(title, description, expirationTime, expirationDate));
    displayNewTask();

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

    //add the parent element with all children to the document
    newTaskDisplayed.setAttribute("id", "task-" + taskId);      //adds same id of the tasksCollection to the newTaskDisplayed plus the task-
    newTaskDisplayed.classList.add("task");
    tasksContainer.appendChild(newTaskDisplayed);

    //checks if description is empty to add or not add a style.
    areEmpty(newIndex);


    //adding the event whenever a new task is made to that task:
    //onclick the task will display its option to the right side:
    tasksDisplayed[tasksDisplayed.length - 1].addEventListener('click', (event) => {
        targetClicked = event.target;       //need to access the div
        if (event.target.nodeName != "DIV") {
            targetClicked = event.target.parentElement;
        }

        //using regex, will take only the digits in global and then join that array with no spaces.
        targetId = parseInt(targetClicked.id.match(/\d/g).join(""));

        //currentTask = tasksCollection.filter(task => task.id == targetId);  if whole object needed
        currentTaskIndex = tasksCollection.findIndex(task => task.id === targetId);

        taskClicked(currentTaskIndex);
        lastTaskIndex = currentTaskIndex.valueOf();         //it copies the value not reference.
    });
}

// function that opens and closes the task's options
function taskClicked(indexTask) {
    const currentTask = tasksCollection[indexTask];

    if (taskOptions.style.visibility == "hidden") {
        //display the values from object to task-options
        editingInputs[0].value = currentTask.title;
        editingInputs[1].value = currentTask.description;
        editingInputs[2].value = currentTask.expirationTime;
        editingInputs[3].value = currentTask.expirationDate;

        taskOptions.style.visibility = "visible";
    }
    else if (taskOptions.style.visibility = "visible" && indexTask != lastTaskIndex) {
        editingInputs[0].value = currentTask.title;
        editingInputs[1].value = currentTask.description;
        editingInputs[2].value = currentTask.expirationTime;
        editingInputs[3].value = currentTask.expirationDate;
    }
    else {
        taskOptions.style.visibility = "hidden";
    }
}

// confirm changes button
confirmChanges.addEventListener('click', () => changeTask(currentTaskIndex));

function changeTask(indexTask) {
    //change tasksCollection (the array)
    tasksCollection[indexTask].title = editingInputs[0].value;
    tasksCollection[indexTask].description = editingInputs[1].value;
    tasksCollection[indexTask].expirationTime = editingInputs[2].value;
    tasksCollection[indexTask].expirationDate = editingInputs[3].value;

    //checks if description is empty to add or not add a style.
    areEmpty(indexTask);

    //change tasksDisplayed (the tasks displayed on screen)
    tasksDisplayed[indexTask].firstChild.textContent = tasksCollection[indexTask].title;
    tasksDisplayed[indexTask].children[1].textContent = tasksCollection[indexTask].description;
    tasksDisplayed[indexTask].children[2].textContent = formatTimeTo12(tasksCollection[indexTask].expirationTime);
    tasksDisplayed[indexTask].lastChild.textContent = formatDate(tasksCollection[indexTask].expirationDate);

    console.log("changed");
}

// delete task button
deleteClickedTask.addEventListener('click', () => deleteTask(currentTaskIndex));

function deleteTask(indexTask) {
    //delete in the array
    tasksCollection.splice(indexTask, 1);

    //delete on screen
    tasksDisplayed[indexTask].remove();

    taskOptions.style.visibility = "hidden";
    console.log("deleted");
}

//close task's options with button
closeTaskOptions.addEventListener('click', () => taskOptions.style.visibility = "hidden");


//search task
searchButton.addEventListener('click', searchTask);

function searchTask() {
    const text = searchInput.value;
    const matchesIds = [];
    let taskId = null;

    tasksCollection.forEach(task => {       //maybe later update with map or filter
        if (task.title == text) matchesIds.push(task.id.valueOf());
    });

    if (matchesIds.length == 1) {
        console.log("just one task has that name");
        const perfectMatchIndex = tasksCollection.findIndex(task => matchesIds[0] == task.id);

        tasksDisplayed.forEach(task => {
            taskId = task.id.match(/\d/g).join("");
            if (taskId != matchesIds[0]) task.style.display = "none";
        });
    }
    else if (matchesIds.length > 1) {
        console.log("a lot of that same name");

        tasksDisplayed.forEach(task => {
            taskId = task.id.match(/\d/g).join("");
            task.style.display = "none";
            for (let i = 0; i < matchesIds.length; i++) {
                if (taskId == matchesIds[i]) {
                    task.style.display = "block";
                    break;
                }
            }
        });
    }
    else {
        console.log("nothing found with tha name");
    }
}

//restart search button
restartSearchButton.addEventListener('click', restartSearch);

function restartSearch() {
    searchInput.value = null;
    tasksDisplayed.forEach(task => {
        task.style.display = "block";
    });
}


//function that will trak of the state of the description and time-date to add the lines.
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

    let hours = timeAt24.split(":")[0];
    let minutes = timeAt24.split(":")[1];
    let meridiem = hours >= 12 ? "PM" : "AM";
    hours = (hours % 12) || 12;

    return `${hours.toString()}:${minutes} ${meridiem}`;
}

function formatDate(taskDate) {         //formats to month/day/year
    if (taskDate === "") return "";

    const dateSplitted = taskDate.split("-");
    return `${dateSplitted[1]}/${dateSplitted[2]}/${dateSplitted[0]}`;
}

/*
// this is test code to fix the search 
searchInput.addEventListener('onchange', () => {
	//gonna use the filter method	
});*/

/*
 *
 * this function i kept it here if i need to use the html node
 function formatTime12(htmlNode = null, timeAt24 = null) {
    //htmlNode is the input from html and timeAt24 if the input is like 14:23
    let hours;
    let minutes;

    if (htmlNode != null && htmlNode.value === "") return "";
    if (timeAt24 != null && timeAt24 === "") return "";

    if (timeAt24 != null) {
        hours = timeAt24.split(":")[0];
        minutes = timeAt24.split(":")[1];
    }
    else {
        hours = htmlNode.value.split(":")[0];
        minutes = htmlNode.value.split(":")[1];
    }

    let meridiem = hours >= 12 ? "PM" : "AM";
    hours = (hours % 12) || 12;
    console.log(hours, minutes, meridiem, "iwi")
    return `${hours.toString()}:${minutes} ${meridiem}`;
}
 */
