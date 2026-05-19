import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { sendWelcomeEmail } from "@/lib/email";

const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().min(1, "First name is required"),
  password: z.string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[a-zA-Z]/, "Password must contain at least one letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate the input data
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password, name } = validation.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash the password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        password: hashedPassword,
      },
    });

    // Send welcome email asynchronously
    if (user.email) {
      sendWelcomeEmail(user.email, user.name).catch(err => {
        console.error("Failed to send welcome email during registration:", err);
      });
    }

    return NextResponse.json(
      { message: "User registered successfully", userId: user.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error full details:", error);
    
    // Check if it's a Prisma connection error
    if (error.code === 'P1001') {
      return NextResponse.json(
        { error: "Could not connect to the database. Please check your DATABASE_URL." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: `Registration failed: ${error.message || "Internal server error"}` },
      { status: 500 }
    );
  }
}
