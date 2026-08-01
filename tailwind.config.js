export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        forest: { 50:'#f0f7ef',100:'#ddeeda',200:'#beddba',300:'#92c48f',400:'#63a660',500:'#3f8a3c',600:'#2d6e2b',700:'#255824',800:'#1f461f',900:'#1a3a1a', DEFAULT:'#2D5A27' },
        cream: { 50:'#fdfcf8',100:'#f9f5ec',200:'#f2ead6',300:'#e8dab8',400:'#dbc694', DEFAULT:'#F5F0E8' },
        wood: { 100:'#f5e6c8',200:'#e8c87a',300:'#c9a84c',400:'#a87d2a',500:'#8B6914',600:'#6b4f0e', DEFAULT:'#8B6914' },
        navy: { 50:'#edf0f8',100:'#d4daf0',200:'#a9b4e1',300:'#7a8ecc',400:'#4d69b8',500:'#2C3E6B',600:'#233256',700:'#1b2742',800:'#141d30', DEFAULT:'#2C3E6B' },
        stone: { DEFAULT:'#6B7280' }
      },
      fontFamily: { sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'] },
      borderRadius: { '2xl':'1rem', '3xl':'1.5rem' },
      boxShadow: { 'card':'0 2px 16px 0 rgba(44,62,107,0.08)', 'card-hover':'0 8px 32px 0 rgba(44,62,107,0.14)' }
    }
  },
  plugins: []
}
