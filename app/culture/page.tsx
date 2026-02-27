import Link from "next/link";

export default function CulturePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">AI</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Meta Factory
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/builder" className="text-gray-600 hover:text-blue-600 font-medium text-sm md:text-base whitespace-nowrap">
                Builder
              </Link>
              <Link href="/marketplace" className="text-gray-600 hover:text-blue-600 font-medium text-sm md:text-base whitespace-nowrap">
                Marketplace
              </Link>
              <Link href="/admin" className="text-gray-600 hover:text-blue-600 font-medium text-sm md:text-base whitespace-nowrap">
                Admin
              </Link>
              <Link href="/docs" className="text-gray-600 hover:text-blue-600 font-medium text-sm md:text-base whitespace-nowrap">
                Docs
              </Link>
              <Link href="/culture" className="text-gray-600 hover:text-blue-600 font-medium text-sm md:text-base whitespace-nowrap">
                Culture
              </Link>
              <Link href="/sufism" className="text-gray-600 hover:text-blue-600 font-medium text-sm md:text-base whitespace-nowrap">
                Sufism
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-32 px-6 max-w-7xl mx-auto space-y-12">
        {/* History Section */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Our History <br />
            <span className="text-gray-600 text-base">ታሪካችን</span>
          </h2>
          <p className="text-gray-700 mb-4">
            Ethiopia boasts a rich history dating back over 3,000 years. From the ancient Kingdom of Dʿmt to the mighty Aksumite Empire, Ethiopia has been a beacon of culture, innovation, and resilience. The rock-hewn churches of Lalibela, the obelisks of Axum, and ancient manuscripts in monasteries stand as living testaments to generations of wisdom.
          </p>
          <p className="text-gray-700 mb-4">
            Remarkably, Ethiopia is recognized as independent as worldwide, never colonized, preserving its sovereignty and unique identity through centuries of foreign pressures.
          </p>
          <p className="text-gray-700">
            Ethiopia is also a shining example of religious harmony. Christianity and Islam have coexisted peacefully for centuries. Early followers of Islam found refuge in the Ethiopian kingdom, and today, Ethiopian culture celebrates both faiths as part of its national identity. This unity of religions reflects a deep respect for diversity and has strengthened the country’s social fabric across generations.
          </p>
        </section>

        {/* National Achievements */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            National Achievements <br />
            <span className="text-gray-600 text-base">የብሔራዊ ስኬቶቻችን</span>
          </h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Preserving independence and sovereignty throughout centuries, recognized globally as a symbol of resilience.</li>
            <li>Rich contributions to art, literature, and architecture, including UNESCO World Heritage sites.</li>
            <li>Exceptional achievements in athletics, producing world-class long-distance runners.</li>
            <li>Progress in science, technology, and education, establishing universities and research institutions.</li>
            <li>Active role in African diplomacy and peacekeeping, hosting international organizations and serving as the <strong>head office of Africa</strong> for several continental initiatives.</li>
            <li>Construction of the <strong>Grand Ethiopian Renaissance Dam (GERD)</strong> entirely by Ethiopian engineers and workforce, showcasing national innovation and self-reliance without foreign aid.</li>
            <li>Promotion of cultural unity, celebrating the harmony between Christian and Muslim communities.</li>
          </ul>
        </section>

        {/* Traditions Section */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Traditions & Customs <br />
            <span className="text-gray-600 text-base">ባህላችን</span>
          </h2>
          <p className="text-gray-700 mb-4">
            Ethiopia’s traditions are woven into everyday life. From coffee ceremonies to traditional weddings, every ritual carries meaning and community spirit. Folk tales, oral poetry, and indigenous knowledge are preserved across generations.
          </p>
          <p className="text-gray-700">
            እንኳን ደህና መጡ! Ethiopian culture treasures both individual and collective celebrations, passing values, ethics, and history through stories, dance, and music.
          </p>
        </section>

        {/* Festivals Section */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Festivals & Celebrations <br />
            <span className="text-gray-600 text-base">በዓላትና በዓላት በኢትዮጵያ</span>
          </h2>
          <p className="text-gray-700 mb-4">
            Ethiopia celebrates a rich tapestry of festivals such as Timkat (Epiphany), Meskel (Finding of the True Cross), Eid al-Fitr, and Ramadan. These occasions reflect Ethiopia’s unity and the blending of Islamic and Christian traditions.
          </p>
        </section>

        {/* Music & Cuisine Section */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Music & Cuisine <br />
            <span className="text-gray-600 text-base">ሙዚቃ እና ምግብ</span>
          </h2>
          <p className="text-gray-700 mb-4">
            Ethiopian music features traditional instruments like the krar and masenqo, with unique vocal styles across regions. Cuisine includes injera, doro wat, kitfo, and rich coffee traditions celebrated worldwide.
          </p>
          <p className="text-gray-700">
            Arabic touch in culture: <span className="text-gray-800 italic">الحب والتسامح جزء من روح إثيوبيا</span> (Love and tolerance are part of Ethiopia’s spirit)
          </p>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <span className="font-bold">AI</span>
                </div>
                <span className="text-xl font-bold">AI Meta Factory</span>
              </div>
              <p className="text-gray-400">Full-Stack AI Development Platform</p>
              <p className="text-gray-500 text-sm mt-2 text-center">
                O Prophet ﷺ, mercy to the worlds so bright, <br />
                Your light guides hearts through darkest night. <br />
                Wisdom, love, and peace you bring, <br />
                In every soul, Your praises sing. <br />
                <span className="block mt-1">
                  Powered by Sufi's World ❤ | Created & Developed by: Usman Ashebir & Umer Ashebir
                </span>
              </p>
            </div>
            <div className="flex gap-8">
              <div>
                <h4 className="font-bold mb-4">Product</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/builder" className="hover:text-white">Builder</Link></li>
                  <li><Link href="/marketplace" className="hover:text-white">Marketplace</Link></li>
                  <li><Link href="/docs" className="hover:text-white">Documentation</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Culture</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><Link href="/culture" className="hover:text-white">Culture of Ethiopia</Link></li>
                  <li><Link href="/sufism" className="hover:text-white">Sufism</Link></li>
                  <li><Link href="/admin" className="hover:text-white">Admin</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500">
            <p>© 2024 AI Meta Factory. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
