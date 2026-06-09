import { EMPTY, GOAL, LEVELS_DATA, PLAYER, WALL } from "../config.js";

// Makes a clean, empty map array filled with dots/empty spaces
function createEmptyGrid(size) {
  return Array(size * size).fill(EMPTY);
}

// Builds the map layout for a level
function generateLevel(
  gridSize,
  playerIndex,
  targetIndex,
  letterMap = {},
  wallIndices = [],
  hiddenData = null, // Extra words that appear later in the game
) {
  const grid = createEmptyGrid(gridSize);

  // 1. Put walls on the map using their position numbers
  wallIndices.forEach((idx) => (grid[idx] = WALL));

  // 2. Put the first active word card on the map
  Object.entries(letterMap).forEach(([idx, letter]) => {
    grid[parseInt(idx)] = letter;
  });

  // 3. Put hidden word letter
  if (hiddenData && hiddenData.lettersMap) {
    Object.entries(hiddenData.lettersMap).forEach(([idx, letter]) => {
      grid[parseInt(idx)] = letter;
    });
  }

  // 4. Place the player (cat)
  grid[playerIndex] = PLAYER;

  // 5. Place the star only if there are no hidden words
  if (!hiddenData) grid[targetIndex] = GOAL;

  // Create the basic level info package
  const levelObject = { grid, playerIndex, targetIndex };

  // If there is hidden data, add it to the package
  if (hiddenData) {
    levelObject.hiddenWords = hiddenData.words || [];
    levelObject.hiddenLettersMap = hiddenData.lettersMap || {};
    levelObject.firstWordLength = hiddenData.triggerLength || 0;
  }

  return levelObject;
}

export const FIXED_TUTO = [
  {
    title: "Tutorial: Multi-Word Sequence",
    words: LEVELS_DATA[0].words,
    gridSetup: () => {
      const size = 5;
      const playerIndex = 0;
      const targetIndex = 17;

      const lettersMap = { 1: "B", 6: "U", 7: "G" };
      const wallIndices = [];

      // Pass ANT data as the 6th item so it stays hidden at first
      return generateLevel(size, playerIndex, targetIndex, lettersMap, wallIndices, {
        words: ["BEE"],
        lettersMap: { 8: "B", 13: "E", 18: "E" },
        triggerLength: 3,
      });
    },
  },
];

export const FIXED_LEVELS = [
  // ==========================================
  // LEVEL 1: SENANG (Tukar huruf yang terkena wall 12)
  // ==========================================
  {
    words: LEVELS_DATA[1].words,
    gridSetup: () =>
      // Asal: { 1: "C", 13: "O", 9: "W" }, Walls: [4, 12]
      // Tiada konflik, tapi saya susun semula agar lebih cantik
      generateLevel(5, 10, 14, { 1: "C", 13: "O", 9: "W" }, [4, 12], {
        words: ["BAT"],
        lettersMap: { 21: "B", 7: "A", 23: "T" },
        triggerLength: 3,
      }),
  },

  // ==========================================
  // LEVEL 2: SEDERHANA (Tukar huruf G di indeks 4 kerana dekat dengan wall 3)
  // ==========================================
  {
    words: LEVELS_DATA[6].words,
    gridSetup: () =>
      // Asal: { 2: "F", 8: "R", 14: "O", 4: "G" }, Walls: [3, 11, 15, 16]
      // Tukar G dari 4 ke 5 supaya tidak terperangkap dengan wall 3
      generateLevel(5, 0, 24, { 2: "F", 8: "R", 14: "O", 5: "G" }, [3, 11, 15, 16], {
        words: ["FISH"],
        lettersMap: { 10: "F", 18: "I", 6: "S", 22: "H" },
        triggerLength: 4,
      }),
  },

  // ==========================================
  // LEVEL 3: SUSAH (PUPPY - Laluan Berliku Mencabar)
  // ==========================================
  {
    words: LEVELS_DATA[17].words,
    gridSetup: () =>
      // Ejaan: P(1) -> U(11) -> P(3) -> P(13) -> Y(23)
      // Pemain bermula di 0.
      // Dinding disusun untuk memaksa pemain "Zig-Zag" mencari huruf.
      generateLevel(
        5,
        0,
        24, // Target
        { 1: "P", 11: "U", 3: "P", 13: "P", 23: "Y" },
        [5, 6, 7, 8, 15, 16, 17, 20],
        {
          words: ["EAGLE"],
          // EAGLE diletakkan di kawasan yang memerlukan pemain berpatah balik
          lettersMap: { 4: "E", 9: "A", 19: "G", 21: "L", 5: "E" },
          triggerLength: 5,
        },
      ),
  },
];

// export const FIXED_LEVELS = [
//   // ==========================================
//   // SET 1: THE BASICS (Levels 1-5)
//   // ==========================================
//   {
//     words: LEVELS_DATA[1].words,
//     gridSetup: () =>
//       generateLevel(5, 10, 14, { 11: "C", 12: "O", 13: "W" }, [4], {
//         words: ["BAT"],
//         lettersMap: { 19: "B", 18: "A", 17: "T" },
//         triggerLength: 3,
//       }),
//   },
//   {
//     words: LEVELS_DATA[2].words,
//     gridSetup: () =>
//       generateLevel(5, 0, 4, { 5: "R", 6: "A", 7: "T" }, [10, 11], {
//         words: ["OWL"],
//         lettersMap: { 15: "O", 16: "W", 17: "L" },
//         triggerLength: 3,
//       }),
//   },
//   {
//     words: LEVELS_DATA[3].words,
//     gridSetup: () =>
//       generateLevel(5, 20, 24, { 15: "A", 16: "N", 17: "T" }, [9, 14], {
//         words: ["CAT"],
//         lettersMap: { 18: "C", 19: "A", 23: "T" },
//         triggerLength: 3,
//       }),
//   },
//   {
//     words: LEVELS_DATA[4].words,
//     gridSetup: () =>
//       generateLevel(5, 0, 20, { 1: "F", 2: "O", 3: "X" }, [6, 7, 8], {
//         words: ["HEN"],
//         lettersMap: { 10: "H", 15: "E", 16: "N" },
//         triggerLength: 3,
//       }),
//   },
//   {
//     words: LEVELS_DATA[5].words,
//     gridSetup: () =>
//       generateLevel(5, 4, 24, { 3: "P", 2: "I", 1: "G" }, [7, 13, 17], {
//         words: ["BUG"],
//         lettersMap: { 11: "B", 16: "U", 21: "G" },
//         triggerLength: 3,
//       }),
//   },

//   // ==========================================
//   // SET 2: THE SQUEEZE (Levels 6-10)
//   // ==========================================
//   {
//     words: LEVELS_DATA[6].words,
//     gridSetup: () =>
//       generateLevel(5, 0, 24, { 1: "F", 2: "R", 3: "O", 4: "G" }, [6, 11, 16], {
//         words: ["FISH"],
//         lettersMap: { 9: "F", 14: "I", 19: "S", 23: "H" },
//         triggerLength: 4,
//       }),
//   },
//   {
//     words: LEVELS_DATA[7].words,
//     gridSetup: () =>
//       generateLevel(5, 0, 24, { 5: "G", 6: "O", 7: "A", 8: "T" }, [11, 12, 13], {
//         words: ["DEER"],
//         lettersMap: { 15: "D", 16: "E", 17: "E", 18: "R" },
//         triggerLength: 4,
//       }),
//   },
//   {
//     words: LEVELS_DATA[8].words,
//     gridSetup: () =>
//       generateLevel(5, 0, 24, { 1: "L", 2: "I", 3: "O", 4: "N" }, [9, 14, 18, 19], {
//         words: ["BEAR"],
//         lettersMap: { 10: "B", 15: "E", 20: "A", 21: "R" },
//         triggerLength: 4,
//       }),
//   },
//   {
//     words: LEVELS_DATA[9].words,
//     gridSetup: () =>
//       generateLevel(5, 20, 4, { 15: "W", 10: "O", 5: "L", 0: "F" }, [8, 13, 12, 18], {
//         words: ["DUCK"],
//         lettersMap: { 6: "D", 7: "U", 2: "C", 3: "K" },
//         triggerLength: 4,
//       }),
//   },
//   {
//     words: LEVELS_DATA[10].words,
//     gridSetup: () =>
//       generateLevel(5, 0, 24, { 5: "C", 6: "R", 7: "A", 8: "B" }, [11, 13, 17, 18], {
//         words: ["SEAL"],
//         lettersMap: { 10: "S", 15: "E", 20: "A", 21: "L" },
//         triggerLength: 4,
//       }),
//   },

//   // ==========================================
//   // SET 3: THE HORSESHOE (Levels 11-15)
//   // ==========================================
//   {
//     words: LEVELS_DATA[11].words,
//     gridSetup: () =>
//       generateLevel(5, 2, 22, { 7: "M", 11: "U", 17: "L", 13: "E" }, [6, 8, 12, 16], {
//         words: ["COLT"],
//         lettersMap: { 21: "C", 20: "O", 19: "L", 18: "T" },
//         triggerLength: 4,
//       }),
//   },
//   {
//     words: LEVELS_DATA[12].words,
//     gridSetup: () =>
//       generateLevel(5, 2, 22, { 7: "S", 12: "W", 17: "A", 20: "N" }, [6, 8, 11, 13], {
//         words: ["MOLE"],
//         lettersMap: { 23: "M", 24: "O", 19: "L", 14: "E" },
//         triggerLength: 4,
//       }),
//   },
//   {
//     words: LEVELS_DATA[13].words,
//     gridSetup: () =>
//       generateLevel(5, 0, 24, { 1: "C", 2: "A", 3: "L", 4: "F" }, [6, 8, 13, 18], {
//         words: ["CHICK"],
//         lettersMap: { 9: "C", 14: "H", 19: "I", 23: "C", 22: "K" },
//         triggerLength: 4,
//       }),
//   },
//   {
//     words: LEVELS_DATA[14].words,
//     gridSetup: () =>
//       generateLevel(5, 24, 0, { 23: "S", 22: "H", 21: "A", 20: "R", 15: "K" }, [6, 7, 12, 17], {
//         words: ["HORSE"],
//         lettersMap: { 10: "H", 5: "O", 4: "R", 3: "S", 2: "E" },
//         triggerLength: 5,
//       }),
//   },
//   {
//     words: LEVELS_DATA[15].words,
//     gridSetup: () =>
//       generateLevel(5, 0, 24, { 1: "Z", 6: "E", 11: "B", 16: "R", 21: "A" }, [7, 12, 13, 14], {
//         words: ["SNAKE"],
//         lettersMap: { 22: "S", 23: "N", 18: "A", 13: "K", 8: "E" },
//         triggerLength: 5,
//       }),
//   },

//   // ==========================================
//   // SET 4: THE SWITCHBACK (Levels 16-20)
//   // ==========================================
//   {
//     words: LEVELS_DATA[16].words,
//     gridSetup: () =>
//       generateLevel(5, 0, 12, { 1: "K", 2: "O", 3: "A", 4: "L", 9: "A" }, [6, 7, 8, 11, 13, 14], {
//         words: ["TIGER"],
//         lettersMap: { 19: "T", 18: "I", 17: "G", 16: "E", 15: "R" },
//         triggerLength: 5,
//       }),
//   },
//   {
//     words: LEVELS_DATA[17].words,
//     gridSetup: () =>
//       generateLevel(
//         5,
//         0,
//         24,
//         { 1: "P", 2: "U", 7: "P", 12: "P", 11: "Y" },
//         [5, 6, 8, 9, 13, 15, 16, 18, 19],
//         {
//           words: ["EAGLE"],
//           lettersMap: { 10: "E", 15: "A", 20: "G", 21: "L", 22: "E" },
//           triggerLength: 5,
//         },
//       ),
//   },
//   {
//     words: LEVELS_DATA[18].words,
//     gridSetup: () =>
//       generateLevel(
//         5,
//         0,
//         4,
//         { 5: "O", 15: "T", 20: "T", 21: "E", 22: "R" },
//         [1, 2, 3, 11, 12, 13, 16, 17, 18],
//         {
//           words: ["WHALE"],
//           lettersMap: { 24: "W", 19: "H", 14: "A", 9: "L", 8: "E" },
//           triggerLength: 5,
//         },
//       ),
//   },
//   {
//     words: LEVELS_DATA[19].words,
//     gridSetup: () =>
//       generateLevel(5, 0, 24, { 1: "C", 2: "A", 3: "M", 4: "E", 5: "L" }, [6, 7, 13, 14, 15], {
//         words: ["GECKO"],
//         lettersMap: { 11: "G", 12: "E", 13: "C", 14: "K", 19: "O" },
//         triggerLength: 5,
//       }),
//   },
//   {
//     words: LEVELS_DATA[20].words,
//     gridSetup: () =>
//       generateLevel(5, 0, 24, { 1: "L", 2: "L", 3: "A", 4: "M", 5: "A" }, [6, 7, 17, 18, 21], {
//         words: ["MOUSE"],
//         lettersMap: { 11: "M", 12: "O", 13: "U", 14: "S", 19: "E" },
//         triggerLength: 5,
//       }),
//   },

//   // ==========================================
//   // SET 5: THE MATRIX (Levels 21-30)
//   // ==========================================
//   {
//     words: LEVELS_DATA[21].words,
//     gridSetup: () =>
//       generateLevel(
//         5,
//         0,
//         24,
//         { 1: "P", 2: "A", 3: "N", 4: "D", 9: "A" },
//         [2, 7, 12, 17, 22, 10, 11, 13, 14],
//         {
//           words: ["CHIMP"],
//           lettersMap: { 20: "C", 15: "H", 5: "I", 6: "M", 8: "P" },
//           triggerLength: 5,
//         },
//       ),
//   },
//   {
//     words: LEVELS_DATA[22].words,
//     gridSetup: () =>
//       generateLevel(
//         5,
//         0,
//         24,
//         { 1: "M", 2: "O", 3: "N", 4: "K", 9: "E", 14: "Y" },
//         [10, 11, 13, 14, 6, 7, 8, 16, 17, 18],
//         {
//           words: ["DONKEY"],
//           lettersMap: { 15: "D", 20: "O", 21: "N", 22: "K", 23: "E", 12: "Y" },
//           triggerLength: 6,
//         },
//       ),
//   },
//   {
//     words: LEVELS_DATA[23].words,
//     gridSetup: () =>
//       generateLevel(
//         5,
//         0,
//         24,
//         { 1: "R", 2: "A", 3: "B", 4: "B", 5: "I", 6: "T" },
//         [7, 8, 12, 13, 17, 21, 22],
//         {
//           words: ["KITTEN"],
//           lettersMap: { 11: "K", 12: "I", 13: "T", 14: "T", 18: "E", 19: "N" },
//           triggerLength: 6,
//         },
//       ),
//   },
//   {
//     words: LEVELS_DATA[24].words,
//     gridSetup: () =>
//       generateLevel(
//         5,
//         0,
//         24,
//         { 1: "T", 2: "U", 3: "R", 4: "T", 5: "L", 6: "E" },
//         [7, 8, 10, 14, 15, 16, 22],
//         {
//           words: ["PARROT"],
//           lettersMap: { 11: "P", 12: "A", 13: "R", 14: "R", 18: "O", 19: "T" },
//           triggerLength: 6,
//         },
//       ),
//   },
//   {
//     words: LEVELS_DATA[25].words,
//     gridSetup: () =>
//       generateLevel(
//         5,
//         0,
//         24,
//         { 1: "S", 2: "P", 3: "I", 4: "D", 5: "E", 6: "R" },
//         [7, 8, 9, 13, 15, 16, 20],
//         {
//           words: ["HAMSTER"],
//           lettersMap: { 11: "H", 12: "A", 13: "M", 14: "S", 17: "T", 18: "E", 19: "R" },
//           triggerLength: 6,
//         },
//       ),
//   },
//   {
//     words: LEVELS_DATA[26].words,
//     gridSetup: () =>
//       generateLevel(
//         5,
//         0,
//         24,
//         { 1: "G", 2: "O", 3: "R", 4: "I", 5: "L", 6: "L", 7: "A" },
//         [8, 9, 10, 15, 16, 21],
//         {
//           words: ["LEOPARD"],
//           lettersMap: { 11: "L", 12: "E", 13: "O", 14: "P", 17: "A", 18: "R", 19: "D" },
//           triggerLength: 7,
//         },
//       ),
//   },
//   {
//     words: LEVELS_DATA[27].words,
//     gridSetup: () =>
//       generateLevel(
//         5,
//         0,
//         24,
//         { 1: "B", 2: "U", 3: "F", 4: "F", 5: "A", 6: "L", 7: "O" },
//         [8, 9, 13, 15, 21, 22, 23],
//         {
//           words: ["PEACOCK"],
//           lettersMap: { 11: "P", 12: "E", 13: "A", 14: "C", 17: "O", 18: "C", 19: "K" },
//           triggerLength: 7,
//         },
//       ),
//   },
//   {
//     words: LEVELS_DATA[28].words,
//     gridSetup: () =>
//       generateLevel(
//         5,
//         0,
//         24,
//         { 1: "R", 2: "A", 3: "C", 4: "C", 5: "O", 6: "O", 7: "N" },
//         [8, 9, 12, 15, 16, 21, 23],
//         {
//           words: ["OSTRICH"],
//           lettersMap: { 11: "O", 12: "S", 13: "T", 14: "R", 17: "I", 18: "C", 19: "H" },
//           triggerLength: 7,
//         },
//       ),
//   },
//   {
//     words: LEVELS_DATA[29].words,
//     gridSetup: () =>
//       generateLevel(
//         5,
//         0,
//         24,
//         { 1: "L", 2: "O", 3: "B", 4: "S", 5: "T", 6: "E", 7: "R" },
//         [8, 9, 10, 13, 15, 16, 21, 22],
//         {
//           words: ["DOLPHIN"],
//           lettersMap: { 11: "D", 12: "O", 13: "L", 14: "P", 17: "H", 18: "I", 19: "N" },
//           triggerLength: 7,
//         },
//       ),
//   },
//   {
//     words: LEVELS_DATA[30].words,
//     gridSetup: () =>
//       generateLevel(
//         5,
//         0,
//         24,
//         { 1: "E", 2: "L", 3: "E", 4: "P", 5: "H", 6: "A", 7: "N", 8: "T" },
//         [9, 10, 13, 15, 16, 17, 21, 22],
//         {
//           words: ["EAGLE"],
//           lettersMap: { 11: "E", 12: "A", 13: "G", 14: "L", 19: "E" },
//           triggerLength: 8,
//         },
//       ),
//   },
// ];
