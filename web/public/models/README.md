# 3D models

Drop optional glTF files here and they will be picked up automatically by the
3D preview on the post-request and request-detail pages.

| File                  | What it does                                                                          |
| --------------------- | ------------------------------------------------------------------------------------- |
| `abaya.glb`           | Replaces the procedural lathe abaya. The customer's color & fabric controls re-tint the loaded materials. The vertex-shader wind ripples the lower half. |
| `mannequin.glb`       | A rigged human body (e.g. Mixamo download). If the GLB has animations, the first one matching `walk` or `idle` plays underneath the abaya. The mesh is auto-recolored to a dark matte silhouette so it reads as a stand-in. |

## Recommendations

- Pick an abaya GLB whose base color is **white / light grey** so the in-app
  color picker tints it cleanly (`material.color` multiplies with the diffuse
  texture). Sketchfab search: <https://sketchfab.com/search?q=abaya>.
- For the mannequin, use **Mixamo** (free with an Adobe account):
  1. Upload any humanoid character (or use one of Mixamo's defaults).
  2. Pick an animation like **Catwalk Walk Forward** or **Standing Idle**.
  3. Set "Skin" to *With Skin* and "Format" to **glTF Binary (.glb)** — Mixamo
     officially exports FBX, so use the free converter at
     <https://github.com/donmccurdy/three-gltf-viewer> or run
     `npx fbx2gltf input.fbx -o mannequin.glb`.
  4. Drop the resulting file here as `mannequin.glb`.
- Both files are optional. With neither file present the parametric mesh is
  used (still fully interactive — color, fabric, all 8 sliders, wind shader,
  Gemini cinematic preview).

## File-size tips

- Compress with **`gltf-pipeline -i abaya.glb -o abaya.glb --draco`** to shrink
  GLBs by 70–90% before committing.
- Texture sizes of 1024 px are usually plenty for hero presentations.
