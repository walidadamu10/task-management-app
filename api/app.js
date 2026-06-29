const express = require('express');
const app = express();
const { mongoose } = require('./db/mongoosedb');
const bodyParser = require('body-parser');
const { TaskLists, Task, User } = require('./db/models/');
const jwt = require('jsonwebtoken');
const cors = require('cors'); // Import the CORS middleware

/* MIDDLEWARE */
app.use(bodyParser.json());
app.use(cors()); // Use the CORS middleware for all requests


// Load middleware
app.use(bodyParser.json());


//CORS HEADERS MIDDLEWARE
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:4200"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE"); // Separate methods with commas
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

  res.header(
    'Access-Control-Expose-Headers',
    'x-access-token, x-refresh-token'
)

  next();
});


let authenticate = (req, res, next) => {
  let token = req.header('x-access-token');
  if (!token) {
      return res.status(401).send('Access token is required');
  }

  jwt.verify(token, User.getJWTSecret(), (err, decoded) => {
      if (err) {
          return res.status(401).send(err);
      } else {
          req.user_id = decoded._id;
          next();
      }
  });
};

let verifySession = (req, res, next) => {
  let refreshToken = req.header('x-refresh-token');
  if (!refreshToken) {
      return res.status(401).send('Refresh token is required');
  }

  let _id = req.header('_id');
  if (!_id) {
      return res.status(401).send('User ID is required');
  }

  User.findByIdAndToken(_id, refreshToken)
      .then((user) => {
          if (!user) {
              return Promise.reject('User not found');
          }

          req.user_id = user._id;
          req.userObject = user;
          req.refreshToken = refreshToken;

          let isSessionValid = false;
          user.sessions.forEach((session) => {
              if (session.token === refreshToken) {
                  if (User.hasRefreshTokenExpired(session.expiresAt) === false) {
                      isSessionValid = true;
                  }
              }
          });

          if (isSessionValid) {
              next();
          } else {
              return Promise.reject('Refresh token has expired or the session is invalid');
          }
      })
      .catch((error) => {
          res.status(401).send(error);
      });
};

/* END MIDDLEWARE  */

/* ROUTE HANDLERES */

/* TASK LISTS ROUTES */

/*
  --GET / Task lists
  --Purpose: Get all the task lists
*/

app.get('/TaskLists', authenticate,  (req, res) => {
     // We want to return an array of all the lists that belong to the authenticated user
     TaskLists.find({
     _userId: req.user_id
  }).then((TaskLists) => {
      res.send(TaskLists);
  }).catch((e) => {
      res.send(e);
  });
})

/*--------------------------------------------------------------------------------*/
/*
  --POST / Task lists
  --Purpose: create a new task lists
*/

app.post('/TaskLists', authenticate, (req, res) => {
    //want to create new tasks lists and then return new lists back to the user (including id)
    let title = req.body.title;

    let newTaskLists = new TaskLists({
        title,
        _userId: req.user_id
    });
    newTaskLists.save().then((TaskListsDoc) => {
        // full list document is returned
        res.send(TaskListsDoc);
    })
})



/*--------------------------------------------------------------------------------*/

/*
  --PATCH / Task  lists
  --Purpose: update a specified task lists
*/

app.patch('/TaskLists/:id', authenticate, (req, res) => {
  TaskLists.findOneAndUpdate({ _id: req.params.id, _userId: req.user_id }, {
      $set: req.body
  }, { new: true }) // Add { new: true } to return the updated document
  .then(updatedList => {
      if (updatedList) {
          res.status(200).send({ 'message': 'Updated successfully', updatedList });
      } else {
          res.status(404).send({ 'message': 'List not found' });
      }
  })
  .catch(error => {
      console.error('Error updating list:', error);
      res.status(500).send({ 'message': 'Invalid ID type', });
  });
});




/*--------------------------------------------------------------------------------*/
/*
  --DELETE / Task  lists
  --Purpose: delete a specified task lists
*/


app.delete('/TaskLists/:id', authenticate, (req, res) => {
  // We want to delete the specified list (document with id in the URL)
  TaskLists.findOneAndDelete({
      _id: req.params.id,
      _userId: req.user_id
  }).then((removedListsDoc) => {
      if (removedListsDoc) {
          res.send(removedListsDoc);
          deleteTasksFromTaskLists(removedListsDoc._id);
      } else {
          // Handle case where no document was found with the provided ID
          res.status(404).send({ message: 'List not found' });
      }
  }).catch((error) => {
      // Handle any errors that occur during the deletion process
      console.error('Error deleting list:', error);
      res.status(500).send({ message: 'Internal server error' });
  });
});



/*--------------------------------------------------------------------------------*/

/*
  --GET / Tasklists/TaskListsID/tasks
  --Purpose: get all tasks in a specific list
*/



app.get('/TaskLists/:TaskListsId/tasks', authenticate, (req, res) => {
    Task.find({
      _TaskListsId: req.params.TaskListsId
    }).then((tasks) => {res.send(tasks);
        })
        .catch((error) => {
            console.error('Error fetching tasks:', error);
            res.status(500).send('Error fetching tasks');
        });
  });
  

/*--------------------------------------------------------------------------------*/
/*
  --POST / Tasklists/TaskListsID/tasks
  --Purpose: create a new task in a specified list
*/

app.post('/TaskLists/:TaskListsId/tasks', authenticate, (req, res) => {
  // Create a new task in the list specified by the list ID

  TaskLists.find({
    _id: req.params.listId,
    _userId: req.user_id
  }).then((TaskLists) => {
    if (TaskLists) {
      // list object with the specified conditions was found
      // therefore the currently authenticated user can create new tasks
      let newTask = new Task({
        title: req.body.title,
        _TaskListsId: req.params.TaskListsId, // Include TaskList ID
      });

      newTask.save().then((newTaskDoc) => {
        // Send the response with both task list ID and task ID
        res.send(newTaskDoc);
      }).catch((error) => {
        console.error('Error creating new task:', error);
        res.status(500).send('Error creating new task');
      });
    } else {
      // No matching task list found
      res.sendStatus(404);
    }
  }).catch((error) => {
    console.error('Error checking list ownership:', error);
    res.status(500).send('Error checking list ownership');
  });
});



/*--------------------------------------------------------------------------------*/
/*
  --PATCH / Tasklists/TaskListsID/tasks/:taskId
  --Purpose: update an existing task
*/

app.patch('/TaskLists/:TaskListsId/tasks/:tasksId', authenticate, (req, res) => {
  // Ensure user is authenticated
  if (!req.user_id) {
    return res.sendStatus(401); // Unauthorized
  }

  // Validate TaskListsId
  if (!mongoose.isValidObjectId(req.params.TaskListsId)) {
    return res.status(400).send('Invalid TaskListsId'); // Bad request
  }

  TaskLists.findById(req.params.TaskListsId)
    .then((taskList) => {
      if (!taskList) {
        return res.status(404).send('Task list not found'); // Task list not found
      }

      Task.findOneAndUpdate({
        _id: req.params.tasksId,
        _TaskListsId: req.params.TaskListsId
      }, {
        $set: req.body
      }).then((updatedTask) => {
        if (!updatedTask) {
          return res.status(404).send('Task not found'); // Task not found
        }
        res.send({ 'message': 'Updated successfully.' });
      }).catch(error => {
        console.error('Error updating task:', error);
        res.status(500).send('Error updating task');
      });
    }).catch(error => {
      console.error('Error finding task list:', error);
      res.status(500).send('Error finding task list');
    });
});




    

/*--------------------------------------------------------------------------------*/
/*
  --DELETE / Tasklists/TaskListsID/tasks/:taskId
  --Purpose: delete a task
*/

app.delete('/TaskLists/:TaskListsId/tasks/:tasksId', authenticate, (req, res) => {

  TaskLists.find({
    _id: req.params.TaskListsId,
    _userId: req.user_id
  }).then((TaskLists) => {
    if (TaskLists) {
        // list object with the specified conditions was found
        // therefore the currently authenticated user can make updates to tasks within this list
        return true;
    }
    // else - the list object is undefined
    return false;

  }).then((canDeleteTasks) => {
    if (canDeleteTasks) {
      Task.findOneAndDelete({
        _id: req.params.tasksId, // Corrected parameter name
        _TaskListsId: req.params.TaskListsId
      }).then((removedTaskDoc) => {
        res.send(removedTaskDoc);
      }).catch((error) => {
        console.error('Error deleting task:', error);
        res.status(500).send('Error deleting task');
      })
    } else {
      res.sendStatus(401)
    }    
  });
});


/*--------------------------------------------------------------------------------*/


/* USER ROUTES */

/**
 * POST /users
 * Purpose: Sign up
 */
app.post('/users', (req, res) => {
  // User sign up

  let body = req.body;
  let newUser = new User(body);
  newUser.save().then(() => {
    return newUser.createSession();
}).then((refreshToken) => {
    // Session created successfully - refreshToken returned.
    // now we geneate an access auth token for the user

    return newUser.generateAccessAuthToken().then((accessToken) => {
        // access auth token generated successfully, now we return an object containing the auth tokens
        return { accessToken, refreshToken }
    });
}).then((authTokens) => {
    // Now we construct and send the response to the user with their auth tokens in the header and the user object in the body
    res
        .header('x-refresh-token', authTokens.refreshToken)
        .header('x-access-token', authTokens.accessToken)
        .send(newUser);
}).catch((e) => {
    res.status(400).send(e);
})
})


/*--------------------------------------------------------------------------------*/

/**
 * POST /users/login
 * Purpose: Login
 */
app.post('/users/login', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  User.findByCredentials(email, password).then((user) => {
      return user.createSession().then((refreshToken) => {
          // Session created successfully - refreshToken returned.
          // now we geneate an access auth token for the user

          return user.generateAccessAuthToken().then((accessToken) => {
              // access auth token generated successfully, now we return an object containing the auth tokens
              return { accessToken, refreshToken }
          });
      }).then((authTokens) => {
          // Now we construct and send the response to the user with their auth tokens in the header and the user object in the body
          res
              .header('x-refresh-token', authTokens.refreshToken)
              .header('x-access-token', authTokens.accessToken)
              .send(user);
      })
  }).catch((e) => {
      res.status(400).send(e);
  });
})


/*--------------------------------------------------------------------------------*/

/**
 * GET /users/me/access-token
 * Purpose: generates and returns an access token
 */
app.get('/users/me/access-token', verifySession, (req, res) => {
  // we know that the user/caller is authenticated and we have the user_id and user object available to us
  req.userObject.generateAccessAuthToken().then((accessToken) => {
      res.header('x-access-token', accessToken).send({ accessToken });
  }).catch((e) => {
      res.status(400).send(e);
  });
})


/*--------------------------------------------------------------------------------*/


/* HELPER METHODS */
let deleteTasksFromTaskLists = (_TaskListsId) => {
  Task.deleteMany({
    _TaskListsId
  }).then(() => {
      console.log("Tasks from " + _TaskListsId + " were deleted!");
  })
}


app.listen(3000, () => {
    console.log("Server is listening on port 3000");
})