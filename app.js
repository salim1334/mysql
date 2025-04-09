const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
// CREATE SERVER
const app = express();

// PARSE REQUEST BODY FROM FRONT-END
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

//********** Question-1 *************//
// DATABASE CONNECTION CONFIGURATION
const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'myDBuser',
  password: 'mydbuserpass',
  database: 'myDB',
});

// CREATE A NEW DATABASE
// connection.query('CREATE DATABASE myDB', (err, result) => {
//   if (err) throw new Error('Error on Creating DB');
//   console.log('myDB Created ✅');
// });

// ✅ CONNECT TO MYSQL
connection.connect((err) => {
  if (err) {
    console.error('❌ Failed to connect to MySQL Database');
    console.error('Error details:', err.message);
    return;
  }

  console.log('✅ Successfully connected to MySQL Database');
});

//********** Question-2 *************//
// CREATE PRODUCTS, PRODUCT DESCRIPTION, PRODUCT PRICE, ORDERS AND USER TABLES
app.get('/install', (_, res) => {
  const Products = `
    CREATE TABLE IF NOT EXISTS products (
      product_id INT AUTO_INCREMENT PRIMARY KEY,
      product_url VARCHAR(255) NOT NULL,
      product_name VARCHAR(255) NOT NULL
    );
  `;

  const ProductsDescription = `
    CREATE TABLE IF NOT EXISTS products_description (
      description_id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT,
      product_brief_description VARCHAR(255) NOT NULL,
      product_description TEXT NOT NULL,
      product_img VARCHAR(255),
      product_link VARCHAR(255) UNIQUE,
      FOREIGN KEY (product_id) REFERENCES products(product_id)
    );
  `;

  const ProductsPrice = `
    CREATE TABLE IF NOT EXISTS products_price (
      price_id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT,
      starting_price VARCHAR(255) NOT NULL,
      price_range VARCHAR(255) NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(product_id)
    );
  `;

  const Users = `
    CREATE TABLE IF NOT EXISTS users (
      user_id INT AUTO_INCREMENT PRIMARY KEY,
      user_name VARCHAR(50) NOT NULL,
      user_password VARCHAR(255) NOT NULL
    );
  `;

  const Orders = `
    CREATE TABLE IF NOT EXISTS orders (
      order_id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT,
      user_id INT,
      FOREIGN KEY (product_id) REFERENCES products(product_id),
      FOREIGN KEY (user_id) REFERENCES users(user_id)
    );
  `;

  const tables = [
    { query: Products, name: 'products' },
    { query: ProductsDescription, name: 'products_description' },
    { query: ProductsPrice, name: 'products_price' },
    { query: Users, name: 'users' },
    { query: Orders, name: 'orders' },
  ];

  let createdTables = [];

  // Execute queries one by one
  const createNext = (index) => {
    if (index >= tables.length) {
      res.send(`✅ All tables created: ${createdTables.join(', ')}`);
      return;
    }

    const { query, name } = tables[index];

    connection.query(query, (err, result) => {
      if (err) {
        console.error(`❌ Error creating ${name} table:`, err.message);
        res.status(500).send(`❌ Failed to create ${name} table.`);
        return;
      }

      console.log(`✅ ${name} table created`);
      createdTables.push(name);
      createNext(index + 1);
    });
  };

  createNext(0); // Start creation
});

//********** Question-3 *************//
app.post('/add-iphone', (req, res) => {
  const {
    productName,
    imgPath,
    phoneLike,
    startPrice,
    priceRange,
    briefDescription,
    fullDescription,
  } = req.body;

  // 1. Insert into products
  const insertProduct = `INSERT INTO products (product_url, product_name) VALUES (?, ?)`;
  connection.query(insertProduct, [phoneLike, productName], (err, result) => {
    if (err) {
      console.error('❌ Error inserting into products:', err.message);
      return res.status(500).send('Error inserting product');
    }

    const productId = result.insertId; // Get the auto-incremented product_id

    // 2. Insert into products_description
    const insertDesc = `INSERT INTO products_description
      (product_id, product_brief_description, product_description, product_img, product_link)
      VALUES (?, ?, ?, ?, ?)`;

    connection.query(
      insertDesc,
      [productId, briefDescription, fullDescription, imgPath, phoneLike],
      (err) => {
        if (err) {
          console.error('❌ Error inserting into description:', err.message);
          return res.status(500).send('Error inserting product description');
        }

        // 3. Insert into products_price
        const insertPrice = `INSERT INTO products_price (product_id, starting_price, price_range)
        VALUES (?, ?, ?)`;

        connection.query(
          insertPrice,
          [productId, startPrice, priceRange],
          (err) => {
            if (err) {
              console.error('❌ Error inserting into price:', err.message);
              return res.status(500).send('Error inserting product price');
            }

            res.send(
              '✅ Product, Description, and Price inserted successfully!'
            );
          }
        );
      }
    );
  });
});

app.get('/getAllProducts', (_, res) => {
  const query = `
    SELECT
      p.product_id,
      p.product_url,
      p.product_name,
      pd.product_brief_description,
      pd.product_description,
      pd.product_img,
      pd.product_link,
      pp.starting_price,
      pp.price_range
    FROM products p
    LEFT JOIN products_description pd ON p.product_id = pd.product_id
    LEFT JOIN products_price pp ON p.product_id = pp.product_id
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error('❌ Error fetching all product data:', err.message);
      return res.status(500).send('Error fetching product data');
    }

    res.json(results);
  });
});

// MAKE THE SERVER LISTEN ON PORT 8000
app.listen(8000, (err) => {
  if (err) throw new Error('Error on Listening Server');

  console.log('🧑‍💻 Server Listening on http://127.0.0.1:8000');
});
