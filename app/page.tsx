'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Package2, Trash2, Heart, ArrowRight, Sparkles, Users, MessageSquare,
  CheckCircle, Zap, Shield, Star, Clock, BarChart3, Camera
} from 'lucide-react'

export default function HomePage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [shareCode, setShareCode] = useState('')
  const [showDevLogin, setShowDevLogin] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setIsAuthenticated(true)
        // Check for pending share code
        const pendingCode = sessionStorage.getItem('pendingShareCode')
        if (pendingCode) {
          sessionStorage.removeItem('pendingShareCode')
          router.push(`/join/${pendingCode}`)
        }
      }
    }
    checkAuth()
  }, [])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    // Use a simpler approach for magic links
    const redirectTo = `${window.location.origin}/auth/callback`
    console.log('Redirect URL:', redirectTo)
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Check your email for the magic link!')
    }
    setLoading(false)
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
    }
  }

  const handleJoinInventory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!shareCode.trim()) return
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      // Store the share code for after sign in
      sessionStorage.setItem('pendingShareCode', shareCode)
      setMessage('Please sign in first to join an inventory')
      return
    }
    
    router.push(`/join/${shareCode}`)
  }


  return (
    <div className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            <div className="flex items-center">
              <Package2 className="w-8 h-8 lg:w-10 lg:h-10 text-amber-500 mr-3" />
              <span className="text-xl lg:text-2xl font-bold text-gray-900">Tosslee</span>
            </div>
            <div className="flex items-center gap-6">
              {isAuthenticated ? (
                <>
                  <Link 
                    href="/dashboard"
                    className="text-gray-600 hover:text-gray-900 transition font-medium"
                  >
                    My Dashboard
                  </Link>
                  <Link 
                    href="/dashboard"
                    className="bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Go to App →
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    href="/landing"
                    className="hidden md:block text-gray-600 hover:text-gray-900 transition"
                  >
                    Features
                  </Link>
                  <Link 
                    href="/landing#how-it-works"
                    className="hidden md:block text-gray-600 hover:text-gray-900 transition"
                  >
                    How it Works
                  </Link>
                  <Link 
                    href="/landing#testimonials"
                    className="hidden md:block text-gray-600 hover:text-gray-900 transition"
                  >
                    Reviews
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-20 lg:pt-24">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-8 py-12 lg:py-24">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left Column - Content */}
              <div className="max-w-2xl">
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-full mb-6">
                  <Sparkles className="w-4 h-4 mr-2 text-amber-600" />
                  <span className="text-sm font-medium text-amber-700">Fast decisions, one swipe at a time</span>
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight">
                  Declutter Like
                  <span className="relative">
                    <span className="bg-gradient-to-r from-amber-500 to-yellow-600 bg-clip-text text-transparent"> Playing a Game</span>
                  </span>
                </h1>
                
                <p className="mt-6 text-lg lg:text-xl text-gray-600 leading-relaxed mb-6">
                  <strong>Tosslee</strong> turns decluttering into a fun, addictive experience. 
                  Swipe left to toss, right to keep. Build combos. Track your stuff. 
                  Make decisions in seconds, not hours.
                </p>
                
                {/* Quick Feature Pills */}
                <div className="flex flex-wrap gap-3 mb-8">
                  <div className="flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                    <Heart className="w-4 h-4" />
                    <span>Swipe to Decide</span>
                  </div>
                  <div className="flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium">
                    <Zap className="w-4 h-4" />
                    <span>Build Momentum</span>
                  </div>
                  <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                    <Package2 className="w-4 h-4" />
                    <span>Track Everything</span>
                  </div>
                </div>

                {/* How It Works Preview */}
                <div className="bg-amber-50 rounded-2xl p-6 border border-amber-200">
                  <h3 className="font-semibold text-gray-900 mb-3">How Tosslee Works:</h3>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-start gap-3">
                      <span className="text-amber-600 font-bold">1.</span>
                      <span>Upload photos of items you're unsure about</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-amber-600 font-bold">2.</span>
                      <span>Swipe right to keep, left to toss (just like dating apps!)</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-amber-600 font-bold">3.</span>
                      <span>Build decision streaks and earn points for quick choices</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-amber-600 font-bold">4.</span>
                      <span>Track where you store kept items for easy finding later</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Auth Card */}
              <div className="w-full max-w-lg mx-auto lg:mx-0">
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 lg:p-10">
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">Start Decluttering Today</h2>
                  
                  {/* Sign In Form */}
                  <form onSubmit={handleSignIn} className="space-y-5">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Your email
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-5 py-4 text-base bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 py-4 px-6 rounded-2xl font-semibold text-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100"
                    >
                      {loading ? 'Sending...' : 'Get Started Free →'}
                    </button>
                  </form>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">or continue with</span>
                    </div>
                  </div>

                  <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full bg-white border-2 border-gray-200 text-gray-700 py-4 px-6 rounded-2xl font-semibold text-lg hover:bg-gray-50 hover:border-gray-300 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3"
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign in with Google
                  </button>

                  <p className="text-center text-sm text-gray-500 mt-4">
                    No credit card required • Free forever
                  </p>

                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white text-gray-500">Already have a share code?</span>
                    </div>
                  </div>

                  {/* Join Form */}
                  <form onSubmit={handleJoinInventory} className="space-y-5">
                    <input
                      type="text"
                      value={shareCode}
                      onChange={(e) => setShareCode(e.target.value.toUpperCase())}
                      className="w-full px-5 py-4 text-base bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all text-center font-mono uppercase"
                      placeholder="ENTER CODE"
                      maxLength={6}
                    />
                    
                    <button
                      type="submit"
                      className="w-full bg-gray-900 text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:bg-gray-800 hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
                    >
                      Join Inventory
                    </button>
                  </form>

                  {message && (
                    <div className={`mt-6 p-4 rounded-2xl text-sm font-medium ${
                      message.includes('error') 
                        ? 'bg-red-50 text-red-700 border border-red-200' 
                        : 'bg-green-50 text-green-700 border border-green-200'
                    }`}>
                      {message}
                    </div>
                  )}

                  {/* Development bypass */}
                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={() => setShowDevLogin(!showDevLogin)}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Having trouble? Click here
                    </button>
                  </div>

                  {showDevLogin && (
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-sm text-amber-800 mb-3">
                        <strong>Development Mode:</strong> If magic links aren't working, you can bypass authentication for testing.
                      </p>
                      <button
                        onClick={() => {
                          // Create a mock user session for development
                          localStorage.setItem('dev_user', JSON.stringify({
                            id: 'dev-user-123',
                            email: email || 'test@example.com'
                          }))
                          router.push('/dashboard')
                        }}
                        className="w-full bg-amber-600 text-white py-2 px-4 rounded-lg hover:bg-amber-700 transition"
                      >
                        Continue as Test User
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Background Decoration */}
          <div className="absolute top-0 right-0 -z-10 transform translate-x-1/3 -translate-y-1/4">
            <div className="w-[600px] h-[600px] bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100 rounded-full blur-3xl opacity-50"></div>
          </div>
        </section>

        {/* Visual Demo Section */}
        <section className="py-16 lg:py-24 bg-gradient-to-b from-amber-50 to-white">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                See Tosslee in Action
              </h2>
              <p className="text-lg text-gray-600">
                It's like Tinder, but for your stuff
              </p>
            </div>

            {/* Demo Cards */}
            <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Swipe Demo */}
              <div className="bg-white rounded-3xl shadow-xl p-8 relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                  SWIPE MODE
                </div>
                <div className="mb-6">
                  <div className="bg-gray-100 rounded-2xl h-48 flex items-center justify-center mb-4">
                    <Camera className="w-16 h-16 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Old Winter Jacket</h3>
                  <p className="text-sm text-gray-600 mb-4">Haven't worn in 2 years</p>
                  <div className="flex gap-4">
                    <button className="flex-1 bg-red-100 text-red-700 py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                      <Trash2 className="w-5 h-5" />
                      Toss
                    </button>
                    <button className="flex-1 bg-green-100 text-green-700 py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
                      <Heart className="w-5 h-5" />
                      Keep
                    </button>
                  </div>
                </div>
                <div className="text-center text-sm text-gray-500">
                  ← Swipe left to toss • Swipe right to keep →
                </div>
              </div>

              {/* Momentum Demo */}
              <div className="bg-white rounded-3xl shadow-xl p-8 relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-orange-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                  MOMENTUM
                </div>
                <div className="mb-6">
                  <div className="text-center mb-6">
                    <div className="text-5xl font-bold text-amber-600 mb-2">12x</div>
                    <p className="text-sm text-gray-600">Decision Streak!</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-amber-50 p-3 rounded-lg">
                      <span className="text-sm font-medium">Speed Bonus</span>
                      <span className="text-amber-600 font-bold">+50 XP</span>
                    </div>
                    <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                      <span className="text-sm font-medium">Items Decided</span>
                      <span className="text-green-600 font-bold">23</span>
                    </div>
                    <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                      <span className="text-sm font-medium">Time Saved</span>
                      <span className="text-blue-600 font-bold">45 min</span>
                    </div>
                  </div>
                </div>
                <div className="text-center text-sm text-gray-500">
                  Make quick decisions to build combos
                </div>
              </div>

              {/* Tracking Demo */}
              <div className="bg-white rounded-3xl shadow-xl p-8 relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-green-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                  TRACKING
                </div>
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-4">Where Everything Lives</h3>
                  <div className="space-y-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">Winter Clothes</span>
                        <span className="text-xs text-gray-500">12 items</span>
                      </div>
                      <p className="text-xs text-gray-600">Bedroom Closet, Top Shelf</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">Camping Gear</span>
                        <span className="text-xs text-gray-500">8 items</span>
                      </div>
                      <p className="text-xs text-gray-600">Garage, Blue Bin</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">Electronics</span>
                        <span className="text-xs text-gray-500">5 items</span>
                      </div>
                      <p className="text-xs text-gray-600">Office Drawer 2</p>
                    </div>
                  </div>
                </div>
                <div className="text-center text-sm text-gray-500">
                  Never lose track of your stuff again
                </div>
              </div>
            </div>

            {/* Session Modes */}
            <div className="mt-16 bg-white rounded-3xl shadow-lg p-8 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-center mb-8">Choose Your Decluttering Style</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-amber-600" />
                  </div>
                  <h4 className="font-bold mb-2">Quick Sort</h4>
                  <p className="text-sm text-gray-600">5-minute daily sessions to stay on top of clutter</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-orange-600" />
                  </div>
                  <h4 className="font-bold mb-2">Speed Toss</h4>
                  <p className="text-sm text-gray-600">Race against the clock for maximum momentum</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="font-bold mb-2">Deep Sort</h4>
                  <p className="text-sm text-gray-600">Thoughtful decisions for sentimental items</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 lg:py-32 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
                The Gamified Features That Make Decluttering 
                <span className="bg-gradient-to-r from-amber-500 to-yellow-600 bg-clip-text text-transparent"> Actually Fun</span>
              </h2>
              <p className="text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto">
                Turn your decluttering into an addictive game with rewards, streaks, and progress tracking
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl flex items-center justify-center mb-6">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Swipe & Score</h3>
                <p className="text-gray-600"><strong>+10 XP per decision</strong>. Swipe right to keep, left to toss. Quick decisions = bonus points!</p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center mb-6">
                  <Package2 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Inventory System</h3>
                <p className="text-gray-600"><strong>Never lose anything again</strong>. Tag locations, create custom containers, search instantly.</p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mb-6">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Level Up</h3>
                <p className="text-gray-600"><strong>Unlock achievements</strong>. Track streaks, earn badges, compete with friends on leaderboards.</p>
              </div>

              <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl flex items-center justify-center mb-6">
                  <Clock className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Game Modes</h3>
                <p className="text-gray-600"><strong>3 ways to play</strong>. Daily challenges, speed rounds, or zen mode for tough decisions.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 lg:py-24 bg-gradient-to-r from-amber-500 to-yellow-600">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
              Ready to transform your space?
            </h2>
            <p className="text-xl text-indigo-100 mb-8">
              Join thousands of families making better decisions together
            </p>
            <Link 
              href="/landing"
              className="inline-flex items-center bg-white text-amber-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-200"
            >
              See How It Works
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}