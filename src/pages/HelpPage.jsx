function HelpPage() {
    return (
        <iframe style={{
            bottom: 0,
            width: "100%", height: "90vh"
        }} src={process.env.PUBLIC_URL + '/help.html'} title="Help" />
    )
}

export default HelpPage;