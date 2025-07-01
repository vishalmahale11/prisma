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
exports.downloadUsersExcel = void 0;
const client_1 = require("../prisma/generated/client");
const faker_1 = require("@faker-js/faker");
const exceljs_1 = __importDefault(require("exceljs"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const prisma = new client_1.PrismaClient();
// async function insertUser(
//   email: string,
//   password: string,
//   first_name: string,
//   last_name: string,
//   country: string
// ) {
//   try {
//     const res = await prisma.user.create({
//       data: {
//         email,
//         password,
//         first_name,
//         last_name,
//         country,
//       },
//     });
//     console.log(res);
//   } catch (error) {
//     console.log(handlePrismaError(error));
//   }
// }
// insertUser("visffhal@gmail.comm", "124f5", "visdhu", "Yuvrdaj", "");
// async function updateUser(
//   first_name: string,
//   last_name: string,
//   email: string,
//   country:string
// ) {
//   const res = await prisma.user.update({
//     where: { email },
//     data: {
//       first_name,
//       last_name,
//       country
//     },
//   });
//   console.log(res);
// }
// async function getAllUser() {
//   const res = await prisma.user.findMany();
//   console.log(res);
// }
// updateUser("Dadu", "mahale", "visfhal@gmail.comm", "UK");
// getAllUser();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const TOTAL_RECORDS = 5000000;
        const BATCH_SIZE = 10000;
        for (let i = 0; i < TOTAL_RECORDS; i += BATCH_SIZE) {
            const users = Array.from({ length: BATCH_SIZE }).map(() => ({
                email: `user${i + 2}@example.com`,
                first_name: faker_1.faker.person.firstName("male"),
                last_name: faker_1.faker.person.lastName("male"),
                password: faker_1.faker.internet.password(),
                country: faker_1.faker.location.country(),
            }));
            yield prisma.user.createMany({ data: users });
            console.log(`Inserted ${i + BATCH_SIZE} users...`);
        }
        console.log("✅ Done seeding 50lakh users");
    });
}
// main()
//   .catch((e) => console.error(e))
//   .finally(() => prisma.$disconnect());
// export const downloadUsersExcel = async (req: Request, res: Response) => {
//   try {
//     const users = await prisma.user.findMany();
//     if (users.length === 0) {
//       return res.status(404).json({ message: "No user data found" });
//     }
//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet("Users");
//     // Dynamically define columns based on the first user
//     const firstUser = users[0];
//     worksheet.columns = Object.keys(firstUser).map((key) => ({
//       header: key.toUpperCase(),
//       key,
//       width: 20,
//     }));
//     // Add all user rows
//     users.forEach((user) => {
//       worksheet.addRow(user);
//     });
//     // Set headers
//     res.setHeader(
//       "Content-Type",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     );
//     res.setHeader("Content-Disposition", "attachment; filename=users.xlsx");
//     // Stream Excel
//     await workbook.xlsx.write(res);
//     res.end();
//   } catch (error) {
//     console.error("❌ Error generating Excel:", error);
//     res.status(500).json({ message: "Failed to generate Excel file" });
//   }
// };
// export const downloadUsersCSV = async (req: Request, res: Response) => {
//   res.setHeader("Content-Disposition", "attachment; filename=users.csv");
//   res.setHeader("Content-Type", "text/csv");
//   const csvStream = fastcsv.format({ headers: true });
//   csvStream.pipe(res); // stream directly to client
//   const BATCH_SIZE = 10000;
//   let offset = 0;
//   while (true) {
//     const users = await prisma.user.findMany({
//       skip: offset,
//       take: BATCH_SIZE,
//     });
//     if (users.length === 0) break;
//     users.forEach((user) => csvStream.write(user));
//     offset += BATCH_SIZE;
//   }
//   csvStream.end();
// };
const downloadUsersExcel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const MAX_ROWS_PER_SHEET = 1000000; // stay slightly under 1,048,576
        const BATCH_SIZE = 10000;
        const workbook = new exceljs_1.default.Workbook();
        let sheetIndex = 1;
        let currentSheet = workbook.addWorksheet(`Users_${sheetIndex}`);
        let isFirstBatch = true;
        let totalFetched = 0;
        while (true) {
            const users = yield prisma.user.findMany({
                skip: totalFetched,
                take: BATCH_SIZE,
            });
            if (users.length === 0)
                break;
            // Setup headers on first batch of each sheet
            if (isFirstBatch || currentSheet.rowCount === 0) {
                const firstUser = users[0];
                currentSheet.columns = Object.keys(firstUser).map((key) => ({
                    header: key.toUpperCase(),
                    key,
                    width: 20,
                }));
                isFirstBatch = false;
            }
            for (const user of users) {
                currentSheet.addRow(user);
                // Switch to new sheet if row limit is reached
                if (currentSheet.rowCount >= MAX_ROWS_PER_SHEET) {
                    sheetIndex++;
                    currentSheet = workbook.addWorksheet(`Users_${sheetIndex}`);
                    currentSheet.columns = Object.keys(user).map((key) => ({
                        header: key.toUpperCase(),
                        key,
                        width: 20,
                    }));
                }
            }
            totalFetched += users.length;
            console.log(`Fetched: ${totalFetched}`);
        }
        // Set headers
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=users.xlsx");
        // Stream workbook to client
        yield workbook.xlsx.write(res);
        res.end();
    }
    catch (error) {
        console.error("❌ Error generating Excel:", error);
        res.status(500).json({ message: "Failed to generate Excel file" });
    }
});
exports.downloadUsersExcel = downloadUsersExcel;
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.get("/download-users", (req, res, next) => {
    (0, exports.downloadUsersExcel)(req, res).catch(next);
});
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
