# Lineup POC

A simple drag-and-drop interface for planning event lineups. This is a proof of concept application that demonstrates how to implement a basic drag-and-drop interface for organizing artists on a timeline.

## Features

- Drag artists from the sidebar onto the timeline
- Changes are saved to localStorage automatically
- Refresh the page and your lineup will still be there
- Simple client-side implementation with Next.js and @dnd-kit

## Tech Stack

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [@dnd-kit](https://dndkit.com/) - Drag and drop functionality
- [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) - Client-side storage

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## How to Use

1. Navigate to the Lineup page
2. Drag artists from the sidebar onto the timeline slots
3. Artists will be assigned to the hour slots you drop them on
4. Your lineup is automatically saved to localStorage
5. Refresh the page to verify that your lineup persists

## Future Enhancements

- Backend integration with Supabase
- User authentication
- Multiple stages
- Conflict detection
- Set hours based on artist performance length
- Drag between time slots to reorder

## License

MIT
