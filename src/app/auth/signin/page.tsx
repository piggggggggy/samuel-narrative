import { GithubLogoIcon } from "@phosphor-icons/react/dist/ssr/GithubLogo";
import { signIn } from "@/lib/auth";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "로그인",
  description: "관리자 로그인",
};

export default function SignInPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6 rounded-2xl border border-border-default bg-bg-secondary p-8">
          <h1 className="text-center heading-5 text-text-primary">
            관리자 로그인
          </h1>
          <p className="text-center body-6 text-text-secondary">
            블로그 관리를 위해 로그인해주세요.
          </p>
          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/admin" });
            }}
          >
            <button type="submit" className="button-primary w-full button-md">
              <GithubLogoIcon aria-hidden="true" className="h-5 w-5" />
              GitHub으로 로그인
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
