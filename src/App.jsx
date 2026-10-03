import { useEffect, useRef, useState } from 'react';

const HORSE_ANIMATION_FRAMES = [
  '/assets/3903.png',
  '/assets/3905.png',
  '/assets/3906.png',
  '/assets/3907.png',
];

const GAME_WIDTH = 900;
const GAME_HEIGHT = 480;
const HORSE_X = 160;
const HORSE_Y_BASE = 270;
const HORSE_WIDTH = 270;
const HORSE_HEIGHT = 180;
const GROUND_Y = 350;
const GRAVITY = 0.7;
const JUMP_STRENGTH = 15;
const BASE_SPEED = 6;

function drawHorseFallback(ctx, x, y) {
  ctx.save();
  ctx.translate(x, y);

  // Body
  ctx.fillStyle = '#d9bf87';
  ctx.fillRect(30, 45, 170, 80);

  // Neck and head
  ctx.fillRect(185, 55, 55, 26);
  ctx.fillRect(235, 40, 32, 26);

  // Legs
  ctx.fillStyle = '#b88a4a';
  ctx.fillRect(48, 125, 18, 42);
  ctx.fillRect(88, 125, 18, 42);
  ctx.fillRect(138, 125, 18, 42);
  ctx.fillRect(178, 125, 18, 42);

  // Mane and eye
  ctx.fillStyle = '#4b2d17';
  ctx.fillRect(190, 32, 8, 24);
  ctx.fillRect(200, 26, 8, 20);
  ctx.fillRect(210, 24, 8, 18);
  ctx.fillStyle = '#111827';
  ctx.fillRect(246, 50, 5, 5);

  // Tail
  ctx.fillStyle = '#b88a4a';
  ctx.fillRect(20, 68, 18, 12);

  ctx.restore();
}

function App() {
  const canvasRef = useRef(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);
  const [gameState, setGameState] = useState({
    running: false,
    gameOver: false,
    score: 0,
    bestScore: 0,
    playerY: HORSE_Y_BASE,
    velocityY: 0,
    obstacles: [],
  });

  const imageRefs = useRef({});
  const frameCounterRef = useRef(0);
  const animationFrameRef = useRef(null);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    const images = {};
    let loaded = 0;
    const total = HORSE_ANIMATION_FRAMES.length;

    if (total === 0) {
      setImagesLoaded(true);
      return;
    }

    HORSE_ANIMATION_FRAMES.forEach((src) => {
      const img = new Image();
      img.onload = () => {
        images[src] = img;
        loaded += 1;
        if (loaded === total) {
          imageRefs.current = images;
          setImagesLoaded(true);
        }
      };
      img.onerror = () => {
        loaded += 1;
        if (loaded === total) {
          imageRefs.current = {};
          setImagesLoaded(true);
        }
      };
      img.src = src;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === 'Space' || event.code === 'ArrowUp') {
        event.preventDefault();
        handleJump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.running, gameState.gameOver]);

  const handleJump = () => {
    setGameState((prev) => {
      if (prev.gameOver) {
        return {
          running: false,
          gameOver: false,
          score: 0,
          bestScore: prev.bestScore,
          playerY: HORSE_Y_BASE,
          velocityY: 0,
          obstacles: [],
        };
      }

      if (!prev.running) {
        return {
          ...prev,
          running: true,
          gameOver: false,
          playerY: HORSE_Y_BASE,
          velocityY: -JUMP_STRENGTH,
        };
      }

      if (prev.playerY >= HORSE_Y_BASE - 5) {
        return {
          ...prev,
          velocityY: -JUMP_STRENGTH,
        };
      }

      return prev;
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const draw = (timestamp) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      setGameState((prev) => {
        if (!prev.running || prev.gameOver) {
          return prev;
        }

        let nextVelocityY = prev.velocityY + GRAVITY * (delta / 16.67);
        let nextPlayerY = prev.playerY + nextVelocityY;

        if (nextPlayerY >= HORSE_Y_BASE) {
          nextPlayerY = HORSE_Y_BASE;
          nextVelocityY = 0;
        }

        let nextObstacles = prev.obstacles
          .map((obs) => ({ ...obs, x: obs.x - BASE_SPEED * (delta / 16.67) }))
          .filter((obs) => obs.x + obs.width > -20);

        if (nextObstacles.length === 0 || nextObstacles[nextObstacles.length - 1].x < 520) {
          nextObstacles.push({
            x: GAME_WIDTH + 30,
            y: 0,
            width: 36,
            height: 52,
          });
        }

        let newScore = prev.score + delta * 0.03;
        let crashed = false;

        const horseBox = {
          x: HORSE_X,
          y: nextPlayerY,
          width: HORSE_WIDTH,
          height: HORSE_HEIGHT,
        };

        for (const obs of nextObstacles) {
          const obstacleBox = {
            x: obs.x,
            y: GROUND_Y - obs.height,
            width: obs.width,
            height: obs.height,
          };

          if (
            horseBox.x < obstacleBox.x + obstacleBox.width &&
            horseBox.x + horseBox.width > obstacleBox.x &&
            horseBox.y < obstacleBox.y + obstacleBox.height &&
            horseBox.y + horseBox.height > obstacleBox.y
          ) {
            crashed = true;
            break;
          }
        }

        if (crashed) {
          return {
            ...prev,
            running: false,
            gameOver: true,
            score: newScore,
            bestScore: Math.max(prev.bestScore, Math.floor(newScore)),
            playerY: nextPlayerY,
            velocityY: nextVelocityY,
            obstacles: nextObstacles,
          };
        }

        return {
          ...prev,
          score: newScore,
          obstacles: nextObstacles,
          playerY: nextPlayerY,
          velocityY: nextVelocityY,
        };
      });

      frameCounterRef.current += 1;
      setFrameIndex((prev) => (prev + 1) % HORSE_ANIMATION_FRAMES.length);
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    animationFrameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    // Sky/backdrop
    const sky = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
    sky.addColorStop(0, '#1a2e4d');
    sky.addColorStop(0.5, '#243b5f');
    sky.addColorStop(1, '#d9f2ff');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Hills
    ctx.fillStyle = 'rgba(18, 74, 57, 0.5)';
    ctx.beginPath();
    ctx.moveTo(0, 330);
    ctx.quadraticCurveTo(180, 220, 360, 330);
    ctx.quadraticCurveTo(560, 240, 900, 330);
    ctx.lineTo(900, 480);
    ctx.lineTo(0, 480);
    ctx.closePath();
    ctx.fill();

    // Ground track
    ctx.fillStyle = '#6a3d1d';
    ctx.fillRect(0, GROUND_Y, GAME_WIDTH, GAME_HEIGHT - GROUND_Y);

    ctx.fillStyle = '#2d8a4e';
    ctx.fillRect(0, GROUND_Y - 8, GAME_WIDTH, 12);

    // Track lines
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let i = 0; i < GAME_WIDTH; i += 60) {
      ctx.moveTo(i, GROUND_Y + 72);
      ctx.lineTo(i + 30, GROUND_Y + 72);
    }
    ctx.stroke();

    // Obstacles
    gameState.obstacles.forEach((obs) => {
      ctx.fillStyle = '#3f2d1d';
      ctx.fillRect(obs.x, GROUND_Y - obs.height, obs.width, obs.height);
      ctx.fillStyle = '#a75a2c';
      ctx.fillRect(obs.x + 6, GROUND_Y - obs.height + 6, obs.width - 12, obs.height - 12);
    });

    // Horse sprite or fallback
    const horsePath = HORSE_ANIMATION_FRAMES[frameIndex % HORSE_ANIMATION_FRAMES.length];
    const horseImage = imageRefs.current[horsePath];

    if (horseImage) {
      ctx.drawImage(horseImage, HORSE_X, gameState.playerY, HORSE_WIDTH, HORSE_HEIGHT);
    } else {
      drawHorseFallback(ctx, HORSE_X, gameState.playerY);
    }

    // HUD
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(18, 18, 200, 72);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px Arial';
    ctx.fillText(`Score: ${Math.floor(gameState.score)}`, 30, 50);
    ctx.fillText(`Best: ${gameState.bestScore}`, 30, 74);

    if (!gameState.running && !gameState.gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillRect(180, 120, 540, 160);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 40px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Horse Race', GAME_WIDTH / 2, 180);
      ctx.font = '22px Arial';
      ctx.fillText('Click or press SPACE to start', GAME_WIDTH / 2, 220);
      ctx.textAlign = 'left';
    }

    if (gameState.gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(180, 120, 540, 180);
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.font = 'bold 42px Arial';
      ctx.fillText('Game Over', GAME_WIDTH / 2, 180);
      ctx.font = '24px Arial';
      ctx.fillText(`Score: ${Math.floor(gameState.score)}`, GAME_WIDTH / 2, 220);
      ctx.fillText('Click or press SPACE to restart', GAME_WIDTH / 2, 260);
      ctx.textAlign = 'left';
    }
  }, [gameState, frameIndex, imagesLoaded]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#0f172a'
    }}>
      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        onClick={handleJump}
        onTouchStart={handleJump}
        style={{
          width: 'min(92vw, 900px)',
          height: 'auto',
          borderRadius: '16px',
          border: '2px solid rgba(255,255,255,0.2)',
          background: '#1e293b',
          boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
          cursor: 'pointer'
        }}
      />
    </div>
  );
}

export default App;
