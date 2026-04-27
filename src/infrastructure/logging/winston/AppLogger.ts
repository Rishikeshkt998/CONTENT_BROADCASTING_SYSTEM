import { createLogger, format, transports } from "winston";
const { timestamp, combine, printf } = format;

const getUtcTimestamp = () => {
    const now = new Date();
    const utcString = now.toISOString().replace(/T/, ' ').replace(/\..+/, '');
    return utcString;
};

const logFormat = printf(({ level, message }) => {
    return (`${getUtcTimestamp()} [${level}] ${message}`);
});

const logger = createLogger({
    level: 'debug',
    format: combine(
        timestamp({ format: "DD/MM/YY HH:mm:ss" }),
        logFormat
    ),
    transports: [
        new transports.Console(),
        new transports.File({
            filename: 'app.log'
        })
    ]
});

export default logger;
