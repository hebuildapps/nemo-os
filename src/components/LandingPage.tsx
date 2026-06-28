import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle2, ChevronDown, CircleX, Menu, X, Quote } from 'lucide-react';
import { useScroll } from 'framer-motion';
import { NemoMascot } from '@/components/NemoMascot';

interface LandingPageProps {
  onTryNemo: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onTryNemo }) => {
  const smartPrepFeatures = [
    {
      title: 'Follow a dynamic plan',
      outcome: 'Never wonder what to study next.',
      description:
        'Get a day-by-day plan tuned to your goal, available time, and current momentum.',
      video: '/plan.mp4',
    },
    {
      title: 'Learn by proving',
      outcome: 'Know what actually sticks, every day.',
      description:
        'Each task ends with AI MCQs so completion means retained learning, not checkbox activity.',
      video: '/ai-mcq.mp4',
    },
    {
      title: 'Visualize your growth',
      outcome: 'See consistency compound into momentum.',
      description:
        'Your pixel companion evolves with streaks, focus, and execution quality, so progress feels real.',
      video: '/happystate.mp4',
    },
    {
      title: 'Unlock your journey',
      outcome: 'Stay engaged through meaningful rewards.',
      description:
        'Earn gems, unlock companions, and equip items that reflect your daily discipline.',
      video: '/shop.mp4',
    },
  ];

  const testimonials = [
    {
      name: 'Mansi R.',
      exam: 'CAT EXAM',
      result: 'Mock percentile 71 \u2192 88 in 6 weeks',
      lead: 'I stopped restarting prep every Monday.',
      highlight: 'Now I just execute daily.',
      tail: '',
    },
    {
      name: 'Savio V.',
      exam: 'GATE Exam',
      result: '4.5 hrs/week &#8594; 5.2 hrs of deep work consistency',
      lead: 'The reward system felt simple at first, but ',
      highlight: 'it removed my procrastination spiral',
      tail: ' and made me show up even on low-energy days.',
    },
    {
      name: 'Rehan K.',
      exam: 'UPSC Prelims',
      result: 'Accuracy up 19% in revision tests',
      lead: 'Nemo gave me one clear next action.',
      highlight: 'That cut decision fatigue to near zero.',
      tail: '',
    },
  ];

  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);
  const [openFeatureIndex, setOpenFeatureIndex] = useState<number | null>(0);
  const [heroModalOpen, setHeroModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [testimonialActiveIndex, setTestimonialActiveIndex] = useState(0);
  const [pricingActiveIndex, setPricingActiveIndex] = useState(0);
  const [comparisonActiveIndex, setComparisonActiveIndex] = useState(0);
  const [accordionProgress, setAccordionProgress] = useState(0);
  const accordionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const accordionPausedRef = useRef(false);
  const ACCORDION_INTERVAL = 4000;

  const [navigatorLabel, setNavigatorLabel] = useState('NOW READING: HERO');
  const [navigatorMerged, setNavigatorMerged] = useState(false);
  const [navigatorVisible, setNavigatorVisible] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ container: scrollContainerRef });

  const sectionConfig = [
    { id: 'hero', label: 'NOW READING: HERO' },
    { id: 'features', label: 'NOW READING: EXAM PREP' },
    { id: 'testimonials', label: 'NOW READING: TESTIMONIALS' },
    { id: 'work-smarter', label: 'NOW READING: FEATURES' },
    { id: 'comparison', label: 'NOW READING: WHY NEMO' },
    { id: 'results', label: 'NOW READING: RESULTS' },
    { id: 'pricing', label: 'NOW READING: PRICING' },
    { id: 'cta', label: 'FINAL SECTION' },
  ];

  useEffect(() => {
    let raf: number;
    const containerEl = scrollContainerRef.current;
    if (!containerEl) return;

    const updateNavigator = () => {
      const viewportBottom = containerEl.getBoundingClientRect().bottom;

      let foundLabel: string | null = null;
      let foundMerged = false;

      const reversed = [...sectionConfig].reverse();
      for (const sec of reversed) {
        const el = document.getElementById(sec.id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= viewportBottom * 0.55) {
          foundLabel = sec.label;
          break;
        }
      }

      const ctaEl = document.getElementById('cta');
      if (ctaEl) {
        const ctaRect = ctaEl.getBoundingClientRect();
        if (ctaRect.top < viewportBottom - 100 && ctaRect.top > -ctaRect.height * 0.5) {
          foundMerged = true;
          foundLabel = 'FINAL SECTION';
        }
      }

      const footerEl = document.querySelector('footer');
      if (footerEl) {
        const footerRect = footerEl.getBoundingClientRect();
        if (footerRect.top < viewportBottom * 0.5) {
          setNavigatorVisible(false);
          return;
        }
      }

      setNavigatorVisible(true);
      setNavigatorLabel(foundLabel ?? sectionConfig[0].label);
      setNavigatorMerged(foundMerged);
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateNavigator);
    };

    updateNavigator();
    containerEl.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      containerEl.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const clearAccordionTimer = useCallback(() => {
    if (accordionTimerRef.current) {
      clearInterval(accordionTimerRef.current);
      accordionTimerRef.current = null;
    }
  }, []);

  const startAccordionTimer = useCallback(() => {
    clearAccordionTimer();
    setAccordionProgress(0);
    const startTime = Date.now();
    accordionTimerRef.current = setInterval(() => {
      if (accordionPausedRef.current) return;
      const elapsed = Date.now() - startTime;
      const fraction = Math.min(elapsed / ACCORDION_INTERVAL, 1);
      setAccordionProgress(fraction);
      if (fraction >= 1) {
        clearAccordionTimer();
        setActiveFeatureIndex((prev) => (prev + 1) % smartPrepFeatures.length);
        setOpenFeatureIndex((prev) => {
          const next = ((prev ?? 0) + 1) % smartPrepFeatures.length;
          return next;
        });
      }
    }, 50);
  }, [clearAccordionTimer]);

  useEffect(() => {
    startAccordionTimer();
    return () => clearAccordionTimer();
  }, [activeFeatureIndex, startAccordionTimer, clearAccordionTimer]);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div ref={scrollContainerRef} className="font-rubik h-dvh w-full px-4 sm:px-8 overflow-y-auto bg-[#fff8f4] dark:bg-[#120d08] text-[#291800] dark:text-[#dcb174] relative">
      <style>{`
        @keyframes heroPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 rgba(70, 48, 13, 0.14); }
          50% { transform: scale(1.01); box-shadow: 0 0 28px rgba(70, 48, 13, 0.2); }
        }
        @keyframes heroZoomIn {
          0% { transform: scale(1); opacity: 0.92; }
          100% { transform: scale(1.03); opacity: 1; }
        }
        @keyframes floatLabel {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes iconShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-1.5px) rotate(-2deg); }
          40% { transform: translateX(1.5px) rotate(2deg); }
          60% { transform: translateX(-1px) rotate(-1deg); }
          80% { transform: translateX(1px) rotate(1deg); }
        }
        @keyframes iconPop {
          0% { transform: scale(0.7); opacity: 0.3; }
          60% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes videoSwapIn {
          0% { opacity: 0.65; transform: scale(0.985); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes ctaShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes mascotBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes fadeSlide {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .hero-idle { animation: heroPulse 7.8s ease-in-out infinite; }
        .hero-video-load { animation: heroZoomIn 1.1s ease-out forwards; }
        .hero-float-label { animation: floatLabel 4.2s ease-in-out infinite; }
        .icon-shake { animation: iconShake 4s ease-in-out infinite; }
        .icon-pop { animation: iconPop 0.5s ease-out both; }
        .feature-video-reveal { animation: videoSwapIn 0.35s ease-out both; }
        .cta-bg-motion {
          background-size: 200% 200%;
          animation: ctaShift 10s ease-in-out infinite;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .mascot-bob {
          animation: mascotBob 2.8s ease-in-out infinite;
        }
        .navigator-tooltip {
          position: relative;
          background: #fff;
          border: 2px solid #291800;
          font-size: 9px;
          letter-spacing: 0.1em;
          padding: 3px 8px;
          white-space: nowrap;
          background-image: radial-gradient(circle, rgba(41, 24, 0, 0.5) 0.5px, transparent 0.5px);
          background-size: 4px 4px;
        }
        .navigator-tooltip::after {
          content: "";
          position: absolute;
          bottom: -6px;
          right: 12px;
          border-width: 6px 5px 0;
          border-style: solid;
          border-color: #291800 transparent transparent transparent;
          display: block;
          width: 0;
        }
        .navigator-tooltip::before {
          content: "";
          position: absolute;
          bottom: -3px;
          right: 13px;
          border-width: 5px 4px 0;
          border-style: solid;
          border-color: #fff transparent transparent transparent;
          display: block;
          width: 0;
          z-index: 1;
        }
        @media (prefers-color-scheme: dark) {
          .navigator-tooltip {
              background: #FFF8F4;
              border-color: #f3e0bc;
              background-image: radial-gradient(circle, rgba(243, 224, 188, 0.5) 0.5px, transparent 0.5px);
          }
          .navigator-tooltip::after {
            border-color: #f3e0bc transparent transparent transparent;
          }
          .navigator-tooltip::before {
            border-color: #FFF8F4 transparent transparent transparent;
          }
        }
      `}</style>
      <nav className="sticky top-0 z-50 border-b border-[#291800]/10 dark:border-[#f3e0bc]/10 bg-[#fff8f4]/85 dark:bg-[#120d08]/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 lg:px-8 lg:py-4">
          <div className="text-[18px] lg:text-[18px] font-extrabold font-pixel leading-none">NEMO OS</div>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#work-smarter" onClick={(e) => scrollToSection(e, 'work-smarter')} className="text-[14px] text-[#291800]/70 dark:text-[#f3e0bc]/70 transition-colors hover:text-[#5c601d] dark:text-[#d3d977]">Features</a>
            <a href="#comparison" onClick={(e) => scrollToSection(e, 'comparison')} className="text-[14px] text-[#291800]/70 dark:text-[#f3e0bc]/70 transition-colors hover:text-[#5c601d] dark:text-[#d3d977]">Why Nemo</a>
            <a href="#pricing" onClick={(e) => scrollToSection(e, 'pricing')} className="text-[14px] text-[#291800]/70 dark:text-[#f3e0bc]/70 transition-colors hover:text-[#5c601d] dark:text-[#d3d977]">Pricing</a>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button onClick={onTryNemo} className="px-4 text-sm py-1 bg-[#dac8a5] dark:bg-[#4a3f2d] border-2 border-[#a1875e] dark:border-[#c5ab82] text-[#46300d] dark:text-[#e0c8a3] font-semibold rounded-lg active:border-b-2 transition">Login</button>
            <button
              onClick={onTryNemo}
              className="bg-[#5c601d] dark:bg-[#d3d977] px-4 text-sm py-1.5 font-semibold text-white dark:text-[#120d08] rounded-lg active:border-b-2 transition hover:bg-[#757934]"
            >
              Try Nemo
            </button>
          </div>
          <button
            className="md:hidden p-2 text-[#291800] dark:text-[#dcb174]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#291800]/10 dark:border-[#f3e0bc]/10 bg-[#fff8f4] dark:bg-[#120d08] px-4 py-4 flex flex-col gap-4">
            <a href="#work-smarter" onClick={(e) => { scrollToSection(e, 'work-smarter'); setMobileMenuOpen(false); }} className="text-[15px] font-semibold text-[#291800]/70 dark:text-[#f3e0bc]/70 hover:text-[#5c601d] dark:text-[#d3d977]">Features</a>
            <a href="#comparison" onClick={(e) => { scrollToSection(e, 'comparison'); setMobileMenuOpen(false); }} className="text-[15px] font-semibold text-[#291800]/70 dark:text-[#f3e0bc]/70 hover:text-[#5c601d] dark:text-[#d3d977]">Why Nemo</a>
            <a href="#pricing" onClick={(e) => { scrollToSection(e, 'pricing'); setMobileMenuOpen(false); }} className="text-[15px] font-semibold text-[#291800]/70 dark:text-[#f3e0bc]/70 hover:text-[#5c601d] dark:text-[#d3d977]">Pricing</a>
            <div className="flex gap-3 pt-2 border-t border-[#291800]/10 dark:border-[#f3e0bc]/10">
              <button onClick={() => { onTryNemo(); setMobileMenuOpen(false); }} className="flex-1 px-4 py-2 bg-[#dac8a5] dark:bg-[#4a3f2d] border-2 border-[#a1875e] dark:border-[#c5ab82] text-[#46300d] dark:text-[#e0c8a3] font-semibold rounded-lg text-sm">Login</button>
              <button onClick={() => { onTryNemo(); setMobileMenuOpen(false); }} className="flex-1 bg-[#5c601d] dark:bg-[#d3d977] px-4 py-2 font-semibold text-white dark:text-[#120d08] rounded-lg text-sm hover:bg-[#757934]">Try Nemo</button>
            </div>
          </div>
        )}
      </nav>

      <main className="lg:mt-[50px]">
        <section id="hero" className="mx-auto grid w-full max-w-7xl gap-16 px-6 py-16 lg:grid-cols-2 lg:py-30 lg:px-8">
          <div className="gap-8 flex flex-col justify-center">
            <h1 className="text-[28px] sm:text-[34px] font-extrabold font-cooper leading-[1.08] tracking-tight lg:text-[40px]">
              From scattered prep to
              <mark><span className="px-2 text-[#535447] dark:text-[#d8d9cc]">consistent rank-winning execution</span></mark>
            </h1>
            <div>
              <p className="mt-6 max-w-xl text-[16px] lg:text-[20px] leading-relaxed text-[#47483a] dark:text-[#b4b5a3]">
                Stop confusion, procrastination, and random effort. Nemo converts your exam target into daily execution you can trust.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  'Get a personalized roadmap in minutes',
                  'Validate daily learning with MCQ checks',
                  'Build consistency with streak and reward loops',
                  'Study with calm structure, not decision fatigue',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-[13px]">
                    <CheckCircle2 className="h-4 w-4 text-[#5c601d] dark:text-[#d3d977]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <button
                onClick={onTryNemo}
                className="rounded-[16px] uppercase bg-[#5c601d] dark:bg-[#d3d977] px-8 lg:px-8 py-3 text-[16px] lg:text-[18px] font-bold text-white dark:text-[#120d08] shadow-xl shadow-[#5c601d]/25 dark:shadow-[#d3d977]/25 transition-transform hover:scale-[1.02]"
              >
                Try Nemo
              </button>
              <p className="text-[14px] text-[#47483a] dark:text-[#b4b5a3]">No setup friction. Sign up and start right away.</p>
            </div>
          </div>

          {/* <div className="relative">
            <div className="absolute -inset-4 rounded-[28px] bg-[#f3e0bc]/60 blur-3xl" />
            <div className="relative hero-idle rounded-[20px] border-4 border-[#ffe4c3] bg-gradient-to-br from-[#fff1e4] via-[#ffebd4] to-[#ffddb2] p-6 shadow-2xl transition-transform duration-300 lg:scale-[1.08]">
              <div className="hero-float-label absolute left-10 top-4 z-10 rounded-full border border-[#cab796] bg-[#fff8f4]/85 dark:bg-[#120d08]/85 px-4 py-1 text-[11px] font-bold tracking-[0.08em] text-[#46300d] dark:text-[#e0c8a3]">
                Watch how your prep becomes structured
              </div>
              <button
                type="button"
                onClick={() => setHeroModalOpen(true)}
                className="group relative mt-7 w-full cursor-zoom-in overflow-hidden rounded-xl border border-[#c9c7b6] dark:border-[#525148] bg-white/70 dark:bg-[#1c1a17]/70 outline-none"
                aria-label="Open quick Nemo demo"
              >
                <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_38%,rgba(0,0,0,0.36)_100%)]" />
                <video
                  className="hero-video-load aspect-video w-full object-cover transition-all duration-500 group-hover:scale-[1.02] group-hover:brightness-110"
                  src="/quick-nemo.mp4"
                  poster="/quick-nemo-poster.svg"
                  preload="metadata"
                  autoPlay
                  muted
                  loop
                  playsInline
                  onLoadedData={(event) => {
                    const video = event.currentTarget;
                    if (video.currentTime < 0.1) {
                      try {
                        video.currentTime = 0.12;
                      } catch {
                        // Ignore seek restrictions and continue playback from the default frame.
                      }
                    }
                  }}
                />
              </button>
              <p className="mt-3 text-center text-[13px] text-[#5a4527]">See how Nemo turns chaos into daily execution in 10 seconds.</p>
            </div>
          </div> */}
        </section>

        <section id="features" className="border-y border-[#291800]/10 dark:border-[#f3e0bc]/10 bg-[#fff1e4]/50 dark:bg-[#20150b]/50 py-10">
          <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-4 justify-center px-6 lg:px-8">
            <div className="flex flex-wrap justify-center items-center gap-8">
              <span className="lg:text-[14px] text-[12px] font-bold uppercase tracking-[0.1em] text-[#47483a] dark:text-[#b4b5a3]">Used by focused learners preparing for</span>
              {['UPSC', 'CAT', 'GATE', 'GMAT', 'JEE'].map((item) => (
                <span key={item} className="lg:text-[28px] text-[14px] font-bold text-[#725731] dark:text-[#dcb174]">{item}</span>
              ))}
            </div>
            <span className="text-[14px] font-newsreader italic text-[#393938] dark:text-[#cfcfcf]">& MANY MORE.</span>
          </div>
        </section>

        <section id="testimonials" className="mx-auto w-full max-w-7xl mt-16 lg:mt-26 px-6 py-12 lg:px-8">
          <h3 className="text-center text-[28px] lg:text-[40px] italic font-cooper text-[#46300D] dark:text-[#e0c8a3] pb-4">hear the word from our testers</h3>
          <div className="hidden md:grid gap-5 md:grid-cols-3">
            {testimonials.map((item, index) => {
              const starRatings = [5, 4, 4.5];
              const rating = starRatings[index % 3];
              const fullStars = Math.floor(rating);
              const hasHalf = rating % 1 !== 0;
              return (
              <article key={item.name} className="rounded-2xl border border-[#c9c7b6] dark:border-[#525148] bg-white dark:bg-[#1c1a17] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#46300d]/10 dark:shadow-[#e0c8a3]/10">
                <div className="mb-3 flex gap-1 text-[#c1cf01ef]">
                  {[...Array(fullStars)].map((_, i) => (
                    <svg key={i} fill="currentColor" viewBox="0 0 576 512" height="14" width="14">
                      <path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"></path>
                    </svg>
                  ))}
                  {hasHalf && (
                    <svg fill="currentColor" viewBox="0 0 576 512" height="14" width="14">
                      <path d="M288 0c-11.4 0-22.8 5.9-28.7 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6V0z"></path>
                    </svg>
                  )}
                </div>
                <p className="text-[15px] leading-relaxed text-[#393938] dark:text-[#cfcfcf]">
                  "{item.lead}<strong>{item.highlight}</strong>{item.tail}"
                </p>
                <p className="mt-4 text-[13px] font-bold text-[#46300D] dark:text-[#e0c8a3]">{item.name}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.15em] text-[#47483a]/80 dark:text-[#b4b5a3]/80">{item.exam}</p>
                <p className="mt-1 text-[12px] font-semibold text-[#5c601d] dark:text-[#d3d977]">{item.result}</p>
              </article>
              );
            })}
          </div>
          <div id="testimonial-scroll" className="md:hidden flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 pb-2">
            {testimonials.map((item, index) => {
              const starRatings = [5, 4, 4.5];
              const rating = starRatings[index % 3];
              const fullStars = Math.floor(rating);
              const hasHalf = rating % 1 !== 0;
              return (
              <article key={item.name} className="snap-center shrink-0 w-[72vw] max-w-[300px] rounded-xl border border-[#c9c7b6] dark:border-[#525148] bg-white dark:bg-[#1c1a17] p-4">
                <div className="mb-2 flex gap-0.5 text-[#c1cf01ef]">
                  {[...Array(fullStars)].map((_, i) => (
                    <svg key={i} fill="currentColor" viewBox="0 0 576 512" height="12" width="12">
                      <path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"></path>
                    </svg>
                  ))}
                  {hasHalf && (
                    <svg fill="currentColor" viewBox="0 0 576 512" height="12" width="12">
                      <path d="M288 0c-11.4 0-22.8 5.9-28.7 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6V0z"></path>
                    </svg>
                  )}
                </div>
                <p className="text-[13px] leading-relaxed text-[#393938] dark:text-[#cfcfcf]">
                  "{item.lead}<strong>{item.highlight}</strong>{item.tail}"
                </p>
                <p className="mt-3 text-[12px] font-bold text-[#46300D] dark:text-[#e0c8a3]">{item.name}</p>
                <p className="mt-0.5 text-[10px] uppercase tracking-[0.15em] text-[#47483a]/80 dark:text-[#b4b5a3]/80">{item.exam}</p>
                <p className="mt-0.5 text-[11px] font-semibold text-[#5c601d] dark:text-[#d3d977]">{item.result}</p>
              </article>
              );
            })}
          </div>
          <div className="md:hidden flex justify-center gap-2 mt-3">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setTestimonialActiveIndex(i);
                  const container = document.querySelector('#testimonial-scroll') as HTMLElement;
                  if (container) {
                    const cards = container.children;
                    if (cards[i]) cards[i].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                  }
                }}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${i === testimonialActiveIndex ? 'bg-[#5c601d] dark:bg-[#d3d977] w-5' : 'bg-[#c9c7b6]'}`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </section>

        <section id="work-smarter" className="mx-auto w-full max-w-7xl px-6 pb-8 lg:px-8">
          <div className="rounded-3xl border border-[#c9c7b6] dark:border-[#525148] bg-[#f8f5f1] dark:bg-[#1a1713] m-4 lg:m-10 p-6 md:p-10">
            <h2 className="text-center text-[30px] lg:text-[36px] font-extrabold leading-tight text-[#46300D] dark:text-[#e0c8a3] md:text-[46px]">Work smarter not harder</h2>
            <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:items-center">
              <div>
                {smartPrepFeatures.map((feature, index) => {
                  const isOpen = openFeatureIndex === index;
                  const isActive = activeFeatureIndex === index;

                  return (
                    <div key={feature.title} className={`border-b text-[14px] border-[#6f5a34]/45 py-4 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-60'}`}>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-4 text-left"
                        onClick={() => {
                          setActiveFeatureIndex(index);
                          setOpenFeatureIndex((prev) => (prev === index ? null : index));
                          accordionPausedRef.current = true;
                          setTimeout(() => {
                            accordionPausedRef.current = false;
                            clearAccordionTimer();
                            startAccordionTimer();
                          }, 5000);
                        }}
                      >
                        <span className="text-[20px] lg:text-[24px] md:text-[28px] font-semibold leading-tight text-[#46300D] dark:text-[#e0c8a3]">{index + 1}. {feature.title}</span>
                        <ChevronDown className={`h-6 w-6 shrink-0 text-[#46300D] dark:text-[#e0c8a3] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>

                      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-40 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
                        <p className="text-[15px] font-bold leading-relaxed text-[#46300D] dark:text-[#e0c8a3]">{feature.outcome}</p>
                        <p className="mt-1 max-w-2xl text-[14px] leading-relaxed text-[#4b3a20] dark:text-[#c4b399]">{feature.description}</p>
                      </div>

                      {isActive && (
                        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[#e1d3bd]">
                          <div
                            className="h-full rounded-full bg-[#5c601d] dark:bg-[#d3d977] transition-[width] duration-75 ease-linear"
                            style={{ width: `${accordionProgress * 100}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            <div className="lg:sticky lg:top-28 flex items-center justify-center">
              <div className="overflow-hidden rounded-2xl lg:rounded-3xl border-2 border-[#d4b896]/30">
                <video
                  key={smartPrepFeatures[activeFeatureIndex].video}
                  src={smartPrepFeatures[activeFeatureIndex].video}
                  preload="metadata"
                  className="feature-video-reveal aspect-[4/3] lg:aspect-video w-full max-w-[320px] lg:max-w-none object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              </div>
            </div>
            </div>
          </div>
        </section>

        <section id="comparison" className="mx-auto w-full max-w-6xl px-6 py-16 lg:py-20 lg:px-8">
          <div className="mb-10 lg:mb-14 text-center">
            <h2 className="text-[32px] md:text-[42px] font-bold leading-tight lg:text-[50px]">It is time to study with a system</h2>
            <p className="mx-auto mt-3 max-w-2xl text-[15px] lg:text-[16px] text-[#47483a] dark:text-[#b4b5a3]">Replace random effort with structured momentum built for long exam journeys.</p>
          </div>
          <div className="hidden md:grid gap-8 md:grid-cols-2">
            <article className="rounded-2xl border-2 border-[#ffdad6] dark:border-[#690005] bg-white dark:bg-[#1c1a17] p-8 opacity-80 saturate-50">
              <h3 className="text-[30px] font-bold text-[#ba1a1a] dark:text-[#ff8a8a]">Without Nemo</h3>
              <ul className="mt-6 space-y-5">
                {[
                  'Plans scattered across tabs',
                  'No daily accountability loop',
                  'Progress stays unclear',
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-[14px] text-[#47483a] dark:text-[#b4b5a3]">
                    <CircleX className="icon-shake mt-0.5 h-5 w-5 text-[#ba1a1a] dark:text-[#ff8a8a]" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
            <article className="rounded-2xl border-2 bg-[#DAC8A5] p-8 shadow-xl border-[#46300D] dark:border-[#e0c8a3] shadow-[#5c601d]/25 dark:shadow-[#d3d977]/25 ring-2 ring-[#5c601d]/20 dark:ring-[#d3d977]/20">
              <h3 className="text-[30px] font-bold text-[#46300D] dark:text-[#e0c8a3]">With Nemo OS</h3>
              <ul className="mt-6 space-y-5">
                {[
                  'Daily roadmap from your exam target',
                  'Task completion with MCQ proof',
                  'Rewards that reinforce consistency',
                ].map((item, index) => (
                  <li key={item} className="flex gap-3 text-[14px] text-[#291800] dark:text-[#dcb174]">
                    <CheckCircle2 className="icon-pop mt-0.5 h-5 w-5 text-[#5c601d] dark:text-[#d3d977]" style={{ animationDelay: `${index * 110}ms` }} />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </div>
          <div id="comparison-scroll" className="md:hidden flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 pb-2">
            <article className="snap-center shrink-0 w-[72vw] max-w-[300px] rounded-xl border-2 border-[#ffdad6] dark:border-[#690005] bg-white dark:bg-[#1c1a17] p-5 opacity-80 saturate-50">
              <h3 className="text-[22px] font-bold text-[#ba1a1a] dark:text-[#ff8a8a]">Without Nemo</h3>
              <ul className="mt-4 space-y-4">
                {[
                  'Plans scattered across tabs',
                  'No daily accountability loop',
                  'Progress stays unclear',
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-[13px] text-[#47483a] dark:text-[#b4b5a3]">
                    <CircleX className="icon-shake mt-0.5 h-4 w-4 text-[#ba1a1a] dark:text-[#ff8a8a]" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
            <article className="snap-center shrink-0 w-[72vw] max-w-[300px] rounded-xl border-2 bg-[#DAC8A5] p-5 shadow-lg border-[#46300D] dark:border-[#e0c8a3] shadow-[#5c601d]/25 dark:shadow-[#d3d977]/25 ring-2 ring-[#5c601d]/20 dark:ring-[#d3d977]/20">
              <h3 className="text-[22px] font-bold text-[#46300D] dark:text-[#e0c8a3]">With Nemo OS</h3>
              <ul className="mt-4 space-y-4">
                {[
                  'Daily roadmap from your exam target',
                  'Task completion with MCQ proof',
                  'Rewards that reinforce consistency',
                ].map((item, index) => (
                  <li key={item} className="flex gap-3 text-[13px] text-[#291800] dark:text-[#dcb174]">
                    <CheckCircle2 className="icon-pop mt-0.5 h-4 w-4 text-[#5c601d] dark:text-[#d3d977]" style={{ animationDelay: `${index * 110}ms` }} />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          </div>
          <div className="md:hidden flex justify-center gap-2 mt-3">
            {[0, 1].map((i) => (
              <button
                key={i}
                onClick={() => {
                  setComparisonActiveIndex(i);
                  const container = document.querySelector('#comparison-scroll') as HTMLElement;
                  if (container) {
                    const cards = container.children;
                    if (cards[i]) cards[i].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                  }
                }}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${i === comparisonActiveIndex ? 'bg-[#5c601d] dark:bg-[#d3d977] w-5' : 'bg-[#c9c7b6]'}`}
                aria-label={`Go to comparison ${i + 1}`}
              />
            ))}
          </div>
          <p className="mt-7 text-center text-[16px] lg:text-[18px] font-semibold text-[#46300D] dark:text-[#e0c8a3]">The difference between trying hard vs progressing daily.</p>
        </section>

        <section id="results" className="bg-[#fff1e4] dark:bg-[#20150b] py-20">
          <div className="relative mx-auto w-full max-w-4xl px-6 text-center lg:px-8">
            <Quote className="absolute left-1/2 top-0 h-20 w-20 -translate-x-1/2 -translate-y-8 opacity-10 text-[#725731] dark:text-[#dcb174]" />
            
            <div className="relative flex flex-col items-center gap-6">
              <div className="flex gap-1 text-[#b9c60b]">
                {[...Array(4)].map((_, i) => (
                  <svg key={i} fill="currentColor" viewBox="0 0 576 512" height="12" width="12">
                    <path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z"></path>
                  </svg>
                ))}
              </div>

              <blockquote className="text-[18px] lg:text-[28px] font-medium leading-tight text-[#291800] dark:text-[#dcb174]">
                I used to get lost in the notes. Nemo forces me to focus on what actually moves the needle. It’s the Pareto principle, 
                <span className="italic decoration-[#f3e0bc] underline decoration-4 underline-offset-4"> automated but it just works magically improving my grades.</span></blockquote>
              <div className="flex flex-col items-center gap-1">
                <p className="text-[12px] font-bold text-[#725731] dark:text-[#dcb174]">Aditya S.</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#47483a]/70 dark:text-[#b4b5a3]/70">High schooler</p>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto w-full max-w-7xl px-6 py-16 lg:py-20 lg:px-8">
          <div className="mb-10 lg:mb-12 text-center">
            <h2 className="text-[32px] md:text-[42px] font-bold lg:text-[54px] font-cooper">Start free, upgrade when ready</h2>
            <p className="mx-auto mt-3 max-w-2xl text-[15px] lg:text-[16px] text-[#47483a] dark:text-[#b4b5a3]">Two clear tiers: Monthly for flexibility, and an olive-highlighted Lifetime plan for strongest long-term value.</p>
            <p className="mx-auto mt-2 max-w-xl text-[13px] font-semibold text-[#5c601d] dark:text-[#d3d977]">Most serious learners choose lifetime within 7 days.</p>
          </div>
          <div className="hidden md:grid mx-auto max-w-4xl gap-8 md:grid-cols-2">
            <article className="rounded-2xl border border-[#c9c7b6] dark:border-[#525148] bg-[#fff1e4] dark:bg-[#20150b] p-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#47483a] dark:text-[#b4b5a3]">Monthly</p>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-[56px] font-derif">$4</span>
                <span className="mb-2 text-[#47483a] dark:text-[#b4b5a3]">/ month</span>
              </div>
              <p className="mt-2 text-[14px] text-[#47483a] dark:text-[#b4b5a3]">Best for trying Nemo with low commitment.</p>
              <p className="mt-1 text-[12px] font-semibold text-[#6f5a34] dark:text-[#dcb174]">No lock-in. Upgrade anytime.</p>
              <ul className="mt-5 space-y-3 text-[14px] text-[#393938] dark:text-[#cfcfcf]">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#5c601d] dark:text-[#d3d977]" /> Full task + streak system</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#5c601d] dark:text-[#d3d977]" /> Progress and badge tracking</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#5c601d] dark:text-[#d3d977]" /> Cancel anytime</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#5c601d] dark:text-[#d3d977]" /> Choose your starter pokemon companion</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#5c601d] dark:text-[#d3d977]" /> Rare early user badge</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#5c601d] dark:text-[#d3d977]" /> 20 gems as signup gift</li>
              </ul>
              <button
                onClick={onTryNemo}
                className="mt-7 w-full rounded-xl border-2 border-[#5c601d] dark:border-[#d3d977] py-3 font-bold text-[#5c601d] dark:text-[#d3d977] transition-colors hover:bg-[#5c601d] dark:hover:bg-[#d3d977] hover:text-white dark:hover:text-[#120d08]"
              >
                Choose Monthly
              </button>
            </article>
            <article className="relative scale-[1.05] overflow-hidden rounded-2xl border-2 border-[#5c601d] dark:border-[#d3d977] bg-[#5c601d] dark:bg-[#d3d977] p-8 text-white dark:text-[#120d08] shadow-2xl shadow-[#5c601d]/30">
              <div className="absolute right-4 top-2.5 rounded-md bg-[#beab03] px-3 py-1 text-[10px] font-bold tracking-[0.12em] text-[#ffffff]">MOST POPULAR</div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/70 dark:text-white/70">One-time</p>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-[56px] font-derif">$9</span>
              </div>
              <p className="mt-2 text-[14px] text-white/85 dark:text-white/85">One payment. Keep your prep system for every future goal.</p>
              <ul className="mt-5 space-y-3 text-[14px] text-white/95 dark:text-white/95">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#f3e0bc] dark:text-[#dcb174]" /> Everything in Monthly</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#f3e0bc] dark:text-[#dcb174]" /> Lifetime updates</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#f3e0bc] dark:text-[#dcb174]" /> Best value for long exam cycles</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#f3e0bc] dark:text-[#dcb174]" /> Unlimited revisions on plan</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#f3e0bc] dark:text-[#dcb174]" /> Rare early user badge + lifetime support benefits</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#f3e0bc] dark:text-[#dcb174]" /> 50 gems</li>
              </ul>
              <button
                onClick={onTryNemo}
                className="mt-7 w-full rounded-xl bg-[#fff8f4] dark:bg-[#120d08] py-3 font-bold text-[#5c601d] dark:text-[#d3d977] transition-colors hover:bg-[#f3e0bc] dark:hover:bg-[#4a3a1f]"
              >
                Get Lifetime Access
              </button>
              <p className="mt-3 text-center text-[11px] text-white/75 dark:text-white/75">Most students choose this after trying monthly.</p>
            </article>
          </div>
          <div id="pricing-scroll" className="md:hidden flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 pb-2">
            <article className="snap-center shrink-0 w-[72vw] max-w-[300px] rounded-xl border border-[#c9c7b6] dark:border-[#525148] bg-[#fff1e4] dark:bg-[#20150b] p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#47483a] dark:text-[#b4b5a3]">Monthly</p>
              <div className="mt-3 flex items-end gap-1">
                <span className="text-[40px] font-derif">$4</span>
                <span className="mb-2 text-[#47483a] dark:text-[#b4b5a3] text-[12px]">/ month</span>
              </div>
              <p className="mt-2 text-[12px] text-[#47483a] dark:text-[#b4b5a3]">Best for trying Nemo with low commitment.</p>
              <p className="mt-1 text-[11px] font-semibold text-[#6f5a34] dark:text-[#dcb174]">No lock-in. Upgrade anytime.</p>
              <ul className="mt-4 space-y-2 text-[12px] text-[#393938] dark:text-[#cfcfcf]">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-[#5c601d] dark:text-[#d3d977]" /> Full task + streak system</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-[#5c601d] dark:text-[#d3d977]" /> Progress and badge tracking</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-[#5c601d] dark:text-[#d3d977]" /> Cancel anytime</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-[#5c601d] dark:text-[#d3d977]" /> Choose your starter pokemon companion</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-[#5c601d] dark:text-[#d3d977]" /> Rare early user badge</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-[#5c601d] dark:text-[#d3d977]" /> 20 gems as signup gift</li>
              </ul>
              <button
                onClick={onTryNemo}
                className="mt-5 w-full rounded-xl border-2 border-[#5c601d] dark:border-[#d3d977] py-2.5 text-[13px] font-bold text-[#5c601d] dark:text-[#d3d977] transition-colors hover:bg-[#5c601d] dark:hover:bg-[#d3d977] hover:text-white dark:hover:text-[#120d08]"
              >
                Choose Monthly
              </button>
            </article>
            <article className="snap-center shrink-0 w-[72vw] max-w-[300px] relative overflow-hidden rounded-xl border-2 border-[#5c601d] dark:border-[#d3d977] bg-[#5c601d] dark:bg-[#d3d977] p-5 text-white dark:text-[#120d08] shadow-lg shadow-[#5c601d]/30">
              <div className="absolute right-3 top-2 rounded-md bg-[#beab03] px-2 py-0.5 text-[9px] font-bold tracking-[0.12em] text-[#ffffff]">MOST POPULAR</div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/70 dark:text-white/70">One-time</p>
              <div className="mt-3 flex items-end gap-1">
                <span className="text-[40px] font-derif">$9</span>
              </div>
              <p className="mt-2 text-[12px] text-white/85 dark:text-white/85">One payment. Keep your prep system for every future goal.</p>
              <ul className="mt-4 space-y-2 text-[12px] text-white/95 dark:text-white/95">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-[#f3e0bc] dark:text-[#dcb174]" /> Everything in Monthly</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-[#f3e0bc] dark:text-[#dcb174]" /> Lifetime updates</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-[#f3e0bc] dark:text-[#dcb174]" /> Best value for long exam cycles</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-[#f3e0bc] dark:text-[#dcb174]" /> Unlimited revisions on plan</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-[#f3e0bc] dark:text-[#dcb174]" /> Rare early user badge + lifetime support benefits</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-[#f3e0bc] dark:text-[#dcb174]" /> 50 gems</li>
              </ul>
              <button
                onClick={onTryNemo}
                className="mt-5 w-full rounded-xl bg-[#fff8f4] dark:bg-[#120d08] py-2.5 text-[13px] font-bold text-[#5c601d] dark:text-[#d3d977] transition-colors hover:bg-[#f3e0bc] dark:hover:bg-[#4a3a1f]"
              >
                Get Lifetime Access
              </button>
              <p className="mt-2 text-center text-[10px] text-white/75 dark:text-white/75">Most students choose this after trying monthly.</p>
            </article>
          </div>
          <div className="md:hidden flex justify-center gap-2 mt-3">
            {[0, 1].map((i) => (
              <button
                key={i}
                onClick={() => {
                  setPricingActiveIndex(i);
                  const container = document.querySelector('#pricing-scroll') as HTMLElement;
                  if (container) {
                    const cards = container.children;
                    if (cards[i]) cards[i].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                  }
                }}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${i === pricingActiveIndex ? 'bg-[#5c601d] dark:bg-[#d3d977] w-5' : 'bg-[#c9c7b6]'}`}
                aria-label={`Go to pricing tier ${i + 1}`}
              />
            ))}
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-6 pb-10 lg:px-8">
          <div className="rounded-2xl border border-[#c9c7b6] dark:border-[#525148] bg-[#fff1e4] dark:bg-[#20150b] p-6">
            <p className="text-center text-[15px] text-[#47483a] dark:text-[#b4b5a3]">"I started with monthly, then upgraded to lifetime in week two because I knew I was sticking with this."</p>
            <p className="mt-3 text-center text-[13px] font-bold text-[#46300D] dark:text-[#e0c8a3]">Priya M · JEE Repeat Aspirant</p>
          </div>
        </section>

      <section id="cta" className="mx-auto w-full max-w-5xl px-6 lg:px-8">
          <div className="w-full h-px relative flex justify-center items-center">
            {navigatorMerged && (
              <div className="absolute w-full flex items-center -mt-px">
                <div className="flex-1 border-t border-[#291800] dark:border-[#f3e0bc]" />
                <span className="mx-2 text-[#291800] dark:text-[#f3e0bc] text-[10px]">✦</span>
                <div className="flex-1 border-t border-[#291800] dark:border-[#f3e0bc]" />
                
                {/* Static mascot + tooltip anchored to the right when merged */}
                <div className="absolute right-0 bottom-0.5 z-[105] flex justify-center">
                  <div className="relative flex flex-col items-center justify-end">
                    <div className="absolute bottom-full mb-0 right-1/2 translate-x-[17px] flex justify-center">
                      <div key={navigatorLabel} className="navigator-tooltip animate-[fadeSlide_300ms_ease-out] transition-all duration-300 text-rose-500 dark:text-rose-400 font-mono uppercase">
                        {navigatorLabel}
                      </div>
                    </div>
                    <NemoMascot scrollYProgress={scrollYProgress} className="w-8 sm:w-10 h-auto relative z-10" />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className={`grid grid-cols-1 md:grid-cols-2 border-x border-b border-[#291800] dark:border-[#f3e0bc]`}>
            <div className="flex flex-col justify-center p-6 mt-2 md:p-10 border-b md:border-b-0 md:border-r border-[#291800] dark:border-[#f3e0bc]">
              <h2 className="text-[28px] md:text-[36px] font-extrabold leading-tight lg:text-[48px] text-[#291800] dark:text-[#dcb174]">
                Start your system today.
              </h2>
              <p className="mt-2 text-[18px] font-semibold text-[#5c601d] dark:text-[#d3d977]">
                Not next Monday.
              </p>
              <p className="mt-3 text-[15px] text-[#47483a] dark:text-[#b4b5a3] max-w-sm">
                Join students who study consistently without burnout. Build control over your prep and watch weekly progress become predictable.
              </p>
            </div>
            <div className="grid grid-cols-2 grid-rows-[1fr_1fr_auto]">
              <button
                onClick={onTryNemo}
                className="flex items-center justify-center p-6 md:p-8 border-b border-r border-[#291800] dark:border-[#f3e0bc] text-[14px] font-semibold text-[#291800] dark:text-[#dcb174] hover:bg-[#f3e0bc] dark:hover:bg-[#4a3a1f] transition-colors"
              >
                Try Nemo Free
              </button>
              <a
                href="#pricing"
                onClick={(e) => scrollToSection(e, 'pricing')}
                className="flex items-center justify-center p-6 md:p-8 border-b border-[#291800] dark:border-[#f3e0bc] text-[14px] font-semibold text-[#291800] dark:text-[#dcb174] hover:bg-[#f3e0bc] dark:hover:bg-[#4a3a1f] transition-colors"
              >
                View Pricing
              </a>
              <a
                href="#features"
                onClick={(e) => scrollToSection(e, 'features')}
                className="flex items-center justify-center p-6 md:p-8 border-b border-r border-[#291800] dark:border-[#f3e0bc] text-[14px] font-semibold text-[#291800] dark:text-[#dcb174] hover:bg-[#f3e0bc] dark:hover:bg-[#4a3a1f] transition-colors"
              >
                Features
              </a>
              <a
                href="#work-smarter"
                onClick={(e) => scrollToSection(e, 'work-smarter')}
                className="flex items-center justify-center p-6 md:p-8 border-b border-[#291800] dark:border-[#f3e0bc] text-[14px] font-semibold text-[#291800] dark:text-[#dcb174] hover:bg-[#f3e0bc] dark:hover:bg-[#4a3a1f] transition-colors"
              >
                How It Works
              </a>
              <button className="col-span-2 flex items-center justify-center p-4 text-[14px] font-semibold text-[#291800] dark:text-[#dcb174] hover:bg-[#f3e0bc] dark:hover:bg-[#4a3a1f] transition-colors">
                Talk to a Human
              </button>
            </div>
          </div>
        </section>
      </main>

      {navigatorVisible && !navigatorMerged && (
        <div className="pointer-events-none fixed bottom-6 sm:bottom-8 z-[100] w-full">
          <div className="mx-auto w-full max-w-5xl px-6 lg:px-8">
            <div className="relative">
              {/* Tooltip + mascot on the right */}
              <div className="absolute right-0 bottom-0.5 flex justify-center">
                <div className="relative flex flex-col items-center justify-end">
                  <div className="absolute bottom-full mb-0 right-1/2 translate-x-[17px] flex justify-center">
                    <div
                      key={navigatorLabel}
                      className="navigator-tooltip animate-[fadeSlide_300ms_ease-out] transition-all duration-300 text-rose-500 dark:text-rose-400 font-mono uppercase"
                    >
                      {navigatorLabel}
                    </div>
                  </div>
                  <NemoMascot scrollYProgress={scrollYProgress} className="w-8 sm:w-10 h-auto relative z-10" />
                </div>
              </div>
              <div className="flex items-center w-full">
                <div className="flex-1 border-t border-[#291800] dark:border-[#f3e0bc]" />
                <span className="mx-2 text-[#291800] dark:text-[#f3e0bc] text-[10px]">✦</span>
                <div className="flex-1 border-t border-[#291800] dark:border-[#f3e0bc]" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Merged state: invisible floating element replaces itself via CTA border-t */}
      {navigatorMerged && navigatorVisible && (
        <div className="pointer-events-none w-full opacity-0 h-0" />
      )}

      <footer className="mx-auto w-full max-w-5xl px-6 lg:px-8 pb-8 lg:pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 border-x border-b border-[#291800] dark:border-[#f3e0bc]">
          <div className="p-5 border-b md:border-b-0 md:border-r border-[#291800] dark:border-[#f3e0bc]">
            <h4 className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#291800] dark:text-[#dcb174] mb-3">Product</h4>
            <ul className="space-y-1.5">
              <li><a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="text-[13px] text-[#47483a] dark:text-[#b4b5a3] hover:text-[#291800] dark:hover:text-[#dcb174] transition-colors">Features</a></li>
              <li><a href="#pricing" onClick={(e) => scrollToSection(e, 'pricing')} className="text-[13px] text-[#47483a] dark:text-[#b4b5a3] hover:text-[#291800] dark:hover:text-[#dcb174] transition-colors">Pricing</a></li>
              <li><a href="#comparison" onClick={(e) => scrollToSection(e, 'comparison')} className="text-[13px] text-[#47483a] dark:text-[#b4b5a3] hover:text-[#291800] dark:hover:text-[#dcb174] transition-colors">Why Nemo</a></li>
            </ul>
          </div>
          <div className="p-5">
            <h4 className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#291800] dark:text-[#dcb174] mb-3">Connect</h4>
            <ul className="space-y-1.5">
              <li><a href="#" className="text-[13px] text-[#47483a] dark:text-[#b4b5a3] hover:text-[#291800] dark:hover:text-[#dcb174] transition-colors">Twitter</a></li>
              <li><a href="#" className="text-[13px] text-[#47483a] dark:text-[#b4b5a3] hover:text-[#291800] dark:hover:text-[#dcb174] transition-colors">GitHub</a></li>
              <li><a href="#" className="text-[13px] text-[#47483a] dark:text-[#b4b5a3] hover:text-[#291800] dark:hover:text-[#dcb174] transition-colors">Discord</a></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-x border-b border-[#291800] dark:border-[#f3e0bc] p-5">
          <div>
            <div className="text-[18px] font-bold font-pixel text-[#291800] dark:text-[#dcb174]">NEMO OS</div>
            <p className="text-[11px] text-[#47483a] dark:text-[#b4b5a3] mt-0.5">© 2026 Nemo OS. All rights reserved.</p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#47483a] dark:text-[#b4b5a3]">
            <span className="relative flex items-center justify-center w-3.5 h-3.5">
              <span className="absolute h-2.5 w-2.5 rounded-full bg-[#27822a]"></span>
              <span className="absolute h-3.5 w-3.5 rounded-full bg-[#1d601f]/25 animate-ping"></span>
            </span>
            <span>System operational</span>
          </div>
        </div>
      </footer>

      {/* Bottom Blur */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[15] h-[60px] select-none bg-gradient-to-t from-background to-transparent opacity-100 backdrop-blur-[5px] [mask-image:linear-gradient(to_top,black_50%,transparent)] [-webkit-mask-image:linear-gradient(to_top,black_50%,transparent)]" />


      {heroModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4" onClick={() => setHeroModalOpen(false)}>
          <div className="w-full max-w-5xl overflow-hidden rounded-2xl border border-[#f3e0bc]/40 dark:border-[#dcb174]/40 bg-black" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/15 px-4 py-3">
              <p className="text-sm font-semibold text-white dark:text-[#120d08]">Nemo Quick Demo</p>
              <button
                type="button"
                onClick={() => setHeroModalOpen(false)}
                className="rounded-full border border-white/30 px-3 py-1 text-xs font-semibold text-white dark:text-[#120d08] transition-colors hover:bg-white/10"
              >
                Close
              </button>
            </div>
            <video
              src="/quick-nemo.mp4"
              poster="/quick-nemo-poster.svg"
              className="aspect-video w-full object-cover"
              preload="metadata"
              autoPlay
              muted
              loop
              controls
              playsInline
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
