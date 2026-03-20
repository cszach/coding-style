# Zach's Coding Style™ for JavaScript® and TypeScript®

- [Setup](#setup)
- [General](#general)
- [TypeScript](#typescript)
- [Naming](#naming)
- [Variables](#variables)
- [Functions](#functions)
- [Classes](#classes)
- [Block statements](#block-statements)
- [Loops](#loops)
- [Return statements](#return-statements)
- [Import statements](#import-statements)
- [Exports](#exports)
- [`null` vs. `undefined`](#null-vs-undefined)
- [Comments](#comments)

## Setup

1. Install dependencies:

```sh
npm install -D eslint prettier typescript-eslint eslint-config-prettier eslint-plugin-import
```

2. Copy [`.prettierrc`](.prettierrc) and [`eslint.config.mjs`](eslint.config.mjs)
   to your project root.

3. Add scripts to your `package.json`:

```json
{
	"scripts": {
		"lint": "eslint .",
		"format": "prettier --write ."
	}
}
```

Some rules are not enforceable by tooling and must be followed manually. See the
style guide below.

## General

- Code must fit within 80 columns.
- Use tabs for indentation.
- End statements with a semicolon.
- Never use trailing commas.
- Use `===` and `!==` instead of `==` and `!=`.
- Use double quotes for strings.
- No thin getters or setters. Expose variables directly with a `@readonly`
  JSDoc annotation. Exceptions: nested variables or non-obvious names. When
  in doubt, ask: does this getter do more than forward a single field? If
  not, it is thin.
- When a nested property is referenced often, alias it.

```ts
// Bad: thin getter
class Camera {
	private _zoom: number = 1;

	get zoom(): number {
		return this._zoom;
	}
}

// Good
class Camera {
	/** @readonly */
	zoom: number = 1;
}

// Bad: thin getter over a public field
class Engine {
	transition: Transition | null = null;

	get isTransitioning(): boolean {
		return this.transition !== null;
	}
}

// Good: compare directly
if (engine.transition !== null) { ... }

// Good: getter over nested property
class AtlasManager {
	private lodResources: LODResource[];

	get textures(): GPUTexture[] {
		return this.lodResources[0]?.textures ?? [];
	}
}

// Bad: repeated nested access
function updateProfile(app: Application) {
	app.state.user.profile.name = newName;
	app.state.user.profile.email = newEmail;
	app.state.user.profile.avatar = newAvatar;
}

// Good: alias the nested property
function updateProfile(app: Application) {
	const profile = app.state.user.profile;

	profile.name = newName;
	profile.email = newEmail;
	profile.avatar = newAvatar;
}
```

## TypeScript

- Only use `as` when omitting it would cause a TypeScript error.
- Never use `any`. If no alternative seems possible, rethink the design.
- Use `type` for type definitions.
- Use `interface` only to define a contract that classes implement.

```ts
// Bad
function getProperty(obj: any, key: string): any {
	return obj[key];
}

// Good
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
	return obj[key];
}

// Bad: unnecessary `as`
const length = (input as string).length;

// Good: type guard
if (typeof input === "string") {
	const length = input.length;
}

// Bad: interface for a type definition
interface Route {
	path: string;
	params: Record<string, string>;
}

// Good
type Route = {
	path: string;
	params: Record<string, string>;
};

// Good: interface for class contracts
interface Renderer {
	render(scene: Scene, camera: Camera): void;
}

class WebGPURenderer implements Renderer {
	// ...
}
```

## Naming

- Use standard JavaScript naming conventions. Abbreviations are all-caps
  (e.g. `SVGRenderer`, not `SvgRenderer`).
- No underscore prefix for private members.
- Names should be descriptive enough to understand without reading the
  implementation. If a descriptive name would be too long, use a shorter
  name and explain in a docstring.
- When a value has a unit, suffix variable and function names with it
  (e.g. `distancePx`, `angleRad`, `getTimeoutMs()`).
- For files containing a single class, name the file after the class.
- For files containing multiple exports, use a kebab-case name.
- Common file names: `index.ts`, `types.ts`, `utils.ts`, `constants.ts`.

| Suffix  | Unit         |
| ------- | ------------ |
| `Ms`    | Milliseconds |
| `Sec`   | Seconds      |
| `Px`    | Pixels       |
| `Rem`   | CSS rem      |
| `Em`    | CSS em       |
| `Pct`   | Percent      |
| `Rad`   | Radians      |
| `Deg`   | Degrees      |
| `Bytes` | Bytes        |
| `Kb`    | Kilobytes    |
| `Mb`    | Megabytes    |
| `Hz`    | Hertz        |

```ts
// Bad
class SvgParser {}
class HtmlValidator {}

// Good
class SVGParser {}
class HTMLValidator {}

// Bad
class Texture {
	private _width: number;
}

// Good
class Texture {
	private width: number;
}

// Bad: too vague
const d = new Date();
const n = items.length;

// Good
const orderDate = new Date();
const itemCount = items.length;

// Bad: too long
function calculateTotalPriceIncludingTaxAndShipping(cart: Cart): number {
	// ...
}

// Good: shorter name, explained in docstring
/** Calculates the final price including tax and shipping. */
function calculateTotal(cart: Cart): number {
	// ...
}

// Bad: no unit
const timeout = 5000;
function getDistance(a: Vector2, b: Vector2): number { ... }

// Good: unit suffix
const timeoutMs = 5000;
function getDistancePx(a: Vector2, b: Vector2): number { ... }
```

## Variables

- Use `const` and `let`. Never use `var`.
- Declare variables as close as possible to their first usage.
- Group variable declarations by purpose, separated by blank lines.
- When extracting multiple properties from an object, use destructuring
  assignment.

```ts
// Bad: declared far from usage
function processOrder(order: Order) {
	const shipping = calculateShipping(order);
	const tax = order.subtotal * TAX_RATE;

	validateInventory(order.items);
	notifyWarehouse(order);
	order.total = order.subtotal + tax + shipping;
}

// Good: declared close to usage, grouped by purpose
function processOrder(order: Order) {
	validateInventory(order.items);
	notifyWarehouse(order);

	const shipping = calculateShipping(order);
	const tax = order.subtotal * TAX_RATE;

	order.total = order.subtotal + tax + shipping;
}

// Bad
const radius = params.radius ?? 0.8;
const count = params.referenceCount ?? 100;
const seed = params.seed ?? 0.01;

// Good: destructuring assignment
const { radius = 0.8, referenceCount = 100, seed = 0.01 } = params;
```

## Functions

- Prefer function declarations over function expressions.
- Use arrow functions for callbacks.

```ts
// Bad
const createUser = function (name: string): User {
	return { name, createdAt: new Date() };
};

// Good
function createUser(name: string): User {
	return { name, createdAt: new Date() };
}

// Good: arrow functions for callbacks
const active = users.filter((user) => user.isActive);

events.forEach((event) => {
	logger.info(event.message);
});
```

## Classes

- Member order:
  1. Static variables
  2. Private static variables
  3. Instance variables
  4. Private instance variables
  5. Static methods
  6. Constructor
  7. Getters
  8. Instance methods
  9. Private instance methods
  10. Private static methods
- Within each group, order members logically (by importance or usage flow).
  Separate groups with a blank line.
- Use `readonly` for variables only assigned in the constructor.

```ts
// Good
class AudioPlayer {
	static supportedFormats = ["mp3", "wav", "ogg"];

	private static instance: AudioPlayer;

	volume: number = 1;
	readonly context: AudioContext;

	private currentTrack: AudioBuffer | null = null;

	static create(): AudioPlayer {
		// ...
	}

	constructor(context: AudioContext) {
		this.context = context;
	}

	get isPlaying(): boolean {
		return this.currentTrack !== null;
	}

	play(track: AudioBuffer): void {
		// ...
	}

	pause(): void {
		// ...
	}

	private decodeTrack(data: ArrayBuffer): AudioBuffer {
		// ...
	}
}
```

## Block statements

> e.g. `if`, `else`, `for`, `while`, `do`, `try`/`catch`, functions, classes,
> etc.

- Always use braces, even for single-line bodies.
- The opening brace must be on the same line as the statement. The body must
  start on the next line. The closing brace must be on its own line.
- Separate consecutive block statements with a blank line.

```ts
// Bad
if (user.isAdmin) return true;

// Good
if (user.isAdmin) {
	return true;
}

// Bad: not separated
for (const item of cart.items) {
	validateItem(item);
}
for (const coupon of cart.coupons) {
	applyCoupon(coupon);
}

// Good
for (const item of cart.items) {
	validateItem(item);
}

for (const coupon of cart.coupons) {
	applyCoupon(coupon);
}
```

## Loops

- Prefer `for...of` over `for`. Use `for` only when performance requires it.

```ts
// Bad
for (let i = 0; i < users.length; i++) {
	sendWelcomeEmail(users[i]);
}

// Good
for (const user of users) {
	sendWelcomeEmail(user);
}
```

## Return statements

- Separate the final return statement from the rest of the function body
  with a blank line.

```ts
// Bad
function getDiscount(customer: Customer): number {
	if (customer.isPremium) {
		return 0.2;
	}
	return 0;
}

// Good
function getDiscount(customer: Customer): number {
	if (customer.isPremium) {
		return 0.2;
	}

	return 0;
}
```

## Import statements

- `type` imports precede value imports.
- Within each category, external imports precede local imports.
- Avoid `..` -- use absolute paths instead.
- Separate `type` imports from value imports with a blank line.
- Separate local value imports from external value imports with a blank
  line.

```ts
// Bad
import { Button } from "./Button";
import type { FormProps } from "./types";
import { useState } from "react";
import type { Theme } from "@/types/theme";

// Good
import type { Theme } from "@/types/theme";
import type { FormProps } from "./types";

import { useState } from "react";

import { Button } from "./Button";
```

## Exports

- Use named exports. Never use default exports.
- Use barrel files (`index.ts`) when there are multiple exports from a
  directory.

```ts
// Bad
export default class Router {
	// ...
}

// Good
export class Router {
	// ...
}
```

## `null` vs. `undefined`

- Use `null` for intentionally empty values.
- Use `undefined` for unassigned values.

```ts
// null: intentionally empty
let selectedNode: TreeNode | null = null;

function findNode(id: string): TreeNode | null {
	return tree.get(id) ?? null;
}

// undefined: not yet assigned
let socket: WebSocket | undefined;

function connect(url: string) {
	socket = new WebSocket(url);
}
```

## Comments

- Write code as clearly as possible so it reads like documentation.
- Only comment non-obvious logic.
- Use JSDoc-style comments.
- Only document non-obvious parameters.
- No separator comments (e.g. `----------`).
- Use `//` for inline comments and `/** */` for docstrings.
- When a comment applies to multiple lines, separate it from the code with a
  blank line. When it applies to a single line, place it directly above.
- Use `TODO`, `FIXME`, `NOTE`, etc. appropriately. Include your name so the
  contact is traceable (e.g. `TODO(Zach): ...`).

```ts
// Bad: states the obvious
// Set the width to 100
const width = 100;

// Bad: separator comment
// =============== Event Handlers ===============

// Good: explains non-obvious logic
// WebGL requires power-of-two textures for mipmapping
const size = nextPowerOfTwo(image.width);

/**
 * Uploads a texture to the GPU.
 *
 * @param format - Must match the internal format of the framebuffer when used
 * as a render target.
 */
function uploadTexture(source: ImageData, format: TextureFormat): WebGLTexture {
	// ...
}

// Bad: unclear if the comment applies to one or both lines
// Convert polar to cartesian coordinates
const x = radius * Math.cos(angleRad);
const y = radius * Math.sin(angleRad);

// Good: blank line signals the comment applies to the block
// Convert polar to cartesian coordinates

const x = radius * Math.cos(angleRad);
const y = radius * Math.sin(angleRad);

// Good: no blank line signals it applies to the next line only
// Clamp to viewport bounds
const clampedX = Math.min(x, viewportWidth);

// TODO(Zach): Investigate memory leak on context loss
// FIXME(Dana): Off-by-one in tile index calculation
```
