# Zach's Coding Style for WebGPU Shading Language

- [General](#general)
- [Naming](#naming)
- [Structs](#structs)
- [Variables](#variables)
- [Functions](#functions)
- [Bindings](#bindings)

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

## Naming

- Use PascalCase for structs.
- Use snake_case for functions and variables.
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
