# 🔥 ox_target-redesign

A **sleek, modern redesign** of **OX Target** built for speed and efficiency.  
This upgrade introduces **optional keyboard-based interaction**, allowing players to **hold ALT and select target options using number keys (1–9)** — a faster, smoother alternative to traditional hover targeting.

Designed to feel **snappy, intuitive, and lightweight**, this redesign keeps the familiar OX Target flow while giving power users a **next-level interaction method**.

---

## ⚡ Features

- Hold **ALT** to activate keyboard targeting  
- Press **number keys (1–9)** to instantly select options  
- Seamless integration with existing OX Target  
- Fully optional — traditional hover targeting still works  
- Clean, modern UX  
- Uses `lib.addKeybind` (same method as ox_inventory)

---

## 📹 Demo / Preview

▶️ **Watch it in action:**  
https://www.youtube.com/watch?v=3IMx56KNKTs

---

## 📦 Installation

### 1️⃣ Add Required Code to `main.lua`

At the **bottom of `ox_target/client/main.lua`**, add the following:

```lua
-- Function to handle target option selection
local function selectTargetOption(keyNumber)
    if not state.isActive() or not currentTarget or not currentTarget.entity then return end
    
    -- Only work when Alt is pressed (like ox_inventory hotkeys)
    if not IsDisabledControlPressed(0, 19) then return end -- Alt key (LMENU)
    
    -- Find the corresponding option
    local optionIndex = 1
    local targetOption = nil
    local targetType = nil
    local targetZone = nil
    
    -- Check regular options first
    for k, v in pairs(options) do
        for j = 1, #v do
            if not v[j].hide then
                if optionIndex == keyNumber then
                    targetOption = j
                    targetType = k
                    break
                end
                optionIndex = optionIndex + 1
            end
        end
        if targetOption then break end
    end
    
    -- Check zone options if not found in regular options
    if not targetOption then
        for zoneIdx = 1, #nearbyZones do
            local zoneOptions = nearbyZones[zoneIdx].options
            for j = 1, #zoneOptions do
                if not zoneOptions[j].hide then
                    if optionIndex == keyNumber then
                        targetOption = j
                        targetType = "zones"
                        targetZone = zoneIdx
                        break
                    end
                    optionIndex = optionIndex + 1
                end
            end
            if targetOption then break end
        end
    end
    
    -- Trigger the option if found
    if targetOption then
        -- Send visual feedback to NUI
        SendNuiMessage(json.encode({
            event = 'keyPressed',
            key = tostring(keyNumber)
        }))
        
        -- Execute the option after a brief delay
        CreateThread(function()
            Wait(100)
            
            local zone = targetZone and nearbyZones[targetZone]
            local option = zone and zone.options[targetOption] or options[targetType][targetOption]
            
            if option then
                local response = {
                    entity = currentTarget.entity,
                    zone = currentTarget.zone,
                    coords = currentTarget.coords,
                    distance = currentTarget.distance
                }
                
                if option.openMenu then
                    local menuDepth = #menuHistory
                    
                    if option.name == 'builtin:goback' then
                        option.menuName = option.openMenu
                        option.openMenu = menuHistory[menuDepth]
                        
                        if menuDepth > 0 then
                            menuHistory[menuDepth] = nil
                        end
                    else
                        menuHistory[menuDepth + 1] = currentMenu
                    end
                    
                    menuChanged = true
                    currentMenu = option.openMenu ~= 'home' and option.openMenu or nil
                    
                    options:wipe()
                else
                    state.setNuiFocus(false)
                end
                
                currentTarget.zone = zone and zone.id
                
                if option.onSelect then
                    option.onSelect(option.qtarget and currentTarget.entity or getResponse(option))
                elseif option.export then
                    exports[option.resource or zone.resource][option.export](nil, getResponse(option))
                elseif option.event then
                    TriggerEvent(option.event, getResponse(option))
                elseif option.serverEvent then
                    local serverResponse = table.clone(getResponse(option))
                    serverResponse.entity = response.entity ~= 0 and NetworkGetEntityIsNetworked(response.entity) and
                        NetworkGetNetworkIdFromEntity(response.entity) or 0
                    TriggerServerEvent(option.serverEvent, serverResponse)
                elseif option.command then
                    ExecuteCommand(option.command)
                end
                
                if option.menuName == 'home' then return end
            end
            
            if not (option and option.openMenu) then
                state.setActive(false)
            end
        end)
    end
end

-- Add keybinds for target option selection (1-9)
for i = 1, 9 do
    lib.addKeybind({
        name = ('ox_target_hotkey%s'):format(i),
        description = ('Select target option %s'):format(i),
        defaultKey = tostring(i),
        onPressed = function()
            selectTargetOption(i)
        end
    })
end
