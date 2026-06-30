export const DEFAULT_AI_PREVIEW_STAGING_DURATION_SECONDS = 75;

export const DEFAULT_AI_PREVIEW_PLACEMENT_PROMPT = `Just place the left image's furniture which is one set in different angles (rotate in good position, but NEVER change their size, shape, or proportions) into the right image after removing ALL old furniture.
(You may rotate objects to fit, but NEVER change their color size, shape, or proportions.)
Return ONLY the final right image.

PRODUCT
- Title: {{productTitle}}
- Upholstery: {{upholstery}}
- Apply the selected upholstery exactly as shown in the left reference image.
- Match size, shape, silhouette, color, material, and non-fabric details exactly from the left catalog product image.

DON'T change other objects' original positions or structure.
Find the best natural placement (near walls if possible) WITHOUT removing, moving, or changing other room objects.

THE FURNITURE SHOULD NOT BLOCK THE PATHWAYS | KEEP THE FURNITURE PARALLEL TO THE WALLS.
DON'T RUSH. TAKE YOUR TIME TO KEEP THE ORIGINAL RIGHT IMAGE'S PERSPECTIVE, FLIP, CAMERA ANGLE, FRAMING, CROP, VIEWPOINT, AND COMPOSITION 100% UNCHANGED.`;
