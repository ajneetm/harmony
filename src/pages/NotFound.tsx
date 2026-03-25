import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center p-8">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-red-600 mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
          <p className="text-gray-400 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 font-medium"
        >
          <Home className="w-5 h-5" />
          Back to Home
        </Link>
      </div>
    </div>
  )
}

export default NotFound 