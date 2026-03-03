You want a **modal overlay with backdrop blur**. This is a solved UI pattern: full-screen overlay + centered dialog + CSS backdrop filter.

Below is the cleanest implementation (HTML/CSS/JS). No frameworks.

---

## 1. Structure

Wrap your game content so it can be blurred independently.

```html
<body>
  <div id="game-container">
    <!-- Your Minesweeper grid here -->
  </div>

  <div id="win-modal" class="modal hidden">
    <div class="modal-content">
      <h2>You Won 🎉</h2>
      <p>All mines cleared.</p>
      <button id="restart-btn">Play Again</button>
    </div>
  </div>
</body>
```

---

## 2. CSS (Backdrop Blur + Centered Popup)

```css
body {
  margin: 0;
  font-family: sans-serif;
}

/* Game container */
#game-container {
  transition: filter 0.3s ease;
}

/* Blur effect when active */
.blur {
  filter: blur(6px);
}

/* Modal overlay */
.modal {
  position: fixed;
  inset: 0; /* top:0 left:0 right:0 bottom:0 */
  display: flex;
  justify-content: center;
  align-items: center;

  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(6px);

  z-index: 1000;
}

/* Hide by default */
.hidden {
  display: none;
}

/* Popup box */
.modal-content {
  background: white;
  padding: 2rem 3rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: popIn 0.25s ease-out;
}

@keyframes popIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
```

---

## 3. JavaScript (Trigger On Win)

Call this when your win condition is met.

```js
function showWinPopup() {
  document.getElementById("win-modal").classList.remove("hidden");
  document.getElementById("game-container").classList.add("blur");
}

function hideWinPopup() {
  document.getElementById("win-modal").classList.add("hidden");
  document.getElementById("game-container").classList.remove("blur");
}

document.getElementById("restart-btn").addEventListener("click", () => {
  hideWinPopup();
  restartGame(); // your reset logic
});
```

---

## Alternative (Cleaner Architecture)

Instead of manually blurring `#game-container`, rely fully on:

```css
backdrop-filter: blur(6px);
```

This blurs everything behind the modal automatically (more scalable if your UI grows).

---

## What’s Actually Happening

* `position: fixed` + `inset: 0` → full screen overlay
* `display: flex` → perfect centering
* `backdrop-filter: blur()` → blurs background
* `z-index` → ensures it floats above game
* `hidden` class → toggled visibility

---

## Pro-Level Upgrade

If you want this production-grade:

* Add `pointer-events: none` to background when modal open
* Add keyboard listener (`Escape` to close)
* Add fade-in/out transitions instead of `display: none`
* Add game stats (time, score) dynamically injected

---

If you tell me what stack you're using (vanilla JS, React, C++, SDL, etc.), I’ll tailor the solution to your rendering model.

