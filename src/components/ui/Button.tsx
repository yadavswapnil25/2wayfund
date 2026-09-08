import type { ButtonHTMLAttributes } from "react";

type Variant = "default" | "primary" | "approve" | "reject" | "block";

const BASE = "inline-block border rounded-[5px] px-4 py-2 text-xs font-semibold cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed";

const VARIANTS: Record<Variant, string> = {
  default: "bg-white border-border text-ink hover:bg-tint",
  primary: "bg-gradient-to-b from-navy-lt to-navy border-navy-dk text-white shadow-sm hover:brightness-110",
  approve: "bg-gradient-to-b from-[#2C9159] to-[#1C7A46] border-[#166138] text-white hover:brightness-110",
  reject: "bg-gradient-to-b from-[#D0503F] to-neg border-[#9E2D22] text-white hover:brightness-110",
  block: "bg-gradient-to-b from-navy-lt to-navy border-navy-dk text-white shadow-sm hover:brightness-110 w-full text-center py-2.5",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Btn({ variant = "default", className = "", type = "button", ...rest }: Props) {
  return <button type={type} className={`${BASE} ${VARIANTS[variant]} ${className}`} {...rest} />;
}
