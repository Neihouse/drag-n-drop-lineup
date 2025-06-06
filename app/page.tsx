import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center p-6">
      <h1 className="text-4xl font-bold mb-6">Lineup Planner POC</h1>
      <p className="text-xl mb-8 max-w-2xl">
        A simple drag-and-drop interface for planning your event lineup.
        Arrange artists on the timeline and save your progress automatically.
      </p>
      <Link 
        href="/lineup" 
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
      >
        Go to Lineup Planner
      </Link>
      
      <div className="mt-16 p-6 bg-gray-50 rounded-lg max-w-2xl">
        <h2 className="text-xl font-bold mb-4">About this POC</h2>
        <ul className="text-left list-disc list-inside space-y-2">
          <li>Drag artists from the sidebar onto the timeline</li>
          <li>Changes are saved to localStorage automatically</li>
          <li>Refresh the page and your lineup will still be there</li>
          <li>Simple client-side implementation with Next.js and @dnd-kit</li>
        </ul>
      </div>
    </div>
  );
}
