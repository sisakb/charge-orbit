import { Graph, Point, Line, Circle, Vector, TraceLine } from './Graph'

let playing = false

const k = 8.98E9
let Q = 2E-2
let m = 0.7
let v0 = 225
let x0 = 200

let graph = new Graph("canvas", 800, 1)

let plusQ = new Circle(new Point(x0, 0), 20, "+Q")
let minusQ = new Circle(new Point(0, 0), 20, "−Q")

let Acceleration = new Vector(plusQ.p, 0, 0, "blue", "a", "m/s²")
let Velocity = new Vector(plusQ.p, 0, v0, "red", "v", "m/s")

let trace = new TraceLine(500)

let i = 0

let reset = () => {
	plusQ = new Circle(new Point(x0, 0), 20, "+Q")
	minusQ = new Circle(new Point(0, 0), 20, "−Q")
	Velocity = new Vector(plusQ.p, 0, v0, "red", "v", "m/s")
	trace = new TraceLine(500)
	i = 0
	if (!playing) loop()
}

let loop = () => {

	let dt = 0.01

	let distance = Point.distance(plusQ.p, minusQ.p)
	let forceAbs = (k * Q**2) / (distance**2)
	let CoulombForce = Vector.fromTo(plusQ.p, minusQ.p, forceAbs, "green", "F", "N")

	Acceleration = Vector.fromTo(plusQ.p, minusQ.p, CoulombForce.length / m, "brown", "a", "m/s²")

	if (playing) {
		Velocity.x += Acceleration.x * dt
		Velocity.y += Acceleration.y * dt

		plusQ.p.x += Velocity.x * dt
		plusQ.p.y += Velocity.y * dt
		
		if (i % 2 == 0) trace.push(new Point(plusQ.p.x, plusQ.p.y))
	}
	

	graph.clear()
	graph.drawCartesian(50, 50)

	graph.draw(trace)

	graph.draw(Velocity)
	graph.draw(Acceleration)
	graph.draw(CoulombForce)

	graph.draw(minusQ)
	graph.draw(plusQ)


	// Mozgási energia
	let em = (0.5 * m * (Velocity.length**2))
	// Potenciális energia
	let ep = (k * Q * (-Q) / distance)

	document.getElementById("em").innerHTML = String(em.toFixed(2))
	document.getElementById("ep").innerHTML = String(ep.toFixed(2))
	document.getElementById("sume").innerHTML = String((em + ep).toFixed(2))

	if (distance > 20 && playing) requestAnimationFrame(loop)
	i++
}

loop()

document.getElementById("start").onclick = e => {
	playing = true
	requestAnimationFrame(loop)
}

document.getElementById("stop").onclick = e => {
	playing = false
}

document.getElementById("reset").onclick = e => {
	reset()
	if (!playing) loop()
}

document.getElementById("scale").oninput = e => {
	let scale = Number((e.target as HTMLInputElement).value)
	graph.scale = scale
	if (!playing) loop()
}

document.getElementById("Q").oninput = e => {
	Q = Number((e.target as HTMLInputElement).value)
	if (!playing) loop()
}

document.getElementById("m").oninput = e => {
	m = Number((e.target as HTMLInputElement).value)
	if (!playing) loop()
}

document.getElementById("v0").oninput = e => {
	v0 = Number((e.target as HTMLInputElement).value)
	if (!playing) reset()
}

document.getElementById("x0").oninput = e => {
	x0 = Number((e.target as HTMLInputElement).value)
	if (!playing) reset()
}