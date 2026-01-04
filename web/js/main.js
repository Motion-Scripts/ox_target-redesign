import { createOptions, resetOptionCount } from "./createOptions.js";
import { fetchNui } from "./fetchNui.js";

const optionsWrapper = document.getElementById("options-wrapper");
const body = document.body;
const eye = document.getElementById("eye");

let isAltPressed = false;
let isVisible = false;

// Track alt key state
document.addEventListener('keydown', (event) => {
  if (event.key === 'Alt') {
    isAltPressed = true;
  }
  
  // If alt is pressed and we have a number key (1-9), activate the corresponding option
  if (isAltPressed && isVisible && event.key >= '1' && event.key <= '9') {
    const optionNumber = parseInt(event.key);
    const options = optionsWrapper.querySelectorAll('.option-container');
    
    if (options[optionNumber - 1]) {
      const option = options[optionNumber - 1];
      
      // Add hover effect
      option.style.background = 'rgba(40, 40, 40, 0.95)';
      option.style.transform = 'translateX(6px) scale(1.02)';
      option.style.color = 'white';
      option.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(65, 164, 116, 0.3)';
      
      // Trigger hover effect on keybind and icon
      const keybind = option.querySelector('.option-keybind');
      const icon = option.querySelector('.option-icon');
      const label = option.querySelector('.option-label');
      
      if (keybind) {
        keybind.style.color = '#0342ff';
        keybind.style.background = 'rgba(25, 177, 197, 0.15)';
        keybind.style.borderColor = 'rgba(25, 177, 197, 0.15)';
        keybind.style.transform = 'scale(1.05)';
      }
      
      if (icon) {
        icon.style.transform = 'scale(1.1)';
        icon.style.color = 'white';
      }
      
      if (label) {
        label.style.transform = 'translateX(2px)';
      }
      
      // Brief delay to show the effect, then click and tell game to release alt
      setTimeout(() => {
        option.click();
        
        // Tell the game client to release the Alt key
        fetchNui("releaseAlt", {});
        
        // Reset our internal state
        isAltPressed = false;
      }, 100);
    }
  }
});

document.addEventListener('keyup', (event) => {
  if (event.key === 'Alt') {
    isAltPressed = false;
  }
});

window.addEventListener("message", (event) => {
  optionsWrapper.innerHTML = "";
  resetOptionCount(); // Reset keybind counter when clearing options

  switch (event.data.event) {
    case "visible": {
      isVisible = event.data.state;
      body.style.visibility = event.data.state ? "visible" : "hidden";
      return eye.classList.remove("eye-hover");
    }

    case "leftTarget": {
      return eye.classList.remove("eye-hover");
    }

    case "keyPressed": {
      const keyNumber = parseInt(event.data.key);
      const options = optionsWrapper.querySelectorAll('.option-container');
      
      if (options[keyNumber - 1]) {
        const option = options[keyNumber - 1];
        
        // Add hover effect
        option.style.background = 'rgba(40, 40, 40, 0.95)';
        option.style.transform = 'translateX(6px) scale(1.02)';
        option.style.color = 'white';
        option.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(25, 177, 197, 0.15)';
        
        // Trigger hover effect on keybind and icon
        const keybind = option.querySelector('.option-keybind');
        const icon = option.querySelector('.option-icon');
        const label = option.querySelector('.option-label');
        
        if (keybind) {
          keybind.style.color = '#0342ff';
          keybind.style.background = 'rgba(25, 177, 197, 0.15)';
          keybind.style.borderColor = 'rgba(25, 177, 197, 0.15)';
          keybind.style.transform = 'scale(1.05)';
        }
        
        if (icon) {
          icon.style.transform = 'scale(1.1)';
          icon.style.color = 'white';
        }
        
        if (label) {
          label.style.transform = 'translateX(2px)';
        }
        
        // Remove the effect after the delay
        setTimeout(() => {
          option.style.background = '';
          option.style.transform = '';
          option.style.color = '';
          option.style.boxShadow = '';
          
          if (keybind) {
            keybind.style.color = '';
            keybind.style.background = '';
            keybind.style.borderColor = '';
            keybind.style.transform = '';
          }
          
          if (icon) {
            icon.style.transform = '';
            icon.style.color = '';
          }
          
          if (label) {
            label.style.transform = '';
          }
        }, 200);
      }
      return;
    }

    case "setTarget": {
      eye.classList.add("eye-hover");

      if (event.data.options) {
        for (const type in event.data.options) {
          event.data.options[type].forEach((data, id) => {
            createOptions(type, data, id + 1);
          });
        }
      }

      if (event.data.zones) {
        for (let i = 0; i < event.data.zones.length; i++) {
          event.data.zones[i].forEach((data, id) => {
            createOptions("zones", data, id + 1, i + 1);
          });
        }
      }
    }
  }
});
