"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const LoggingCommon_1 = require("./LoggingCommon");
const pino_abstract_transport_1 = __importDefault(require("pino-abstract-transport"));
__exportStar(require("./options"), exports);
async function default_1(opts) {
    const cloudLogging = new LoggingCommon_1.LoggingCommon(opts);
    await cloudLogging.init();
    const buildFn = (0, pino_abstract_transport_1.default)(async function (source) {
        for await (const obj of source) {
            await cloudLogging.log(obj);
        }
    }, {
        close: (_err, cb) => {
            cloudLogging.flush().then(() => {
                cb;
            });
        },
    });
    return buildFn;
}
exports.default = default_1;
//# sourceMappingURL=index.js.map