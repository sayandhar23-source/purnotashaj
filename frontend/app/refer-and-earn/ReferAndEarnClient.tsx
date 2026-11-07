'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Link2, Share2, ShoppingBag, Wallet, ArrowRight, ArrowDown } from 'lucide-react';

type Lang = 'en' | 'hi' | 'bn';

const CONTENT: Record<
  Lang,
  {
    label: string;
    eyebrow: string;
    title: string;
    subtitle: string;
    steps: { title: string; desc: string }[];
    howItWorksHeading: string;
    howItWorks: string;
    cta: string;
  }
> = {
  en: {
    label: 'English',
    eyebrow: 'REFERRAL PROGRAM',
    title: 'Refer & Earn',
    subtitle: 'Share products you love. Earn real money when your friends buy.',
    steps: [
      { title: 'Get Your Link', desc: 'Copy any product link and generate your unique referral link from your dashboard.' },
      { title: 'Share It', desc: 'Send it to friends and family on WhatsApp, Instagram, or anywhere you like.' },
      { title: 'They Shop, You Earn', desc: 'When someone buys through your link, you automatically earn a commission.' },
      { title: 'Withdraw Anytime', desc: 'Request a payout to your UPI or bank account whenever you\'re ready.' },
    ],
    howItWorksHeading: 'How it works',
    howItWorks:
      "Every Purnota Shaj customer gets a unique referral code. Generate a referral link for any product from your dashboard and share it however you like. When someone visits through your link, we remember it for 30 days — so even if they don't buy right away, you still get credit if they come back and purchase later. Once your referral makes a purchase and we confirm the order, a commission is added to your balance automatically. You can then request a withdrawal to your UPI ID or bank account, and we'll process it directly.",
    cta: 'Go to My Referral Dashboard',
  },
  hi: {
    label: 'हिंदी',
    eyebrow: 'रेफरल प्रोग्राम',
    title: 'रेफर करें और कमाएं',
    subtitle: 'अपनी पसंदीदा चीज़ें शेयर करें। जब आपके दोस्त खरीदारी करें, तो असली पैसे कमाएं।',
    steps: [
      { title: 'अपना लिंक पाएं', desc: 'किसी भी प्रोडक्ट का लिंक कॉपी करें और अपने डैशबोर्ड से अपना यूनीक रेफरल लिंक जनरेट करें।' },
      { title: 'शेयर करें', desc: 'इसे व्हाट्सएप, इंस्टाग्राम या जहां चाहें, दोस्तों और परिवार को भेजें।' },
      { title: 'वे खरीदें, आप कमाएं', desc: 'जब कोई आपके लिंक से खरीदारी करता है, तो आपको अपने आप कमीशन मिलता है।' },
      { title: 'कभी भी निकालें', desc: 'जब चाहें अपने यूपीआई या बैंक अकाउंट में पैसे निकालने का अनुरोध करें।' },
    ],
    howItWorksHeading: 'यह कैसे काम करता है',
    howItWorks:
      'हर पूर्णता शाज ग्राहक को एक यूनीक रेफरल कोड मिलता है। अपने डैशबोर्ड से किसी भी प्रोडक्ट के लिए रेफरल लिंक बनाएं और इसे जहां चाहें शेयर करें। जब कोई आपके लिंक से साइट पर आता है, तो हम इसे 30 दिनों तक याद रखते हैं — इसलिए अगर वे तुरंत नहीं खरीदते, तब भी बाद में खरीदारी करने पर आपको क्रेडिट मिलेगा। जब आपका रेफर किया हुआ व्यक्ति खरीदारी करता है और हम ऑर्डर कन्फर्म करते हैं, तो कमीशन अपने आप आपके बैलेंस में जुड़ जाता है। इसके बाद आप अपने यूपीआई आईडी या बैंक अकाउंट में पैसे निकालने का अनुरोध कर सकते हैं, और हम इसे सीधे प्रोसेस करेंगे।',
    cta: 'मेरा रेफरल डैशबोर्ड देखें',
  },
  bn: {
    label: 'বাংলা',
    eyebrow: 'রেফারেল প্রোগ্রাম',
    title: 'রেফার করুন এবং আয় করুন',
    subtitle: 'আপনার পছন্দের জিনিস শেয়ার করুন। বন্ধুরা কিনলে, আসল টাকা আয় করুন।',
    steps: [
      { title: 'আপনার লিঙ্ক নিন', desc: 'যেকোনো প্রোডাক্টের লিঙ্ক কপি করুন এবং আপনার ড্যাশবোর্ড থেকে নিজের ইউনিক রেফারেল লিঙ্ক তৈরি করুন।' },
      { title: 'শেয়ার করুন', desc: 'হোয়াটসঅ্যাপ, ইনস্টাগ্রাম বা যেখানে ইচ্ছা বন্ধু ও পরিবারকে পাঠান।' },
      { title: 'তারা কেনেন, আপনি আয় করেন', desc: 'কেউ আপনার লিঙ্ক দিয়ে কিনলে, আপনি স্বয়ংক্রিয়ভাবে কমিশন পাবেন।' },
      { title: 'যেকোনো সময় তুলুন', desc: 'যখন ইচ্ছা আপনার ইউপিআই বা ব্যাংক অ্যাকাউন্টে টাকা তোলার অনুরোধ করুন।' },
    ],
    howItWorksHeading: 'এটি কীভাবে কাজ করে',
    howItWorks:
      'প্রতিটি পূর্ণতা শাজ গ্রাহক একটি ইউনিক রেফারেল কোড পান। আপনার ড্যাশবোর্ড থেকে যেকোনো প্রোডাক্টের জন্য একটি রেফারেল লিঙ্ক তৈরি করুন এবং যেভাবে ইচ্ছা শেয়ার করুন। কেউ আপনার লিঙ্ক দিয়ে সাইটে এলে, আমরা তা ৩০ দিন মনে রাখি — তাই তিনি সঙ্গে সঙ্গে না কিনলেও, পরে কিনলে আপনি ক্রেডিট পাবেন। আপনার রেফার করা ব্যক্তি কেনাকাটা করলে এবং আমরা অর্ডার কনফার্ম করলে, কমিশন স্বয়ংক্রিয়ভাবে আপনার ব্যালেন্সে যোগ হয়ে যায়। এরপর আপনি আপনার ইউপিআই আইডি বা ব্যাংক অ্যাকাউন্টে টাকা তোলার অনুরোধ করতে পারেন, আর আমরা তা সরাসরি প্রসেস করব।',
    cta: 'আমার রেফারেল ড্যাশবোর্ড দেখুন',
  },
};

const STEP_ICONS = [Link2, Share2, ShoppingBag, Wallet];

export default function ReferAndEarnClient() {
  const [lang, setLang] = useState<Lang>('en');
  const t = CONTENT[lang];
  const isEn = lang === 'en';

  return (
    <div className="bg-gradient-to-b from-brand-50/40 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Language switcher */}
        <div className="flex justify-center gap-2 mb-8">
          {(Object.keys(CONTENT) as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border ${
                lang === l ? 'bg-brand-500 border-brand-500 text-white' : 'border-gray-300 text-gray-600 hover:border-brand-400'
              }`}
            >
              {CONTENT[l].label}
            </button>
          ))}
        </div>

        {/* Hero */}
        <div className="text-center mb-14">
          <span className="text-xs font-semibold tracking-widest text-brand-500">{t.eyebrow}</span>
          <h1 className={`font-serif font-semibold text-3xl sm:text-4xl mt-2 mb-3 ${!isEn ? 'leading-relaxed' : ''}`}>
            {t.title}
          </h1>
          <p className={`text-gray-600 max-w-md mx-auto ${!isEn ? 'leading-relaxed' : ''}`}>{t.subtitle}</p>
        </div>

        {/* Step infographic */}
        <div className="flex flex-col lg:flex-row items-stretch gap-4 lg:gap-3 mb-16">
          {t.steps.map((step, i) => {
            const Icon = STEP_ICONS[i];
            const isLast = i === t.steps.length - 1;
            return (
              <div key={i} className="flex flex-col lg:flex-1 items-center">
                <div className="card p-5 w-full text-center flex-1 flex flex-col items-center">
                  <div className="relative mb-3">
                    <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center">
                      <Icon size={24} className="text-brand-500" />
                    </div>
                    <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-brand-500 text-white text-xs font-semibold flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm mb-1.5">{step.title}</h3>
                  <p className={`text-xs text-gray-500 ${!isEn ? 'leading-relaxed' : ''}`}>{step.desc}</p>
                </div>
                {!isLast && (
                  <div className="text-gray-300 my-1 lg:my-0 lg:self-center">
                    <ArrowDown size={18} className="lg:hidden" />
                    <ArrowRight size={18} className="hidden lg:block" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* How it works, in words */}
        <div className="card p-6 sm:p-8 mb-10">
          <h2 className="font-serif font-semibold text-xl mb-3">{t.howItWorksHeading}</h2>
          <p className={`text-sm text-gray-600 ${!isEn ? 'leading-loose' : 'leading-relaxed'}`}>{t.howItWorks}</p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/account/dashboard?tab=referrals" className="btn-primary inline-block px-8 py-3">
            {t.cta}
          </Link>
        </div>
      </div>
    </div>
  );
}
