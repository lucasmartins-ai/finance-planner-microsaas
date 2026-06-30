import {
  BarChart3,
  FileDown,
  Gauge,
  Goal,
  Landmark,
  ReceiptText,
  Settings,
  WalletCards,
} from "lucide-react";
import Link from "next/link";

const navigationItems = [
  { href: "/dashboard", label: "Dashboard", icon: Gauge },
  { href: "/dashboard#revenue", label: "Revenue", icon: Landmark },
  { href: "/dashboard#expenses", label: "Expenses", icon: ReceiptText },
  { href: "/dashboard#goals", label: "Goals", icon: Goal },
  { href: "/dashboard#simulator", label: "Simulator", icon: BarChart3 },
  { href: "/dashboard#reports", label: "CSV export", icon: FileDown },
  { href: "/dashboard#settings", label: "Assumptions", icon: Settings },
];

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactNode {
  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <Link className="brand" href="/dashboard">
          <span className="brand-mark">
            <WalletCards aria-hidden="true" size={20} />
          </span>
          <span>
            <strong>Finance Planner</strong>
            <small>Portfolio demo</small>
          </span>
        </Link>

        <nav className="nav-list">
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link className="nav-link" href={item.href} key={item.href}>
                <Icon aria-hidden="true" size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="main-shell">{children}</main>
    </div>
  );
}
