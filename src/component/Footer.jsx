export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 mt-16 py-8 px-4 text-center bg-gray-50">

      {/* Contact Information */}
      <p className="font-bold text-gray-900 mb-2">Contact Information</p>
      <p className="text-gray-700 text-sm">TCA Team</p>
      <p className="text-gray-700 text-sm">customercare@tcateamstore.com</p>
      <p className="text-gray-700 text-sm mb-6">(214) 613-2693</p>

      {/* Terms & Privacy */}
      <p className="text-xs text-gray-500 tracking-wide">
        <a href="#" className="hover:underline">TERMS & CONDITIONS</a>
        <span className="mx-2">|</span>
        <a href="#" className="hover:underline">PRIVACY</a>
      </p>

    </footer>
  );
}
