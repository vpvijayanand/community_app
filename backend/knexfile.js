"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '.env') });
const config = {
    development: {
        client: 'postgresql',
        connection: {
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT) || 5432,
            database: process.env.DB_NAME || 'community_app',
            user: process.env.DB_USER || 'gokul',
            password: process.env.DB_PASSWORD || '123',
        },
        pool: {
            min: Number(process.env.DB_POOL_MIN) || 2,
            max: Number(process.env.DB_POOL_MAX) || 10,
        },
        migrations: {
            directory: './src/db/migrations',
            extension: 'ts',
        },
        seeds: {
            directory: './src/db/seeds',
            extension: 'ts',
        },
    },
    production: {
        client: 'postgresql',
        connection: {
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT) || 5432,
            database: process.env.DB_NAME || 'community_app',
            user: process.env.DB_USER || 'gokul',
            password: process.env.DB_PASSWORD || '123',
        },
        pool: {
            min: Number(process.env.DB_POOL_MIN) || 2,
            max: Number(process.env.DB_POOL_MAX) || 10,
        },
        migrations: {
            directory: './src/db/migrations',
            extension: 'js',
        },
        seeds: {
            directory: './src/db/seeds',
            extension: 'js',
        },
    },
};
exports.default = config;
//# sourceMappingURL=knexfile.js.map