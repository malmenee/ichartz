import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  type ErrorComponentProps,
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/use-auth";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <p className="mt-4 text-muted-foreground">This page doesn't exist.</p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "iChart — ChartSeer & ICT Pulse" },
      {
        name: "description",
        content:
          "Upload a price chart screenshot. AI applies pure price-action rules and predicts the next move — and learns from your feedback.",
      },
      { property: "og:title", content: "iChart — ChartSeer & ICT Pulse" },
      { name: "twitter:title", content: "iChart — ChartSeer & ICT Pulse" },
      { name: "description", content: "iChart is home to ChartSeer (AI chart prediction) and ICT Pulse (live session & news timing). One account, two trading tools." },
      { property: "og:description", content: "iChart is home to ChartSeer (AI chart prediction) and ICT Pulse (live session & news timing). One account, two trading tools." },
      { name: "twitter:description", content: "iChart is home to ChartSeer (AI chart prediction) and ICT Pulse (live session & news timing). One account, two trading tools." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/6a681734-594c-4469-9281-ef26e599a138/id-preview-023964be--b57d008e-08ad-4010-a837-b5544347a3da.lovable.app-1778336416754.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/6a681734-594c-4469-9281-ef26e599a138/id-preview-023964be--b57d008e-08ad-4010-a837-b5544347a3da.lovable.app-1778336416754.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Outlet />
        <Toaster richColors position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
