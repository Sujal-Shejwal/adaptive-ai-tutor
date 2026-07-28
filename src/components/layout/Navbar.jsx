import Logo from "../common/Logo";

function Navbar() {
  return (
    <nav className="flex justify-between items-center px-10 py-5 bg-white border-b border-gray-200">
      <Logo />

      <div className="flex items-center gap-4">
        <button className="px-5 py-2 text-gray-700 font-medium hover:text-blue-600 transition">
            Login
        </button>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
            Get Started
        </button>
      </div>
    </nav>
  );
}

export default Navbar;