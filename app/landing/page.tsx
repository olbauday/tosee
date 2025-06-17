'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Package2, Trash2, Heart, ArrowRight, Sparkles, Users, MessageSquare,
  CheckCircle, Star, Zap, Shield, Clock, TrendingUp, ChevronRight,
  Menu, X, PlayCircle
} from 'lucide-react'

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  const features = [
    {
      icon: Zap,
      title: "Swipe-Style Decisions",
      description: "Keep or toss with simple swipes. Build momentum with satisfying combo streaks",
      color: "from-amber-500 to-yellow-500"
    },
    {
      icon: Package2,
      title: "Smart Location Tracking",
      description: "Tag items, create containers, and always know where everything lives",
      color: "from-orange-500 to-amber-500"
    },
    {
      icon: Clock,
      title: "Session Modes",
      description: "Quick Sort for 5-minute bursts, Speed Toss for rapid fire, Deep Sort for focus",
      color: "from-yellow-500 to-amber-500"
    },
    {
      icon: TrendingUp,
      title: "Progress Insights",
      description: "Track decision speed, keep rates, and celebrate your decluttering milestones",
      color: "from-emerald-500 to-green-500"
    },
    {
      icon: Users,
      title: "Social Sessions",
      description: "Declutter together with friends, share tough decisions, stay motivated",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Shield,
      title: "Simple & Private",
      description: "No AI, no complexity. Your data stays yours. Export anytime",
      color: "from-indigo-500 to-blue-500"
    }
  ]

  const testimonials = [
    {
      name: "Sarah M.",
      role: "Minimalist",
      content: "The momentum system is addictive! I cleared my closet in 20 minutes and knew exactly where everything went.",
      rating: 5
    },
    {
      name: "Emily Chen",
      role: "Professional Organizer",
      content: "Tosslee's session modes are genius. My clients love Quick Sort for daily maintenance.",
      rating: 5
    },
    {
      name: "Mike T.",
      role: "Recent Grad",
      content: "Speed Toss mode helped me pack for my move in record time. 10/10 would swipe again!",
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center">
              <Package2 className="w-8 h-8 text-amber-500 mr-3" />
              <span className="text-xl font-bold text-gray-900">Tosslee</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-gray-600 hover:text-gray-900 transition">Features</Link>
              <Link href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition">How it Works</Link>
              <Link href="#testimonials" className="text-gray-600 hover:text-gray-900 transition">Testimonials</Link>
              <Link 
                href="/"
                className="bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 px-6 py-2.5 rounded-full hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-4 py-4 space-y-3">
              <Link href="#features" className="block py-2 text-gray-600">Features</Link>
              <Link href="#how-it-works" className="block py-2 text-gray-600">How it Works</Link>
              <Link href="#testimonials" className="block py-2 text-gray-600">Testimonials</Link>
              <Link 
                href="/"
                className="block bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 px-6 py-3 rounded-full text-center"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 bg-amber-50 rounded-full text-amber-700 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4 mr-2" />
                Decide. Declutter. Done.
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight">
                Decide Fast.
                <span className="block bg-gradient-to-r from-amber-500 to-yellow-600 bg-clip-text text-transparent">
                  Live Light.
                </span>
              </h1>
              
              <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0">
                Your digital decision buddy. Swipe through your stuff, build momentum, 
                and track where everything lives—one confident decision at a time.
              </p>
              
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => router.push('/')}
                  className="group bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 px-8 py-4 rounded-full text-lg font-medium hover:shadow-xl transition-all duration-200 hover:-translate-y-1 flex items-center justify-center"
                >
                  Start Free Now
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="group px-8 py-4 rounded-full text-lg font-medium border-2 border-gray-200 hover:border-gray-300 transition-all flex items-center justify-center">
                  <PlayCircle className="w-5 h-5 mr-2" />
                  Watch Demo
                </button>
              </div>

              <div className="mt-8 flex items-center justify-center lg:justify-start gap-8 text-sm text-gray-600">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Free to start
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  No credit card
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  Instant setup
                </div>
              </div>
            </div>

            {/* Hero Image/Graphic */}
            <div className="relative">
              <div className="relative z-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl p-8 sm:p-12 shadow-2xl transform rotate-3 hover:rotate-2 transition-transform duration-300">
                <div className="bg-white rounded-xl p-6 transform -rotate-3 hover:-rotate-2 transition-transform duration-300">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Kitchen Items</h3>
                      <span className="text-sm text-gray-500">23 items</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="aspect-square bg-gray-100 rounded-lg animate-pulse"></div>
                      ))}
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 bg-amber-500 rounded-full border-2 border-white"></div>
                        <div className="w-8 h-8 bg-yellow-500 rounded-full border-2 border-white"></div>
                      </div>
                      <span className="text-sm text-gray-600">Quick decisions in progress...</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-yellow-400 rounded-full opacity-50 blur-xl"></div>
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-pink-400 rounded-full opacity-50 blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Everything you need to
              <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                declutter successfully
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed to make collaborative decluttering simple, fun, and effective
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              How it works
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">
              Get started in minutes, not hours
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Inventory</h3>
              <p className="text-gray-600">Sign up and create your first inventory. Invite your partner or family members.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Add Items</h3>
              <p className="text-gray-600">Take photos of items you're deciding on. Add names, locations, and tags.</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-600 to-rose-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Vote & Decide</h3>
              <p className="text-gray-600">Everyone votes: Keep, Toss, or Maybe. See instant results and make decisions together.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-amber-50 to-yellow-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Loved by thousands
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">
              See what people are saying about Keep or Toss
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Ready to declutter
            <span className="block bg-gradient-to-r from-amber-500 to-yellow-600 bg-clip-text text-transparent">
              with momentum?
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-8">
            Join thousands making fast, confident decisions about their stuff
          </p>
          <button
            onClick={() => router.push('/')}
            className="group bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 px-10 py-5 rounded-full text-lg font-medium hover:shadow-xl transition-all duration-200 hover:-translate-y-1 inline-flex items-center"
          >
            Start Free Now
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
          <p className="mt-4 text-sm text-gray-600">
            No credit card required • Free forever for basic use
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Package2 className="w-8 h-8 text-amber-400 mr-3" />
                <span className="text-xl font-bold">Tosslee</span>
              </div>
              <p className="text-gray-400">Decide Fast. Live Light. Done.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#features" className="hover:text-white transition">Features</Link></li>
                <li><Link href="#how-it-works" className="hover:text-white transition">How it Works</Link></li>
                <li><Link href="#" className="hover:text-white transition">Pricing</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition">About</Link></li>
                <li><Link href="#" className="hover:text-white transition">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#" className="hover:text-white transition">Privacy</Link></li>
                <li><Link href="#" className="hover:text-white transition">Terms</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© 2024 Keep or Toss. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}