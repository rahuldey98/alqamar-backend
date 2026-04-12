import express from "express";
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import {errorHandler} from "./middleware/error.middleware";
import {authUser} from "./middleware/auth.middleware";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use('/auth', authRoutes)
app.use('/users', userRoutes)

app.use(errorHandler)

app.listen(port, () => {
    console.log("Server is running on port: " + port);
})
