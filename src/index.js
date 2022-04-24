const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);
  if (!user) {
    return response.status(404).json({ error: 'Usuário não encontrado '});
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAreadyExists = users.some(user => user.username === username);
  if (userAreadyExists) {
    return response.status(400).json({ error: "Nome de usuário ja esta sendo utilizado "});
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {  
  const { user } = request;
  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const task = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };
  user.todos.push(task);

  return response.status(201).json(task);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todoAreadyExists = user.todos.find(todo => todo.id === id);
  if (!todoAreadyExists) {
    return response.status(404).json({ "error": "Todo não encontrado "});
  }

  user.todos.forEach(todo => {
    if (todo.id === id) {
      todo.title = title;
      todo.deadline = deadline;
      return response.status(201).json(todo);
    }
  });

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoAreadyExists = user.todos.find(todo => todo.id === id);
  if (!todoAreadyExists) {
    return response.status(404).json({ "error": "Todo não encontrado "});
  }

  user.todos.forEach(todo => {
    if (todo.id === id) {
      todo.done = true;
      return response.status(201).json(todo);
    }
  });
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const id = request.params.id;

  const todo = user.todos.find(todo => todo.id === id);  
  if (todo) {
    const indexOfUser = users.indexOf(user);
    const indexOfTodo = users[indexOfUser].todos.indexOf(todo);
    users[indexOfUser].todos.splice(indexOfTodo, 1);
    return response.sendStatus(204);
  } 
  else {
    return response.status(404).json({ "error": 'Mensagem do erro' });
  }
});

module.exports = app;