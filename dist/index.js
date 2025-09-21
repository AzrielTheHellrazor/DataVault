"use strict";
/**
 * AI Data Repository on Irys
 *
 * A minimal data repository for storing and managing AI datasets,
 * embeddings, and PyTorch model files on Irys blockchain.
 *
 * @packageDocumentation
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PACKAGE_NAME = exports.VERSION = exports.IrysFetcher = exports.IrysQuery = exports.IrysUploader = exports.Database = exports.AIRepository = void 0;
// Main exports
var repository_1 = require("./repository");
Object.defineProperty(exports, "AIRepository", { enumerable: true, get: function () { return repository_1.AIRepository; } });
var database_1 = require("./database");
Object.defineProperty(exports, "Database", { enumerable: true, get: function () { return database_1.Database; } });
var uploader_1 = require("./irys/uploader");
Object.defineProperty(exports, "IrysUploader", { enumerable: true, get: function () { return uploader_1.IrysUploader; } });
var query_1 = require("./irys/query");
Object.defineProperty(exports, "IrysQuery", { enumerable: true, get: function () { return query_1.IrysQuery; } });
var fetcher_1 = require("./irys/fetcher");
Object.defineProperty(exports, "IrysFetcher", { enumerable: true, get: function () { return fetcher_1.IrysFetcher; } });
// Type exports
__exportStar(require("./types"), exports);
// Version information
exports.VERSION = '1.0.0';
exports.PACKAGE_NAME = 'datavault';
//# sourceMappingURL=index.js.map