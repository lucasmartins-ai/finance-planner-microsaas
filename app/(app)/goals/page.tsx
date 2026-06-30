import { redirect } from "next/navigation";

export default function GoalsPage(): never {
  redirect("/dashboard#goals");
}
