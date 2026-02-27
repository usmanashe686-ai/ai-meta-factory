import Link from 'next/link';

export default function Sufism() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Meta Factory
          </span>
          <div className="flex gap-4">
            <Link href="/" className="text-gray-600 hover:text-blue-600 font-medium">Home</Link>
            <Link href="/builder" className="text-gray-600 hover:text-blue-600 font-medium">Builder</Link>
            <Link href="/marketplace" className="text-gray-600 hover:text-blue-600 font-medium">Marketplace</Link>
            <Link href="/docs" className="text-gray-600 hover:text-blue-600 font-medium">Docs</Link>
            <Link href="/culture" className="text-gray-600 hover:text-blue-600 font-medium">Culture</Link>
            <Link href="/sufism" className="text-gray-600 hover:text-blue-600 font-medium">Sufism</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 px-6 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
          Sufism: The Path of Divine Love <br/>
          <span className="text-blue-600">الصوفية: طريق الحب الإلهي</span>
        </h1>
        <p className="text-lg text-gray-600 mb-10">
          Sufism, the mystical dimension of Islam, emphasizes the inward journey towards God through love, devotion, and spiritual purification.
        </p>
      </div>

      {/* History Section */}
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          History of Sufism <br/>
          <span className="text-gray-600 text-base">تاريخ الصوفية</span>
        </h2>
        <p className="text-gray-700">
          Sufism emerged in the early centuries of Islam as a reaction to worldly distractions, focusing on the inner, spiritual life. Sufi saints and mystics dedicated their lives to achieving closeness to God, often forming orders (Tariqas) that guided followers on the spiritual path.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
          Core Philosophy <br/>
          <span className="text-gray-600 text-base">الفلسفة الأساسية</span>
        </h2>
        <p className="text-gray-700">
          At the heart of Sufism lies love for God and all creation. Sufis believe in purifying the soul, practicing humility, and seeking truth beyond appearances. Meditation, remembrance (dhikr - ذكر), and reflection are central practices for spiritual growth.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
          Practices <br/>
          <span className="text-gray-600 text-base">الممارسات</span>
        </h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Dhikr (ذكر): Repeating names and attributes of God to attain spiritual focus.</li>
          <li>Muraqaba (مراقبة): Meditation and contemplation to connect with the divine.</li>
          <li>Sama (سماع): Spiritual music and poetry, often performed in gatherings, to inspire love and devotion.</li>
          <li>Service and charity: Helping others as a path to purify the heart.</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
          Famous Sufi Poets <br/>
          <span className="text-gray-600 text-base">الشعراء الصوفيون</span>
        </h2>
        <p className="text-gray-700">
          Sufi poetry has inspired millions across the world. Renowned poets include:
        </p>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Jalaluddin Rumi (جلال الدين الرومي) – Mystic poet emphasizing divine love and unity.</li>
          <li>Hafiz (حافظ) – Persian poet celebrating love, spiritual joy, and divine intoxication.</li>
          <li>Ibn Arabi (ابن عربي) – Philosopher and poet focusing on unity of existence and divine presence.</li>
        </ul>

        <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-8">
          Sufi Wisdom <br/>
          <span className="text-gray-600 text-base">الحكمة الصوفية</span>
        </h2>
        <p className="text-gray-700">
          Sufi wisdom teaches that the heart is the seat of divine love, and that purification of the soul leads to eternal closeness with God. Sufism encourages tolerance, humility, and universal love.
        </p>
      </div>

      {/* Footer with Poem */}
      <footer className="bg-gray-900 text-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-300 text-sm mt-2 text-center leading-relaxed">
            🌙 O Prophet ﷺ, mercy to the worlds so bright,<br/>
            Your light guides hearts through darkest night.<br/>
            Wisdom, love, and peace you bring,<br/>
            In every soul, Your praises sing.<br/><br/>
            💫 نبي الرحمة ﷺ، نور العالمين، يضيء القلوب في أحلك الليالي.<br/>
            Let hearts be filled with love divine,<br/>
            In every breath, Your mercy shine.<br/><br/>
            <span className="block mt-2 font-semibold text-white">
              Powered by Sufi's World ❤ | Created & Developed by: Usman Ashebir & Umer Ashebir
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
}
