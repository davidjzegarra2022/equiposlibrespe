const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data', 'products.json');

let writeQueue = Promise.resolve();

function readData() {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

function writeData(data) {
  // Serialize writes so concurrent price edits never clobber each other.
  writeQueue = writeQueue.then(() =>
    fs.promises.writeFile(DATA_FILE, JSON.stringify(data, null, 2) + '\n', 'utf-8')
  );
  return writeQueue;
}

function getCatalog() {
  return readData();
}

function getProduct(id) {
  const data = readData();
  return data.products.find((p) => p.id === id) || null;
}

async function updateProductPrice(id, price) {
  const data = readData();
  const product = data.products.find((p) => p.id === id);
  if (!product) return null;
  product.price = price;
  await writeData(data);
  return product;
}

async function updateProductStock(id, stock) {
  const data = readData();
  const product = data.products.find((p) => p.id === id);
  if (!product) return null;
  product.stock = stock;
  await writeData(data);
  return product;
}

module.exports = { getCatalog, getProduct, updateProductPrice, updateProductStock };
