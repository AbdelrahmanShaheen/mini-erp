const bcrypt = require("bcrypt");
const prisma = require("./prisma/prisma");

async function createSuperAdmin() {
  try {
    const existingSuperAdmin = await prisma.employee.findFirst({
      where: { role: "SUPER_ADMIN" },
    });

    if (existingSuperAdmin) {
      console.log("Super Admin already exists in the database.");
      return;
    }

    const superAdminData = {
      name: "admin",
      password: await bcrypt.hash("admin123", 10),
      role: "SUPER_ADMIN",
      birthDate: new Date("1990-01-01"),
    };

    const superAdmin = await prisma.employee.create({ data: superAdminData });

    console.log("Super Admin created:", superAdmin);
  } catch (error) {
    console.error("Error creating Super Admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Call the function to create the Super Admin
createSuperAdmin();
