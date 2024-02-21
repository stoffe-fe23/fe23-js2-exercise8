import * as Utilities from '../modules/utilities.js';
import RestApi from '../modules/RestApi.js';


/**************************************************************************************************
 * TODO LIST
 **************************************************************************************************/

const todoApi = new RestApi('https://webb23-1babd-default-rtdb.europe-west1.firebasedatabase.app/todo-list');

showTodoMessages();


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Add a new task to the todo list
document.querySelector("#todoform").addEventListener("submit", (event) => {
    event.preventDefault();

    const formDataObj = new FormData(event.currentTarget, event.submitter);
    formDataObj.set("done", false);

    todoApi.postJson(formDataObj).then((data) => {
        showTodoMessages();
        console.log("Posted data", data);
    });
});


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Toggle done/not done when clicking on a todo note
document.querySelector("#taskbar").addEventListener("click", (event) => {
    if (event.target != event.currentTarget) {
        // Click on one of the task boxes
        if (event.target.tagName !== "BUTTON") {
            const data = { done: !event.target.classList.contains("todo-done") };
            todoApi.updateJson(data, event.target.id).then((responseData) => {
                showTodoMessages();
            }).catch((error) => console.error(error));
        }
        // Click on a delete button
        else {
            if (confirm("Are you sure you want to remove this task?")) {
                todoApi.deleteJson(event.target.parentElement.id).then((responseData) => {
                    showTodoMessages();
                }).catch((error) => console.error(error));
            }
        }
    }
});


//////////////////////////////////////////////////////////////////////////////////////////////////////
// Update the list of todo messages from the database, with Done tasks at the bottom.
function showTodoMessages() {
    const outBox = document.querySelector("#taskbar");
    outBox.innerHTML = "";

    todoApi.fetchJson().then((responseData) => {
        const resultsTodo = [];
        const resultsDone = [];
        for (const entry in responseData) {
            const currEntry = responseData[entry];
            const entryObj = {
                id: entry,
                task: currEntry.task,
            };

            if (currEntry.done) {
                resultsDone.push(entryObj);
            }
            else {
                resultsTodo.push(entryObj);
            }
        }
        resultsTodo.forEach((todo) => {
            Utilities.createHTMLElement('div', todo.task, outBox, 'todo-do', { id: todo.id });
        });
        resultsDone.forEach((todo) => {
            const todoBox = Utilities.createHTMLElement('div', todo.task, outBox, 'todo-done', { id: todo.id });
            Utilities.createHTMLElement('button', 'X', todoBox, 'todo-delete');
        });
    }).catch((error) => console.error(error));
}
