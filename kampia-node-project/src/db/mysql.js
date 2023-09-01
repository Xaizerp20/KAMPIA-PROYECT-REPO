import mysql from 'mysql2'

export const connection = mysql.createConnection({
    
    host: 'localhost',
    port: 3306,
    user: 'root',
    database: 'glock',
    password : '2639',
    connectTimeout: 5000,
    
})


/*
connection.query(
    "INSERT INTO `users`(`user`, `password`, `name`, `permission`) VALUES ('40215335932','2638','Carlos Pichardo','user')",
    function(err, [results], fields) {
      console.log(results); // results contains rows returned by server
    }
  );



connection.query(
    'SELECT * FROM `users` WHERE 1',
    function(err, [results], fields) {
      console.log(results); // results contains rows returned by server
    }
  );
*/