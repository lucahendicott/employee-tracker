USE emptracker_db;

INSERT INTO	 department (name)
VALUES ("kitchen");

INSERT INTO	 role (title, salary, department_id)
VALUES ("manager", 100000.00, 1);

INSERT INTO	 employee (first_name, last_name, role_id, manager_id)
VALUES ("Ron", "McDonald", 1, NULL);