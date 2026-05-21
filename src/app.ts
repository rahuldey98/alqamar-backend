import "dotenv/config";
import express from "express";
import authRoutes from "./modules/auth/router";
import userRoutes from "./modules/users/router";
import classRoutes from "./modules/class/router"
import courseRoutes from "./modules/course/router"
import attendanceRoutes from "./modules/attendance/router"
import dashboardRoutes from "./modules/dashboard/router"
import {errorHandler} from "./common/error-handler";
import {allowAccessControl} from "./common/middleware/cors.middleware";
import {requestLogger} from "./common/middleware/request-logger";
import {apiRateLimiter} from "./common/middleware/rate-limit.middleware";
import {logger} from "./common/logger";

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.set("trust proxy", 1);

app.use(express.json());
app.use(allowAccessControl);
app.use(requestLogger);
app.use(apiRateLimiter);

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/classes", classRoutes);
app.use("/courses", courseRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/dashboard", dashboardRoutes);

app.use(errorHandler);

app.listen(port, () => {
    logger.info(`Server is running on port: ${port}`);
});
