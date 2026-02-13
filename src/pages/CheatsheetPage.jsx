import React from "react";
import { Container, Row } from "react-bootstrap";
import { FlashcardArray } from "react-quizlet-flashcard";
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
    var avatar = ftcMode?`<span class="team-avatar team-${team?.teamNumber}"></span>`:`<img src="${apiBaseUrl}${selectedYear.value}/avatars/team/${team?.teamNumber}/avatar.png" onerror="this.style.display='none'">&nbsp`;
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
    // Use fetch + blob and trigger a native download via hidden <a> element.
    // This works reliably on Firefox iOS and other browsers.
    fetch(filePath)
      .then((res) => {
        if (!res.ok) throw new Error(`Network response was not ok: ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        const fileName = filePath.split('/').pop();
        const url = URL.createObjectURL(blob);
        
        // Create a hidden anchor element and trigger a click to download
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.target = '_blank'; // Ensure PWA home screen mode downloads instead of opening fullscreen
        link.style.display = 'none';
        document.body.appendChild(link);
        
        // Trigger the download
        link.click();
        
        // Clean up
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      })
      .catch((err) => {
        // Fallback: open the original file path in a new tab (server-served PDF)
        console.error('downloadPDF error:', err);
        try {
          window.open(filePath, '_blank');
        } catch (e) {
          // As a last resort set location
          window.location.href = filePath;
        }
      });
  }

  return (
    <Container fluid>
      {ftcMode && (
        <>
          <img
            src="/cheatsheet/decode_cheat_sheet_11282025.png"
            width="100%"
            alt="Cheatsheet"
          ></img>
          <div>
            <h3>
              You can <br />
              <span
                style={{ cursor: "pointer", color: "blue" }}
                onClick={() => {
                  downloadPDF("/cheatsheet/decode_cheat_sheet_11282025.pdf");
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
            src="/cheatsheet/rebuilt-cheat-sheet-01102026.png"
            width="100%"
            alt="Cheatsheet"
          ></img>
          <div>
            <h3>
              You can <br />
              <span
                style={{ cursor: "pointer", color: "blue" }}
                onClick={() => {
                  downloadPDF("/cheatsheet/rebuilt-cheat-sheet-01102026.pdf");
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
