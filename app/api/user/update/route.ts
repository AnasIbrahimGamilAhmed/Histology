import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, password, phone } = body;

    if (!name) {
      return Response.json({ error: "Name is required" }, { status: 400 });
    }

    // Prepare update data
    const updateData: any = { name };
    
    if (email) {
      // Check if email is already used by someone else
      const existingEmail = await prisma.studentAccount.findFirst({
        where: {
          email: { equals: email, mode: 'insensitive' },
          id: { not: session.user.id }
        }
      });

      if (existingEmail) {
        return Response.json({ error: "Email is already in use by another account" }, { status: 400 });
      }
      
      updateData.email = email;
    }

    if (phone) {
      // Check if phone is already used
      const existingPhone = await prisma.studentAccount.findFirst({
        where: {
          phone: { equals: phone, mode: 'insensitive' },
          id: { not: session.user.id }
        }
      });

      if (existingPhone) {
        return Response.json({ error: "Phone number is already in use" }, { status: 400 });
      }
      
      updateData.phone = phone;
    }

    if (password && password.trim() !== "") {
      if (password.length < 6) {
        return Response.json({ error: "Password must be at least 6 characters long" }, { status: 400 });
      }
      updateData.password = password;
    }

    // Perform update
    const updatedUser = await prisma.studentAccount.update({
      where: { universityId: session.user.id },
      data: updateData
    });

    return Response.json({
      success: true,
      user: {
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone
      }
    });

  } catch (error: any) {
    console.error("[USER_UPDATE_ERROR]", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
