export interface Plan {
  id: string;
  title: string;
  description: string;
  highlight?: boolean;
  type?: "monthly" | "yearly";
  currency?: string;
  monthlyPrice: string;
  yearlyPrice: string;
  buttonText: string;
  badge?: string;
  features: {
    name: string;
    icon: string;
    iconColor?: string;
  }[];
}

export interface CurrentPlan {
  plan: Plan;
  type: "monthly" | "yearly" | "custom";
  price?: string;
  nextBillingDate: string;
  paymentMethod: string;
  status: "active" | "inactive" | "past_due" | "cancelled";
}

export const plans: Plan[] = [
  {
    id: "plan_monthly_5usd",
    title: "Monthly",
    description: "Best for trying Nemo with low commitment.",
    currency: "$",
    monthlyPrice: "5",
    yearlyPrice: "5",
    buttonText: "Subscribe Monthly",
    highlight: true,
    features: [
      {
        name: "Full task + streak system",
        icon: "check",
        iconColor: "text-green-500",
      },
      {
        name: "Progress and badge tracking",
        icon: "check",
        iconColor: "text-blue-500",
      },
      {
        name: "Cancel anytime",
        icon: "check",
        iconColor: "text-emerald-500",
      },
    ],
  },
  {
    id: "plan_lifetime_9usd",
    title: "Lifetime",
    description: "One-time purchase. Lifetime access and updates.",
    currency: "$",
    monthlyPrice: "9",
    yearlyPrice: "9",
    buttonText: "Buy Lifetime",
    features: [
      {
        name: "One-time payment",
        icon: "check",
        iconColor: "text-green-500",
      },
      {
        name: "Lifetime updates",
        icon: "check",
        iconColor: "text-orange-500",
      },
      {
        name: "Best long-term value",
        icon: "check",
        iconColor: "text-teal-500",
      },
    ],
  },
];
