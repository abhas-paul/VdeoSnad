import Link from "next/link";
import { Github } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-gradient-to-br from-gray-800 to-black text-white py-10 px-6">
            <nav className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">

                {/* Brand & Tagline */}
                <section className="text-center sm:text-left">
                    <h2 className="text-2xl font-bold">VdeoSnad</h2>
                    <p className="text-sm text-gray-400 mt-1">A modern video conferencing platform</p>
                </section>

                {/* Navigation Links */}
                <section>
                    <ul className="flex gap-6 text-sm font-medium">
                        <li><Link href="/">Home</Link></li>
                        <li><Link href="/about">About</Link></li>
                        <li><Link href="/privacy">Privacy</Link></li>
                        <li><Link href="/terms">Terms</Link></li>
                    </ul>
                </section>

                {/* Social Icons */}
                <section className="flex gap-4">
                    <Link href="https://github.com/abhas-paul/" target="_blank" aria-label="GitHub">
                        <Github className="hover:text-blue-400 transition" />
                    </Link>
                </section>
            </nav>

            {/* Copyright */}
            <section className="mt-6 text-center text-sm text-gray-500">
                &copy; {new Date().getFullYear()} VdeoSnad. All rights reserved.
            </section>
        </footer>
    );
}
