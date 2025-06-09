import Link from "next/link";

export default function About() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white px-4 sm:px-6 py-8 sm:py-12">
            <article className="max-w-4xl mx-auto">
                <header className="mb-6 sm:mb-8 text-center">
                    <h1 className="text-2xl sm:text-4xl font-bold mb-2">About VdeoSnad</h1>
                    <p className="text-gray-300 text-base sm:text-lg">
                        A modern, secure video conferencing platform built for seamless communication.
                    </p>
                </header>

                <section className="space-y-4 sm:space-y-6 text-gray-200 leading-relaxed text-sm sm:text-lg">
                    <p>
                        VdeoSnad is a clone project created to demonstrate skills in building a modern,
                        secure video conferencing platform. This project is designed purely for portfolio
                        purposes and learning.
                    </p>
                    <p>
                        Whether you want to start a quick meeting, schedule in advance, or join an
                        ongoing call, Meet Clone offers a streamlined experience on any device.
                    </p>
                    <p>
                        Built with the latest web technologies including Next.js, React, and WebRTC,
                        this platform ensures reliable and secure connections.
                    </p>
                    <p>
                        The full source code is available on GitHub:{" "}
                        <a
                            href="https://github.com/abhas-paul/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline break-all"
                        >
                            Check out the code here.
                        </a>
                    </p>
                </section>
            </article>

            <section className="text-center mt-8 sm:mt-10">
                <Link href="/">
                    <button className="cursor-pointer inline-block w-full sm:w-auto bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 transition-all duration-300 text-white font-semibold px-4 py-2 sm:px-6 sm:py-3 rounded-md shadow-md text-sm sm:text-base">
                        Go to Home
                    </button>
                </Link>
            </section>
        </main>
    );
}
