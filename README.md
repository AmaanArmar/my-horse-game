# My Horse Game

A simple horse runner game built with React and Vite. The project includes a playable jump mechanic, animated horse frames, obstacle spawning, score tracking, and a restart flow.

## Run locally

```bash
npm install
npm run dev
```

Then open the local Vite URL in your browser.

## Assets

The game tries to load frames from:

- `/assets/3903.png`
- `/assets/3905.png`
- `/assets/3906.png`
- `/assets/3907.png`
- `/assets/3909.png`

If those files are not present yet, the game falls back to a generated horse placeholder so the project still runs.

## Controls

- Space or Up Arrow: jump
- Mouse click or tap: jump
- Restart button after a crash

## Game idea

This is a lightweight endless runner inspired by classic side-scrolling arcade games, but themed around a horse animation and a simple browser game loop.

## Notes

This repository was set up to match the requested structure and game idea using the provided horse animation assets as a starting point.

If you later add the real sprite PNG files into `public/assets/`, the game will automatically use them instead of the fallback drawing.
