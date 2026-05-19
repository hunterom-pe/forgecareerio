import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    console.error(`Webhook Error: ${error.message}`);
    return new Response(`Webhook Error: ${error.message}`, { status: 400 });
  }

  const session = event.data.object as any;

  // Handle successful checkout
  if (event.type === "checkout.session.completed") {
    const plan = session.metadata?.plan;
    const userId = session.metadata?.userId;
    const userEmail = session.customer_details?.email || session.customer_email;

    console.log(`[STRIPE WEBHOOK] Checkout completed for Plan: ${plan}, UserId: ${userId}, Email: ${userEmail}`);

    if (plan && (userId || userEmail)) {
      try {
        if (userId && userId !== 'unknown') {
          // Primary: Update by exact user ID from metadata
          await prisma.user.update({
            where: { id: userId },
            data: { tier: plan },
          });
          console.log(`[STRIPE] User ${userId} successfully upgraded to ${plan} via ID match`);
        } else if (userEmail) {
          // Fallback: Update by email if ID is missing
          await prisma.user.update({
            where: { email: userEmail },
            data: { tier: plan },
          });
          console.log(`[STRIPE] User ${userEmail} successfully upgraded to ${plan} via Email match`);
        }
      } catch (dbError) {
        console.error(`[STRIPE] Failed to update user in DB:`, dbError);
      }
    } else {
      console.error(`[STRIPE] Missing critical info - Plan: ${plan}, UserId: ${userId}`);
    }
  }

  return NextResponse.json({ received: true });
}
