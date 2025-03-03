function pointToLine (linePointA, linePointB, point) {

    const P=point;
    const A=linePointA;
    const B=linePointB; 

    const AB    = [B[0]-A[0], B[1]-A[1], B[2]-A[2]];
    const lenAB = Math.sqrt(AB[0]*AB[0] + AB[1]*AB[1] + AB[2]*AB[2]);

    const D  = [AB[0]/lenAB, AB[1]/lenAB, AB[2]/lenAB];
    const AP = [P[0]-A[0], P[1]-A[1], P[2]-A[2]];

    const d = D[0]*AP[0] + D[1]*AP[1] + D[2]*AP[2];

    const G = [A[0] + d * D[0], A[1] + d * D[1], A[2] + d * D[2]];
    const distance = Math.sqrt((P[0] - G[0]) * (P[0] - G[0]) + (P[1] - G[1]) * (P[1] - G[1]) + (P[2] - G[2]) * (P[2] - G[2]));
    return distance;
}