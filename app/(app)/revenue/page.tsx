import { redirect } from "next/navigation";

export default function RevenuePage(): never {
  redirect("/dashboard#revenue");
}
