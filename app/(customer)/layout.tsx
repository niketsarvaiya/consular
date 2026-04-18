import { CustomerNav } from "@/components/customer/CustomerNav";
export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <CustomerNav />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-slate-100 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-slate-500">© {new Date().getFullYear()} Consular. All rights reserved.</p>
            <p className="max-w-md text-center text-xs text-slate-400">
              Visa approval is at the sole discretion of the respective embassy or government authority. Consular facilitates the application process only and does not guarantee visa approval.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
