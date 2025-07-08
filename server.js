const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("./config/db");
const os = require("os");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const mainRoutes = require("./service/main_service/routes");
const paymentRoutes = require("./service/payment_service/routes");

// Middleware inject DB
const injectDb = (req, res, next) => {
  req.db = db;
  next();
};

// Express setup
const app = express();

// ✅ Middleware CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://103.181.182.81",
      "http://localhost:3000",
    ],
    credentials: true,
  })
);

// ✅ Jadikan folder 'uploads' sebagai folder statis
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Middleware parsing JSON
app.use(bodyParser.json());

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Super App System API",
      version: "1.0.0",
      description: "Dokumentasi API",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./service/**/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use("/", injectDb, mainRoutes);
app.use("/payments", injectDb, paymentRoutes);

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  const interfaces = os.networkInterfaces();
  const addresses = Object.values(interfaces)
    .flat()
    .filter((iface) => iface.family === "IPv4" && !iface.internal)
    .map((iface) => iface.address);

  console.log(`Server running at:`);
  addresses.forEach((ip) => {
    console.log(`→ http://${ip}:${PORT}`);
  });
  console.log(`Swagger Docs → http://localhost:${PORT}/docs`);
});
