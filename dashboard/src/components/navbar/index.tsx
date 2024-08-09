import React, { useState, useEffect } from 'react';
import Dropdown from 'components/dropdown';
import { FiAlignJustify, FiSearch } from 'react-icons/fi';
import NavLink from 'components/link/NavLink';
import { BsArrowBarUp } from 'react-icons/bs';
import { RiMoonFill, RiSunFill } from 'react-icons/ri';
import {
  IoMdNotificationsOutline,
  IoMdInformationCircleOutline,
} from 'react-icons/io';
import avatar from '/public/img/avatars/avatar4.png';
import Image from 'next/image';
import WalletSelector from 'components/card/WalletButton';

const categories = ['All', 'Olympics', 'Politics', 'Technology', 'Entertainment', 'Sports'];

const Navbar = (props: {
  onOpenSidenav: () => void;
  brandText: string;
  secondary?: boolean | string;
  [x: string]: any;
}) => {
  const { onOpenSidenav, brandText, mini, hovered } = props;
  const [darkmode, setDarkmode] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    // Set dark mode by default
    document.body.classList.add('dark');
  }, []);

  const toggleDarkMode = () => {
    if (darkmode) {
      document.body.classList.remove('dark');
    } else {
      document.body.classList.add('dark');
    }
    setDarkmode(!darkmode);
  };

  return (
    <nav className="sticky top-4 z-40 px-4 flex flex-wrap items-center justify-between rounded-xl bg-white/10 p-2 backdrop-blur-xl dark:bg-[#0b14374d]">


      {/* <div className="flex items-center space-x-2 mb-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              selectedCategory === category
                ? 'bg-brand-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-navy-700 dark:text-gray-300 dark:hover:bg-navy-600'
            }`}
          >
            {category}
          </button>
        ))}
      </div> */}

      <div className="relative flex w-full max-w-3xl items-center justify-between gap-2 rounded-full bg-white px-2 py-2 shadow-xl dark:bg-navy-800 md:w-auto">
        {/* <span
          className="flex cursor-pointer text-xl text-gray-600 dark:text-white xl:hidden"
          onClick={onOpenSidenav}
        >
          <FiAlignJustify className="h-5 w-5" />
        </span> */}
        {/* Notification */}
        {/* <Dropdown
          button={<IoMdNotificationsOutline className="h-5 w-5 text-gray-600 dark:text-white cursor-pointer" />}
          animation="origin-[65%_0%] md:origin-top-right transition-all duration-300 ease-in-out"
          classNames={'py-2 top-4 -left-[230px] md:-left-[440px] w-max'} children={undefined}        >
        </Dropdown> */}
        <div className='dark:text-white  font-bold text-blueSecondary ml-2'>
        HashPredict
        </div>
        <div
          className="cursor-pointer text-gray-600"
          onClick={toggleDarkMode}
        >
          {darkmode ? (
            <RiSunFill className="h-5 w-5 text-gray-600 dark:text-white" />
          ) : (
            <RiMoonFill className="h-5 w-5 text-gray-600 dark:text-white" />
          )}
        </div>
        {/* <Dropdown
          button={
            <Image
              width="2"
              height="20"
              className="h-10 w-10 rounded-full"
              src={avatar}
              alt="Elon Musk"
            />
          }
          classNames={'py-2 top-8 -left-[180px] w-max'}
        > */}
          {/* <div className="flex h-max w-56 flex-col justify-start rounded-[20px] bg-white bg-cover bg-no-repeat pb-4 shadow-xl shadow-shadow-500 dark:!bg-navy-700 dark:text-white dark:shadow-none"> */}

            {/* <div className="mt-3 h-px w-full bg-gray-200 dark:bg-white/20 " /> */}

            {/* <div className="ml-4 mt-3 flex flex-col">
              <a
                href="/admin/profile"
                className="text-sm text-gray-800 dark:text-white hover:dark:text-white"
              >
                Profile Settings
              </a>

            </div>
          </div>
        </Dropdown> */}
        <WalletSelector />
      </div>
    </nav>
  );
};

export default Navbar;