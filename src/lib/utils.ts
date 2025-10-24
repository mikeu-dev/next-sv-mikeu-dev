import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Registrasi plugin hanya di client
export function initGsap() {
	if (typeof window === 'undefined') return;
	// Gunakan flag di window agar tidak double-register saat HMR
	const win = window as Window & { _gsapRegistered?: boolean };
	if (win._gsapRegistered) return;

	gsap.registerPlugin(ScrollTrigger);
	win._gsapRegistered = true;
}

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };
