const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const drawRectangleButton = document.getElementById('draw-rectangle');
const horizontalGuideStart = document.getElementById('horizontal-guide-start');
const horizontalGuideCenter = document.getElementById('horizontal-guide-center');
const horizontalGuideEnd = document.getElementById('horizontal-guide-end');
const verticalGuideStart = document.getElementById('vertical-guide-start');
const verticalGuideCenter = document.getElementById('vertical-guide-center');
const verticalGuideEnd = document.getElementById('vertical-guide-end');

let rectangles = [];
let isDrawing = false;
let isDragging = false;
let currentRectangle = null;
let offsetX, offsetY;

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
drawRectangleButton.addEventListener('click', enableDrawing);

function enableDrawing() {
    isDrawing = true;
}

function startDrawing(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (isDrawing) {
        currentRectangle = { x, y, width: 0, height: 0 };
        rectangles.push(currentRectangle);
    } else {
        currentRectangle = rectangles.find(r => 
            x > r.x && x < r.x + r.width && y > r.y && y < r.y + r.height
        );
        if (currentRectangle) {
            isDragging = true;
            offsetX = x - currentRectangle.x;
            offsetY = y - currentRectangle.y;
        }
    }
}

function draw(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (isDrawing && currentRectangle) {
        currentRectangle.width = x - currentRectangle.x;
        currentRectangle.height = y - currentRectangle.y;
        redrawCanvas();
    } else if (isDragging && currentRectangle) {
        currentRectangle.x = x - offsetX;
        currentRectangle.y = y - offsetY;
        redrawCanvas();
    }
}

function stopDrawing() {
    isDrawing = false;
    isDragging = false;
    currentRectangle = null;
    drawGuides();
}

function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    rectangles.forEach(rect => {
        ctx.beginPath();
        ctx.rect(rect.x, rect.y, rect.width, rect.height);
        ctx.stroke();
    });
    drawGuides();
}

function drawGuides() {
    hideGuides();

    if (rectangles.length < 2) return;

    for (let i = 0; i < rectangles.length; i++) {
        for (let j = i + 1; j < rectangles.length; j++) {
            const rect1 = rectangles[i];
            const rect2 = rectangles[j];

            const rect1StartX = rect1.x;
            const rect1EndX = rect1.x + rect1.width;
            const rect1CenterX = rect1.x + rect1.width / 2;

            const rect1StartY = rect1.y;
            const rect1EndY = rect1.y + rect1.height;
            const rect1CenterY = rect1.y + rect1.height / 2;

            const rect2StartX = rect2.x;
            const rect2EndX = rect2.x + rect2.width;
            const rect2CenterX = rect2.x + rect2.width / 2;

            const rect2StartY = rect2.y;
            const rect2EndY = rect2.y + rect2.height;
            const rect2CenterY = rect2.y + rect2.height / 2;

            // Check for vertical guides
            if (Math.abs(rect1StartX - rect2StartX) < 5) {
                showVerticalGuide(verticalGuideStart, rect1StartX);
            }
            if (Math.abs(rect1EndX - rect2EndX) < 5) {
                showVerticalGuide(verticalGuideEnd, rect1EndX);
            }
            if (Math.abs(rect1CenterX - rect2CenterX) < 5) {
                showVerticalGuide(verticalGuideCenter, rect1CenterX);
            }

            // Check for horizontal guides
            if (Math.abs(rect1StartY - rect2StartY) < 5) {
                showHorizontalGuide(horizontalGuideStart, rect1StartY);
            }
            if (Math.abs(rect1EndY - rect2EndY) < 5) {
                showHorizontalGuide(horizontalGuideEnd, rect1EndY);
            }
            if (Math.abs(rect1CenterY - rect2CenterY) < 5) {
                showHorizontalGuide(horizontalGuideCenter, rect1CenterY);
            }
        }
    }
}

function showVerticalGuide(guide, position) {
    guide.style.left = `${position}px`;
    guide.style.top = '0';
    guide.style.height = '100%';
    guide.style.display = 'block';
}

function showHorizontalGuide(guide, position) {
    guide.style.left = '0';
    guide.style.top = `${position}px`;
    guide.style.width = '100%';
    guide.style.display = 'block';
}

function hideGuides() {
    horizontalGuideStart.style.display = 'none';
    horizontalGuideCenter.style.display = 'none';
    horizontalGuideEnd.style.display = 'none';
    verticalGuideStart.style.display = 'none';
    verticalGuideCenter.style.display = 'none';
    verticalGuideEnd.style.display = 'none';
}
