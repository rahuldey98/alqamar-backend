import "dotenv/config";
import express from "express";
import express_prom_bundle from "express-prom-bundle";
import { errorHandler } from "./common/error-handler";
import { logger } from "./common/logger";
import { allowAccessControl } from "./common/middleware/cors.middleware";
import { apiRateLimiter } from "./common/middleware/rate-limit.middleware";
import { requestLogger } from "./common/middleware/request-logger";
import attendanceRoutes from "./modules/attendance/router";
import authRoutes from "./modules/auth/router";
import classV2Routes from "./modules/class-v2/router";
import { startClassV2Sweeper } from "./modules/class-v2/sweeper";
import classRoutes from "./modules/class/router";
import courseRoutes from "./modules/course/router";
import dashboardRoutes from "./modules/dashboard/router";
import userRoutes from "./modules/users/router";

const app = express();
const port = Number(process.env.PORT ?? 3000);
const metricsMiddleWare = express_prom_bundle({
    includeMethod: true,
    includePath: true,
    includeStatusCode: true,
    promClient: { collectDefaultMetrics: { } }
});
app.set("trust proxy", 1);

app.use(express.json());
app.use(allowAccessControl);
app.use(requestLogger);
app.use(metricsMiddleWare);
app.use(apiRateLimiter);

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/classes", classRoutes);
app.use("/classes-v2", classV2Routes);
app.use("/courses", courseRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
    res.json({ status: "healthy", message: "Alqamar API is running" });
});

app.use(errorHandler);

app.listen(port, () => {
    logger.info(`Server is running on port: ${port}`);
    startClassV2Sweeper();
});
