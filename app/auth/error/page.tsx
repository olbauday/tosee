'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AlertCircle, Home, RefreshCw } from 'lucide-react'
import { Suspense } from 'react'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const description = searchParams.get('description')

  const getErrorMessage = () => {
    if (description) return decodeURIComponent(description)
    
    switch (error) {
      case 'access_denied':
        return 'Access was denied. Please try signing in again.'
      case 'otp_expired':
        return 'The magic link has expired. Please request a new one.'
      case 'magic_link_failed':
        return 'Failed to verify the magic link. Please try again.'
      case 'code_exchange_failed':
        return 'Failed to complete authentication. Please try again.'
      case 'invalid_request':
        return 'Invalid authentication request. Please start over.'
      default:
        return 'An authentication error occurred. Please try again.'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h1>
          
          <p className="text-gray-600 mb-8">
            {getErrorMessage()}
          </p>

          {error === 'otp_expired' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-amber-800">
                <strong>Tip:</strong> Magic links expire quickly. Make sure to click the link in your email right away.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Try Again
            </Link>
            
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Having trouble? Make sure you're using the latest link from your email and that you're signed out of any other accounts.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthError() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  )
}