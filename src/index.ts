import { PrismaClient } from "../prisma/generated/client";
import { handlePrismaError } from "./utils/prisma-error";

const prisma = new PrismaClient();

async function insertUser(
  email: string,
  password: string,
  first_name: string,
  last_name: string,
  country: string
) {
  try {
    const res = await prisma.user.create({
      data: {
        email,
        password,
        first_name,
        last_name,
        country,
      },
    });

    console.log(res);
  } catch (error) {
    console.log(handlePrismaError(error));
  }
}

// insertUser("visffhal@gmail.comm", "124f5", "visdhu", "Yuvrdaj", "");

async function updateUser(
  first_name: string,
  last_name: string,
  email: string,
  country:string
) {
  const res = await prisma.user.update({
    where: { email },
    data: {
      first_name,
      last_name,
      country
    },
  });

  console.log(res);
}

async function getAllUser() {
  const res = await prisma.user.findMany();
  console.log(res);
}

// updateUser("Dadu", "mahale", "visfhal@gmail.comm", "UK");
getAllUser();
