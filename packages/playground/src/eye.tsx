import { signal, onMount, createRef } from 'kaori.js';

function EyeWidget() {
  // ===== STATE =====
  // Signals to store the pupil's x and y translation for dynamic positioning
  const pupilX = signal(0);
  const pupilY = signal(0);
  // Ref to the outermost eye container to get its dimensions and position
  const eyeContainerRef = createRef();

  // ===== LIFECYCLE =====
  onMount(() => {
    const eyeContainerElement = eyeContainerRef.value;
    if (!eyeContainerElement) return;

    // Define fixed dimensions for iris and pupil based on Tailwind classes
    // 'w-28' is approximately 112px, 'w-12' is approximately 48px
    const IRIS_DIAMETER = 112;
    const PUPIL_DIAMETER = 48;

    const irisRadius = IRIS_DIAMETER / 2;
    const pupilRadius = PUPIL_DIAMETER / 2;
    // Calculate the maximum distance the pupil's center can move from the iris's center
    const maxPupilMovement = irisRadius - pupilRadius;

    /**
     * Handles mouse movement to update the pupil's position.
     * The pupil will follow the cursor's general direction but stay within the iris bounds.
     */
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

    // Add the mousemove event listener to the window
    window.addEventListener('mousemove', handleMouseMove);

    // ===== CLEANUP =====
    // Return a cleanup function to remove the event listener when the component unmounts
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  });

  // ===== RENDER =====
  return () => (
    <div class="flex justify-center items-center w-full h-full min-h-[200px] bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4">
      <div
        ref={eyeContainerRef}
        class="relative w-40 h-40 bg-white rounded-full shadow-2xl flex justify-center items-center overflow-hidden transform transition-transform duration-200 ease-out hover:scale-105"
      >
        {/* Iris: The colored part of the eye, positioned in the center */}
        <div class="w-28 h-28 bg-blue-700 rounded-full flex justify-center items-center shadow-inner">
          {/* Pupil: The black center, its position is dynamically updated */}
          <div
            class="w-12 h-12 bg-gray-900 rounded-full absolute transition-transform duration-75 ease-out"
            style={{
              transform: `translate(${pupilX.value}px, ${pupilY.value}px)`,
            }}
          ></div>
        </div>
        {/* Glare/highlight: A white circle to add realism and visual pop */}
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
