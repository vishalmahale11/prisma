import { Prisma } from "../../prisma/generated/client";

export function handlePrismaError(error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002": {
        const field = (error.meta as { target?: string[] })?.target?.[0]; // usually the unique field like "email"
        console.error(
          `❌ Error: Field "${field}" must be unique. Value already exists.`
        );
        break;
      }
      case "P2003":
        console.error(
          "❌ Foreign key constraint failed. Possibly invalid reference."
        );
        break;
      default:
        console.error(`❌ Prisma Error [${error.code}]:`, error.message);
    }
  } else if (error instanceof Prisma.PrismaClientValidationError) {
    console.error("❌ Validation error:", error.message);
  } else if (error instanceof Error) {
    console.error("❌ Unexpected error:", error.message);
  } else {
    console.error("❌ Unknown error:", error);
  }
}
