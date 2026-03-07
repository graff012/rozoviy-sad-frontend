import { FaArrowRightLong } from "react-icons/fa6";
import { useLocation, useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Navigate to the flowers section on HomePage (and handle repeat clicks)
  const goToFlowers = () => {
    const alreadyOnFlowers =
      location.pathname === "/" && location.hash === "#flowers-section";

    if (alreadyOnFlowers) {
      const el = document.getElementById("flowers-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }

    navigate({ pathname: "/", hash: "#flowers-section" });
  };

  return (
    <section className="bg-[#004F44] pt-8 pb-12 md:pt-15 md:pb-18 min-h-screen md:h-full">
      <div className="mycon">
        {/* Mobile Layout - Stack vertically */}
        <div className="md:hidden space-y-8">
          {/* Mobile Hero Text */}
          <div className="text-center px-4">
            <h1 className="text-3xl sm:text-4xl text-white font-semibold leading-tight mb-6">
              Vodiy Turfa Gullari MCHJ
            </h1>
            <p className="text-sm sm:text-base text-white leading-6 mb-8 max-w-md mx-auto">
              Biz yashaydigan va ishlaydigan olam — qalbimizdagi munosabat va
              umidlarning go'zal aksidir.
            </p>

            {/* Mobile Buttons - Stack vertically */}
            <div className="space-y-4">
              <button
                onClick={goToFlowers}
                className="w-full px-6 bg-white py-3 rounded-lg text-lg hover:-translate-y-0.5 hover:cursor-pointer transition-transform duration-200 font-medium"
              >
                Xarid qilish
              </button>

              <div
                onClick={goToFlowers}
                className="flex items-center justify-center gap-x-3 bg-white px-6 py-3 rounded-lg text-lg hover:cursor-pointer hover:-translate-y-0.5 transition-transform duration-200 font-medium"
              >
                <span>Gullarni ko'rish</span>
                <FaArrowRightLong />
              </div>
            </div>
          </div>

          {/* Mobile Images Grid */}
          <div className="px-4">
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Image One */}
              <div className="imgOne h-32 sm:h-40 rounded-lg relative overflow-hidden">
                <button
                  onClick={goToFlowers}
                  className="absolute top-2 left-2 px-3 py-1 text-xs sm:text-sm text-white hover:cursor-pointer hover:-translate-y-0.5 bg-blue-700 rounded transition-transform duration-200"
                >
                  Yangi
                </button>
              </div>

              {/* Image Two */}
              <div className="imgTwo h-32 sm:h-40 rounded-lg relative overflow-hidden">
                <button
                  onClick={goToFlowers}
                  className="absolute top-2 left-2 px-3 py-1 text-xs sm:text-sm text-white hover:cursor-pointer hover:-translate-y-0.5 bg-blue-700 rounded transition-transform duration-200"
                >
                  Mashhur
                </button>
              </div>
            </div>

            {/* Featured Image - Full width on mobile */}
            <div className="imgThree h-64 sm:h-80 rounded-lg relative overflow-hidden flex flex-col justify-between p-4">
              <button
                onClick={goToFlowers}
                className="px-3 py-1 text-xs sm:text-sm text-white hover:cursor-pointer hover:-translate-y-0.5 bg-blue-700 w-fit rounded transition-transform duration-200"
              >
                Xususiyatlari
              </button>

              <div className="text-center space-y-3">
                <h2 className="text-xl sm:text-2xl text-white font-semibold">
                  Mavsumiy gullar
                </h2>
                <p className="text-xs sm:text-sm text-white leading-5 max-w-xs mx-auto">
                  Biz yashaydigan va ishlaydigan olam — qalbimizdagi munosabat
                  va umidlarning go'zal aksidir.
                </p>
                <button
                  onClick={goToFlowers}
                  className="py-2 sm:py-3 bg-white text-black w-full hover:cursor-pointer hover:-translate-y-0.5 transition-transform duration-200 rounded font-medium"
                >
                  Ko'proq bilish
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout - Improved responsiveness */}
        <div className="hidden md:flex justify-between items-center gap-12">
          {/* Hero Text Section */}
          <div className="flex-1 max-w-[540px]">
            <h1 className="hero-title text-5xl lg:text-6xl xl:text-7xl text-white font-semibold leading-tight">
              Vodiy Turfa Gullari MCHJ
            </h1>
            <p className="hero-p text-lg text-white mt-8 leading-relaxed max-w-[420px]">
              Biz yashaydigan va ishlaydigan olam — qalbimizdagi munosabat va
              umidlarning go'zal aksidir.
            </p>
            <div className="flex items-center gap-6 mt-10">
              <button
                onClick={goToFlowers}
                className="px-8 bg-white py-3 rounded-lg text-lg hover:-translate-y-0.5 hover:cursor-pointer transition-transform duration-200 font-medium"
              >
                Xarid qilish
              </button>
              <div
                onClick={goToFlowers}
                className="flex items-center gap-x-3 bg-white px-8 py-3 rounded-lg text-lg hover:cursor-pointer hover:-translate-y-0.5 transition-transform duration-200 font-medium"
              >
                <span>Gullarni ko'rish</span>
                <FaArrowRightLong />
              </div>
            </div>
          </div>

          {/* Hero Images Section */}
          <div className="flex items-start gap-4 flex-shrink-0">
            {/* Small Images Column */}
            <div className="flex flex-col gap-4">
              <div className="imgOne w-[180px] lg:w-[220px] h-[240px] lg:h-[260px] relative overflow-hidden rounded-xl">
                <button
                  onClick={goToFlowers}
                  className="absolute top-3 left-3 px-4 py-1.5 text-sm text-white hover:cursor-pointer hover:-translate-y-0.5 bg-blue-700 rounded-lg transition-transform duration-200"
                >
                  Yangilar
                </button>
              </div>
              <div className="imgTwo w-[180px] lg:w-[220px] h-[250px] lg:h-[270px] relative overflow-hidden rounded-xl">
                <button
                  onClick={goToFlowers}
                  className="absolute top-3 left-3 px-4 py-1.5 text-sm text-white hover:cursor-pointer hover:-translate-y-0.5 bg-blue-700 rounded-lg transition-transform duration-200"
                >
                  Mashhurlar
                </button>
              </div>
            </div>

            {/* Featured Image - imgThree */}
            <div className="imgThree w-[300px] lg:w-[380px] h-[506px] lg:h-[546px] flex flex-col justify-between rounded-xl overflow-hidden p-6">
              <button
                onClick={goToFlowers}
                className="px-4 py-1.5 text-sm text-white hover:cursor-pointer hover:-translate-y-0.5 bg-blue-700 w-fit rounded-lg transition-transform duration-200"
              >
                Xususiyatlari
              </button>
              <div className="text-center space-y-4">
                <h2 className="text-2xl lg:text-3xl text-white font-semibold">
                  Mavsumiy gullar
                </h2>
                <p className="font-[Steppe] text-sm text-white leading-relaxed max-w-[280px] mx-auto">
                  Inson gullari — fasl va ob-havo qanday bo'lishidan qat'i
                  nazar, har doim yashnab o'sadigan o'simlik kabidir.
                </p>
                <button
                  onClick={goToFlowers}
                  className="py-3 bg-white text-black w-full hover:cursor-pointer hover:-translate-y-0.5 transition-transform duration-200 rounded-lg font-medium"
                >
                  Ko'proq bilish
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
