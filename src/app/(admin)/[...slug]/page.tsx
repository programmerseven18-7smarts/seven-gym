import GymPrototypePage from "@/components/gym/GymPrototypePage";
import { redirect } from "next/navigation";

type PrototypeRouteProps = {
  params: Promise<{
    slug?: string[];
  }>;
};

export default async function PrototypeRoute({ params }: PrototypeRouteProps) {
  const { slug = [] } = await params;

  const [moduleName, subPage] = slug;
  if (moduleName === "cashier") {
    redirect(`/payments/${subPage ?? "transactions"}`);
  }

  if (moduleName === "transactions") {
    redirect("/payments/transactions");
  }

  return <GymPrototypePage slug={slug} />;
}
