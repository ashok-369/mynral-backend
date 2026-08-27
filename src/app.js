import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import notFoundMiddleware from "./middlewares/notFound.middleware.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import testRoutes from "./routes/test.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import customerRoutes from "./modules/customers/customer.routes.js";
import categoryRoutes from "./modules/categories/category.routes.js";
import productRoutes from "./modules/products/product.routes.js";
import addressRoutes from "./modules/addresses/address.routes.js";
import cartRoutes from "./modules/carts/cart.routes.js";
import orderRoutes from "./modules/orders/order.routes.js";

// razorpay routes image
//import paymentRoutes from "./modules/payments/payment.routes.js";

import adminOrderRoutes from "./modules/orders/admin-order.routes.js";
import adminRoutes from "./modules/admin/index.js";

const app = express();

/*
|--------------------------------------------------------------------------
| Security Middleware
|--------------------------------------------------------------------------
*/

app.use(helmet());

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

/*
|--------------------------------------------------------------------------
| General Middleware
|--------------------------------------------------------------------------
*/

app.use(compression());

app.use(morgan("dev"));

app.use(express.json({ limit: "10mb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

app.use(cookieParser());

/*
|--------------------------------------------------------------------------
| API Root
|--------------------------------------------------------------------------
*/

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "Welcome to MYNRAL Agro API 🚀",
    version: "1.0.0",
  });
});

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "MYNRAL Agro API is healthy",
    timestamp: new Date().toISOString(),
  });
});

/*
|--------------------------------------------------------------------------
| API Information
|--------------------------------------------------------------------------
*/

app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    message: "MYNRAL Agro API",
    version: "1.0.0",
    environment: process.env.NODE_ENV,
  });
});

/*
|--------------------------------------------------------------------------
| Favicon
|--------------------------------------------------------------------------
*/

app.get("/favicon.ico", (req, res) => {
  res.status(204).end();
});
app.use("/api/test", testRoutes);
app.use("/api/auth", authRoutes);
app.use(
  "/api/customers",
  customerRoutes
);


app.use(
  "/api/categories",
  categoryRoutes
);

app.use(
  "/api/products",
  productRoutes
);

app.use(
  "/api/addresses",
  addressRoutes
);

app.use(
  "/api/cart",
  cartRoutes
);

app.use("/api/orders", orderRoutes);


//razorpay
// app.use(
//   "/api/payments",
//   paymentRoutes
// );


app.use(
  "/api/admin/orders",
  adminOrderRoutes
);


app.use("/api/admin", adminRoutes);
/*
|--------------------------------------------------------------------------
| 404 Handler
|--------------------------------------------------------------------------
*/

app.use(notFoundMiddleware);

/*
|--------------------------------------------------------------------------
| Global Error Handler
|--------------------------------------------------------------------------
*/

app.use(errorMiddleware);

export default app;