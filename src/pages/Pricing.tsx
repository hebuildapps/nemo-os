import { useCallback } from "react";
import { PricingTableOne } from "@/components/billingsdk/pricing-table-one";
import { plans } from "@/lib/billingsdk-config";
import { useAuth } from "@/hooks/useAuth";

type CheckoutResponse = { checkout_url: string };

export default function Pricing() {
  const { user } = useAuth();

  const onPlanSelect = useCallback(
    async (planId: string) => {
      if (!user) {
        sessionStorage.setItem("pending_plan_id", planId);
        window.location.href = "/?flow=auth";
        return;
      }

      try {
        const resp = await fetch("/api/dodo/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ plan_id: planId, quantity: 1 }),
        });

        if (!resp.ok) {
          throw new Error(`HTTP ${resp.status} ${await resp.text()}`);
        }

        const data = (await resp.json()) as CheckoutResponse;

        if (!data.checkout_url) {
          throw new Error("Missing checkout_url");
        }

        window.location.href = data.checkout_url;
      } catch (error) {
        console.error("Checkout error", error);
        alert("Unable to start checkout. Please try again.");
      }
    },
    [user],
  );

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <PricingTableOne
        title="Choose your plan"
        description="Simple, transparent pricing. Lifetime is one-time."
        plans={plans}
        onPlanSelect={onPlanSelect}
        size="large"
        theme="minimal"
      />
      <div className="container mt-6 text-sm text-muted-foreground">
        Note: The Lifetime plan is a one-time payment. The toggle does not affect it.
      </div>
    </div>
  );
}