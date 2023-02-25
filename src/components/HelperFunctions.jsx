export function rankHighlight(rank, allianceCount) {
    var style = { color: "black", backgroundColor: "white" };
    if ((rank <= allianceCount) && (rank > 1)) {
        style.color = "white";
        style.backgroundColor = "green";
    } else if ((rank < (allianceCount + 3)) && (rank > allianceCount)) {
        style.color = "black";
        style.backgroundColor = "yellow";
    } else if (rank === 1) {
        style.color = "white";
        style.backgroundColor = "orange";
    } else {
        style.color = "";
        style.backgroundColor = "";
    }
    return style;
}
