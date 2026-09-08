import type { RouteDef } from "../data/constants";
import type { Role } from "../state/AppContext";

export function canAccess(entry: RouteDef, role: Role): boolean {
  if (entry.access === "public") return true;
  if (entry.access === "anon") return role === null;
  if (entry.access === "customer") return role === "customer";
  if (entry.access === "admin") return role === "admin";
  return false;
}

export function landingFor(role: Role): string {
  if (role === "customer") return "/";
  if (role === "admin") return "/console";
  return "/home";
}
