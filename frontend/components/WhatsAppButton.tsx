'use client';

import { MessageCircle } from 'lucide-react';
import { buildWhatsappLink } from '@/lib/whatsapp';

export default function WhatsAppButton({
  product,
  whatsappNumber,
  variantName,
  quantity,
  className,
}: {
  product: { title: string; slug: string; basePrice?: number };
  whatsappNumber: string;
  variantName?: string;
  quantity?: number;
  className?: string;
}) {
  const hasNumber = !!whatsappNumber;
  const link = hasNumber ? buildWhatsappLink(whatsappNumber, product, variantName, quantity) : '#';

  return (
    <a
      href={link}
      target={hasNumber ? '_blank' : undefined}
      rel="noopener noreferrer"
      aria-disabled={!hasNumber}
      onClick={(e) => {
        if (!hasNumber) e.preventDefault();
      }}
      className={
        className ||
        `inline-flex items-center justify-center gap-2 w-full rounded-full font-medium px-5 py-3 transition-colors ${
          hasNumber
            ? 'bg-green-500 hover:bg-green-600 text-white'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`
      }
    >
      <MessageCircle size={18} />
      {hasNumber ? 'Ask on WhatsApp' : 'WhatsApp number not set up yet'}
    </a>
  );
}
