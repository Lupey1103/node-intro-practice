const fs = require("fs");
const http = require("http");
const url = require("url");
const slugify = require("slugify");
const replaceTemplate = require("./modules/replaceTemplates");

//////////////////////////////////////////////
// Files

// Blocking, synchronous way
// const textIn = fs.readFileSync("./txt/input.txt", "utf-8");
// console.log(textIn);

// const textOut = `This is what we know about the avocado: ${textIn}.\mCreated on ${Date.now()}`;
// fs.writeFileSync("./txt/ouput.txt", textOut);
// console.log("File written!");

// Non-blocking, asynchronous way
// fs.readFile("./txt/start.txt", "utf-8", (err, data1) => {
//   fs.readFile(`./txt/${data1}.txt`, "utf-8", (err, data2) => {
//     console.log(data2);
//     fs.readFile("./txt/append.txt", "utf-8", (err, data3) => {
//       console.log(data3);

//       fs.writeFile("./txt/final.txt", `${data2}\n${data3}`, "utf-8", (err) => {
//         console.log("Your file has been written!");
//       });
//     });
//   });
// });
// console.log("Will read file!");

//////////////////////////////////////////////
// Server

const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  "utf-8",
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  "utf-8",
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  "utf-8",
);

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
const dataObject = JSON.parse(data);

const slugs = dataObject.map((el) => slugify(el.productName, { lower: true }));
console.log(slugs);

console.log(slugify("Fresh Avocados", { lower: true }));

const server = http.createServer((req, res) => {
  const myUrl = new URL(`http://127.0.0.1:8000${req.url}`);
  const { searchParams, pathname: pathName } = myUrl;

  // Overview page
  if (pathName === "/" || pathName === "/overview") {
    res.writeHead(200, { "Content-Type": "text/html" });

    const cardsHtml = dataObject
      .map((el) => replaceTemplate(tempCard, el))
      .join("");
    const output = tempOverview.replace("{%PRODUCT_CARDS%}", cardsHtml);
    res.end(output);
    // Product page
  } else if (pathName === "/product") {
    res.writeHead(200, { "Content-Type": "text/html" });
    const product = dataObject.find((el) => el.id == searchParams.get("id"));
    output = replaceTemplate(tempProduct, product);
    res.end(output);
    // API
  } else if (pathName === "/api") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(data);
    // Not found
  } else {
    res.writeHead(404, {
      "Content-Type": "text/html",
      "my-own-header": "Hello World!",
    });
    res.end("<h1>404 Page not found!</h1>");
  }
});

server.listen(8000, "127.0.0.1", () => {
  console.log("Listening to requests on port 8000");
});
