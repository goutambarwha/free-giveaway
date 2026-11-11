import { SiteHeader } from "@/components/SiteHeader";
import { AuthForm } from "@/components/AuthForm";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SignupPage() {
  const session = await getSession();
  if (session) redirect("/");

  return (
    <>
      <SiteHeader user={null} />
      <div className="auth-page">
        <AuthForm mode="signup" />
      </div>
    </>
  );
}
