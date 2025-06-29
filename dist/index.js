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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../prisma/generated/client");
const prisma_error_1 = require("./utils/prisma-error");
const prisma = new client_1.PrismaClient();
function insertUser(email, password, first_name, last_name, country) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield prisma.user.create({
                data: {
                    email,
                    password,
                    first_name,
                    last_name,
                    country,
                },
            });
            console.log(res);
        }
        catch (error) {
            console.log((0, prisma_error_1.handlePrismaError)(error));
        }
    });
}
// insertUser("visffhal@gmail.comm", "124f5", "visdhu", "Yuvrdaj", "");
function updateUser(first_name, last_name, email, country) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield prisma.user.update({
            where: { email },
            data: {
                first_name,
                last_name,
                country
            },
        });
        console.log(res);
    });
}
function getAllUser() {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield prisma.user.findMany();
        console.log(res);
    });
}
// updateUser("Dadu", "mahale", "visfhal@gmail.comm", "UK");
getAllUser();
