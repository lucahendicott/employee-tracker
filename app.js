const mysql = require('mysql');
const inquirer = require('inquirer');

// create the connection information for the sql database
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'emptracker_db',
});

// start menu function prompting user to choose what they owuld like to do
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
        'Update an employee role',
        'exit'
        ]
    })
    // Add all options to switch case with corresponding functions
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
          case 'Update an employee role':
              updateRole()
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

//function to show all employees and their corresponding info with console.table
const viewEmployee = () => {
  const query = 
    "SELECT employee.first_name, employee.last_name, role.title, role.salary, department.name, CONCAT(e.first_name, ' ' ,e.last_name) AS Manager FROM employee INNER JOIN role on role.id = employee.role_id INNER JOIN department on department.id = role.department_id left join employee e on employee.manager_id = e.id;"
    connection.query(query, (err, res) => {
      if (err) throw err;
      console.table(res)
      startMenu()
    });
}

const viewRoles = () => {
  const query = 
  "SELECT employee.first_name, employee.last_name, role.title AS Title FROM employee JOIN role ON employee.role_id = role.id;"
    connection.query(query, (err, res) => {
      if (err) throw err;
      console.table(res)
      startMenu()
    });
}

const viewDeps = () => {
  const query = 
  "SELECT employee.first_name, employee.last_name, department.name AS Department FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id ORDER BY employee.id;"
    connection.query(query, (err, res) => {
      if (err) throw err;
      console.table(res)
      startMenu()
    });
}


//add employee function that querys user response for first and last name into database
const addEmployee = () => {
  const query = "SELECT id, first_name, last_name FROM employee"
  connection.query(query,
    (err, allEmpData) => {
      if (err) throw err
      const queryTwo = "SELECT id, title FROM role"
      connection.query(queryTwo, 
        (err, allRoleData) => {
          if (err) throw err
          //looping over any employee and role data entered by user to offer those as options for an employee's role and manger
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
          //setting the manager and role id's for each employee and role
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

//function to show employees in table by last name first
const combineName = (firstName, lastName) => {
    return `${lastName}, ${firstName}`
}

//
const updateRole = () => {
  const queryOne = "SELECT id, first_name, last_name FROM employee"
    connection.query(queryOne,
      (err, allEmpData) => {
      if (err) throw err
        const query = "SELECT id, title FROM role"
          connection.query(query,
            (err, data) => {
            if (err) throw err
            let allRoles = []
              data.forEach(item => {
              allRoles.push(item.title)
              })
              let employees = []
              allEmpData.forEach(item => {
                employees.push(combineName(item.first_name, item.last_name))
              })
                inquirer.prompt([
                  {
                  name: "roleChoices",
                  type: "list",
                  message: "Select new role:",
                  choices: allRoles,
                  },
                  {
                  name: "empChoices",
                  type: "list",
                  message: "Select employee to update:",
                  choices: employees,
                  },
                ])
              .then(({ roleChoices, empChoices }) => {
                let roleID
                data.forEach(item => {
                if(roleChoices === item.title){
                roleID = item.id
                }
                });
                let empID
                allEmpData.forEach(item => {
                if(empChoices === combineName(item.first_name, item.last_name)){
                empID = item.id
                }
                });
                const query = "UPDATE employee SET role_id = ? WHERE id = ?"
                connection.query(query, [roleID, empID],
                  (err, res) => {
                  if (err) throw err
                  startMenu()
                  })
              })
            }
          )
      }
  )
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
      // setting department id
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
