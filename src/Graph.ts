const range = (start: number, stop: number, step = 1) => Array(Math.ceil((stop - start) / step)).fill(start).map((x, y) => x + y * step)

class Drawable {
	public draw(g: Graph) {
		alert("Draw method not implemented")
	}
}

class Point {
	constructor(public x: number, public y: number) {
		//super()
	}

	public draw(g: Graph) {
		this.toCanvasPoint(g).draw(g)
	}

	public toCanvasPoint(g: Graph) : CanvasPoint {
		return new CanvasPoint((this.x + g.halfSize)*g.scale, -g.scale*(this.y - (g.halfSize)))
	}

	public static distance(a: Point, b: Point) {
		return Math.sqrt((a.x - b.x)**2 + (a.y - b.y)**2)
	}
}

class CanvasPoint extends Drawable {
	constructor(public x: number, public y: number) {
		super()
	}

	public draw(g: Graph) {
		g.ctx.beginPath()
  		g.ctx.arc(this.x, this.y, 2, 0, 2 * Math.PI, true)
  		g.ctx.stroke()
	}
}

class Vector extends Drawable {
	public length: number
	constructor(public p: Point, private _x: number, private _y: number, public color: string = "black", public label: string = "", public unit: string = "") {
		super()
		this.calcLength()
	}

	public static fromTo(a: Point, b: Point, length: number, color: string = "black", label: string = "", unit: string = "") : Vector {
		let dx = b.x - a.x
		let dy = b.y - a.y
		let lengthFactor = length / (Math.sqrt(dx**2 + dy**2))
		return new Vector(a, dx*lengthFactor, dy*lengthFactor, color, label, unit)
	}

	get x(){
		return this._x
	}

	get y(){
		return this._y
	}

	set x(value: number) {
		this._x = value
		this.calcLength()
	}

	set y(value: number) {
		this._y = value
		this.calcLength()
	}

	private calcLength(){
		this.length = Math.sqrt(this._x**2 + this._y**2)
	}

	public draw(g: Graph) {
		g.ctx.beginPath()
		g.ctx.moveTo(this.p.toCanvasPoint(g).x, this.p.toCanvasPoint(g).y)
		g.ctx.lineTo(this.p.toCanvasPoint(g).x + (this.x * g.scale), this.p.toCanvasPoint(g).y - (this.y * g.scale))
		g.ctx.strokeStyle = this.color
		g.ctx.stroke()
		
		g.ctx.save()
		g.ctx.translate(this.p.toCanvasPoint(g).x + (this.x * g.scale), this.p.toCanvasPoint(g).y - (this.y * g.scale))
		
		let angle = Math.atan2(-this.y, this.x)
		
		g.ctx.rotate(angle)
		g.ctx.moveTo(0, 0)

		g.ctx.lineTo(-10 * g.scale, -6 * g.scale)
		g.ctx.stroke()
		g.ctx.moveTo(0, 0)
		g.ctx.lineTo(-10 * g.scale, 6 * g.scale)
		g.ctx.stroke()
		g.ctx.translate(20, 20)
		g.ctx.rotate(-angle)
		g.ctx.font = "20px CMU Serif Bold"
		g.ctx.fillStyle = this.color
		g.ctx.fillText(`${this.label}${this.label ? " = " : ""}${String(Math.round(this.length))} ${this.unit}`, 0, 0)

		g.ctx.restore()
	}
}

class Circle extends Drawable {
	constructor(public p: Point, public r: number, public label: string = null) {
		super()
	}

	public draw(g: Graph) {
		g.ctx.strokeStyle = "black"
		g.ctx.beginPath()
		g.ctx.arc(this.p.toCanvasPoint(g).x, this.p.toCanvasPoint(g).y, this.r * g.scale, 0, 2 * Math.PI, false)
		g.ctx.fillStyle = 'gray'
		g.ctx.fill()
		if (this.label) {
			g.ctx.font = "20px CMU Serif"
			g.ctx.fillStyle = 'white'
			//g.ctx.fillText(this.label, this.p.toCanvasPoint(g).x - 17, this.p.toCanvasPoint(g).y + 6)	
		}
		g.ctx.stroke()
	}
}

class Line extends Drawable {
	constructor(public p1: Point, public p2: Point, public color: string = "black") {
		super()
	}

	public draw(g: Graph) {
		g.ctx.strokeStyle = this.color
		this.p1.draw(g)
		this.p2.draw(g)
		g.ctx.moveTo(this.p1.toCanvasPoint(g).x, this.p1.toCanvasPoint(g).y)
		g.ctx.lineTo(this.p2.toCanvasPoint(g).x, this.p2.toCanvasPoint(g).y)
		g.ctx.stroke()
	}
}

class TraceLine extends Drawable {
	private trace: Point[]
	constructor(private maxLength: number = 100) {
		super()
		this.trace = []
	}
	public push(p: Point) {
		if (this.trace.length == this.maxLength) this.trace.shift()
		this.trace.push(p)
	}
	public draw(g: Graph) {
		g.ctx.beginPath()
		this.trace.map(p => {
			g.ctx.lineTo(p.toCanvasPoint(g).x, p.toCanvasPoint(g).y)
			g.ctx.stroke()
		})
	}
	public points() {
		return this.trace.map(p => {return {x: p.x, y: p.y} })
	}
}

class Graph {
	private context: CanvasRenderingContext2D

	constructor(public id: string, public size: number, public scale: number = 1) {
		const canvas: HTMLCanvasElement = document.getElementById(id) as HTMLCanvasElement
		this.context = canvas.getContext('2d')
	}

	get ctx() {
		return this.context
	}

	get halfSize () {
		return (this.size / 2)/this.scale
	}

	public drawCartesian(xWidth: number, yWidth: number) {
		let lineColor = "rgba(0, 0, 0, 0.2)"
		
		range(-this.halfSize, this.halfSize + xWidth, xWidth/this.scale).map(x => {
			(new Line(new Point(x, -this.halfSize), new Point(x, this.halfSize), lineColor)).draw(this)
		})

		range(-this.halfSize, this.halfSize + yWidth, yWidth/this.scale).map(y => {
			(new Line(new Point(-this.halfSize, y), new Point(this.halfSize, y), lineColor)).draw(this)
		})

		new Line(new Point(-this.halfSize, 0), new Point(this.halfSize, 0)).draw(this)
		new Line(new Point(0, -this.halfSize), new Point(0, this.halfSize)).draw(this)
	}

	public draw(elem: Drawable) {
		elem.draw(this)
	}

	public clear() {
		this.ctx.clearRect(0, 0, this.size, this.size)
	}
}

export { Graph, Point, Line, Circle, Vector, TraceLine }