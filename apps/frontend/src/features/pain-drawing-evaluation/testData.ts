import type { PainDrawingData } from "./types";

/**
 * Mock pain drawing data for testing the evaluation feature
 * Includes drawings in 3 regions to demonstrate regional pain pattern
 */
export const mockPainDrawingData: PainDrawingData = {
  drawings: {
    "head-right": {
      imageId: "head-right",
      elements: [
        {
          id: "shade-hr-1",
          type: "shade",
          points: [
            // Temple area shading
            350, 280, 360, 290, 375, 300, 390, 310, 400, 325, 405, 340, 400,
            355, 390, 365, 375, 370, 360, 375, 345, 375, 330, 370,
          ],
        },
        {
          id: "point-hr-1",
          type: "point",
          x: 380,
          y: 420, // Jaw area
        },
      ],
    },
    "head-left": {
      imageId: "head-left",
      elements: [
        {
          id: "shade-hl-1",
          type: "shade",
          points: [
            // Matching temple area on left side
            780, 280, 770, 290, 755, 300, 740, 310, 730, 325, 725, 340, 730,
            355, 740, 365, 755, 370, 770, 375, 785, 375, 800, 370,
          ],
        },
        {
          id: "arrow-hl-1",
          type: "arrow",
          points: [750, 350, 750, 450], // Radiating pain downward
        },
      ],
    },
    mouth: {
      imageId: "mouth",
      elements: [], // No mouth pain
    },
    "body-front": {
      imageId: "body-front",
      elements: [
        {
          id: "shade-bf-1",
          type: "shade",
          points: [
            // Neck/shoulder area
            380, 120, 390, 130, 405, 140, 420, 145, 435, 145, 450, 140, 460,
            130, 465, 120, 460, 110, 450, 105, 435, 105, 420, 105, 405, 110,
            390, 115,
          ],
        },
        {
          id: "point-bf-1",
          type: "point",
          x: 420,
          y: 180, // Upper back area
        },
        {
          id: "point-bf-2",
          type: "point",
          x: 380,
          y: 200,
        },
      ],
    },
    "body-back": {
      imageId: "body-back",
      elements: [], // No back pain
    },
  },
  completedAt: new Date().toISOString(),
  version: "1.0",
};

/**
 * Empty pain drawing data for testing no-pain scenario
 */
export const emptyPainDrawingData: PainDrawingData = {
  drawings: {
    "head-right": { imageId: "head-right", elements: [] },
    "head-left": { imageId: "head-left", elements: [] },
    mouth: { imageId: "mouth", elements: [] },
    "body-front": { imageId: "body-front", elements: [] },
    "body-back": { imageId: "body-back", elements: [] },
  },
  completedAt: new Date().toISOString(),
  version: "1.0",
};

/**
 * Widespread pain drawing data for testing high-risk scenario
 * Pain in 4+ regions
 */
export const widespreadPainDrawingData: PainDrawingData = {
  drawings: {
    "head-right": {
      imageId: "head-right",
      elements: [
        {
          id: "shade-hr-w1",
          type: "shade",
          points: [350, 300, 380, 320, 400, 350, 380, 380, 350, 360],
        },
      ],
    },
    "head-left": {
      imageId: "head-left",
      elements: [
        {
          id: "shade-hl-w1",
          type: "shade",
          points: [780, 300, 750, 320, 730, 350, 750, 380, 780, 360],
        },
      ],
    },
    mouth: {
      imageId: "mouth",
      elements: [
        {
          id: "point-m-w1",
          type: "point",
          x: 260,
          y: 400,
        },
        {
          id: "point-m-w2",
          type: "point",
          x: 280,
          y: 420,
        },
      ],
    },
    "body-front": {
      imageId: "body-front",
      elements: [
        {
          id: "shade-bf-w1",
          type: "shade",
          points: [380, 150, 420, 160, 450, 170, 420, 200, 380, 190],
        },
      ],
    },
    "body-back": {
      imageId: "body-back",
      elements: [
        {
          id: "shade-bb-w1",
          type: "shade",
          points: [400, 200, 420, 220, 440, 250, 420, 280, 400, 260, 380, 230],
        },
        {
          id: "arrow-bb-w1",
          type: "arrow",
          points: [420, 250, 420, 350],
        },
      ],
    },
  },
  completedAt: new Date().toISOString(),
  version: "1.0",
};
