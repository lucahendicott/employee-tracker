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
  const query = "SELECT id, first_name, last_name FROM employee"
  connection.query(query,
    (err, allEmpData) => {
      if (err) throw err
      const queryTwo = "SELECT id, title FROM role"
      connection.query(queryTwo, 
        (err, allRoleData) => {
          if (err) throw err
          let empData = []
          empData.push("No Manager")
          allEmpData.forEach(item => {
            empData.push(combineName(item.first_name, item.last_name))
          });
          let roleData = []
          allRoleData.forEach(item => {
            roleData.push(item.title)
          })
          inquirer.prompt([
            {
              name: "firstName",
              type: "input",
              message: "Enter employee's first name:",
            },
            {
              name: "lastName",
              type: "input",
              message: "Enter employee's last name:",
            },
            {
              name: "chooseRole",
              type: "list",
              message: "Choose employee's role:",
              choices: roleData,
            },
            {
              name: "chooseManager",
              type: "list",
              message: "Choose employee's manager:",
              choices: empData,
            },
          ])
          .then(({ firstName, lastName, chooseRole, chooseManager }) => {
            let managerID
            allEmpData.forEach(item => {
              if(chooseManager === combineName(item.first_name, item.last_name)){
                managerID = item.id
              }
            });
            let roleID
            allRoleData.forEach(item => {
              if(chooseRole === item.title){
                roleID = item.id
              }
            });
            const insertQuery = "INSERT INTO employee SET ?"
            connection.query(insertQuery, {
              first_name: firstName, 
              last_name: lastName, 
              role_id: roleID, 
              manager_id: managerID },
              (err, data) => {
                if(err) throw err
                startMenu()
              }
            )
          })
        }
      )
    }
  )
}

const combineName = (firstName, lastName) => {
    return `${lastName}, ${firstName}`
}

const addRole = () => {
  const query = "SELECT id, name FROM department"
  connection.query(query,
    (err, data) => {
      if (err) throw err
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
        let depID
        data.forEach(item => {
          if(getDep === item.name){
            depID = item.id
          }
        });
        const query = "INSERT INTO role SET ?"
        connection.query(query, {title: addRole, salary: addSalary, department_id: depID},
        (err, res) => {
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
})
.then(({ addDep }) => {
  const query = 
  "INSERT INTO department SET ?"
  connection.query(query, {name: addDep},
  (err, data) => {
    if (err) throw err
    startMenu()
})
})
}

// Connect to the DB
connection.connect((err) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}\n`);
    startMenu()
});
