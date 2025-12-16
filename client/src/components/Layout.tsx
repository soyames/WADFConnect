import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X, User, LogOut, LayoutDashboard, Ticket, Award } from "lucide-react";
import { useState } from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { currentUser, userData, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const navigation = [
    { name: t("nav.home"), key: "home", href: "/" },
    { name: t("nav.about"), key: "about", href: "/about" },
    { name: t("nav.tickets"), key: "tickets", href: "/tickets" },
    { name: t("nav.sponsors"), key: "sponsors", href: "/sponsors" },
    { name: t("nav.agenda"), key: "agenda", href: "/agenda" },
    { name: t("nav.faq"), key: "faq", href: "/faq" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    // Special handling for FAQ tab - also active when on /cfp or /network
    if (href === "/faq" && (location.startsWith("/faq") || location.startsWith("/cfp") || location.startsWith("/network"))) {
      return true;
    }
    return location.startsWith(href);
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center gap-3 hover-elevate p-2 rounded-lg transition-all cursor-pointer" data-testid="link-logo">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">W</span>
                  </div>
                  <span className="font-serif text-xl font-bold hidden sm:inline">
                    WADF
                  </span>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigation.map((item) => (
                <Link key={item.href} href={item.href}>
                  <button
                    className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover-elevate active-elevate-2 h-9 px-4 py-2 ${isActive(item.href) ? "bg-muted" : ""}`}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    data-testid={`nav-${item.key}`}
                  >
                    {item.name}
                  </button>
                </Link>
              ))}
            </nav>

            {/* Auth Section */}
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              {currentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2" data-testid="button-user-menu">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">
                        {currentUser.email?.split("@")[0]}
                      </span>
                      {userData?.role && (
                        <Badge variant="outline" className="ml-1">
                          {userData.role}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{userData?.name || "User"}</p>
                        <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {(userData?.role === "organizer" || userData?.role === "admin") && (
                      <>
                        <Link href="/admin">
                          <DropdownMenuItem data-testid="menu-admin">
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Admin Dashboard
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <Link href="/agenda">
                      <DropdownMenuItem data-testid="menu-my-agenda">
                        <Ticket className="mr-2 h-4 w-4" />
                        My Agenda
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/certificate">
                      <DropdownMenuItem data-testid="menu-certificate">
                        <Award className="mr-2 h-4 w-4" />
                        My Certificate
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} data-testid="menu-signout">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link href="/login">
                  <button 
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover-elevate active-elevate-2 h-9 px-4 py-2"
                    data-testid="button-signin"
                  >
                    Sign In
                  </button>
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="button-mobile-menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="lg:hidden py-4 border-t" data-testid="mobile-menu">
              <div className="flex flex-col space-y-2">
                {navigation.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <button
                      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover-elevate active-elevate-2 h-9 px-4 py-2 w-full justify-start ${isActive(item.href) ? "bg-muted" : ""}`}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid={`mobile-nav-${item.key}`}
                    >
                      {item.name}
                    </button>
                  </Link>
                ))}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/50 py-12">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-chart-2 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">W</span>
                </div>
                <span className="font-serif text-xl font-bold">WADF</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-md">
                West Africa Design Forum - Empowering and connecting designers, 
                promoting cultural heritage, and fostering innovation across West Africa.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/about">
                    <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                      About WADF
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/tickets">
                    <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                      Buy Tickets
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/cfp">
                    <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                      Call for Proposals
                    </span>
                  </Link>
                </li>
                <li>
                  <Link href="/sponsors">
                    <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                      Become a Sponsor
                    </span>
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-3">Contact</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="mailto:hello@wadf.org" className="hover:text-foreground transition-colors">
                    hello@wadf.org
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2026 West Africa Design Forum. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
