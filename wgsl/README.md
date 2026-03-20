# Zach's Coding Style for WebGPU Shading Language

- [General](#general)
- [File structure](#file-structure)
- [Naming](#naming)
- [Structs](#structs)
- [Variables](#variables)
- [Functions](#functions)
- [Bindings](#bindings)
- [Comments](#comments)

## General

- Code must fit within 80 columns.
- Use tabs for indentation.
- Place the opening brace on the same line as the declaration.
- Prefer type shorthands (e.g. `vec2f` over `vec2<f32>`).
- Use shorthand float literals (e.g. `.5` instead of `0.5`, `0.` instead of
  `0.0`).
- Align related assignments by column.
- Separate logical sections with blank lines.

```wgsl
// Bad
out.position = camera.view_projection * u.world * vec4f(a.position, 0., 1.);
out.uv = a.position + vec2f(.5);

// Good
out.position = camera.view_projection * u.world * vec4f(a.position, 0., 1.);
out.uv       = a.position + vec2f(.5);
```

## File structure

1. Struct declarations
2. Binding declarations
3. Constants and overrides
4. Helper functions
5. Vertex shader function
6. Fragment shader function
7. Compute shader function

```wgsl
struct Camera {
	view_projection: mat4x4f,
};

struct VertexIn {
	@location(0) position: vec3f,
	@location(1) uv: vec2f,
	@location(2) normal: vec3f,
};

struct VertexOut {
	@builtin(position) clip_position: vec4f,
	@location(0) uv: vec2f,
	@location(1) normal: vec3f,
};

@group(0) @binding(0) var<uniform> camera: Camera;
@group(0) @binding(1) var s: sampler;
@group(0) @binding(2) var t: texture_2d<f32>;

const LIGHT_DIR: vec3f = vec3f(0., 1., 0.);
const AMBIENT: f32 = .15;

fn diffuse(normal: vec3f) -> f32 {
	return max(dot(normalize(normal), LIGHT_DIR), 0.);
}

@vertex
fn vs_main(a: VertexIn) -> VertexOut {
	var out: VertexOut;

	out.clip_position = camera.view_projection * vec4f(a.position, 1.);
	out.uv            = a.uv;
	out.normal        = a.normal;

	return out;
}

@fragment
fn fs_main(v: VertexOut) -> @location(0) vec4f {
	let albedo   = textureSample(t, s, v.uv);
	let lighting = AMBIENT + diffuse(v.normal);

	return vec4f(albedo.rgb * lighting, albedo.a);
}
```

## Naming

- Use PascalCase for structs.
- Use snake_case for functions and variables.
- Use SCREAMING_SNAKE_CASE for constants.
- Names must be descriptive unless covered by the conventions below.
- Use `a` for vertex shader inputs, `u` for uniforms, and `v` for fragment
  shader inputs. These are inspired by OpenGL/WebGL's attribute, uniform, and
  varying prefixes (`a_`, `u_`, `v_`).
- `s` for sampler, `t` for texture, and `t1`/`t2` for multiple textures are
  acceptable shorthands. Use descriptive names when textures have specific
  meanings (e.g. `ping`/`pong`, not `t1`/`t2`).
- Single-letter or short names are allowed for terms in known equations.
  Notation:

  - Underscore denotes subscript (`m_1`, `m_2`)
  - Letter-number denotes exponentiation (`d2` = d²)
  - Adjacent letters denote multiplication (`wh` = width × height)

  The equation being referenced must be clear from context.

- When a value has a unit, suffix the name with it (e.g. `offset_px`,
  `angle_rad`, `timeout_ms`).

| Suffix | Unit         |
| ------ | ------------ |
| `_ms`  | Milliseconds |
| `_sec` | Seconds      |
| `_px`  | Pixels       |
| `_pct` | Percent      |
| `_rad` | Radians      |
| `_deg` | Degrees      |

```wgsl
// Good: conventional shader parameter names
@vertex
fn vs_main(a: VertexIn) -> VertexOut { ... }

@fragment
fn fs_main(v: VertexOut) -> @location(0) vec4f { ... }

// Good: descriptive names for specific purposes
@group(1) @binding(0) var ping: texture_2d<f32>;
@group(1) @binding(1) var pong: texture_2d<f32>;

// Good: short names in a known equation (Newton's gravitation)
let F = G * m_1 * m_2 / d2;

// Bad: no unit
let blur = 4.;
let rotation = 1.57;

// Good: unit suffix
let blur_px = 4.;
let rotation_rad = 1.57;
```

## Structs

- End struct declarations with semicolon.
- Include a trailing comma on all fields, including the last.
- Place attributes on the same line as the field.

```wgsl
// Bad
struct VertexOut {
  @builtin(position) position: vec4f
  @location(0) uv: vec2f
}

// Good
struct VertexOut {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
};
```

## Variables

- Use `let` for immutable bindings. Use `var` for mutable bindings.
- Separate variable declarations from the rest of the function body with a blank
  line.

```wgsl
// Bad
fn vs_main(a: VertexIn) -> VertexOut {
  var out: VertexOut;
  out.position = ...;
}

// Good
fn vs_main(a: VertexIn) -> VertexOut {
  var out: VertexOut;

  out.position = ...;
}
```

## Functions

- Put stage attributes (`@vertex`, `@fragment`, `@compute`) on their own line
  above the function.
- Separate the final return statement from the rest of the function body with a
  blank line.

```wgsl
// Bad
@vertex fn vs_main(a: VertexIn) -> VertexOut {
  var out: VertexOut;

  out.position = camera.vp * u.world * vec4f(a.position, 0., 1.);

  return out;
}

// Good
@vertex
fn vs_main(a: VertexIn) -> VertexOut {
  var out: VertexOut;

  out.position = camera.vp * u.world * vec4f(a.position, 0., 1.);

  return out;
}
```

## Bindings

- Order bindings by `@group`, then by `@binding` number.

```wgsl
// Bad
@group(1) @binding(1) var t: texture_2d_array<f32>;
@group(0) @binding(0) var<uniform> camera: Camera;
@group(1) @binding(0) var s: sampler;

// Good
@group(0) @binding(0) var<uniform> camera: Camera;
@group(1) @binding(0) var s: sampler;
@group(1) @binding(1) var t: texture_2d_array<f32>;
```

## Comments

- Write code as clearly as possible so it reads like documentation.
- Only comment non-obvious logic.
- Use `///` for doc comments and `//` for inline comments.
- Doc comment structure:
  1. Summary paragraph.
  2. Detail paragraphs, each separated by a blank `///`.
  3. Parameters: `* \`name\` - Description`. Align the hyphens.
- Only document non-obvious parameters.
- No separator comments (e.g. `----------`).
- When a comment applies to multiple lines, separate it from the code with a
  blank line. When it applies to a single line, place it directly above.
- Use `TODO`, `FIXME`, `NOTE`, etc. appropriately. Include your name so the
  contact is traceable (e.g. `TODO(Zach): ...`).

```wgsl
/// Applies a bilateral filter to reduce noise while preserving edges.
///
/// Samples a neighborhood around the given UV and weights each sample by
/// spatial and range kernels.
///
/// * `uv`       - Texture coordinate to filter.
/// * `sigma_px` - Spatial standard deviation in pixels.
/// * `bsigma`   - Range standard deviation controlling edge sensitivity.
fn bilateral_filter(uv: vec2f, sigma_px: f32, bsigma: f32) -> vec4f {
	// ...
}

// Bad: states the obvious
// Set the ambient to 0.1
const AMBIENT: f32 = .1;

// Bad: separator comment
// =============== Lighting ===============

// Good: explains non-obvious logic
// Bias prevents shadow acne on surfaces nearly parallel to the light
let bias = max(.05 * (1. - dot(normal, light_dir)), .005);

// Bad: unclear if the comment applies to one or both lines
// Convert spherical to cartesian coordinates
let x = r * sin(theta) * cos(phi);
let y = r * sin(theta) * sin(phi);

// Good: blank line signals the comment applies to the block
// Convert spherical to cartesian coordinates

let x = r * sin(theta) * cos(phi);
let y = r * sin(theta) * sin(phi);

// Good: no blank line signals it applies to the next line only
// Remap from [-1, 1] to [0, 1] for texture sampling
let uv = ndc.xy * .5 + .5;

// TODO(Zach): Investigate banding artifacts at grazing angles
// FIXME(Dana): Normal map tangent basis is flipped on mirrored UVs
```
