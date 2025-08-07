/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom colors for kanban types
        'kanban-green': '#10B981', // End to TPA
        'kanban-blue-dark': '#1E40AF', // End to Pool
        'kanban-blue-light': '#60A5FA', // Pool to TPA
        'kanban-purple': '#8B5CF6', // Production
      },
    },
  },
  plugins: [],
}
