import express from "express";
import categorieRoutes from "./routes/categorie.routes";


const app = express();


// Middleware global
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Routes API
app.use(
  "/api/categories",
  categorieRoutes
);


export default app;