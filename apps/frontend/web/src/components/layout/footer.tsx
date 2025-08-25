import Link from 'next/link';
import { Twitter, Linkedin, Youtube } from 'lucide-react';

interface FooterLink {
  label: string;
  href: string;
}

interface Social {
  x: string;
  linkedin: string;
  youtube: string;
}

interface FooterProps {
  brandName: string;
  brandTagline: string;
  footerLinks: FooterLink[];
  social: Social;
}

export function Footer({ brandName, brandTagline, footerLinks, social }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{brandName}</h3>
            <p className="text-gray-600 mb-4">{brandTagline}</p>
            
            {/* Social Links */}
            {(social.x || social.linkedin || social.youtube) && (
              <div className="flex space-x-4">
                {social.x && (
                  <a
                    href={social.x}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
                {social.linkedin && (
                  <a
                    href={social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {social.youtube && (
                  <a
                    href={social.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Youtube className="h-5 w-5" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Links Section */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Links</h4>
            <ul className="space-y-2">
              {footerLinks.map((link, index) => (
                <li key={index}>
                  {link.href.startsWith('http') ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Copyright */}
          <div>
            <p className="text-sm text-gray-500">
              © {currentYear} {brandName}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}