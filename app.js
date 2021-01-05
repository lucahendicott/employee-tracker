const mysql = require('mysql');
const inquirer = require('inquirer');

// create the connection information for the sql database
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'password',
    database: 'emptracker_db',
});

const startMenu = () => {
    inquirer.prompt({
        name:"choiceList",
        type:"list",
        message:"What would you like to do?",
        choices:[
        'View all employees', 
        'View all roles', 
        'View all departments',
        'Add an employee', 
        'Add a role', 
        'Add a department',
        "exit"
        ]
    })
    .then(({ choiceList }) => {
      switch (choiceList) {
          case 'View all employees':
              viewEmployee()
              break;
          case 'View all roles':
              viewRoles()
              break;
          case 'View all departments':
              viewDeps()
              break;
          case 'Add an employee':
              addEmployee()
              break;
          case 'Add a role':
              addRole()
              break;
          case 'Add a department':
              addDep()
              break;
          default:
              connection.end()
              process.exit(0)
      }
    })
}

const viewEmployee = () => {
  const query = 
    "SELECT * FROM employee"
    connection.query(query, (err, res) => {
      if (err) throw err;
      console.table(res)
      startMenu()
    });
}

const viewRoles = () => {
  const query = 
    "SELECT * FROM role"
    connection.query(query, (err, res) => {
      if (err) throw err;
      console.table(res)
      startMenu()
    });
}

const viewDeps = () => {
  const query = 
    "SELECT * FROM department"
    connection.query(query, (err, res) => {
      if (err) throw err;
      console.table(res)
      startMenu()
    });
}

const addEmployee = () => {
  
}

const addRole = () => {
  const query = "SELECT id, name FROM department"
  connection.query(query,
    (err, data) => {
      if (err) throw err
      console.log(data)
      let depNames = []
      data.forEach(item => {
        depNames.push(item.name) 
      });
      inquirer.prompt([
        {
        name:"addRole",
        type:"input",
        message:"Which role would you like add?",
        },
        {
        name:"addSalary",
        type:"input",
        message:"Enter the Salary for this role.",
        },
        {
        name: "getDep",
        type: "list",
        message: "Select department.",
        choices: depNames,
        }
      ])
      .then(({ addRole, addSalary, getDep }) => {
        const query = "INSERT INTO role SET ?"
        connection.query(query, {title: addRole, salary: addSalary},
        (err, data) => {
          if (err) throw err
          startMenu()
        })
      })
    }
  )
  
}

const addDep = () => {
  inquirer.prompt({
    name:"addDep",
    type:"input",
    message:"Which department would you like add?",
}).then(({ addDep }) => {
  const query = 
  "INSERT INTO department SET ?"
connection.query(query, {name: addDep},
  (err, data) => {
    if (err) throw err
    startMenu()
})
})
}

const getDepInfo = () => {
  const query = "SELECT id, name FROM department"
  connection.query(query,
    (err, data) => {
      if (err) throw err
      let depNames = []
      data.forEach(item => {
        depNames.push(item.name) 
      });
    }
  )
}


// Connect to the DB
connection.connect((err) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}\n`);
    startMenu()
});
