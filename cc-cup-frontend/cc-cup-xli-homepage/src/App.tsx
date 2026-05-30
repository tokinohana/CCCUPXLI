import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
      
      <main className="z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center gap-8">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
          CC CUP
        </h1>
        <p className="text-lg md:text-xl text-slate-300 max-w-2xl leading-relaxed">
          The ultimate competition is here. Register now to participate in the most anticipated event of the year. Showcase your skills, compete with the best, and claim victory.
        </p>
        <div className="flex items-center gap-4 mt-4">
          <a href="#" className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-full shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95">
            Register Now
          </a>
          <a href="#" className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-full shadow-md transition-all hover:scale-105 active:scale-95 border border-slate-700 hover:border-slate-600">
            Learn More
          </a>
        </div>
      </main>

      <footer className="absolute bottom-8 text-slate-500 text-sm font-medium">
        © {new Date().getFullYear()} CC CUP. All rights reserved.
      </footer>
    </div>
  )
}

export default App
