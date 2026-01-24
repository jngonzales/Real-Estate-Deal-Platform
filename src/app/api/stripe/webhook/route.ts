import { NextRequest, NextResponse } from "next/server";
import { stripe, getPlanByPriceId } from "@/lib/stripe";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

// Use service role for webhook handlers (no user context)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancelled(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const planType = session.metadata?.planType;

  if (!userId || !planType) {
    console.error("Missing metadata in checkout session");
    return;
  }

  // Update user's subscription in database
  await supabaseAdmin
    .from("profiles")
    .update({
      subscription_tier: planType,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: session.subscription as string,
      subscription_status: "active",
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  // Log the subscription event
  await supabaseAdmin.from("audit_logs").insert({
    user_id: userId,
    action: "subscription_created",
    entity_type: "subscription",
    new_values: {
      plan: planType,
      subscription_id: session.subscription,
    },
  });

  console.log(`✅ User ${userId} subscribed to ${planType} plan`);
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const userId = subscription.metadata?.userId;
  
  if (!userId) {
    // Try to find user by customer ID
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", subscription.customer as string)
      .single();

    if (!profile) {
      console.error("Could not find user for subscription:", subscription.id);
      return;
    }
  }

  const priceId = subscription.items.data[0]?.price.id;
  const planType = getPlanByPriceId(priceId) || "pro";

  // Get period end from subscription object
  const periodEnd = (subscription as unknown as Record<string, unknown>).current_period_end as number | undefined;

  await supabaseAdmin
    .from("profiles")
    .update({
      subscription_tier: planType,
      subscription_status: subscription.status,
      stripe_subscription_id: subscription.id,
      subscription_period_end: periodEnd
        ? new Date(periodEnd * 1000).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_customer_id", subscription.customer as string);

  console.log(`✅ Subscription ${subscription.id} updated to ${planType}`);
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  await supabaseAdmin
    .from("profiles")
    .update({
      subscription_tier: "free",
      subscription_status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("stripe_subscription_id", subscription.id);

  console.log(`❌ Subscription ${subscription.id} cancelled`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // Update last payment date
  const subscriptionId = (invoice as unknown as Record<string, unknown>).subscription as string | undefined;
  
  if (subscriptionId) {
    await supabaseAdmin
      .from("profiles")
      .update({
        last_payment_date: new Date().toISOString(),
        subscription_status: "active",
      })
      .eq("stripe_subscription_id", subscriptionId);
  }

  console.log(`💰 Payment succeeded for invoice ${invoice.id}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as unknown as Record<string, unknown>).subscription as string | undefined;
  
  if (subscriptionId) {
    await supabaseAdmin
      .from("profiles")
      .update({
        subscription_status: "past_due",
      })
      .eq("stripe_subscription_id", subscriptionId);
  }

  console.log(`⚠️ Payment failed for invoice ${invoice.id}`);
}
