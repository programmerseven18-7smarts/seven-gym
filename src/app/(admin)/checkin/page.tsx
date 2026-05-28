import { redirect } from "next/navigation";

export default function CheckinRedirectPage() {
  redirect("/check-in/scan");
}
