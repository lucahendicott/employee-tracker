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
        'View employees', 
        'View roles', 
        'View departments',
        'Add an employee', 
        'Add a role', 
        'Add a department',
        "exit"
        ]
    })
    .then(({ choiceList }) => {
      switch (choiceList) {
          case 'View employees':
              viewEmployee()
              break;
          case 'View roles':
              viewRoles()
              break;
          case 'View departments':
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
  
}

const addDep = () => {
  
}


// Connect to the DB
connection.connect((err) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}\n`);
    startMenu()
});
