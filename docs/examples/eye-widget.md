# Eye Widget

An interactive eye that follows your mouse cursor.

## Code

```tsx
import { signal, onMount, createRef } from 'kaori.js';

function EyeWidget() {
  const pupilX = signal(0);
  const pupilY = signal(0);
  const eyeContainerRef = createRef<HTMLDivElement>();
  
  onMount(() => {
    const eyeElement = eyeContainerRef.value;
    if (!eyeElement) return;
    
    const IRIS_DIAMETER = 112;
    const PUPIL_DIAMETER = 48;
    const irisRadius = IRIS_DIAMETER / 2;
    const pupilRadius = PUPIL_DIAMETER / 2;
    const maxPupilMovement = irisRadius - pupilRadius;
    
    function handleMouseMove(event: MouseEvent) {
      const eyeRect = eyeElement.getBoundingClientRect();
      const eyeCenterX = eyeRect.left + eyeRect.width / 2;
      const eyeCenterY = eyeRect.top + eyeRect.height / 2;
      
      const deltaX = event.clientX - eyeCenterX;
      const deltaY = event.clientY - eyeCenterY;
      
      const angle = Math.atan2(deltaY, deltaX);
      const distance = Math.min(
        Math.sqrt(deltaX * deltaX + deltaY * deltaY),
        maxPupilMovement
      );
      
      pupilX.value = Math.cos(angle) * distance;
      pupilY.value = Math.sin(angle) * distance;
    }
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  });
  
  return () => (
    <div class="eye-container">
      <div ref={eyeContainerRef} class="eye">
        <div class="iris">
          <div
            class="pupil"
            style={{
              transform: `translate(${pupilX.value}px, ${pupilY.value}px)`,
            }}
          />
        </div>
        <div class="glare" />
      </div>
    </div>
  );
}

render(<EyeWidget />, document.getElementById('root')!);
```

## Styling

```css
.eye-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 2rem;
}

.eye {
  position: relative;
  width: 160px;
  height: 160px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  transition: transform 0.2s ease-out;
}

.eye:hover {
  transform: scale(1.05);
}

.iris {
  width: 112px;
  height: 112px;
  background: linear-gradient(135deg, #4f46e5 0%, #2563eb 100%);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: inset 0 4px 8px rgba(0, 0, 0, 0.2);
}

.pupil {
  position: absolute;
  width: 48px;
  height: 48px;
  background: #1f2937;
  border-radius: 50%;
  transition: transform 0.1s ease-out;
}

.glare {
  position: absolute;
  width: 32px;
  height: 32px;
  background: white;
  border-radius: 50%;
  opacity: 0.7;
  top: 25%;
  left: 25%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}
```

## How It Works

1. **Refs** - We use `createRef` to access the eye DOM element
2. **Mouse Tracking** - Event listener tracks mouse position
3. **Math** - Calculate angle and distance from eye center to cursor
4. **Constraints** - Clamp pupil movement to stay within iris
5. **Signals** - pupilX and pupilY signals trigger re-renders
6. **Transform** - CSS transform moves the pupil smoothly

## Enhancements

Add blinking:

```tsx
function EyeWidget() {
  // ... existing code ...
  const isBlinking = signal(false);
  
  onMount(() => {
    const blinkInterval = setInterval(() => {
      isBlinking.value = true;
      setTimeout(() => isBlinking.value = false, 150);
    }, 3000);
    
    return () => clearInterval(blinkInterval);
  });
  
  return () => (
    <div class="eye" classMap={{ blinking: isBlinking.value }}>
      {/* ... */}
    </div>
  );
}
```

```css
.eye.blinking {
  animation: blink 0.15s ease-in-out;
}

@keyframes blink {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(0.1); }
}
```
