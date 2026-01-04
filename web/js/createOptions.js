import { fetchNui } from "./fetchNui.js";

const optionsWrapper = document.getElementById("options-wrapper");
let optionCount = 0;

function onClick() {
  // when nuifocus is disabled after a click, the hover event is never released
  this.style.pointerEvents = "none";

  fetchNui("select", [this.targetType, this.targetId, this.zoneId]);
  // is there a better way to handle this? probably
  setTimeout(() => (this.style.pointerEvents = "auto"), 100);
}

export function createOptions(type, data, id, zoneId) {
  if (data.hide) return;

  optionCount++;
  const keybindNumber = optionCount > 9 ? '' : optionCount.toString();

  const option = document.createElement("div");
  const keybindElement = keybindNumber ? `<span class="option-keybind">${keybindNumber}</span>` : '';
  const iconElement = `<i class="fa-fw ${data.icon} option-icon" ${
    data.iconColor ? `style = color:${data.iconColor} !important` : null
  }"></i>`;

  option.innerHTML = `${keybindElement}${iconElement}<p class="option-label">${data.label}</p>`;
  option.className = "option-container";
  option.targetType = type;
  option.targetId = id;
  option.zoneId = zoneId;
  option.keybind = keybindNumber;

  option.addEventListener("click", onClick);
  optionsWrapper.appendChild(option);
}

// Reset option count when options are cleared
export function resetOptionCount() {
  optionCount = 0;
}
