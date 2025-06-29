"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handlePrismaError = handlePrismaError;
const client_1 = require("../../prisma/generated/client");
function handlePrismaError(error) {
    var _a, _b;
    if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        switch (error.code) {
            case "P2002": {
                const field = (_b = (_a = error.meta) === null || _a === void 0 ? void 0 : _a.target) === null || _b === void 0 ? void 0 : _b[0]; // usually the unique field like "email"
                console.error(`❌ Error: Field "${field}" must be unique. Value already exists.`);
                break;
            }
            case "P2003":
                console.error("❌ Foreign key constraint failed. Possibly invalid reference.");
                break;
            default:
                console.error(`❌ Prisma Error [${error.code}]:`, error.message);
        }
    }
    else if (error instanceof client_1.Prisma.PrismaClientValidationError) {
        console.error("❌ Validation error:", error.message);
    }
    else if (error instanceof Error) {
        console.error("❌ Unexpected error:", error.message);
    }
    else {
        console.error("❌ Unknown error:", error);
    }
}
