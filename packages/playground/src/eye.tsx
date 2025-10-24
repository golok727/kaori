import { signal, onMount, createRef } from 'kaori.js';

function EyeWidget() {
  const pupilX = signal(0);
  const pupilY = signal(0);

  const eyeContainerRef = createRef();

  onMount(() => {
    const eyeContainerElement = eyeContainerRef.value;
    if (!eyeContainerElement) return;
    const IRIS_DIAMETER = 112;
    const PUPIL_DIAMETER = 48;

    const irisRadius = IRIS_DIAMETER / 2;
    const pupilRadius = PUPIL_DIAMETER / 2;
    const maxPupilMovement = irisRadius - pupilRadius;

    const handleMouseMove = (event: MouseEvent) => {
      const eyeRect = eyeContainerElement.getBoundingClientRect();
      // Calculate the center of the main eye container
      const eyeCenterX = eyeRect.left + eyeRect.width / 2;
      const eyeCenterY = eyeRect.top + eyeRect.height / 2;

      // Calculate the vector from the eye's center to the cursor's position
      const deltaX = event.clientX - eyeCenterX;
      const deltaY = event.clientY - eyeCenterY;

      // Determine the angle of the cursor relative to the eye's center
      const angle = Math.atan2(deltaY, deltaX);

      // Calculate the distance, clamping it to the 'maxPupilMovement'
      // This ensures the pupil does not move outside the iris boundaries
      const distance = Math.min(
        Math.sqrt(deltaX * deltaX + deltaY * deltaY),
        maxPupilMovement
      );

      // Set the new pupil position based on angle and clamped distance
      pupilX.value = Math.cos(angle) * distance;
      pupilY.value = Math.sin(angle) * distance;
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  });

  return () => (
    <div class="flex justify-center items-center w-full h-full min-h-[200px] bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4">
      <div
        ref={eyeContainerRef}
        class="relative w-40 h-40 bg-white rounded-full shadow-2xl flex justify-center items-center overflow-hidden transform transition-transform duration-200 ease-out hover:scale-105"
      >
        <div class="w-28 h-28 bg-blue-700 rounded-full flex justify-center items-center shadow-inner">
          <div
            class="w-12 h-12 bg-gray-900 rounded-full absolute transition-transform duration-75 ease-out"
            style={{
              transform: `translate(${pupilX.value}px, ${pupilY.value}px)`,
            }}
          ></div>
        </div>
        <div
          class="absolute w-8 h-8 bg-white rounded-full opacity-70"
          style={{
            top: '25%',
            left: '25%',
            transform: 'translate(-50%, -50%)',
          }}
        ></div>
      </div>
    </div>
  );
}

export default EyeWidget;
