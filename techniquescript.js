console.log('[Top] script.js loaded');
// --- Utility and Babylon functions (OUTSIDE DOMContentLoaded) ---

function caesarShiftEncrypt(char, shift) {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 + shift) % 26) + 65);
    } else if (code >= 97 && code <= 122) {
        return String.fromCharCode(((code - 97 + shift) % 26) + 97);
    } else {
        return char;
    }
}

function caesarShiftDecrypt(char, shift) {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 - shift + 26) % 26) + 65);
    } else if (code >= 97 && code <= 122) {
        return String.fromCharCode(((code - 97 - shift + 26) % 26) + 97);
    } else {
        return char;
    }
}

// Fade in function for GUI controls with easing
async function fadeInRect(rect, duration = 300) {
    const steps = 20;
    for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const ease = 0.5 - 0.5 * Math.cos(Math.PI * t);
        rect.alpha = ease;
        await new Promise(r => setTimeout(r, duration / steps));
    }
    rect.alpha = 1;
}
// Fade out function for GUI controls with easing
async function fadeOutRect(rect, duration = 300) {
    const steps = 20;
    for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const ease = 0.5 - 0.5 * Math.cos(Math.PI * t);
        rect.alpha = 1 - ease;
        await new Promise(r => setTimeout(r, duration / steps));
    }
    rect.alpha = 0;
}
//Apply Styles for Label and Input Textboxes
function styleTextbox(el) {
    el.style.border = "2px solid #00ffff";
    el.style.borderRadius = "5px";
    el.style.padding = "5px";
    el.style.color = "#00ffff";
    el.style.backgroundColor = "#000000";
    el.style.fontSize = "14px";
    el.style.fontWeight = "bold";
    el.style.width = "120px";
}

function styleLabel(el) {
    el.style.fontSize = "14px";
    el.style.fontWeight = "bold";
    el.style.color = "#00ffff";
}

function setupBabylon(canvas) {
    let engine = new BABYLON.Engine(canvas, true);
    let scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);
    let camera = new BABYLON.ArcRotateCamera(
        "camera",
        Math.PI / 2,
        Math.PI / 2,
        15,
        BABYLON.Vector3.Zero(),
        scene
    );
    camera.attachControl(canvas, true);
    camera.inputs.clear();
    camera.lowerRadiusLimit = 5;
    camera.upperRadiusLimit = 50;
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;
    engine.runRenderLoop(function () {
        scene.render();
    });
    window.addEventListener('resize', function () {
        engine.resize();
    });
    return { engine, scene, camera };
}
let guiTexture = null;
async function runCaesarAnimationEncrypt({ scene, camera, engine }, shift, stopLoopRef, message = "HELLO") {
    // If message is empty, don't animate
    if (!message || message.trim() === "") {
        return;
    }
    while (!stopLoopRef.value) {
        // Remove all meshes and GUI
        scene.meshes.slice().forEach(mesh => mesh.dispose());
        if (scene._rootLayer) scene._rootLayer.dispose();
        if (guiTexture){
          guiTexture.dispose();
        }
        guiTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        const advancedTexture = guiTexture;
        const letterBoxes = [];
        const letterBubbles = [];
        const spacing = 3;
        const startX = ((message.length - 1) / 2) * spacing;
        for (let i = 0; i < message.length; i++) {
            const char = message[i];
            const x = startX - (i * spacing);
            const faceUV = [];
            faceUV[0] = new BABYLON.Vector4(1, 1, 0, 0);
            for (let j = 1; j < 6; j++) {
                faceUV[j] = new BABYLON.Vector4(0, 0, 0, 0);
            }
            const box = BABYLON.MeshBuilder.CreateBox("letterBox" + i, {
                width: 1.8,
                height: 2.5,
                depth: 1,
                faceUV: faceUV
            }, scene);
            box.position = new BABYLON.Vector3(x, 0, 0);
            const material = new BABYLON.StandardMaterial("letterMat" + i, scene);
            const texture = new BABYLON.DynamicTexture("letterTexture" + i, { width: 128, height: 128 }, scene, false);
            texture.drawText(char, null, null, "bold 48px Arial", "#2d3a4b", "#e0e7ef", true);
            material.diffuseTexture = texture;
            material.diffuseColor = new BABYLON.Color3.FromHexString("#00ffff");
            material.emissiveColor = new BABYLON.Color3.FromHexString("#00ffff");
            box.material = material;
            letterBoxes.push({
                mesh: box,
                texture: texture,
                material: material,
                char: char,
                originalChar: char,
                index: i,
                suppressAnimation: false
            });
            const rect = new BABYLON.GUI.Rectangle();
            rect.width = "auto";
            rect.height = "40px";
            rect.cornerRadius = 10;
            rect.color = "#00ffff";
            rect.thickness = 2;
            rect.background = "white";
            rect.alpha = 0;
            rect.adaptWidthToChildren = true;
            const textBlock = new BABYLON.GUI.TextBlock();
            textBlock.text = "";
            textBlock.color = "black";
            textBlock.fontSize = 20;
            rect.addControl(textBlock);
            advancedTexture.addControl(rect);
            rect.linkWithMesh(box);
            rect.linkOffsetY = -70;
            letterBubbles.push({ rect, textBlock });
        }
        // Animate
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let i = 0; i < letterBoxes.length; i++) {
            const letterBox = letterBoxes[i];
            letterBox.suppressAnimation = true;
            const char = letterBox.originalChar.toUpperCase();
            const charIndex = alphabet.indexOf(char);
            if (charIndex === -1) continue;
            letterBox.material.emissiveColor = new BABYLON.Color3.FromHexString("#9dfafa"); // Highlight Color
            letterBox.material.diffuseColor = new BABYLON.Color3.FromHexString("#9dfafa"); // Highlight Color
            const riseHeight = 2;
            const duration = 1000;
            const animSteps = 30;
            const animDelay = duration / animSteps;
            const startY = letterBox.mesh.position.y;
            const startRot = letterBox.mesh.rotation.y;
            for (let t = 0; t <= animSteps; t++) {
                const progress = t / animSteps;
                const ease = 0.5 - 0.5 * Math.cos(Math.PI * progress);
                const y = startY + riseHeight * ease;
                letterBox.mesh.position.y = y;
                letterBox.mesh.rotation.y = startRot + 2 * Math.PI * progress;
                await new Promise(resolve => setTimeout(resolve, animDelay));
            }
            letterBox.mesh.position.y = startY + riseHeight;
            letterBox.mesh.rotation.y = startRot + 2 * Math.PI;
            const shifted = caesarShiftEncrypt(char, shift);
            const shiftedIndex = alphabet.indexOf(shifted);
            const stackPanel = new BABYLON.GUI.StackPanel();
            stackPanel.isVertical = false;
            stackPanel.height = "54px";
            stackPanel.width = "100%";
            stackPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            stackPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
            stackPanel.adaptWidthToChildren = true;
            stackPanel.paddingLeft = "5px";
            stackPanel.paddingRight = "5px";
            stackPanel.background = "#15162e";
            const letterBlocks = [];
            for (let j = 0; j < alphabet.length; j++) {
                const letterBlock = new BABYLON.GUI.TextBlock();
                letterBlock.text = alphabet[j];
                letterBlock.width = "18px";
                letterBlock.height = "30px";
                letterBlock.fontSize = 18;
                letterBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
                letterBlock.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
                letterBlock.paddingLeft = "0px";
                letterBlock.paddingRight = "0px";
                letterBlock.marginLeft = "1px";
                letterBlock.marginRight = "1px";
                letterBlock.color = (j === charIndex) ? "#3b82f6" : "#2d3a4b";
                letterBlock.fontWeight = (j === charIndex) ? "bold" : "normal";
                letterBlock.background = (j === charIndex) ? "#e0e7ef" : "";
                stackPanel.addControl(letterBlock);
                letterBlocks.push(letterBlock);
            }
            letterBubbles[i].rect.clearControls();
            letterBubbles[i].rect.width = "auto";
            letterBubbles[i].rect.adaptWidthToChildren = true;
            letterBubbles[i].rect.height = "54px";
            letterBubbles[i].rect.background = "#15162e";
            letterBubbles[i].rect.addControl(stackPanel);
            await fadeInRect(letterBubbles[i].rect, 300);
            // Clamp bubble to canvas horizontally using actual width
            let bubbleWidth = letterBubbles[i].rect._currentMeasure ? letterBubbles[i].rect._currentMeasure.width : 420;
            const engineWidth = engine.getRenderWidth();
            const meshScreenPos = BABYLON.Vector3.Project(
                letterBoxes[i].mesh.position,
                BABYLON.Matrix.Identity(),
                scene.getTransformMatrix(),
                camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight())
            );
            let bubbleLeft = meshScreenPos.x - bubbleWidth / 2;
            let bubbleRight = meshScreenPos.x + bubbleWidth / 2;
            if (bubbleLeft < 0) {
                letterBubbles[i].rect.linkOffsetX = -bubbleLeft;
            } else if (bubbleRight > engineWidth) {
                letterBubbles[i].rect.linkOffsetX = engineWidth - bubbleRight;
            } else {
                letterBubbles[i].rect.linkOffsetX = 0;
            }
            let steps = (shiftedIndex - charIndex + 26) % 26;
            let current = charIndex;
            for (let s = 0; s <= steps; s++) {
                for (let j = 0; j < alphabet.length; j++) {
                    letterBlocks[j].color = "#57f2ed";
                    letterBlocks[j].fontWeight = "normal";
                    letterBlocks[j].background = "";
                }
                letterBlocks[current].color = (s === steps) ? "#03ff13" : "#ff0d05";
                letterBlocks[current].fontWeight = "bold";
                letterBlocks[current].background = (s === steps) ? "#22c55e" : "#3b82f6";
                await new Promise(resolve => setTimeout(resolve, 480));
                current = (current + 1) % 26;
            }
            letterBox.texture.clear();
            letterBox.texture.drawText(shifted, null, null, "bold 48px Arial", "#000000", "#e0e7ef", true);
            letterBox.char = shifted;
            await new Promise(resolve => setTimeout(resolve, 400));
            await fadeOutRect(letterBubbles[i].rect, 300);
            letterBubbles[i].rect.clearControls();
            for (let t = 0; t <= animSteps; t++) {
                const progress = t / animSteps;
                const ease = 0.5 - 0.5 * Math.cos(Math.PI * progress);
                const y = startY + riseHeight * (1 - ease);
                letterBox.mesh.position.y = y;
                letterBox.mesh.rotation.y = startRot + 2 * Math.PI * progress;
                await new Promise(resolve => setTimeout(resolve, animDelay));
            }
            letterBox.mesh.position.y = startY;
            letterBox.mesh.rotation.y = startRot;
            letterBox.material.emissiveColor = new BABYLON.Color3.FromHexString("#00ffff");
            letterBox.suppressAnimation = false;
        }
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second pause
        if (stopLoopRef.value) break;
    }
}
async function runCaesarAnimationEncryptASCII({ scene, camera, engine }, shift, stopLoopRef, message = "HELLO") {
    // If message is empty, don't animate
    if (!message || message.trim() === "") {
        return;
    }
    while (!stopLoopRef.value) {
        // Remove all meshes and GUI
        scene.meshes.slice().forEach(mesh => mesh.dispose());
        if (scene._rootLayer) scene._rootLayer.dispose();
        if (guiTexture){
          guiTexture.dispose();
        }
        guiTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        const advancedTexture = guiTexture;
        const letterBoxes = [];
        const letterBubbles = [];
        const spacing = 3;
        const startX = ((message.length - 1) / 2) * spacing;
        for (let i = 0; i < message.length; i++) {
            const char = message[i];
            const x = startX - (i * spacing);
            const faceUV = [];
            faceUV[0] = new BABYLON.Vector4(1, 1, 0, 0);
            for (let j = 1; j < 6; j++) {
                faceUV[j] = new BABYLON.Vector4(0, 0, 0, 0);
            }
            const box = BABYLON.MeshBuilder.CreateBox("letterBox" + i, {
                width: 1.8,
                height: 2.5,
                depth: 1,
                faceUV: faceUV
            }, scene);
            box.position = new BABYLON.Vector3(x, 0, 0);
            const material = new BABYLON.StandardMaterial("letterMat" + i, scene);
            const texture = new BABYLON.DynamicTexture("letterTexture" + i, { width: 128, height: 128 }, scene, false);
            texture.drawText(char, null, null, "bold 48px Arial", "#2d3a4b", "#e0e7ef", true);
            material.diffuseTexture = texture;
            material.diffuseColor = new BABYLON.Color3.FromHexString("#a200ff");
            material.emissiveColor = new BABYLON.Color3.FromHexString("#a200ff");
            box.material = material;
            letterBoxes.push({
                mesh: box,
                texture: texture,
                material: material,
                char: char,
                originalChar: char,
                index: i,
                suppressAnimation: false
            });
            const rect = new BABYLON.GUI.Rectangle();
            rect.width = "auto";
            rect.height = "40px";
            rect.cornerRadius = 10;
            rect.color = "#00ffff";
            rect.thickness = 2;
            rect.background = "white";
            rect.alpha = 0;
            rect.adaptWidthToChildren = true;
            const textBlock = new BABYLON.GUI.TextBlock();
            textBlock.text = "";
            textBlock.color = "black";
            textBlock.fontSize = 20;
            rect.addControl(textBlock);
            advancedTexture.addControl(rect);
            rect.linkWithMesh(box);
            rect.linkOffsetY = -70;
            letterBubbles.push({ rect, textBlock });
        }
        // Animate
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let i = 0; i < letterBoxes.length; i++) {
            const letterBox = letterBoxes[i];
            letterBox.suppressAnimation = true;
            const char = letterBox.originalChar.toUpperCase();
            const charIndex = alphabet.indexOf(char);
            if (charIndex === -1) continue;
            letterBox.material.emissiveColor = new BABYLON.Color3.FromHexString("#9dfafa"); // Highlight Color
            letterBox.material.diffuseColor = new BABYLON.Color3.FromHexString("#9dfafa"); // Highlight Color
            const riseHeight = 2;
            const duration = 1000;
            const animSteps = 30;
            const animDelay = duration / animSteps;
            const startY = letterBox.mesh.position.y;
            const startRot = letterBox.mesh.rotation.y;
            for (let t = 0; t <= animSteps; t++) {
                const progress = t / animSteps;
                const ease = 0.5 - 0.5 * Math.cos(Math.PI * progress);
                const y = startY + riseHeight * ease;
                letterBox.mesh.position.y = y;
                letterBox.mesh.rotation.y = startRot + 2 * Math.PI * progress;
                await new Promise(resolve => setTimeout(resolve, animDelay));
            }
            letterBox.mesh.position.y = startY + riseHeight;
            letterBox.mesh.rotation.y = startRot + 2 * Math.PI;
            const shifted = caesarShiftEncrypt(char, shift);
            const shiftedIndex = alphabet.indexOf(shifted);
            const stackPanel = new BABYLON.GUI.StackPanel();
            stackPanel.isVertical = false;
            stackPanel.height = "54px";
            stackPanel.width = "100%";
            stackPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            stackPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
            stackPanel.adaptWidthToChildren = true;
            stackPanel.paddingLeft = "5px";
            stackPanel.paddingRight = "5px";
            stackPanel.background = "#15162e";
            const letterBlocks = [];
            for (let j = 0; j < alphabet.length; j++) {
                const letterBlock = new BABYLON.GUI.TextBlock();
                letterBlock.text = alphabet[j];
                letterBlock.width = "18px";
                letterBlock.height = "30px";
                letterBlock.fontSize = 18;
                letterBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
                letterBlock.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
                letterBlock.paddingLeft = "0px";
                letterBlock.paddingRight = "0px";
                letterBlock.marginLeft = "1px";
                letterBlock.marginRight = "1px";
                letterBlock.color = (j === charIndex) ? "#3b82f6" : "#2d3a4b";
                letterBlock.fontWeight = (j === charIndex) ? "bold" : "normal";
                letterBlock.background = (j === charIndex) ? "#e0e7ef" : "";
                stackPanel.addControl(letterBlock);
                letterBlocks.push(letterBlock);
            }
            letterBubbles[i].rect.clearControls();
            letterBubbles[i].rect.width = "auto";
            letterBubbles[i].rect.adaptWidthToChildren = true;
            letterBubbles[i].rect.height = "54px";
            letterBubbles[i].rect.background = "#15162e";
            letterBubbles[i].rect.addControl(stackPanel);
            await fadeInRect(letterBubbles[i].rect, 300);
            // Clamp bubble to canvas horizontally using actual width
            let bubbleWidth = letterBubbles[i].rect._currentMeasure ? letterBubbles[i].rect._currentMeasure.width : 420;
            const engineWidth = engine.getRenderWidth();
            const meshScreenPos = BABYLON.Vector3.Project(
                letterBoxes[i].mesh.position,
                BABYLON.Matrix.Identity(),
                scene.getTransformMatrix(),
                camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight())
            );
            let bubbleLeft = meshScreenPos.x - bubbleWidth / 2;
            let bubbleRight = meshScreenPos.x + bubbleWidth / 2;
            if (bubbleLeft < 0) {
                letterBubbles[i].rect.linkOffsetX = -bubbleLeft;
            } else if (bubbleRight > engineWidth) {
                letterBubbles[i].rect.linkOffsetX = engineWidth - bubbleRight;
            } else {
                letterBubbles[i].rect.linkOffsetX = 0;
            }
            let steps = (shiftedIndex - charIndex + 26) % 26;
            let current = charIndex;
            for (let s = 0; s <= steps; s++) {
                for (let j = 0; j < alphabet.length; j++) {
                    letterBlocks[j].color = "#57f2ed";
                    letterBlocks[j].fontWeight = "normal";
                    letterBlocks[j].background = "";
                }
                letterBlocks[current].color = (s === steps) ? "#03ff13" : "#ff0d05";
                letterBlocks[current].fontWeight = "bold";
                letterBlocks[current].background = (s === steps) ? "#22c55e" : "#3b82f6";
                await new Promise(resolve => setTimeout(resolve, 480));
                current = (current + 1) % 26;
            }
            letterBox.texture.clear();
            letterBox.texture.drawText(shifted, null, null, "bold 48px Arial", "#000000", "#e0e7ef", true);
            letterBox.char = shifted;
            await new Promise(resolve => setTimeout(resolve, 400));
            await fadeOutRect(letterBubbles[i].rect, 300);
            letterBubbles[i].rect.clearControls();
            for (let t = 0; t <= animSteps; t++) {
                const progress = t / animSteps;
                const ease = 0.5 - 0.5 * Math.cos(Math.PI * progress);
                const y = startY + riseHeight * (1 - ease);
                letterBox.mesh.position.y = y;
                letterBox.mesh.rotation.y = startRot + 2 * Math.PI * progress;
                await new Promise(resolve => setTimeout(resolve, animDelay));
            }
            letterBox.mesh.position.y = startY;
            letterBox.mesh.rotation.y = startRot;
            letterBox.material.emissiveColor = new BABYLON.Color3.FromHexString("#00ffff");
            letterBox.suppressAnimation = false;
        }
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second pause
        if (stopLoopRef.value) break;
    }
}
async function runCaesarAnimationDecrypt({ scene, camera, engine }, shift, stopLoopRef, message = "KHOOR") {
    // If message is empty, don't animate
    if (!message || message.trim() === "") {
        return;
    }
    while (!stopLoopRef.value) {
        // Remove all meshes and GUI
        scene.meshes.slice().forEach(mesh => mesh.dispose());
        if (scene._rootLayer) scene._rootLayer.dispose();
        if (guiTexture){
          guiTexture.dispose();
        }
        guiTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        const advancedTexture = guiTexture;
        const letterBoxes = [];
        const letterBubbles = [];
        const spacing = 3;
        const startX = ((message.length - 1) / 2) * spacing;
        for (let i = 0; i < message.length; i++) {
            const char = message[i];
            const x = startX - (i * spacing);
            const faceUV = [];
            faceUV[0] = new BABYLON.Vector4(1, 1, 0, 0);
            for (let j = 1; j < 6; j++) {
                faceUV[j] = new BABYLON.Vector4(0, 0, 0, 0);
            }
            const box = BABYLON.MeshBuilder.CreateBox("letterBox" + i, {
                width: 1.8,
                height: 2.5,
                depth: 1,
                faceUV: faceUV
            }, scene);
            box.position = new BABYLON.Vector3(x, 0, 0);
            const material = new BABYLON.StandardMaterial("letterMat" + i, scene);
            const texture = new BABYLON.DynamicTexture("letterTexture" + i, { width: 128, height: 128 }, scene, false);
            texture.drawText(char, null, null, "bold 48px Arial", "#2d3a4b", "#e0e7ef", true);
            material.diffuseTexture = texture;
            material.diffuseColor = new BABYLON.Color3.FromHexString("#00ffff");
            material.emissiveColor = new BABYLON.Color3.FromHexString("#00ffff");
            box.material = material;
            letterBoxes.push({
                mesh: box,
                texture: texture,
                material: material,
                char: char,
                originalChar: char,
                index: i,
                suppressAnimation: false
            });
            const rect = new BABYLON.GUI.Rectangle();
            rect.width = "auto";
            rect.height = "40px";
            rect.cornerRadius = 10;
            rect.color = "#00ffff";
            rect.thickness = 2;
            rect.background = "white";
            rect.alpha = 0;
            rect.adaptWidthToChildren = true;
            const textBlock = new BABYLON.GUI.TextBlock();
            textBlock.text = "";
            textBlock.color = "black";
            textBlock.fontSize = 20;
            rect.addControl(textBlock);
            advancedTexture.addControl(rect);
            rect.linkWithMesh(box);
            rect.linkOffsetY = -70;
            letterBubbles.push({ rect, textBlock });
        }
        // Animate
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let i = 0; i < letterBoxes.length; i++) {
            const letterBox = letterBoxes[i];
            letterBox.suppressAnimation = true;
            const char = letterBox.originalChar.toUpperCase();
            const charIndex = alphabet.indexOf(char);
            if (charIndex === -1) continue;
            letterBox.material.emissiveColor = new BABYLON.Color3.FromHexString("#9dfafa"); // Highlight Color
            letterBox.material.diffuseColor = new BABYLON.Color3.FromHexString("#9dfafa"); // Highlight Color
            const riseHeight = 2;
            const duration = 1000;
            const animSteps = 30;
            const animDelay = duration / animSteps;
            const startY = letterBox.mesh.position.y;
            const startRot = letterBox.mesh.rotation.y;
            for (let t = 0; t <= animSteps; t++) {
                const progress = t / animSteps;
                const ease = 0.5 - 0.5 * Math.cos(Math.PI * progress);
                const y = startY + riseHeight * ease;
                letterBox.mesh.position.y = y;
                letterBox.mesh.rotation.y = startRot + 2 * Math.PI * progress;
                await new Promise(resolve => setTimeout(resolve, animDelay));
            }
            letterBox.mesh.position.y = startY + riseHeight;
            letterBox.mesh.rotation.y = startRot + 2 * Math.PI;
            const decrypted = caesarShiftDecrypt(char, shift);
            const decryptedIndex = alphabet.indexOf(decrypted);
            const stackPanel = new BABYLON.GUI.StackPanel();
            stackPanel.isVertical = false;
            stackPanel.height = "54px";
            stackPanel.width = "100%";
            stackPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            stackPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
            stackPanel.adaptWidthToChildren = true;
            stackPanel.paddingLeft = "5px";
            stackPanel.paddingRight = "5px";
            stackPanel.background = "#15162e";
            const letterBlocks = [];
            for (let j = 0; j < alphabet.length; j++) {
                const letterBlock = new BABYLON.GUI.TextBlock();
                letterBlock.text = alphabet[j];
                letterBlock.width = "18px";
                letterBlock.height = "30px";
                letterBlock.fontSize = 18;
                letterBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
                letterBlock.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
                letterBlock.paddingLeft = "0px";
                letterBlock.paddingRight = "0px";
                letterBlock.marginLeft = "1px";
                letterBlock.marginRight = "1px";
                letterBlock.color = (j === charIndex) ? "#3b82f6" : "#2d3a4b";
                letterBlock.fontWeight = (j === charIndex) ? "bold" : "normal";
                letterBlock.background = (j === charIndex) ? "#e0e7ef" : "";
                stackPanel.addControl(letterBlock);
                letterBlocks.push(letterBlock);
            }
            letterBubbles[i].rect.clearControls();
            letterBubbles[i].rect.width = "auto";
            letterBubbles[i].rect.adaptWidthToChildren = true;
            letterBubbles[i].rect.height = "54px";
            letterBubbles[i].rect.background = "#15162e";
            letterBubbles[i].rect.addControl(stackPanel);
            await fadeInRect(letterBubbles[i].rect, 300);
            // Clamp bubble to canvas horizontally using actual width
            let bubbleWidth = letterBubbles[i].rect._currentMeasure ? letterBubbles[i].rect._currentMeasure.width : 420;
            const engineWidth = engine.getRenderWidth();
            const meshScreenPos = BABYLON.Vector3.Project(
                letterBoxes[i].mesh.position,
                BABYLON.Matrix.Identity(),
                scene.getTransformMatrix(),
                camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight())
            );
            let bubbleLeft = meshScreenPos.x - bubbleWidth / 2;
            let bubbleRight = meshScreenPos.x + bubbleWidth / 2;
            if (bubbleLeft < 0) {
                letterBubbles[i].rect.linkOffsetX = -bubbleLeft;
            } else if (bubbleRight > engineWidth) {
                letterBubbles[i].rect.linkOffsetX = engineWidth - bubbleRight;
            } else {
                letterBubbles[i].rect.linkOffsetX = 0;
            }
            // For decryption, we go backwards through the alphabet
            let steps = (charIndex - decryptedIndex + 26) % 26;
            let current = charIndex;
            for (let s = 0; s <= steps; s++) {
                for (let j = 0; j < alphabet.length; j++) {
                    letterBlocks[j].color = "#57f2ed";
                    letterBlocks[j].fontWeight = "normal";
                    letterBlocks[j].background = "";
                }
                letterBlocks[current].color = (s === steps) ? "#03ff13" : "#ff0d05";
                letterBlocks[current].fontWeight = "bold";
                letterBlocks[current].background = (s === steps) ? "#22c55e" : "#3b82f6";
                await new Promise(resolve => setTimeout(resolve, 480));
                current = (current - 1 + 26) % 26; // Go backwards for decryption
            }
            letterBox.texture.clear();
            letterBox.texture.drawText(decrypted, null, null, "bold 48px Arial", "#000000", "#e0e7ef", true);
            letterBox.char = decrypted;
            await new Promise(resolve => setTimeout(resolve, 400));
            await fadeOutRect(letterBubbles[i].rect, 300);
            letterBubbles[i].rect.clearControls();
            for (let t = 0; t <= animSteps; t++) {
                const progress = t / animSteps;
                const ease = 0.5 - 0.5 * Math.cos(Math.PI * progress);
                const y = startY + riseHeight * (1 - ease);
                letterBox.mesh.position.y = y;
                letterBox.mesh.rotation.y = startRot + 2 * Math.PI * progress;
                await new Promise(resolve => setTimeout(resolve, animDelay));
            }
            letterBox.mesh.position.y = startY;
            letterBox.mesh.rotation.y = startRot;
            letterBox.material.emissiveColor = new BABYLON.Color3.FromHexString("#00ffff");
            letterBox.suppressAnimation = false;
        }
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second pause
        if (stopLoopRef.value) break;
    }
}
async function runCaesarAnimationDecryptASCII({ scene, camera, engine }, shift, stopLoopRef, message = "KHOOR") {
    // If message is empty, don't animate
    if (!message || message.trim() === "") {
        return;
    }
    while (!stopLoopRef.value) {
        // Remove all meshes and GUI
        scene.meshes.slice().forEach(mesh => mesh.dispose());
        if (scene._rootLayer) scene._rootLayer.dispose();
        if (guiTexture){
          guiTexture.dispose();
        }
        guiTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        const advancedTexture = guiTexture;
        const letterBoxes = [];
        const letterBubbles = [];
        const spacing = 3;
        const startX = ((message.length - 1) / 2) * spacing;
        for (let i = 0; i < message.length; i++) {
            const char = message[i];
            const x = startX - (i * spacing);
            const faceUV = [];
            faceUV[0] = new BABYLON.Vector4(1, 1, 0, 0);
            for (let j = 1; j < 6; j++) {
                faceUV[j] = new BABYLON.Vector4(0, 0, 0, 0);
            }
            const box = BABYLON.MeshBuilder.CreateBox("letterBox" + i, {
                width: 1.8,
                height: 2.5,
                depth: 1,
                faceUV: faceUV
            }, scene);
            box.position = new BABYLON.Vector3(x, 0, 0);
            const material = new BABYLON.StandardMaterial("letterMat" + i, scene);
            const texture = new BABYLON.DynamicTexture("letterTexture" + i, { width: 128, height: 128 }, scene, false);
            texture.drawText(char, null, null, "bold 48px Arial", "#2d3a4b", "#e0e7ef", true);
            material.diffuseTexture = texture;
            material.diffuseColor = new BABYLON.Color3.FromHexString("#00ffff");
            material.emissiveColor = new BABYLON.Color3.FromHexString("#00ffff");
            box.material = material;
            letterBoxes.push({
                mesh: box,
                texture: texture,
                material: material,
                char: char,
                originalChar: char,
                index: i,
                suppressAnimation: false
            });
            const rect = new BABYLON.GUI.Rectangle();
            rect.width = "auto";
            rect.height = "40px";
            rect.cornerRadius = 10;
            rect.color = "#00ffff";
            rect.thickness = 2;
            rect.background = "white";
            rect.alpha = 0;
            rect.adaptWidthToChildren = true;
            const textBlock = new BABYLON.GUI.TextBlock();
            textBlock.text = "";
            textBlock.color = "black";
            textBlock.fontSize = 20;
            rect.addControl(textBlock);
            advancedTexture.addControl(rect);
            rect.linkWithMesh(box);
            rect.linkOffsetY = -70;
            letterBubbles.push({ rect, textBlock });
        }
        // Animate
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let i = 0; i < letterBoxes.length; i++) {
            const letterBox = letterBoxes[i];
            letterBox.suppressAnimation = true;
            const char = letterBox.originalChar.toUpperCase();
            const charIndex = alphabet.indexOf(char);
            if (charIndex === -1) continue;
            letterBox.material.emissiveColor = new BABYLON.Color3.FromHexString("#9dfafa"); // Highlight Color
            letterBox.material.diffuseColor = new BABYLON.Color3.FromHexString("#9dfafa"); // Highlight Color
            const riseHeight = 2;
            const duration = 1000;
            const animSteps = 30;
            const animDelay = duration / animSteps;
            const startY = letterBox.mesh.position.y;
            const startRot = letterBox.mesh.rotation.y;
            for (let t = 0; t <= animSteps; t++) {
                const progress = t / animSteps;
                const ease = 0.5 - 0.5 * Math.cos(Math.PI * progress);
                const y = startY + riseHeight * ease;
                letterBox.mesh.position.y = y;
                letterBox.mesh.rotation.y = startRot + 2 * Math.PI * progress;
                await new Promise(resolve => setTimeout(resolve, animDelay));
            }
            letterBox.mesh.position.y = startY + riseHeight;
            letterBox.mesh.rotation.y = startRot + 2 * Math.PI;
            const decrypted = caesarShiftDecrypt(char, shift);
            const decryptedIndex = alphabet.indexOf(decrypted);
            const stackPanel = new BABYLON.GUI.StackPanel();
            stackPanel.isVertical = false;
            stackPanel.height = "54px";
            stackPanel.width = "100%";
            stackPanel.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
            stackPanel.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
            stackPanel.adaptWidthToChildren = true;
            stackPanel.paddingLeft = "5px";
            stackPanel.paddingRight = "5px";
            stackPanel.background = "#15162e";
            const letterBlocks = [];
            for (let j = 0; j < alphabet.length; j++) {
                const letterBlock = new BABYLON.GUI.TextBlock();
                letterBlock.text = alphabet[j];
                letterBlock.width = "18px";
                letterBlock.height = "30px";
                letterBlock.fontSize = 18;
                letterBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
                letterBlock.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
                letterBlock.paddingLeft = "0px";
                letterBlock.paddingRight = "0px";
                letterBlock.marginLeft = "1px";
                letterBlock.marginRight = "1px";
                letterBlock.color = (j === charIndex) ? "#3b82f6" : "#2d3a4b";
                letterBlock.fontWeight = (j === charIndex) ? "bold" : "normal";
                letterBlock.background = (j === charIndex) ? "#e0e7ef" : "";
                stackPanel.addControl(letterBlock);
                letterBlocks.push(letterBlock);
            }
            letterBubbles[i].rect.clearControls();
            letterBubbles[i].rect.width = "auto";
            letterBubbles[i].rect.adaptWidthToChildren = true;
            letterBubbles[i].rect.height = "54px";
            letterBubbles[i].rect.background = "#15162e";
            letterBubbles[i].rect.addControl(stackPanel);
            await fadeInRect(letterBubbles[i].rect, 300);
            // Clamp bubble to canvas horizontally using actual width
            let bubbleWidth = letterBubbles[i].rect._currentMeasure ? letterBubbles[i].rect._currentMeasure.width : 420;
            const engineWidth = engine.getRenderWidth();
            const meshScreenPos = BABYLON.Vector3.Project(
                letterBoxes[i].mesh.position,
                BABYLON.Matrix.Identity(),
                scene.getTransformMatrix(),
                camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight())
            );
            let bubbleLeft = meshScreenPos.x - bubbleWidth / 2;
            let bubbleRight = meshScreenPos.x + bubbleWidth / 2;
            if (bubbleLeft < 0) {
                letterBubbles[i].rect.linkOffsetX = -bubbleLeft;
            } else if (bubbleRight > engineWidth) {
                letterBubbles[i].rect.linkOffsetX = engineWidth - bubbleRight;
            } else {
                letterBubbles[i].rect.linkOffsetX = 0;
            }
            // For decryption, we go backwards through the alphabet
            let steps = (charIndex - decryptedIndex + 26) % 26;
            let current = charIndex;
            for (let s = 0; s <= steps; s++) {
                for (let j = 0; j < alphabet.length; j++) {
                    letterBlocks[j].color = "#57f2ed";
                    letterBlocks[j].fontWeight = "normal";
                    letterBlocks[j].background = "";
                }
                letterBlocks[current].color = (s === steps) ? "#03ff13" : "#ff0d05";
                letterBlocks[current].fontWeight = "bold";
                letterBlocks[current].background = (s === steps) ? "#22c55e" : "#3b82f6";
                await new Promise(resolve => setTimeout(resolve, 480));
                current = (current - 1 + 26) % 26; // Go backwards for decryption
            }
            letterBox.texture.clear();
            letterBox.texture.drawText(decrypted, null, null, "bold 48px Arial", "#000000", "#e0e7ef", true);
            letterBox.char = decrypted;
            await new Promise(resolve => setTimeout(resolve, 400));
            await fadeOutRect(letterBubbles[i].rect, 300);
            letterBubbles[i].rect.clearControls();
            for (let t = 0; t <= animSteps; t++) {
                const progress = t / animSteps;
                const ease = 0.5 - 0.5 * Math.cos(Math.PI * progress);
                const y = startY + riseHeight * (1 - ease);
                letterBox.mesh.position.y = y;
                letterBox.mesh.rotation.y = startRot + 2 * Math.PI * progress;
                await new Promise(resolve => setTimeout(resolve, animDelay));
            }
            letterBox.mesh.position.y = startY;
            letterBox.mesh.rotation.y = startRot;
            letterBox.material.emissiveColor = new BABYLON.Color3.FromHexString("#00ffff");
            letterBox.suppressAnimation = false;
        }
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second pause
        if (stopLoopRef.value) break;
    }
}
function vigenereShiftEncrypt(char, keyChar) {
    const code = char.charCodeAt(0);
    const keyCode = keyChar.charCodeAt(0);
    if (code >= 65 && code <= 90) {
        // Uppercase
        return String.fromCharCode(((code - 65 + (keyCode - 65)) % 26) + 65);
    } else if (code >= 97 && code <= 122) {
        // Lowercase
        return String.fromCharCode(((code - 97 + (keyCode - 65)) % 26) + 97);
    } else {
        return char;
    }
}
function vigenereShiftDecrypt(char, keyChar) {
    const code = char.charCodeAt(0);
    const keyCode = keyChar.charCodeAt(0);
    if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 - (keyCode - 65) + 26) % 26) + 65);
    } else if (code >= 97 && code <= 122) {
        return String.fromCharCode(((code - 97 - (keyCode - 65) + 26) % 26) + 97);
    } else {
        return char;
    }
}
function generateVigenereTableFromKeyword(keyword) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    keyword = keyword.toUpperCase().replace(/[^A-Z]/g, '');
    const table = [];
    for (let i = 0; i < keyword.length; i++) {
        const shift = alphabet.indexOf(keyword[i]);
        const row = alphabet.slice(shift) + alphabet.slice(0, shift);
        table.push({ key: keyword[i], row });
    }
    return table;
}
function renderVigenereTable(table, highlightCol = -1, highlightRow = -1) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    // Determine if vertical scrolling is needed (more than 5 rows)
    const needsVerticalScroll = table.length > 3;
    const maxHeight = needsVerticalScroll ? '150px' : '150px';
    
    // Create wrapper container for table and bubbles
    let html = `<div style="position: relative; width: 500px; margin: 0 auto;">`;
    
    // Add KEY bubble (initially hidden, will show on horizontal scroll)
    if (highlightRow >= 0 && highlightRow < table.length) {
        const keywordLetter = table[highlightRow].key;
        
        html += `
        <div id="key-bubble" style="display: none;">
            <div class="bubble-letter">${keywordLetter}</div>
        </div>`;
    }
    
    // Add Plaintext bubble (initially hidden, will show on vertical scroll)
    if (highlightCol >= 0) {
        const plaintextLetter = alphabet[highlightCol];
        
        html += `
        <div id="plaintext-bubble" style="display: none;">
            <div class="bubble-letter">${plaintextLetter}</div>
        </div>`;
    }
    
    // Add the scrollable table container
    html += `<div style="width: 500px; overflow-x: auto; overflow-y: ${needsVerticalScroll ? 'auto' : 'visible'}; border: 2px solid #00ffff; border-radius: 5px; max-height: ${maxHeight}; position: relative; display: block;">`;
    
    html += '<table class="vig-table" style="width: 500px; table-layout: fixed; min-width: 500px; border-collapse: separate; border-spacing: 0; position: relative;">';
    
    // Header row with floating first column
    html += '<tr><th style="width: 40px; min-width: 40px; max-width: 40px;"></th>';
    for (let cIdx = 0; cIdx < alphabet.length; cIdx++) {
        const c = alphabet[cIdx];
        html += `<th${highlightCol === cIdx ? ' class="highlight-col"' : ''} style="width: 28px; min-width: 28px;">${c}</th>`;
    }
    html += '</tr>';
    
    // Data rows with floating first column
    for (let r = 0; r < table.length; r++) {
        const row = table[r];
        const rowClass = highlightRow === r ? ' class="highlight-row"' : '';
        html += `<tr${rowClass}><td style="width: 40px; min-width: 40px; max-width: 40px;"><b>${row.key}</b></td>`;
        for (let cIdx = 0; cIdx < row.row.length; cIdx++) {
            let cellClass = '';
            if (highlightCol === cIdx && highlightRow === r) {
                cellClass = ' class="highlight-col highlight-intersect"';
            } else if (highlightCol === cIdx) {
                cellClass = ' class="highlight-col"';
            }            
            html += `<td${cellClass} style="width: 28px; min-width: 28px;">${row.row[cIdx]}</td>`;
        }
        html += '</tr>';
    }
    html += '</table></div></div>'; // Close table, visible-table div, and wrapper div
    return html;
}

function columnarTranspositionEncrypt(message, key, padWithX = true) {
    // Normalize inputs
    message = (message || '').replace(/[^A-Za-z]/g, '').toUpperCase();
    key = (key || '');
    const isKeyNumeric = /^\d+$/.test(key);
    if (isKeyNumeric) {
        key = key.replace(/[^0-9]/g, '');
    } else {
        key = key.replace(/[^A-Za-z]/g, '').toUpperCase();
    }
    if (!key) return message;

    const cols = key.length;
    // Pad with 'X' to a multiple of cols (optional)
    if (padWithX) {
        const padLen = (cols - (message.length % cols)) % cols;
        if (padLen > 0) message = message + 'X'.repeat(padLen);
    }
    const rows = Math.ceil(message.length / cols);

    // Fill grid row-wise
    const grid = [];
    let idx = 0;
    for (let r = 0; r < rows; r++) {
        const row = [];
        for (let c = 0; c < cols; c++) {
            row.push(message[idx] || '');
            idx++;
        }
        grid.push(row);
    }

    // Sort key to get column order (stable by original index)
    let keyOrder;
    if (isKeyNumeric) {
        keyOrder = key.split('').map((ch, i) => ({ ch: parseInt(ch), i }))
            .sort((a, b) => a.ch - b.ch || a.i - b.i)
            .map(obj => obj.i);
    } else {
        keyOrder = key.split('').map((ch, i) => ({ ch, i }))
            .sort((a, b) => a.ch.localeCompare(b.ch) || a.i - b.i)
            .map(obj => obj.i);
    }

    // Read columns in sorted key order
    let ciphertext = '';
    for (let k = 0; k < keyOrder.length; k++) {
        const c = keyOrder[k];
        for (let r = 0; r < rows; r++) {
            if (grid[r][c]) ciphertext += grid[r][c];
        }
    }
    return ciphertext;
}

// Close warning banner functionality
function closeWarningBanner() {
    const banner = document.querySelector('.warning-banner');
    const dontShowAgain = document.getElementById('dont-show-again');
    
    if (banner) {
        // Update localStorage based on checkbox state
        if (dontShowAgain) {
            localStorage.setItem('hideWarningBanner', dontShowAgain.checked ? 'true' : 'false');
        }
        
        banner.style.animation = 'popOut 0.3s ease-out';
        banner.style.opacity = '0';
        banner.style.pointerEvents = 'none';
        document.body.style.overflow = 'auto';
        
        // Remove the banner from the DOM after animation completes
        banner.addEventListener('animationend', function handler() {
            banner.removeEventListener('animationend', handler);
            banner.style.display = 'none';
        }, { once: true });
    }
}

function helpButton() {
    const banner = document.querySelector('.warning-banner');
    const dontShowAgain = document.getElementById('dont-show-again');
    
    if (banner) {
        // Sync checkbox with localStorage state
        if (dontShowAgain) {
            dontShowAgain.checked = localStorage.getItem('hideWarningBanner') === 'true';
        }
        banner.style.display = 'flex';
        banner.style.animation = 'popIn 0.3s ease-out';
        banner.style.opacity = '1';
        banner.style.pointerEvents = 'auto';
        document.body.style.overflow = 'hidden'; // Prevent scrolling when banner is open
    }
}

// Add event listeners for help and close buttons
document.addEventListener('click', (e) => {
    if (e.target.closest('.help-button')) {
        helpButton();
    } else if (e.target.id === 'close-warning') {
        closeWarningBanner();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const tooltip = document.querySelector('.info-tooltip');
    const tooltipText = document.querySelector('.tooltip-text');
    let isTooltipOpen = false;

    // Toggle tooltip on click
    tooltip.addEventListener('click', (e) => {
        e.stopPropagation();
        isTooltipOpen = !isTooltipOpen;
        updateTooltipState();
    });

    // Close tooltip when clicking outside
    document.addEventListener('click', (e) => {
        if (isTooltipOpen && !tooltip.contains(e.target) && !tooltipText.contains(e.target)) {
            isTooltipOpen = false;
            updateTooltipState();
        }
    });

    function updateTooltipState() {
        if (isTooltipOpen) {
            tooltipText.style.visibility = 'visible';
            tooltipText.style.opacity = '1';
            document.querySelector('.info-tooltip::before').style.opacity = '1';
            document.querySelector('.info-tooltip::before').style.visibility = 'visible';
        } else {
            tooltipText.style.visibility = 'hidden';
            tooltipText.style.opacity = '0';
            document.querySelector('.info-tooltip::before').style.opacity = '0';
            document.querySelector('.info-tooltip::before').style.visibility = 'hidden';
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Mini-canvas Babylon.js setup
  document.querySelectorAll('.mini-canvas').forEach(canvas => {
      const engine = new BABYLON.Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true});
      const scene = new BABYLON.Scene(engine);
      scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);

      const glowLayer = new BABYLON.GlowLayer("glow", scene);
      glowLayer.intensity = 0.6;

      const camera = new BABYLON.ArcRotateCamera("cam", Math.PI/2, Math.PI/2, 3, BABYLON.Vector3.Zero(), scene);
      camera.attachControl(canvas, false);
      camera.inputs.clear();

      const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0,1,0), scene);
      light.intensity = 0.8;

      let spinning = false;
      let padlockParent = null;
      let originalRotationY = 0;
      canvas.parentElement.addEventListener('mouseenter', () => spinning = true);
      canvas.parentElement.addEventListener('mouseleave', () => {
          spinning = false;
          if (padlockParent) {
              padlockParent.rotation.y = originalRotationY;
          }
      });

      const parent = canvas.parentElement;
      const modelFile = parent.getAttribute('data-model') || 'padlock-lock.obj'; // default fallback

      BABYLON.SceneLoader.ImportMesh("", "techniqueassets/", modelFile, scene, function(meshes) {
          console.log('Loaded meshes:', meshes);

          // Create a parent node for the padlock
          padlockParent = new BABYLON.TransformNode("padlockParent", scene);
          // Store the original Y rotation
          originalRotationY = padlockParent.rotation.y;

          // Parent all meshes to the parent node
          meshes.forEach(mesh => {
              mesh.parent = padlockParent;
          });

          // Scale and position the parent node
          padlockParent.scaling = new BABYLON.Vector3(.5, .5, .5);
          padlockParent.position = new BABYLON.Vector3(0, 0, 0);

          // Optionally, apply material to all meshes
          meshes.forEach((mesh, i) => {
              const mat = new BABYLON.StandardMaterial("mat" + i, scene);
              if (modelFile === "padlock-unlock.obj") {
                // Assign different colors for demonstration
                  if (i === 0) {
                    mat.emissiveColor = new BABYLON.Color3.FromHexString("#64e6f5");
                    mat.diffuseColor = new BABYLON.Color3.FromHexString("#0f344f");
                } else if (i === 1) {
                    mat.emissiveColor = new BABYLON.Color3.FromHexString("#00ffff");
                    mat.diffuseColor = new BABYLON.Color3.FromHexString("#00ffff");
                } else if (i === 2) {
                    mat.emissiveColor = new BABYLON.Color3.FromHexString("#64e6f5");
                    mat.diffuseColor = new BABYLON.Color3.FromHexString("#0f344f");
                } else {
                    mat.emissiveColor = new BABYLON.Color3(1, 1, 0); //
                    mat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0);
                }
              }else{
                // Assign different colors for demonstration
                  if (i === 0) {
                    mat.emissiveColor = new BABYLON.Color3.FromHexString("#3b3c3d");
                    mat.diffuseColor = new BABYLON.Color3.FromHexString("#3b3c3d");
                } else if (i === 1) {
                    mat.emissiveColor = new BABYLON.Color3.FromHexString("#6c757d"); // 
                    mat.diffuseColor = new BABYLON.Color3.FromHexString("#6c757d");
                } else if (i === 2) {
                    mat.emissiveColor = new BABYLON.Color3.FromHexString("#6c757d");
                    mat.diffuseColor = new BABYLON.Color3.FromHexString("#0f344f");
                } else {
                    mat.emissiveColor = new BABYLON.Color3(1, 1, 0); // 
                    mat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0);
                }
              }
              
              mesh.material = mat;
          });

          // Rotate the parent node
          scene.registerBeforeRender(() => {
              if (spinning) {
                  padlockParent.rotation.y += 0.03;
              }
          });
      });

      engine.runRenderLoop(() => scene.render());
      window.addEventListener('resize', () => engine.resize());
  });

// Remove the nested DOMContentLoaded handler and use runMain
function runMain() {
  // Check if user previously chose not to see the warning banner
  const hideBanner = localStorage.getItem('hideWarningBanner') === 'true';
  const warningBanner = document.querySelector('.warning-banner');
  if (hideBanner && warningBanner) {
    warningBanner.style.display = 'none';
    document.body.style.overflow = 'auto';
  }

  console.log('[Debug] runMain running');
  const cards = document.querySelectorAll('.card:not(.coming-soon)');
  console.log('[Debug] Cards found:', cards);
  const modal = document.getElementById('card-modal');
  const modalContent = modal.querySelector('.card-modal-content');
  const modalTitle = modal.querySelector('.modal-title');
  const modalDescription = modal.querySelector('.modal-description');
  const closeBtn = modal.querySelector('.card-modal-close');

  // --- Caesar modal state ---
  let caesarBabylon = null;
  let caesarCanvas = null;
  let caesarStopLoopRef = null;
  let caesarInputGroup = null;
  let caesarPlaintextInput = null;
  let caesarShiftInput = null;
  let caesarShiftValue = null;
  let caesarASCII = false;
  // --- Vigenère modal state ---
  let vigBabylon = null;
  let vigCanvas = null;
  let vigStopLoopRef = null;
  let vigControlsDiv = null;
  let vigTableDiv = null;
  let vigCurrentAnimationId = 0;
  let vigCurrentAnimationPromise = null;
  let vigIsPlayingRef = { value: true };
  let vigSavedScroll = { x: 0, y: 0 };
  // --- Transposition modal state ---
  let transBabylon = null;
  let transCanvas = null;
  let transStopLoopRef = null;
  let transInputGroup = null;
  let transCurrentAnimationId = 0;
  let transGuiTexture = null;
  let TextContainer = null;

  cards.forEach(card => {
    card.addEventListener('click', function() {
      const h2 = card.querySelector('h2');
      modalTitle.textContent = h2 ? h2.textContent : '';
      modalTitle.setAttribute('data-text', modalTitle.textContent);
      modalDescription.textContent = card.getAttribute('data-description') || 'No description available.';
      // --- Caesar special case ---
    if(h2 && h2.textContent.trim().toLowerCase() === 'caesar') {
        console.log('[Caesar] Card clicked, entering Caesar modal logic');
        // Create a new canvas for Babylon
        caesarCanvas = document.createElement('canvas');
        caesarCanvas.width = 600;
        caesarCanvas.height = 300;
        caesarCanvas.style.width = '100%';
        caesarCanvas.style.height = '300px';
        caesarCanvas.style.display = 'block';
        caesarCanvas.style.margin = '16px auto 16px auto';
        caesarCanvas.className = 'caesar-canvas';
        caesarCanvas.style.outline = '2px solid #00ffff';
        caesarCanvas.style.borderRadius = '5px';
        caesarCanvas.style.padding = '5px';
        
        // Create input group container
        caesarInputGroup = document.createElement('div');
        caesarInputGroup.className = 'input-group';
        caesarInputGroup.style.width = 'fit-content';
        caesarInputGroup.style.display = 'flex';
        caesarInputGroup.style.flexDirection = 'row';
        caesarInputGroup.style.alignItems = 'flex-start';
        caesarInputGroup.style.justifyContent = 'center';
        caesarInputGroup.style.gap = '24px';
        caesarInputGroup.style.padding = '12px 16px';
        caesarInputGroup.style.borderRadius = '10px';
        caesarInputGroup.style.zIndex = '10';
        caesarInputGroup.style.flexWrap = 'wrap';
    
        // Plaintext field with label
        const textFieldGroup = document.createElement('div');
        textFieldGroup.style.display = 'flex';
        textFieldGroup.style.flexDirection = 'column';
        textFieldGroup.style.gap = '4px';
    
        const textLabel = document.createElement('label');
        textLabel.htmlFor = 'caesar-plaintext';
        textLabel.textContent = 'Plaintext';
        styleLabel(textLabel);
    
        caesarPlaintextInput = document.createElement('input');
        caesarPlaintextInput.type = 'text';
        caesarPlaintextInput.id = 'caesar-plaintext';
        caesarPlaintextInput.value = 'HELLO';
        caesarPlaintextInput.maxLength = 40;
        caesarPlaintextInput.autocomplete = 'off';
        caesarPlaintextInput.autocapitalize = 'characters';
        caesarPlaintextInput.pattern = '[A-Za-z]*';
        styleTextbox(caesarPlaintextInput);
    
        textFieldGroup.appendChild(textLabel);
        textFieldGroup.appendChild(caesarPlaintextInput);
    
        // Slider field with label
        const sliderFieldGroup = document.createElement('div');
        sliderFieldGroup.style.display = 'flex';
        sliderFieldGroup.style.flexDirection = 'column';
        sliderFieldGroup.style.gap = '4px';
    
        const sliderLabel = document.createElement('label');
        sliderLabel.htmlFor = 'caesar-shift';
        sliderLabel.textContent = 'Key Value';
        styleLabel(sliderLabel);
    
        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'slider-container';
        sliderContainer.style.display = 'flex';
        sliderContainer.style.alignItems = 'center';
        sliderContainer.style.gap = '12px';
    
        caesarShiftInput = document.createElement('input');
        caesarShiftInput.type = 'range';
        caesarShiftInput.id = 'caesar-shift';
        caesarShiftInput.min = '1';
        caesarShiftInput.max = '25';
        caesarShiftInput.value = '3';
        
    
        caesarShiftValue = document.createElement('span');
        caesarShiftValue.id = 'caesar-shift-value';
        caesarShiftValue.style.color = "#00ffff";
        caesarShiftValue.style.fontSize = "14px";
        caesarShiftValue.style.fontWeight = "bold";
        caesarShiftValue.textContent = caesarShiftInput.value;
    
        sliderContainer.appendChild(caesarShiftInput);
        sliderContainer.appendChild(caesarShiftValue);

        // Toggle: Use ASCI
        const useASCIGroup = document.createElement('div');
        useASCIGroup.style.display = 'flex';
        useASCIGroup.style.flexDirection = 'row';
        useASCIGroup.style.alignItems = 'center';
        useASCIGroup.style.gap = '8px';
        
        const useASCIILabel = document.createElement('label');
        useASCIILabel.htmlFor = 'caesar-use-asci';
        useASCIILabel.style.fontSize = '12px';
        useASCIILabel.textContent = 'Use ASCII table of code';
        useASCIILabel.style.fontWeight = 'normal';
        useASCIILabel.style.color = '#00ffff';
        
        const useASCIICheckbox = document.createElement('input');
        useASCIICheckbox.type = 'checkbox';
        useASCIICheckbox.id = 'caesar-use-asci';
        useASCIICheckbox.checked = caesarASCII;
        useASCIICheckbox.style.width = '18px';
        useASCIICheckbox.style.height = '18px';
        useASCIICheckbox.style.accentColor = '#00ffff';
        useASCIICheckbox.style.backgroundColor = '#000';
        
        useASCIGroup.appendChild(useASCIICheckbox);
        useASCIGroup.appendChild(useASCIILabel);

        sliderFieldGroup.appendChild(sliderLabel);
        sliderFieldGroup.appendChild(sliderContainer);
        sliderFieldGroup.appendChild(useASCIGroup);

        // Mode toggle field with label
        const caesarModeGroup = document.createElement('div');
        caesarModeGroup.style.display = 'flex';
        caesarModeGroup.style.flexDirection = 'column';
        caesarModeGroup.style.gap = '4px';

        const modeLabel = document.createElement('label');
        modeLabel.htmlFor = 'caesar-mode';
        modeLabel.textContent = 'Mode: ';
        styleLabel(modeLabel);

        const caesarModeSelect = document.createElement('select');
        caesarModeSelect.id = 'caesar-mode';
        caesarModeSelect.style.border = "2px solid #00ffff";
        caesarModeSelect.style.borderRadius = "5px";
        caesarModeSelect.style.padding = "5px";
        caesarModeSelect.style.color = "#00ffff";
        caesarModeSelect.style.backgroundColor = "#000000";
        caesarModeSelect.style.fontSize = "14px";
        caesarModeSelect.style.fontWeight = "bold";
        caesarModeSelect.style.width = "120px";

        const encryptOption = document.createElement('option');
        encryptOption.value = 'encrypt';
        encryptOption.textContent = 'Encrypt';
        encryptOption.selected = true;

        const decryptOption = document.createElement('option');
        decryptOption.value = 'decrypt';
        decryptOption.textContent = 'Decrypt';

        caesarModeSelect.appendChild(encryptOption);
        caesarModeSelect.appendChild(decryptOption);

        caesarModeGroup.appendChild(modeLabel);
        caesarModeGroup.appendChild(caesarModeSelect);
    
        // Assemble input group
        caesarInputGroup.appendChild(textFieldGroup);
        caesarInputGroup.appendChild(sliderFieldGroup);
        caesarInputGroup.appendChild(caesarModeGroup);
    
        // Insert elements into modal
        modalContent.insertBefore(caesarInputGroup, modalDescription.nextSibling);
        modalContent.insertBefore(caesarCanvas, caesarInputGroup.nextSibling);
    
        // Setup Babylon
        try {
            caesarBabylon = setupBabylon(caesarCanvas);
            caesarStopLoopRef = { value: false };
            
            function restartCaesarAnimation() {
                caesarStopLoopRef.value = true;
                (async () => {
                    await new Promise(r => setTimeout(r, 20));
                    caesarStopLoopRef.value = false;
                    const mode = caesarModeSelect.value;
                    if (mode === 'encrypt') {
                        if(caesarASCII){
                            runCaesarAnimationEncryptASCII(
                                caesarBabylon, 
                                parseInt(caesarShiftInput.value, 10), 
                                caesarStopLoopRef, 
                                caesarPlaintextInput.value
                            );
                        }else{
                            runCaesarAnimationEncrypt(
                                caesarBabylon, 
                                parseInt(caesarShiftInput.value, 10), 
                                caesarStopLoopRef, 
                                caesarPlaintextInput.value
                            );
                        }
                    } else {
                        if(caesarASCII){
                            runCaesarAnimationDecryptASCII(
                                caesarBabylon, 
                                parseInt(caesarShiftInput.value, 10), 
                                caesarStopLoopRef, 
                                caesarPlaintextInput.value
                            );
                        }else{
                            runCaesarAnimationDecrypt(
                                caesarBabylon, 
                                parseInt(caesarShiftInput.value, 10), 
                                caesarStopLoopRef, 
                                caesarPlaintextInput.value
                            );
                        }
                    }
                })();
            }
    
            // Start initial animation
            runCaesarAnimationEncrypt(
                caesarBabylon, 
                parseInt(caesarShiftInput.value, 10), 
                caesarStopLoopRef, 
                caesarPlaintextInput.value
            );
    
            // Input listeners
            caesarShiftInput.addEventListener('input', () => {
                caesarShiftValue.textContent = caesarShiftInput.value;
                restartCaesarAnimation();
            });

            caesarModeSelect.addEventListener('change', () => {
                // Update label text based on mode
                if (caesarModeSelect.value === 'encrypt') {
                    textLabel.textContent = 'Plaintext';
                    caesarPlaintextInput.value = 'HELLO';
                } else {
                    textLabel.textContent = 'Ciphertext';
                    caesarPlaintextInput.value = 'KHOOR';
                }
                restartCaesarAnimation();
            });
    
            caesarPlaintextInput.addEventListener('input', () => {
                // Remove non-letters and convert to uppercase
            caesarPlaintextInput.value = caesarPlaintextInput.value.replace(/[^A-Za-z]/g, '').toUpperCase();

            if (caesarPlaintextInput.value.trim() === "") {
                // If empty, stop animation and clear scene
                caesarStopLoopRef.value = true;
                const scene = caesarBabylon.scene;
                scene.meshes.slice().forEach(mesh => mesh.dispose());
                if (scene._rootLayer) scene._rootLayer.dispose();
                if (guiTexture) {
                    guiTexture.dispose();
                    guiTexture = null;
                }
                return; // Don't restart animation
            }
                restartCaesarAnimation();
            });
            useASCIICheckbox.addEventListener('change', () => {
                const sliderMax = document.getElementById('caesar-shift').max;
                caesarASCII = useASCIICheckbox.checked;
                if(caesarASCII){
                    document.getElementById('caesar-shift').max = 255;
                }else{
                    document.getElementById('caesar-shift').max = 25;
                }
                restartCaesarAnimation();
            });
    
            console.log('[Caesar] Modal should now be visible');
        } catch (e) {
            console.error('[Caesar] Error in Babylon setup:', e);
        }
    } // --- Vigenere special case ---
    else if (h2 && h2.textContent.trim().toLowerCase() === 'vigenère') {
        // Create a new canvas for Babylon
        vigCanvas = document.createElement('canvas');
        vigCanvas.width = 600;
        vigCanvas.height = 200;
        vigCanvas.style.width = '100%';
        vigCanvas.style.height = '200px';
        vigCanvas.style.display = 'block';
        vigCanvas.style.margin = '16px auto 16px auto';
        vigCanvas.className = 'vigenere-canvas';
        vigCanvas.style.outline = '2px solid #00ffff';
        vigCanvas.style.borderRadius = '5px';
        vigCanvas.style.padding = '5px';
        // Controls div
        vigControlsDiv = document.createElement('div');
        vigControlsDiv.className = 'controls';
        vigControlsDiv.style.display = 'flex';
        vigControlsDiv.style.alignItems = 'center'; 
        vigControlsDiv.style.gap = '10px';
        vigControlsDiv.style.justifyContent = 'center';
        vigControlsDiv.style.marginBottom = '10px';
        vigControlsDiv.style.marginTop = '10px';
        vigControlsDiv.style.marginBottom = '10px';
        // Keyword input group
        const inputGroup = document.createElement('div');
        inputGroup.className = 'input-group';
        inputGroup.style.display = 'flex';
        inputGroup.style.alignItems = 'left';
        inputGroup.style.gap = '10px';
        const keywordlabel = document.createElement('label');
        keywordlabel.setAttribute('for', 'vig-keyword');
        keywordlabel.textContent = 'Keyword:';
        styleLabel(keywordlabel);
        const keywordInput = document.createElement('input');
        keywordInput.type = 'text';
        keywordInput.id = 'vig-keyword';
        keywordInput.maxLength = 20;
        keywordInput.value = 'KEY';
        keywordInput.autocomplete = 'off';
        keywordInput.autocapitalize = 'characters';
        keywordInput.pattern = '[A-Za-z]*';
        styleTextbox(keywordInput);
        inputGroup.appendChild(keywordlabel);
        inputGroup.appendChild(keywordInput);
        // Plaintext input group
        const plaintextGroup = document.createElement('div');
        plaintextGroup.className = 'input-group';
        plaintextGroup.style.display = 'flex';
        plaintextGroup.style.alignItems = 'left';
        plaintextGroup.style.gap = '10px';
        const plaintextLabel = document.createElement('label');
        plaintextLabel.setAttribute('for', 'vig-plaintext');
        plaintextLabel.textContent = 'Plaintext:';
        styleLabel(plaintextLabel);
        const plaintextInput = document.createElement('input');
        plaintextInput.type = 'text';
        plaintextInput.id = 'vig-plaintext';
        plaintextInput.maxLength = 40;
        plaintextInput.value = 'HELLO';
        plaintextInput.autocomplete = 'off';
        plaintextInput.autocapitalize = 'characters';
        plaintextInput.pattern = '[A-Za-z]*';
        styleTextbox(plaintextInput);
        plaintextGroup.appendChild(plaintextLabel);
        plaintextGroup.appendChild(plaintextInput);
        // Mode toggle field with label
        const vigModeGroup = document.createElement('div');
        vigModeGroup.className = 'input-group';
        vigModeGroup.style.display = 'flex';
        vigModeGroup.style.alignItems = 'left';
        vigModeGroup.style.gap = '10px';
        const modeLabel = document.createElement('label');
        modeLabel.setAttribute('for', 'vig-mode');
        modeLabel.textContent = 'Mode:';
        styleLabel(modeLabel);
        const vigModeSelect = document.createElement('select');
        vigModeSelect.id = 'vig-mode';
        vigModeSelect.style.border = '2px solid #00ffff';
        vigModeSelect.style.borderRadius = '5px';
        vigModeSelect.style.padding = '5px';
        vigModeSelect.style.color = '#00ffff';
        vigModeSelect.style.backgroundColor = '#000000';
        vigModeSelect.style.fontSize = '14px';
        vigModeSelect.style.fontWeight = 'bold';
        vigModeSelect.style.width = '120px';
        const vigOptEnc = document.createElement('option'); vigOptEnc.value = 'encrypt'; vigOptEnc.text = 'Encrypt';
        const vigOptDec = document.createElement('option'); vigOptDec.value = 'decrypt'; vigOptDec.text = 'Decrypt';
        vigModeSelect.appendChild(vigOptEnc);
        vigModeSelect.appendChild(vigOptDec);
        vigModeGroup.appendChild(modeLabel);
        vigModeGroup.appendChild(vigModeSelect);
        vigControlsDiv.appendChild(vigModeGroup);

        // Button group
        const buttonGroup = document.createElement('div');
        buttonGroup.className = 'button-group';
        // Mode selector (Encrypt/Decrypt)
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'pauseplay-btn';
        toggleBtn.id = 'vig-toggle-btn';
        toggleBtn.textContent = 'Pause';
        buttonGroup.appendChild(toggleBtn);
        // Append groups to controls
        vigControlsDiv.appendChild(plaintextGroup);
        vigControlsDiv.appendChild(inputGroup);
        vigControlsDiv.appendChild(vigModeGroup);
        vigControlsDiv.appendChild(buttonGroup);
        // Insert controls above canvas, then canvas, then table below canvas
        modalContent.insertBefore(vigControlsDiv, modalDescription.nextSibling);
        modalContent.insertBefore(vigCanvas, vigControlsDiv.nextSibling);
        // Table div (remains below canvas)
        vigTableDiv = document.createElement('div');
        vigTableDiv.id = 'vigenere-table';
        vigTableDiv.style.margin = '0 auto 0 auto';
        vigTableDiv.style.width = 'fit-content';
        
        modalContent.insertBefore(vigTableDiv, vigCanvas.nextSibling);
        // Setup Babylon
        try {
          vigBabylon = setupBabylon(vigCanvas);
          vigStopLoopRef = { value: false };
          vigIsPlayingRef = { value: true };
          vigCurrentAnimationId++;
          // Animation function
          async function runAnimationWithTableHighlight({ scene, camera, engine }, message, keyword, mode, stopLoopRef, isPlayingRef, animationId, tableHighlightCb) {
            while (!stopLoopRef.value && animationId === vigCurrentAnimationId) {
                // Remove all meshes and GUI
                scene.meshes.slice().forEach(mesh => mesh.dispose());
                if (scene._rootLayer) scene._rootLayer.dispose();
                if (guiTexture) {
                    guiTexture.dispose();
                }
                guiTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
                const letterBoxes = [];
                const spacing = 3;
                const startX = ((message.length - 1) / 2) * spacing;
                // Prepare keyword
                const key = keyword.toUpperCase().replace(/[^A-Z]/g, 'A');
                let fullKey = '';
                let keyIndex = 0;
                for (let i = 0; i < message.length; i++) {
                    const c = message[i];
                    if (/[A-Za-z]/.test(c)) {
                        fullKey += key[keyIndex % key.length];
                        keyIndex++;
                    } else {
                        fullKey += c;
                    }
                }
                for (let i = 0; i < message.length; i++) {
                    const char = message[i];
                    const x = startX - (i * spacing);
                    const faceUV = [];
                    faceUV[0] = new BABYLON.Vector4(1, 1, 0, 0);
                    for (let j = 1; j < 6; j++) {
                        faceUV[j] = new BABYLON.Vector4(0, 0, 0, 0);
                    }
                    const box = BABYLON.MeshBuilder.CreateBox("letterBox" + i, {
                        width: 1.8,
                        height: 2.5,
                        depth: 1,
                        faceUV: faceUV
                    }, scene);
                    box.position = new BABYLON.Vector3(x, 0, 0);
                    const material = new BABYLON.StandardMaterial("letterMat" + i, scene);
                    const texture = new BABYLON.DynamicTexture("letterTexture" + i, { width: 128, height: 128 }, scene, false);
                    texture.drawText(char, null, null, "bold 48px Arial", "#2d3a4b", "#e0e7ef", true);
                    material.diffuseTexture = texture;
                    material.diffuseColor = new BABYLON.Color3.FromHexString("#00ffff");
                    material.emissiveColor = new BABYLON.Color3.FromHexString("#00ffff");
                    box.material = material;
                    letterBoxes.push({
                        mesh: box,
                        texture: texture,
                        material: material,
                        char: char,
                        originalChar: char,
                        index: i,
                        suppressAnimation: false
                    });
                }
                // Animate
                const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                const getRowStr = (kChar) => {
                    const idx = alphabet.indexOf(kChar);
                    if (idx < 0) return '';
                    return alphabet.slice(idx) + alphabet.slice(0, idx);
                };
                // Track key position only over letters to align with keyword
                let keyPos = 0;
                for (let i = 0; i < letterBoxes.length; i++) {
                    if (stopLoopRef.value || animationId !== vigCurrentAnimationId) break;
                    while (!isPlayingRef.value && !stopLoopRef.value && animationId === vigCurrentAnimationId) await new Promise(r => setTimeout(r, 50));
                    if (animationId !== vigCurrentAnimationId) break;
                    const letterBox = letterBoxes[i];
                    letterBox.suppressAnimation = true;
                    const char = letterBox.originalChar.toUpperCase();
                    const isLetter = /[A-Z]/.test(char);
                    const keyChar = fullKey[i];
                    const keyCharIndex = alphabet.indexOf(keyChar);
                    // Determine row/col for table highlight
                    if (isLetter && keyCharIndex !== -1 && typeof tableHighlightCb === 'function') {
                        const rowIdx = keyPos % keyword.length;
                        let colIdx = -1;
                        if (mode === 'decrypt') {
                            const rowStr = getRowStr(keyChar);
                            colIdx = rowStr.indexOf(char);
                        } else {
                            colIdx = alphabet.indexOf(char);
                        }
                        tableHighlightCb(colIdx, rowIdx);
                    }

                    // Animate scale and color
                    const highlightColor = BABYLON.Color3.FromHexString("#4fffff"); // Vivid Cyan
                    const normalColor = BABYLON.Color3.FromHexString("#00ffff"); // Cyan
                    const highlightEmissive = BABYLON.Color3.FromHexString("#9dfafa"); // Baby Blue
                    const normalEmissive = BABYLON.Color3.FromHexString("#00ffff"); // Cyan
                    const duration = 1000;
                    const animSteps = 30;
                    const animDelay = duration / animSteps;
                    const startScale = letterBox.mesh.scaling.clone();
                    const targetScale = new BABYLON.Vector3(1.4, 1.4, 1.4);
                    for (let t = 0; t <= animSteps; t++) {
                        if (stopLoopRef.value || animationId !== vigCurrentAnimationId) break;
                        while (!isPlayingRef.value && !stopLoopRef.value && animationId === vigCurrentAnimationId) await new Promise(r => setTimeout(r, 50));
                        if (animationId !== vigCurrentAnimationId) break;
                        const progress = t / animSteps;
                        const ease = 0.5 - 0.5 * Math.cos(Math.PI * progress);
                        letterBox.mesh.scaling = BABYLON.Vector3.Lerp(startScale, targetScale, ease);
                        letterBox.material.diffuseColor = BABYLON.Color3.Lerp(normalColor, highlightColor, ease);
                        letterBox.material.emissiveColor = BABYLON.Color3.Lerp(normalEmissive, highlightEmissive, ease);
                        await new Promise(resolve => setTimeout(resolve, animDelay));
                    }
                    letterBox.mesh.scaling = targetScale;
                    letterBox.material.diffuseColor = highlightColor;
                    letterBox.material.emissiveColor = highlightEmissive;
                    // Compute shifted letter (mode-aware)
                    const shifted = (mode === 'decrypt')
                        ? vigenereShiftDecrypt(char, keyChar)
                        : vigenereShiftEncrypt(char, keyChar);
                    letterBox.texture.clear();
                    letterBox.texture.drawText(shifted, null, null, "bold 48px Arial", "#000000", "#e0e7ef", true);
                    letterBox.char = shifted;
                    // Advance key position only when processing a letter
                    if (isLetter && keyCharIndex !== -1) {
                        keyPos++;
                    }
                    await new Promise(resolve => setTimeout(resolve, 400));
                    // Animate back to normal
                    for (let t = 0; t <= animSteps; t++) {
                        if (stopLoopRef.value || animationId !== vigCurrentAnimationId) break;
                        while (!isPlayingRef.value && !stopLoopRef.value && animationId === vigCurrentAnimationId) await new Promise(r => setTimeout(r, 50));
                        if (animationId !== vigCurrentAnimationId) break;
                        const progress = t / animSteps;
                        const ease = 0.5 - 0.5 * Math.cos(Math.PI * progress);
                        letterBox.mesh.scaling = BABYLON.Vector3.Lerp(targetScale, startScale, ease);
                        letterBox.material.diffuseColor = BABYLON.Color3.Lerp(highlightColor, normalColor, ease);
                        letterBox.material.emissiveColor = BABYLON.Color3.Lerp(highlightEmissive, normalEmissive, ease);
                        await new Promise(resolve => setTimeout(resolve, animDelay));
                    }
                    letterBox.mesh.scaling = startScale;
                    letterBox.material.diffuseColor = normalColor;
                    letterBox.material.emissiveColor = normalEmissive;
                    letterBox.suppressAnimation = false;
                    // Remove highlight after current box is done
                    if (typeof tableHighlightCb === 'function') {
                        tableHighlightCb(-1, -1);
                    }
                }
                // Reset table scroll during the end-of-cycle delay, so the next cycle starts from origin
                // Set saved scroll first so the re-render applies (0,0) immediately
                vigSavedScroll = { x: 0, y: 0 };
                if (typeof tableHighlightCb === 'function') {
                    tableHighlightCb(-1, -1);
                }
                await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second pause
                if (stopLoopRef.value || animationId !== vigCurrentAnimationId) break;
            }
          }
          // Table update function
          function updateVigenereTable(highlightCol = -1, highlightRow = -1) {
            const table = generateVigenereTableFromKeyword(keywordInput.value);
            // Apply mode as a class on the table container for CSS-based styling
            const mode = (typeof vigModeSelect !== 'undefined' && vigModeSelect) ? vigModeSelect.value : 'encrypt';
            if (vigTableDiv && vigTableDiv.classList) {
                vigTableDiv.classList.toggle('decrypt-mode', mode === 'decrypt');
                vigTableDiv.classList.toggle('encrypt-mode', mode === 'encrypt');
            }
            vigTableDiv.innerHTML = renderVigenereTable(table, highlightCol, highlightRow);
            
            // Add scroll event listeners to show/hide bubbles based on scroll position
            const scrollContainer = vigTableDiv.querySelector('div[style*="overflow"]');
            if (scrollContainer) {
                // Restore previous scroll position so subsequent scrolls start from last saved location
                if (typeof vigSavedScroll.x === 'number' && typeof vigSavedScroll.y === 'number') {
                    scrollContainer.scrollLeft = vigSavedScroll.x;
                    scrollContainer.scrollTop = vigSavedScroll.y;
                }
                // Remove existing event listeners to prevent duplicates
                scrollContainer.removeEventListener('scroll', handleTableScroll);
                
                // Add new scroll event listener
                scrollContainer.addEventListener('scroll', handleTableScroll);
                
                function handleTableScroll() {
                    const keyBubble = vigTableDiv.querySelector('#key-bubble');
                    const plaintextBubble = vigTableDiv.querySelector('#plaintext-bubble');
                    
                    const scrollLeft = scrollContainer.scrollLeft;
                    const scrollTop = scrollContainer.scrollTop;
                    // Persist current scroll
                    vigSavedScroll.x = scrollLeft;
                    vigSavedScroll.y = scrollTop;
                    
                    // Show KEY bubble only if scrolled horizontally
                    if (keyBubble) {
                        if (scrollLeft > 20) {
                            keyBubble.style.display = 'block';
                            // Let CSS handle the positioning, just ensure it's positioned relative to the container
                            const containerRect = scrollContainer.getBoundingClientRect();
                            const containerHeight = scrollContainer.clientHeight;
                            keyBubble.style.position = 'absolute';
                            keyBubble.style.left = '-40px'; // Use CSS positioning
                            keyBubble.style.top = `${containerHeight / 2}px`; // Center vertically in visible area
                            keyBubble.style.transform = 'translateY(-50%)';
                        } else {
                            keyBubble.style.display = 'none';
                        }
                    }
                    
                    // Show Plaintext bubble only if scrolled vertically
                    if (plaintextBubble) {
                        if (scrollTop > 20) {
                            plaintextBubble.style.display = 'block';
                            // Let CSS handle the positioning, just ensure it's positioned relative to the container
                            const containerRect = scrollContainer.getBoundingClientRect();
                            const containerWidth = scrollContainer.clientWidth;
                            plaintextBubble.style.position = 'absolute';
                            plaintextBubble.style.left = `${containerWidth / 2}px`; // Center horizontally in visible area
                            plaintextBubble.style.top = '-40px'; // Use CSS positioning
                            plaintextBubble.style.transform = 'translateX(-50%)';
                        } else {
                            plaintextBubble.style.display = 'none';
                        }
                    }
                }
            }
            
            // Auto-scroll to intersection if both row and column are highlighted
            if (highlightCol >= 0 && highlightRow >= 0) {
                setTimeout(() => {
                    if (scrollContainer) {
                        // Calculate scroll positions
                        const cellWidth = 28; // Width of each cell
                        const cellHeight = 40; // Height of each cell
                        const firstColWidth = 40; // Width of first column
                        
                        // Calculate the exact position of the intersection cell
                        const intersectionX = (highlightCol * cellWidth) + firstColWidth;
                        const intersectionY = (highlightRow * cellHeight);
                        
                        // Check if intersection is currently visible
                        const currentScrollX = scrollContainer.scrollLeft;
                        const currentScrollY = scrollContainer.scrollTop;
                        const containerWidth = scrollContainer.clientWidth;
                        const containerHeight = scrollContainer.clientHeight;
                        
                        // Always center the intersection horizontally
                        let targetScrollX = Math.max(0, intersectionX - containerWidth / 2 + cellWidth / 2);
                        // For the last column, ensure we scroll to the very end
                        if (highlightCol > 14) { 
                            targetScrollX = scrollContainer.scrollWidth - containerWidth;
                        } else {
                            targetScrollX = Math.min(targetScrollX, scrollContainer.scrollWidth - containerWidth);
                        }
                        
                        // Always center the intersection vertically
                        let targetScrollY = Math.max(0, intersectionY - containerHeight / 2 + cellHeight / 2);
                        targetScrollY = Math.min(targetScrollY, scrollContainer.scrollHeight - containerHeight);
                        
                        // Always scroll to center the intersection
                        scrollContainer.scrollTo({
                            left: targetScrollX,
                            top: targetScrollY,
                            behavior: 'smooth'
                        });
                        // Update saved scroll immediately; the scroll event will also update
                        vigSavedScroll.x = targetScrollX;
                        vigSavedScroll.y = targetScrollY;
                        
                        // Trigger the scroll handler to position the bubbles
                        handleTableScroll();
                    }
                }, 100); // Small delay to ensure DOM is ready
            }
          }
          function updatePlayPauseState() {
            const hasPlaintext = plaintextInput.value.trim().length > 0;
            const hasKeyword = keywordInput.value.trim().length > 0;
            if (!hasPlaintext || !hasKeyword) {
                vigIsPlayingRef.value = false;
                toggleBtn.textContent = 'Play';
            } else {
                vigIsPlayingRef.value = true;
                toggleBtn.textContent = 'Pause';
            }
          }
          // Default label for encrypt mode
          plaintextLabel.textContent = 'Plaintext:';
          updateVigenereTable();
          updatePlayPauseState();
          // Start animation
          vigCurrentAnimationId++;
          vigCurrentAnimationPromise = runAnimationWithTableHighlight(
              vigBabylon,
              plaintextInput.value,
              keywordInput.value,
              (typeof vigModeSelect !== 'undefined' && vigModeSelect) ? vigModeSelect.value : 'encrypt',
              vigStopLoopRef,
              vigIsPlayingRef,
              vigCurrentAnimationId,
              updateVigenereTable
          );
          // Event listeners
          function restartVigenereAnimation() {
            vigStopLoopRef.value = true;
            // Reset saved scroll so a full animation restart returns table to origin
            vigSavedScroll = { x: 0, y: 0 };
            (async () => {
                if (vigCurrentAnimationPromise) {
                    try { await vigCurrentAnimationPromise; } catch (e) {}
                }
                await new Promise(r => setTimeout(r, 20));
                vigStopLoopRef.value = false;
                
                updatePlayPauseState();

                const hasPlaintext = plaintextInput.value.trim().length > 0;
                const hasKeyword = keywordInput.value.trim().length > 0;

                if(!hasPlaintext || !hasKeyword){
                    updateVigenereTable(-1,-1);
                    // Dispose of all meshes and GUI so canvas is empty
                    const scene = vigBabylon.scene;
                    scene.meshes.slice().forEach(mesh => mesh.dispose());
                    if (scene._rootLayer) scene._rootLayer.dispose();
                    if (guiTexture) {
                        guiTexture.dispose();
                        guiTexture = null;
                    }
                    return;
                }

                // Immediately highlight the first letter and key
                const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                const mode = (typeof vigModeSelect !== 'undefined' && vigModeSelect) ? vigModeSelect.value : 'encrypt';
                const messageUpper = plaintextInput.value.toUpperCase();
                const key = keywordInput.value.toUpperCase().replace(/[^A-Z]/g, '');
                let fullKey = '';
                let keyIndex = 0;
                for (let i = 0; i < messageUpper.length; i++) {
                    const c = messageUpper[i];
                    if (/[A-Z]/.test(c)) {
                        fullKey += key[keyIndex % key.length] || 'A';
                        keyIndex++;
                    } else {
                        fullKey += c;
                    }
                }
                let firstCharIndex = -1, firstKeyIndex = -1;
                if (messageUpper.length > 0 && key.length > 0) {
                    // Find first position where both message char and key char are letters
                    let pos = -1;
                    let lettersSeen = 0; // count of letter positions up to pos to compute row index
                    for (let i = 0; i < messageUpper.length; i++) {
                        const mc = messageUpper[i];
                        const kc = fullKey[i];
                        if (/[A-Z]/.test(mc)) {
                            // increment lettersSeen for each letter in message
                            if (/[A-Z]/.test(kc)) {
                                pos = i;
                                break;
                            }
                            lettersSeen++;
                        }
                    }
                    if (pos !== -1) {
                        const keyChar = fullKey[pos];
                        firstKeyIndex = lettersSeen % key.length; // row index in table
                        if (mode === 'decrypt') {
                            const shift = alphabet.indexOf(keyChar);
                            const rowStr = shift >= 0 ? (alphabet.slice(shift) + alphabet.slice(0, shift)) : '';
                            firstCharIndex = rowStr.indexOf(messageUpper[pos]);
                        } else {
                            firstCharIndex = alphabet.indexOf(messageUpper[pos]);
                        }
                    }
                }
                updateVigenereTable(firstCharIndex, firstKeyIndex);
                updatePlayPauseState();
                vigCurrentAnimationId++;
                vigCurrentAnimationPromise = runAnimationWithTableHighlight(
                    vigBabylon,
                    plaintextInput.value,
                    keywordInput.value,
                    (typeof vigModeSelect !== 'undefined' && vigModeSelect) ? vigModeSelect.value : 'encrypt',
                    vigStopLoopRef,
                    vigIsPlayingRef,
                    vigCurrentAnimationId,
                    updateVigenereTable
                );
            })();
          }
          
          plaintextInput.addEventListener('input', () => {
              plaintextInput.value = plaintextInput.value.replace(/[^A-Za-z]/g, '').toUpperCase();
              restartVigenereAnimation();
          });
          
          keywordInput.addEventListener('input', () => {
              keywordInput.value = keywordInput.value.replace(/[^A-Za-z]/g, '').toUpperCase();
              restartVigenereAnimation();
          });
          // Mode selector change: update label and sample text, restart
          vigModeSelect.addEventListener('change', () => {
              if (vigModeSelect.value === 'encrypt') {
                  plaintextLabel.textContent = 'Plaintext:';
                  plaintextInput.value = 'HELLO';
              } else {
                  plaintextLabel.textContent = 'Ciphertext:';
                  plaintextInput.value = 'RIJVS';
              }
              restartVigenereAnimation();
          });
          
          toggleBtn.addEventListener('click', () => {
              if (!keywordInput.value.trim()) {
                  vigIsPlayingRef.value = false;
                  toggleBtn.textContent = 'Play';
                  return;
              }
              vigIsPlayingRef.value = !vigIsPlayingRef.value;
              toggleBtn.textContent = vigIsPlayingRef.value ? 'Pause' : 'Play';
          });
          console.log('[Vigenère] Modal should now be visible');
        } catch (e) {
          console.error('[Vigenère] Error in Babylon setup:', e);
        }
    } // --- Transposition special case ---
    else if (h2 && h2.textContent.trim().toLowerCase() === 'transposition') {
        // Create canvas for transposition visualization
        transCanvas = document.createElement('canvas');
        transCanvas.width = 800;
        transCanvas.height = 500;
        transCanvas.style.width = '100%';
        transCanvas.style.height = '350px';
        transCanvas.style.border = '2px solid #00ffff';
        transCanvas.style.borderRadius = '10px';
        transCanvas.style.backgroundColor = 'transparent';
        transCanvas.style.display = 'block';
        transCanvas.style.margin = '10px auto';
        
        // Store references globally for cleanup
        window.transCanvas = transCanvas;
        
        // Create input controls for transposition
        transInputGroup = document.createElement('div');
        transInputGroup.style.display = 'flex';
        transInputGroup.style.justifyContent = 'center';
        transInputGroup.style.gap = '20px';
        transInputGroup.style.margin = '10px 0';
        transInputGroup.style.flexWrap = 'wrap';
        
        // Store reference globally for cleanup
        window.transInputGroup = transInputGroup;
        
        // Plaintext field with label
        const textFieldGroup = document.createElement('div');
        textFieldGroup.style.display = 'flex';
        textFieldGroup.style.flexDirection = 'column';
        textFieldGroup.style.gap = '4px';
        
        const textLabel = document.createElement('label');
        textLabel.htmlFor = 'trans-plaintext';
        textLabel.textContent = 'Plaintext';
        styleLabel(textLabel);
        
        let transPlaintextInput = document.createElement('input');
        transPlaintextInput.type = 'text';
        transPlaintextInput.id = 'trans-plaintext';
        transPlaintextInput.value = 'HELLO';
        transPlaintextInput.maxLength = 20;
        transPlaintextInput.autocomplete = 'off';
        transPlaintextInput.autocapitalize = 'characters';
        transPlaintextInput.pattern = '[A-Za-z]*';
        styleTextbox(transPlaintextInput);
        
        textFieldGroup.appendChild(textLabel);
        textFieldGroup.appendChild(transPlaintextInput);
        
        // Key field with label
        const keyFieldGroup = document.createElement('div');
        keyFieldGroup.style.display = 'flex';
        keyFieldGroup.style.flexDirection = 'column';
        keyFieldGroup.style.gap = '4px';
        
        const keyLabel = document.createElement('label');
        keyLabel.htmlFor = 'trans-key';
        keyLabel.textContent = 'Key';
        styleLabel(keyLabel);
        
        let transKeyInput = document.createElement('input');
        transKeyInput.type = 'text';
        transKeyInput.id = 'trans-key';
        transKeyInput.value = 'KEY';
        transKeyInput.maxLength = 10;
        transKeyInput.autocomplete = 'off';
        transKeyInput.pattern = '[A-Za-z]*|[0-9]*';
        styleTextbox(transKeyInput);
        
        // Toggle: Pad with X
        let padWithX = true;
        const padWithXGroup = document.createElement('div');
        padWithXGroup.style.display = 'flex';
        padWithXGroup.style.flexDirection = 'row';
        padWithXGroup.style.alignItems = 'center';
        padWithXGroup.style.gap = '8px';
        
        const padWithXLabel = document.createElement('label');
        padWithXLabel.htmlFor = 'trans-pad-with-x';
        padWithXLabel.style.fontSize = '10px';
        padWithXLabel.textContent = 'Fill empty cells with "X"';
        
        const padWithXCheckbox = document.createElement('input');
        padWithXCheckbox.type = 'checkbox';
        padWithXCheckbox.id = 'trans-pad-with-x';
        padWithXCheckbox.checked = true;
        padWithXCheckbox.style.width = '18px';
        padWithXCheckbox.style.height = '18px';
        padWithXCheckbox.style.accentColor = '#00ffff';
        padWithXCheckbox.style.backgroundColor = '#000';
        
        
        padWithXGroup.appendChild(padWithXCheckbox);
        padWithXGroup.appendChild(padWithXLabel);

        keyFieldGroup.appendChild(keyLabel);
        keyFieldGroup.appendChild(transKeyInput);
        keyFieldGroup.appendChild(padWithXGroup);
        
        // Ciphertext/Plaintext display
        TextContainer = document.createElement('div');
        TextContainer.style.color = '#00ffff';
        TextContainer.style.fontFamily = 'monospace';
        TextContainer.style.fontSize = '16px';
        TextContainer.style.whiteSpace = 'pre-wrap';
        TextContainer.style.minHeight = '30px';

        const displayTextLabel = document.createElement('span');
        displayTextLabel.textContent = 'Ciphertext: ';
        
        styleLabel(displayTextLabel);
        TextContainer.appendChild(displayTextLabel);

        const displayTextValue = document.createElement('span');
        displayTextValue.id = 'display-text-value';
        displayTextValue.textContent = '';
        TextContainer.appendChild(displayTextValue);
        
        // Make displayTextLabel available for updates
        window.displayTextLabel = displayTextLabel;


        // Mode selector group
        const modeGroup = document.createElement('div');
        modeGroup.style.display = 'flex';
        modeGroup.style.flexDirection = 'column';
        modeGroup.style.gap = '4px';
        
        const modeLabel = document.createElement('label');
        modeLabel.htmlFor = 'trans-mode';
        modeLabel.textContent = 'Mode:';
        styleLabel(modeLabel);
        
        const modeSelect = document.createElement('select');
        modeSelect.id = 'trans-mode';
        modeSelect.style.border = '2px solid #00ffff';
        modeSelect.style.borderRadius = '5px';
        modeSelect.style.padding = '5px';
        modeSelect.style.color = '#00ffff';
        modeSelect.style.backgroundColor = '#000000';
        modeSelect.style.fontSize = '14px';
        modeSelect.style.fontWeight = 'bold';
        modeSelect.style.width = '120px';
        
        const encryptOption = document.createElement('option');
        encryptOption.value = 'encrypt';
        encryptOption.textContent = 'Encrypt';
        encryptOption.selected = true;
        
        const decryptOption = document.createElement('option');
        decryptOption.value = 'decrypt';
        decryptOption.textContent = 'Decrypt';
        
        modeSelect.appendChild(encryptOption);
        modeSelect.appendChild(decryptOption);
        modeGroup.appendChild(modeLabel);
        modeGroup.appendChild(modeSelect);
        
        // Update labels based on mode
        function updateTranspositionLabels() {
            if (modeSelect.value === 'encrypt') {
                textLabel.textContent = 'Plaintext:';
                displayTextLabel.textContent = 'Ciphertext: ';
                transPlaintextInput.value = 'HELLO';
            } else {
                if(padWithX){
                    textLabel.textContent = 'Ciphertext:';
                    displayTextLabel.textContent = 'Plaintext: ';
                    transPlaintextInput.value = 'EOHLLX';
                }
                else{
                    textLabel.textContent = 'Ciphertext:';
                    displayTextLabel.textContent = 'Plaintext: ';
                    transPlaintextInput.value = 'EOHLL';
                }
            }
        }
        
        modeSelect.addEventListener('change', () => {
            updateTranspositionLabels();
            // Store the function globally so it's accessible
            window.restartTranspositionAnimation = restartTranspositionAnimation;
            restartTranspositionAnimation();
        });
        
        // Assemble input group
        transInputGroup.appendChild(textFieldGroup);
        transInputGroup.appendChild(keyFieldGroup);
        transInputGroup.appendChild(modeGroup);
                
        // Insert elements into modal
        modalContent.insertBefore(transInputGroup, modalDescription.nextSibling);
        modalContent.insertBefore(TextContainer, transInputGroup.nextSibling);
        modalContent.insertBefore(transCanvas, TextContainer.nextSibling);
        
        // Initialize labels
        updateTranspositionLabels();
        
        try {
            // Babylon.js setup
            transBabylon = null;
            transGuiTexture = null;
            transCurrentAnimationId = 0;
            transStopLoopRef = { value: false };
        
            // Store references globally for cleanup
            window.transStopLoopRef = transStopLoopRef;
            const engine = new BABYLON.Engine(transCanvas, true, {preserveDrawingBuffer: true, stencil: true});
            const scene = new BABYLON.Scene(engine);
            scene.clearColor = new BABYLON.Color4(0, 0, 0, 0);
            
            const camera = new BABYLON.ArcRotateCamera(
                "camera",
                Math.PI / 2,
                Math.PI / 2,
                15,
                BABYLON.Vector3.Zero(),
                scene
            );
            camera.attachControl(transCanvas, true);
            camera.inputs.clear();
            camera.lowerRadiusLimit = 5;
            camera.upperRadiusLimit = 50;
            
            const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
            light.intensity = 0.7;
            
            engine.runRenderLoop(() => scene.render());
            window.addEventListener('resize', () => engine.resize());
            
            transBabylon = { engine, scene, camera };
            
            // Store reference globally for cleanup
            window.transBabylon = transBabylon;
            
            async function displayBoxesEncrypt({ scene, camera, engine }, message, key, stopLoopRef, animationId) {
                if (!message || !key) {
                    scene.meshes.slice().forEach(mesh => mesh.dispose());
                    if (transGuiTexture) {
                        transGuiTexture.clear();
                    }

                    const ciphertextElement = document.getElementById('display-text-value');
                    if (ciphertextElement) {
                        ciphertextElement.textContent = '';
                    }
                    return;
                }
                
                
                if (transCurrentAnimationId !== animationId) return;
                
                while (!stopLoopRef.value && transCurrentAnimationId === animationId) {
                    const ciphertextElement = document.getElementById('display-text-value');
                    if (ciphertextElement) {
                        ciphertextElement.textContent = '';
                    }
                    if (!message || !key) {
                        stopLoopRef.value = true;
                        break;
                    }
                    
                    // Clear scene
                    scene.meshes.slice().forEach(mesh => mesh.dispose());
                    if (scene._rootLayer) scene._rootLayer.dispose();
                    if (transGuiTexture) {
                        transGuiTexture.clear();
                        transGuiTexture.dispose();
                    }
                    transGuiTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
                    
                    // Store reference globally for cleanup
                    window.transGuiTexture = transGuiTexture;
                    
                    // 3D box setup
                    const spacing = 2.5;
                    // Prepare key and padded working message so visuals include X padding
                    const isKeyNumeric = /^\d+$/.test(key);
                    const cleanedKey = isKeyNumeric ? key.replace(/[^0-9]/g, '') : key.replace(/[^A-Za-z]/g, '').toUpperCase();
                    const keyLength = cleanedKey.length;
                    if (!keyLength) return;
                    const originalLen = message.length;
                    const padLenAnim = (keyLength - (originalLen % keyLength)) % keyLength;
                    const workingMessage = (padWithX && padLenAnim > 0) ? (message + 'X'.repeat(padLenAnim)) : message;
                    const totalLetters = workingMessage.length;
                    const rows = Math.ceil(totalLetters / keyLength);
                    const startX = -((totalLetters - 1) / 2) * spacing;
                    
                    // Create boxes
                    let boxes = [];
                    for (let i = 0; i < totalLetters; i++) {
                        const char = workingMessage[i];
                        const x = startX + ((totalLetters - 1 - i) * spacing);
                        const y = 0;
                        
                        const faceUV = [];
                        faceUV[0] = new BABYLON.Vector4(1, 1, 0, 0);
                        for (let j = 1; j < 6; j++) {
                            faceUV[j] = new BABYLON.Vector4(0, 0, 0, 0);
                        }
                        
                        const box = BABYLON.MeshBuilder.CreateBox(`box_${i}`, {
                            width: 1.5,
                            height: 2,
                            depth: .75,
                            faceUV: faceUV
                        }, scene);
                        box.position = new BABYLON.Vector3(x, y, 0);
                        
                        const material = new BABYLON.StandardMaterial(`mat_${i}`, scene);
                        const texture = new BABYLON.DynamicTexture(`tex_${i}`, { width: 128, height: 128 }, scene, false);
                        texture.drawText(char, null, null, "bold 36px Arial", "#4527a0", "#ede7f6", true);
                        material.diffuseTexture = texture;
                        material.diffuseColor = new BABYLON.Color3.FromHexString("#00ffff");
                        material.emissiveColor = new BABYLON.Color3.FromHexString("#00ffff");
                        box.material = material;
                        // Hide padded X boxes until placement
                        const isPad = i >= originalLen;
                        if (isPad) {
                            box.visibility = 0;
                        }
                        
                        boxes.push({ mesh: box, char: char, originalIndex: i, isPad });
                    }
                    
                    // Calculate key order
                    let keyOrder;
                    if (isKeyNumeric) {
                        keyOrder = key.split('').map((ch, i) => ({ch: parseInt(ch), i}))
                            .sort((a, b) => a.ch - b.ch || a.i - b.i)
                            .map(obj => obj.i);
                    } else {
                        keyOrder = key.split('').map((ch, i) => ({ch, i}))
                            .sort((a, b) => a.ch.localeCompare(b.ch) || a.i - b.i)
                            .map(obj => obj.i);
                    }
                    
                    // Track key labels
                    let columnsWithFirstLetter = new Set();
                    let keyLabels = [];
                    const sessionId = Date.now() + Math.random();
                    
                    if (window.existingTransKeyLabels) {
                        window.existingTransKeyLabels.forEach(label => {
                            if (label.rect) label.rect.dispose();
                            if (label.mesh) label.mesh.dispose();
                        });
                    }
                    window.existingTransKeyLabels = [];
                    
                    stopLoopRef.value = false;
                    window.currentTransSessionId = sessionId;
                    
                    if (stopLoopRef.value) return;
                    
                    // colV is the visual grid column index (0 = leftmost visually)
                    const createKeyLabelEncrypt = async (colV) => {
                        if (stopLoopRef.value) return;
                        if (window.currentTransSessionId !== sessionId) return;
                        if (columnsWithFirstLetter.has(colV)) return;
                        // Mark immediately to avoid duplicate concurrent creations
                        columnsWithFirstLetter.add(colV);
                        
                        // Label shows the key character that owns this visual column
                        const keyChar = key[(keyLength - 1) - colV];
                        // Place label above the actual visual column
                        const targetX = (colV - (keyLength - 1) / 2) * spacing;
                        const targetY = (rows - 1) / 2 + 5;
                        
                        const rect = new BABYLON.GUI.Rectangle();
                        rect.width = "50px";
                        rect.height = "40px";
                        rect.cornerRadius = 5;
                        rect.color = "#00ffff";
                        rect.thickness = 2;
                        rect.background = "black";
                        rect.alpha = 0;
                        rect.paddingLeft = "2px";
                        rect.paddingRight = "2px";
                        rect.paddingTop = "4px";
                        rect.paddingBottom = "4px";
                        
                        const textBlock = new BABYLON.GUI.TextBlock();
                        textBlock.text = keyChar;
                        textBlock.color = "#00ffff";
                        textBlock.fontSize = 20;
                        textBlock.fontWeight = "bold";
                        textBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
                        textBlock.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
                        rect.addControl(textBlock);
                        
                        // In rare cases GUI texture might have been disposed/recreated; guard it
                        if (!transGuiTexture || transGuiTexture._wasDisposed) {
                            transGuiTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
                            window.transGuiTexture = transGuiTexture;
                        }
                        transGuiTexture.addControl(rect);
                        rect.linkOffsetY = 50;
                        
                        const labelMesh = BABYLON.MeshBuilder.CreateBox(`key_label_mesh_${colV}`, {
                            width: 0.1,
                            height: 0.1,
                            depth: 0.1
                        }, scene);
                        labelMesh.position = new BABYLON.Vector3(targetX, targetY, 0);
                        labelMesh.visibility = 0;
                        
                        rect.linkWithMesh(labelMesh);
                        await fadeInRect(rect, 300);
                        
                        const labelData = { rect, textBlock, keyChar, col: colV, mesh: labelMesh };
                        keyLabels.push(labelData);
                        window.existingTransKeyLabels.push(labelData);
                    };
                    
                    // Animate to grid
                    const animateToGridEncrypt = async () => {
                        const animationDuration = 800;
                        const steps = 40;
                        const stepDelay = animationDuration / steps;
                        const delayBetweenBoxes = 200;
                        
                        let targetPositions = [];
                        for (let i = 0; i < totalLetters; i++) {
                            const row = Math.floor(i / keyLength);
                            const col = (keyLength - 1) - (i % keyLength);
                            const targetX = (col - (keyLength - 1) / 2) * spacing;
                            const targetY = (rows - 1) / 2 - row * 2.15 + 2;
                            
                            targetPositions.push({
                                index: i,
                                targetX: targetX,
                                targetY: targetY,
                                currentX: startX + ((totalLetters - 1 - i) * spacing),
                                currentY: 0
                            });
                        }
                        
                        for (let boxIndex = 0; boxIndex < totalLetters; boxIndex++) {
                            if (stopLoopRef.value) return;
                            
                            const boxData = targetPositions[boxIndex];
                            const box = boxes[boxIndex];
                            const row = Math.floor(boxIndex / keyLength);
                            const col = (keyLength - 1) - (boxIndex % keyLength);
                            
                            for (let step = 0; step <= steps; step++) {
                                if (stopLoopRef.value) return;
                                
                                const progress = step / steps;
                                const easeProgress = 0.5 - 0.5 * Math.cos(Math.PI * progress);
                                const newX = boxData.currentX + (boxData.targetX - boxData.currentX) * easeProgress;
                                const newY = boxData.currentY + (boxData.targetY - boxData.currentY) * easeProgress;
                                
                                box.mesh.position = new BABYLON.Vector3(newX, newY, 0);
                                
                                if (row === 0 && progress > 0) {
                                    // Ensure label is shown for this visual column
                                    if (!columnsWithFirstLetter.has(col)) {
                                        // fire-and-forget to avoid blocking movement
                                        createKeyLabelEncrypt(col);
                                    }
                                }
                                
                                await new Promise(resolve => setTimeout(resolve, stepDelay));
                            }
                            // When the box reaches its grid cell, reveal padded X with a short fade-in
                            if (box && box.isPad && box.mesh && box.mesh.visibility === 0) {
                                const fadeSteps = 100;
                                const fadeTotalMs = 180;
                                for (let fs = 1; fs <= fadeSteps; fs++) {
                                    if (stopLoopRef.value) return;
                                    box.mesh.visibility = fs / fadeSteps;
                                    await new Promise(r => setTimeout(r, fadeTotalMs / fadeSteps));
                                }
                                box.mesh.visibility = 1;
                            }
                            
                            if (boxIndex < totalLetters - 1) {
                                await new Promise(resolve => setTimeout(resolve, delayBetweenBoxes));
                            }
                        }
                    };
                    
                    await animateToGridEncrypt();
                    
                    // Sort columns by key
                    const sortColumnsByKeyEncrypt = async () => {
                        if (stopLoopRef.value || transCurrentAnimationId !== animationId) return;
                        
                        // Get the visual order of columns based on key labels
                        let visualOrder;
                        if (/^\d+$/.test(key)) {
                            visualOrder = Array.from({ length: keyLength }, (_, visCol) => ({
                                ch: parseInt(key[keyLength - 1 - visCol]),
                                v: visCol
                            }))
                            .sort((a, b) => b.ch - a.ch)
                            .map(o => o.v);
                        } else {
                            visualOrder = Array.from({ length: keyLength }, (_, visCol) => ({
                                ch: key[keyLength - 1 - visCol],
                                v: visCol
                            }))
                            .sort((a, b) => b.ch.localeCompare(a.ch))
                            .map(o => o.v);
                        }

                        // Calculate target X positions for each visual column
                        const targetPositions = visualOrder.map((visCol, newPos) => {
                            const targetX = (newPos - (keyLength - 1) / 2) * spacing;
                            return { visCol, targetX };
                        });

                        // Animate columns to their new positions
                        const animationDuration = 1000; // ms
                        const steps = 40;
                        const stepDelay = animationDuration / steps;
                        
                        // Store starting positions for all boxes and labels
                        const startPositions = new Map();
                        
                        // Get all key labels and their starting positions
                        const keyLabels = window.existingTransKeyLabels || [];
                        keyLabels.forEach(label => {
                            if (label.mesh) {
                                startPositions.set(`label_${label.col}`, {
                                    mesh: label.mesh,
                                    startX: label.mesh.position.x
                                });
                            }
                        });
                        
                        // Get all boxes and their starting positions
                        for (let i = 0; i < boxes.length; i++) {
                            const box = boxes[i];
                            if (box && box.mesh) {
                                const row = Math.floor(i / keyLength);
                                const visCol = (keyLength - 1) - (i % keyLength);
                                startPositions.set(`box_${row}_${visCol}`, {
                                    mesh: box.mesh,
                                    startX: box.mesh.position.x
                                });
                            }
                        }

                        for (let step = 0; step <= steps; step++) {
                            if (stopLoopRef.value || transCurrentAnimationId !== animationId) return;
                            
                            const t = step / steps;
                            const ease = 1 - Math.pow(1 - t, 3); // Ease-out cubic
                            
                            // Animate boxes and labels
                            targetPositions.forEach(({ visCol, targetX }, newPos) => {
                                // Animate all boxes in this column
                                for (let row = 0; row < rows; row++) {
                                    const key = `box_${row}_${visCol}`;
                                    const data = startPositions.get(key);
                                    if (data) {
                                        const newX = data.startX + (targetX - data.startX) * ease;
                                        data.mesh.position.x = newX;
                                    }
                                }
                                
                                // Animate the corresponding label
                                const labelKey = `label_${visCol}`;
                                const labelData = startPositions.get(labelKey);
                                if (labelData) {
                                    const newX = labelData.startX + (targetX - labelData.startX) * ease;
                                    labelData.mesh.position.x = newX;
                                }
                            });
                            
                            await new Promise(r => setTimeout(r, stepDelay));
                        }
                    };
                    
                    await sortColumnsByKeyEncrypt();
                    
                    // Highlight columns
                    const changeBoxColorsEncrypt = async () => {
                        if (stopLoopRef.value || transCurrentAnimationId !== animationId) return;
                        
                        let ciphertext = '';
                        // Update ciphertext display
                        const ciphertextElement = document.getElementById('display-text-value');
                        if (ciphertextElement) {
                            ciphertextElement.textContent = '';
                        }
                        // Determine visual column order by sorting the displayed key labels per visual column
                        let visualOrder;
                        if (/^\d+$/.test(key)) {
                            visualOrder = Array.from({ length: keyLength }, (_, visCol) => ({
                                ch: parseInt(key[(keyLength - 1) - visCol]),
                                v: visCol
                            }))
                            .sort((a, b) => a.ch - b.ch || a.v - b.v)
                            .map(o => o.v);
                        } else {
                            visualOrder = Array.from({ length: keyLength }, (_, visCol) => ({
                                ch: key[(keyLength - 1) - visCol],
                                v: visCol
                            }))
                            .sort((a, b) => a.ch.localeCompare(b.ch) || a.v - b.v)
                            .map(o => o.v);
                        }

                        for (const visCol of visualOrder) {
                            if (stopLoopRef.value || transCurrentAnimationId !== animationId) return;
                            // Convert visual column to logical index used in boxes array
                            const logicalCol = (keyLength - 1) - visCol;
                            
                            for (let row = 0; row < rows; row++) {
                                if (stopLoopRef.value || transCurrentAnimationId !== animationId) return;
                                
                                const boxIndex = row * keyLength + logicalCol;
                                if (boxIndex < totalLetters) {
                                    const box = boxes[boxIndex];
                                    if (box && box.mesh) {
                                        const highlightMaterial = new BABYLON.StandardMaterial(`highlight_mat_${boxIndex}`, scene);
                                        highlightMaterial.diffuseColor = new BABYLON.Color3.FromHexString("#9dfafa");
                                        highlightMaterial.emissiveColor = new BABYLON.Color3.FromHexString("#9dfafa");
                                        highlightMaterial.diffuseTexture = box.mesh.material.diffuseTexture;
                                        box.mesh.material = highlightMaterial;
                                        
                                        ciphertext += box.char;
                                        // Update the ciphertext display in real-time
                                        const ciphertextElement = document.getElementById('display-text-value');
                                        if (ciphertextElement) {
                                            ciphertextElement.textContent = ciphertext;
                                        }
                                        await new Promise(resolve => setTimeout(resolve, 500));
                                    }
                                }
                            }
                        }
                        
                        if (stopLoopRef.value || transCurrentAnimationId !== animationId) return;

                    };
                    
                    await changeBoxColorsEncrypt();
                    
                    if (stopLoopRef.value || transCurrentAnimationId !== animationId) return;
                    
                    for (let i = 0; i < 20; i++) {
                        if (stopLoopRef.value || transCurrentAnimationId !== animationId) return;
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                }
            }
            
            async function displayBoxesDecrypt({ scene, camera, engine }, message, key, stopLoopRef, animationId) {
                if (!message || !key) {
                    scene.meshes.slice().forEach(mesh => mesh.dispose());
                    if (transGuiTexture) {
                        transGuiTexture.clear();
                    }

                    const ciphertextElement = document.getElementById('display-text-value');
                    if (ciphertextElement) {
                        ciphertextElement.textContent = '';
                    }
                    return;
                }
                
                
                if (transCurrentAnimationId !== animationId) return;
                
                while (!stopLoopRef.value && transCurrentAnimationId === animationId) {
                    const ciphertextElement = document.getElementById('display-text-value');
                    if (ciphertextElement) {
                        ciphertextElement.textContent = '';
                    }
                    if (!message || !key) {
                        stopLoopRef.value = true;
                        break;
                    }
                    
                    // Clear scene
                    scene.meshes.slice().forEach(mesh => mesh.dispose());
                    if (scene._rootLayer) scene._rootLayer.dispose();
                    if (transGuiTexture) {
                        transGuiTexture.clear();
                        transGuiTexture.dispose();
                    }
                    transGuiTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
                    
                    // Store reference globally for cleanup
                    window.transGuiTexture = transGuiTexture;
                    
                    // 3D box setup
                    const spacing = 2.5;
                    // Prepare key and padded working message so visuals include X padding
                    const isKeyNumeric = /^\d+$/.test(key);
                    const cleanedKey = isKeyNumeric ? key.replace(/[^0-9]/g, '') : key.replace(/[^A-Za-z]/g, '').toUpperCase();
                    const keyLength = cleanedKey.length;
                    if (!keyLength) return;
                    const originalLen = message.length;
                    const padLenAnim = (keyLength - (originalLen % keyLength)) % keyLength;
                    const workingMessage = (padWithX && padLenAnim > 0) ? (message + 'X'.repeat(padLenAnim)) : message;
                    const totalLetters = workingMessage.length;
                    const rows = Math.ceil(totalLetters / keyLength);
                    const startX = -((totalLetters - 1) / 2) * spacing;
                    
                    // Create boxes
                    let boxes = [];
                    for (let i = 0; i < totalLetters; i++) {
                        const char = workingMessage[i];
                        const x = startX + ((totalLetters - 1 - i) * spacing);
                        const y = 0;
                        
                        const faceUV = [];
                        faceUV[0] = new BABYLON.Vector4(1, 1, 0, 0);
                        for (let j = 1; j < 6; j++) {
                            faceUV[j] = new BABYLON.Vector4(0, 0, 0, 0);
                        }
                        
                        const box = BABYLON.MeshBuilder.CreateBox(`box_${i}`, {
                            width: 1.5,
                            height: 2,
                            depth: .75,
                            faceUV: faceUV
                        }, scene);
                        box.position = new BABYLON.Vector3(x, y, 0);
                        
                        const material = new BABYLON.StandardMaterial(`mat_${i}`, scene);
                        const texture = new BABYLON.DynamicTexture(`tex_${i}`, { width: 128, height: 128 }, scene, false);
                        texture.drawText(char, null, null, "bold 36px Arial", "#4527a0", "#ede7f6", true);
                        material.diffuseTexture = texture;
                        material.diffuseColor = new BABYLON.Color3.FromHexString("#00ffff");
                        material.emissiveColor = new BABYLON.Color3.FromHexString("#00ffff");
                        box.material = material;
                        // Hide padded X boxes until placement
                        const isPad = i >= originalLen;
                        if (isPad) {
                            box.visibility = 0;
                        }
                        
                        boxes.push({ mesh: box, char: char, originalIndex: i, isPad });
                    }
                    
                    // Calculate key order
                    let keyOrder;
                    if (isKeyNumeric) {
                        keyOrder = key.split('').map((ch, i) => ({ch: parseInt(ch), i}))
                            .sort((a, b) => a.ch - b.ch || a.i - b.i)
                            .map(obj => obj.i);
                    } else {
                        keyOrder = key.split('').map((ch, i) => ({ch, i}))
                            .sort((a, b) => a.ch.localeCompare(b.ch) || a.i - b.i)
                            .map(obj => obj.i);
                    }
                    
                    // Track key labels
                    let columnsWithFirstLetter = new Set();
                    let keyLabels = [];
                    const sessionId = Date.now() + Math.random();
                    
                    if (window.existingTransKeyLabels) {
                        window.existingTransKeyLabels.forEach(label => {
                            if (label.rect) label.rect.dispose();
                            if (label.mesh) label.mesh.dispose();
                        });
                    }
                    window.existingTransKeyLabels = [];
                    
                    stopLoopRef.value = false;
                    window.currentTransSessionId = sessionId;
                    
                    if (stopLoopRef.value) return;
                    
                    // colV is the visual grid column index (0 = leftmost visually)
                    const createKeyLabelDecrypt = async (colV) => {
                        if (stopLoopRef.value) return;
                        if (window.currentTransSessionId !== sessionId) return;
                        if (columnsWithFirstLetter.has(colV)) return;
                        // Mark immediately to avoid duplicate concurrent creations
                        columnsWithFirstLetter.add(colV);
                        
                        // Label shows the key character that owns this visual column
                        const keyChar = key[(keyLength - 1) - colV];
                        // Place label above the actual visual column
                        const targetX = (colV - (keyLength - 1) / 2) * spacing;
                        const targetY = (rows - 1) / 2 + 5;
                        
                        const rect = new BABYLON.GUI.Rectangle();
                        rect.width = "50px";
                        rect.height = "40px";
                        rect.cornerRadius = 5;
                        rect.color = "#00ffff";
                        rect.thickness = 2;
                        rect.background = "black";
                        rect.alpha = 0;
                        rect.paddingLeft = "2px";
                        rect.paddingRight = "2px";
                        rect.paddingTop = "4px";
                        rect.paddingBottom = "4px";
                        
                        const textBlock = new BABYLON.GUI.TextBlock();
                        textBlock.text = keyChar;
                        textBlock.color = "#00ffff";
                        textBlock.fontSize = 20;
                        textBlock.fontWeight = "bold";
                        textBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
                        textBlock.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
                        rect.addControl(textBlock);
                        
                        // In rare cases GUI texture might have been disposed/recreated; guard it
                        if (!transGuiTexture || transGuiTexture._wasDisposed) {
                            transGuiTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
                            window.transGuiTexture = transGuiTexture;
                        }
                        transGuiTexture.addControl(rect);
                        rect.linkOffsetY = 50;
                        
                        const labelMesh = BABYLON.MeshBuilder.CreateBox(`key_label_mesh_${colV}`, {
                            width: 0.1,
                            height: 0.1,
                            depth: 0.1
                        }, scene);
                        labelMesh.position = new BABYLON.Vector3(targetX, targetY, 0);
                        labelMesh.visibility = 0;
                        
                        rect.linkWithMesh(labelMesh);
                        await fadeInRect(rect, 300);
                        
                        const labelData = { rect, textBlock, keyChar, col: colV, mesh: labelMesh };
                        keyLabels.push(labelData);
                        window.existingTransKeyLabels.push(labelData);
                    };
                    
                    // Animate to grid
                    const animateToGridDecrypt = async () => {
                        const animationDuration = 800;
                        const steps = 40;
                        const stepDelay = animationDuration / steps;
                        const delayBetweenBoxes = 200;
                        
                        let targetPositions = [];
                        for (let i = 0; i < totalLetters; i++) {
                            const row = Math.floor(i / keyLength);
                            const col = (keyLength - 1) - (i % keyLength);
                            const targetX = (col - (keyLength - 1) / 2) * spacing;
                            const targetY = (rows - 1) / 2 - row * 2.15 + 2;
                            
                            targetPositions.push({
                                index: i,
                                targetX: targetX,
                                targetY: targetY,
                                currentX: startX + ((totalLetters - 1 - i) * spacing),
                                currentY: 0
                            });
                        }
                        
                        for (let boxIndex = 0; boxIndex < totalLetters; boxIndex++) {
                            if (stopLoopRef.value) return;
                            
                            const boxData = targetPositions[boxIndex];
                            const box = boxes[boxIndex];
                            const row = Math.floor(boxIndex / keyLength);
                            const col = (keyLength - 1) - (boxIndex % keyLength);
                            
                            for (let step = 0; step <= steps; step++) {
                                if (stopLoopRef.value) return;
                                
                                const progress = step / steps;
                                const easeProgress = 0.5 - 0.5 * Math.cos(Math.PI * progress);
                                const newX = boxData.currentX + (boxData.targetX - boxData.currentX) * easeProgress;
                                const newY = boxData.currentY + (boxData.targetY - boxData.currentY) * easeProgress;
                                
                                box.mesh.position = new BABYLON.Vector3(newX, newY, 0);
                                
                                if (row === 0 && progress > 0) {
                                    // Ensure label is shown for this visual column
                                    if (!columnsWithFirstLetter.has(col)) {
                                        // fire-and-forget to avoid blocking movement
                                        createKeyLabelDecrypt(col);
                                    }
                                }
                                
                                await new Promise(resolve => setTimeout(resolve, stepDelay));
                            }
                            // When the box reaches its grid cell, reveal padded X with a short fade-in
                            if (box && box.isPad && box.mesh && box.mesh.visibility === 0) {
                                const fadeSteps = 100;
                                const fadeTotalMs = 180;
                                for (let fs = 1; fs <= fadeSteps; fs++) {
                                    if (stopLoopRef.value) return;
                                    box.mesh.visibility = fs / fadeSteps;
                                    await new Promise(r => setTimeout(r, fadeTotalMs / fadeSteps));
                                }
                                box.mesh.visibility = 1;
                            }
                            
                            if (boxIndex < totalLetters - 1) {
                                await new Promise(resolve => setTimeout(resolve, delayBetweenBoxes));
                            }
                        }
                    };
                    
                    await animateToGridDecrypt();
                    
                    // Sort columns by key
                    const sortColumnsByKeyDecrypt = async () => {
                        if (stopLoopRef.value || transCurrentAnimationId !== animationId) return;
                        
                        // Get the visual order of columns based on key labels
                        let visualOrder;
                        if (/^\d+$/.test(key)) {
                            visualOrder = Array.from({ length: keyLength }, (_, visCol) => ({
                                ch: parseInt(key[keyLength - 1 - visCol]),
                                v: visCol
                            }))
                            .sort((a, b) => b.ch - a.ch)
                            .map(o => o.v);
                        } else {
                            visualOrder = Array.from({ length: keyLength }, (_, visCol) => ({
                                ch: key[keyLength - 1 - visCol],
                                v: visCol
                            }))
                            .sort((a, b) => b.ch.localeCompare(a.ch))
                            .map(o => o.v);
                        }

                        // Calculate target X positions for each visual column
                        const targetPositions = visualOrder.map((visCol, newPos) => {
                            const targetX = (newPos - (keyLength - 1) / 2) * spacing;
                            return { visCol, targetX };
                        });

                        // Animate columns to their new positions
                        const animationDuration = 1000; // ms
                        const steps = 40;
                        const stepDelay = animationDuration / steps;
                        
                        // Store starting positions for all boxes and labels
                        const startPositions = new Map();
                        
                        // Get all key labels and their starting positions
                        const keyLabels = window.existingTransKeyLabels || [];
                        keyLabels.forEach(label => {
                            if (label.mesh) {
                                startPositions.set(`label_${label.col}`, {
                                    mesh: label.mesh,
                                    startX: label.mesh.position.x
                                });
                            }
                        });
                        
                        // Get all boxes and their starting positions
                        for (let i = 0; i < boxes.length; i++) {
                            const box = boxes[i];
                            if (box && box.mesh) {
                                const row = Math.floor(i / keyLength);
                                const visCol = (keyLength - 1) - (i % keyLength);
                                startPositions.set(`box_${row}_${visCol}`, {
                                    mesh: box.mesh,
                                    startX: box.mesh.position.x
                                });
                            }
                        }

                        for (let step = 0; step <= steps; step++) {
                            if (stopLoopRef.value || transCurrentAnimationId !== animationId) return;
                            
                            const t = step / steps;
                            const ease = 1 - Math.pow(1 - t, 3); // Ease-out cubic
                            
                            // Animate boxes and labels
                            targetPositions.forEach(({ visCol, targetX }, newPos) => {
                                // Animate all boxes in this column
                                for (let row = 0; row < rows; row++) {
                                    const key = `box_${row}_${visCol}`;
                                    const data = startPositions.get(key);
                                    if (data) {
                                        const newX = data.startX + (targetX - data.startX) * ease;
                                        data.mesh.position.x = newX;
                                    }
                                }
                                
                                // Animate the corresponding label
                                const labelKey = `label_${visCol}`;
                                const labelData = startPositions.get(labelKey);
                                if (labelData) {
                                    const newX = labelData.startX + (targetX - labelData.startX) * ease;
                                    labelData.mesh.position.x = newX;
                                }
                            });
                            
                            await new Promise(r => setTimeout(r, stepDelay));
                        }
                    };
                    
                    await sortColumnsByKeyDecrypt();
                    
                    // Highlight columns
                    const changeBoxColorsDecrypt = async () => {
                        if (stopLoopRef.value || transCurrentAnimationId !== animationId) return;
                        
                        let ciphertext = '';
                        // Update ciphertext display
                        const ciphertextElement = document.getElementById('display-text-value');
                        if (ciphertextElement) {
                            ciphertextElement.textContent = '';
                        }
                        // Determine visual column order by sorting the displayed key labels per visual column
                        let visualOrder;
                        if (/^\d+$/.test(key)) {
                            visualOrder = Array.from({ length: keyLength }, (_, visCol) => ({
                                ch: parseInt(key[(keyLength - 1) - visCol]),
                                v: visCol
                            }))
                            .sort((a, b) => a.ch - b.ch || a.v - b.v)
                            .map(o => o.v);
                        } else {
                            visualOrder = Array.from({ length: keyLength }, (_, visCol) => ({
                                ch: key[(keyLength - 1) - visCol],
                                v: visCol
                            }))
                            .sort((a, b) => a.ch.localeCompare(b.ch) || a.v - b.v)
                            .map(o => o.v);
                        }

                        for (const visCol of visualOrder) {
                            if (stopLoopRef.value || transCurrentAnimationId !== animationId) return;
                            // Convert visual column to logical index used in boxes array
                            const logicalCol = (keyLength - 1) - visCol;
                            
                            for (let row = 0; row < rows; row++) {
                                if (stopLoopRef.value || transCurrentAnimationId !== animationId) return;
                                
                                const boxIndex = row * keyLength + logicalCol;
                                if (boxIndex < totalLetters) {
                                    const box = boxes[boxIndex];
                                    if (box && box.mesh) {
                                        const highlightMaterial = new BABYLON.StandardMaterial(`highlight_mat_${boxIndex}`, scene);
                                        highlightMaterial.diffuseColor = new BABYLON.Color3.FromHexString("#ff0000");
                                        highlightMaterial.emissiveColor = new BABYLON.Color3.FromHexString("#ff0000");
                                        highlightMaterial.diffuseTexture = box.mesh.material.diffuseTexture;
                                        box.mesh.material = highlightMaterial;
                                        
                                        ciphertext += box.char;
                                        // Update the ciphertext display in real-time
                                        const ciphertextElement = document.getElementById('display-text-value');
                                        if (ciphertextElement) {
                                            ciphertextElement.textContent = ciphertext;
                                        }
                                        await new Promise(resolve => setTimeout(resolve, 500));
                                    }
                                }
                            }
                        }
                        
                        if (stopLoopRef.value || transCurrentAnimationId !== animationId) return;

                    };
                    
                    await changeBoxColorsDecrypt();
                    
                    if (stopLoopRef.value || transCurrentAnimationId !== animationId) return;
                    
                    for (let i = 0; i < 20; i++) {
                        if (stopLoopRef.value || transCurrentAnimationId !== animationId) return;
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }
                }
            }

            // Initial animation
            transCurrentAnimationId++;
            
            // Only run encryption if in encrypt mode
            if (modeSelect.value === 'encrypt') {
                displayBoxesEncrypt(
                    transBabylon,
                    transPlaintextInput.value,
                    transKeyInput.value,
                    transStopLoopRef,
                    transCurrentAnimationId
                );
            } else {
                displayBoxesDecrypt(
                    transBabylon,
                    transPlaintextInput.value,
                    transKeyInput.value,
                    transStopLoopRef,
                    transCurrentAnimationId
                );
            }
            
            // Input event handlers
            function restartTranspositionAnimation() {
                transStopLoopRef.value = true;
                window.currentTransSessionId = null;
                
                if (transGuiTexture) {
                    transGuiTexture.clear();
                }
                if (window.existingTransKeyLabels) {
                    window.existingTransKeyLabels.forEach(label => {
                        if (label.rect) label.rect.dispose();
                        if (label.mesh) label.mesh.dispose();
                    });
                    window.existingTransKeyLabels = [];
                }
                
                scene.meshes.slice().forEach(mesh => mesh.dispose());
                
                setTimeout(() => {
                    transStopLoopRef.value = false;
                    transCurrentAnimationId++;
                    
                    // Get current input values
                    const plaintext = transPlaintextInput.value.toUpperCase().replace(/[^A-Z]/g, '');
                    const key = transKeyInput.value.toUpperCase().replace(/[^A-Z]/g, '');
                    
                    if (modeSelect.value === 'encrypt') {
                        displayBoxesEncrypt(
                            transBabylon,
                            plaintext,
                            key,
                            transStopLoopRef,
                            transCurrentAnimationId
                        );
                    } else {
                        displayBoxesDecrypt(
                            transBabylon,
                            plaintext,
                            key,
                            transStopLoopRef,
                            transCurrentAnimationId
                        );
                    }
                }, 100);
            }
            
            transPlaintextInput.addEventListener('input', (e) => {
                let filtered = e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase();
                if (e.target.value !== filtered) {
                    e.target.value = filtered;
                }
                const ciphertextElement = document.getElementById('display-text-value');
                if (ciphertextElement) {
                    ciphertextElement.textContent = '';
                }
                restartTranspositionAnimation();
            });
            
            transKeyInput.addEventListener('input', (e) => {
                const isNumeric = /^\d*$/.test(e.target.value);
                const isAlpha = /^[a-zA-Z]*$/.test(e.target.value);
                
                if (!isNumeric && !isAlpha) {
                    e.target.value = e.target.dataset.lastValid || '';
                    return;
                }
                
                e.target.dataset.lastValid = e.target.value;
                
                if (isAlpha) {
                    e.target.value = e.target.value.toUpperCase();
                }
                
                const ciphertextElement = document.getElementById('display-text-value');
                if (ciphertextElement) {
                    ciphertextElement.textContent = '';
                }
                restartTranspositionAnimation();
            });

            padWithXCheckbox.addEventListener('change', () => {
                padWithX = padWithXCheckbox.checked;
                const ciphertextElement = document.getElementById('display-text-value');
                if (ciphertextElement) {
                    ciphertextElement.textContent = '';
                }
                // Reset the animation state when toggled
                if (window.transStopLoopRef) {
                    window.transStopLoopRef.value = true;
                }
                if (typeof restartTranspositionAnimation === 'function') {
                    restartTranspositionAnimation();
                }
            });
            
            console.log('[Transposition] Modal should now be visible');
        } catch (e) {
            console.error('[Transposition] Error in Babylon setup:', e);
        }
    }
    else {
        // Default: show modal canvas and draw
        modalCanvas.style.display = '';
        // Remove any previous caesar canvas/slider
        if (caesarCanvas && caesarCanvas.parentNode) caesarCanvas.parentNode.removeChild(caesarCanvas);
        if (caesarInputGroup && caesarInputGroup.parentNode) caesarInputGroup.parentNode.removeChild(caesarInputGroup);
        // Remove any previous Vigenère canvas/controls
        if (vigCanvas && vigCanvas.parentNode) vigCanvas.parentNode.removeChild(vigCanvas);
        if (vigControlsDiv && vigControlsDiv.parentNode) vigControlsDiv.parentNode.removeChild(vigControlsDiv);
        if (vigTableDiv && vigTableDiv.parentNode) vigTableDiv.parentNode.removeChild(vigTableDiv);
        // Remove any previous transposition canvas/controls
        if (window.transCanvas && window.transCanvas.parentNode) window.transCanvas.parentNode.removeChild(window.transCanvas);
        if (window.transInputGroup && window.transInputGroup.parentNode) window.transInputGroup.parentNode.removeChild(window.transInputGroup);
        // Clean up transposition Babylon engine
        if (window.transBabylon && window.transBabylon.engine) {
          window.transBabylon.engine.stopRenderLoop();
          window.transBabylon.engine.dispose();
          window.transBabylon = null;
        }
        // Clean up transposition GUI texture and labels
        if (window.transGuiTexture) {
          window.transGuiTexture.dispose();
          window.transGuiTexture = null;
        }
        if (window.existingTransKeyLabels) {
          window.existingTransKeyLabels.forEach(label => {
            if (label.rect) label.rect.dispose();
            if (label.mesh) label.mesh.dispose();
          });
          window.existingTransKeyLabels = [];
        }
        // Stop transposition animation
        if (window.transStopLoopRef) {
          window.transStopLoopRef.value = true;
        }
        const ctx = modalCanvas.getContext('2d');
        ctx.clearRect(0, 0, modalCanvas.width, modalCanvas.height);
        ctx.strokeStyle = '#0ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, modalCanvas.width-20, modalCanvas.height-20);
      }
      modal.style.display = 'flex';
      modalContent.style.animation = 'popIn 0.3s';
      document.body.style.overflow = 'hidden';
      console.log('[Modal] Modal display set to flex');
    });
  });

  function closeModal() {
    modalContent.style.animation = 'popOut 0.3s';
    modalContent.addEventListener('animationend', () => {
      modal.style.display = 'none';
      modalContent.style.animation = ''; // reset
      document.body.style.overflow = '';
      // Clean up Caesar Babylon engine/canvas/slider if present
      if (caesarBabylon && caesarBabylon.engine) {
        caesarBabylon.engine.stopRenderLoop();
        caesarBabylon.engine.dispose();
        caesarBabylon = null;
        caesarASCII = false;
      }
      if (caesarCanvas && caesarCanvas.parentNode) caesarCanvas.parentNode.removeChild(caesarCanvas);
      if (caesarInputGroup && caesarInputGroup.parentNode) caesarInputGroup.parentNode.removeChild(caesarInputGroup);
      // Clean up Vigenère Babylon engine/canvas/controls if present
      if (vigBabylon && vigBabylon.engine) {
        vigBabylon.engine.stopRenderLoop();
        vigBabylon.engine.dispose();
        vigBabylon = null;
      }
      if (vigCanvas && vigCanvas.parentNode) vigCanvas.parentNode.removeChild(vigCanvas);
      if (vigControlsDiv && vigControlsDiv.parentNode) vigControlsDiv.parentNode.removeChild(vigControlsDiv);
      if (vigTableDiv && vigTableDiv.parentNode) vigTableDiv.parentNode.removeChild(vigTableDiv);
      // Clean up transposition Babylon engine/canvas/controls if present
      if (window.transBabylon && window.transBabylon.engine) {
        window.transBabylon.engine.stopRenderLoop();
        window.transBabylon.engine.dispose();
        window.transBabylon = null;
      }
      if (window.transCanvas && window.transCanvas.parentNode) window.transCanvas.parentNode.removeChild(window.transCanvas);
      if (window.transInputGroup && window.transInputGroup.parentNode) window.transInputGroup.parentNode.removeChild(window.transInputGroup);
      // Clean up transposition GUI texture and labels
      if (window.transGuiTexture) {
        window.transGuiTexture.dispose();
        window.transGuiTexture = null;
      }

      if(TextContainer && TextContainer.parentNode){
        TextContainer.parentNode.removeChild(TextContainer);
        TextContainer = null;
      }

      if (window.existingTransKeyLabels) {
        window.existingTransKeyLabels.forEach(label => {
          if (label.rect) label.rect.dispose();
          if (label.mesh) label.mesh.dispose();
        });
        window.existingTransKeyLabels = [];
      }
      // Stop transposition animation
      if (window.transStopLoopRef) {
        window.transStopLoopRef.value = true;
      }
    }, { once: true });
  }

  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', function(e) {
    if (e.target === modal) closeModal();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runMain);
} else {
  runMain();
}

document.addEventListener('click', function(e) {
  console.log('[Global] Document clicked:', e.target);
});
});
