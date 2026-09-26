import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RotateCcw,
  Maximize2,
  Minimize2,
  Play,
  Trophy,
  Fuel,
  Zap,
  Target,
} from "lucide-react";
import { getLevel, GAME_LEVELS } from "./levels";
import "./NeuralDrive.css";

const WIDTH = 1280;
const HEIGHT = 620;
const GRAVITY = 0.52;
const DRIVE_FORCE = 0.22;
const BRAKE_FORCE = 0.16;
const AIR_TURN = 0.045;
const MAX_SPEED = 8.5;
const CAR_W = 54;
const CAR_H = 28;

const challengeColor = (type) => {
  if (type === "speed") return "#00d9ff";
  if (type === "jump") return "#a855f7";
  if (type === "brake") return "#ff3f69";
  if (type === "balance") return "#22c55e";
  if (type === "collect") return "#ffd34d";
  return "#ff7900";
};

function NeuralDrive() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const keysRef = useRef({});
  const gameRef = useRef(null);
  const [level, setLevel] = useState(1);
  const [playing, setPlaying] = useState(false);
  const [fuel, setFuel] = useState(100);
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(0);
  const [message, setMessage] = useState("");
  const [completed, setCompleted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gameSession, setGameSession] = useState(0);
  const navigate = useNavigate();

  const createGame = (levelNumber) => {
    const data = getLevel(levelNumber);
    return {
      data,
      x: 80,
      y: data.terrain[0][1] - 35,
      vx: 0,
      vy: 0,
      angle: 0,
      angularVelocity: 0,
      cameraX: 0,
      fuel: data.fuel,
      score: 0,
      coins: 0,
      elapsed: 0,
      crashed: false,
      finished: false,
      collected: new Set(),
      obstaclePhase: 0,
      challengeState: data.challenges.map((challenge) => ({
        progress: 0,
        completed: false,
        failed: false,
        lastX: 0,
        counted: false,
      })),
      lastTime: performance.now(),
    };
  };

  const resetGame = (levelNumber = level) => {
    cancelAnimationFrame(animationRef.current);
    const game = createGame(levelNumber);
    gameRef.current = game;
    setGameSession((previous) => previous + 1);
    setFuel(game.fuel);
    setScore(0);
    setCoins(0);
    setMessage("");
    setCompleted(false);
    setPlaying(true);
  };

  useEffect(() => {
    const down = (event) => {
      const key = event.key.toLowerCase();
      keysRef.current[key] = true;
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(
          event.key
        )
      ) {
        event.preventDefault();
      }
    };

    const up = (event) => {
      keysRef.current[event.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useEffect(() => {
    if (!gameRef.current) gameRef.current = createGame(level);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    };

    const terrainY = (data, worldX) => {
      const points = data.terrain;

      if (worldX <= points[0][0]) return points[0][1];
      if (worldX >= points[points.length - 1][0]) {
        return points[points.length - 1][1];
      }

      for (let i = 0; i < points.length - 1; i += 1) {
        const [x1, y1] = points[i];
        const [x2, y2] = points[i + 1];

        if (worldX >= x1 && worldX <= x2) {
          const t = (worldX - x1) / Math.max(1, x2 - x1);
          return y1 + (y2 - y1) * t;
        }
      }

      return 420;
    };

    const inGap = (data, worldX) =>
      data.gaps.some(
        (gap) => worldX >= gap.x && worldX <= gap.x + gap.width
      );

    const drawBackground = (g) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
      gradient.addColorStop(0, "#030814");
      gradient.addColorStop(0.5, "#08152a");
      gradient.addColorStop(1, "#02050b");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      const cameraX = g.cameraX;

      ctx.strokeStyle = "rgba(0,217,255,.07)";
      ctx.lineWidth = 1;

      for (let x = -((cameraX * 0.18) % 80); x < WIDTH; x += 80) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, HEIGHT);
        ctx.stroke();
      }

      for (let y = 90; y < HEIGHT; y += 70) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(WIDTH, y);
        ctx.stroke();
      }

      for (let i = 0; i < 24; i += 1) {
        const bx = i * 80 - ((cameraX * 0.28) % 80);
        const bh = 45 + ((i * 31) % 100);

        ctx.fillStyle = "rgba(13,27,48,.9)";
        ctx.fillRect(bx, 360 - bh, 58, bh);

        ctx.fillStyle = "rgba(0,217,255,.2)";
        for (let wy = 345 - bh; wy < 335; wy += 20) {
          ctx.fillRect(bx + 10, wy, 6, 7);
          ctx.fillRect(bx + 28, wy, 6, 7);
          ctx.fillRect(bx + 46, wy, 6, 7);
        }
      }

      ctx.fillStyle = "rgba(255,121,0,.15)";
      ctx.fillRect(0, 405, WIDTH, 3);
    };

    const drawChallenges = (g) => {
      const { data, cameraX } = g;

      data.challenges.forEach((challenge, index) => {
        const state = g.challengeState[index] || {};
        const color = challengeColor(challenge.type);
        const start = challenge.x;
        const end = challenge.x + challenge.width;

        ctx.fillStyle = state.completed
          ? "rgba(34,197,94,.12)"
          : "rgba(255,255,255,.025)";
        ctx.fillRect(start, 120, challenge.width, 285);

        ctx.strokeStyle = state.completed
          ? "rgba(34,197,94,.65)"
          : `${color}55`;
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 8]);
        ctx.strokeRect(start, 120, challenge.width, 285);
        ctx.setLineDash([]);

        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(start + 20, 145, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.font = "900 11px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(challenge.title, start + 34, 149);

        ctx.font = "800 9px Arial";
        ctx.fillStyle = color;
        ctx.fillText(
          state.completed
            ? "CHALLENGE COMPLETE"
            : `${challenge.type.toUpperCase()} // TARGET ${challenge.target}`,
          start + 34,
          166
        );

        ctx.fillStyle = "rgba(3,8,16,.9)";
        ctx.fillRect(start + 34, 178, Math.max(80, challenge.width - 55), 7);

        const progress = Math.min(
          1,
          Math.max(0, (state.progress || 0) / Math.max(1, challenge.target))
        );

        ctx.fillStyle = state.completed ? "#22c55e" : color;
        ctx.fillRect(
          start + 34,
          178,
          Math.max(80, challenge.width - 55) * progress,
          7
        );

        ctx.fillStyle = "#8da0b5";
        ctx.font = "700 8px Arial";
        ctx.fillText(
          `${state.completed ? challenge.reward : Math.round(progress * challenge.reward)} XP`,
          start + 34,
          202
        );

        if (g.x >= start && g.x <= end) {
          ctx.strokeStyle = color;
          ctx.lineWidth = 4;
          ctx.shadowColor = color;
          ctx.shadowBlur = 18;
          ctx.beginPath();
          ctx.moveTo(start, 118);
          ctx.lineTo(start, 408);
          ctx.moveTo(end, 118);
          ctx.lineTo(end, 408);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      });
    };

    const drawTerrain = (g) => {
      const { data, cameraX } = g;
      const points = data.terrain;

      ctx.save();
      ctx.translate(-cameraX, 0);

      ctx.beginPath();
      ctx.moveTo(points[0][0], HEIGHT);
      ctx.lineTo(points[0][0], points[0][1]);

      points.forEach(([x, y]) => ctx.lineTo(x, y));

      ctx.lineTo(points[points.length - 1][0], HEIGHT);
      ctx.closePath();

      const ground = ctx.createLinearGradient(0, 240, 0, HEIGHT);
      ground.addColorStop(0, "#193d55");
      ground.addColorStop(1, "#040911");
      ctx.fillStyle = ground;
      ctx.fill();

      ctx.strokeStyle = "#00d9ff";
      ctx.lineWidth = 4;
      ctx.shadowColor = "#00d9ff";
      ctx.shadowBlur = 12;

      ctx.beginPath();
      points.forEach(([x, y], index) => {
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();

      ctx.shadowBlur = 0;

      data.gaps.forEach((gap) => {
        ctx.fillStyle = "#010308";
        ctx.fillRect(gap.x, 405, gap.width, HEIGHT - 405);

        ctx.strokeStyle = "rgba(255,63,105,.85)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(gap.x, 410);
        ctx.lineTo(gap.x + gap.width, 410);
        ctx.stroke();

        ctx.fillStyle = "#ff3f69";
        ctx.font = "900 9px Arial";
        ctx.fillText("DANGER", gap.x + 8, 438);
      });

      drawChallenges(g);

      const finishX = data.finishX;
      const finishY = terrainY(data, finishX);

      ctx.strokeStyle = "#ff7900";
      ctx.lineWidth = 7;
      ctx.shadowColor = "#ff7900";
      ctx.shadowBlur = 22;
      ctx.beginPath();
      ctx.moveTo(finishX, finishY);
      ctx.lineTo(finishX, finishY - 135);
      ctx.stroke();

      ctx.fillStyle = "#ff7900";
      ctx.font = "900 17px Arial";
      ctx.fillText("NEURAL CORE", finishX - 52, finishY - 148);

      ctx.shadowBlur = 0;

      data.coins.forEach((coinX, index) => {
        if (g.collected.has(index)) return;

        const coinY =
          terrainY(data, coinX) -
          48 -
          Math.sin(g.elapsed * 4 + index) * 5;

        ctx.beginPath();
        ctx.arc(coinX, coinY, 10, 0, Math.PI * 2);
        ctx.fillStyle = "#ffd34d";
        ctx.shadowColor = "#ffd34d";
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = "#654500";
        ctx.font = "900 10px Arial";
        ctx.textAlign = "center";
        ctx.fillText("N", coinX, coinY + 3);
        ctx.textAlign = "left";
      });

      data.obstacles.forEach((obstacle) => {
        let ox = obstacle.x;

        if (obstacle.type === "moving") {
          const range = obstacle.maxX - obstacle.minX;
          ox =
            obstacle.minX +
            ((Math.sin(g.obstaclePhase * obstacle.speed) + 1) / 2) *
              range;
        }

        const oy =
          terrainY(data, ox) - (obstacle.size || 34);

        if (obstacle.type === "ramp") {
          ctx.fillStyle = "#ff7900";
          ctx.beginPath();
          ctx.moveTo(ox, oy + 55);
          ctx.lineTo(ox + obstacle.width, oy + 55);
          ctx.lineTo(
            ox + obstacle.width,
            oy + 55 - obstacle.height
          );
          ctx.closePath();
          ctx.fill();

          ctx.strokeStyle = "#ffd08a";
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          ctx.fillStyle =
            obstacle.type === "moving" ? "#ff3f69" : "#708399";

          ctx.beginPath();
          ctx.arc(
            ox,
            oy,
            obstacle.size || 34,
            0,
            Math.PI * 2
          );
          ctx.fill();

          ctx.strokeStyle =
            obstacle.type === "moving"
              ? "#ff9bb0"
              : "#b5c3d3";
          ctx.lineWidth = 3;
          ctx.stroke();
        }
      });

      ctx.restore();
    };

    const drawCar = (g) => {
      const screenX = g.x - g.cameraX;
      const screenY = g.y;

      ctx.save();
      ctx.translate(screenX, screenY);
      ctx.rotate(g.angle);

      ctx.shadowColor = "#ff7900";
      ctx.shadowBlur = 22;

      ctx.fillStyle = "#ff7900";
      ctx.beginPath();
      ctx.roundRect(
        -CAR_W / 2,
        -CAR_H / 2,
        CAR_W,
        CAR_H,
        8
      );
      ctx.fill();

      ctx.shadowBlur = 0;

      ctx.fillStyle = "#111a28";
      ctx.beginPath();
      ctx.moveTo(-18, -14);
      ctx.lineTo(-7, -27);
      ctx.lineTo(15, -27);
      ctx.lineTo(25, -14);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = "#72e7ff";
      ctx.beginPath();
      ctx.moveTo(-6, -23);
      ctx.lineTo(12, -23);
      ctx.lineTo(18, -15);
      ctx.lineTo(-11, -15);
      ctx.closePath();
      ctx.fill();

      [-18, 18].forEach((wheelX) => {
        ctx.fillStyle = "#05070b";
        ctx.beginPath();
        ctx.arc(wheelX, 13, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#9aa7b8";
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      ctx.fillStyle = "#fff3d7";
      ctx.fillRect(24, -7, 5, 6);

      ctx.restore();
    };

    const drawHud = (g) => {
      ctx.fillStyle = "rgba(3,8,16,.92)";
      ctx.fillRect(18, 18, 1244, 70);

      ctx.strokeStyle = "rgba(0,217,255,.3)";
      ctx.strokeRect(18, 18, 1244, 70);

      ctx.fillStyle = "#ff7900";
      ctx.font = "900 12px Arial";
      ctx.fillText(`LEVEL ${g.data.id}`, 38, 43);

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 18px Arial";
      ctx.fillText(g.data.name, 38, 67);

      ctx.fillStyle = "#00d9ff";
      ctx.font = "900 12px Arial";
      ctx.fillText(`SCORE ${Math.floor(g.score)}`, 300, 43);

      ctx.fillStyle = "#ffd34d";
      ctx.fillText(`COINS ${g.coins}`, 300, 66);

      ctx.fillStyle = "#8795a8";
      ctx.font = "700 10px Arial";
      ctx.fillText("FUEL", 470, 39);

      ctx.fillStyle = "#101925";
      ctx.fillRect(470, 50, 150, 10);

      ctx.fillStyle =
        g.fuel < 25 ? "#ff3f69" : "#22c55e";
      ctx.fillRect(
        470,
        50,
        150 * Math.max(0, g.fuel / 100),
        10
      );

      ctx.fillStyle = "#8795a8";
      ctx.fillText("PROGRESS", 680, 39);

      ctx.fillStyle = "#101925";
      ctx.fillRect(680, 50, 210, 10);

      ctx.fillStyle = "#00d9ff";
      ctx.fillRect(
        680,
        50,
        210 *
          Math.min(
            1,
            Math.max(0, g.x / g.data.finishX)
          ),
        10
      );

      ctx.fillStyle = "#ff7900";
      ctx.font = "900 12px Arial";
      ctx.fillText(
        `${Math.round(
          (g.x / g.data.finishX) * 100
        )}%`,
        905,
        59
      );

      ctx.fillStyle = "#8795a8";
      ctx.font = "700 10px Arial";
      ctx.fillText("TIME", 1040, 39);

      ctx.fillStyle = "#ffffff";
      ctx.font = "900 17px Arial";
      ctx.fillText(
        `${Math.max(
          0,
          Math.ceil(g.data.timeLimit - g.elapsed)
        )}s`,
        1040,
        65
      );
    };

    const draw = (g) => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const scaleX = canvas.width / WIDTH;
      const scaleY = canvas.height / HEIGHT;
      ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);

      drawBackground(g);
      drawTerrain(g);
      drawCar(g);
      drawHud(g);

      if (g.crashed || g.finished) {
        ctx.fillStyle = "rgba(1,4,9,.72)";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        ctx.textAlign = "center";
        ctx.fillStyle = g.finished
          ? "#00ffb3"
          : "#ff3f69";

        ctx.font = "900 42px Arial";
        ctx.fillText(
          g.finished
            ? "LEVEL COMPLETE"
            : "SYSTEM CRASH",
          WIDTH / 2,
          260
        );

        ctx.fillStyle = "#ffffff";
        ctx.font = "700 16px Arial";
        ctx.fillText(
          g.finished
            ? "Adventure route successfully completed."
            : "Vehicle integrity lost. Restart the level.",
          WIDTH / 2,
          300
        );

        ctx.textAlign = "left";
      }
    };

    const updateChallenges = (g) => {
      g.data.challenges.forEach((challenge, index) => {
        const state = g.challengeState[index];
        if (!state || state.completed || state.failed) return;

        const inside =
          g.x >= challenge.x &&
          g.x <= challenge.x + challenge.width;

        if (!inside) return;

        if (challenge.type === "speed") {
          state.progress = Math.max(
            state.progress,
            g.vx
          );
        }

        if (challenge.type === "jump") {
          if (g.vy < -2) {
            state.progress += 1;
          }
        }

        if (challenge.type === "brake") {
          if (Math.abs(g.vx) <= challenge.target) {
            state.progress += 0.04;
          }
        }

        if (challenge.type === "balance") {
          if (Math.abs(g.angle) < 0.35) {
            state.progress += 0.04;
          }
        }

        if (challenge.type === "collect") {
          state.progress = Math.min(
            challenge.target,
            g.coins
          );
        }

        if (
          state.progress >= challenge.target &&
          !state.completed
        ) {
          state.completed = true;
          g.score += challenge.reward;
          setMessage(
            `${challenge.title} COMPLETE +${challenge.reward}`
          );
        }
      });
    };

    const update = (g, dt) => {
      if (g.crashed || g.finished) return;

      const keys = keysRef.current;
      const left = keys.arrowleft || keys.a;
      const right = keys.arrowright || keys.d;
      const brake = keys.arrowdown || keys.s;
      const gas = keys.arrowup || keys.w;

      g.elapsed += dt;
      g.obstaclePhase += dt;

      if (gas && g.fuel > 0) {
        g.vx += DRIVE_FORCE * dt * 60;
        g.fuel = Math.max(
          0,
          g.fuel - 0.055 * dt * 60
        );
      }

      if (brake) {
        g.vx -= BRAKE_FORCE * dt * 60;
      }

      g.vx *= Math.pow(0.992, dt * 60);
      g.vx = Math.max(
        -3,
        Math.min(MAX_SPEED, g.vx)
      );

      g.vy += GRAVITY * dt * 60;

      if (left) {
        g.angularVelocity -= AIR_TURN * dt * 60;
      }

      if (right) {
        g.angularVelocity += AIR_TURN * dt * 60;
      }

      g.angle += g.angularVelocity * dt * 60;
      g.angularVelocity *= Math.pow(0.86, dt * 60);

      g.x += g.vx * dt * 60;
      g.y += g.vy * dt * 60;

      const wheelX = g.x;
      const groundY = terrainY(g.data, wheelX);
      const gap = inGap(g.data, wheelX);

      if (!gap && g.y >= groundY - 35) {
        g.y = groundY - 35;
        g.vy = 0;

        const ahead = terrainY(
          g.data,
          wheelX + 25
        );
        const behind = terrainY(
          g.data,
          wheelX - 25
        );

        const targetAngle = Math.atan2(
          ahead - behind,
          50
        );

        g.angle +=
          (targetAngle - g.angle) * 0.08;
      }

      if (gap && g.y > HEIGHT + 40) {
        g.crashed = true;
        setMessage("VEHICLE LOST");
        return;
      }

      if (
        Math.abs(g.angle) > Math.PI * 0.78 &&
        g.y < groundY - 20
      ) {
        g.crashed = true;
        setMessage("CRITICAL FLIP");
        return;
      }

      g.data.coins.forEach((coinX, index) => {
        if (g.collected.has(index)) return;

        const coinY =
          terrainY(g.data, coinX) - 48;

        if (
          Math.hypot(
            g.x - coinX,
            g.y - coinY
          ) < 48
        ) {
          g.collected.add(index);
          g.coins += 1;
          g.score += 100;
        }
      });

      g.data.obstacles.forEach((obstacle) => {
        let ox = obstacle.x;

        if (obstacle.type === "moving") {
          const range =
            obstacle.maxX - obstacle.minX;

          ox =
            obstacle.minX +
            ((Math.sin(
              g.obstaclePhase * obstacle.speed
            ) +
              1) /
              2) *
              range;
        }

        const oy =
          terrainY(g.data, ox) -
          (obstacle.size || 34);

        if (
          Math.hypot(
            g.x - ox,
            g.y - oy
          ) <
          (obstacle.size || 34) + 24
        ) {
          g.vx *= -0.35;
          g.vy = -5;
          g.score = Math.max(
            0,
            g.score - 25
          );
        }
      });

      updateChallenges(g);

      g.score +=
        Math.max(0, g.vx) * dt * 2;

      g.cameraX +=
        ((g.x - WIDTH * 0.35) -
          g.cameraX) *
        0.08;

      g.cameraX = Math.max(
        0,
        Math.min(
          Math.max(
            0,
            g.data.finishX - WIDTH
          ),
          g.cameraX
        )
      );

      if (g.x >= g.data.finishX) {
        g.finished = true;

        g.score +=
          Math.max(
            0,
            Math.ceil(
              g.data.timeLimit -
                g.elapsed
            )
          ) * 10;

        setScore(Math.floor(g.score));
        setCoins(g.coins);
        setFuel(Math.round(g.fuel));
        setCompleted(true);
        setMessage("LEVEL COMPLETE");
      }

      if (
        g.elapsed >=
          g.data.timeLimit ||
        g.fuel <= 0
      ) {
        g.crashed = true;
        setMessage(
          g.fuel <= 0
            ? "FUEL DEPLETED"
            : "TIME EXPIRED"
        );
      }

      setFuel(Math.round(g.fuel));
      setScore(Math.floor(g.score));
      setCoins(g.coins);
    };

    resize();
    window.addEventListener("resize", resize);

    const loop = (now) => {
      const g = gameRef.current;
      if (!g) return;

      if (playing) {
        const dt = Math.min(
          0.033,
          Math.max(
            0.001,
            (now - g.lastTime) / 1000
          )
        );

        g.lastTime = now;
        update(g, dt);
      }

      draw(g);

      if (playing) {
        animationRef.current =
          requestAnimationFrame(loop);
      }
    };

    draw(gameRef.current);

    if (playing) {
      gameRef.current.lastTime =
        performance.now();
      animationRef.current =
        requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(
        animationRef.current
      );
      window.removeEventListener(
        "resize",
        resize
      );
    };
  }, [playing, level, gameSession]);

  useEffect(() => {
    if (!gameRef.current) {
      gameRef.current = createGame(level);
    }

    const onFullscreen = () => {
      setIsFullscreen(
        Boolean(document.fullscreenElement)
      );
    };

    document.addEventListener(
      "fullscreenchange",
      onFullscreen
    );

    return () =>
      document.removeEventListener(
        "fullscreenchange",
        onFullscreen
      );
  }, [level]);

  useEffect(() => {
    return () =>
      cancelAnimationFrame(
        animationRef.current
      );
  }, []);

  const control = (key, value) => {
    keysRef.current[key] = value;
  };

  const nextLevel = () => {
    if (level >= GAME_LEVELS.length) {
      setPlaying(false);
      setMessage("ALL LEVELS COMPLETE");
      return;
    }

    const next = level + 1;
    setLevel(next);
    resetGame(next);
  };

  const fullscreen = async () => {
    const element =
      canvasRef.current?.parentElement;

    if (!document.fullscreenElement) {
      await element?.requestFullscreen?.();
    } else {
      await document.exitFullscreen?.();
    }
  };

  return (
    <div className="neural-drive-page">
      <div className="neural-drive-shell">
        <header className="neural-drive-header">
          <button
            className="nd-icon-btn"
            onClick={() => navigate("/games")}
            title="Back"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <div className="nd-kicker">
              NEURAL ARCADE // ADVENTURE PHYSICS SYSTEM
            </div>

            <h1>NEURAL DRIVE</h1>

            <p>
              EXPLORE. SURVIVE. MASTER EVERY ADVENTURE.
            </p>
          </div>

          <div className="nd-header-actions">
            <div className="nd-level-badge">
              LEVEL {level}/10
            </div>

            <button
              className="nd-icon-btn"
              onClick={fullscreen}
              title={
                isFullscreen
                  ? "Exit fullscreen"
                  : "Fullscreen"
              }
            >
              {isFullscreen ? (
                <Minimize2 size={18} />
              ) : (
                <Maximize2 size={18} />
              )}
            </button>
          </div>
        </header>

        <section className="nd-game-card">
          <div className="nd-canvas-wrap">
            <canvas ref={canvasRef} />

            {!playing && !completed && (
              <div className="nd-start-overlay">
                <div className="nd-start-panel">
                  <div className="nd-start-core">
                    <Zap size={26} />
                  </div>

                  <span>
                    ADVENTURE SYSTEM // ONLINE
                  </span>

                  <h2>
                    {getLevel(level).name}
                  </h2>

                  <p>
                    Drive through the adventure,
                    overcome challenges, collect
                    neural coins and reach the
                    glowing Neural Core.
                  </p>

                  <div className="nd-start-meta">
                    <span>
                      <Target size={14} />
                      {getLevel(level).challenges.length}{" "}
                      CHALLENGES
                    </span>
                    <span>
                      <Fuel size={14} />
                      {getLevel(level).fuel}% FUEL
                    </span>
                    <span>
                      <Trophy size={14} />
                      {getLevel(level).difficulty}
                    </span>
                  </div>

                  <button
                    className="nd-primary-btn"
                    onClick={() =>
                      resetGame(level)
                    }
                  >
                    <Play size={17} />
                    START ADVENTURE
                  </button>
                </div>
              </div>
            )}

            {completed && (
              <div className="nd-result-overlay">
                <div className="nd-result-panel">
                  <Trophy size={42} />

                  <span>
                    ADVENTURE COMPLETE
                  </span>

                  <h2>
                    {level === 10
                      ? "CORE MASTERED"
                      : "LEVEL CLEARED"}
                  </h2>

                  <div className="nd-result-stats">
                    <div>
                      <b>{score}</b>
                      <small>SCORE</small>
                    </div>

                    <div>
                      <b>{coins}</b>
                      <small>COINS</small>
                    </div>

                    <div>
                      <b>{fuel}%</b>
                      <small>FUEL</small>
                    </div>
                  </div>

                  {level < 10 ? (
                    <button
                      className="nd-primary-btn"
                      onClick={nextLevel}
                    >
                      NEXT ADVENTURE →
                    </button>
                  ) : (
                    <button
                      className="nd-primary-btn"
                      onClick={() =>
                        resetGame(1)
                      }
                    >
                      PLAY AGAIN
                    </button>
                  )}
                </div>
              </div>
            )}

            {playing &&
              gameRef.current?.crashed && (
                <div className="nd-result-overlay">
                  <div className="nd-result-panel crash">
                    <span>
                      ADVENTURE FAILED
                    </span>

                    <h2>
                      {message ||
                        "VEHICLE CRASHED"}
                    </h2>

                    <p>
                      Control your speed,
                      balance the vehicle and
                      manage your fuel.
                    </p>

                    <button
                      className="nd-primary-btn"
                      onClick={() =>
                        resetGame(level)
                      }
                    >
                      <RotateCcw size={17} />
                      RETRY ADVENTURE
                    </button>
                  </div>
                </div>
              )}
          </div>

          <div className="nd-controls">
            <div className="nd-control-copy">
              <strong>CONTROLS</strong>
              <span>W / ↑ ACCELERATE</span>
              <span>S / ↓ BRAKE</span>
              <span>A / ← TILT LEFT</span>
              <span>D / → TILT RIGHT</span>
            </div>

            <div className="nd-touch-controls">
              <button
                onPointerDown={() =>
                  control("arrowleft", true)
                }
                onPointerUp={() =>
                  control("arrowleft", false)
                }
                onPointerLeave={() =>
                  control("arrowleft", false)
                }
              >
                ←
              </button>

              <button
                className="gas"
                onPointerDown={() =>
                  control("arrowup", true)
                }
                onPointerUp={() =>
                  control("arrowup", false)
                }
                onPointerLeave={() =>
                  control("arrowup", false)
                }
              >
                ↑
              </button>

              <button
                onPointerDown={() =>
                  control("arrowright", true)
                }
                onPointerUp={() =>
                  control("arrowright", false)
                }
                onPointerLeave={() =>
                  control("arrowright", false)
                }
              >
                →
              </button>
            </div>

            <button
              className="nd-reset-btn"
              onClick={() =>
                resetGame(level)
              }
            >
              <RotateCcw size={16} />
              RESET
            </button>
          </div>
        </section>

        <section className="nd-level-strip">
          {GAME_LEVELS.map((item) => (
            <button
              key={item.id}
              className={
                item.id === level
                  ? "active"
                  : ""
              }
              onClick={() => {
                setLevel(item.id);
                setTimeout(
                  () => resetGame(item.id),
                  0
                );
              }}
            >
              <span>
                {String(item.id).padStart(
                  2,
                  "0"
                )}
              </span>

              <small>{item.name}</small>

              <em>
                {item.challenges.length}{" "}
                CHALLENGES
              </em>
            </button>
          ))}
        </section>

        <section className="nd-info-grid">
          <div>
            <Fuel size={18} />

            <div>
              <strong>
                ADVENTURE FUEL
              </strong>

              <span>
                Use acceleration carefully.
                Every adventure has limited
                fuel.
              </span>
            </div>
          </div>

          <div>
            <Target size={18} />

            <div>
              <strong>
                MID-TRACK CHALLENGES
              </strong>

              <span>
                Speed, jump, brake, balance
                and collection challenges
                award bonus score.
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default NeuralDrive;
