let loadedTasks= [];

lastSatus = saveStatus();


function saveStatus(test){
    lastSatus = test
};

async function loadedTaskstoBoard() {
    const loadTasks = await getItem('allTasks');
    loadedTasks = JSON.parse(loadTasks);
}

function closeAddTaskForm(){
    document.getElementById('slide-form-add-task').style.display = 'none';
}

function openAddTaskForm(){
    document.getElementById('slide-form-add-task').style.display = 'block';

}

let currentDraggedElement;
let currentDraggedElementID; 


async function updateHTML() {
    await loadedTaskstoBoard();
    initTaskData();
    renderToDoTask(loadedTasks);
    renderInProgressTask(loadedTasks);
    renderAwaitFeedbackTask(loadedTasks);
    renderDoneTask(loadedTasks);    
}

async function renderToDoTask(tasks) {    
    let open = tasks.filter(t => t['status'] == 'toDo');
    let container = document.getElementById('todoListContainer');
    container.innerHTML = '';
    
    if (open.length > 0) {
        for (let index = 0; index < open.length; index++) {
            let element = open[index];
            let elementID = open[index].taskID;
            container.innerHTML += generateTodoHTML(element, elementID);
        }        
    } else {
        generateEmtyTodoHTML(container);
    }

}


function generateTodoHTML(element, elementID) {
   
    let assignedContactHTML = '';
    if (element.assignedContact && element.assignedContact.length > 0) {
        for (let i = 0; i < element.assignedContact.length; i++) {
            let contact = element.assignedContact[i];
            assignedContactHTML += `
                <div class="boardNameBox">
                    ${getInitials(contact.name)}
                </div>`;
        }
    }

    return /*html*/`
        <div draggable="true" onclick="openInfoCard(${elementID})" ondragstart="startDragging(${elementID})" class="todo">
            <div class="category">${getFirstLettersUppercase(element['category'])}</div>
            <div class="taskName">${element['title']}</div>
            <div class="taskInfo">${element['description']}</div>
            <div id="selectContact" class="selectContact">
                ${assignedContactHTML}
            </div>            
        </div>`;
}


function renderInProgressTask(tasks){
    let inProgress = tasks.filter(t => t['status'] == 'inProgress');
    let container = document.getElementById('progressListContainer');
    container.innerHTML = '';   

    if (inProgress.length > 0) {
        for (let index = 0; index < inProgress.length; index++) {
            let element = inProgress[index];
            let elementID = inProgress[index].taskID;
            container.innerHTML += generateTodoHTML(element, elementID);
        }        
    } else {
        generateEmtyTodoHTML(container);
    }
}


function renderAwaitFeedbackTask(tasks){
    let awaitFeedback = tasks.filter(t => t['status'] == 'aweitFeedback');
    let container = document.getElementById('awaitFeedbackListContainer');
    container.innerHTML = '';

    if (awaitFeedback.length > 0) {
        for (let index = 0; index < awaitFeedback.length; index++) {
            let element = awaitFeedback[index];
            let elementID = awaitFeedback[index].taskID;
            container.innerHTML += generateTodoHTML(element, elementID);
            }
    } else {
        generateEmtyTodoHTML(container);
    }
}


function renderDoneTask(tasks){
    let done = tasks.filter(t => t['status'] == 'done');
    let container = document.getElementById('doneListContainer');
    container.innerHTML = '';

    if (done.length > 0) {
        for (let index = 0; index < done.length; index++) {
            let element = done[index];
            let elementID = done[index].taskID;
            container.innerHTML += generateTodoHTML(element, elementID);
            }
    } else {
        generateEmtyTodoHTML(container);
    }
}


function getFirstLettersUppercase(text) {
    if (!text) return '';
    return text.replace(/-/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
}



function getInitials(fullName) {
    // Splitte den Namen in Vor- und Nachnamen
    const nameParts = fullName.split(' ');

    // Extrahiere den ersten Buchstaben jedes Teils und setze sie zusammen
    const initials = nameParts.map(part => part.charAt(0)).join('');
    return initials;
}


function generateEmtyTodoHTML(container){   
        container.innerHTML = /*html*/`               
        <div class="emtyTask">
           <p>No tasks To do</p>            
        </div>`;
}





function closeTaskPopup() {
    const popup = document.querySelector('.popup');
    if (popup) {
        popup.remove();
    }
}

function doNotClose(event) {
    event.stopPropagation();
}


function openInfoCard(elementID){    
    let element = loadedTasks.filter(id => id['taskID'] == elementID);
    let infoCard = document.getElementById('InfoCard');
    console.log('open Element:', element)
    
    infoCard.innerHTML = generateOpenInfoCardHTML(element, elementID);

    renderAssignedContacts(element);
    renderSubtasks(element);
}

function generateOpenInfoCardHTML(element, elementID){
    const reversedDate = reverseDate(element[0].date);
    return /*html*/`
    <div class="popup editTaskContainerBoard" onclick="closeTaskPopup()">
        <div class="popup-content editTask" onclick="doNotClose(event)">
            <div class="spacebetween pointer">
               
                <div onclick="closeTaskPopup()">
                    <img src="assets/img/close.png" alt="">
                </div>
            </div>
            <h1 class="popupTaskTitel">${element[0].title}</h1>                
            <p class="popupTaskDescription">${element[0].description}</p>
            <div class="popupInfoName">
                <p>Due date:</p>
                <p class="popupTaskDescription">${reversedDate}</p>
            </div>
            <div>
                <p>Priority:</p> 
                <p class="popupTaskDescription">${element[0].priority}</p>
            </div>
            <div id="selectContact" class="selectContactPopup">
                <p>Assigned To:</p>
                <div id="assignedContactsContainer" class="assignedSubtasksContainer">
                </div>
            </div>
            <div id="selectContact" class="selectContactPopup">
            <p>Subtasks </p>
                <div id="assignedSubtasksContainer" class="assignedSubtasksContainer">
                </div>
            </div>

            <div class="editButtonContainer">
                <div class="editButton" onclick="deleteTask(${elementID})">
                    <img src="assets/img/delete.png" alt="">
                    <p>Delete </p> 
                </div> 
                <p>|</p>
                <div class="editButton">
                    <img src="assets/img/delete.png" alt="">
                    <p>Edit</p>
                </div>
            </div>

        </div>
    </div>`;
}


function reverseDate(originalDate) {
    // Zerlege das Datum in seine Bestandteile
    const parts = originalDate.split('-');

    // Kehre die Reihenfolge der Teile um
    const reversedParts = parts.reverse();

    // Setze die Teile wieder zusammen
    const reversedDate = reversedParts.join('/');

    return reversedDate;
}

 
  function renderAssignedContacts(element){
    let assignedContactsContainer = document.getElementById('assignedContactsContainer')
    assignedContactsContainer.innerHTML = '';
    
    if (element[0].assignedContact.length > 0) {
        for (let i = 0; i < element[0].assignedContact.length; i++) {
            const contact = element[0].assignedContact[i].name;
            // console.log('name:', contact)
            assignedContactsContainer.innerHTML += /*html*/`
                <div class="singleContactPopup">
                    <div class="boardNameBox">${getInitials(contact)}</div>
                    <p>${contact}</p>
                </div>`;
        }
    }
  }


  function renderSubtasks(element){
    let assignedSubtasksContainer = document.getElementById('assignedSubtasksContainer')
    assignedSubtasksContainer.innerHTML = '';

    let subtaskHTML = '';
    if (element[0].subtask.length > 0) {
        for (let i = 0; i < element[0].subtask.length; i++) {
            const subtask = element[0].subtask[i];
            // console.log('subtask:', subtask)
            subtaskHTML += /*html*/`
                <div class="singleContactPopup">
                <p>${subtask}</p>
                </div>`;
        }
    }
    assignedSubtasksContainer.innerHTML = subtaskHTML;
  }


async function deleteTask(elementID) {
    // Finde den Index des Tasks im allTasks-Array anhand der taskID
    const index = allTasks.findIndex(task => task['taskID']  === elementID);
   
    // Überprüfe, ob der Index gültig ist
    if (index !== -1) {
        // Entferne den Task aus dem allTasks-Array
        allTasks.splice(index, 1);

        // Aktualisiere die gespeicherten Daten
        await setItem('allTasks', JSON.stringify(allTasks));
        
        closeTaskPopup();
        updateHTML();

    } else {
        alert('Task not found in the array');
    }
}


function allowDrop(ev) {
    ev.preventDefault();
}


async function moveTo(category) {
    currentDraggedElement['status'] = category;
    currentDraggedElement['taskID'] = new Date().getTime();

    allTasks.push(currentDraggedElement);

    await setItem('allTasks', JSON.stringify(allTasks))
        .then(() => {
            console.log('moveTo:', category);
            console.log('moveTo:', currentDraggedElement);
            updateHTML();
        })
        .catch(error => console.error('Error during setItem:', error));

    deleteTask(currentDraggedElementID);
}


 function startDragging(elementID) {
    dragElement = loadedTasks.filter(id => id['taskID'] == elementID);
    currentDraggedElement = dragElement[0];
    currentDraggedElementID = dragElement[0].taskID;

    console.log('startDragging', currentDraggedElementID)
  }
  

 
  function allowDrop(ev) {
    ev.preventDefault();
  }
  