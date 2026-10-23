import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { HospitalResults } from "@/components/hospitals/HospitalResults";
import { HospitalSearchProvider } from "@/components/hospitals/HospitalSearchProvider";
import { SearchBar } from "@/components/hospitals/SearchBar";
import { Logo } from "@/components/ui/Logo";
import { queryFor, unslugify } from "@/lib/hospitals/slug";

export async function generateMetadata({ params }: PageProps<"/hospitals/[city]">): Promise<Metadata> {
  const { city } = await params;
  const place = unslugify(city);
  return {
    title: `Hospitals in ${place} — Health Pin`,
    description: `Find hospitals in ${place}: addresses, specialties, facilities, contact details and a map, from the Health Pin hospital directory.`,
  };
}

function Header({ query }: { query: string }) {
  return (
    <header className="border-b border-line bg-canvas/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 sm:px-8 lg:flex-row lg:items-center lg:gap-8">
        <div className="flex items-center justify-between gap-4 lg:shrink-0">
          <Link href="/" aria-label="Health Pin — home">
            <Logo className="h-9" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-brand-dark hover:bg-mint lg:hidden"
          >
            <ArrowLeft aria-hidden className="size-4" /> Home
          </Link>
        </div>
        <div className="min-w-0 flex-1 lg:max-w-2xl">
          <SearchBar key={query} initialValue={query} />
        </div>
        <Link
          href="/"
          className="hidden items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-brand-dark hover:bg-mint lg:ml-auto lg:inline-flex"
        >
          <ArrowLeft aria-hidden className="size-4" /> Back to home
        </Link>
      </div>
    </header>
  );
}

async function Results({ params, searchParams }: Pick<PageProps<"/hospitals/[city]">, "params" | "searchParams">) {
  const [{ city }, { q }] = await Promise.all([params, searchParams]);
  const query = queryFor(city, q);
  return (
    <>
      <Header query={query} />
      <main className="pt-8 lg:pt-10">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <HospitalSearchProvider key={query} query={query}>
            <HospitalResults />
          </HospitalSearchProvider>
        </div>
      </main>
    </>
  );
}

export default function HospitalsPage({ params, searchParams }: PageProps<"/hospitals/[city]">) {
  return (
    <>
      <Suspense
        fallback={
          <>
            <Header query="" />
            <main className="mx-auto max-w-7xl px-5 pt-10 sm:px-8" aria-busy="true">
              <div className="h-10 w-2/3 max-w-md animate-pulse rounded bg-line" />
              <div className="mt-6 h-[420px] animate-pulse rounded-3xl bg-line/60" />
            </main>
          </>
        }
      >
        <Results params={params} searchParams={searchParams} />
      </Suspense>
      <footer className="bg-brand-dark">
        <p className="mx-auto max-w-7xl px-5 py-5 text-sm text-white/60 sm:px-8">© 2026 Health Pin. All rights reserved.</p>
      </footer>
    </>
  );
}
