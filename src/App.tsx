import "./App.css";
import * as THREE from "three";
import skyImg from "./assets/sky.jpg";

console.log(skyImg);
const scene = new THREE.Scene();

// const gridHelper = new THREE.GridHelper(10, 10, "green", "blue");

// scene.add(gridHelper);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const loader = new THREE.TextureLoader();
const texture = loader.load(skyImg, () => {
  const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
  rt.fromEquirectangularTexture(renderer, texture);
  scene.background = rt.texture;
});

const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry();

const material = new THREE.MeshPhysicalMaterial({
  color: "#B5B3B5",
  roughness: 0,
  metalness: 0,
});

const dirLight = new THREE.DirectionalLight(0xffffff, 1);

dirLight.position.set(-10, -5, 10);

const hemiLight = new THREE.HemisphereLight(0xffffff, "#57524B");

const lightHolder = new THREE.Group();

lightHolder.add(hemiLight);

lightHolder.add(dirLight);

scene.add(lightHolder);

const cube = new THREE.Mesh(geometry, material);

cube.position.set(0, 0.5, -10);

scene.add(cube);

window.addEventListener("resize", onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  render();
}

/* Liner Interpolation
 * lerp(min, max, ratio)
 * eg,
 * lerp(20, 60, .5)) = 40
 * lerp(-20, 60, .5)) = 20
 * lerp(20, 60, .75)) = 50
 * lerp(-20, -10, .1)) = -.19
 */
function lerp(x: number, y: number, a: number): number {
  return (1 - a) * x + a * y;
}

// Used to fit the lerps to start and end at specific scrolling percentages
function scalePercent(start: number, end: number) {
  return (scrollPercent - start) / (end - start);
}

const animationScripts: { start: number; end: number; func: () => void }[] = [];

//add an animation that moves the cube through first 40 percent of scroll
animationScripts.push({
  start: 0,
  end: 40,
  func: () => {
    camera.lookAt(cube.position);
    camera.position.set(0, 1, 2);
    cube.position.z = lerp(-10, 0, scalePercent(0, 40));
    //console.log(cube.position.z)
  },
});

//add an animation that rotates the cube between 40-60 percent of scroll
animationScripts.push({
  start: 40,
  end: 60,
  func: () => {
    camera.lookAt(cube.position);
    camera.position.set(0, 1, 2);
    cube.rotation.z = lerp(0, Math.PI, scalePercent(40, 60));
    //console.log(cube.rotation.z)
  },
});

//add an animation that moves the camera between 60-80 percent of scroll
animationScripts.push({
  start: 60,
  end: 80,
  func: () => {
    camera.position.x = lerp(0, 5, scalePercent(60, 80));
    camera.position.y = lerp(1, 5, scalePercent(60, 80));
    camera.lookAt(cube.position);
    //console.log(camera.position.x + " " + camera.position.y)
  },
});

//add an animation that auto rotates the cube from 80 percent of scroll
animationScripts.push({
  start: 80,
  end: 101,
  func: () => {
    //auto rotate
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
  },
});

function playScrollAnimations() {
  animationScripts.forEach((a) => {
    if (scrollPercent >= a.start && scrollPercent < a.end) {
      a.func();
    }
  });
}

let scrollPercent = 0;

document.body.onscroll = () => {
  //calculate the current scroll progress as a percentage
  scrollPercent =
    ((document.documentElement.scrollTop || document.body.scrollTop) /
      ((document.documentElement.scrollHeight || document.body.scrollHeight) -
        document.documentElement.clientHeight)) *
    100;
  (document.getElementById("scrollProgress") as HTMLDivElement).innerText =
    "Scroll Progress : " + scrollPercent.toFixed(2);
};

function animate() {
  requestAnimationFrame(animate);

  playScrollAnimations();

  render();
}

function render() {
  renderer.render(scene, camera);
}

window.scrollTo({ top: 0, behavior: "smooth" });
animate();
function App() {
  return (
    <div className="App">
      <span id="scrollProgress"></span>
      <main>
        <h1>Animate on Scroll</h1>
        <section>
          <h2>Begin scrolling to see things change</h2>
        </section>
        <section>
          <h2>Changing Objects Position</h2>
          <p>The cube's position is now changing</p>
        </section>

        <section>
          <h2>Changing Objects Rotation</h2>
          <p>The cube's rotation is now changing</p>
        </section>

        <section>
          <h2>Changing Camera Position</h2>
          <p>The camera position is now changing</p>
        </section>

        <section>
          <h2>You are at the bottom</h2>
          <p>The cube will now be auto rotating</p>
          <p>Now you can scroll back to the top to reverse the animation</p>
        </section>
      </main>
    </div>
  );
}

export default App;
