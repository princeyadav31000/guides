const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const horizontalGuideStart = document.getElementById('horizontal-guide-start');
const horizontalGuideCenter = document.getElementById('horizontal-guide-center');
const horizontalGuideEnd = document.getElementById('horizontal-guide-end');
const verticalGuideStart = document.getElementById('vertical-guide-start');
const verticalGuideCenter = document.getElementById('vertical-guide-center');
const verticalGuideEnd = document.getElementById('vertical-guide-end');

let shapes = [];
let isDrawing = false;
let isDragging = false;
let currentShape = null;
let offsetX, offsetY;
let drawingMode = null;

document.getElementById('draw-rectangle').addEventListener('click', () => enableDrawing('rectangle'));
document.getElementById('draw-line').addEventListener('click', () => enableDrawing('line'));
document.getElementById('draw-arrow').addEventListener('click', () => enableDrawing('arrow'));
document.getElementById('draw-ellipse').addEventListener('click', () => enableDrawing('ellipse'));
document.getElementById('draw-polygon').addEventListener('click', () => enableDrawing('polygon'));
document.getElementById('draw-star').addEventListener('click', () => enableDrawing('star'));

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);

function enableDrawing(shape) {
    drawingMode = shape;
    isDrawing = true;
}

function startDrawing(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (isDrawing) {
        currentShape = { type: drawingMode, startX: x, startY: y, endX: x, endY: y };
        shapes.push(currentShape);
    } else {
        currentShape = shapes.find(shape => isInsideShape(x, y, shape));
        if (currentShape) {
            isDragging = true;
            offsetX = x - currentShape.startX;
            offsetY = y - currentShape.startY;
        }
    }
}

function draw(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (isDrawing && currentShape) {
        currentShape.endX = x;
        currentShape.endY = y;
        redrawCanvas();
    } else if (isDragging && currentShape) {
        const deltaX = x - offsetX - currentShape.startX;
        const deltaY = y - offsetY - currentShape.startY;
        currentShape.startX += deltaX;
        currentShape.startY += deltaY;
        currentShape.endX += deltaX;
        currentShape.endY += deltaY;
        redrawCanvas();
    }
}

function stopDrawing() {
    isDrawing = false;
    isDragging = false;
    currentShape = null;
    drawGuides();
}

function redrawCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    shapes.forEach(shape => drawShape(ctx, shape));
    drawGuides();
}

function drawShape(ctx, shape) {
    ctx.beginPath();
    switch (shape.type) {
        case 'rectangle':
            ctx.rect(shape.startX, shape.startY, shape.endX - shape.startX, shape.endY - shape.startY);
            break;
        case 'line':
            ctx.moveTo(shape.startX, shape.startY);
            ctx.lineTo(shape.endX, shape.endY);
            break;
        case 'arrow':
            drawArrow(ctx, shape.startX, shape.startY, shape.endX, shape.endY);
            break;
        case 'ellipse':
            drawEllipse(ctx, shape.startX, shape.startY, shape.endX - shape.startX, shape.endY - shape.startY);
            break;
        case 'polygon':
            drawPolygon(ctx, shape.startX, shape.startY, shape.endX, shape.endY);
            break;
        case 'star':
            drawStar(ctx, shape.startX, shape.startY, shape.endX, shape.endY);
            break;
    }
    ctx.stroke();
}

function drawArrow(ctx, fromx, fromy, tox, toy) {
    const headlen = 10; // length of head in pixels
    const dx = tox - fromx;
    const dy = toy - fromy;
    const angle = Math.atan2(dy, dx);
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(tox, toy);
    ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
}

function drawEllipse(ctx, x, y, w, h) {
    ctx.ellipse(x + w / 2, y + h / 2, Math.abs(w) / 2, Math.abs(h) / 2, 0, 0, Math.PI * 2);
}

function drawPolygon(ctx, x1, y1, x2, y2) {
    // Draw a simple triangle for demonstration
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y1);
    ctx.lineTo((x1 + x2) / 2, y2);
    ctx.closePath();
}

function drawStar(ctx, x1, y1, x2, y2) {
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;
    const spikes = 5;
    const outerRadius = Math.abs(x2 - x1) / 2;
    const innerRadius = outerRadius / 2.5; // Adjust the inner radius for better proportions
    let rot = Math.PI / 2 * 3;
    const step = Math.PI / spikes;

    ctx.beginPath(); // Ensure a new path is started
    ctx.moveTo(cx, cy - outerRadius);

    for (let i = 0; i < spikes; i++) {
        ctx.lineTo(
            cx + Math.cos(rot) * outerRadius,
            cy + Math.sin(rot) * outerRadius
        );
        rot += step;

        ctx.lineTo(
            cx + Math.cos(rot) * innerRadius,
            cy + Math.sin(rot) * innerRadius
        );
        rot += step;
    }

    ctx.lineTo(cx, cy - outerRadius); // Close the path back to the start
    ctx.closePath();
    ctx.stroke(); // Ensure the star is stroked
}


function isInsideShape(x, y, shape) {
    switch (shape.type) {
        case 'rectangle':
            return x > shape.startX && x < shape.endX && y > shape.startY && y < shape.endY;
        case 'line':
        case 'arrow':
            return isNearLine(x, y, shape.startX, shape.startY, shape.endX, shape.endY);
        case 'ellipse':
            return isInsideEllipse(x, y, shape.startX, shape.startY, shape.endX, shape.endY);
        case 'polygon':
        case 'star':
            return isInsidePolygonOrStar(x, y, shape);
    }
    return false;
}

function isNearLine(px, py, x1, y1, x2, y2) {
    const distance = Math.abs((y2 - y1) * px - (x2 - x1) * py + x2 * y1 - y2 * x1) /
        Math.sqrt((y2 - y1) ** 2 + (x2 - x1) ** 2);
    return distance < 5;
}

function isInsideEllipse(px, py, x1, y1, x2, y2) {
    const rx = Math.abs(x2 - x1) / 2;
    const ry = Math.abs(y2 - y1) / 2;
    const h = (x1 + x2) / 2;
    const k = (y1 + y2) / 2;
    return ((px - h) ** 2) / rx ** 2 + ((py - k) ** 2) / ry ** 2 <= 1;
}

function isInsidePolygonOrStar(px, py, shape) {
    // Placeholder for actual polygon or star hit-test algorithm
    return isInsideShape(px, py, { type: 'rectangle', startX: shape.startX, startY: shape.startY, endX: shape.endX, endY: shape.endY });
}

function drawGuides() {
    hideGuides();

    if (shapes.length < 2) return;

    for (let i = 0; i < shapes.length; i++) {
        for (let j = i + 1; j < shapes.length; j++) {
            const shape1 = shapes[i];
            const shape2 = shapes[j];

            const [shape1StartX, shape1EndX, shape1CenterX] = getHorizontalGuidePoints(shape1);
            const [shape1StartY, shape1EndY, shape1CenterY] = getVerticalGuidePoints(shape1);

            const [shape2StartX, shape2EndX, shape2CenterX] = getHorizontalGuidePoints(shape2);
            const [shape2StartY, shape2EndY, shape2CenterY] = getVerticalGuidePoints(shape2);

            // Check for vertical guides
            if (Math.abs(shape1StartX - shape2StartX) < 5) {
                showVerticalGuide(verticalGuideStart, shape1StartX);
            }
            if (Math.abs(shape1EndX - shape2EndX) < 5) {
                showVerticalGuide(verticalGuideEnd, shape1EndX);
            }
            if (Math.abs(shape1CenterX - shape2CenterX) < 5) {
                showVerticalGuide(verticalGuideCenter, shape1CenterX);
            }

            // Check for horizontal guides
            if (Math.abs(shape1StartY - shape2StartY) < 5) {
                showHorizontalGuide(horizontalGuideStart, shape1StartY);
            }
            if (Math.abs(shape1EndY - shape2EndY) < 5) {
                showHorizontalGuide(horizontalGuideEnd, shape1EndY);
            }
            if (Math.abs(shape1CenterY - shape2CenterY) < 5) {
                showHorizontalGuide(horizontalGuideCenter, shape1CenterY);
            }
        }
    }
}

function getHorizontalGuidePoints(shape) {
    const startX = shape.startX;
    const endX = shape.endX;
    const centerX = (shape.startX + shape.endX) / 2;
    return [startX, endX, centerX];
}

function getVerticalGuidePoints(shape) {
    const startY = shape.startY;
    const endY = shape.endY;
    const centerY = (shape.startY + shape.endY) / 2;
    return [startY, endY, centerY];
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
