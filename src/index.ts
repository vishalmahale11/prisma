import { PrismaClient } from "../prisma/generated/client";
import { handlePrismaError } from "./utils/prisma-error";
import { faker } from "@faker-js/faker";
import { Request, Response } from "express";
import ExcelJS from "exceljs";
import express from "express";
import cors from "cors";
import * as fastcsv from "fast-csv";

const prisma = new PrismaClient();

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

async function main() {
  const TOTAL_RECORDS = 5_000_000;
  const BATCH_SIZE = 10_000;
  for (let i = 0; i < TOTAL_RECORDS; i += BATCH_SIZE) {
    const users = Array.from({ length: BATCH_SIZE }).map(() => ({
      email: `user${i + 2}@example.com`,
      first_name: faker.person.firstName("male"),
      last_name: faker.person.lastName("male"),
      password: faker.internet.password(),
      country: faker.location.country(),
    }));

    await prisma.user.createMany({ data: users });
    console.log(`Inserted ${i + BATCH_SIZE} users...`);
  }

  console.log("✅ Done seeding 50lakh users");
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

export const downloadUsersExcel = async (req: Request, res: Response) => {
  try {
    const MAX_ROWS_PER_SHEET = 1_000_000; // stay slightly under 1,048,576
    const BATCH_SIZE = 10_000;

    const workbook = new ExcelJS.Workbook();
    let sheetIndex = 1;
    let currentSheet = workbook.addWorksheet(`Users_${sheetIndex}`);
    let isFirstBatch = true;
    let totalFetched = 0;

    while (true) {
      const users = await prisma.user.findMany({
        skip: totalFetched,
        take: BATCH_SIZE,
      });

      if (users.length === 0) break;

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
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=users.xlsx");

    // Stream workbook to client
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("❌ Error generating Excel:", error);
    res.status(500).json({ message: "Failed to generate Excel file" });
  }
};

const app = express();

app.use(cors());

app.get("/download-users", (req, res, next) => {
  downloadUsersExcel(req, res).catch(next);
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
