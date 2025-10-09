var canvas = document.getElementById('canvi');
var ctx = canvas.getContext('2d');

var w = canvas.width = window.innerWidth;
var h = canvas.height = window.innerHeight;

// Bright glowing blues
const blues = [
    'hsla(200, 100%, 70%, 0.4)',  // sky blue
    'hsla(210, 100%, 60%, 0.4)',  // vibrant blue
    'hsla(220, 100%, 55%, 0.4)',  // deep electric blue
    'hsla(190, 100%, 65%, 0.4)'   // aqua glow
];

var draw = function (t) {
    ctx.clearRect(0, 0, w, h);

    for (var i = -60; i < 60; i += 1) {
        ctx.strokeStyle = blues[(i + 60) % blues.length];
        ctx.lineWidth = 0.6;

        // Glow effect
        ctx.shadowColor = 'rgba(0, 150, 255, 0.8)'; // neon blue glow
        ctx.shadowBlur = 14;

        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        for (var j = 0; j < w; j += 10) {
            ctx.lineTo(
                10 * Math.sin(i / 10) + j + 0.008 * j * j,
                Math.floor(
                    h / 2 +
                    j / 2 * Math.sin(j / 50 - t / 50 - i / 118) +
                    (i * 1.2) * Math.sin(j / 25 - (i + t) / 65)
                )
            );
        }
        ctx.stroke();
    }
};

var t = 0;

window.addEventListener(
    'resize',
    function () {
        canvas.width = w = window.innerWidth;
        canvas.height = h = window.innerHeight;
    },
    false
);

var run = function () {
    window.requestAnimationFrame(run);
    t += 3; // animation speed
    draw(t);
};

run();
