import type { RouteObject } from "react-router-dom";
import router from "@/routes/router";

// Build full paths from nested routes (handles relative child paths)
function joinPath(base: string, child?: string) {
  if (!child || child === "") return base || "/";
  if (child.startsWith("/")) return child;
  const a = base.endsWith("/") ? base.slice(0, -1) : base || "";
  const b = child.startsWith("/") ? child : `/${child}`;
  return (a + b) || "/";
}

function collectPaths(
  routes: RouteObject[] | undefined,
  base = ""
): string[] {
  if (!routes) return [];
  const out: string[] = [];
  for (const r of routes) {
    const full = r.path != null ? joinPath(base, r.path) : base || "/";
    // Only record when this route has a concrete, navigable element
    const hasElement = (r as any).element != null;

    // Filter: exclude params/wildcards (e.g., /:id, /*, /a/:b)
    const isParamOrWildcard = /[:*]/.test(full);

    if (hasElement && !isParamOrWildcard) {
      out.push(full || "/");
    }
    // Recurse into children
    if (r.children?.length) {
      out.push(...collectPaths(r.children, full));
    }
  }
  return out;
}

/** Return sorted, de-duplicated, concrete routes */
export function getConcreteRoutes(): string[] {
  // router.routes is the top-level array passed into createBrowserRouter
  const top = (router as any).routes as RouteObject[];
  const all = collectPaths(top, "");
  // De-dupe + sort (stable alphabetical for predictable order)
  return Array.from(new Set(all)).sort((a, b) => a.localeCompare(b));
}