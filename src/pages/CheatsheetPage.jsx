import React, { useState } from "react";
import { Container, Row } from "react-bootstrap";
import { FlashcardArray } from "react-quizlet-flashcard";
import { saveAs } from "file-saver";
import _ from "lodash";
import { apiBaseUrl } from "../contextProviders/AuthClientContext";
import NotificationBanner from "../components/NotificationBanner";

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

  const [popupNotification, setPopupNotification] = useState(null);

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
    // Use fetch + blob. On iOS (including Firefox on iOS) the download
    // attribute and programmatic downloads are unreliable, so fall back
    // to opening the PDF in a new tab using an object URL.
    fetch(filePath)
      .then((res) => {
        if (!res.ok) throw new Error(`Network response was not ok: ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        const ua = navigator.userAgent || '';
        // Firefox on iOS identifies as FxiOS in the UA string
        const isFirefoxOniOS = /FxiOS/i.test(ua);
        // Generic iOS detection (covers Safari and other WebKit-based browsers)
        const isIOS = /iP(hone|od|ad)/.test(navigator.platform) || (ua.includes('Mac') && 'ontouchend' in document);

        if (isFirefoxOniOS || isIOS) {
          // Opening blob URL in a new tab is a more reliable UX on iOS.
          const url = URL.createObjectURL(blob);
          const newWindow = window.open(url, '_blank');
          if (!newWindow) {
            // If popup blocked, navigate current window as a last resort
            window.location.href = url;
            // Show a temporary notification to the user that popup was blocked
            if (setPopupNotification) {
              setPopupNotification({
                message: 'Popup was blocked; opened PDF in this tab.',
                onTime: new Date().toISOString(),
                expiry: new Date(Date.now() + 15000).toISOString(),
                variant: 'warning',
              });
              // Clear the notification after its expiry plus a small buffer
              setTimeout(() => setPopupNotification(null), 16000);
            }
          }
          // Revoke URL after a short delay to free memory
          setTimeout(() => URL.revokeObjectURL(url), 10000);
        } else {
          // For other browsers use file-saver for a proper download
          const fileName = filePath.split('/').pop();
          saveAs(blob, fileName);
        }
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
      <NotificationBanner notification={popupNotification} setSystemBell={null} />
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
