import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Missing Authorization Header" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return NextResponse.json(
        { error: "Invalid Authorization Format" },
        { status: 401 }
      );
    }

    const secret = process.env.JWT_SECRET || "supersecret";
    if (!secret) {
      console.error("JWT Secret is missing");
      return NextResponse.json(
        { error: "Server Misconfiguration" },
        { status: 500 }
      );
    }

    let decoded;
    try {
      decoded = jwt.verify(token, secret) as { userId: string };
    } catch (err) {
      console.error("JWT Verification Failed:", err);
      return NextResponse.json({ error: "Invalid Token" }, { status: 401 });
    }

    if (!decoded?.userId) {
      return NextResponse.json(
        { error: "Invalid Token Payload" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        level: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Something went wrong", details: error },
      { status: 500 }
    );
  }
}
