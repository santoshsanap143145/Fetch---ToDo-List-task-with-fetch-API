const cl = console.log;

const loader = document.getElementById("loader");
const toDoContainer = document.getElementById("toDoContainer");

const formBlock = document.getElementById("formBlock");
const backDrop = document.getElementById("backDrop");
const showFormBtn = document.getElementById("showFormBtn");
const cancelBtns = [...document.querySelectorAll(".cancelBtn")];

const submitBtn = document.getElementById("submitBtn");
const updateBtn = document.getElementById("updateBtn");

const filter = document.getElementById("filter");

const toDoForm = document.getElementById("toDoForm");
const titleControl = document.getElementById("title");
const statusControl = document.getElementById("status");
const userIdControl = document.getElementById("userId");

const BASE_URL = "https://jsonplaceholder.typicode.com/";
const POST_URL = `${BASE_URL}/todos`;

let toDoArr = [];

const showLoader = () => {
  loader.classList.remove("d-none");
};
const hideLoader = () => {
  loader.classList.add("d-none");
};

const alertBar = (title, icon) => {
  swal.fire({
    title,
    icon,
    timer: 3000,
  });
};

const srNoFix = () => {
  let rows = document.querySelectorAll("#toDoContainer tr");
  rows.forEach((row, i) => {
    row.children[0].innerHTML = i + 1;
  });
};

const templatingTodo = (arr) => {
  let result = "";
  arr.forEach((todo, i) => {
    result += `<tr id="${todo.id}">
                  <td>${i + 1}</td>
                  <td>${todo.title}</td>
                  <td class="text-white fw-bold">${todo.completed ? "Yes" : "No"}</td>
                  <td>
                    <button
                      class="btn btn-light btn-sm"
                      onclick="editTodo(this)"
                    >
                      Edit
                    </button>
                  </td>
                  <td>
                    <button
                      class="btn btn-danger btn-sm"
                      onclick="removeTodo(this)"
                    >
                      Remove
                    </button>
                  </td>
                </tr>`;
  });
  toDoContainer.innerHTML += result;
};

const createTr = (obj, res) => {
  let tableRow = document.createElement("tr");
  tableRow.id = res.id;
  tableRow.innerHTML = `
                        <td>${1}</td>
                        <td>${obj.title}</td>
                        <td class="text-white fw-bold">${obj.completed ? "Yes" : "No"}</td>
                        <td>
                          <button
                            class="btn btn-light btn-sm"
                            onclick="editTodo(this)"
                          >
                            Edit
                          </button>
                        </td>
                        <td>
                          <button
                            class="btn btn-danger btn-sm"
                            onclick="removeTodo(this)"
                          >
                            Remove
                          </button>
                        </td>`;
  toDoContainer.prepend(tableRow);
};

const API_call = async (method, url, body) => {
  showLoader();
  try {
    let option = {
      method: method,
      body: body ? JSON.stringify(body) : null,
      headers: {
        "Content-type": "application/json",
        Authorization: "JWT ACCESS_TOKEN from LS",
      },
    };
    let res = await fetch(url, option);
    return await res.json();
  } catch (err) {
    alertBar(err, "error");
  } finally {
    hideLoader();
  }
};

const fetchAlltodos = async () => {
  let data = await API_call("GET", POST_URL, null);
  toDoArr = [...data.reverse()];
  templatingTodo(toDoArr);
};
fetchAlltodos();

const filteredToDoList = () => {
  let filteredTodos;
  if (filter.value === "all") {
    filteredTodos = toDoArr;
  } else if (filter.value === "completed") {
    filteredTodos = toDoArr.filter((todo) => todo.completed);
  } else {
    filteredTodos = toDoArr.filter((todo) => !todo.completed);
  }
  toDoContainer.innerHTML = "";
  templatingTodo(filteredTodos);
};
filteredToDoList();

const submitOnclick = async (eve) => {
  eve.preventDefault();
  let newTodo = {
    title: titleControl.value,
    completed: statusControl.value,
    userId: userIdControl.value,
  };
  toDoForm.reset();
  let res = await API_call("POST", POST_URL, newTodo);
  createTr(newTodo, res);
  backDrop.classList.toggle("active");
  formBlock.classList.toggle("active");
  srNoFix();
  alertBar(`ToDo has been Created Successfully!!!`, 'success')
};

const editTodo = (ele) => {
  let editId = ele.closest("tr").id;
  localStorage.setItem('editId', editId)
  let editObj = toDoArr.find((obj) => obj.id == editId);
  cl(editObj)
  todoFormHandler();
  titleControl.value = editObj.title;
  statusControl.value = editObj.completed;
  userIdControl.value = editObj.userId;
  submitBtn.classList.add("d-none");
  updateBtn.classList.remove("d-none");
};

const updateOnClick = async () => {
  let updateId = localStorage.getItem('editId')
  let updateUrl = `${POST_URL}/${updateId}`
  let updatedObj = {
    title: titleControl.value,
    completed: JSON.parse(statusControl.value),
    userId: userIdControl.value,
  }
  toDoForm.reset()
  let res = await API_call("PATCH", updateUrl, updatedObj)
  let rowChild = document.getElementById(updateId).children
  rowChild[1].innerHTML = `<td>${res.title}</td>`
  rowChild[2].innerHTML = `
                            <td class="text-white fw-bold">
                              ${res.completed ? "Yes" : "No"}
                            </td>`
  todoFormHandler();
  submitBtn.classList.remove("d-none");
  updateBtn.classList.add("d-none");
  alertBar(`ToDo has been Updated Successfully!!!`, 'success')
}

const removeTodo = async (ele) => {
  let confirm = await Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!"
  })
  if(confirm.isConfirmed){
    let removeId = ele.closest('tr').id
    let removeUrl = `${POST_URL}/${removeId}`
    await API_call('DELETE', removeUrl)
    ele.closest('tr').remove()
    srNoFix()
    alertBar(`ToDo has been Removed Successfully!!!`, 'success')
  }
}

const todoFormHandler = () => {
  backDrop.classList.toggle("active");
  formBlock.classList.toggle("active");
  toDoForm.reset()
};
filter.addEventListener("change", filteredToDoList);
showFormBtn.addEventListener("click", todoFormHandler);
cancelBtns.forEach((ele) => {
  ele.addEventListener("click", todoFormHandler);
});
toDoForm.addEventListener("submit", submitOnclick);
updateBtn.addEventListener('click', updateOnClick)