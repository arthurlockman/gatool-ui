import { Alert, Col, Row, Container, Modal, Button } from "react-bootstrap";
import Bracket from "../components/Bracket";
import FourAllianceBracket from "components/FourAllianceBracket";
import FourAllianceBracketFTC from "components/FourAllianceBracketFTC";
import SixAllianceBracket from "components/SixAllianceBracket";
import TwoAllianceBracket from "components/TwollianceBracket";
import moment from "moment/moment";
import AllianceSelection from "../components/AllianceSelection";
import { useState } from "react";
import Switch from "react-switch";
import { useHotkeysContext, useHotkeys } from "react-hotkeys-hook";
import _ from "lodash";

import './AllianceSelectionPage.css';


function AllianceSelectionPage({ selectedYear, selectedEvent, qualSchedule, playoffSchedule, offlinePlayoffSchedule, alliances, rankings, timeFormat, getRanks, allianceSelection, playoffs, teamList, allianceCount, communityUpdates, allianceSelectionArrays, setAllianceSelectionArrays, rankingsOverride, loadEvent, practiceSchedule, setOfflinePlayoffSchedule, currentMatch, qualsLength, nextMatch, previousMatch, getSchedule, useSwipe, usePullDownToUpdate, eventLabel, playoffCountOverride, ftcMode, remapNumberToString, useFourTeamAlliances }) {
    /**
     * This function finds a team by their station assignment
     * @param teams the array of team objects
     * @param station the station to find (e.g., "Red1", "Red2", "Red3", "Blue1", "Blue2", "Blue3")
     * @returns the team number or null if not found
     */
    const getTeamByStation = (teams, station) => {
        if (!teams || !Array.isArray(teams)) return null;
        const team = teams.find((t) => t?.station?.toLowerCase() === station?.toLowerCase());
        return team?.teamNumber || null;
    };

    const [overrideAllianceSelection, setOverrideAllianceSelection] = useState(false);
    const [resetAllianceSelection, setResetAllianceSelection] = useState(false);
    const [teamFilter, setTeamFilter] = useState("");
    const { disableScope, enableScope } = useHotkeysContext();

    const updateRanks = () => {
        setResetAllianceSelection(true);
        enableScope('resetAllianceSelection');
        disableScope('tabNavigation');
    }

    const handleResetAllianceSelection = () => {
        if (overrideAllianceSelection) {
            handleReset();
        }
        getRanks();
        handleClose();
    }

    const handleReset = () => {
        // @ts-ignore
        document.getElementById("filterControl").value = "";
        setTeamFilter("");
        setAllianceSelectionArrays({});
    }

    const handleClose = () => {
        setResetAllianceSelection(false);
        disableScope("allianceDecline");
        enableScope('tabNavigation');
    }

    var ranksLastUpdateDisplay = "No rankings reporting yet."
    if (rankings?.lastUpdate) {
        ranksLastUpdateDisplay = moment(rankings?.lastUpdate).format("ddd, MMM Do YYYY, " + timeFormat.value)
    }

    const matches = offlinePlayoffSchedule?.schedule || playoffSchedule?.schedule?.schedule || playoffSchedule?.schedule;

    const alliancesCount = alliances?.alliances.length;

    //returns the three members of an alliance based on the match data.
    const allianceNumbers = (matchNumber, allianceColor) => {
        var alliance = "TBD";
        var allianceMembers = [];
        var targetAlliance = {};
        var match = matches[_.findIndex(matches, { "matchNumber": matchNumber })];
        if (match && match?.description?.includes("Bye Match")) {
            alliance = "Bye Match"
        } else if ((getTeamByStation(match?.teams, "Red1") || getTeamByStation(match?.teams, "Blue1")) && alliances?.Lookup) {
            const lookupTeam = getTeamByStation(match?.teams, allianceColor === "red" ? "Red1" : "Blue1");
            targetAlliance = alliances?.Lookup[`${lookupTeam}`];
            allianceMembers = _.compact([targetAlliance?.captain, targetAlliance?.round1, targetAlliance?.round2, targetAlliance?.round3, targetAlliance?.backup]);
            alliance = allianceMembers.join("  ");
        }
        //todo: layer in fourth member for new playoff modes
        return alliance;
    }

    // returns the name of the alliance
    const allianceName = (matchNumber, allianceColor) => {
        const tieLevel = allianceCount === 8 ? 13 : allianceCount === 6 ? 10 : allianceCount === 4 ? 6 : 1;
        var allianceName = "";
        var match = matches[_.findIndex(matches, { "matchNumber": matchNumber })];
        const lookupTeam = match?.teams[_.findIndex(match?.teams, { "station": allianceColor === "red" ? "Red1" : "Blue1" })]?.teamNumber;
        if (lookupTeam && alliances?.Lookup) {
            const targetAlliance = alliances?.Lookup[`${lookupTeam}`];
            allianceName = targetAlliance?.alliance;
            if (matchNumber <= tieLevel || matchNumber === tieLevel + 6) {
                if (matches[_.findIndex(matches, { "matchNumber": matchNumber })]?.winner?.tieWinner === "red") {
                    allianceName += ` (L${matches[_.findIndex(matches, { "matchNumber": matchNumber })]?.winner.level} WIN)`;
                }
            }
        }
        return allianceName || "";
    }

    // return the score of the match, by matchNumber
    function matchScore(matchNumber, alliance) {
        var score = null;
        if (matches[_.findIndex(matches, { "matchNumber": matchNumber })]?.actualStartTime) {
            if (alliance === "red") {
                score = matches[_.findIndex(matches, { "matchNumber": matchNumber })]?.scoreRedFinal;
            } else if (alliance === "blue") {
                score = matches[_.findIndex(matches, { "matchNumber": matchNumber })]?.scoreBlueFinal;
            }

        }
        return score;
    }

    // return the winner of the match, by matchNumber
    function matchWinner(matchNumber) {
        var winner = null;
        if (matches[_.findIndex(matches, { "matchNumber": matchNumber })]?.actualStartTime) {
            winner = matches[_.findIndex(matches, { "matchNumber": matchNumber })]?.winner
        }
        return winner;
    }

    useHotkeys('return', () => document.getElementById("resetAllianceSelection").click(), { scopes: 'resetAllianceSelection' });



    return (
        < >
            {!selectedEvent && <div>
                <Alert variant="warning" ><div>You need to select an event before you can see anything here.</div></Alert>
            </div>}
            {selectedEvent && (!qualSchedule || qualSchedule?.schedule?.length === 0 || qualSchedule?.schedule?.schedule?.length === 0) && (!practiceSchedule || practiceSchedule?.schedule?.length === 0 || practiceSchedule?.schedule?.schedule?.length === 0) && (!playoffSchedule || playoffSchedule?.schedule?.length === 0) &&
                <div>
                    <Alert variant="warning" ><div><img src="loadingIcon.gif" alt="Loading data..." /></div><div>Waiting for Qualification Match Schedule</div></Alert>
                </div>}
            {selectedEvent && (qualSchedule?.schedule?.length > 0 || practiceSchedule?.schedule?.length > 0) && !playoffs &&
                <div>
                    <h5><b>{eventLabel}</b><br />(Rankings last updated: {ranksLastUpdateDisplay})</h5>
                    <p>When the selection begins and the emcee introduces each Alliance Captain, tap the Alliance Captain's number to see their team name, school/organization, and home town.</p>
                    <p><b>IMPORTANT: Tap <i>Alliance Captain Announce</i> or the X in the upper right hand corner to dismiss the dialog and continue announcing the Captains.</b></p>
                    <p>When it's time for Alliance Selection, simply tap a team when their number is called. If they accept, tap <b>Gratefully Accept.</b> If they decline, tap <b>Respectfully Decline.</b></p>
                    <p>If an Alliance Captain misses their time window to select a partner, tap the Captain's number and choose <b>Skip Alliance.</b> Skipped Alliances will have a chance to choose a partner after the next Alliance's choice or after the next Alliance is skipped. If an Alliance misses their time window during their second chance, they will go back to the skipped pool until the end of the round, when they may receive the next highest ranked team from the pool of remaining teams in the selection process.</p>
                    {!allianceSelection &&
                        <Alert variant="danger" ><div onClick={updateRanks}><b>Do not proceed with Alliance Selection until you confirm that the rank order below agrees with the rank order in FMS. Check the Alliance leaders and the teams in the Backup Teams box. Tap this alert to see if we can get a more current schedule and rankings.</b></div>
                            <Container fluid>
                                <Row className="align-items-center">
                                    <Col xs={10}>If you believe that your rankings are correct, and you need to proceed with Alliance Selection even though our confidence is low, you can do so by enabling this option:</Col>
                                    <Col xs={2}><Switch
                                        checked={overrideAllianceSelection}
                                        onChange={setOverrideAllianceSelection}
                                        height={20}
                                        width={40} />
                                    </Col>
                                </Row>
                            </Container>
                        </Alert>}
                    {allianceSelection && !rankingsOverride && !selectedEvent?.value?.code.includes("OFFLINE") &&
                        <Alert variant="success" >
                            <div onClick={loadEvent}><b>We believe your event is ready for Alliance Selection, but you must confirm that the rank order below agrees with the rank order in FMS before proceeding with Alliance Selection. If you see a discrepancy, take these steps:
                                <div>Tap the RESTART ALLIANCE SELECTION button below to reset using current data</div>
                                <div>Tap this alert to see if we can get a more current rankings. <i>This will reload your event and may take a minute or two.</i></div>
                            </b><br />
                                We last had a ranking update at {moment(rankings?.lastModified).format("ddd, MMM Do YYYY, " + timeFormat.value)}
                            </div>
                        </Alert>}
                    {allianceSelection && rankingsOverride &&
                        <Alert variant="danger" >
                            <div><b>You have imported a Rankings Report from your Scorekeeper. Please review the table below to ensure that it matches the report.<br /> <span style={{ fontSize: "20px" }}>If you see TBD in place of the Captains' numbers, or if the teams are out of order, tap Restart Alliance Selection.</span></b>
                            </div>
                            {selectedEvent && rankings?.ranks?.length > 0 && teamList?.teams?.length > 0 && allianceCount && allianceCount?.count <= 0 &&
                                <h4>
                                    Please choose an Alliance Count on the Setup Page to proceed.
                                </h4>

                            }
                        </Alert>}
                </div>}
            {selectedEvent && ((qualSchedule?.schedule?.length > 0 || qualSchedule?.schedule?.schedule?.length > 0 || practiceSchedule?.schedule?.length > 0) && !playoffs && (allianceSelection || overrideAllianceSelection)) &&
                <div>
                    <AllianceSelection selectedYear={selectedYear} selectedEvent={selectedEvent} rankings={rankings} teamList={teamList} allianceCount={allianceCount} communityUpdates={communityUpdates} allianceSelectionArrays={allianceSelectionArrays} setAllianceSelectionArrays={setAllianceSelectionArrays} handleReset={handleReset} teamFilter={teamFilter} setTeamFilter={setTeamFilter} ftcMode={ftcMode} remapNumberToString={remapNumberToString} useFourTeamAlliances={useFourTeamAlliances}/>
                </div>}

            {selectedEvent && (alliancesCount === 8) && playoffs &&
                <Bracket offlinePlayoffSchedule={offlinePlayoffSchedule} setOfflinePlayoffSchedule={setOfflinePlayoffSchedule} currentMatch={currentMatch} qualsLength={qualsLength} nextMatch={nextMatch} previousMatch={previousMatch} getSchedule={getSchedule} usePullDownToUpdate={usePullDownToUpdate} useSwipe={useSwipe} eventLabel={eventLabel} playoffCountOverride={playoffCountOverride} ftcMode={ftcMode} matches={matches} allianceNumbers={allianceNumbers} allianceName={allianceName} matchScore={matchScore} matchWinner={matchWinner} remapNumberToString={remapNumberToString} />}
            {selectedEvent && (alliancesCount === 6) && playoffs &&
                <SixAllianceBracket offlinePlayoffSchedule={offlinePlayoffSchedule} setOfflinePlayoffSchedule={setOfflinePlayoffSchedule} currentMatch={currentMatch} qualsLength={qualsLength} nextMatch={nextMatch} previousMatch={previousMatch} getSchedule={getSchedule} usePullDownToUpdate={usePullDownToUpdate} useSwipe={useSwipe} eventLabel={eventLabel} playoffCountOverride={playoffCountOverride} ftcMode={ftcMode} matches={matches} allianceNumbers={allianceNumbers} allianceName={allianceName} matchScore={matchScore} matchWinner={matchWinner} remapNumberToString={remapNumberToString} />}
            {selectedEvent && (alliancesCount === 4) && playoffs && !ftcMode &&
                <FourAllianceBracket currentMatch={currentMatch} qualsLength={qualsLength} nextMatch={nextMatch} previousMatch={previousMatch} getSchedule={getSchedule} useSwipe={useSwipe} usePullDownToUpdate={usePullDownToUpdate} offlinePlayoffSchedule={offlinePlayoffSchedule} setOfflinePlayoffSchedule={setOfflinePlayoffSchedule} eventLabel={eventLabel} ftcMode={ftcMode} matches={matches} allianceNumbers={allianceNumbers} allianceName={allianceName} matchScore={matchScore} matchWinner={matchWinner} remapNumberToString={remapNumberToString} />}
            {selectedEvent && (alliancesCount === 4) && playoffs && ftcMode &&
                <FourAllianceBracketFTC currentMatch={currentMatch} qualsLength={qualsLength} nextMatch={nextMatch} previousMatch={previousMatch} getSchedule={getSchedule} useSwipe={useSwipe} usePullDownToUpdate={usePullDownToUpdate} offlinePlayoffSchedule={offlinePlayoffSchedule} setOfflinePlayoffSchedule={setOfflinePlayoffSchedule} eventLabel={eventLabel} ftcMode={ftcMode} matches={matches} allianceNumbers={allianceNumbers} allianceName={allianceName} matchScore={matchScore} matchWinner={matchWinner} />}
            {selectedEvent && (alliancesCount === 2) && playoffs &&
                <TwoAllianceBracket nextMatch={nextMatch} previousMatch={previousMatch} getSchedule={getSchedule} useSwipe={useSwipe} usePullDownToUpdate={usePullDownToUpdate} eventLabel={eventLabel} ftcMode={ftcMode} matches={matches} allianceNumbers={allianceNumbers} allianceName={allianceName} matchScore={matchScore} matchWinner={matchWinner} remapNumberToString={remapNumberToString} />}
            <Modal centered={true} show={resetAllianceSelection} onHide={handleClose}>
                <Modal.Header className={"allianceSelectionDecline"} closeVariant={"white"} closeButton>
                    <Modal.Title>
                        Reload Rankings and reset Alliance Selection
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <span>You are about to reload Rankings and reset your Alliance Selection. Are you sure you want to do this?</span>
                </Modal.Body>
                <Modal.Footer>
                    <Button id="resetAllianceSelection" variant="danger" size="sm" onClick={handleResetAllianceSelection}>
                        Yes
                    </Button>
                    <Button id="resetAllianceSelection" size="sm" onClick={handleClose}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        </>

    )
}

export default AllianceSelectionPage;