window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.mini-canvas').forEach(canvas => {
        const engine = new BABYLON.Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true});
        const scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color4(0, 0, 0, 0); // transparent

        const camera = new BABYLON.ArcRotateCamera("cam", Math.PI/4, Math.PI/4, 3, BABYLON.Vector3.Zero(), scene);
        camera.attachControl(canvas, false);
        camera.inputs.clear(); // disable drag rotation

        const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0,1,0), scene);
        light.intensity = 0.8;

        // Create a neon torus knot
        const mesh = BABYLON.MeshBuilder.CreateTorusKnot("t", {radius:0.5, tube:0.2, radialSegments:108, tubularSegments:64}, scene);
        const mat = new BABYLON.StandardMaterial("mat", scene);
        mat.emissiveColor = new BABYLON.Color3(0, 1, 1); // cyan glow
        mat.diffuseColor = new BABYLON.Color3(0, 0.2, 0.3);
        mesh.material = mat;

        // Only rotate when hovering
        let spinning = false;
        canvas.parentElement.addEventListener('mouseenter', () => spinning = true);
        canvas.parentElement.addEventListener('mouseleave', () => spinning = false);

        scene.registerBeforeRender(() => {
            if (spinning) {
                mesh.rotation.y += 0.03;
                mesh.rotation.x += 0.01;
            }
        });

        engine.runRenderLoop(() => scene.render());
        window.addEventListener('resize', () => engine.resize());
    });
});
