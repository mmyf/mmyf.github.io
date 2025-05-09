/**
 * Zhang-Suen Thinning Algorithm for skeletonization
 * @param {number[][]} binaryImage - 2D binary image array
 * @returns {number[][]} - Thinned binary image
 */
function zhangSuenThinning(binaryImage) {
    let change = true;
    const rows = binaryImage.length;
    const cols = binaryImage[0].length;

    while (change) {
        change = false;
        const toRemove = [];

        // Step 1
        for (let i = 1; i < rows - 1; i++) {
            for (let j = 1; j < cols - 1; j++) {
                const p = binaryImage[i][j];
                if (p === 1) {
                    const neighbors = [
                        binaryImage[i - 1][j], binaryImage[i - 1][j + 1],
                        binaryImage[i][j + 1], binaryImage[i + 1][j + 1],
                        binaryImage[i + 1][j], binaryImage[i + 1][j - 1],
                        binaryImage[i][j - 1], binaryImage[i - 1][j - 1]
                    ];
                    const transitions = neighbors.reduce((acc, val, idx, arr) => {
                        return acc + (val === 0 && arr[(idx + 1) % 8] === 1 ? 1 : 0);
                    }, 0);
                    const sum = neighbors.reduce((acc, val) => acc + val, 0);

                    if (
                        transitions === 1 &&
                        sum >= 2 && sum <= 6 &&
                        neighbors[0] * neighbors[2] * neighbors[4] === 0 &&
                        neighbors[2] * neighbors[4] * neighbors[6] === 0
                    ) {
                        toRemove.push([i, j]);
                    }
                }
            }
        }

        toRemove.forEach(([i, j]) => {
            binaryImage[i][j] = 0;
            change = true;
        });

        // Step 2
        toRemove.length = 0;
        for (let i = 1; i < rows - 1; i++) {
            for (let j = 1; j < cols - 1; j++) {
                const p = binaryImage[i][j];
                if (p === 1) {
                    const neighbors = [
                        binaryImage[i - 1][j], binaryImage[i - 1][j + 1],
                        binaryImage[i][j + 1], binaryImage[i + 1][j + 1],
                        binaryImage[i + 1][j], binaryImage[i + 1][j - 1],
                        binaryImage[i][j - 1], binaryImage[i - 1][j - 1]
                    ];
                    const transitions = neighbors.reduce((acc, val, idx, arr) => {
                        return acc + (val === 0 && arr[(idx + 1) % 8] === 1 ? 1 : 0);
                    }, 0);
                    const sum = neighbors.reduce((acc, val) => acc + val, 0);

                    if (
                        transitions === 1 &&
                        sum >= 2 && sum <= 6 &&
                        neighbors[0] * neighbors[2] * neighbors[6] === 0 &&
                        neighbors[0] * neighbors[4] * neighbors[6] === 0
                    ) {
                        toRemove.push([i, j]);
                    }
                }
            }
        }

        toRemove.forEach(([i, j]) => {
            binaryImage[i][j] = 0;
            change = true;
        });
    }

    return binaryImage;
}