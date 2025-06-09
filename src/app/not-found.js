import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white px-6">
      
      {/* Banner Image */}
      <figure className="relative w-full max-w-2xl h-64 sm:h-80 mb-8 rounded-xl overflow-hidden">
        <Image
          src="/banner.png"
          alt="404 banner"
          layout="fill"
          objectFit="cover"
          className="opacity-80"
        />
        <figcaption className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <h1 className="text-3xl sm:text-5xl font-bold">Page Not Found</h1>
        </figcaption>
      </figure>

      {/* Message Section */}
      <section className="max-w-md">
        <h2 className="text-xl sm:text-2xl mb-4">
          Oops! The page you’re looking for doesn’t exist.
        </h2>
        <p className="mb-8 text-gray-300">
          It might have been moved or deleted. Try going back to the homepage.
        </p>

        <Link href="/">
          <button className="cursor-pointer inline-block bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 transition-all duration-300 text-white font-semibold px-6 py-3 rounded-md shadow-md">
            Go to Home
          </button>
        </Link>
      </section>
    </main>
  );
}
