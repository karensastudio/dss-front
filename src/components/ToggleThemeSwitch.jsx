// ToggleSwitch.js
import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { BsFillSunFill, BsFillMoonFill } from "react-icons/bs";

function ToggleThemeSwitch() {
  const { isLightMode, toggleTheme } = useTheme();

  if (isLightMode) {
    return (
      <BsFillMoonFill className='cursor-pointer' onClick={toggleTheme} />
    )
  } else return (
    <BsFillSunFill className='cursor-pointer' onClick={toggleTheme} />
  )
}

export default ToggleThemeSwitch;
