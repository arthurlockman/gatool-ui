import { Container, Image } from "react-bootstrap";
import LoginButton from "../components/LoginButton";

function AnonymousUserPage() {

    return (
        <div className="vertical-center">
            <Container>
                <Image src="/images/apple-touch-icon-152x152.png" />
                <h1>Welcome to gatool!</h1>
                <p>gatool is a tool to provide <i><b>FIRST®</b></i> Game Announcers with up to date information while announcing events
                    during the <i><b>FIRST</b></i> Robotics season. As a web-based tool, it uses up-to-date information about the event to
                    provide a comprehensive set of useful data to Game Announcers. It is designed to work on desktops,
                    laptops and tablet devices. In a pinch, it can be used on a mobile phone.</p>
                <p>You will need a login to
                    access the tool. All registered GAs and MCs will receive an invitation with a login and password. </p>
                <p><a href="https://youtu.be/-n96KgtgYF0">Watch an overview of gatool on YouTube to learn more!</a></p>
                <LoginButton size="lg" block />
            </Container>
        </div>
    )
}

export default AnonymousUserPage;