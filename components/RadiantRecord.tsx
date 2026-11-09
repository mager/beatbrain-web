import { useEffect, useId, useRef, useState } from "react";
import { PauseIcon, PlayIcon } from "@heroicons/react/24/outline";

const vertexSource = `attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }`;
const fragmentSource = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 resolution;
uniform vec2 pointer;
uniform float time;
void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
  p -= pointer * 0.07;
  float tilt = -0.28 + pointer.x * 0.10;
  p = mat2(cos(tilt), -sin(tilt), sin(tilt), cos(tilt)) * p;
  p.y *= 1.18 + pointer.y * 0.08;
  float r = length(p);
  float a = atan(p.y, p.x);
  float t = time * 0.24;
  float wave = sin(a * 3.0 + t * 1.4 + r * 4.0) * 0.028;
  wave += sin(a * 7.0 - t + r * 11.0) * 0.010;
  float radius = r + wave * smoothstep(0.16, 0.48, r);
  float body = smoothstep(0.21, 0.28, radius) * (1.0 - smoothstep(0.76, 0.87, radius));
  float pixels = min(resolution.x, resolution.y);
  float frequency = min(245.0, pixels * 0.42);
  float sharpness = mix(4.0, 10.0, smoothstep(400.0, 850.0, pixels));
  float grooves = pow(0.5 + 0.5 * sin(radius * frequency + sin(a * 3.0 - t) * 2.0), sharpness);
  float swell = 0.7 + 0.3 * sin(a * 2.0 + radius * 12.0 - t * 1.8);
  float ribbon = exp(-pow((radius - 0.51 - 0.12 * sin(a * 2.0 + t)) * 24.0, 2.0));
  float edge = exp(-abs(radius - 0.79) * 180.0);
  float inner = exp(-abs(radius - 0.245) * 210.0);
  float sweep = pow(0.5 + 0.5 * cos(a - t * 0.65 + radius * 2.0), 5.0);
  vec3 violet = vec3(0.61, 0.28, 1.0);
  vec3 cyan = vec3(0.20, 0.91, 0.94);
  vec3 peach = vec3(1.0, 0.51, 0.33);
  vec3 color = mix(violet, cyan, smoothstep(-0.65, 0.65, sin(a + t * 0.28)));
  color = mix(color, peach, pow(0.5 + 0.5 * cos(a + 1.6 - t * 0.3), 8.0));
  float light = body * (0.035 + grooves * (0.18 + swell * 0.45 + sweep * 0.85) + ribbon * 0.26);
  light += edge * (0.32 + sweep * 0.8) + inner * 0.35;
  vec3 ink = vec3(0.06275, 0.06667, 0.07451);
  vec3 outColor = ink + color * light * 1.7;
  outColor += vec3(0.88, 0.78, 1.0) * pow(max(0.0, light - 0.65), 2.0) * 0.55;
  // A spindle of light anchors the moving grooves to a record's center.
  outColor += vec3(0.72, 0.60, 0.92) * exp(-abs(r - 0.027) * 380.0) * 0.7;
  gl_FragColor = vec4(outColor, 1.0);
}`;

/** A bounded, silent shader. Content and a still illustration survive WebGL failure. */
export default function RadiantRecord() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const area = useRef<HTMLDivElement>(null);
  const controls = useRef<{ setPaused(value: boolean): void } | null>(null);
  const [paused, setPaused] = useState(true);
  const [ready, setReady] = useState(false);
  const gradient = `record-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setPaused(preference.matches);
    change();
    preference.addEventListener("change", change);
    return () => preference.removeEventListener("change", change);
  }, []);

  useEffect(() => {
    const element = canvas.current;
    const container = area.current;
    if (!element || !container) return;
    const gl = element.getContext("webgl", { alpha: false, antialias: false, depth: false, powerPreference: "low-power" });
    if (!gl) return;
    const shaders: WebGLShader[] = [];
    const program = gl.createProgram();
    const buffer = gl.createBuffer();
    const dispose = () => {
      shaders.forEach(shader => gl.deleteShader(shader));
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
    };
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      shaders.push(shader);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
    };
    const vertex = compile(gl.VERTEX_SHADER, vertexSource);
    const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
    if (!program || !buffer || !vertex || !fragment) { dispose(); return; }
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { dispose(); return; }
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    const resolution = gl.getUniformLocation(program, "resolution");
    const clock = gl.getUniformLocation(program, "time");
    const cursor = gl.getUniformLocation(program, "pointer");
    let frame = 0, last = 0, elapsed = 5, visible = false, stopped = true, lost = false;
    let x = 0, y = 0, targetX = 0, targetY = 0;
    const draw = () => {
      if (lost) return;
      gl.viewport(0, 0, element.width, element.height);
      gl.uniform2f(resolution, element.width, element.height);
      gl.uniform1f(clock, elapsed);
      gl.uniform2f(cursor, x, y);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
    const tick = (now: number) => {
      frame = 0;
      if (stopped || !visible || document.hidden || lost) return;
      if (!last) last = now;
      if (now - last >= 1000 / 30) {
        elapsed += Math.min((now - last) / 1000, 0.1);
        last = now;
        x += (targetX - x) * 0.075;
        y += (targetY - y) * 0.075;
        draw();
      }
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = 0; last = 0;
      if (!stopped && visible && !document.hidden && !lost) frame = requestAnimationFrame(tick);
    };
    controls.current = { setPaused(value) { stopped = value; sync(); } };
    // Effects can initialize after the preference has been read.
    stopped = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const resize = () => {
      const rect = container.getBoundingClientRect();
      const scale = Math.min(devicePixelRatio || 1, 1.5, 900 / Math.max(rect.width, rect.height, 1));
      element.width = Math.max(1, Math.round(rect.width * scale));
      element.height = Math.max(1, Math.round(rect.height * scale));
      draw();
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || stopped) return;
      const rect = container.getBoundingClientRect();
      targetX = (event.clientX - rect.left) / rect.width * 2 - 1;
      targetY = 1 - (event.clientY - rect.top) / rect.height * 2;
    };
    const leave = () => { targetX = 0; targetY = 0; };
    const contextLost = (event: Event) => {
      event.preventDefault(); lost = true; sync(); setReady(false);
    };
    const observer = new IntersectionObserver(entries => { visible = entries[0].isIntersecting; sync(); });
    observer.observe(container);
    const sizing = new ResizeObserver(resize);
    sizing.observe(container);
    container.addEventListener("pointermove", move);
    container.addEventListener("pointerleave", leave);
    element.addEventListener("webglcontextlost", contextLost);
    document.addEventListener("visibilitychange", sync);
    resize(); setReady(true);
    return () => {
      controls.current = null;
      cancelAnimationFrame(frame);
      observer.disconnect(); sizing.disconnect();
      container.removeEventListener("pointermove", move);
      container.removeEventListener("pointerleave", leave);
      element.removeEventListener("webglcontextlost", contextLost);
      document.removeEventListener("visibilitychange", sync);
      dispose();
    };
  }, []);

  useEffect(() => { controls.current?.setPaused(paused); }, [paused]);

  return (
    <div className="radiant-record" ref={area}>
      <div className="radiant-record-art" role="img" aria-label="A radiant record with flowing violet, blue, and amber grooves">
        <svg className="radiant-record-still" viewBox="0 0 600 500" aria-hidden="true">
          <defs><linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#72e3e7"/><stop offset=".45" stopColor="#b380ff"/><stop offset="1" stopColor="#ffa873"/></linearGradient></defs>
          <g transform="translate(300 250) rotate(-16) scale(1 .84)" fill="none" stroke={`url(#${gradient})`}>
            {Array.from({ length: 36 }, (_, index) => <circle key={index} r={62 + index * 4.3} strokeWidth={index % 5 === 0 ? 1.6 : .7} opacity={.55 + .45 * Math.sin(index * .09) ** 2}/>)}
            <circle r="7" strokeWidth="1.5"/>
          </g>
        </svg>
        <canvas ref={canvas} className={ready ? "is-ready" : ""} aria-hidden="true" />
      </div>
      {ready && <button type="button" className="record-motion" onClick={() => setPaused(value => !value)} aria-label={paused ? "Play record animation" : "Pause record animation"}>
        {paused ? <PlayIcon width={16} aria-hidden="true"/> : <PauseIcon width={16} aria-hidden="true"/>}
        <span>{paused ? "Play" : "Pause"}</span>
      </button>}
    </div>
  );
}
