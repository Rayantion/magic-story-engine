const DrawCanvas = (() => {
  let canvas, ctx;
  let drawing = false;
  let erasing = false;
  let brushColor = '#2d2dff';
  let brushSize = 8;
  let lastX = 0, lastY = 0;

  function init() {
    canvas = document.getElementById('draw-canvas');
    ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Mouse events
    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDraw);
    canvas.addEventListener('mouseleave', stopDraw);

    // Touch events
    canvas.addEventListener('touchstart', handleTouch, { passive: false });
    canvas.addEventListener('touchmove', handleTouch, { passive: false });
    canvas.addEventListener('touchend', stopDraw);

    // Tools
    document.getElementById('color-picker').addEventListener('input', e => {
      brushColor = e.target.value;
      erasing = false;
      document.getElementById('btn-eraser').classList.remove('active');
      updateColorDots();
    });

    document.querySelectorAll('.color-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        brushColor = dot.dataset.color;
        document.getElementById('color-picker').value = brushColor;
        erasing = false;
        document.getElementById('btn-eraser').classList.remove('active');
        updateColorDots();
      });
    });

    document.getElementById('brush-size').addEventListener('input', e => {
      brushSize = parseInt(e.target.value);
    });

    document.getElementById('btn-eraser').addEventListener('click', () => {
      erasing = !erasing;
      document.getElementById('btn-eraser').classList.toggle('active', erasing);
      updateColorDots();
    });

    document.getElementById('btn-clear').addEventListener('click', () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    });

    updateColorDots();
  }

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  function startDraw(e) {
    drawing = true;
    const pos = getPos(e);
    lastX = pos.x;
    lastY = pos.y;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
  }

  function draw(e) {
    if (!drawing) return;
    const pos = getPos(e);
    ctx.strokeStyle = erasing ? '#ffffff' : brushColor;
    ctx.lineWidth = erasing ? brushSize * 3 : brushSize;
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastX = pos.x;
    lastY = pos.y;
  }

  function stopDraw() {
    drawing = false;
  }

  function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent(
      e.type === 'touchstart' ? 'mousedown' : 'mousemove',
      { clientX: touch.clientX, clientY: touch.clientY }
    );
    canvas.dispatchEvent(mouseEvent);
  }

  function updateColorDots() {
    document.querySelectorAll('.color-dot').forEach(d => {
      d.classList.toggle('active', d.dataset.color === brushColor && !erasing);
    });
  }

  function toBase64() {
    return canvas.toDataURL('image/png').split(',')[1];
  }

  function toDataURL() {
    return canvas.toDataURL('image/png');
  }

  return { init, toBase64, toDataURL };
})();