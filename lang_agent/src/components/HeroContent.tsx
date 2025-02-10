import SignOut from "./SignedOut";
import SignIn from "./SignIn";

const features = [
  { title :"Fast", description: "Real-time streamed responses"}, 
  { title:"Modern", description:"Nextjs15, Convex, Clerk, TailwindCSS, LangChain" },
  { title:"Smart", description:"Powered by most powerful LLMs" }
]
export default function HeroContent() {
  return (
    <section className="w-full px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8 flex flex-col items-center space-y-10 text-center">
      {/*HERO CONTENT-main content that grabs attention*/}
      <header className="space-y-6">
        <h1 className="text-5xl font-bold tracking-tight sm:text-7xl bg-gradient-to-r from-gray-950 via-gray-900 to-gray-800 bg-clip-text text-transparent">
          AI Agent Assistant
        </h1>
        <p className="max-w-[600px] text-lg text-gray-400 md:text-xl/relaxed xl:text-2xl/relaxed">
        The new AI chat companion that goes beyond conversation - it  can actually get things done!</p>
        <br/>
        <span className="text-gray-300 text-sm">
            Powered by IBM&apos;s WxTools & your favourite LLM&apos;s.
        </span>
      </header>
      <SignIn/>
      <SignOut/>
      {/*Features grid*/}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-7 md:gap-14 pt-8 max-w-3xl mx-auto">
        {features.map(({title, description})  => (
          <div key={title} className="text-center">
            <div className="text-2xl font-semibold text-gray-950">
              {title}
            </div>
            <div className="text-sm text-pink-100 mt-1">{description}</div>
          </div>
        ) )}
      </div>
    </section>
  );
}
