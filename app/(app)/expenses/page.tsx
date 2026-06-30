import { redirect } from "next/navigation";

export default function ExpensesPage(): never {
  redirect("/dashboard#expenses");
}
