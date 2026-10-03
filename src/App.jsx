import { useEffect, useRef, useState } from 'react';

const HORSE_FRAME_PATHS = [
  '/assets/3903.png',
  '/assets/3905.png',
  '/assets/3906.png',
  '/assets/3907.png',
  '/assets/3909.png',
];

const INITIAL_PLAYER_Y = 0;
const GRAVITY = 0.8;
const JUMP_STRENGTH = 18;
const BASE_SPEED = 5;

const buildObstacle = (x, width = 28, height = 36) => ({
  x,
  width,
  height,
  y: 0,
});

function App() {
  const [horseFrames, setHorseFrames] = useState([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [playerY, setPlayerY] = useState(INITIAL_PLAYER_Y);
  const [velocityY, setVelocityY] = useState(0);
  const [obstacles, setObstacles] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const frameRef = useRef(0);
  const gameLoopIdRef = useRef(null);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    const loaded = [];
    let pending = HORSE_FRAME_PATHS.length;

    HORSE_FRAME_PATHS.forEach((path) => {
      const img = new Image();
      img.onload = () => {
        loaded.push(path);
        pending -= 1;
        if (pending === 0) {
          setHorseFrames(loaded);
        }
      };
      img.onerror = () => {
        pending -= 1;
        if (pending === 0) {
          setHorseFrames([]);
        }
      };
      img.src = path;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.code === 'Space' || event.code === 'ArrowUp') {
        event.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStarted, gameOver, playerY]);

  const jump = () => {
    if (!gameStarted) {
      setGameStarted(true);
      setGameOver(false);
    }

    if (gameOver) {
      resetGame();
      return;
    }

    if (playerY <= 1) {
      setVelocityY(-JUMP_STRENGTH);
    }
  };

  const resetGame = () => {
    setPlayerY(INITIAL_PLAYER_Y);
    setVelocityY(0);
    setObstacles([]);
    setScore(0);
    setGameStarted(false);
    setGameOver(false);
  };

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const tick = (timestamp) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      setPlayerY((previousY) => {
        const nextVelocity = previousY + velocityY + GRAVITY * (delta / 16.67);
        const nextY = Math.max(0, nextVelocity);
        return nextY;
      });

      setVelocityY((previousVelocity) => {
        return previousVelocity + GRAVITY * (delta / 16.67);
      });

      setObstacles((previousObstacles) => {
        const moved = previousObstacles
          .map((obstacle) => ({ ...obstacle, x: obstacle.x - BASE_SPEED * (delta / 16.67) }))
          .filter((obstacle) => obstacle.x + obstacle.width > -20);

        if (moved.length === 0 || moved[moved.length - 1].x < 420) {
          moved.push(buildObstacle(750 + Math.random() * 180));
        }

        return moved;
      });

      setScore((previousScore) => previousScore + delta * 0.01);

      const playerBox = {
        x: 140,
        y: 250 - playerY,
        width: 160,
        height: 130,
      };

      setObstacles((previousObstacles) => {
        const collided = previousObstacles.some((obstacle) => {
          const obstacleBox = {
            x: obstacle.x,
            y: 250 - obstacle.height,
            width: obstacle.width,
            height: obstacle.height,
          };

          return (
            playerBox.x < obstacleBox.x + obstacleBox.width &&
            playerBox.x + playerBox.width > obstacleBox.x &&
            playerBox.y < obstacleBox.y + obstacleBox.height &&
            playerBox.y + playerBox.height > obstacleBox.y
          );
        });

        if (collided) {
          setGameOver(true);
          setGameStarted(false);
          setBestScore((currentBest) => Math.max(currentBest, Math.floor(score)));
        }

        return previousObstacles;
      });

      frameRef.current = (frameRef.current + 1) % 12;
      gameLoopIdRef.current = requestAnimationFrame(tick);
    };

    gameLoopIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (gameLoopIdRef.current) cancelAnimationFrame(gameLoopIdRef.current);
    };
  }, [gameStarted, gameOver, playerY, score, velocityY]);

  const displayScore = Math.floor(score);
  const currentFrame = horseFrames.length ? horseFrames[frameRef.current % horseFrames.length] : null;

  return (
    <div className="game-shell">
      <div className="hud">
        <span>Score: {displayScore}</span>
        <span>Best: {bestScore}</span>
      </div>

      <div className="game-area" onClick={jump} onTouchStart={jump}>
        <div className="sky-glow" />

        <div className="ground" />

        {obstacles.map((obstacle, index) => (
          <div
            key={index}
            className="obstacle"
            style={{
              left: `${obstacle.x}px`,
              width: `${obstacle.width}px`,
              height: `${obstacle.height}px`,
            }}
          />
        ))}

        <div
          className="horse-wrapper"
          style={{
            transform: `translateY(${playerY}px)`,
          }}
        >
          {currentFrame ? (
            <img
              className="horse-sprite"
              src={currentFrame}
              alt="Horse sprite"
              onError={() => setHorseFrames([])}
            />
          ) : (
            <div className="horse-fallback" aria-label="Horse placeholder" />
          )}
        </div>

        {!gameStarted && !gameOver && (
          <div className="message-box">
            <h1>Horse Run</h1>
            <p>Press space or click to jump</p>
          </div>
        )}

        {gameOver && (
          <div className="message-box danger">
            <h2>Game Over</h2>
            <p>Final score: {displayScore}</p>
            <button onClick={resetGame}>Restart</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
