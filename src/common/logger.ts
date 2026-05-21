import winston from "winston";

/*
Log levels
{
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
}
 */

export const logger = winston.createLogger({
        level: process.env.NODE_ENV === "production" ? "info" : "debug",
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.errors({stack: true}),
            winston.format.json()
        ),
        transports: [
            new winston.transports.Console()
        ]
    }
)