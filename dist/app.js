"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/app.ts
const express_1 = __importDefault(require("express"));
//import bodyParser from 'body-parser';
const pgConfig_1 = __importDefault(require("./pgConfig"));
const routing_1 = __importDefault(require("./routing"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api', routing_1.default);
const port = process.env.PORT || 3000;
app.listen(port, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Server running on port ${port}`);
    try {
        yield pgConfig_1.default.authenticate();
        console.log('Database connected!');
        yield pgConfig_1.default.sync({ force: true });
    }
    catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}));
exports.default = app;
//# sourceMappingURL=app.js.map