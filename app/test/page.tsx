export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Tailwind CSS Test</h1>
        <p className="text-lg text-gray-600 mb-8">If you can see this styled text, Tailwind is working!</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-indigo-600 mb-2">Card 1</h2>
            <p className="text-gray-700">This is a test card with Tailwind styling.</p>
          </div>
          
          <div className="bg-indigo-600 text-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Card 2</h2>
            <p>This card has a colored background.</p>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">Card 3</h2>
            <p>This card has a gradient background.</p>
          </div>
        </div>
        
        <div className="mt-8 flex gap-4">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Button 1
          </button>
          <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded">
            Button 2
          </button>
        </div>
      </div>
    </div>
  );
}