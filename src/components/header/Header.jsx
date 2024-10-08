import React, { useState, useEffect } from 'react';
import { NavLink } from "react-router-dom";
import data from "../../assets/data.json";
import { Menu } from 'lucide-react';

function Header() {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") ? localStorage.getItem("theme") : "light"
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    const localtheme = localStorage.getItem("theme");
    document.querySelector("html").setAttribute("data-theme", localtheme);
  }, [theme]);

  const handleToggle = (e) => {
    if (e.target.checked) {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="mb-24 mt-6 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between w-full print:hidden">
          <div className="flex items-center">
            <button onClick={toggleMenu} className="sm:hidden mr-4">
              <Menu size={24} />
            </button>
            <div className={`${isMenuOpen ? 'flex' : 'hidden'} sm:flex flex-col sm:flex-row gap-4 absolute sm:relative top-16 sm:top-0 left-0 sm:left-auto bg-base-100 sm:bg-transparent w-full sm:w-auto p-4 sm:p-0 shadow-md sm:shadow-none z-10`}>
              <NavLink
                to="/"
                onClick={closeMenu} 
                className={({ isActive }) =>
                  `block py-2 pr-4 pl-3 duration-200 ${
                    isActive ? "border-blue-600" : "border-b-transparent"
                  } text-sm py-1 border-b-2`
                }
              >
                About
              </NavLink>
              <NavLink
                to="/resume/"
                onClick={closeMenu} 
                className={({ isActive }) =>
                  `block py-2 pr-4 pl-3 duration-200 ${
                    isActive ? "border-blue-600" : "border-b-transparent"
                  } text-sm py-1 border-b-2`
                }
              >
                Resume
              </NavLink>
              <NavLink
                to="/projects/"
                onClick={closeMenu} 
                className={({ isActive }) =>
                  `block py-2 pr-4 pl-3 duration-200 ${
                    isActive ? "border-blue-600" : "border-b-transparent"
                  } text-sm py-1 border-b-2`
                }
              >
                Projects
              </NavLink>
              <NavLink
                to="/certification/"
                onClick={closeMenu} 
                className={({ isActive }) =>
                  `block py-2 pr-4 pl-3 duration-200 ${
                    isActive ? "border-blue-600" : "border-b-transparent"
                  } text-sm py-1 border-b-2`
                }
              >
                Certificates
              </NavLink>
              <NavLink
                to="/github/"
                onClick={closeMenu} 
                className={({ isActive }) =>
                  `block py-2 pr-4 pl-3 duration-200 ${
                    isActive ? "border-blue-600" : "border-b-transparent"
                  } text-sm py-1 border-b-2`
                }
              >
                Github
              </NavLink>
            </div>
          </div>
          <label className="swap swap-rotate ml-4">
            <input
              type="checkbox"
              onChange={handleToggle}
              checked={theme === "light" ? false : true}
            />
            <svg
              className="swap-on fill-current w-8 h-8"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
            </svg>
            <svg
              className="swap-off fill-current w-8 h-8"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
            </svg>
          </label>
        </div>
        <div className="flex flex-col gap-6 mt-16 sm:mt-36 print:mt-10 print:gap-2">
          <h1 className="text-3xl md:text-6xl font-black">
            {data.firstName}{" "}
            <span className="font-extralight">{data.lastName}</span>
          </h1>
          <h2 className="md:text-xl">{data.proffession}</h2>
        </div>
      </div>
    </div>
  );
}

export default Header;