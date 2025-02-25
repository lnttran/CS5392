import bcrypt from "bcryptjs"; // for hashing passwords
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  // Parse request body

  try {
    const { username, oldPassword, newPassword, confirmPassword } =
      await req.json();

    // Check if all fields are provided
    if (!username || !oldPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if new password and confirm password match
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    // Validate password strength (example check)
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#\$%&])[A-Za-z\d#$%&]{6,}$/;
    if (!passwordRegex.test(newPassword)) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (#, $, %, &)",
        },
        { status: 400 }
      );
    }
    // Find the user by username
    const user = await prisma.user.findUnique({
      where: { username },
    });

    // Check if user exists
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Compare the old password with the stored password hash
    const isOldPasswordValid = await bcrypt.compare(
      oldPassword,
      user.passwordHash
    );
    if (!isOldPasswordValid) {
      return NextResponse.json(
        { error: "Incorrect old password" },
        { status: 400 }
      );
    }
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    const updatedUser = await prisma.user.update({
      where: { username },
      data: {
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
        loginFirstTime: false,
      },
    });

    // Respond with success
    return NextResponse.json(
      { message: "Password successfully reset" },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
