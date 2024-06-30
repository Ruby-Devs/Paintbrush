// ==UserScript==
// @name         Ruby Paintbrush
// @version      1.0
// @description  Customize Scratch, TurboWarp, and PenguinMod as much as you want using CSS themes. TurboWarp support will come soon.
// @author       Ruby Devs
// @match        https://studio.penguinmod.com/*
// @match        https://turbowarp.org/*
// @match        https://scratch.mit.edu/*
// @icon         https://rubyteam.tech/cdn/paintbrush/pb_cool_icon.svg
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const isTurboWarp = window.location.hostname.includes('turbowarp');
    const isScratch = window.location.hostname.includes('scratch.mit.edu');
    const isPenguinMod = window.location.hostname.includes('studio.penguinmod.com');

    var script = document.createElement('script');
    script.src = 'https://rubyteam.tech/cdn/paintbrush/jszip.min.js';
    document.head.appendChild(script);

    var style = document.createElement('style');
    style.innerHTML = `
    .pb-modal {
        background-color: hsl(0deg 34.42% 10.65% / 90%);
    }

    .delete-icon {
        display: inline-block;
        vertical-align: middle;
        width: 18px;
        height: 22px;
        cursor: pointer;
        background-size: cover;
        background-repeat: no-repeat;
        margin-left: 8px;
    }

    .settings-modal_header_3lDNd {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin: 0.5rem 0 0 0;
        font-weight: bold;
    }

    .settings-modal_divider_7euKA {
        flex-grow: 1;
        margin-left: 1rem;
        border-top: 1px dashed var(--ui-tertiary, hsla(215, 50%, 90%, 1));
    }

    .settings-modal_label_2Phuq {
        height: 32px;
        display: flex;
        flex-direction: row;
        align-items: center;
    }

    .settings-modal_body_cAUJ0 {
        color: var(--text-primary, hsla(225, 15%, 40%, 1));
        background: var(--ui-primary, hsla(215, 100%, 95%, 1));
    }

    body[theme="light"] .delete-icon {
        filter: invert(1);
    }
`;
    document.head.appendChild(style);

    function insertCustomDiv() {
        const parentDiv = document.querySelector('.menu-bar_file-group_1_CHX') || document.querySelector('.menu-bar_main-menu_3g8cs');
        if (parentDiv) {
            const newDiv = document.createElement('div');
            newDiv.classList.add('menu-bar_menu-bar-item_oLDa-', 'menu-bar_hoverable_c6WFB');
            const img = document.createElement('img');
            img.src = `https://rubyteam.tech/cdn/paintbrush/pb_cool_icon${isTurboWarp ? '-tw' : ''}.svg`;
            img.draggable = false;
            newDiv.appendChild(img);

            if (isTurboWarp || isScratch) {
                const labelSpan = document.createElement('span');
                labelSpan.classList.add('menu-bar_collapsible-label_o2tym');
                const innerSpan = document.createElement('span');
                innerSpan.textContent = 'Ruby Paintbrush';
                labelSpan.appendChild(innerSpan);
                newDiv.appendChild(labelSpan);
            }

            newDiv.addEventListener('click', openReactModal);

            parentDiv.insertBefore(newDiv, parentDiv.children[2]);
            observer.disconnect();
        }
    }

    function openReactModal() {
        const dividerClass = isTurboWarp ? 'settings-modal_divider_7euKA' : 'divider_divider_1_Adi library_filter-bar-item_99aoX library_divider_2xD3D';
        const divider = isScratch ? '<hr>' : `<div class="${dividerClass}"></div>`;

        const modalContainer = document.createElement('div');
        modalContainer.className = 'ReactModalPortal';
        modalContainer.innerHTML = `
            <div class="pb-modal ReactModal__Overlay ReactModal__Overlay--after-open modal_modal-overlay_1Lcbx">
                <div class="ReactModal__Content ReactModal__Content--after-open modal_modal-content_1h3ll settings-modal_modal-content_2bE7f" tabindex="-1" role="dialog" aria-label="Ruby Paintbrush" style="border-color: #8a2c2c; background-color: #1e1111aa; width: 50%;">
                    <div class="box_box_2jjDp" dir="ltr" style="flex-direction: column; flex-grow: 1;">
                        <div class="modal_header_1h7ps" style="background-color: darksalmon;${isTurboWarp ? 'padding-left: 10px;' : ''}">
                            <div class="modal_header-item_2zQTd modal_header-item-title_tLOU5" style="${isTurboWarp ? 'padding-left: 5px;' : ''}">
                                <img src="https://rubyteam.tech/cdn/paintbrush/pb_cool_icon.svg">
                                <div class="divider_divider_1_Adi menu-bar_divider_2VFCm" style="border-color: #db7979;"></div>Ruby Paintbrush
                            </div>
                            <div class="modal_header-item_2zQTd modal_header-item-close_2XDeL">
                                <div aria-label="Close" class="close-button_close-button_lOp2G close-button_large_2oadS" role="button" tabindex="0">
                                    <img class="close-button_close-icon_HBCuO" src="https://rubyteam.tech/cdn/paintbrush/close.svg">
                                </div>
                            </div>
                        </div>
                        <div class="settings-modal_body_cAUJ0 box_box_2jjDp" style="${isScratch ? 'color: white; padding: 15px;' : ''}">
                            <p id="welcomeText" style="${isScratch ? 'color: white;' : ''}"></p>
                            <div class="settings-modal_header_3lDNd"><span style="${isScratch ? 'color: white;' : ''}">Import Theme</span><div class="settings-modal_divider_7euKA"></div></div>
                            <br>
                            <input type="file" id="cssFileInput" accept=".pbthm" style="display: none;">
                            <button id="cssFileButton" style="background-color: #8a2c2c; color: white; padding: 10px; border-radius: 5px; border-color: transparent; cursor: pointer;">Import theme file...</button>
                            <br><br>
                            <div class="settings-modal_header_3lDNd"><span style="${isScratch ? 'color: white;' : ''}">Theme List</span><div class="settings-modal_divider_7euKA"></div></div>
                            <div id="themeList" style="margin-top: 10px;"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modalContainer);

        const welcomeText = modalContainer.querySelector('#welcomeText');
        welcomeText.innerHTML = `Welcome to <b>Ruby Paintbrush</b>, the ultimate <b>${isTurboWarp ? 'TurboWarp' : isScratch ? 'Scratch' : 'PenguinMod'}</b> theme manager.`;

        const cssFileInput = modalContainer.querySelector('#cssFileInput');
        const cssFileButton = modalContainer.querySelector('#cssFileButton');
        const themeList = modalContainer.querySelector('#themeList');

        cssFileButton.addEventListener('click', () => cssFileInput.click());
        cssFileInput.addEventListener('change', handleFileUpload);

        modalContainer.querySelector('.close-button_close-button_lOp2G').addEventListener('click', () => {
            document.body.removeChild(modalContainer);
        });

        loadThemes(themeList);
    }

    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (file && file.name.endsWith('.pbthm')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                JSZip.loadAsync(e.target.result).then(zip => {
                    return Promise.all([
                        zip.file('theme.css').async('text'),
                        zip.file('info.json').async('text')
                    ]);
                }).then(([cssContent, infoContent]) => {
                    try {
                        const info = JSON.parse(infoContent);
                        const focus = info.focus || [];
                        if (focus.includes('all') || (focus.includes('turbowarp') && isTurboWarp) || (focus.includes('scratch') && isScratch) || (focus.includes('penguinmod') && isPenguinMod)) {
                            const theme = {
                                name: info.name,
                                description: info.description,
                                css: cssContent,
                                focus: info.focus
                            };
                            saveTheme(theme, true);
                        } else {
                            alert('This theme is not compatible with the current platform.');
                        }
                    } catch (err) {
                        console.error('Invalid info.json file:', err);
                    }
                }).catch(err => {
                    console.error('Error reading .pbthm file:', err);
                });
            };
            reader.readAsArrayBuffer(file);
        }
    }

    function saveTheme(theme, enableByDefault) {
        const themes = JSON.parse(localStorage.getItem('rubyPaintbrushThemes') || '[]');
        themes.push(theme);
        localStorage.setItem('rubyPaintbrushThemes', JSON.stringify(themes));
        if (enableByDefault) {
            applyTheme(theme);
        }
        loadThemes(document.querySelector('#themeList'));
    }

    function loadThemes(themeList) {
        themeList.innerHTML = '';
        const themes = JSON.parse(localStorage.getItem('rubyPaintbrushThemes') || '[]');
        themes.forEach((theme, index) => {
            if ((theme.focus.includes('turbowarp') && isTurboWarp) || (theme.focus.includes('scratch') && isScratch) || (theme.focus.includes('penguinmod') && isPenguinMod)) {
                const themeDiv = document.createElement('div');
                themeDiv.classList.add('settings-modal_setting_PxhNM', 'settings-modal_active_1McfX');

                const themeLabel = document.createElement('div');
                themeLabel.classList.add('settings-modal_label_2Phuq');

                const label = document.createElement('label');
                label.classList.add('settings-modal_label_2Phuq');

                const checkbox = document.createElement('input');
                checkbox.classList.add('settings-modal_checkbox_1dXwG', 'checkbox_checkbox_2QbUl');
                checkbox.type = 'checkbox';
                checkbox.addEventListener('change', () => {
                    if (checkbox.checked) {
                        applyTheme(theme);
                        deselectOtherCheckboxes(index);
                    } else {
                        removeTheme();
                    }
                });
                label.appendChild(checkbox);

                const span = document.createElement('span');
                span.textContent = theme.name;
                label.appendChild(span);
                themeLabel.appendChild(label);

                const deleteButton = document.createElement('div');
                deleteButton.classList.add('delete-icon');
                deleteButton.title = 'Delete';
                deleteButton.style.backgroundImage = 'url(https://rubyteam.tech/cdn/paintbrush/delete.svg)';
                deleteButton.style.width = '18px';
                deleteButton.style.height = '22px';
                deleteButton.style.cursor = 'pointer';
                deleteButton.style.backgroundSize = 'cover';
                deleteButton.style.backgroundRepeat = 'no-repeat';
                deleteButton.addEventListener('click', () => deleteTheme(index));
                themeLabel.appendChild(deleteButton);

                themeDiv.appendChild(themeLabel);

                const descriptionDiv = document.createElement('div');
                descriptionDiv.classList.add('theme-description');
                descriptionDiv.textContent = theme.description;
                descriptionDiv.style.display = 'block';
                themeDiv.appendChild(descriptionDiv);

                themeList.appendChild(themeDiv);

                const enabledTheme = JSON.parse(localStorage.getItem('rubyPaintbrushEnabledTheme') || '{}');
                if (enabledTheme.name === theme.name) {
                    checkbox.checked = true;
                    descriptionDiv.style.display = 'block';
                    applyTheme(theme);
                }
            }
        });
    }

    function deselectOtherCheckboxes(selectedIndex) {
        const checkboxes = document.querySelectorAll('.settings-modal_checkbox_1dXwG');
        checkboxes.forEach((checkbox, index) => {
            if (index !== selectedIndex) {
                checkbox.checked = false;
            }
        });
    }

    function applyTheme(theme) {
        const existingStyleElement = document.getElementById('rubyPaintbrushTheme');
        if (existingStyleElement) {
            existingStyleElement.textContent = theme.css;
        } else {
            const styleElement = document.createElement('style');
            styleElement.id = 'rubyPaintbrushTheme';
            styleElement.textContent = theme.css;
            document.head.appendChild(styleElement);
        }
        localStorage.setItem('rubyPaintbrushEnabledTheme', JSON.stringify(theme));
    }

    function removeTheme() {
        const styleElement = document.getElementById('rubyPaintbrushTheme');
        if (styleElement) {
            styleElement.remove();
        }
        localStorage.removeItem('rubyPaintbrushEnabledTheme');
    }

    function deleteTheme(index) {
        const themes = JSON.parse(localStorage.getItem('rubyPaintbrushThemes') || '[]');
        themes.splice(index, 1);
        localStorage.setItem('rubyPaintbrushThemes', JSON.stringify(themes));
        const styleElement = document.getElementById('rubyPaintbrushTheme');
        if (styleElement) {
            styleElement.remove();
        }
        loadThemes(document.querySelector('#themeList'));
    }

    const enabledTheme = JSON.parse(localStorage.getItem('rubyPaintbrushEnabledTheme') || '{}');
    if (enabledTheme.css) {
        applyTheme(enabledTheme);
    }

    const observer = new MutationObserver(insertCustomDiv);
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
