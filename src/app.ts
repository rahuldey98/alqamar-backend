import express from "express";
import authRoutes from "./modules/auth/router";
import userRoutes from "./modules/users/router";
import classRoutes from "./modules/class/router"
 import courseRoutes from "./modules/course/router"
import {errorHandler} from "./common/error-handler";

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json());
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/classes", classRoutes);
app.use("/course", courseRoutes);

app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
