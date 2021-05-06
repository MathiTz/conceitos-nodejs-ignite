const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).json({ error: "User not found!" });
  }

  next();
}

function findTodoByUsernameAndId(username, id, response) {
  const user = users.find((user) => user.username === username);

  const findedIndex = user.todos.findIndex((todo) => todo.id === id);

  if (findedIndex === -1) {
    return response.status(400).json({ error: "Todo doesnt exist!" });
  }

  const oldTodo = user.todos[findedIndex];

  return { user, oldTodo, findedIndex };
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  let user = users.find((user) => user.username === username);

  if (user) {
    return response.status(400).json({ error: "User already exists!" });
  }

  user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;

  const { todos } = users.find((user) => user.username === username);

  return response.json(todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  const findedIndex = user.todos.findIndex((todo) => todo.id === id);

  if (findedIndex === -1) {
    return response.status(404).json({ error: "Todo not found!" });
  }

  const oldTodo = user.todos[findedIndex];

  const updatedTodo = {
    ...oldTodo,
    title,
    deadline,
  };

  user.todos[findedIndex] = updatedTodo;

  return response.json(updatedTodo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  const findedIndex = user.todos.findIndex((todo) => todo.id === id);

  if (findedIndex === -1) {
    return response.status(404).json({ error: "Todo not found!" });
  }

  const oldTodo = user.todos[findedIndex];

  const updatedTodo = {
    ...oldTodo,
    done: true,
  };

  user.todos[findedIndex] = updatedTodo;

  return response.json(updatedTodo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  const findedIndex = user.todos.findIndex((todo) => todo.id === id);

  if (findedIndex === -1) {
    return response.status(404).json({ error: "Todo not found!" });
  }

  user.todos.splice(findedIndex, 1);

  return response.status(204).json(user.todos);
});

module.exports = app;
