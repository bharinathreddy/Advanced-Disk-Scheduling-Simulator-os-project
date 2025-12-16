// ------------------------------
// Algorithms
// ------------------------------

function fcfs(start, reqs) {
    return reqs.slice();
}

function sstf(start, reqs) {
    let r = reqs.slice();
    let order = [];
    let head = start;

    while (r.length) {
        let idx = 0, best = Math.abs(r[0] - head);
        for (let i = 1; i < r.length; i++) {
            let d = Math.abs(r[i] - head);
            if (d < best) { best = d; idx = i; }
        }
        head = r[idx];
        order.push(head);
        r.splice(idx, 1);
    }
    return order;
}

function scan(start, reqs, dir, diskMax) {
    let left = reqs.filter(r => r < start).sort((a,b)=>b-a);
    let right = reqs.filter(r => r >= start).sort((a,b)=>a-b);
    let order = [];

    if (dir === "right") {
        order.push(...right);
        order.push(...left);
    } else {
        order.push(...left);
        order.push(...right);
    }
    return order;
}

function cscan(start, reqs, dir, diskMax) {
    let left = reqs.filter(r => r < start).sort((a,b)=>a-b);
    let right = reqs.filter(r => r >= start).sort((a,b)=>a-b);
    if (dir === "right") return [...right, ...left];
    else return [...left.reverse(), ...right.reverse()];
}

// ------------------------------
// Metrics
// ------------------------------

function computeMetrics(start, order) {
    let pos = [start, ...order];
    let total = 0;

    for (let i = 1; i < pos.length; i++)
        total += Math.abs(pos[i] - pos[i - 1]);

    let avg = total / order.length;
    let throughput = order.length / (total || 1);

    return { total, avg, throughput };
}

// ------------------------------
// Visualization
// ------------------------------

function drawMovement(order, start, diskMax) {
    const canvas = document.getElementById("diskCanvas");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0,0,canvas.width,canvas.height);

    let w = canvas.width - 40;
    let h = canvas.height;

    function map(x) { return 20 + (x / diskMax) * w; }

    ctx.strokeStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(20, h/2);
    ctx.lineTo(20 + w, h/2);
    ctx.stroke();

    let pos = [start, ...order];
    let i = 0;

    function animate() {
        if (i >= pos.length - 1) return;

        let x1 = map(pos[i]);
        let x2 = map(pos[i + 1]);

        ctx.strokeStyle = "#0f0";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x1, h/2);
        ctx.lineTo(x2, h/2);
        ctx.stroke();

        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(x2, h/2, 8, 0, Math.PI * 2);
        ctx.fill();

        i++;
        setTimeout(animate, 600);
    }

    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(map(start), h/2, 8, 0, Math.PI * 2);
    ctx.fill();

    animate();
}

// ------------------------------
// RUN SIMULATION
// ------------------------------

function runSim() {
    let start = parseInt(document.getElementById("start").value);
    let diskMax = parseInt(document.getElementById("diskMax").value);
    let dir = document.getElementById("dir").value;

    let reqs = document
        .getElementById("req")
        .value.split(",")
        .map(x => parseInt(x.trim()))
        .filter(x => !isNaN(x));

    let algo = document.getElementById("algo").value;

    let order;
    if (algo === "fcfs") order = fcfs(start, reqs);
    else if (algo === "sstf") order = sstf(start, reqs);
    else if (algo === "scan") order = scan(start, reqs, dir, diskMax);
    else if (algo === "cscan") order = cscan(start, reqs, dir, diskMax);

    let m = computeMetrics(start, order);

    document.getElementById("metrics").innerHTML =
        `<b>Order:</b> ${order.join(" → ")}<br>
         <b>Total Seek Time:</b> ${m.total}<br>
         <b>Average Seek Time:</b> ${m.avg.toFixed(2)}<br>
         <b>Throughput:</b> ${m.throughput.toFixed(4)} ops/unit time`;

    drawMovement(order, start, diskMax);
}
