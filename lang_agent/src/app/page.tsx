import HeroContent from "@/components/HeroContent";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-800 to-blue-400 to-gray-400 flex items-center justify-center">
        <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right, #e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] bg-[size:6rem_4rem]"/>
        <HeroContent/>
    </main>
  );
}
