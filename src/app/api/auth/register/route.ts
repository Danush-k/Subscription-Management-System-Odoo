import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  AUTH_COOKIE_NAME,
  createSessionToken,
  getSessionCookieOptions,
} from "@/lib/auth";
import { RegisterSchema } from "@/lib/validations";

interface RegistrationBody {
  name: string;
  companyName: string;
  email: string;
  phone?: string;
  taxId?: string;
  city: string;
  password: string;
  confirmPassword: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegistrationBody;
    const result = RegisterSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.issues[0]?.message ?? "Invalid registration details" },
        { status: 400 }
      );
    }

    if (!body.companyName?.trim() || !body.city?.trim()) {
      return NextResponse.json(
        { success: false, error: "Company name and city/state are required" },
        { status: 400 }
      );
    }

    const email = result.data.email.toLowerCase();
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(result.data.password, 12);
    const customerNumber = `CUST-${new Date().getFullYear()}-${crypto.randomUUID()
      .replaceAll("-", "")
      .slice(0, 8)
      .toUpperCase()}`;

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: result.data.name.trim(),
        role: "CUSTOMER",
        status: "ACTIVE",
        customer: {
          create: {
            customerNumber,
            name: result.data.name.trim(),
            email,
            phone: body.phone?.trim() || null,
            companyName: body.companyName.trim(),
            taxId: body.taxId?.trim() || null,
            billingAddress: {
              street: "Not provided",
              city: body.city.trim(),
              state: "Not provided",
              postalCode: "Not provided",
              country: "India",
            },
            status: "ACTIVE",
          },
        },
      },
      include: { customer: true },
    });

    const token = createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      customerId: user.customer?.id,
    });

    const response = NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        },
      },
      { status: 201 }
    );
    response.cookies.set(AUTH_COOKIE_NAME, token, getSessionCookieOptions());
    return response;
  } catch (error) {
    console.error("[Auth Registration Error]", error);
    return NextResponse.json(
      { success: false, error: "Unable to create the account right now" },
      { status: 500 }
    );
  }
}
