// ToggleSwitch.js
import React from 'react';
import { useTheme } from '../context/ThemeContext';

function ToggleThemeSwitch() {
  const { isLightMode, toggleTheme } = useTheme();

  return (
    <label className="switch">
      <input type="checkbox" checked={isLightMode} onChange={toggleTheme} />
      <span className="slider round"></span>
    </label>
  );
}

export default ToggleThemeSwitch;
