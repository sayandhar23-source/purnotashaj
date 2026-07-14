'use client';

import { MessageCircle } from 'lucide-react';
import { buildWhatsappLink } from '@/lib/whatsapp';

export default function WhatsAppButton({
  product,
  variantName,
  className,
}: {
  product: { title: string; slug: string };
  variantName?: string;
  className?: string;
}) {
  const link = buildWhatsappLink(product, variantName);

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className={
        className ||
        'inline-flex items-center justify-center gap-2 w-full rounded-full border border-green-500 text-green-600 hover:bg-green-50 font-medium px-5 py-2.5 transition-colors'
      }
    >
      <MessageCircle size={18} />
      Ask on WhatsApp
    </a>
  );
}
