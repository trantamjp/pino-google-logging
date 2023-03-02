"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const LoggingCommon_1 = require("./LoggingCommon");
const pino_abstract_transport_1 = __importDefault(require("pino-abstract-transport"));
async function default_1(opts) {
    const cloudLogging = new LoggingCommon_1.LoggingCommon(opts);
    await cloudLogging.init();
    const buildFn = (0, pino_abstract_transport_1.default)(async function (source) {
        for await (const obj of source) {
            await cloudLogging.log(obj);
        }
    }, {});
    return buildFn;
}
exports.default = default_1;
//# sourceMappingURL=index.js.map