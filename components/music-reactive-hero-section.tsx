import React, { useRef, useEffect, useState, useCallback } from "react";

// Film grain generator class - PINDAH KE LUAR COMPONENT
class FilmGrain {
  width: number;
  height: number;
  grainCanvas: HTMLCanvasElement;
  grainCtx: CanvasRenderingContext2D;
  grainData: ImageData;
  frame: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.grainCanvas = document.createElement("canvas");
    this.grainCanvas.width = width;
    this.grainCanvas.height = height;
    this.grainCtx = this.grainCanvas.getContext("2d")!;
    this.grainData = this.grainCtx.createImageData(width, height);
    this.frame = 0;
    this.generateGrainPattern();
  }

  generateGrainPattern() {
    const imageData = this.grainCtx.createImageData(this.width, this.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const grain = Math.random();
      const value = grain * 255;
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
      data[i + 3] = 255;
    }

    this.grainData = imageData;
  }

  update() {
    this.frame++;

    if (this.frame % 2 === 0) {
      const data = this.grainData.data;

      for (let i = 0; i < data.length; i += 4) {
        const grain = Math.random();
        const time = this.frame * 0.01;
        const x = (i / 4) % this.width;
        const y = Math.floor(i / 4 / this.width);

        const pattern = Math.sin(x * 0.01 + time) * Math.cos(y * 0.01 - time);
        const value = (grain * 0.8 + pattern * 0.2) * 255;

        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
      }

      this.grainCtx.putImageData(this.grainData, 0, 0);
    }
  }

  apply(
    ctx: CanvasRenderingContext2D,
    intensity = 0.05,
    colorize = true,
    hue = 0
  ) {
    ctx.save();

    ctx.globalCompositeOperation = "screen";
    ctx.globalAlpha = intensity * 0.5;
    ctx.drawImage(this.grainCanvas, 0, 0);

    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = 1 - intensity * 0.3;
    ctx.drawImage(this.grainCanvas, 0, 0);

    if (colorize) {
      ctx.globalCompositeOperation = "overlay";
      ctx.globalAlpha = intensity * 0.3;
      ctx.fillStyle = `hsla(${hue}, 50%, 50%, 1)`;
      ctx.fillRect(0, 0, this.width, this.height);
    }

    ctx.restore();
  }

  resize(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.grainCanvas.width = width;
    this.grainCanvas.height = height;
    this.generateGrainPattern();
  }
}

export default function MusicReactiveHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  interface BeamState {
    bassIntensity: number;
    midIntensity: number;
    trebleIntensity: number;
    time: number;
    filmGrain: FilmGrain;
    colorState: {
      hue: number;
      targetHue: number;
      saturation: number;
      targetSaturation: number;
      lightness: number;
      targetLightness: number;
    };
    waves: Array<{
      amplitude: number;
      frequency: number;
      speed: number;
      offset: number;
      thickness: number;
      opacity: number;
    }>;
    particles: unknown[];
    bassHistory: number[];
    postProcessing: {
      filmGrainIntensity: number;
      vignetteIntensity: number;
      chromaticAberration: number;
      scanlineIntensity: number;
    };
  }

  const beamRef = useRef<BeamState | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [audioProgress, setAudioProgress] = useState(0);

  const initAudio = useCallback(() => {
    if (!audioRef.current || audioContextRef.current) return;

    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const source = audioContext.createMediaElementSource(audioRef.current);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
    } catch (error) {
      console.error("Error initializing audio:", error);
    }
  }, []);

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (beamRef.current?.filmGrain) {
        beamRef.current.filmGrain.resize(canvas.width, canvas.height);
      }
    };

    const filmGrain = new FilmGrain(window.innerWidth, window.innerHeight);

    const beam = {
      bassIntensity: 0,
      midIntensity: 0,
      trebleIntensity: 0,
      time: 0,
      filmGrain: filmGrain,
      colorState: {
        hue: 30,
        targetHue: 30,
        saturation: 80,
        targetSaturation: 80,
        lightness: 50,
        targetLightness: 50,
      },
      waves: [
        {
          amplitude: 30,
          frequency: 0.003,
          speed: 0.02,
          offset: 0,
          thickness: 1,
          opacity: 0.9,
        },
        {
          amplitude: 25,
          frequency: 0.004,
          speed: 0.015,
          offset: Math.PI * 0.5,
          thickness: 0.8,
          opacity: 0.7,
        },
        {
          amplitude: 20,
          frequency: 0.005,
          speed: 0.025,
          offset: Math.PI,
          thickness: 0.6,
          opacity: 0.5,
        },
        {
          amplitude: 35,
          frequency: 0.002,
          speed: 0.01,
          offset: Math.PI * 1.5,
          thickness: 1.2,
          opacity: 0.6,
        },
      ],
      particles: [],
      bassHistory: new Array(20).fill(0),
      postProcessing: {
        filmGrainIntensity: 0.04,
        vignetteIntensity: 0.4,
        chromaticAberration: 0.8,
        scanlineIntensity: 0.02,
      },
    };
    beamRef.current = beam;

    resizeCanvas();

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);

      ctx.fillStyle = "rgba(0, 0, 0, 0.92)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let bassAmplitude = 0;
      let midAmplitude = 0;
      let trebleAmplitude = 0;

      if (analyserRef.current && isPlaying) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);

        let bassSum = 0;
        for (let i = 0; i < 30; i++) {
          bassSum += dataArray[i];
        }
        bassAmplitude = bassSum / (30 * 255);

        let midSum = 0;
        for (let i = 30; i < 200; i++) {
          midSum += dataArray[i];
        }
        midAmplitude = midSum / (170 * 255);

        let trebleSum = 0;
        for (let i = 200; i < 800; i++) {
          trebleSum += dataArray[i];
        }
        trebleAmplitude = trebleSum / (600 * 255);

        beam.bassHistory.shift();
        beam.bassHistory.push(bassAmplitude);
        const avgBass =
          beam.bassHistory.reduce((a: number, b: number) => a + b) /
          beam.bassHistory.length;

        beam.bassIntensity = avgBass;
        beam.midIntensity = midAmplitude;
        beam.trebleIntensity = trebleAmplitude;

        if (bassAmplitude > midAmplitude && bassAmplitude > trebleAmplitude) {
          beam.colorState.targetHue = 0 + bassAmplitude * 30;
          beam.colorState.targetSaturation = 80 + bassAmplitude * 20;
          beam.colorState.targetLightness = 50 + bassAmplitude * 10;
        } else if (midAmplitude > trebleAmplitude) {
          beam.colorState.targetHue = 40 + midAmplitude * 80;
          beam.colorState.targetSaturation = 20 + midAmplitude * 30;
          beam.colorState.targetLightness = 55 + midAmplitude * 15;
        } else {
          beam.colorState.targetHue = 200 + trebleAmplitude * 80;
          beam.colorState.targetSaturation = 20 + trebleAmplitude * 40;
          beam.colorState.targetLightness = 60 + trebleAmplitude * 10;
        }

        beam.postProcessing.filmGrainIntensity = 0.03 + bassAmplitude * 0.2;
        beam.postProcessing.chromaticAberration = trebleAmplitude * 0.5;
      } else {
        beam.bassIntensity = 0.4 + Math.sin(beam.time * 0.01) * 0.3;
        beam.midIntensity = 0.3 + Math.sin(beam.time * 0.015) * 0.2;
        beam.trebleIntensity = 0.2 + Math.sin(beam.time * 0.02) * 0.1;

        beam.colorState.targetHue = 180 + Math.sin(beam.time * 0.005) * 180;
        beam.colorState.targetSaturation = 70 + Math.sin(beam.time * 0.01) * 30;
        beam.colorState.targetLightness = 50 + Math.sin(beam.time * 0.008) * 20;
      }

      beam.colorState.hue +=
        (beam.colorState.targetHue - beam.colorState.hue) * 0.5;
      beam.colorState.saturation +=
        (beam.colorState.targetSaturation - beam.colorState.saturation) * 0.2;
      beam.colorState.lightness +=
        (beam.colorState.targetLightness - beam.colorState.lightness) * 0.1;

      beam.time++;

      const centerY = canvas.height / 2;

      beam.waves.forEach((wave, waveIndex: number) => {
        wave.offset += wave.speed * (1 + beam.bassIntensity * 0.8);

        const freqInfluence =
          waveIndex < 2 ? beam.bassIntensity : beam.midIntensity;
        const dynamicAmplitude = wave.amplitude * (1 + freqInfluence * 5);

        const waveHue = beam.colorState.hue + waveIndex * 15;
        const waveSaturation = beam.colorState.saturation - waveIndex * 5;
        const waveLightness = beam.colorState.lightness + waveIndex * 5;

        const gradient = ctx.createLinearGradient(
          0,
          centerY - dynamicAmplitude,
          0,
          centerY + dynamicAmplitude
        );
        const alpha = wave.opacity * (0.5 + beam.bassIntensity * 0.5);

        gradient.addColorStop(
          0,
          `hsla(${waveHue}, ${waveSaturation}%, ${waveLightness}%, 0)`
        );
        gradient.addColorStop(
          0.5,
          `hsla(${waveHue}, ${waveSaturation}%, ${
            waveLightness + 10
          }%, ${alpha})`
        );
        gradient.addColorStop(
          1,
          `hsla(${waveHue}, ${waveSaturation}%, ${waveLightness}%, 0)`
        );

        ctx.beginPath();
        for (let x = -50; x <= canvas.width + 50; x += 2) {
          const y1 =
            Math.sin(x * wave.frequency + wave.offset) * dynamicAmplitude;
          const y2 =
            Math.sin(x * wave.frequency * 2 + wave.offset * 1.5) *
            (dynamicAmplitude * 0.3 * beam.midIntensity);
          const y3 =
            Math.sin(x * wave.frequency * 0.5 + wave.offset * 0.7) *
            (dynamicAmplitude * 0.5);
          const y = centerY + y1 + y2 + y3;

          if (x === -50) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width + 50, canvas.height);
        ctx.lineTo(-50, canvas.height);
        ctx.closePath();

        ctx.fillStyle = gradient;
        ctx.fill();
      });

      beam.filmGrain.update();
      beam.filmGrain.apply(
        ctx,
        beam.postProcessing.filmGrainIntensity,
        true,
        beam.colorState.hue
      );

      ctx.strokeStyle = `rgba(0, 0, 0, ${beam.postProcessing.scanlineIntensity})`;
      ctx.lineWidth = 1;
      for (let y = 0; y < canvas.height; y += 3) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      if (beam.postProcessing.chromaticAberration > 0.1) {
        ctx.save();
        ctx.globalCompositeOperation = "screen";
        ctx.globalAlpha = beam.postProcessing.chromaticAberration * 0.7;

        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext("2d");

        if (tempCtx) {
          tempCtx.drawImage(canvas, 0, 0);

          ctx.globalCompositeOperation = "multiply";
          ctx.fillStyle = "rgb(255, 0, 0)";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.globalCompositeOperation = "screen";
          ctx.drawImage(
            tempCanvas,
            -2 * beam.postProcessing.chromaticAberration,
            0
          );

          ctx.globalCompositeOperation = "multiply";
          ctx.fillStyle = "rgb(0, 0, 255)";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.globalCompositeOperation = "screen";
          ctx.drawImage(
            tempCanvas,
            2 * beam.postProcessing.chromaticAberration,
            0
          );
        }

        ctx.restore();
      }

      const vignette = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        canvas.width * 0.2,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width * 0.9
      );
      vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
      vignette.addColorStop(
        0.5,
        `rgba(0, 0, 0, ${beam.postProcessing.vignetteIntensity * 0.3})`
      );
      vignette.addColorStop(
        0.8,
        `rgba(0, 0, 0, ${beam.postProcessing.vignetteIntensity * 0.6})`
      );
      vignette.addColorStop(
        1,
        `rgba(0, 0, 0, ${beam.postProcessing.vignetteIntensity})`
      );
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    animate();

    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  const togglePlayback = useCallback(() => {
    if (!audioRef.current) return;

    if (!audioContextRef.current) {
      initAudio();
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      if (audioContextRef.current?.state === "suspended") {
        audioContextRef.current.resume();
      }
      audioRef.current.play().catch((error: Error) => {
        console.error("Error playing audio:", error);
      });
    }

    setIsPlaying(!isPlaying);
  }, [isPlaying, initAudio]);

  const updateProgress = useCallback(() => {
    if (audioRef.current && audioRef.current.duration) {
      const progress =
        (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setAudioProgress(progress);
    }
  }, []);

  useEffect(() => {
    const cleanup = initCanvas();
    return cleanup;
  }, [initCanvas]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleCanPlay = () => setIsLoading(false);
      const handleError = (e: Event) => {
        console.error("Audio error:", e);
        setIsLoading(false);
      };

      audio.addEventListener("canplay", handleCanPlay);
      audio.addEventListener("error", handleError);
      audio.addEventListener("timeupdate", updateProgress);

      return () => {
        audio.removeEventListener("canplay", handleCanPlay);
        audio.removeEventListener("error", handleError);
        audio.removeEventListener("timeupdate", updateProgress);
      };
    }
  }, [updateProgress]);

  return (
    <div className="w-full h-screen bg-black relative overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 pointer-events-none">
        <p className="text-sm tracking-widest mb-4 opacity-70">
          Find yourself in the space between sounds
        </p>
        <h1 className="text-6xl md:text-8xl font-bold text-center leading-tight">
          <div>THE BEAUTY OF</div>
          <div>NOISE</div>
        </h1>
        <p className="text-lg mt-6 opacity-80 max-w-2xl text-center px-4">
          When you learn to see through the invisible, you experience the
          impossible
        </p>
        <p className="text-xs mt-4 opacity-60">Music by ARTIST NAME</p>
      </div>

      <button
        className={`absolute bottom-32 left-1/2 -translate-x-1/2 z-20 px-12 py-4 text-white font-bold tracking-widest border-2 border-white transition-all ${
          isPlaying
            ? "bg-white text-black"
            : "bg-transparent hover:bg-white hover:text-black"
        } ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onClick={togglePlayback}
        disabled={isLoading}
      >
        {isLoading ? "LOADING" : isPlaying ? "STOP" : "PLAY"}
      </button>

      <div className="absolute bottom-16 left-0 right-0 h-1 bg-white/20 z-20">
        <div
          className="h-full bg-white transition-all duration-100"
          style={{ width: `${audioProgress}%` }}
        />
      </div>

      <div className="absolute top-8 right-8 text-white text-xs opacity-50 z-20">
        <span>FPS: 60</span>
      </div>

      <div className="absolute bottom-8 left-8 flex items-center gap-4 text-white z-20">
        <div className="w-12 h-12 bg-white/20 flex items-center justify-center text-xs font-bold">
          ARTST
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold">ARTIST NAME</span>
          <span className="text-xs opacity-60">@ARTIST</span>
        </div>
      </div>

      <audio
        ref={audioRef}
        src="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3"
        crossOrigin="anonymous"
        preload="auto"
      />
    </div>
  );
}
