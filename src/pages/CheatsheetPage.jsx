import { Container, Row } from "react-bootstrap";
import { FlashcardArray } from "react-quizlet-flashcard";
import { saveAs } from "file-saver";
import _ from "lodash";
import { apiBaseUrl } from "../contextProviders/AuthClientContext";

function CheatsheetPage({
  teamList,
  communityUpdates,
  selectedEvent,
  selectedYear,
  robotImages,
  eventLabel,
  ftcMode,
}) {
  const sortedTeams = _.orderBy(teamList?.teams, "teamNumber", "asc");
  const cardStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const cards = sortedTeams.map((team, index) => {
    var card = {
      id: 0,
      frontHTML: "",
      backHTML: "",
      style: { width: "500px", height: "300px" },
    };
    var avatar = `<img src="${apiBaseUrl}${selectedYear.value}/avatars/team/${team?.teamNumber}/avatar.png" onerror="this.style.display='none'">&nbsp`;
    var robotImage = _.filter(robotImages, { teamNumber: team?.teamNumber })[0]
      ?.imageUrl
      ? `<img height="225px" src="${
          _.filter(robotImages, { teamNumber: team?.teamNumber })[0]?.imageUrl
        }" onerror="this.style.display='none'">`
      : "";
    if (communityUpdates) {
      team = _.merge(
        team,
        communityUpdates[
          _.findIndex(communityUpdates, { teamNumber: team?.teamNumber })
        ],
        teamList?.teams[
          _.findIndex(teamList?.teams, { teamNumber: team?.teamNumber })
        ]
      );
    }
    card.id = index;
    card.frontHTML = `<h1>${robotImage}<br /><b>${team.teamNumber}</b></h1>`;
    card.frontContentStyle = cardStyle;
    card.backContentStyle = cardStyle;
    card.backHTML = `<h1>${avatar}<br /><b>${
      team?.updates?.nameShortLocal
        ? team?.updates?.nameShortLocal
        : team?.nameShort
    }</b><br />${
      team?.updates?.cityStateLocal
        ? team?.updates?.cityStateLocal
        : team?.city +
          ", " +
          team?.stateProv +
          (team?.country === "USA" ? "" : " " + team?.country)
    }</h1>`;
    return card;
  });

  function downloadPDF(filePath) {
    var oReq = new XMLHttpRequest();

    // Configure XMLHttpRequest
    oReq.open("GET", filePath, true);

    // Important to use the blob response type
    oReq.responseType = "blob";

    // When the file request finishes
    // Is up to you, the configuration for error events etc.
    oReq.onload = function () {
      // Once the file is downloaded, open a new window with the PDF
      // Remember to allow the POP-UPS in your browser
      var file = new Blob([oReq.response], {
        type: "application/pdf",
      });

      // Generate file download directly in the browser !
      var fileName = filePath.split("/").pop();
      saveAs(file, fileName);
    };

    oReq.send();
  }

  return (
    <Container fluid>
      {ftcMode && (
        <>
          <img
            src="/cheatsheet/decode_cheat_sheet_10232025.png"
            width="100%"
            alt="Cheatsheet"
          ></img>
          <div>
            <h3>
              You can <br />
              <span
                style={{ cursor: "pointer", color: "blue" }}
                onClick={() => {
                  downloadPDF("/cheatsheet/decode_cheat_sheet_10232025.pdf");
                }}
              >
                Download the Cheat Sheet
              </span>{" "}
              here.
            </h3>
            <p>
              <br />
            </p>
          </div>
        </>
      )}
      {!ftcMode && (
        <>
          <img
            src="/cheatsheet/reefscape-cheat-sheet-v4_02.png"
            width="100%"
            alt="Cheatsheet"
          ></img>
          <div>
            <h3>
              You can <br />
              <span
                style={{ cursor: "pointer", color: "blue" }}
                onClick={() => {
                  downloadPDF("/cheatsheet/reefscape-cheat-sheet-v4.pdf");
                }}
              >
                Download the Cheat Sheet
              </span>{" "}
              here.
            </h3>
            <p>
              <br />
            </p>
          </div>

          <div>
            <h3>
              Here is a very useful one-sheet show flow for Alliance Selection
              and how skipping works, provided by FIRST.
              <br />
              <span
                style={{ cursor: "pointer", color: "blue" }}
                onClick={() => {
                  downloadPDF(
                    "/cheatsheet/alliance-selection-process-cheat-sheet.pdf"
                  );
                }}
              >
                Download PDF.
              </span>
            </h3>
            <p>
              <br />
            </p>
          </div>
          <div>
            <h3>
              Here is a very useful one-sheet show flow for the playoffs,
              provided by Matt Bisson.
              <br />
              <span
                style={{ cursor: "pointer", color: "blue" }}
                onClick={() => {
                  downloadPDF(
                    "/cheatsheet/2024_Run_of_Show_Playoffs_Awards.pdf"
                  );
                }}
              >
                Download PDF.
              </span>
            </h3>
            <p>
              <br />
            </p>
          </div>
        </>
      )}
      {selectedEvent && teamList && communityUpdates && cards.length > 0 && (
        <Container fluid className={"flashCards"}>
          <Row>
            <h3>
              Here are some helpful flash cards you can use to learn the names
              of the teams at {eventLabel}.
            </h3>
          </Row>
          <Row>
            <FlashcardArray cards={cards} />
          </Row>
          <Row>
            <br />
            <br />
          </Row>
        </Container>
      )}
      <div>
        <br />
      </div>
    </Container>
  );
}

export default CheatsheetPage;
