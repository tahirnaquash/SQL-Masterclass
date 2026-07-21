import { TrainingSession } from "./types";

export const TRAINING_SESSIONS: TrainingSession[] = [
  {
    number: 1,
    title: "Session 1 — Data Retrieval, Filtering and Sorting",
    domain: "E-Commerce Order Management System",
    topics: ["SELECT", "WHERE", "AND", "OR", "BETWEEN", "IN", "LIKE", "NOT LIKE", "ORDER BY", "LIMIT"],
    tables: [
      {
        name: "CUSTOMER",
        schema: "customer_id INT, customer_name VARCHAR(100), email VARCHAR(100), city VARCHAR(50)",
        desc: "Stores customer details such as name, email, and their residing city."
      },
      {
        name: "PRODUCT",
        schema: "product_id INT, product_name VARCHAR(100), category VARCHAR(50), price DECIMAL(10,2)",
        desc: "Stores catalog products, categories, and their pricing."
      },
      {
        name: "ORDERS",
        schema: "order_id INT, customer_id INT, order_date DATE, order_amount DECIMAL(10,2)",
        desc: "Tracks order details including the customer who bought them, date, and overall amount."
      }
    ],
    seedSQL: `
      CREATE TABLE CUSTOMER (
        customer_id INT,
        customer_name VARCHAR(100),
        email VARCHAR(100),
        city VARCHAR(50)
      );

      CREATE TABLE PRODUCT (
        product_id INT,
        product_name VARCHAR(100),
        category VARCHAR(50),
        price DECIMAL(10,2)
      );

      CREATE TABLE ORDERS (
        order_id INT,
        customer_id INT,
        order_date DATE,
        order_amount DECIMAL(10,2)
      );

      INSERT INTO CUSTOMER VALUES 
      (1, 'Arun Kumar', 'arun@gmail.com', 'Bengaluru'),
      (2, 'Sneha Rao', 'sneha@gmail.com', 'Bengaluru'),
      (3, 'Mohammed Ali', 'ali@gmail.com', 'Bengaluru'),
      (4, 'Ananya Rao', 'ananya@gmail.com', 'Mysuru'),
      (5, 'Ahmed Khan', 'ahmed@gmail.com', 'Hyderabad'),
      (6, 'Rahul Sharma', 'rahul@gmail.com', 'Mumbai');

      INSERT INTO PRODUCT VALUES 
      (1, 'Dell XPS 15', 'Laptop', 125000),
      (2, 'iPhone 16 Pro', 'Mobile', 119900),
      (3, 'Samsung OLED TV', 'Television', 145000),
      (4, 'Acer Aspire 5', 'Laptop', 45000),
      (5, 'Lenovo IdeaPad', 'Laptop', 58000),
      (6, 'HP Pavilion', 'Laptop', 72000),
      (7, 'iPad Air', 'Tablet', 54000),
      (8, 'Redmi Note 13', 'Mobile', 25000),
      (9, 'Refurbished Dell Latitude', 'Laptop', 35000),
      (10, 'Refurbished iPad Pro', 'Tablet', 45000);

      INSERT INTO ORDERS VALUES 
      (1054, 201, '2025-11-20', 425000),
      (1087, 245, '2025-12-15', 275000),
      (1032, 189, '2025-10-12', 150000),
      (1001, 101, '2025-05-10', 50000),
      (1022, 102, '2025-12-01', 80000);
    `,
    questions: [
      {
        id: "s1_q1",
        title: "Easy Question 1 — Premium Product Search",
        difficulty: "Easy",
        scenario: "An online shopping company maintains thousands of products. The sales team wants to identify premium products costing more than ₹50,000 for a special advertising campaign.",
        questionText: "Write an SQL query to display the product name, category and price of all products whose price is greater than ₹50,000.",
        solutionQuery: "SELECT product_name, category, price FROM PRODUCT WHERE price > 50000;",
        hint: "Use SELECT with the columns product_name, category, price. Filter the records using WHERE price > 50000.",
        concepts: ["SELECT", "WHERE", "Comparison Operator (>)"]
      },
      {
        id: "s1_q2",
        title: "Easy Question 2 — City-Based Customer Search",
        difficulty: "Easy",
        scenario: "The marketing team wants to conduct a promotional campaign specifically for customers living in Bengaluru.",
        questionText: "Write an SQL query to display the customer name, email and city of all customers from Bengaluru.",
        solutionQuery: "SELECT customer_name, email, city FROM CUSTOMER WHERE city = 'Bengaluru';",
        hint: "Select customer_name, email, city from the CUSTOMER table. Filter rows where city is exactly equal to 'Bengaluru'.",
        concepts: ["SELECT", "WHERE", "String Comparison (=)"]
      },
      {
        id: "s1_q3",
        title: "Medium Question 1 — Laptop Price Range Search",
        difficulty: "Medium",
        scenario: "A customer wants to purchase a laptop with a budget between ₹40,000 and ₹80,000. The shopping portal should display the cheapest laptop first.",
        questionText: "Display the product name, category and price of laptops priced between ₹40,000 and ₹80,000. Sort the result from lowest price to highest price.",
        solutionQuery: "SELECT product_name, category, price FROM PRODUCT WHERE category = 'Laptop' AND price BETWEEN 40000 AND 80000 ORDER BY price ASC;",
        hint: "Combine filters: category must be 'Laptop' AND price must be BETWEEN 40000 AND 80000. Sort using ORDER BY price ASC.",
        concepts: ["AND", "BETWEEN", "ORDER BY ASC"]
      },
      {
        id: "s1_q4",
        title: "Medium Question 2 — Multi-City Customer Campaign",
        difficulty: "Medium",
        scenario: "The marketing department plans a campaign for customers from Bengaluru, Mysuru and Hyderabad. However, the current campaign targets only customers whose names begin with the letter A.",
        questionText: "Display the customer name, email and city of customers belonging to Bengaluru, Mysuru or Hyderabad whose names start with the letter A.",
        solutionQuery: "SELECT customer_name, email, city FROM CUSTOMER WHERE city IN ('Bengaluru', 'Mysuru', 'Hyderabad') AND customer_name LIKE 'A%';",
        hint: "Use IN to check for multiple cities and LIKE 'A%' to filter names starting with 'A'.",
        concepts: ["IN", "LIKE", "Wildcard (%)", "AND"]
      },
      {
        id: "s1_q5",
        title: "Hard Question 1 — High-Value Recent Orders",
        difficulty: "Hard",
        scenario: "The finance department wants to investigate high-value orders placed during the last quarter of 2025.",
        questionText: "Display the order ID, customer ID, order date and order amount of orders placed between October 1, 2025 and December 31, 2025 having an order amount greater than ₹1,00,000. Display the highest-value order first.",
        solutionQuery: "SELECT order_id, customer_id, order_date, order_amount FROM ORDERS WHERE order_date BETWEEN '2025-10-01' AND '2025-12-31' AND order_amount > 100000 ORDER BY order_amount DESC;",
        hint: "Use BETWEEN with date strings '2025-10-01' AND '2025-12-31', filter on order_amount > 100000, and ORDER BY order_amount DESC.",
        concepts: ["Date filtering", "BETWEEN", "Multiple conditions", "Descending sorting"]
      },
      {
        id: "s1_q6",
        title: "Hard Question 2 — Priority Product Identification",
        difficulty: "Hard",
        scenario: "The inventory manager wants to monitor expensive electronic products. Only laptops, mobiles and tablets must be considered. Refurbished products must not be included.",
        questionText: "Display the product name, category and price of products belonging to Laptop, Mobile or Tablet categories and priced above ₹30,000. Exclude products whose names contain the word Refurbished. Display only the five highest-priced products.",
        solutionQuery: "SELECT product_name, category, price FROM PRODUCT WHERE category IN ('Laptop', 'Mobile', 'Tablet') AND price > 30000 AND product_name NOT LIKE '%Refurbished%' ORDER BY price DESC LIMIT 5;",
        hint: "Combine IN for categories, price > 30000, and NOT LIKE '%Refurbished%'. Limit the results to 5 using LIMIT 5 and ORDER BY price DESC.",
        concepts: ["IN", "NOT LIKE", "Multiple filtering", "ORDER BY DESC", "LIMIT"]
      }
    ]
  },
  {
    number: 2,
    title: "Session 2 — Aggregate Functions, Group By and Having",
    domain: "Banking Transaction System",
    topics: ["COUNT", "SUM", "AVG", "MIN", "MAX", "GROUP BY", "HAVING"],
    tables: [
      {
        name: "CUSTOMER",
        schema: "customer_id INT, customer_name VARCHAR(100), city VARCHAR(50)",
        desc: "Stores core customer demographic information."
      },
      {
        name: "ACCOUNT",
        schema: "account_no INT, customer_id INT, account_type VARCHAR(30), balance DECIMAL(12,2), status VARCHAR(20)",
        desc: "Stores customer bank accounts, types, balance, and account status (e.g. Active, Inactive)."
      },
      {
        name: "TRANSACTIONS",
        schema: "transaction_id INT, account_no INT, transaction_type VARCHAR(30), transaction_amount DECIMAL(12,2), transaction_date DATE",
        desc: "Tracks financial transactions per account including payment types (UPI, ATM, NEFT, IMPS) and amounts."
      }
    ],
    seedSQL: `
      CREATE TABLE CUSTOMER (
        customer_id INT,
        customer_name VARCHAR(100),
        city VARCHAR(50)
      );

      CREATE TABLE ACCOUNT (
        account_no INT,
        customer_id INT,
        account_type VARCHAR(30),
        balance DECIMAL(12,2),
        status VARCHAR(20)
      );

      CREATE TABLE TRANSACTIONS (
        transaction_id INT,
        account_no INT,
        transaction_type VARCHAR(30),
        transaction_amount DECIMAL(12,2),
        transaction_date DATE
      );

      INSERT INTO CUSTOMER VALUES 
      (101, 'Arun Kumar', 'Bengaluru'),
      (102, 'Sneha Rao', 'Bengaluru'),
      (103, 'Ananya Rao', 'Mysuru');

      INSERT INTO ACCOUNT VALUES 
      (1001, 101, 'Savings', 50000.00, 'Active'),
      (1002, 102, 'Current', 120000.00, 'Active'),
      (1003, 103, 'Savings', 15000.00, 'Inactive'),
      (1015, 101, 'Current', 2500000.00, 'Active'),
      (1042, 102, 'Savings', 1800000.00, 'Active');

      INSERT INTO TRANSACTIONS VALUES 
      (1, 1001, 'UPI', 450000.00, '2026-01-01'),
      (2, 1001, 'ATM', 400000.00, '2026-01-02'),
      (3, 1002, 'NEFT', 225000.00, '2026-01-03'),
      (4, 1002, 'IMPS', 200000.00, '2026-01-04'),
      (5, 1003, 'IMPS', 1275000.00, '2026-01-05'),
      (6, 1015, 'NEFT', 2450000.00, '2026-01-06'),
      (7, 1042, 'ATM', 1850000.00, '2026-01-07');

      INSERT INTO TRANSACTIONS VALUES 
      (8, 1001, 'UPI', 100.00, '2026-01-08'),
      (9, 1001, 'UPI', 120000.00, '2026-01-09'),
      (10, 1001, 'UPI', 150000.00, '2026-01-10'),
      (11, 1001, 'UPI', 110000.00, '2026-01-11'),
      (12, 1001, 'UPI', 105000.00, '2026-01-12'),
      (13, 1001, 'UPI', 130000.00, '2026-01-13'),
      (14, 1001, 'UPI', 140000.00, '2026-01-14'),
      (15, 1001, 'UPI', 115000.00, '2026-01-15'),
      (16, 1001, 'UPI', 125000.00, '2026-01-16'),
      (17, 1001, 'UPI', 135000.00, '2026-01-17'),
      (18, 1001, 'UPI', 145000.00, '2026-01-18'),
      (19, 1001, 'UPI', 160000.00, '2026-01-19');
    `,
    questions: [
      {
        id: "s2_q1",
        title: "Easy Question 1 — Total Active Bank Accounts",
        difficulty: "Easy",
        scenario: "The bank manager wants to know the total number of active accounts currently maintained by the bank.",
        questionText: "Find the total number of accounts having the status 'Active'.",
        solutionQuery: "SELECT COUNT(*) AS total_active_accounts FROM ACCOUNT WHERE status = 'Active';",
        hint: "Use COUNT(*) to count rows and use the alias 'total_active_accounts'. Filter using status = 'Active'.",
        concepts: ["COUNT", "WHERE", "Column Alias"]
      },
      {
        id: "s2_q2",
        title: "Easy Question 2 — Transaction Amount Summary",
        difficulty: "Easy",
        scenario: "The branch manager wants a quick statistical summary of all transaction amounts processed by the bank.",
        questionText: "Find the highest, lowest and average transaction amount.",
        solutionQuery: "SELECT MAX(transaction_amount) AS highest_amount, MIN(transaction_amount) AS lowest_amount, AVG(transaction_amount) AS average_amount FROM TRANSACTIONS;",
        hint: "Use the aggregate functions MAX(), MIN(), and AVG() with appropriate aliases: highest_amount, lowest_amount, and average_amount.",
        concepts: ["MAX", "MIN", "AVG"]
      },
      {
        id: "s2_q3",
        title: "Medium Question 1 — Account-Wise Transaction Value",
        difficulty: "Medium",
        scenario: "The bank wants to calculate the total transaction value handled by every account.",
        questionText: "Display each account number and the total transaction amount associated with the account.",
        solutionQuery: "SELECT account_no, SUM(transaction_amount) AS total_transaction_amount FROM TRANSACTIONS GROUP BY account_no;",
        hint: "Group rows by account_no using GROUP BY and calculate the sum using SUM(transaction_amount) with the alias 'total_transaction_amount'.",
        concepts: ["SUM", "GROUP BY"]
      },
      {
        id: "s2_q4",
        title: "Medium Question 2 — Transaction Type Analysis",
        difficulty: "Medium",
        scenario: "The finance department wants to understand how customers use different transaction channels such as UPI, ATM, NEFT and IMPS.",
        questionText: "Display each transaction type and the total number of transactions performed using that type.",
        solutionQuery: "SELECT transaction_type, COUNT(*) AS total_transactions FROM TRANSACTIONS GROUP BY transaction_type;",
        hint: "Group by transaction_type and count the rows in each group using COUNT(*). Use the alias 'total_transactions'.",
        concepts: ["COUNT", "GROUP BY"]
      },
      {
        id: "s2_q5",
        title: "Hard Question 1 — High Transaction Accounts",
        difficulty: "Hard",
        scenario: "The fraud monitoring team wants to identify bank accounts whose total transaction activity exceeds ₹10,00,000.",
        questionText: "Display the account numbers and total transaction amount of accounts whose total transaction amount exceeds ₹10,00,000.",
        solutionQuery: "SELECT account_no, SUM(transaction_amount) AS total_transaction_amount FROM TRANSACTIONS GROUP BY account_no HAVING SUM(transaction_amount) > 1000000;",
        hint: "Group by account_no, sum the transaction amounts, and filter the grouped result using HAVING SUM(transaction_amount) > 1000000.",
        concepts: ["GROUP BY", "SUM", "HAVING"]
      },
      {
        id: "s2_q6",
        title: "Hard Question 2 — Frequent High-Value Transaction Modes",
        difficulty: "Hard",
        scenario: "The bank's risk analysis team wants to identify transaction modes frequently used for high-value transactions.",
        questionText: "Consider only transactions above ₹50,000. Display transaction types having more than 10 such transactions and an average transaction amount greater than ₹1,00,000.",
        solutionQuery: "SELECT transaction_type, COUNT(*) AS transaction_count, AVG(transaction_amount) AS average_amount FROM TRANSACTIONS WHERE transaction_amount > 50000 GROUP BY transaction_type HAVING COUNT(*) > 10 AND AVG(transaction_amount) > 100000;",
        hint: "Filter individual rows using WHERE transaction_amount > 50000, then GROUP BY transaction_type, and filter groups using HAVING COUNT(*) > 10 AND AVG(transaction_amount) > 100000.",
        concepts: ["WHERE before grouping", "GROUP BY", "Multiple aggregate functions", "HAVING"]
      }
    ]
  },
  {
    number: 3,
    title: "Session 3 — SQL Joins and Multi-Table Reporting",
    domain: "Hospital Management System",
    topics: ["INNER JOIN", "LEFT JOIN", "Multiple JOINs", "NULL Checking", "COUNT DISTINCT", "SELF JOIN"],
    tables: [
      {
        name: "PATIENT",
        schema: "patient_id INT, patient_name VARCHAR(100), city VARCHAR(50)",
        desc: "Stores general record of patients."
      },
      {
        name: "DEPARTMENT",
        schema: "department_id INT, department_name VARCHAR(100)",
        desc: "Stores clinical departments (e.g. Cardiology, Neurology)."
      },
      {
        name: "DOCTOR",
        schema: "doctor_id INT, doctor_name VARCHAR(100), specialization VARCHAR(100), department_id INT",
        desc: "Stores doctor profile, specialization, and department mapping."
      },
      {
        name: "APPOINTMENT",
        schema: "appointment_id INT, patient_id INT, doctor_id INT, appointment_date DATE, appointment_status VARCHAR(30)",
        desc: "Tracks patient bookings with specific doctors, dates, and statuses."
      }
    ],
    seedSQL: `
      CREATE TABLE PATIENT (
        patient_id INT,
        patient_name VARCHAR(100),
        city VARCHAR(50)
      );

      CREATE TABLE DEPARTMENT (
        department_id INT,
        department_name VARCHAR(100)
      );

      CREATE TABLE DOCTOR (
        doctor_id INT,
        doctor_name VARCHAR(100),
        specialization VARCHAR(100),
        department_id INT
      );

      CREATE TABLE APPOINTMENT (
        appointment_id INT,
        patient_id INT,
        doctor_id INT,
        appointment_date DATE,
        appointment_status VARCHAR(30)
      );

      INSERT INTO PATIENT VALUES 
      (1, 'Ramesh Kumar', 'Bengaluru'),
      (2, 'Ayesha Khan', 'Mysuru'),
      (3, 'Priya Rao', 'Bengaluru'),
      (4, 'Amit Patel', 'Mumbai');

      INSERT INTO DEPARTMENT VALUES 
      (10, 'Cardiology'),
      (20, 'Pediatrics'),
      (30, 'Neurology'),
      (40, 'Orthopedics');

      INSERT INTO DOCTOR VALUES 
      (101, 'Dr. Arvind Swamy', 'Cardiologist', 10),
      (102, 'Dr. Sarah Williams', 'Pediatrician', 20),
      (103, 'Dr. Rajesh Koothrappali', 'Neurologist', 30),
      (104, 'Dr. David Geller', 'Pediatrician', 20);

      INSERT INTO APPOINTMENT VALUES 
      (501, 1, 101, '2026-01-10', 'Scheduled'),
      (502, 2, 102, '2026-01-10', 'Scheduled'),
      (503, 3, 103, '2026-01-11', 'Scheduled');
    `,
    questions: [
      {
        id: "s3_q1",
        title: "Easy Question 1 — Patient Appointment Report",
        difficulty: "Easy",
        scenario: "The hospital receptionist wants to view patient names along with their appointment dates.",
        questionText: "Display the patient name and appointment date for every scheduled appointment.",
        solutionQuery: "SELECT P.patient_name, A.appointment_date FROM PATIENT P INNER JOIN APPOINTMENT A ON P.patient_id = A.patient_id;",
        hint: "Perform an INNER JOIN between PATIENT and APPOINTMENT using patient_id. Display P.patient_name and A.appointment_date.",
        concepts: ["INNER JOIN", "Primary/Foreign Key relationships"]
      },
      {
        id: "s3_q2",
        title: "Easy Question 2 — Doctor Department Report",
        difficulty: "Easy",
        scenario: "Hospital administration wants to prepare a directory showing every doctor's specialization and department.",
        questionText: "Display doctor name, specialization and department name.",
        solutionQuery: "SELECT D.doctor_name, D.specialization, DP.department_name FROM DOCTOR D INNER JOIN DEPARTMENT DP ON D.department_id = DP.department_id;",
        hint: "INNER JOIN DOCTOR and DEPARTMENT tables on department_id. Select doctor_name, specialization, and department_name.",
        concepts: ["INNER JOIN", "Table Aliases"]
      },
      {
        id: "s3_q3",
        title: "Medium Question 1 — Complete Appointment Schedule",
        difficulty: "Medium",
        scenario: "The hospital wants a detailed appointment schedule containing patient and doctor information.",
        questionText: "Display patient name, doctor name, specialization, appointment date and appointment status.",
        solutionQuery: "SELECT P.patient_name, D.doctor_name, D.specialization, A.appointment_date, A.appointment_status FROM APPOINTMENT A INNER JOIN PATIENT P ON A.patient_id = P.patient_id INNER JOIN DOCTOR D ON A.doctor_id = D.doctor_id;",
        hint: "You need three tables: APPOINTMENT, PATIENT, and DOCTOR. Chain them using INNER JOINs: APPOINTMENT with PATIENT on patient_id, and with DOCTOR on doctor_id.",
        concepts: ["Multiple INNER JOINs"]
      },
      {
        id: "s3_q4",
        title: "Medium Question 2 — Patients Without Appointments",
        difficulty: "Medium",
        scenario: "The hospital wants to identify registered patients who have never booked an appointment.",
        questionText: "Display the patient ID and patient name of patients having no appointment records.",
        solutionQuery: "SELECT P.patient_id, P.patient_name FROM PATIENT P LEFT JOIN APPOINTMENT A ON P.patient_id = A.patient_id WHERE A.appointment_id IS NULL;",
        hint: "Use a LEFT JOIN from PATIENT to APPOINTMENT to keep all patients. Filter the unmatched records using WHERE A.appointment_id IS NULL.",
        concepts: ["LEFT JOIN", "Unmatched records", "IS NULL"]
      },
      {
        id: "s3_q5",
        title: "Hard Question 1 — Department-Wise Unique Patient Load",
        difficulty: "Hard",
        scenario: "Hospital management wants to analyze the total number of unique patients handled by each department. Departments having no patients must also appear in the report.",
        questionText: "Display department name and total number of unique patients treated by doctors belonging to the department. Include departments that have not treated any patients.",
        solutionQuery: "SELECT DP.department_name, COUNT(DISTINCT A.patient_id) AS total_patients FROM DEPARTMENT DP LEFT JOIN DOCTOR D ON DP.department_id = D.department_id LEFT JOIN APPOINTMENT A ON D.doctor_id = A.doctor_id GROUP BY DP.department_id, DP.department_name;",
        hint: "Start with DEPARTMENT, LEFT JOIN with DOCTOR, then LEFT JOIN with APPOINTMENT. Group by department_id/name and use COUNT(DISTINCT A.patient_id) to count unique patients.",
        concepts: ["Multiple LEFT JOINs", "COUNT DISTINCT", "GROUP BY"]
      },
      {
        id: "s3_q6",
        title: "Hard Question 2 — Doctors with the Same Specialization",
        difficulty: "Hard",
        scenario: "The hospital wants to identify doctors who can substitute for each other because they have the same specialization.",
        questionText: "Display pairs of doctors having the same specialization. The same pair must not be displayed twice, and a doctor must not be paired with himself or herself.",
        solutionQuery: "SELECT D1.doctor_name AS doctor_1, D2.doctor_name AS doctor_2, D1.specialization FROM DOCTOR D1 INNER JOIN DOCTOR D2 ON D1.specialization = D2.specialization AND D1.doctor_id < D2.doctor_id;",
        hint: "Perform a SELF JOIN on the DOCTOR table. Match specialization: D1.specialization = D2.specialization. Prevent self-pairing and duplicate pairs using D1.doctor_id < D2.doctor_id.",
        concepts: ["SELF JOIN", "Duplicate pair elimination"]
      }
    ]
  },
  {
    number: 4,
    title: "Session 4 — Subqueries and Nested Queries",
    domain: "College Placement Management System",
    topics: ["Single-row Subquery", "Aggregate Subquery", "IN", "NOT EXISTS", "Correlated Subquery"],
    tables: [
      {
        name: "STUDENT",
        schema: "student_id INT, student_name VARCHAR(100), department VARCHAR(50), cgpa DECIMAL(4,2)",
        desc: "Tracks college students, their academic departments, and CGPA."
      },
      {
        name: "COMPANY",
        schema: "company_id INT, company_name VARCHAR(100), job_role VARCHAR(100), package DECIMAL(6,2)",
        desc: "Stores corporate partner details, positions, and salary packages offered (in LPA)."
      },
      {
        name: "PLACEMENT",
        schema: "placement_id INT, student_id INT, company_id INT, placement_date DATE, status VARCHAR(30)",
        desc: "Tracks recruitment status ('Selected', 'Rejected') of student applicants at different companies."
      }
    ],
    seedSQL: `
      CREATE TABLE STUDENT (
        student_id INT,
        student_name VARCHAR(100),
        department VARCHAR(50),
        cgpa DECIMAL(4,2)
      );

      CREATE TABLE COMPANY (
        company_id INT,
        company_name VARCHAR(100),
        job_role VARCHAR(100),
        package DECIMAL(6,2)
      );

      CREATE TABLE PLACEMENT (
        placement_id INT,
        student_id INT,
        company_id INT,
        placement_date DATE,
        status VARCHAR(30)
      );

      INSERT INTO STUDENT VALUES 
      (1, 'Aditya Sen', 'CSE', 8.5),
      (2, 'Aishwarya Rai', 'CSE', 7.2),
      (3, 'Abhishek Bachchan', 'ISE', 9.0),
      (4, 'Hrithik Roshan', 'ISE', 7.5),
      (5, 'Ranbir Kapoor', 'ECE', 6.0),
      (6, 'Deepika Padukone', 'ECE', 8.2);

      INSERT INTO COMPANY VALUES 
      (10, 'Google', 'Software Engineer', 35.0),
      (11, 'Microsoft', 'Data Scientist', 28.0),
      (12, 'Infosys', 'Systems Engineer', 4.5),
      (13, 'Wipro', 'Developer', 3.6);

      INSERT INTO PLACEMENT VALUES 
      (201, 1, 10, '2026-05-15', 'Selected'),
      (202, 3, 11, '2026-05-16', 'Selected'),
      (203, 6, 12, '2026-05-17', 'Selected'),
      (204, 2, 13, '2026-05-18', 'Selected');
    `,
    questions: [
      {
        id: "s4_q1",
        title: "Easy Question 1 — Students Above Average CGPA",
        difficulty: "Easy",
        scenario: "The placement officer wants to identify academically strong students whose CGPA is higher than the overall college average.",
        questionText: "Display student name, department and CGPA of students whose CGPA is greater than the average CGPA of all students.",
        solutionQuery: "SELECT student_name, department, cgpa FROM STUDENT WHERE cgpa > (SELECT AVG(cgpa) FROM STUDENT);",
        hint: "Use an aggregate subquery to calculate the average CGPA: (SELECT AVG(cgpa) FROM STUDENT). Compare student CGPA against it.",
        concepts: ["Single-row Subquery", "Aggregate Subquery"]
      },
      {
        id: "s4_q2",
        title: "Easy Question 2 — Above Average Package Companies",
        difficulty: "Easy",
        scenario: "The placement department wants to identify companies offering better-than-average salary packages.",
        questionText: "Display company name, job role and package of companies offering a package greater than the average package of all companies.",
        solutionQuery: "SELECT company_name, job_role, package FROM COMPANY WHERE package > (SELECT AVG(package) FROM COMPANY);",
        hint: "Write a subquery in the WHERE clause: WHERE package > (SELECT AVG(package) FROM COMPANY).",
        concepts: ["AVG in Subquery", "Subquery Comparison"]
      },
      {
        id: "s4_q3",
        title: "Medium Question 1 — Students Placed in Premium Companies",
        difficulty: "Medium",
        scenario: "The college wants to recognize students selected by companies offering packages above ₹10 LPA.",
        questionText: "Display the student ID, student name, department and CGPA of students placed in companies offering packages greater than ₹10 LPA.",
        solutionQuery: "SELECT student_id, student_name, department, cgpa FROM STUDENT WHERE student_id IN (SELECT student_id FROM PLACEMENT WHERE company_id IN (SELECT company_id FROM COMPANY WHERE package > 10) AND status = 'Selected');",
        hint: "This uses multiple nested subqueries. Innermost selects company_id from COMPANY where package > 10. Middle subquery finds student_id from PLACEMENT with matching company_id and status = 'Selected'. Outer selects STUDENT details.",
        concepts: ["Nested Subqueries", "IN Operator"]
      },
      {
        id: "s4_q4",
        title: "Medium Question 2 — Students Without Placement Offers",
        difficulty: "Medium",
        scenario: "The placement officer wants to identify students requiring additional placement training because they have not received any placement offer.",
        questionText: "Display student ID, student name and department of students who do not have any placement record.",
        solutionQuery: "SELECT S.student_id, S.student_name, S.department FROM STUDENT S WHERE NOT EXISTS (SELECT 1 FROM PLACEMENT P WHERE P.student_id = S.student_id);",
        hint: "Use WHERE NOT EXISTS and a correlated subquery checking if the PLACEMENT record's student_id matches the STUDENT's student_id.",
        concepts: ["NOT EXISTS", "Correlated Query Logic"]
      },
      {
        id: "s4_q5",
        title: "Hard Question 1 — Department Top Performers",
        difficulty: "Hard",
        scenario: "College management wants to identify the student having the highest CGPA in each department.",
        questionText: "Display department, student name and CGPA of the highest-CGPA student in every department.",
        solutionQuery: "SELECT S.department, S.student_name, S.cgpa FROM STUDENT S WHERE S.cgpa = (SELECT MAX(S2.cgpa) FROM STUDENT S2 WHERE S2.department = S.department);",
        hint: "Write a correlated subquery in the WHERE clause that computes the MAX(cgpa) grouped by the same department: (SELECT MAX(S2.cgpa) FROM STUDENT S2 WHERE S2.department = S.department).",
        concepts: ["Correlated Subquery", "Group-wise maximum"]
      },
      {
        id: "s4_q6",
        title: "Hard Question 2 — Students Above Their Department Average",
        difficulty: "Hard",
        scenario: "The placement team wants to identify students performing better than the average performance of their own department.",
        questionText: "Display student name, department and CGPA of students whose CGPA is greater than the average CGPA of students belonging to the same department.",
        solutionQuery: "SELECT S.student_name, S.department, S.cgpa FROM STUDENT S WHERE S.cgpa > (SELECT AVG(S2.cgpa) FROM STUDENT S2 WHERE S2.department = S.department);",
        hint: "Write a correlated subquery to find average CGPA per department: (SELECT AVG(S2.cgpa) FROM STUDENT S2 WHERE S2.department = S.department). Use '>' to filter students.",
        concepts: ["Correlated Aggregate Subquery", "Row-by-row comparison"]
      }
    ]
  },
  {
    number: 5,
    title: "Session 5 — Advanced SQL and Analytical Query Processing",
    domain: "Food Delivery and Sales Analytics System",
    topics: ["Common Table Expressions", "ROW_NUMBER", "RANK", "DENSE_RANK", "PARTITION BY", "LAG"],
    tables: [
      {
        name: "CUSTOMER",
        schema: "customer_id INT, customer_name VARCHAR(100), city VARCHAR(50)",
        desc: "Stores customer names and their respective cities."
      },
      {
        name: "RESTAURANT",
        schema: "restaurant_id INT, restaurant_name VARCHAR(100), city VARCHAR(50)",
        desc: "Stores restaurants names and their operating cities."
      },
      {
        name: "ORDERS",
        schema: "order_id INT, customer_id INT, restaurant_id INT, order_date DATE, order_amount DECIMAL(10,2)",
        desc: "Tracks orders placed at restaurants, amounts, and ordering dates."
      }
    ],
    seedSQL: `
      CREATE TABLE CUSTOMER (
        customer_id INT,
        customer_name VARCHAR(100),
        city VARCHAR(50)
      );

      CREATE TABLE RESTAURANT (
        restaurant_id INT,
        restaurant_name VARCHAR(100),
        city VARCHAR(50)
      );

      CREATE TABLE ORDERS (
        order_id INT,
        customer_id INT,
        restaurant_id INT,
        order_date DATE,
        order_amount DECIMAL(10,2)
      );

      INSERT INTO CUSTOMER VALUES 
      (101, 'Arun Kumar', 'Bengaluru'),
      (105, 'Sneha Rao', 'Bengaluru'),
      (108, 'Mohammed Ali', 'Mysuru'),
      (110, 'Ananya Rao', 'Hyderabad');

      INSERT INTO RESTAURANT VALUES 
      (1, 'Truffles', 'Bengaluru'),
      (2, 'Glen''s Bakehouse', 'Bengaluru'),
      (3, 'Corner House', 'Mysuru'),
      (4, 'Paradise Biryani', 'Hyderabad');

      INSERT INTO ORDERS VALUES 
      (1001, 101, 1, '2026-03-01', 50000.00),
      (1002, 101, 2, '2026-03-05', 35000.00),
      (1003, 105, 1, '2026-03-02', 72000.00),
      (1004, 108, 3, '2026-03-03', 42000.00),
      (1005, 108, 3, '2026-03-07', 30000.00),
      (1006, 110, 4, '2026-03-04', 65000.00),
      (1007, 101, 1, '2026-03-10', 60000.00);
    `,
    questions: [
      {
        id: "s5_q1",
        title: "Easy Question 1 — Customer Spending Rank",
        difficulty: "Easy",
        scenario: "The food delivery company's marketing team wants to rank customers based on their total spending.",
        questionText: "Display customer ID, total spending and rank of each customer based on total spending from highest to lowest.",
        solutionQuery: "SELECT customer_id, SUM(order_amount) AS total_spending, RANK() OVER (ORDER BY SUM(order_amount) DESC) AS spending_rank FROM ORDERS GROUP BY customer_id;",
        hint: "Group by customer_id and calculate SUM(order_amount). Apply RANK() OVER (ORDER BY SUM(order_amount) DESC) as spending_rank.",
        concepts: ["RANK", "Window Functions", "GROUP BY"]
      },
      {
        id: "s5_q2",
        title: "Easy Question 2 — Latest Customer Order Numbering",
        difficulty: "Easy",
        scenario: "The customer support team wants to identify the most recent order placed by every customer.",
        questionText: "Assign a row number to each customer's orders based on order date. The latest order of every customer must receive row number 1.",
        solutionQuery: "SELECT order_id, customer_id, order_date, order_amount, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC) AS order_number FROM ORDERS;",
        hint: "Use ROW_NUMBER() as a window function. Partition the row number by customer_id and order by order_date descending.",
        concepts: ["ROW_NUMBER", "PARTITION BY", "Window Ordering"]
      },
      {
        id: "s5_q3",
        title: "Medium Question 1 — Top Three Customers Per City",
        difficulty: "Medium",
        scenario: "The marketing department wants to reward the top three highest-spending customers from every city.",
        questionText: "Display the top three customers from each city based on their total order value.",
        solutionQuery: `WITH CustomerSpending AS (
  SELECT C.customer_id, C.customer_name, C.city, SUM(O.order_amount) AS total_spending
  FROM CUSTOMER C
  INNER JOIN ORDERS O ON C.customer_id = O.customer_id
  GROUP BY C.customer_id, C.customer_name, C.city
),
CustomerRanking AS (
  SELECT customer_id, customer_name, city, total_spending,
         DENSE_RANK() OVER (PARTITION BY city ORDER BY total_spending DESC) AS city_rank
  FROM CustomerSpending
)
SELECT customer_id, customer_name, city, total_spending, city_rank
FROM CustomerRanking
WHERE city_rank <= 3;`,
        hint: "Use two CTEs: First (CustomerSpending) calculates the sum of order amounts per customer, joined with CUSTOMER for cities. Second (CustomerRanking) assigns DENSE_RANK() partitioned by city and ordered by total spending. Outer query filters ranks <= 3.",
        concepts: ["CTE", "Multiple Query Stages", "DENSE_RANK", "PARTITION BY"]
      },
      {
        id: "s5_q4",
        title: "Medium Question 2 — Previous Order Comparison",
        difficulty: "Medium",
        scenario: "The analytics team wants to compare every customer's current order amount with the amount of the customer's previous order.",
        questionText: "Display customer ID, order ID, order date, current order amount and previous order amount.",
        solutionQuery: "SELECT customer_id, order_id, order_date, order_amount AS current_order_amount, LAG(order_amount) OVER (PARTITION BY customer_id ORDER BY order_date) AS previous_order_amount FROM ORDERS;",
        hint: "Use the LAG() window function on order_amount. Partition by customer_id and order by order_date to find the immediate previous order amount.",
        concepts: ["LAG", "Sequential Data Analysis"]
      },
      {
        id: "s5_q5",
        title: "Hard Question 1 — Top Two Restaurants in Each City",
        difficulty: "Hard",
        scenario: "The food delivery company wants to identify the two highest revenue-generating restaurants in every city.",
        questionText: "Calculate the total revenue generated by each restaurant. Rank restaurants within their city and display only the top two restaurants from every city.",
        solutionQuery: `WITH RestaurantRevenue AS (
  SELECT R.restaurant_id, R.restaurant_name, R.city, SUM(O.order_amount) AS total_revenue
  FROM RESTAURANT R
  INNER JOIN ORDERS O ON R.restaurant_id = O.restaurant_id
  GROUP BY R.restaurant_id, R.restaurant_name, R.city
),
RestaurantRanking AS (
  SELECT restaurant_id, restaurant_name, city, total_revenue,
         DENSE_RANK() OVER (PARTITION BY city ORDER BY total_revenue DESC) AS revenue_rank
  FROM RestaurantRevenue
)
SELECT restaurant_name, city, total_revenue, revenue_rank
FROM RestaurantRanking
WHERE revenue_rank <= 2;`,
        hint: "Create two CTEs: RestaurantRevenue sums orders by restaurant. RestaurantRanking computes DENSE_RANK() partitioned by city, ordered by revenue descending. Outer query selects rankings <= 2.",
        concepts: ["CTE", "Aggregation", "DENSE_RANK", "City-wise Analytical Ranking"]
      },
      {
        id: "s5_q6",
        title: "Hard Question 2 — Consecutive Customer Spending Growth",
        difficulty: "Hard",
        scenario: "The business analytics team wants to identify orders where a customer's spending increased compared with the immediately previous order.",
        questionText: "Compare every order with the customer's previous order and display only those orders where the current order amount is greater than the previous order amount.",
        solutionQuery: `WITH OrderComparison AS (
  SELECT customer_id, order_id, order_date, order_amount,
         LAG(order_amount) OVER (PARTITION BY customer_id ORDER BY order_date) AS previous_order_amount
  FROM ORDERS
)
SELECT customer_id, order_id, order_date, order_amount AS current_order_amount, previous_order_amount
FROM OrderComparison
WHERE order_amount > previous_order_amount;`,
        hint: "Use a CTE to calculate the previous_order_amount using LAG(order_amount) partitioned by customer_id and ordered by date. Outer query filters where order_amount > previous_order_amount.",
        concepts: ["CTE", "LAG", "Sequential Comparison", "Analytical Filtering"]
      }
    ]
  },
  {
    number: 6,
    title: "Session 6 — Campus Placements and Views",
    domain: "University Placement Cell",
    topics: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN", "CREATE VIEW", "SELECT FROM VIEW", "GROUP BY", "COUNT", "AVG"],
    tables: [
      {
        name: "STUDENT",
        schema: "student_id INT, student_name VARCHAR(100), department VARCHAR(50), cgpa DECIMAL(3,2)",
        desc: "Stores details of students including their department and CGPA."
      },
      {
        name: "COMPANY",
        schema: "company_id INT, company_name VARCHAR(100), package DECIMAL(5,2), location VARCHAR(50)",
        desc: "Stores details of visiting companies, their package (LPA), and location."
      },
      {
        name: "PLACEMENT",
        schema: "placement_id INT, student_id INT, company_id INT, placement_date DATE, status VARCHAR(20)",
        desc: "Tracks student recruitment records including placement date and selection status."
      }
    ],
    seedSQL: `
      CREATE TABLE STUDENT (
        student_id INT,
        student_name VARCHAR(100),
        department VARCHAR(50),
        cgpa DECIMAL(3,2)
      );

      CREATE TABLE COMPANY (
        company_id INT,
        company_name VARCHAR(100),
        package DECIMAL(5,2),
        location VARCHAR(50)
      );

      CREATE TABLE PLACEMENT (
        placement_id INT,
        student_id INT,
        company_id INT,
        placement_date DATE,
        status VARCHAR(20)
      );

      INSERT INTO STUDENT VALUES
      (101, 'Arun', 'CSE', 8.5),
      (102, 'Sneha', 'ISE', 8.2),
      (103, 'Rahul', 'AIML', 7.5),
      (104, 'Ayesha', 'CSE', 7.8),
      (109, 'Imran', 'ISE', 7.2),
      (111, 'Chitra', 'CSE', 8.1),
      (112, 'Deepak', 'CSE', 8.3),
      (113, 'Esha', 'CSE', 8.4),
      (114, 'Farhan', 'CSE', 8.6),
      (115, 'Gita', 'CSE', 8.8),
      (116, 'Hari', 'CSE', 8.9),
      (117, 'Indu', 'CSE', 9.0),
      (118, 'Jatin', 'CSE', 9.1),
      (119, 'Kiran', 'CSE', 9.2),
      (120, 'Lata', 'CSE', 9.3),
      (121, 'Manoj', 'CSE', 9.4),
      (122, 'Nisha', 'CSE', 9.5),
      (123, 'Om', 'CSE', 9.6),
      (124, 'Preeti', 'CSE', 9.7),
      (125, 'Ravi', 'CSE', 9.8),
      (126, 'Sanjay', 'CSE', 9.9),
      (127, 'Tanya', 'CSE', 8.0),
      (131, 'Umesh', 'ISE', 8.1),
      (132, 'Varun', 'ISE', 8.2),
      (133, 'Yash', 'ISE', 8.3),
      (134, 'Zeenat', 'ISE', 8.4),
      (135, 'Abhay', 'ISE', 8.5),
      (136, 'Bina', 'ISE', 8.6),
      (137, 'Charan', 'ISE', 8.7),
      (138, 'Dev', 'ISE', 8.8),
      (139, 'Ekta', 'ISE', 8.9),
      (140, 'Gopal', 'ISE', 9.0),
      (141, 'Heena', 'ISE', 9.1),
      (151, 'Amit', 'AIML', 8.1),
      (152, 'Babita', 'AIML', 8.2),
      (153, 'Chetan', 'AIML', 8.3),
      (154, 'Divya', 'AIML', 8.4),
      (155, 'Elena', 'AIML', 8.5),
      (156, 'Firoz', 'AIML', 8.6),
      (157, 'Gaurav', 'AIML', 8.7),
      (158, 'Hema', 'AIML', 8.8),
      (159, 'Ishaan', 'AIML', 8.9),
      (160, 'Juhi', 'AIML', 9.0),
      (161, 'Kunal', 'AIML', 9.1),
      (162, 'Leela', 'AIML', 9.2),
      (163, 'Mohit', 'AIML', 9.3),
      (164, 'Neha', 'AIML', 9.4),
      (165, 'Pooja', 'AIML', 9.5);

      INSERT INTO COMPANY VALUES
      (1, 'Infosys', 9.75, 'Bengaluru'),
      (2, 'TCS', 8.40, 'Bengaluru'),
      (3, 'Wipro', 10.20, 'Bengaluru'),
      (4, 'IBM', 15.00, 'Bengaluru');

      INSERT INTO PLACEMENT VALUES
      (1, 101, 1, '2026-07-15', 'Selected'),
      (2, 102, 2, '2026-07-16', 'Selected'),
      (3, 103, 3, '2026-07-17', 'Rejected'),
      (11, 111, 1, '2026-07-15', 'Selected'),
      (12, 112, 1, '2026-07-15', 'Selected'),
      (13, 113, 1, '2026-07-15', 'Selected'),
      (14, 114, 1, '2026-07-15', 'Selected'),
      (15, 115, 1, '2026-07-15', 'Selected'),
      (16, 116, 1, '2026-07-15', 'Selected'),
      (17, 117, 1, '2026-07-15', 'Selected'),
      (18, 118, 1, '2026-07-15', 'Selected'),
      (19, 119, 1, '2026-07-15', 'Selected'),
      (20, 120, 1, '2026-07-15', 'Selected'),
      (21, 121, 1, '2026-07-15', 'Selected'),
      (22, 122, 1, '2026-07-15', 'Selected'),
      (23, 123, 1, '2026-07-15', 'Selected'),
      (24, 124, 1, '2026-07-15', 'Selected'),
      (25, 125, 1, '2026-07-15', 'Selected'),
      (26, 126, 1, '2026-07-15', 'Selected'),
      (27, 127, 1, '2026-07-15', 'Selected'),
      (31, 131, 2, '2026-07-16', 'Selected'),
      (32, 132, 2, '2026-07-16', 'Selected'),
      (33, 133, 2, '2026-07-16', 'Selected'),
      (34, 134, 2, '2026-07-16', 'Selected'),
      (35, 135, 2, '2026-07-16', 'Selected'),
      (36, 136, 2, '2026-07-16', 'Selected'),
      (37, 137, 2, '2026-07-16', 'Selected'),
      (38, 138, 2, '2026-07-16', 'Selected'),
      (39, 139, 2, '2026-07-16', 'Selected'),
      (40, 140, 2, '2026-07-16', 'Selected'),
      (41, 141, 2, '2026-07-16', 'Selected'),
      (51, 151, 3, '2026-07-17', 'Selected'),
      (52, 152, 3, '2026-07-17', 'Selected'),
      (53, 153, 3, '2026-07-17', 'Selected'),
      (54, 154, 3, '2026-07-17', 'Selected'),
      (55, 155, 3, '2026-07-17', 'Selected'),
      (56, 156, 3, '2026-07-17', 'Selected'),
      (57, 157, 3, '2026-07-17', 'Selected'),
      (58, 158, 3, '2026-07-17', 'Selected'),
      (59, 159, 3, '2026-07-17', 'Selected'),
      (60, 160, 3, '2026-07-17', 'Selected'),
      (61, 161, 3, '2026-07-17', 'Selected'),
      (62, 162, 3, '2026-07-17', 'Selected'),
      (63, 163, 3, '2026-07-17', 'Selected'),
      (64, 164, 3, '2026-07-17', 'Selected'),
      (65, 165, 3, '2026-07-17', 'Selected');
    `,
    questions: [
      {
        id: "s6_q1",
        title: "Easy Question 1 — INNER JOIN",
        difficulty: "Easy",
        scenario: "The Placement Officer wants to generate a report showing all students who have received placement offers along with the company name.",
        questionText: "Display the Student Name, Company Name, and Placement Status of all students who have participated in placements.",
        solutionQuery: "SELECT s.student_name, c.company_name, p.status FROM STUDENT s INNER JOIN PLACEMENT p ON s.student_id = p.student_id INNER JOIN COMPANY c ON p.company_id = c.company_id;",
        hint: "Join STUDENT, PLACEMENT, and COMPANY tables together using their ID relations. Filter with standard INNER JOINs.",
        concepts: ["INNER JOIN", "Multi-Table Join"]
      },
      {
        id: "s6_q2",
        title: "Easy Question 2 — VIEW",
        difficulty: "Easy",
        scenario: "The placement coordinator frequently checks students who are eligible for campus recruitment (CGPA >= 8).",
        questionText: "Create a view named EligibleStudents that displays students having CGPA greater than or equal to 8. Then, write a SELECT query to query this view.",
        solutionQuery: "CREATE VIEW EligibleStudents AS SELECT student_id, student_name, department, cgpa FROM STUDENT WHERE cgpa >= 8;\nSELECT * FROM EligibleStudents;",
        hint: "Use CREATE VIEW EligibleStudents AS followed by your SELECT query, and don't forget to append SELECT * FROM EligibleStudents; as a second statement to display the output.",
        concepts: ["CREATE VIEW", "SELECT FROM VIEW"]
      },
      {
        id: "s6_q3",
        title: "Medium Question 1 — LEFT JOIN",
        difficulty: "Medium",
        scenario: "The placement office wants to identify students who have not yet received any placement offer so they can provide additional training.",
        questionText: "Display the Student ID, Student Name, and Department of students who have not been placed.",
        solutionQuery: "SELECT s.student_id, s.student_name, s.department FROM STUDENT s LEFT JOIN PLACEMENT p ON s.student_id = p.student_id WHERE p.student_id IS NULL;",
        hint: "Use a LEFT JOIN from STUDENT to PLACEMENT. Filter in the WHERE clause where the PLACEMENT student_id is NULL.",
        concepts: ["LEFT JOIN", "NULL Handling"]
      },
      {
        id: "s6_q4",
        title: "Medium Question 2 — RIGHT JOIN + VIEW",
        difficulty: "Medium",
        scenario: "The Training and Placement Cell wants to know which companies visited the campus but did not recruit any students.",
        questionText: "Create a view named CompanyRecruitmentStatus displaying all companies and the students recruited by them. Then write a query to display only those companies that have not recruited any students.",
        solutionQuery: "CREATE VIEW CompanyRecruitmentStatus AS SELECT c.company_name, s.student_name, p.status FROM PLACEMENT p RIGHT JOIN COMPANY c ON p.company_id = c.company_id LEFT JOIN STUDENT s ON p.student_id = s.student_id;\nSELECT * FROM CompanyRecruitmentStatus WHERE student_name IS NULL;",
        hint: "Define CompanyRecruitmentStatus using a RIGHT JOIN from PLACEMENT to COMPANY, and LEFT JOIN to STUDENT. Then, SELECT from this view where student_name IS NULL.",
        concepts: ["RIGHT JOIN", "LEFT JOIN", "CREATE VIEW", "View Filtering"]
      },
      {
        id: "s6_q5",
        title: "Hard Question 1 — FULL OUTER JOIN",
        difficulty: "Hard",
        scenario: "The placement committee wants a complete report of all student placement statuses and company details, regardless of whether a matching placement exists.",
        questionText: "Display all students and all companies irrespective of whether a placement exists.",
        solutionQuery: "SELECT s.student_name, c.company_name, p.status FROM STUDENT s FULL OUTER JOIN PLACEMENT p ON s.student_id = p.student_id FULL OUTER JOIN COMPANY c ON p.company_id = c.company_id;",
        hint: "Perform a FULL OUTER JOIN across STUDENT, PLACEMENT, and COMPANY on student_id and company_id.",
        concepts: ["FULL OUTER JOIN", "Complete Reporting"]
      },
      {
        id: "s6_q6",
        title: "Hard Question 2 — VIEW + JOIN + GROUP BY",
        difficulty: "Hard",
        scenario: "The Principal wants a department-wise placement dashboard showing department, total students placed, and average package.",
        questionText: "Create a view named DepartmentPlacementSummary displaying the department, number of selected students, and average package offered. Then write a query to display this view's contents.",
        solutionQuery: "CREATE VIEW DepartmentPlacementSummary AS SELECT s.department, COUNT(s.student_id) AS total_selected, AVG(c.package) AS average_package FROM STUDENT s INNER JOIN PLACEMENT p ON s.student_id = p.student_id INNER JOIN COMPANY c ON p.company_id = c.company_id WHERE p.status = 'Selected' GROUP BY s.department;\nSELECT * FROM DepartmentPlacementSummary;",
        hint: "Combine STUDENT, PLACEMENT, and COMPANY using INNER JOINs. Filter WHERE p.status = 'Selected', GROUP BY s.department, and select COUNT(s.student_id) and AVG(c.package). Remember to add a SELECT * FROM DepartmentPlacementSummary; at the end.",
        concepts: ["CREATE VIEW", "INNER JOIN", "GROUP BY", "Aggregate Functions"]
      }
    ]
  }
];
