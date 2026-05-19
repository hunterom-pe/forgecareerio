import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find the Stripe Customer ID for this user
    // In a real app, you'd store the stripeCustomerId in your DB.
    // For now, we search for the customer by email.
    const customers = await stripe.customers.list({
      email: session.user.email,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return NextResponse.json({ error: "No active subscription found." }, { status: 404 });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customers.data[0].id,
      return_url: `${process.env.NEXTAUTH_URL}/dashboard/settings`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error: any) {
    console.error("Stripe Portal Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
