document.addEventListener('DOMContentLoaded', function() {
    let pins = [];
    let container = document.getElementById('container');
    let canvas = document.getElementById('canvasOverlay');
    let context = canvas.getContext('2d');
    let image = document.getElementById('image');
    let scale = 1;
    let originX = 0;
    let originY = 0;

    function drawPins() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.save();
        context.scale(scale, scale);
        context.translate(originX, originY);
        pins.forEach(pin => {
            context.fillStyle = 'red';
            context.beginPath();
            context.arc(pin.x, pin.y, 5, 0, 2 * Math.PI);
            context.fill();
            context.fillStyle = 'black';
            context.fillText(pin.units + " Units", pin.x + 10, pin.y - 5);
        });
        context.restore();
    }

    function promptForUnits(x, y) {
        let units = prompt("Enter the vaccine units:");
        if (units) {
            pins.push({ x: x, y: y, units: units });
            drawPins();
        }
    }

    canvas.addEventListener('click', function(event) {
        let rect = canvas.getBoundingClientRect();
        let x = (event.clientX - rect.left) / scale - originX;
        let y = (event.clientY - rect.top) / scale - originY;
        promptForUnits(x, y);
    });

    document.getElementById('generateQR').addEventListener('click', function() {
        console.log("Generate QR button clicked.");
        let pinData = JSON.stringify(pins);
        console.log("Pin Data before encoding: ", pinData); // Debugging line
        pinData = encodeURIComponent(pinData);
        console.log("Encoded Pin Data: ", pinData); // Debugging line
        window.location.href = `qrpage.html?data=${pinData}`;
    });

    // Zoom functionality
    container.addEventListener('wheel', function(event) {
        event.preventDefault();
        let wheel = event.deltaY < 0 ? 1 : -1;
        let zoom = Math.exp(wheel * 0.1);
        scale *= zoom;
        if (scale < 1) scale = 1; // Prevent zooming out too much
        if (scale > 3) scale = 3; // Prevent zooming in too much
        container.style.transform = `scale(${scale})`;
        drawPins();
    });

    // Touch events for zoom and pan
    container.addEventListener('touchstart', function(event) {
        if (event.touches.length == 2) {
            // Zooming
            const dist = Math.sqrt(
                (event.touches[0].clientX - event.touches[1].clientX) ** 2 +
                (event.touches[0].clientY - event.touches[1].clientY) ** 2
            );
            container.setAttribute('data-pinching', dist);
        } else {
            // Panning
            const touch = event.touches[0];
            container.setAttribute('data-touchX', touch.clientX);
            container.setAttribute('data-touchY', touch.clientY);
        }
    });

    container.addEventListener('touchmove', function(event) {
        event.preventDefault();
        if (event.touches.length == 2) {
            // Zooming
            const initialDist = parseFloat(container.getAttribute('data-pinching'));
            const currentDist = Math.sqrt(
                (event.touches[0].clientX - event.touches[1].clientX) ** 2 +
                (event.touches[0].clientY - event.touches[1].clientY) ** 2
            );
            const zoom = currentDist / initialDist;
            scale *= zoom;
            if (scale < 1) scale = 1; // Prevent zooming out too much
            if (scale > 3) scale = 3; // Prevent zooming in too much
            container.style.transform = `scale(${scale})`;
            drawPins();
            container.setAttribute('data-pinching', currentDist);
        } else {
            // Panning
            const touch = event.touches[0];
            const prevX = parseFloat(container.getAttribute('data-touchX'));
            const prevY = parseFloat(container.getAttribute('data-touchY'));
            originX += (touch.clientX - prevX) / scale;
            originY += (touch.clientY - prevY) / scale;
            container.setAttribute('data-touchX', touch.clientX);
            container.setAttribute('data-touchY', touch.clientY);
            container.style.transform = `scale(${scale}) translate(${originX}px, ${originY}px)`;
            drawPins();
        }
    });

    container.addEventListener('touchend', function(event) {
        container.removeAttribute('data-pinching');
        container.removeAttribute('data-touchX');
        container.removeAttribute('data-touchY');
    });
});
