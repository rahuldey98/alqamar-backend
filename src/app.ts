import express from "express";
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/user.routes";
import {errorHandler} from "./common/error-handler";

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(express.json());
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
