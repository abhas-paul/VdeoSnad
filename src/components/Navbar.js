'use client';

import React, { useState, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { User, Clock, MapPin, LogOut } from 'lucide-react';
import Image from 'next/image';

const Navbar = () => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const { data: session } = useSession();
  const user = session?.user;

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-white h-15 border-b border-gray-200 px-2 py-2 shadow-sm">
      <nav className="flex mt-2 items-center justify-between max-w-7xl mx-auto">
        {/* Left Section - Logo and Date */}
        <section className="flex items-center space-x-3">
          <figure className="bg-black rounded-full">
            <Image src="/logo.png" width={35} height={35} alt="Logo" />
          </figure>

          <section className="hidden md:flex items-center space-x-2 text-xs text-gray-600 ml-4">
            <MapPin className="w-5 h-5" />
            <time className="font-bold">
              {currentDateTime.toLocaleDateString('en-IN', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </time>
          </section>
        </section>

        {/* Right Section - Time & Profile */}
        <aside className="flex items-center space-x-4">
          <section className="hidden md:flex items-center space-x-1 text-xs text-gray-600">
            <Clock className="w-5 h-5" />
            <time className="font-bold">
              {currentDateTime.toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
                timeZone: 'Asia/Kolkata',
              })}
            </time>
          </section>

          {/* User Profile */}
          {user && (
            <section className="flex items-center pl-2 border-l border-gray-200 ml-1 space-x-2">
              {user.image ? (
                <Image
                  src={user.image}
                  alt="User avatar"
                  width={28}
                  height={28}
                  className="rounded-full object-cover"
                />
              ) : (
                <section className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center">
                  <User className="w-3 h-3 text-white" />
                </section>
              )}

              <section className="text-sm text-gray-700 flex flex-col">
                <p className="font-medium">
                  {user.name || 'Anonymous User'}
                </p>
                {user.email && (
                  <p className="text-xs text-gray-500">{user.email}</p>
                )}
              </section>

              <button
                aria-label="Sign out"
                onClick={() => signOut()}
                className="text-gray-500 hover:text-red-500 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5 cursor-pointer" />
              </button>
            </section>
          )}
        </aside>
      </nav>
    </header>
  );
};

export default Navbar;
