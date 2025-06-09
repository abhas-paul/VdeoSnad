"use client"
import Navbar from "@/components/Navbar";
import Cards from "@/components/Cards";
import Image from "next/image";
import Footer from "@/components/Footer";
import { useRouter } from 'next/navigation';
import JoinMeetings from '@/components/JoinMeetings'
import { useState } from "react";
import PostponeMeetings from '@/components/PostponeMeetings'

export default function Home() {
  const router = useRouter();
  const [OpenJoinMeetingdialog, setOpenJoinMeetingdialog] = useState(false)
  const [OpenPostponeMeetingdialog, setOpenPostponeMeetingdialog] = useState(false)
  const [PostMeetingCode, setPostMeetingCode] = useState('')
  //functions
  function generateAndRedirect() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const secret = process.env.NEXT_PUBLIC_MEETING_CODE_SECRET;
    const totalLength = 40;
    const extraLength = totalLength - secret.length;

    // Generate random characters for the remaining part
    let randomPart = '';
    for (let i = 0; i < extraLength; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      randomPart += chars[randomIndex];
    }

    // Always place the secret at the beginning for consistency
    const Roomcode = secret + randomPart;

    // Ensure the code is exactly 40 characters
    if (Roomcode.length !== 40) {
      // If secret is longer than expected, truncate it
      const adjustedSecret = secret.slice(0, 20);
      const adjustedRandom = randomPart.slice(0, 40 - adjustedSecret.length);
      const adjustedCode = adjustedSecret + adjustedRandom;
      router.push(`/meeting/${adjustedCode}`);
    } else {
      router.push(`/meeting/${Roomcode}`);
    }
  }


  //handlers
  const handleCraeteMeeting = () => {
    generateAndRedirect();
  }

  const handleJoinMeeting = () => {
    setOpenJoinMeetingdialog(true)
  }

  const handleScheduleMeeting = () => {
    router.push('/schedulemeetings')
  }
  
  const handlePostponeMeeting = () => {
    setOpenPostponeMeetingdialog(true)

    //making a random code for the meeting
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const secret = process.env.NEXT_PUBLIC_MEETING_CODE_SECRET;
    const totalLength = 40;
    const extraLength = totalLength - secret.length;

    // Generate random characters for the remaining part
    let randomPart = '';
    for (let i = 0; i < extraLength; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      randomPart += chars[randomIndex];
    }

    // Always place the secret at the beginning for consistency
    const PostMeetingCode = secret + randomPart;

    // Ensure the code is exactly 40 characters
    if (PostMeetingCode.length !== 40) {
      // If secret is longer than expected, truncate it
      const adjustedSecret = secret.slice(0, 20);
      const adjustedRandom = randomPart.slice(0, 40 - adjustedSecret.length);
      const adjustedCode = adjustedSecret + adjustedRandom;
      setPostMeetingCode(adjustedCode);
    } else {
      setPostMeetingCode(PostMeetingCode);
    }
  }

  return (
    <>
      <header>
        <Navbar />
      </header>

      {/* Banner */}
      <figure className="relative w-full h-[60vh] md:h-[70vh] lg:h-[80vh] overflow-hidden">
        <Image
          src="/banner.png"
          alt="banner"
          layout="fill"
          objectFit="cover"
          className="z-0"
        />
        <figcaption className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
            Welcome to Vdeo<span className="text-gray-400">Sand</span>
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-200 max-w-2xl">
            Host or join secure video meetings with ease, speed, and style.
          </p>
        </figcaption>
      </figure>

      {/* Cards Section */}
      <main className="p-6 sm:p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        <article>
          <Cards
            className="bg-gradient-to-br text-white from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 transition-all duration-300"
            img="/home-icons/plus.svg"
            title="New Meeting"
            description="Start a new meeting instantly and invite others to join."
            handleClick={handleCraeteMeeting}
          />
        </article>
        <article>
          <Cards
            className="bg-gradient-to-br from-rose-400 to-pink-600 hover:from-rose-500 hover:to-pink-700 transition-all duration-300 text-white"
            img="/home-icons/join.svg"
            title="Join Meeting"
            description="Click and enter the code to join an existing meeting."
            handleClick={handleJoinMeeting}
          />
        </article>
        <article>
          <Cards
            className="bg-gradient-to-br from-purple-400 to-indigo-600 hover:from-purple-500 hover:to-indigo-700 transition-all duration-300 text-white"
            img="/home-icons/schedule.svg"
            title="Schedule Meeting"
            description="Plan and schedule meetings with calendar integration."
            handleClick={handleScheduleMeeting}
          />
        </article>
        <article>
          <Cards
            className="bg-gradient-to-br from-emerald-400 to-green-600 hover:from-emerald-500 hover:to-green-700 transition-all duration-300 text-white"
            img="/home-icons/later.svg"
            title="Postpone meeting"
            description="Schedule meetings for later. Link never expires."
            handleClick={handlePostponeMeeting}
          />
        </article>
      </main>
      <JoinMeetings isOpen={OpenJoinMeetingdialog} setIsOpen={setOpenJoinMeetingdialog}/>
      <PostponeMeetings isOpen={OpenPostponeMeetingdialog} setIsOpen={setOpenPostponeMeetingdialog} Postcode={PostMeetingCode}/>
      <Footer />
    </>
  );
}
