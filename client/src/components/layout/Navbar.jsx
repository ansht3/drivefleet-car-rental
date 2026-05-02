import { NavLink, useNavigate } from "react-router-dom";
import { BarChart2, LayoutDashboard, Car } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    [
      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150",
      isActive
        ? "bg-indigo-700 text-white"
        : "text-indigo-100 hover:bg-indigo-700 hover:text-white",
    ].join(" ");

  return (
    <nav className="bg-indigo-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 group focus:outline-none"
        >
          <div className="relative bg-white/15 rounded-xl w-9 h-9 flex items-center justify-center group-hover:bg-white/25 transition-colors overflow-hidden">
            <svg
              viewBox="0 0 36 36"
              className="w-7 h-7"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 22 L18 12 L32 22"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1="18"
                y1="14"
                x2="18"
                y2="17"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.7"
              />
              <line
                x1="18"
                y1="19.5"
                x2="18"
                y2="21.5"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.5"
              />
              <line
                x1="6"
                y1="26"
                x2="14"
                y2="26"
                stroke="white"
                strokeWidth="1.2"
                strokeLinecap="round"
                opacity="0.4"
              />
              <line
                x1="22"
                y1="26"
                x2="30"
                y2="26"
                stroke="white"
                strokeWidth="1.2"
                strokeLinecap="round"
                opacity="0.4"
              />
              <line
                x1="9"
                y1="29"
                x2="27"
                y2="29"
                stroke="white"
                strokeWidth="1"
                strokeLinecap="round"
                opacity="0.25"
              />
            </svg>
          </div>
          <div className="text-left">
            <span className="font-brand text-white text-xl leading-none tracking-tight select-none">
              DriveFleet
            </span>
            <span className="block text-indigo-200 text-[10px] leading-none mt-1 hidden sm:block tracking-wide uppercase font-medium">
              Car Rentals Reimagined
            </span>
          </div>
        </button>

        <div className="flex items-center gap-1">
          <NavLink to="/" end className={linkClass}>
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </NavLink>
          <NavLink to="/rentals" className={linkClass}>
            <Car className="h-4 w-4" />
            <span className="hidden sm:inline">Rentals</span>
          </NavLink>
          <NavLink to="/reports" className={linkClass}>
            <BarChart2 className="h-4 w-4" />
            <span className="hidden sm:inline">Reports</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
