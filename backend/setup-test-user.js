const mysql = require('mysql2/promise');

async function setupTestUser() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'kitchensync_user',
    password: 'kitchensync_password',
    database: 'KitchenSync',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    // Insert a test user
    const [result] = await connection.execute(
      'INSERT INTO Users (username, email, passwd) VALUES (?, ?, ?)',
      ['testuser', 'test@example.com', 'password123']
    );
    
    console.log('Test user created with ID:', result.insertId);
    console.log('You can now use this user to test the application');
    
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('Test user already exists');
    } else {
      console.error('Error creating test user:', error);
    }
  } finally {
    await connection.end();
  }
}

setupTestUser();