import { Coffee } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Coffee className="w-12 h-12 text-white" />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl font-bold text-gray-900">
              Welcome to Your App
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A clean, modern React + TypeScript + Tailwind CSS starter template.
              Ready for your next great idea.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              What's Included
            </h2>
            <ul className="text-left space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-orange-600 font-bold">✓</span>
                <span><strong>React 18</strong> with hooks and modern features</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-600 font-bold">✓</span>
                <span><strong>TypeScript</strong> for type-safe development</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-600 font-bold">✓</span>
                <span><strong>Tailwind CSS</strong> for beautiful, utility-first styling</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-600 font-bold">✓</span>
                <span><strong>Vite</strong> for lightning-fast development</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-orange-600 font-bold">✓</span>
                <span><strong>Lucide React</strong> for beautiful icons</span>
              </li>
            </ul>
          </div>

          <div className="pt-4">
            <p className="text-gray-500">
              Edit <code className="bg-gray-100 px-2 py-1 rounded text-sm">src/App.tsx</code> to get started
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
