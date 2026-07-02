import { Link } from 'react-router'

const productLinks = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Signals', path: '/signals' },
  { label: 'Performance', path: '/performance' },
  { label: 'Pricing', path: '/pricing' },
]

const companyLinks = [
  { label: 'About', path: '#' },
  { label: 'Blog', path: '#' },
  { label: 'Careers', path: '#' },
  { label: 'Contact', path: '#' },
]

const legalLinks = [
  { label: 'Terms', path: '#' },
  { label: 'Privacy', path: '#' },
  { label: 'Risk Disclaimer', path: '#' },
  { label: 'Cookie Policy', path: '#' },
]

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#222222] bg-[#0A0A0A]">
      <div className="mx-auto max-w-[1280px] px-6 py-16 lg:px-12">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Column */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-2">
              <svg width="32" height="32" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 2L4 10V20C4 29.6 10.8 38.4 20 40C29.2 38.4 36 29.6 36 20V10L20 2Z" stroke="#00E5FF" strokeWidth="2" fill="none"/>
                <path d="M12 22L17 17L21 21L28 14" stroke="#00E5FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
              <span className="text-[20px] font-bold tracking-tight text-[#F0F0F0]">
                SignalVault
              </span>
            </Link>
            <p className="text-[14px] leading-relaxed text-[#8A8F98]">
              AI-powered trading signals to inform your trading decisions. We provide educational signals — you trade on your own platform.
            </p>
            <div className="flex items-center gap-3 pt-2">
              {/* Twitter/X */}
              <a href="#" className="text-[#5A5E66] transition-colors hover:text-[#00E5FF]" aria-label="Twitter">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* Telegram */}
              <a href="#" className="text-[#5A5E66] transition-colors hover:text-[#00E5FF]" aria-label="Telegram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024q-.16.037-5.128 3.373c-.486.34-.973.51-1.41.5-.464-.012-1.358-.253-2.023-.46-1.816-.574-3.26-.881-3.284-.98q-.022-.079.096-.131c.112-.046.44-.11 1.113-.025 4.066.587 6.79 1.275 8.34 1.8 3.963 1.308 4.78 1.538 5.317 1.54.117 0 .385-.027.558-.16a.47.47 0 0 0 .163-.326.7.7 0 0 0-.054-.185c-.1-.254-2.97-2.945-4.17-4.084l-.087-.083c-.28-.28-.573-.584-.8-.832a8.23 8.23 0 0 0-.378-.38c-.278-.258-.57-.39-.79-.37q-.145.014-.29.088c-.128.073-.262.207-.37.313-.265.264-.58.633-.88 1.004-.15.188-.304.365-.43.5-.12.13-.334.37-.496.558-.11.127-.224.263-.32.37a1.04 1.04 0 0 1-.203.186c-.04.024-.09.032-.146.032q-.058 0-.27-.12c-.18-.09-1.228-.612-1.532-.765a68.96 68.96 0 0 1-2.065-1.1c-.25-.136-.556-.278-.69-.333a4.3 4.3 0 0 0-.555-.17.745.745 0 0 0-.187-.015.21.21 0 0 0-.148.07c-.04.04-.065.1-.058.158.009.075.04.167.07.24z" />
                </svg>
              </a>
              {/* Discord */}
              <a href="#" className="text-[#5A5E66] transition-colors hover:text-[#00E5FF]" aria-label="Discord">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Product Column */}
          <div>
            <h4 className="mb-4 text-[18px] font-semibold text-[#F0F0F0]">Product</h4>
            <ul className="flex flex-col gap-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-[14px] text-[#8A8F98] transition-colors hover:text-[#F0F0F0]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Column */}
          <div>
            <h4 className="mb-4 text-[18px] font-semibold text-[#F0F0F0]">Company</h4>
            <ul className="flex flex-col gap-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-[14px] text-[#8A8F98] transition-colors hover:text-[#F0F0F0]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Column */}
          <div>
            <h4 className="mb-4 text-[18px] font-semibold text-[#F0F0F0]">Legal</h4>
            <ul className="flex flex-col gap-3">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-[14px] text-[#8A8F98] transition-colors hover:text-[#F0F0F0]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Disclaimer Banner */}
        <div className="mt-8 rounded-[12px] border border-[#222222] bg-[#111111] p-6">
          <p className="text-center text-[12px] leading-[1.6] text-[#5A5E66]">
            <strong className="text-[#8A8F98]">Important Disclaimer:</strong> SignalVault provides educational trading signals only.
            We are not a broker and do not execute trades. All trading decisions are your own responsibility.
            Trading involves significant risk of loss. Never trade with capital you cannot afford to lose.
            Past performance is not indicative of future results. Our signals are for informational and educational purposes.
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#222222] pt-8 sm:flex-row">
          <p className="text-[12px] font-medium tracking-wide text-[#5A5E66]">
            &copy; {new Date().getFullYear()} SignalVault. All rights reserved.
          </p>
          <p className="text-center text-[12px] text-[#5A5E66]">
            SignalVault is an educational signal provider, not a broker.
          </p>
        </div>
      </div>
    </footer>
  )
}
