import { NextRequest, NextResponse } from "next/server";
import { stripe, PLANS, PlanType } from "@/lib/stripe";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 503 }
      );
    }

    const { planType } = await request.json();

    // Get current user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to subscribe" },
        { status: 401 }
      );
    }

    // Get the plan details
    const plan = PLANS[planType as PlanType];
    if (!plan || plan.price === 0) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 }
      );
    }

    // Try to get user profile with stripe_customer_id
    let customerId: string | undefined;
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("stripe_customer_id, email, full_name")
        .eq("id", user.id)
        .single();

      customerId = profile?.stripe_customer_id || undefined;

      // Create Stripe customer if doesn't exist
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email || profile?.email,
          name: profile?.full_name || undefined,
          metadata: {
            userId: user.id,
          },
        });
        customerId = customer.id;

        // Try to save customer ID to profile (may fail if column doesn't exist)
        try {
          await supabase
            .from("profiles")
            .update({ stripe_customer_id: customerId })
            .eq("id", user.id);
        } catch (updateError) {
          console.log("Could not save stripe_customer_id (migration may not be run):", updateError);
        }
      }
    } catch (profileError) {
      console.log("Profile fetch error (using email from auth):", profileError);
      // Create customer with just auth email
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `DealFlow ${plan.name} Plan`,
              description: plan.description,
              images: [`${process.env.NEXT_PUBLIC_APP_URL}/icons/icon-512x512.png`],
            },
            unit_amount: plan.price * 100, // Stripe uses cents
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success&plan=${planType}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?payment=cancelled`,
      metadata: {
        userId: user.id,
        planType: planType,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          planType: planType,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: "auto",
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to create checkout session: ${errorMessage}` },
      { status: 500 }
    );
  }
}
